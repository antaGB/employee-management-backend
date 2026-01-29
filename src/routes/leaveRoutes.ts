import { Router } from "express";
import { createLeave, getLeaveById, getLeaves, updateLeave, deleteLeave } from "../controllers/leaveController";

const router = Router();

router.get("/", getLeaves);
router.get("/:id", getLeaveById);
router.post("/", createLeave);
router.patch("/:id", updateLeave);
router.delete("/:id", deleteLeave);

export default router;