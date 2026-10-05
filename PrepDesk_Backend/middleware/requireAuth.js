import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const { id } = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) throw new Error("no user");
    next();
  } catch {
    res.status(401).json({ error: "Please sign in" });
  }
}

export const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : res.status(403).json({ error: "Not allowed for your account type" });
