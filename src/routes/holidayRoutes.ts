import { Router } from "express";
import { createHoliday, getHolidayById, getHolidays, updateHoliday, deleteHoliday } from "../controllers/holidayController";

const router = Router();

router.get("/", getHolidays);
router.get("/:id", getHolidayById);
router.post("/", createHoliday);
router.patch("/:id", updateHoliday);
router.delete("/:id", deleteHoliday);

export default router;