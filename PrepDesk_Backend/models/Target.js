import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    goal: { type: Number, required: true, min: 1, max: 10000 },
    current: { type: Number, default: 0, min: 0 },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
  },
  { timestamps: true }
);

export default mongoose.model("Target", schema);
