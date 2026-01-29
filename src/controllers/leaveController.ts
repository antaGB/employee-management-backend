import { Request, Response } from "express";
import pool from "../config/db";
import { Employee } from "../models/Employee";
import { getPagination } from "../utils/pagination";
import { Leave } from "../models/Leave";

export const getLeaves = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = (req.query.search as string) || "";

    let whereClause = "";
    const params: any[] = [];

    if (search) {
      whereClause = `
        WHERE 
          e.employee_name LIKE ? OR
          l.start_date LIKE ? 
      `;
      const keyword = `%${search}%`;
      params.push(keyword, keyword);
    }

    const [rows] = await pool.query<Leave[]>(
      `
      SELECT
        l.id,
        e.id AS employee_id,
        e.name AS employee_name,
        l.start_date,
        l.end_date,
        l.type,
        l.status,
        l.reason,
        l.created_at,
        l.updated_at
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      ${whereClause}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query<any[]>(
      `
      SELECT COUNT(*) as total
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
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
      message: "Error fetching leaves",
      error,
    });
  }
};

export const getLeaveById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // guard
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid leave id" });
    }

    const [rows] = await pool.query<Leave[]>(
      `
      SELECT
        l.id,
        e.id AS employee_id,
        e.name AS employee_name,
        l.start_date,
        l.end_date,
        l.type,
        l.status,
        l.reason,
        l.created_at,
        l.updated_at
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE e.id = ?
      LIMIT 1
      `,
      [id]
    );

    // no data found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching leave",
      error,
    });
  }
};

export const createLeave = async (req: Request, res: Response) => {
  try {
    const { employee_id, start_date, end_date, type, status, reason } = req.body;

    // validation
    if (!employee_id || !start_date || !end_date || !type || !status || !reason) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO leaves
        (employee_id, start_date, end_date, type, status, reason)
      VALUES (?, ?, ?, ?, ?)
      `,
      [employee_id, start_date, end_date, type, status, reason]
    );

    res.status(201).json({
      message: "Leave created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error creating leave",
      error,
    });
  }
};

export const updateLeave = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid leave id" });
    }

    const { employee_id, start_date, end_date, type, status, reason } = req.body;

    // build dynamic SET clause
    const fields: string[] = [];
    const values: any[] = [];

    if (employee_id) {
      fields.push("employee_id = ?");
      values.push(employee_id);
    }

    if (start_date) {
      fields.push("start_date = ?");
      values.push(start_date);
    }

    if (end_date) {
      fields.push("end_date = ?");
      values.push(end_date);
    }

    if (type) {
      fields.push("type = ?");
      values.push(type);
    }

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }

    if (reason) {
      fields.push("reason = ?");
      values.push(reason);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const [result]: any = await pool.query(
      `
      UPDATE leaves
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }

    res.json({
      message: "Leave updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error updating leave",
      error,
    });
  }
};

export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid leave id" });
    }

    const [result]: any = await pool.query(
      `
      DELETE FROM leaves
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }

    res.json({
      message: "Leave deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting leave",
      error,
    });
  }
};