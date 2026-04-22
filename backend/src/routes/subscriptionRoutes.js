import express from "express";
import { subscribe, cancelSubscription } from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, subscribe);
router.post("/cancel", protect, cancelSubscription);

export default router;