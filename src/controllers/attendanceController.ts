import { Request, Response } from "express";
import pool from "../config/db";
import { getPagination } from "../utils/pagination";
import { Attendance } from "../models/Attendance";

export const getAttendances = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = (req.query.search as string) || "";

    let whereClause = "";
    const params: any[] = [];

    if (search) {
      whereClause = `
        WHERE 
          e.employee_name LIKE ? OR
          a.work_date LIKE ? 
      `;
      const keyword = `%${search}%`;
      params.push(keyword, keyword);
    }

    const [rows] = await pool.query<Attendance[]>(
      `
      SELECT
        a.id,
        e.id as employee_id,
        e.name as employee_name,
        s.id as shift_id,
        s.name as shift_name,
        a.work_date,
        a.clock_in,
        a.clock_out,
        a.status,
        e.created_at
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      JOIN shifts s ON a.shift_id = s.id
      ${whereClause}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query<any[]>(
      `
      SELECT COUNT(*) as total
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      JOIN shifts s ON a.shift_id = s.id
      ${whereClause}
      `,
      params
    );

    const total = countRows[0].total;

    res.json({
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendances",
      error,
    });
  }
};

export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // guard
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid attendance id" });
    }

    const [rows] = await pool.query<Attendance[]>(
      `
      SELECT
        a.id,
        e.id as employee_id,
        e.name as employee_name,
        s.id as shift_id,
        s.name as shift_name,
        a.work_date,
        a.clock_in,
        a.clock_out,
        a.status,
        e.created_at
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      JOIN shifts s ON a.shift_id = s.id
      WHERE a.id = ?
      LIMIT 1
      `,
      [id]
    );

    // no data found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance",
      error,
    });
  }
};

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { employee_id, shift_id, work_date, clock_in, clock_out, status } = req.body;

    // validation
    if (!employee_id || !shift_id || !work_date || !clock_in || !clock_out || !status ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO attendances
        (employee_id, shift_id, work_date, clock_in, clock_out, status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [employee_id, shift_id, work_date, clock_in, clock_out, status]
    );

    res.status(201).json({
      message: "Attendance created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error creating attendance",
      error,
    });
  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid attendance id" });
    }

    const { employee_id, shift_id, work_date, clock_in, clock_out, status } = req.body;

    // build dynamic SET clause
    const fields: string[] = [];
    const values: any[] = [];

    if (employee_id) {
      fields.push("employee_id = ?");
      values.push(employee_id);
    }

    if (shift_id) {
      fields.push("shift_id = ?");
      values.push(shift_id);
    }

    if (work_date) {
      fields.push("work_date = ?");
      values.push(work_date);
    }

    if (clock_in) {
      fields.push("clock_in = ?");
      values.push(clock_in);
    }

    if (clock_out) {
      fields.push("clock_out = ?");
      values.push(clock_out);
    }

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const [result]: any = await pool.query(
      `
      UPDATE attendances
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    res.json({
      message: "Attendance updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error updating attendance",
      error,
    });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid attendance id" });
    }

    const [result]: any = await pool.query(
      `
      DELETE FROM attendances
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    res.json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting attendance",
      error,
    });
  }
};