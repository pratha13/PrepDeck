import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import Message from "../models/Message.js";
import { CATEGORIES } from "../models/Course.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

const ROOMS = ["General", ...CATEGORIES];
const router = Router();
router.use(requireAuth, requireRole("student"));
const bad = (res, m) => res.status(400).json({ error: m });
const sendLimit = rateLimit({ windowMs: 60_000, limit: 20, keyGenerator: (req) => String(req.user._id), message: { error: "You are sending messages too fast. Wait a moment." } });

router.get("/messages", async (req, res) => {
  const room = String(req.query.room ?? "");
  if (!ROOMS.includes(room)) return bad(res, "Unknown room");
  const rows = await Message.find({ room }).sort({ createdAt: -1 }).limit(60).populate("user", "name").lean();
  res.json({
    messages: rows.reverse().map((m) => ({ id: String(m._id), text: m.text, user: m.user?.name ?? "Student", mine: String(m.user?._id) === String(req.user._id), createdAt: m.createdAt })),
  });
});

router.post("/messages", sendLimit, async (req, res) => {
  const { room, text } = req.body ?? {};
  if (!ROOMS.includes(room)) return bad(res, "Unknown room");
  if (typeof text !== "string" || !text.trim() || text.length > 500) return bad(res, "Messages need 1 to 500 characters");
  await Message.create({ user: req.user._id, room, text });
  res.status(201).json({ ok: true });
});

router.delete("/messages/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return bad(res, "Invalid request");
  await Message.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

export default router;
