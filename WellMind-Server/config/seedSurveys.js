import Survey from "../models/Survey.js";
import { SURVEY_CATALOG } from "./surveyCatalog.js";

export async function seedSurveys() {
  for (const item of SURVEY_CATALOG) {
    await Survey.findOneAndUpdate(
      { slug: item.slug },
      {
        slug: item.slug,
        title: item.title,
        description: item.description,
        questions: item.questions,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}
