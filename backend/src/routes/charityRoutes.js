import express from "express";
import {
    getCharities,
    selectCharity,
    createCharity,
    updateCharity,
    deleteCharity,
    setRecipient
} from "../controllers/charityController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCharities);
router.post("/select", protect, selectCharity);

// Admin Only
router.post("/", protect, isAdmin, createCharity);
router.put("/:id", protect, isAdmin, updateCharity);
router.delete("/:id", protect, isAdmin, deleteCharity);
router.post("/:id/recipient", protect, isAdmin, setRecipient);

export default router;