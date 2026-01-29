import { Router } from "express";
import { createEmployee, getEmployeeById, getEmployees, updateEmployee, deleteEmployee } from "../controllers/employeeController";

const router = Router();

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/", createEmployee);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;