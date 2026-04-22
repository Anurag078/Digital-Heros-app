import express from "express";
import { 
    getCampaigns, 
    createCampaign, 
    updateCampaign, 
    deleteCampaign 
} from "../controllers/campaignController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCampaigns);
router.post("/", protect, isAdmin, createCampaign);
router.put("/:id", protect, isAdmin, updateCampaign);
router.delete("/:id", protect, isAdmin, deleteCampaign);

export default router;
