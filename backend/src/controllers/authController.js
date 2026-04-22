import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { notifySignup } from "../services/emailService.js";

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// SIGNUP
export const signup = async (req, res) => {
    const { name, email, password, charity_id, charity_percentage, country } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email === "admin@digitalheroes.co.in" ? "admin" : "subscriber";

        const { data, error } = await db.from("users").insert({
            name,
            email,
            password: hashedPassword,
            role: role,
            subscription_status: role === "admin" ? 1 : 0, 
            charity_id: charity_id ? Number(charity_id) : null,
            charity_percentage: charity_percentage ? Number(charity_percentage) : 10,
            country: country || "India"
        });

        if (error) {
            console.error("Signup DB Error:", error);
            return res.status(400).json({ message: error.message || "Registration failed" });
        }
        
        notifySignup(email, name);
        res.json({ message: "Registration successful", user: { name, email } });
    } catch (err) {
        console.error("Signup Catch Error:", err);
        res.status(500).json({ message: "Server error during signup" });
    }
};

// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await db.from("users").select("*").eq("email", email).single();

        if (error || !data) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = data;
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.warn("Login Failed: Invalid credentials", email);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            token: generateToken(user.id, user.role),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscription_status: user.subscription_status,
                plan: user.plan,
                charity_id: user.charity_id
            },
        });
    } catch (err) {
        console.error("Login Catch Error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
};

// GET PROFILE (ME)
export const getProfile = (req, res) => {
    res.json(req.user);
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, email, charity_id, charity_percentage, country } = req.body;

    const { error } = await db.from("users").update({ 
        name, 
        email, 
        charity_id, 
        charity_percentage,
        country
    }).eq("id", userId);

    if (error) return res.status(500).json(error);
    res.json({ message: "Profile updated successfully" });
};