import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["course", "playlist"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);
schema.index({ user: 1, kind: 1, target: 1 }, { unique: true });
schema.index({ kind: 1, target: 1 });

export default mongoose.model("Review", schema);
