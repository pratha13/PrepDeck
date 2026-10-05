import { Router } from "express";
import mongoose from "mongoose";
import ChecklistItem from "../models/checklistItem.js";
import Target from "../models/Target.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth, requireRole("student"));

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const bad = (res, msg) => res.status(400).json({ error: msg });
const ok = (id) => mongoose.isValidObjectId(id);
const item = (i) => ({ id: i.id, text: i.text, week: i.week, done: i.done });
const target = (t) => ({ id: t.id, title: t.title, goal: t.goal, current: t.current });

router.get("/", async (req, res) => {
  const month = String(req.query.month ?? "");
  if (!MONTH.test(month)) return bad(res, "Choose a valid month");
  const [items, targets] = await Promise.all([
    ChecklistItem.find({ user: req.user._id, month }).sort({ createdAt: 1 }),
    Target.find({ user: req.user._id, month }).sort({ createdAt: 1 }),
  ]);
  res.json({ items: items.map(item), targets: targets.map(target) });
});

router.post("/items", async (req, res) => {
  const { text, month, week } = req.body ?? {};
  if (!String(text ?? "").trim()) return bad(res, "Write what you plan to do");
  if (!MONTH.test(month) || !(week >= 1 && week <= 5)) return bad(res, "Choose a month and week");
  const doc = await ChecklistItem.create({ user: req.user._id, text, month, week });
  res.status(201).json({ item: item(doc) });
});

router.patch("/items/:id", async (req, res) => {
  if (!ok(req.params.id) || typeof req.body?.done !== "boolean") return bad(res, "Invalid request");
  const doc = await ChecklistItem.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { done: req.body.done }, { new: true });
  doc ? res.json({ item: item(doc) }) : res.status(404).json({ error: "Item not found" });
});

router.delete("/items/:id", async (req, res) => {
  if (!ok(req.params.id)) return bad(res, "Invalid request");
  await ChecklistItem.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

router.post("/targets", async (req, res) => {
  const { title, goal, month } = req.body ?? {};
  const n = Number(goal);
  if (!String(title ?? "").trim()) return bad(res, "Name your target");
  if (!Number.isInteger(n) || n < 1 || n > 10000) return bad(res, "Goal must be a whole number from 1 to 10000");
  if (!MONTH.test(month)) return bad(res, "Choose a valid month");
  const doc = await Target.create({ user: req.user._id, title, goal: n, month });
  res.status(201).json({ target: target(doc) });
});

router.patch("/targets/:id", async (req, res) => {
  const delta = Number(req.body?.delta);
  if (!ok(req.params.id) || !Number.isInteger(delta) || Math.abs(delta) > 100) return bad(res, "Invalid request");
  const doc = await Target.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).json({ error: "Target not found" });
  doc.current = Math.max(0, Math.min(doc.goal, doc.current + delta));
  await doc.save();
  res.json({ target: target(doc) });
});

router.delete("/targets/:id", async (req, res) => {
  if (!ok(req.params.id)) return bad(res, "Invalid request");
  await Target.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

export default router;
