import mongoose from "mongoose";

export const CATEGORIES = ["DSA", "Web Development", "Java", "Python", "AI/ML", "Blockchain", "Cyber Security"];

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 400 },
    category: { type: String, enum: CATEGORIES, required: true },
    link: { type: String, required: true },
    lessons: { type: [{ title: { type: String, required: true, trim: true, maxlength: 120 } }], validate: (v) => v.length > 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
