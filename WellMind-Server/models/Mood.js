import mongoose from "mongoose";
import { VALID_MOODS } from "../lib/moods.js";

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  mood: { type: String, required: true, enum: VALID_MOODS },
  note: { type: String, default: "", maxlength: 2000 },
  date: { type: Date, default: Date.now },
});

moodSchema.index({ userId: 1, date: -1 });

const Mood = mongoose.model("Mood", moodSchema);
export default Mood;
