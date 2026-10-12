import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../contexts/SurveyContext';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { SurveyResponse } from '../types';
import AppShell from './AppShell';
import { CRISIS_GUIDANCE } from '../lib/supportCopy';
import { ApiError } from '../api/client';

const SurveyForm: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { getSurvey, submitSurveyResult } = useSurvey();

  const survey = getSurvey(surveyId || '');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [safetyNote, setSafetyNote] = useState(false);

  if (!survey) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto py-16 px-4">
          <div className="card rounded-2xl p-8 text-center">
            <AlertCircle className="h-10 w-10 text-coral mx-auto mb-3" />
            <h2 className="font-display text-2xl font-semibold text-ink">
              Screening Not Found
            </h2>
            <p className="text-sm text-ink-mute mt-2">
              The assessment you requested could not be located.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary mt-6"
            >
              <ArrowLeft className="h-4 w-4" /> Return to dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];

  const upsertResponse = (current: SurveyResponse[], questionId: string, answer: string | number) => {
    const next = current.filter((item) => item.questionId !== questionId);
    next.push({ id: `${questionId}-${answer}`, questionId, answer });
    return next;
  };

  const finishIfComplete = async (next: SurveyResponse[], questionId: string, answer: string | number) => {
    const isLast = currentQuestionIndex >= survey.questions.length - 1;
    const needsSafetyPause = questionId === 'phq9-9' && typeof answer === 'number' && answer > 0;
    if (questionId === 'phq9-9') setSafetyNote(needsSafetyPause);
    if (!isLast) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setError('');
      return;
    }
    if (needsSafetyPause) return;
    await handleSubmit(next);
  };

  const handleScaleResponse = (value: number) => {
    if (submitting) return;
    const next = upsertResponse(responses, currentQuestion.id, value);
    setResponses(next);
    void finishIfComplete(next, currentQuestion.id, value);
  };

  const handleMultipleChoiceResponse = (option: string) => {
    if (submitting) return;
    const next = upsertResponse(responses, currentQuestion.id, option);
    setResponses(next);
    void finishIfComplete(next, currentQuestion.id, option);
  };

  const handleTextResponse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const textAnswer = formData.get('textAnswer') as string;

    if (!textAnswer.trim()) {
      setError('Please provide an answer before continuing.');
      return;
    }

    const next = upsertResponse(responses, currentQuestion.id, textAnswer);
    setResponses(next);
    void finishIfComplete(next, currentQuestion.id, textAnswer);
  };

  const handleSubmit = async (nextResponses: SurveyResponse[] = responses) => {
    if (submitting) return;
    if (nextResponses.length < survey.questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitSurveyResult(survey.id, nextResponses);
      navigate('/dashboard/wellness');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The screening could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentResponseValue = () => {
    const response = responses.find((r) => r.questionId === currentQuestion.id);
    return response ? response.answer : null;
  };

  const progressPercent =
    ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
        <div className="card rounded-2xl p-6 sm:p-10 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-line">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mute hover:text-ink transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <span className="text-xs text-ink-mute font-medium">
              Question {currentQuestionIndex + 1} of {survey.questions.length}
            </span>
          </div>

          <div className="mt-4">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {survey.title}
            </h2>
            <p className="text-sm text-ink-mute mt-1">{survey.description}</p>
          </div>

          {/* Progress bar */}
          <div className="mt-6 bg-surface-2 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-lavender h-full transition-all duration-base"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {safetyNote && (
            <div className="mt-4 p-3 rounded-xl bg-coral-soft text-ink text-sm" role="status">
              <p className="font-semibold text-coral">If these thoughts are current, please reach out now.</p>
              <p className="mt-1 text-xs leading-relaxed">{CRISIS_GUIDANCE}</p>
              <button type="button" className="btn-primary mt-3" disabled={submitting} onClick={() => void handleSubmit()}>
                {submitting ? 'Saving…' : 'Submit screening'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-coral-soft text-coral text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Question */}
          <div className="mt-8">
            <p className="text-base font-semibold text-ink mb-6">
              {currentQuestion.text}
            </p>

            {currentQuestion.type === 'scale' && (
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-ink-mute px-1">
                  <span>{currentQuestion.minLabel || 'Not at all'}</span>
                  <span>{currentQuestion.maxLabel || 'Nearly every day'}</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((val) => {
                    const isSelected = getCurrentResponseValue() === val;
                    return (
                      <button
                        key={val}
                        onClick={() => handleScaleResponse(val)}
                        className={`h-16 rounded-xl border font-semibold text-lg flex items-center justify-center transition-all duration-fast ${
                          isSelected
                            ? 'bg-lavender text-white border-lavender shadow-sm scale-[1.02]'
                            : 'bg-surface border-line text-ink hover:bg-surface-2'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentQuestion.type === 'multipleChoice' && currentQuestion.options && (
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = getCurrentResponseValue() === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleMultipleChoiceResponse(opt)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-fast flex items-center justify-between ${
                        isSelected
                          ? 'bg-lavender-soft border-lavender text-lavender-deep'
                          : 'bg-surface border-line text-ink hover:bg-surface-2'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <form onSubmit={handleTextResponse} className="space-y-4">
                <textarea
                  name="textAnswer"
                  defaultValue={(getCurrentResponseValue() as string) || ''}
                  className="input !rounded-xl"
                  rows={4}
                  placeholder="Type your reflection here..."
                />
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">
                    {currentQuestionIndex < survey.questions.length - 1
                      ? 'Next question'
                      : 'Submit assessment'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Navigation */}
          {currentQuestion.type !== 'text' && currentQuestionIndex > 0 && (
            <div className="mt-8 pt-4 border-t border-line flex justify-start">
              <button
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                }
                className="btn-ghost !py-1.5 !px-3 text-xs"
              >
                Previous question
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default SurveyForm;
