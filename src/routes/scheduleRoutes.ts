import { Router } from "express";
import { createSchedule, updateSchedule, deleteSchedule, getScheduleByEmployeeId, getSchedulesView } from "../controllers/scheduleController";

const router = Router();

router.get("/", getSchedulesView);
router.get("/:id", getScheduleByEmployeeId);
router.post("/", createSchedule);
router.patch("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

export default router;