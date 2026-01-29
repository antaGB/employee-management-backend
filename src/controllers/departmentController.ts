import { Request, Response } from "express"
import pool from "../config/db"
import { Department } from "../models/Department"
import { getPagination } from "../utils/pagination";

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = (req.query.search as string) || "";

    let whereClause = "";
    const params: any[] = [];

    if (search) {
      whereClause = `
        WHERE 
          d.code LIKE ? OR
          d.name LIKE ? 
      `;
      const keyword = `%${search}%`;
      params.push(keyword, keyword);
    }

    const [rows] = await pool.query<Department[]>(
      `
      SELECT
        d.id,
        d.code,
        d.name,
        d.created_at
      FROM departments d
      ${whereClause}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query<any[]>(
      `
      SELECT COUNT(*) as total
      FROM departments d
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
      message: "Error fetching departments",
      error,
    });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // guard
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid department id" });
    }

    const [rows] = await pool.query<Department[]>(
      `
      SELECT
        d.id,
        d.code,
        d.name,
        d.created_at
      FROM departments d
      WHERE e.id = ?
      LIMIT 1
      `,
      [id]
    );

    // no data found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching department",
      error,
    });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { code, name } = req.body;

    // validation
    if (!code || !name) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO departments
        (code, name)
      VALUES (?, ?)
      `,
      [code, name]
    );

    res.status(201).json({
      message: "Department created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error creating department",
      error,
    });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid department id" });
    }

    const { code, name } = req.body;

    // build dynamic SET clause
    const fields: string[] = [];
    const values: any[] = [];

    if (code) {
      fields.push("code = ?");
      values.push(code);
    }

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const [result]: any = await pool.query(
      `
      UPDATE departments
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json({
      message: "Department updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error updating department",
      error,
    });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid department id" });
    }

    const [result]: any = await pool.query(
      `
      DELETE FROM departments
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Department",
      error,
    });
  }
};