import { Request, Response } from "express";
import pool from "../config/db";
import { Employee } from "../models/Employee";
import { getPagination } from "../utils/pagination";
import { Holiday } from "../models/Holiday";

export const getHolidays = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = (req.query.search as string) || "";

    let whereClause = "";
    const params: any[] = [];

    if (search) {
      whereClause = `
        WHERE 
          h.name LIKE ?
      `;
      const keyword = `%${search}%`;
      params.push(keyword);
    }

    const [rows] = await pool.query<Holiday[]>(
      `
      SELECT
        h.id,
        h.name,
        h.holiday_date,
        h.is_national
      FROM holidays h
      ${whereClause}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query<any[]>(
      `
      SELECT COUNT(*) as total
      FROM holidays h
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
      message: "Error fetching holidays",
      error,
    });
  }
};

export const getHolidayById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // guard
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid holiday id" });
    }

    const [rows] = await pool.query<Holiday[]>(
      `
      SELECT
        h.id,
        h.name,
        h.holiday_date,
        h.is_national
      FROM holidays h
      WHERE h.id = ?
      LIMIT 1
      `,
      [id]
    );

    // no data found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching holiday",
      error,
    });
  }
};

export const createHoliday = async (req: Request, res: Response) => {
  try {
    const { name, holiday_date, is_national } = req.body;

    // validation
    if (!name || !holiday_date || !is_national) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO employees
        (name, holiday_date, is_national)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, holiday_date, is_national]
    );

    res.status(201).json({
      message: "Holiday created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error creating holiday",
      error,
    });
  }
};

export const updateHoliday = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid holiday id" });
    }

    const { name, holiday_date, is_national } = req.body;

    // build dynamic SET clause
    const fields: string[] = [];
    const values: any[] = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }

    if (holiday_date) {
      fields.push("holiday_date = ?");
      values.push(holiday_date);
    }

    if (is_national) {
      fields.push("is_national = ?");
      values.push(is_national);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const [result]: any = await pool.query(
      `
      UPDATE holidays
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    res.json({
      message: "Holiday updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error updating holiday",
      error,
    });
  }
};

export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid holiday id" });
    }

    const [result]: any = await pool.query(
      `
      DELETE FROM holidays
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    res.json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting holiday",
      error,
    });
  }
};