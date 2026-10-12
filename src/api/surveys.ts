import { apiFetch } from './client';
import { Survey, SurveyResponse } from '../types';

export interface RemoteSurveyResult {
  id: string;
  surveyId: string;
  date: string;
  responses: { questionId: string; answer: string | number }[];
}

export const fetchSurveys = async () => {
  return apiFetch<Survey[]>('/api/surveys');
};

export const fetchSurveyById = async (surveyId: string) => {
  return apiFetch<Survey>(`/api/surveys/${encodeURIComponent(surveyId)}`);
};

export const submitSurvey = async (surveyId: string, responses: SurveyResponse[]) => {
  return apiFetch<{ message: string; id?: string }>(`/api/surveys/${encodeURIComponent(surveyId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      responses: responses.map((r) => ({ questionId: r.questionId, answer: r.answer })),
    }),
  });
};

export const fetchMySurveyResults = async () => {
  return apiFetch<RemoteSurveyResult[]>('/api/surveys/mine');
};
