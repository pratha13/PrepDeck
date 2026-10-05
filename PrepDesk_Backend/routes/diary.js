import { Router } from "express";
import DiaryEntry from "../models/DiaryEntry.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth, requireRole("student"));

const realDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

router.get("/", async (req, res) => {
  const year = String(req.query.year ?? "");
  if (!/^\d{4}$/.test(year)) return res.status(400).json({ error: "Choose a valid year" });
  const rows = await DiaryEntry.find({ user: req.user._id, date: { $gte: `${year}-01-01`, $lte: `${year}-12-31` } }).select("date text -_id").lean();
  res.json({ entries: rows });
});

router.put("/:date", async (req, res) => {
  const { date } = req.params;
  const text = req.body?.text;
  if (!realDate(date)) return res.status(400).json({ error: "Invalid date" });
  if (typeof text !== "string" || text.length > 5000) return res.status(400).json({ error: "Entries can be up to 5000 characters" });
  if (!text.trim()) await DiaryEntry.deleteOne({ user: req.user._id, date });
  else await DiaryEntry.updateOne({ user: req.user._id, date }, { $set: { text } }, { upsert: true });
  res.json({ ok: true });
});

export default router;
