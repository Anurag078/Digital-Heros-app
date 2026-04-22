import express from "express";
import { runDraw, getLastDraw, publishDraw, getAllDraws } from "../controllers/drawController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/run", protect, isAdmin, runDraw);
router.post("/publish", protect, isAdmin, publishDraw);
router.get("/last", getLastDraw);
router.get("/history", protect, getAllDraws);

export default router;