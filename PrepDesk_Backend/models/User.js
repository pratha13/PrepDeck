import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["student", "educator"], default: "student" },
    avatar: String,
    emailVerified: { type: Boolean, default: false },
    verifyHash: { type: String, select: false },
    verifyExpires: { type: Date, select: false },
    providers: { google: String, github: String, linkedin: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
