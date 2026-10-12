import mongoose from 'mongoose';

const surveyResponseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responses: [
    {
      questionId: { type: String, required: true },
      answer: { type: mongoose.Schema.Types.Mixed, required: true }
    }
  ],
  submittedAt: { type: Date, default: Date.now }
});

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);
export default SurveyResponse;