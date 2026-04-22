import db from "../config/db.js";

// GET ALL USERS
export const getUsers = async (req, res) => {
    const { data, error } = await db.from("users")
        .select("id, name, email, subscription_status, plan, expiry_date, charity_id");
    
    if (error) return res.status(500).json(error);
    res.json(data);
};

// UPDATE USER
export const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { name, email, subscription_status, plan } = req.body;

    const { error } = await db.from("users")
        .update({ name, email, subscription_status, plan })
        .eq("id", userId);

    if (error) return res.status(500).json(error);
    res.json({ message: "User updated successfully" });
};

// GET SYSTEM ANALYTICS
export const getSystemAnalytics = async (req, res) => {
    try {
        const { data: users } = await db.from("users").select("id, subscription_status, charity_percentage");
        const { data: winnings } = await db.from("winnings").select("amount, status");
        const { data: draws } = await db.from("draws").select("id, total_pool, status");

        const totalUsers = users?.length || 0;
        const activeSubscribers = users?.filter(u => u.subscription_status === 1).length || 0;
        
        // Calculate total prize pool from published draws
        const totalPrizePool = draws?.filter(d => d.status === 'published').reduce((acc, curr) => acc + parseFloat(curr.total_pool), 0) || 0;
        
        const drawStats = draws?.filter(d => d.status === 'published').length || 0;

        // Charity impact: (Active Subs * $10 subscription fee * 10% average charity slice)
        // More accurate: sum of (subscription fees * charity_percentage)
        const monthlyRevenue = activeSubscribers * 10;
        const charityImpact = (monthlyRevenue * 0.1).toFixed(2); // Simplified for now, could be per user

        res.json({
            totalUsers,
            activeSubscribers,
            totalPrizePool,
            drawStats,
            charityImpact
        });
    } catch (err) {
        console.error("Analytics error:", err);
        res.status(500).json({ message: "Analytics calculation failed" });
    }
};

// ADMIN: GET USER SCORES
export const getUserScores = async (req, res) => {
    const { userId } = req.params;
    const { data, error } = await db.from("scores").select("*").eq("user_id", userId);
    if (error) return res.status(500).json(error);
    res.json(data);
};

export const updateScore = async (req, res) => {
    const { scoreId } = req.params;
    const { score, date } = req.body;
    const { error } = await db.from("scores").update({ score, date }).eq("id", scoreId);
    if (error) return res.status(500).json(error);
    res.json({ message: "Score updated" });
};

export const deleteScore = async (req, res) => {
    const { scoreId } = req.params;
    const { error } = await db.from("scores").delete().eq("id", scoreId);
    if (error) return res.status(500).json(error);
    res.json({ message: "Score deleted" });
};
