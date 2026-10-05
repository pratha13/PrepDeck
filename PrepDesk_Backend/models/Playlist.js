import mongoose from "mongoose";
import { CATEGORIES } from "./Course.js";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    listId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Playlist", schema);
