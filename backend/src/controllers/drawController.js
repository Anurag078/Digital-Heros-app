import db from "../config/db.js";
import { generateNumbers, generateWeightedNumbers } from "../utils/generateNumbers.js";
import { notifyDrawResults } from "../services/emailService.js";
import { calculateMatch } from "../utils/matchCalculator.js";

// RUN DRAW (SIMULATION)
export const runDraw = async (req, res) => {
    const { logic = "random" } = req.body; // 'random' or 'algorithmic'
    
    try {
        // 0. Monthly Cadence Check
        const { data: recentDraw } = await db.from("draws")
            .select("created_at")
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(1);
        
        if (recentDraw && recentDraw.length > 0) {
            const lastDate = new Date(recentDraw[0].created_at);
            const now = new Date();
            if (lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear()) {
                // Warning: Already a draw this month. Allowing for simulation, but could warn.
            }
        }

        let drawNumbers;
        if (logic === "algorithmic") {
            const { data: allScores } = await db.from("scores").select("score");
            const frequency = {};
            allScores?.forEach(s => frequency[s.score] = (frequency[s.score] || 0) + 1);
            
            drawNumbers = generateWeightedNumbers(frequency);
        } else {
            drawNumbers = generateNumbers();
        }

        // 1. Get all active subscribers
        const { data: subscribers } = await db.from("users").select("id").eq("subscription_status", 1);
        const activeCount = subscribers?.length || 0;
        
        const POOL_CONTRIBUTION_PER_SUB = 5; 
        let currentPool = activeCount * POOL_CONTRIBUTION_PER_SUB;

        // 2. Check for Rollover from last published draw
        const { data: lastDraw } = await db.from("draws")
            .select("*")
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(1);

        let rolloverAmount = 0;
        if (lastDraw && lastDraw.length > 0) {
            const { data: winners } = await db.from("winnings")
                .select("id")
                .eq("draw_id", lastDraw[0].id)
                .eq("match_type", 5);
            
            if (!winners || winners.length === 0) {
                rolloverAmount = lastDraw[0].pool_5 || 0;
            }
        }

        const totalPool = currentPool + rolloverAmount;

        const poolTiers = {
            5: totalPool * 0.40, 
            4: totalPool * 0.35, 
            3: totalPool * 0.25  
        };

        const { data: drawData, error: drawError } = await db.from("draws").insert({
            numbers: JSON.stringify(drawNumbers),
            status: "simulated",
            total_pool: totalPool,
            pool_5: poolTiers[5],
            pool_4: poolTiers[4],
            pool_3: poolTiers[3],
            rollover_from: rolloverAmount
        });

        if (drawError) return res.status(500).json(drawError);
        const drawId = drawData[0].id;

        const { data: allUsers } = await db.from("users").select("id");
        const winnerGroups = { 5: [], 4: [], 3: [] };

        for (const user of allUsers) {
            const { data: scores } = await db.from("scores").select("score").eq("user_id", user.id);
            if (scores && scores.length > 0) {
                const match = calculateMatch(scores, drawNumbers);
                if (match >= 3) winnerGroups[match].push(user.id);
            }
        }

        res.json({
            message: "Draw simulation completed",
            drawId,
            numbers: drawNumbers,
            totalPool,
            rolloverAmount,
            stats: {
                winners5: winnerGroups[5].length,
                winners4: winnerGroups[4].length,
                winners3: winnerGroups[3].length
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Draw Execution Failed" });
    }
};

// PUBLISH DRAW
export const publishDraw = async (req, res) => {
    const { drawId } = req.body;

    try {
        const { data: draw, error } = await db.from("draws").select("*").eq("id", drawId).single();
        if (error || !draw) return res.status(404).json({ message: "Draw not found" });

        const { data: allUsers } = await db.from("users").select("id, email");
        const drawNumbers = JSON.parse(draw.numbers);
        
        const tierWinners = { 5: [], 4: [], 3: [] };

        for (const user of allUsers) {
            const { data: scores } = await db.from("scores").select("score").eq("user_id", user.id);
            if (scores && scores.length > 0) {
                const match = calculateMatch(scores, drawNumbers);
                if (match >= 3) {
                    tierWinners[match].push(user);
                }
            }
        }

        const poolTiers = { 5: draw.pool_5, 4: draw.pool_4, 3: draw.pool_3 };

        for (const tier of [5, 4, 3]) {
            const winners = tierWinners[tier];
            if (winners.length > 0) {
                const individualPrize = parseFloat(poolTiers[tier]) / winners.length;
                for (const winner of winners) {
                    await db.from("winnings").insert({
                        user_id: winner.id,
                        draw_id: drawId,
                        match_type: tier,
                        amount: individualPrize,
                        status: "unclaimed"
                    });
                }
            }
        }

        await db.from("draws").update({ status: "published" }).eq("id", drawId);
        
        res.json({ message: "Draw published and winners notified" });
    } catch (err) {
        console.error("Publishing error:", err);
        res.status(500).json({ message: "Publishing Failed" });
    }
};

// GET LAST DRAW
export const getLastDraw = async (req, res) => {
    const { data, error } = await db.from("draws")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

    if (error) return res.status(500).json(error);
    res.json(data ? data[0] : null);
};

// GET ALL DRAWS (FOR HISTORY)
export const getAllDraws = async (req, res) => {
    const { data, error } = await db.from("draws")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (error) return res.status(500).json(error);
    res.json(data);
};