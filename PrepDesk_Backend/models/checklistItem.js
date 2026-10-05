import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 140 },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    week: { type: Number, min: 1, max: 5, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ChecklistItem", schema);
