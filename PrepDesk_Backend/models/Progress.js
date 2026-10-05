import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    done: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);
progressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
