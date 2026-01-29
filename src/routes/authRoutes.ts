import { Request, Response, Router } from "express";
import { login, register } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";


const router = Router()

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authMiddleware, (req: Request, res: Response) => {
  res.json((req as any).user);
});

router.get("/admin", authMiddleware, authorize("admin"), (req: Request, res: Response) => {
  res.json({ message: "Admin route" });
});

export default router;