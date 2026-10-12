import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Chatbot from "../models/Chatbot.js";
import { requestChat, AiServiceError } from "../lib/aiClient.js";
import { isSameAccount } from "../lib/access.js";

const router = express.Router();

function serializeChat(entry, extra = {}) {
  return {
    _id: entry._id,
    message: entry.message,
    response: entry.response,
    timestamp: entry.timestamp,
    ...extra,
  };
}

router.post("/", authMiddleware, async (req, res, next) => {
  const { message } = req.body;

  try {
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    const trimmed = message.trim().slice(0, 2000);
    const ai = await requestChat(trimmed);
    const responseText =
      typeof ai.response === "string" && ai.response.trim()
        ? ai.response
        : "I could not produce a response right now. Please try again.";

    const chatEntry = await Chatbot.create({
      userId: req.user,
      message: trimmed,
      response: responseText,
    });

    res.status(201).json(
      serializeChat(chatEntry, {
        response: responseText,
        provider: ai.provider,
        is_safety_response: Boolean(ai.is_safety_response),
        retrieved: ai.retrieved ?? 0,
        generationAvailable: Boolean(ai.generation_configured),
      })
    );
  } catch (error) {
    if (error instanceof AiServiceError) {
      return res.status(error.status).json({
        message: error.message,
        response: error.message,
        generationAvailable: false,
      });
    }
    next(error);
  }
});

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const history = await Chatbot.find({ userId: req.user }).sort({ timestamp: 1 });
    res.status(200).json(history.map((entry) => serializeChat(entry)));
  } catch (error) {
    next(error);
  }
});

router.get("/:userId", authMiddleware, async (req, res, next) => {
  try {
    if (!isSameAccount(req.user, req.params.userId)) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    const history = await Chatbot.find({ userId: req.user }).sort({ timestamp: 1 });
    res.status(200).json(history.map((entry) => serializeChat(entry)));
  } catch (error) {
    next(error);
  }
});

export default router;
