import { Router } from "express";
import { createAttendance, getAttendanceById, getAttendances, updateAttendance, deleteAttendance } from "../controllers/attendanceController";

const router = Router();

router.get("/", getAttendances);
router.get("/:id", getAttendanceById);
router.post("/", createAttendance);
router.patch("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

export default router;