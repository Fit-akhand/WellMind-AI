import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import Survey from "../models/Survey.js";
import SurveyResponse from "../models/SurveyResponse.js";
import { validateSurveyResponses } from "../lib/surveyValidation.js";

const router = express.Router();

function serializeSurvey(survey) {
  return {
    id: survey.slug || String(survey._id),
    slug: survey.slug || String(survey._id),
    title: survey.title,
    description: survey.description,
    questions: survey.questions,
  };
}

async function findSurvey(surveyId) {
  if (!surveyId) return null;
  const bySlug = await Survey.findOne({ slug: surveyId });
  if (bySlug) return bySlug;
  if (mongoose.isValidObjectId(surveyId)) {
    return Survey.findById(surveyId);
  }
  return null;
}

router.get("/", async (_req, res, next) => {
  try {
    const surveys = await Survey.find({ slug: { $in: ["phq9", "gad7"] } }).sort({ slug: 1 });
    if (surveys.length === 0) {
      const all = await Survey.find().sort({ title: 1 });
      return res.json(all.map(serializeSurvey));
    }
    res.json(surveys.map(serializeSurvey));
  } catch (error) {
    next(error);
  }
});

router.get("/mine", authMiddleware, async (req, res, next) => {
  try {
    const rows = await SurveyResponse.find({ userId: req.user })
      .sort({ submittedAt: -1 })
      .populate("surveyId");
    res.json(
      rows.map((row) => ({
        id: String(row._id),
        surveyId: row.surveyId?.slug || String(row.surveyId?._id || row.surveyId),
        date: row.submittedAt,
        responses: row.responses,
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.get("/:surveyId", async (req, res, next) => {
  try {
    const survey = await findSurvey(req.params.surveyId);
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    res.json(serializeSurvey(survey));
  } catch (error) {
    next(error);
  }
});

router.post("/:surveyId/submit", authMiddleware, async (req, res, next) => {
  const { responses } = req.body;
  try {
    const survey = await findSurvey(req.params.surveyId);
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const validated = validateSurveyResponses(survey.questions, responses);
    if (!validated.ok) {
      return res.status(400).json({ message: validated.error });
    }
    const normalized = validated.responses;

    const newResponse = new SurveyResponse({
      surveyId: survey._id,
      userId: req.user,
      responses: normalized,
    });
    await newResponse.save();
    res.status(201).json({
      message: "Survey submitted successfully",
      id: String(newResponse._id),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
