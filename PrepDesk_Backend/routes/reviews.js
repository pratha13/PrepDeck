import { Router } from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Course from "../models/Course.js";
import Playlist from "../models/Playlist.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth, requireRole("student"));
const bad = (res, m) => res.status(400).json({ error: m });

router.get("/", async (req, res) => {
  const { target } = req.query;
  if (target && !mongoose.isValidObjectId(target)) return bad(res, "Invalid course");
  const rows = await Review.find({ kind: "course", ...(target ? { target } : {}) }).sort({ createdAt: -1 }).limit(50).populate("user", "name").lean();
  const titles = new Map((await Course.find({ _id: { $in: rows.map((r) => r.target) } }).select("title").lean()).map((c) => [String(c._id), c.title]));
  res.json({
    reviews: rows.map((r) => ({
      id: String(r._id), rating: r.rating, text: r.text, user: r.user?.name ?? "Student", mine: String(r.user?._id) === String(req.user._id),
      target: String(r.target), targetTitle: titles.get(String(r.target)) ?? "Removed course", createdAt: r.createdAt,
    })),
  });
});

router.post("/", async (req, res) => {
  const { kind, target, rating, text } = req.body ?? {};
  if (!["course", "playlist"].includes(kind) || !mongoose.isValidObjectId(target)) return bad(res, "Invalid request");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return bad(res, "Choose 1 to 5 stars");
  if (text != null && (typeof text !== "string" || text.length > 500)) return bad(res, "Reviews can be up to 500 characters");
  const exists = kind === "course" ? await Course.exists({ _id: target }) : await Playlist.exists({ _id: target });
  if (!exists) return res.status(404).json({ error: "Not found" });
  await Review.updateOne({ user: req.user._id, kind, target }, { $set: { rating, text: (text ?? "").trim() } }, { upsert: true });
  res.status(201).json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return bad(res, "Invalid request");
  await Review.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

export default router;
