import { Router } from "express";
import mongoose from "mongoose";
import Course, { CATEGORIES } from "../models/Course.js";
import Review from "../models/Review.js";
import Progress from "../models/Progress.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { ratings } from "../lib/ratings.js";

const router = Router();
router.use(requireAuth);
const valid = (...ids) => ids.every((i) => mongoose.isValidObjectId(i));

router.get("/", async (req, res) => {
  const [courses, mine] = await Promise.all([
    Course.find().sort({ createdAt: -1 }).lean(),
    Progress.find({ user: req.user._id }).select("course").lean(),
  ]);
  const enrolled = new Set(mine.map((m) => String(m.course)));
  const r = await ratings("course", req.user._id);
  res.json({
    courses: courses.map((c) => ({
      id: c._id, title: c.title, description: c.description, category: c.category, link: c.link,
      lessonCount: c.lessons.length, enrolled: enrolled.has(String(c._id)),
      rating: r.stat(c._id).avg, ratings: r.stat(c._id).n,
    })),
  });
});

router.get("/path", async (req, res) => {
  const rows = await Progress.find({ user: req.user._id }).sort({ createdAt: 1 }).populate("course").lean();
  res.json({
    path: rows.filter((r) => r.course).map((r) => {
      const done = r.done.map(String);
      const lessons = r.course.lessons.map((l) => ({ id: String(l._id), title: l.title }));
      return {
        id: String(r.course._id), title: r.course.title, category: r.course.category, link: r.course.link,
        lessons, done, percent: lessons.length ? Math.round((100 * done.length) / lessons.length) : 0,
      };
    }),
  });
});

const isUrl = (s) => { try { return ["http:", "https:"].includes(new URL(s).protocol); } catch { return false; } };
const bad = (res, m) => res.status(400).json({ error: m });

router.get("/mine", requireRole("educator"), async (req, res) => {
  const courses = await Course.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).lean();
  const counts = await Progress.aggregate([{ $match: { course: { $in: courses.map((c) => c._id) } } }, { $group: { _id: "$course", n: { $sum: 1 } } }]);
  const n = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json({ courses: courses.map((c) => ({ id: String(c._id), title: c.title, category: c.category, lessonCount: c.lessons.length, students: n.get(String(c._id)) ?? 0 })) });
});

router.post("/", requireRole("educator"), async (req, res) => {
  const { title, description, category, link, lessons } = req.body ?? {};
  const names = Array.isArray(lessons) ? lessons.map((l) => String(l).trim()).filter(Boolean) : [];
  if (!String(title ?? "").trim() || String(title).length > 120) return bad(res, "Add a title of up to 120 characters");
  if (!String(description ?? "").trim() || String(description).length > 400) return bad(res, "Add a description of up to 400 characters");
  if (!CATEGORIES.includes(category)) return bad(res, "Choose a category");
  if (!isUrl(String(link ?? ""))) return bad(res, "Add the course link, starting with https://");
  if (names.length < 1 || names.length > 30 || names.some((l) => l.length > 120)) return bad(res, "List 1 to 30 lessons, one per line");
  await Course.create({ title, description, category, link, lessons: names.map((t) => ({ title: t })), createdBy: req.user._id });
  res.status(201).json({ ok: true });
});

router.delete("/:id", requireRole("educator"), async (req, res) => {
  const gone = valid(req.params.id) && (await Course.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id }));
  if (!gone) return res.status(404).json({ error: "Course not found" });
  await Promise.all([Progress.deleteMany({ course: gone._id }), Review.deleteMany({ kind: "course", target: gone._id })]);
  res.json({ ok: true });
});

router.post("/:id/enroll", async (req, res) => {
  if (!valid(req.params.id) || !(await Course.exists({ _id: req.params.id }))) return res.status(404).json({ error: "Course not found" });
  await Progress.updateOne({ user: req.user._id, course: req.params.id }, { $setOnInsert: { done: [] } }, { upsert: true });
  res.json({ ok: true });
});

router.delete("/:id/enroll", async (req, res) => {
  if (!valid(req.params.id)) return res.status(404).json({ error: "Course not found" });
  await Progress.deleteOne({ user: req.user._id, course: req.params.id });
  res.json({ ok: true });
});

router.post("/:id/lessons/:lessonId/toggle", async (req, res) => {
  const { id, lessonId } = req.params;
  if (!valid(id, lessonId) || !(await Course.exists({ _id: id, "lessons._id": lessonId }))) return res.status(404).json({ error: "Lesson not found" });
  const p = await Progress.findOne({ user: req.user._id, course: id });
  if (!p) return res.status(404).json({ error: "Add this course to your path first" });
  const has = p.done.some((d) => String(d) === lessonId);
  await Progress.updateOne({ _id: p._id }, has ? { $pull: { done: lessonId } } : { $addToSet: { done: lessonId } });
  res.json({ ok: true });
});

export default router;
