import { Request, Response } from "express";
import pool from "../config/db";
import { Employee } from "../models/Employee";
import { getPagination } from "../utils/pagination";

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = (req.query.search as string) || "";

    let whereClause = "";
    const params: any[] = [];

    if (search) {
      whereClause = `
        WHERE 
          e.name LIKE ? OR
          e.email LIKE ? 
      `;
      const keyword = `%${search}%`;
      params.push(keyword, keyword);
    }

    const [rows] = await pool.query<Employee[]>(
      `
      SELECT
        e.id,
        e.name,
        e.email,
        e.title,
        e.status,
        d.id AS department_id,
        d.name AS department_name,
        d.code AS department_code,
        e.created_at
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      ${whereClause}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query<any[]>(
      `
      SELECT COUNT(*) as total
      FROM employees e
      JOIN departments d ON e.department_id = d.id
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
      message: "Error fetching employees",
      error,
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // guard
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const [rows] = await pool.query<Employee[]>(
      `
      SELECT
        e.id,
        e.name,
        e.email,
        e.title,
        e.status,
        d.id AS department_id,
        d.name AS department_name,
        d.code AS department_code,
        e.created_at
      FROM employees e
      JOIN departments d ON e.department_id = d.id
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
      message: "Error fetching employee",
      error,
    });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, title, status, department_id } = req.body;

    // validation
    if (!name || !email || !title || !status || !department_id) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO employees
        (name, email, title, status, department_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, email, title, status, department_id]
    );

    res.status(201).json({
      message: "Employee created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    // handle duplicate email
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Error creating employee",
      error,
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const { name, email, title, status, department_id } = req.body;

    // build dynamic SET clause
    const fields: string[] = [];
    const values: any[] = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }

    if (email) {
      fields.push("email = ?");
      values.push(email);
    }

    if (title) {
      fields.push("title = ?");
      values.push(title);
    }

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }

    if (department_id) {
      fields.push("department_id = ?");
      values.push(department_id);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const [result]: any = await pool.query(
      `
      UPDATE employees
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee updated successfully",
    });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Error updating employee",
      error,
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const [result]: any = await pool.query(
      `
      DELETE FROM employees
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting employee",
      error,
    });
  }
};