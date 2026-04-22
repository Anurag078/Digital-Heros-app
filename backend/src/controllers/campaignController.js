import db from "../config/db.js";

export const getCampaigns = async (req, res) => {
    const { data, error } = await db.from("campaigns").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json(error);
    res.json(data);
};

export const createCampaign = async (req, res) => {
    const { name, description, image_url, start_date, end_date, status } = req.body;
    const { data, error } = await db.from("campaigns").insert({
        name,
        description,
        image_url,
        start_date,
        end_date,
        status: status || 'draft'
    });
    if (error) return res.status(400).json(error);
    res.json({ message: "Campaign created successfully", data: data[0] });
};

export const updateCampaign = async (req, res) => {
    const { id } = req.params;
    const { name, description, image_url, start_date, end_date, status } = req.body;
    const { error } = await db.from("campaigns").update({
        name,
        description,
        image_url,
        start_date,
        end_date,
        status
    }).eq("id", id);
    if (error) return res.status(400).json(error);
    res.json({ message: "Campaign updated successfully" });
};

export const deleteCampaign = async (req, res) => {
    const { id } = req.params;
    const { error } = await db.from("campaigns").delete().eq("id", id);
    if (error) return res.status(400).json(error);
    res.json({ message: "Campaign deleted successfully" });
};
