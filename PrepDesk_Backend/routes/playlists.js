import { Router } from "express";
import mongoose from "mongoose";
import Playlist from "../models/Playlist.js";
import Review from "../models/Review.js";
import { CATEGORIES } from "../models/Course.js";
import { ratings } from "../lib/ratings.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth, requireRole("student"));
const bad = (res, m) => res.status(400).json({ error: m });

function listIdOf(raw) {
  try {
    const u = new URL(String(raw).trim());
    const host = u.hostname.replace(/^(www|m)\./, "");
    const id = u.searchParams.get("list");
    return host === "youtube.com" && /^[\w-]{10,64}$/.test(id ?? "") ? id : null;
  } catch { return null; }
}
// Bayesian average: a single 5-star vote should not outrank a well-reviewed playlist
const score = (avg, n) => (n * avg + 3 * 3.5) / (n + 3);

router.get("/", async (req, res) => {
  const category = String(req.query.category ?? "All");
  const rows = await Playlist.find(CATEGORIES.includes(category) ? { category } : {}).lean();
  const r = await ratings("playlist", req.user._id);
  const out = rows.map((p) => {
    const { avg, n } = r.stat(p._id);
    return { id: String(p._id), title: p.title, url: p.url, category: p.category, rating: avg, ratings: n, mine: r.mine(p._id),
      canDelete: String(p.addedBy) === String(req.user._id), _s: score(avg, n), _t: +new Date(p.createdAt) };
  }).sort((a, b) => b._s - a._s || b._t - a._t);
  res.json({ playlists: out.map(({ _s, _t, ...rest }) => rest) });
});

router.post("/", async (req, res) => {
  const { title, url, category } = req.body ?? {};
  const listId = listIdOf(url);
  if (!String(title ?? "").trim()) return bad(res, "Give the playlist a title");
  if (!listId) return bad(res, "Paste a YouTube playlist link that contains list=");
  if (!CATEGORIES.includes(category)) return bad(res, "Choose a category");
  if (await Playlist.exists({ listId })) return res.status(409).json({ error: "This playlist is already listed" });
  await Playlist.create({ title, listId, url: `https://www.youtube.com/playlist?list=${listId}`, category, addedBy: req.user._id });
  res.status(201).json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return bad(res, "Invalid request");
  const gone = await Playlist.findOneAndDelete({ _id: req.params.id, addedBy: req.user._id });
  if (gone) await Review.deleteMany({ kind: "playlist", target: gone._id });
  res.json({ ok: true });
});

export default router;
