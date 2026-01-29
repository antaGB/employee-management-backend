import { Router } from "express";
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "../controllers/departmentController";

const router = Router();

router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.post("/", createDepartment);
router.patch("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;