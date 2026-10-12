import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email };
}

router.post("/register", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Name, email, and password are required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ msg: "Please enter a valid email address" });
  }
  if (password.length < 8) {
    return res.status(400).json({ msg: "Password must be at least 8 characters long" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ msg: "User already exists" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "Server error" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("name email");
    if (!user) return res.status(401).json({ msg: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
