import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization) {
        try {
            token = req.headers.authorization;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { data, error } = await db.from("users")
                .select("id, name, email, role, subscription_status, expiry_date, charity_id, charity_percentage")
                .eq("id", decoded.id)
                .single();

            if (error || !data) {
                return res.status(401).json({ message: "Not authorized" });
            }
            
            req.user = data;
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

// ADMIN ONLY MIDDLEWARE
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin only." });
    }
};

// SUBSCRIBER ONLY MIDDLEWARE (Handles lapsed state)
export const isSubscriber = (req, res, next) => {
    if (req.user && req.user.subscription_status === 1) {
        // Check expiry
        if (req.user.expiry_date && new Date(req.user.expiry_date) < new Date()) {
            return res.status(402).json({ message: "Subscription lapsed. Please renew." });
        }
        next();
    } else {
        res.status(403).json({ message: "Active subscription required." });
    }
};