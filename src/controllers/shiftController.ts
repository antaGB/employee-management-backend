import { Request, Response } from "express";
import pool from "../config/db";
import { getPagination } from "../utils/pagination";
import { Shift } from "../models/Shift";

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = (req.query.search as string) || "";

    let whereClause = "";
    const params: any[] = [];

    if (search) {
      whereClause = `
        WHERE 
          e.name LIKE ? 
      `;
      const keyword = `%${search}%`;
      params.push(keyword);
    }

    const [rows] = await pool.query<Shift[]>(
      `
      SELECT
        s.id,
        s.name,
        s.start_time,
        s.end_time,
        s.total_minutes,
        s.is_overnight,
        s.created_at
      FROM shifts s
      ${whereClause}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query<any[]>(
      `
      SELECT COUNT(*) as total
      FROM shifts s
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
      message: "Error fetching shifts",
      error,
    });
  }
};

export const getShiftById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // guard
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid shift id" });
    }

    const [rows] = await pool.query<Shift[]>(
      `
      SELECT
        s.id,
        s.name,
        s.start_time,
        s.end_time,
        s.total_minutes,
        s.is_overnight,
        s.created_at
      FROM shifts s
      WHERE e.id = ?
      LIMIT 1
      `,
      [id]
    );

    // no data found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Shift not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching shift",
      error,
    });
  }
};

export const createShift = async (req: Request, res: Response) => {
  try {
    const { name, start_time, end_time, total_minutes, is_overnight } = req.body;

    // validation
    if (!name || !start_time || !end_time || !total_minutes || !is_overnight) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO shifts
        (name, start_time, end_time, total_minutes, is_overnight)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, start_time, end_time, total_minutes, is_overnight]
    );

    res.status(201).json({
      message: "Shift created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error creating shift",
      error,
    });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid shift id" });
    }

    const { name, start_time, end_time, total_minutes, is_overnight } = req.body;

    // build dynamic SET clause
    const fields: string[] = [];
    const values: any[] = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }

    if (start_time) {
      fields.push("start_time = ?");
      values.push(start_time);
    }

    if (end_time) {
      fields.push("end_time = ?");
      values.push(end_time);
    }

    if (total_minutes) {
      fields.push("total_minutes = ?");
      values.push(total_minutes);
    }

    if (is_overnight) {
      fields.push("is_overnight = ?");
      values.push(is_overnight);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const [result]: any = await pool.query(
      `
      UPDATE shifts
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    res.json({
      message: "Shift updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error updating shift",
      error,
    });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid shift id" });
    }

    const [result]: any = await pool.query(
      `
      DELETE FROM shifts
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    res.json({
      message: "Shift deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting shift",
      error,
    });
  }
};