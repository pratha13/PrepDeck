import "dotenv/config";
import "express-async-errors";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import auth from "./routes/auth.js";
import courses from "./routes/courses.js";
import checklist from "./routes/checklist.js";
import diary from "./routes/diary.js";
import chat from "./routes/chat.js";
import reviews from "./routes/reviews.js";
import playlists from "./routes/playlists.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.use("/api/auth", auth);
app.use("/api/courses", courses);
app.use("/api/checklist", checklist);
app.use("/api/diary", diary);
app.use("/api/chat", chat);
app.use("/api/reviews", reviews);
app.use("/api/playlists", playlists);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Try again." });
});

await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT || 5000, () => console.log("API ready"));
