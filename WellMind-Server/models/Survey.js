import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  slug: { type: String, unique: true, sparse: true, trim: true },
  title: { type: String, required: true },
  description: { type: String },
  questions: [
    {
      id: { type: String, required: true },
      text: { type: String, required: true },
      type: { type: String, enum: ["scale", "multipleChoice", "text"], required: true },
      options: [String],
      minLabel: String,
      maxLabel: String,
    },
  ],
});

const Survey = mongoose.model("Survey", surveySchema);
export default Survey;
