import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import drawRoutes from "./routes/drawRoutes.js";
import charityRoutes from "./routes/charityRoutes.js";
import winningsRoutes from "./routes/winningsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// API Versioning Support (Mobile & Scale Ready)
const BASE_URL = "/api/v1";

app.use(`${BASE_URL}/auth`, authRoutes);
app.use(`${BASE_URL}/scores`, scoreRoutes);
app.use(`${BASE_URL}/draws`, drawRoutes);
app.use(`${BASE_URL}/charities`, charityRoutes);
app.use(`${BASE_URL}/winnings`, winningsRoutes);
app.use(`${BASE_URL}/admin`, adminRoutes);
app.use(`${BASE_URL}/subscription`, subscriptionRoutes);
app.use(`${BASE_URL}/campaigns`, campaignRoutes);

// Global Health Check
app.get("/", (req, res) => res.send("<h1>Digital Heroes API</h1><p>Status: <b>Live</b>. Use /api/v1 for endpoints.</p>"));
app.get("/health", (req, res) => res.json({ status: "running", version: "v1.0.0", environment: "hero-dev" }));

export default app;