import express from "express";
import { 
    getUsers, 
    updateUser, 
    getSystemAnalytics, 
    getUserScores, 
    updateScore, 
    deleteScore 
} from "../controllers/adminController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", protect, isAdmin, getUsers);
router.put("/users/:userId", protect, isAdmin, updateUser);

// Analytics
router.get("/analytics", protect, isAdmin, getSystemAnalytics);

// Score Governance
router.get("/users/:userId/scores", protect, isAdmin, getUserScores);
router.put("/scores/:scoreId", protect, isAdmin, updateScore);
router.delete("/scores/:scoreId", protect, isAdmin, deleteScore);

export default router;
