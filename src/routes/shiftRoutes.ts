import { Router } from "express";
import { createShift, getShiftById, getShifts, updateShift, deleteShift } from "../controllers/shiftController";

const router = Router();

router.get("/", getShifts);
router.get("/:id", getShiftById);
router.post("/", createShift);
router.patch("/:id", updateShift);
router.delete("/:id", deleteShift);

export default router;