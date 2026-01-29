import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { User } from "../models/User.js";

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const hash = await bcrypt.hash(password, 10);

        const [result]: any = await pool.query(
            "INSERT INTO users(name, email, password) VALUES(?,?,?)",
            [username, email, hash]
        );


        res.status(201).json({
            message: "User registered successfully",
            id: result.insertId,
        });
    } catch (error) {
    res.status(500).json({
      message: "Error registering users",
      error,
    });
  }
}

export const login = async (req: Request, res: Response) => {
    try {

    const { email, password } = req.body;

    const [rows] = await pool.query<User[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES as any }
    );

    res.json({
        token,
        user: {
        id: user.id,
        username: user.username,
        role: user.role,
        },
    });

    } catch(error) {
        res.status(500).json({
            message: "Error logging in",
            error,
        });
    }
};