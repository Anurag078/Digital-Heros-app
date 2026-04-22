import db from "../config/db.js";

// GET ALL CHARITIES
export const getCharities = async (req, res) => {
    try {
        const { data, error } = await db.from("charities").select("*");
        if (error) return res.status(500).json(error);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Fetch failed" });
    }
};

// SELECT CHARITY (USER)
export const selectCharity = async (req, res) => {
    const userId = req.user.id;
    const { charity_id } = req.body;

    try {
        const { error } = await db.from("users").update({ charity_id }).eq("id", userId);
        if (error) return res.status(500).json(error);
        res.json({ message: "Charity selected" });
    } catch (err) {
        res.status(500).json({ message: "Selection failed" });
    }
};

// CREATE CHARITY
export const createCharity = async (req, res) => {
    const { name, description, image_url, events, country } = req.body;
    try {
        const { error } = await db.from("charities").insert({ name, description, image_url, events, country: country || "India" });
        if (error) return res.status(500).json(error);
        res.json({ message: "Charity created" });
    } catch (err) {
        res.status(500).json({ message: "Creation failed" });
    }
};

// UPDATE CHARITY
export const updateCharity = async (req, res) => {
    const { id } = req.params;
    const { name, description, image_url, events, country } = req.body;
    try {
        const { error } = await db.from("charities").update({ name, description, image_url, events, country }).eq("id", id);
        if (error) return res.status(500).json(error);
        res.json({ message: "Charity updated" });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

// DELETE CHARITY
export const deleteCharity = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await db.from("charities").delete().eq("id", id);
        if (error) return res.status(500).json(error);
        res.json({ message: "Charity deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};

// SET RECIPIENT
export const setRecipient = async (req, res) => {
    const { id } = req.params;

    try {
        // Reset all to 0
        await db.from("charities").update({ is_recipient: 0 }).neq("id", 0);

        // Set the new one to 1
        const { error } = await db.from("charities").update({ is_recipient: 1 }).eq("id", id);

        if (error) return res.status(500).json(error);
        res.json({ message: "Recipient updated" });
    } catch (err) {
        console.error("Set recipient error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
