const SCALE_MIN = 0;
const SCALE_MAX = 3;

export function validateSurveyResponses(questions, responses) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { ok: false, error: "Survey has no questions" };
  }
  if (!Array.isArray(responses) || responses.length !== questions.length) {
    return { ok: false, error: "Incomplete survey responses" };
  }

  const byId = new Map(questions.map((question) => [question.id, question]));
  const normalized = [];

  for (const item of responses) {
    if (!item || typeof item.questionId !== "string" || !byId.has(item.questionId)) {
      return { ok: false, error: "Invalid survey responses" };
    }
    if (item.answer === undefined || item.answer === null || item.answer === "") {
      return { ok: false, error: "Invalid survey responses" };
    }

    const question = byId.get(item.questionId);
    if (question.type === "scale") {
      const value = typeof item.answer === "number" ? item.answer : Number(item.answer);
      if (!Number.isInteger(value) || value < SCALE_MIN || value > SCALE_MAX) {
        return { ok: false, error: "Scale answers must be whole numbers from 0 to 3" };
      }
      normalized.push({ questionId: item.questionId, answer: value });
      continue;
    }

    if (question.type === "multipleChoice") {
      const options = Array.isArray(question.options) ? question.options : [];
      if (!options.includes(item.answer)) {
        return { ok: false, error: "Invalid survey responses" };
      }
    }

    normalized.push({ questionId: item.questionId, answer: item.answer });
  }

  const unique = new Set(normalized.map((item) => item.questionId));
  if (unique.size !== questions.length) {
    return { ok: false, error: "Incomplete survey responses" };
  }

  return { ok: true, responses: normalized };
}
