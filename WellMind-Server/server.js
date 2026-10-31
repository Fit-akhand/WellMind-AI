import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import moodRoutes from "./routes/moodTracker.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import rateLimit from "./middleware/rateLimit.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import { seedSurveys } from "./config/seedSurveys.js";
import { requestHealth } from "./lib/aiClient.js";

dotenv.config();

if (!process.env.JWT_SECRET || !String(process.env.JWT_SECRET).trim()) {
  console.error("JWT_SECRET is not configured. Set JWT_SECRET in server/.env");
  process.exit(1);
}

const app = express();

app.use(express.json({ limit: "32kb" }));

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/health", async (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const ai = await requestHealth();
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? "ok" : "degraded",
    service: "wellmind-express",
    database: dbReady ? "connected" : "disconnected",
    aiService: ai.reachable ? "reachable" : "unreachable",
    rag: ai.rag || null,
    documents: typeof ai.documents === "number" ? ai.documents : null,
    llm_provider: ai.llm_provider || "not-configured",
  });
});

// Only credential-guessing routes are limited; the session check (/me) runs on every page load.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many sign-in attempts. Please wait a few minutes and try again.",
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use(
  "/api/chat",
  rateLimit({ windowMs: 60 * 1000, max: 20, message: "You are sending messages very quickly. Please pause for a moment." }),
  chatbotRoutes
);
app.use("/api/surveys", surveyRoutes);

await connectDB();
await seedSurveys();

app.use(errorHandler);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
