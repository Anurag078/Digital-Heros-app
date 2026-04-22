import express from "express";
import { addScore, getScores } from "../controllers/scoreController.js";
import { protect, isSubscriber } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isSubscriber, addScore);
router.get("/", protect, getScores);

export default router;