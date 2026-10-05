import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/ },
    text: { type: String, required: true, maxlength: 5000 },
  },
  { timestamps: true }
);
schema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("DiaryEntry", schema);
