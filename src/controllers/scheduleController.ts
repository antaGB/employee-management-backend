import { Request, Response } from "express";
import pool from "../config/db";
import { Employee } from "../models/Employee";
import { getPagination } from "../utils/pagination";
import { Schedule } from "../models/Schedule";

export const getSchedulesView = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const search = (req.query.search as string) || "";
    const startDate = req.query.start as string;
    const endDate = req.query.end as string;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "start and end date are required" });
    }

    // 1. build search condition
    let whereClause = "WHERE status = 'active'";
    const params: any[] = [];

    if (search) {
      whereClause += " AND (name LIKE ? OR email LIKE ?)";
      const keyword = `%${search}%`;
      params.push(keyword, keyword);
    }

    // 2. total count (for pagination)
    const [[countRow]] = await pool.query<any[]>(
      `SELECT COUNT(*) AS total FROM employees ${whereClause}`,
      params
    );

    const total = countRow.total;

    // 3. paginated employees
    const [employees] = await pool.query<Employee[]>(
      `
      SELECT id, name
      FROM employees
      ${whereClause}
      ORDER BY name
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    if (employees.length === 0) {
      return res.json({
        data: [],
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // 4. schedules for those employees
    const employeeIds = employees.map(e => e.id);
    const placeholders = employeeIds.map(() => "?").join(",");

    const [schedules] = await pool.query<any[]>(
      `
      SELECT
        s.employee_id,
        s.work_date,
        sh.name AS shift_name
      FROM schedules s
      LEFT JOIN shifts sh ON sh.id = s.shift_id
      WHERE s.employee_id IN (${placeholders})
        AND s.work_date BETWEEN ? AND ?
      ORDER BY s.employee_id, s.work_date
      `,
      [...employeeIds, startDate, endDate]
    );

    // 5. merge employees + schedules
    const data = employees.map(emp => ({
      employee_id: emp.id,
      name: emp.name,
      schedules: schedules.filter(s => s.employee_id === emp.id),
    }));

    // 6. response
    res.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching employees",
      error,
    });
  }
};

export const getScheduleByEmployeeId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // guard
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const [rows] = await pool.query<Schedule[]>(
      `
      SELECT
        e.id,
        e.name AS employee_name,
        sh.name AS shift_name,
        sh.start_time ,
        sh.end_time,
        s.work_date,
        s.status,
        s.notes,
        s.created_at,
        s.updated_at
      FROM schedules s
      JOIN employee e ON s.employee_id = e.id
      JOIN shfits sh ON s.shift_id = s.id
      WHERE e.id = ?
      LIMIT 1
      `,
      [id]
    );

    // no data found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching schedules",
      error,
    });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { employee_id, shift_id, work_date, status, notes } = req.body;

    // validation
    if (!employee_id || !shift_id || !work_date) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO employees
        (employee_id, shift_id, work_date, status, notes)
      VALUES (?, ?, ?, ?, ?)
      `,
      [employee_id, shift_id, work_date, status, notes]
    );

    res.status(201).json({
      message: "Schedule created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error creating schedules",
      error,
    });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const { shift_id, work_date, status, notes } = req.body;

    // build dynamic SET clause
    const fields: string[] = [];
    const values: any[] = [];

    if (shift_id) {
      fields.push("shift_id = ?");
      values.push(shift_id);
    }

    if (work_date) {
      fields.push("work_date = ?");
      values.push(work_date);
    }

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }

    if (notes) {
      fields.push("notes = ?");
      values.push(notes);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const [result]: any = await pool.query(
      `
      UPDATE schedules
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.json({
      message: "Schedule updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error updating schedule",
      error,
    });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const [result]: any = await pool.query(
      `
      DELETE FROM schedules
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.json({
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting schedule",
      error,
    });
  }
};