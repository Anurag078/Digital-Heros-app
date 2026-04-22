import express from "express";
import { getMyWinnings, claimWinning, getAllWinnings, verifyWinning } from "../controllers/winningsController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyWinnings);
router.post("/claim", protect, claimWinning);

// Admin routes
router.get("/all", protect, isAdmin, getAllWinnings);
router.post("/verify", protect, isAdmin, verifyWinning);

export default router;
