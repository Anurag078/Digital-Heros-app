import db from "../config/db.js";
import { notifyWinnerVerification } from "../services/emailService.js";

// GET USER WINNINGS
export const getMyWinnings = async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await db.from("winnings")
        .select(`*, draws (numbers)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) return res.status(500).json(error);
    res.json(data);
};

// CLAIM WINNING (UPLOAD PROOF)
export const claimWinning = async (req, res) => {
    const userId = req.user.id;
    const { winningId, proofImage } = req.body;

    const { error } = await db.from("winnings")
        .update({ proof_image: proofImage, status: 'pending' })
        .eq("id", winningId)
        .eq("user_id", userId);

    if (error) return res.status(500).json(error);
    res.json({ message: "Claim submitted for review" });
};

// ADMIN: GET ALL WINNINGS
export const getAllWinnings = async (req, res) => {
    const { data, error } = await db.from("winnings")
        .select(`*, users (name, email), draws (numbers)`)
        .order("created_at", { ascending: false });

    if (error) return res.status(500).json(error);
    res.json(data);
};

// ADMIN: VERIFY WINNING
export const verifyWinning = async (req, res) => {
    const { winningId, status, notes, proofImage } = req.body; // status: 'paid' or 'rejected'

    const updateData = { status, notes };
    if (proofImage) updateData.proof_image = proofImage;

    const { error } = await db.from("winnings")
        .update(updateData)
        .eq("id", winningId);

    if (error) return res.status(500).json(error);
    
    // Notify the winner (assuming a join fetch or subsequent fetch)
    const { data: winning } = await db.from("winnings")
        .select(`amount, users (email)`)
        .eq("id", winningId)
        .single();
    
    if (winning && winning.users) {
        notifyWinnerVerification(winning.users.email, winning.amount, status);
    }

    res.json({ message: `Winning marked as ${status}` });
};
