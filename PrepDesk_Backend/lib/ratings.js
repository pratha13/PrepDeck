import Review from "../models/Review.js";

export async function ratings(kind, userId) {
  const [rows, mine] = await Promise.all([
    Review.aggregate([{ $match: { kind } }, { $group: { _id: "$target", avg: { $avg: "$rating" }, n: { $sum: 1 } } }]),
    Review.find({ kind, user: userId }).select("target rating -_id").lean(),
  ]);
  const stats = new Map(rows.map((r) => [String(r._id), { avg: Math.round(r.avg * 10) / 10, n: r.n }]));
  const own = new Map(mine.map((m) => [String(m.target), m.rating]));
  return {
    stat: (id) => stats.get(String(id)) ?? { avg: 0, n: 0 },
    mine: (id) => own.get(String(id)) ?? 0,
  };
}
