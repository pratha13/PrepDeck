import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { sendMail } from "../lib/mail.js";

const router = Router();
router.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 60 }));

const pub = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar });
const cookieOpts = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" };
const signIn = (res, u) =>
  res.cookie("token", jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "7d" }), { ...cookieOpts, maxAge: 7 * 864e5 });
const roleOf = (r) => (r === "educator" ? "educator" : "student");
const REQUIRE_VERIFIED = process.env.REQUIRE_VERIFIED_EMAIL === "true";
const sha = (t) => crypto.createHash("sha256").update(t).digest("hex");

async function sendVerification(user) {
  const token = crypto.randomBytes(32).toString("hex");
  user.verifyHash = sha(token);
  user.verifyExpires = new Date(Date.now() + 24 * 3600e3);
  await user.save();
  const link = `${process.env.SERVER_URL}/api/auth/verify?token=${token}`;
  await sendMail(user.email, "Confirm your PrepDeck email", `Hi ${user.name},\n\nOpen this link to confirm your email. It works for 24 hours:\n${link}\n\nIf you did not sign up, ignore this message.`);
}

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body ?? {};
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email ?? "")) return res.status(400).json({ error: "Enter your name and a valid email" });
  if (typeof password !== "string" || password.length < 8) return res.status(400).json({ error: "Password needs at least 8 characters" });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ error: "This email already has an account. Sign in instead." });
  const user = await User.create({ name, email, role: roleOf(role), passwordHash: await bcrypt.hash(password, 12) });
  await sendVerification(user).catch((e) => console.error("verification mail failed", e));
  if (REQUIRE_VERIFIED) return res.status(202).json({ verify: true });
  signIn(res, user);
  res.status(201).json({ user: pub(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = await User.findOne({ email: String(email ?? "").toLowerCase() }).select("+passwordHash");
  const ok = user?.passwordHash && (await bcrypt.compare(String(password ?? ""), user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Wrong email or password" });
  if (REQUIRE_VERIFIED && !user.emailVerified) return res.status(403).json({ error: "Verify your email first. We can send the link again." });
  signIn(res, user);
  res.json({ user: pub(user) });
});

router.get("/verify", async (req, res) => {
  const token = String(req.query.token ?? "");
  const user = token && (await User.findOne({ verifyHash: sha(token), verifyExpires: { $gt: new Date() } }).select("+verifyHash +verifyExpires"));
  if (!user) return res.redirect(`${process.env.CLIENT_URL}/login?error=verify`);
  user.emailVerified = true; user.verifyHash = undefined; user.verifyExpires = undefined;
  await user.save();
  res.redirect(`${process.env.CLIENT_URL}/login?verified=1`);
});

router.post("/resend", async (req, res) => {
  const user = await User.findOne({ email: String(req.body?.email ?? "").toLowerCase() }).select("+passwordHash");
  if (user?.passwordHash && !user.emailVerified) await sendVerification(user).catch((e) => console.error(e));
  res.json({ ok: true }); // same answer either way, so emails cannot be probed
});

router.get("/me", requireAuth, (req, res) => res.json({ user: pub(req.user) }));
router.post("/logout", (_req, res) => res.clearCookie("token", cookieOpts).json({ ok: true }));

// OAuth: one code flow for all three providers, CSRF-protected with a state cookie
const userinfo = async (url, token) => (await fetch(url, { headers: { Authorization: `Bearer ${token}`, "User-Agent": "prepdeck" } })).json();
const oidc = (u) => ({ id: u.sub, email: u.email_verified ? u.email : null, name: u.name, avatar: u.picture });

const providers = {
  google: {
    auth: "https://accounts.google.com/o/oauth2/v2/auth", token: "https://oauth2.googleapis.com/token",
    scope: "openid email profile", profile: async (t) => oidc(await userinfo("https://openidconnect.googleapis.com/v1/userinfo", t)),
  },
  linkedin: {
    auth: "https://www.linkedin.com/oauth/v2/authorization", token: "https://www.linkedin.com/oauth/v2/accessToken",
    scope: "openid profile email", profile: async (t) => oidc(await userinfo("https://api.linkedin.com/v2/userinfo", t)),
  },
  github: {
    auth: "https://github.com/login/oauth/authorize", token: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
    profile: async (t) => {
      const u = await userinfo("https://api.github.com/user", t);
      const emails = await userinfo("https://api.github.com/user/emails", t);
      const primary = Array.isArray(emails) && emails.find((e) => e.primary && e.verified);
      return { id: String(u.id), email: primary?.email ?? null, name: u.name || u.login, avatar: u.avatar_url };
    },
  },
};
const creds = (p) => [process.env[`${p.toUpperCase()}_CLIENT_ID`], process.env[`${p.toUpperCase()}_CLIENT_SECRET`]];
const redirectUri = (p) => `${process.env.SERVER_URL}/api/auth/${p}/callback`;

router.get("/:provider", (req, res, next) => {
  const cfg = providers[req.params.provider];
  if (!cfg) return next();
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, { ...cookieOpts, maxAge: 6e5 });
  res.cookie("oauth_role", roleOf(req.query.role), { ...cookieOpts, maxAge: 6e5 });
  const q = new URLSearchParams({
    response_type: "code", client_id: creds(req.params.provider)[0], redirect_uri: redirectUri(req.params.provider),
    scope: cfg.scope, state,
  });
  res.redirect(`${cfg.auth}?${q}`);
});

router.get("/:provider/callback", async (req, res, next) => {
  const name = req.params.provider, cfg = providers[name];
  if (!cfg) return next();
  const fail = () => res.redirect(`${process.env.CLIENT_URL}/login?error=oauth`);
  try {
    if (!req.query.code || req.query.state !== req.cookies.oauth_state) return fail();
    const [id, secret] = creds(name);
    const tokenRes = await fetch(cfg.token, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ grant_type: "authorization_code", code: req.query.code, client_id: id, client_secret: secret, redirect_uri: redirectUri(name) }),
    });
    const { access_token } = await tokenRes.json();
    if (!access_token) return fail();
    const p = await cfg.profile(access_token);
    if (!p.email) return fail();
    let user = await User.findOne({ email: p.email.toLowerCase() });
    user ??= new User({ email: p.email, name: p.name || p.email.split("@")[0], avatar: p.avatar, role: roleOf(req.cookies.oauth_role), emailVerified: true });
    // A provider-verified email proves ownership: an unverified password signup on it is taken over by the real owner
    if (!user.emailVerified) { user.passwordHash = undefined; user.emailVerified = true; }
    user.set(`providers.${name}`, p.id);
    await user.save();
    res.clearCookie("oauth_state", cookieOpts).clearCookie("oauth_role", cookieOpts);
    signIn(res, user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback`);
  } catch (e) {
    console.error(e);
    fail();
  }
});

export default router;
