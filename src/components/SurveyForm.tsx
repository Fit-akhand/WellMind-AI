import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../contexts/SurveyContext';
import { ArrowLeft, AlertCircle, Check, CheckCircle2, Wind, Heart, MessageSquare, BookOpen, ArrowRight } from 'lucide-react';
import { SurveyResponse } from '../types';
import AppShell from './AppShell';
import { CRISIS_GUIDANCE } from '../lib/supportCopy';
import { ApiError } from '../api/client';

interface Recommendation {
  title: string;
  desc: string;
  actionText: string;
  path: string;
  icon: 'wind' | 'journal' | 'chat' | 'heart';
}

interface AssessmentFeedback {
  score: number;
  maxScore: number;
  level: string;
  badgeStyle: string;
  summary: string;
  guidance: string;
  exercises: Recommendation[];
}

function calculateFeedback(surveyId: string, responses: SurveyResponse[]): AssessmentFeedback {
  const score = responses.reduce((sum, r) => {
    return sum + (typeof r.answer === 'number' ? r.answer : 0);
  }, 0);

  if (surveyId.toLowerCase().includes('gad7')) {
    const maxScore = 21;
    if (score <= 4) {
      return {
        score,
        maxScore,
        level: 'Minimal Anxiety (0–4)',
        badgeStyle: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
        summary: 'Your responses suggest minimal or baseline nervous tension.',
        guidance: 'Your nervous system appears balanced. Continuing regular sleep, physical movement, and gentle daily reflections will help you stay grounded.',
        exercises: [
          {
            title: '4-7-8 Breathing Pattern',
            desc: 'A calming 2-minute breath cycle to sustain steady focus.',
            actionText: 'Practice Breathing',
            path: '/dashboard/wellness',
            icon: 'wind',
          },
          {
            title: 'Private Journal',
            desc: 'Note down one positive takeaway or achievement from today.',
            actionText: 'Open Journal',
            path: '/dashboard/wellness',
            icon: 'journal',
          },
        ],
      };
    }
    if (score <= 9) {
      return {
        score,
        maxScore,
        level: 'Mild Anxiety (5–9)',
        badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        summary: 'Mild anxiety symptoms noted — commonly tied to deadlines or upcoming evaluations.',
        guidance: 'Anticipatory nervousness during placement interviews or semester tests is very common. Taking mindful pauses prevents nervous energy from compounding.',
        exercises: [
          {
            title: '4-7-8 Breathing Technique',
            desc: 'Directly lowers elevated heart rates and eases restlessness.',
            actionText: 'Start Breathing',
            path: '/dashboard/wellness',
            icon: 'wind',
          },
          {
            title: '5-4-3-2-1 Sensory Grounding',
            desc: 'Brings active thoughts back to the physical room.',
            actionText: 'Try Grounding',
            path: '/dashboard/wellness',
            icon: 'heart',
          },
          {
            title: 'WellMind Companion Chat',
            desc: 'Deconstruct worried thoughts with grounded counselor support.',
            actionText: 'Chat Now',
            path: '/chat',
            icon: 'chat',
          },
        ],
      };
    }
    if (score <= 14) {
      return {
        score,
        maxScore,
        level: 'Moderate Anxiety (10–14)',
        badgeStyle: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
        summary: 'Moderate anxiety symptoms noted. You may be experiencing restlessness or sleep disruption.',
        guidance: 'When worried thoughts repeat, somatic exercises (breathwork and physical grounding) give your nervous system immediate physiological relief.',
        exercises: [
          {
            title: '4-7-8 Breathwork',
            desc: 'A gentle 6-cycle breathing exercise to calm physical tension.',
            actionText: 'Do Breathing Exercise',
            path: '/dashboard/wellness',
            icon: 'wind',
          },
          {
            title: 'Chat with WellMind Support',
            desc: 'Discuss coping techniques grounded in therapist practice.',
            actionText: 'Talk to Companion',
            path: '/chat',
            icon: 'chat',
          },
          {
            title: 'Private Reflection Journal',
            desc: 'Separate what is within your control from what is outside it.',
            actionText: 'Open Journal',
            path: '/dashboard/wellness',
            icon: 'journal',
          },
        ],
      };
    }
    return {
      score,
      maxScore,
      level: 'Elevated Anxiety (15–21)',
      badgeStyle: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
      summary: 'Significant anxiety levels indicated.',
      guidance: 'Experiencing persistent anxiety can be draining. Grounding can help in the immediate moment, and we strongly encourage discussing these feelings with a campus counselor or healthcare provider.',
      exercises: [
        {
          title: '5-4-3-2-1 Sensory Grounding',
          desc: 'Immediate somatic de-escalation for acute worry or panic.',
          actionText: 'Start Grounding',
          path: '/dashboard/wellness',
          icon: 'heart',
        },
        {
          title: 'Talk to WellMind or View Helplines',
          desc: 'Safe, empathetic support. Tele-MANAS (14416) or campus resources.',
          actionText: 'View Support Chat',
          path: '/chat',
          icon: 'chat',
        },
      ],
    };
  }

  // PHQ-9 calculation
  const maxScore = 27;
  if (score <= 4) {
    return {
      score,
      maxScore,
      level: 'Minimal Symptoms (0–4)',
      badgeStyle: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      summary: 'Your responses suggest minimal or healthy mood baseline.',
      guidance: 'Your mood baseline is steady. Continuing regular sleep, physical movement, and gentle daily reflections will help maintain your resilience.',
      exercises: [
        {
          title: 'Private Journal',
          desc: 'Keep track of daily wins, small joys, and reflections.',
          actionText: 'Write in Journal',
          path: '/dashboard/wellness',
          icon: 'journal',
        },
        {
          title: '4-7-8 Breathing',
          desc: 'A 2-minute cycle for sustained clarity and calmness.',
          actionText: 'Practice Breathing',
          path: '/dashboard/wellness',
          icon: 'wind',
        },
      ],
    };
  }
  if (score <= 9) {
    return {
      score,
      maxScore,
      level: 'Mild Symptoms (5–9)',
      badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      summary: 'Mild depressive symptoms or low energy noted.',
      guidance: 'Mild dips in motivation or energy are common during intensive semesters. Prioritizing restful sleep, breaking tasks into bite-sized steps, and gentle movement can help restore your rhythm.',
      exercises: [
        {
          title: '5-4-3-2-1 Sensory Grounding',
          desc: 'Reconnect with your immediate surroundings when feeling flat.',
          actionText: 'Try Grounding',
          path: '/dashboard/wellness',
          icon: 'heart',
        },
        {
          title: 'Chat with WellMind Companion',
          desc: 'Talk through study pressure or placement worries safely.',
          actionText: 'Open Chat',
          path: '/chat',
          icon: 'chat',
        },
        {
          title: 'Private Journal',
          desc: 'Release racing thoughts without anyone judging you.',
          actionText: 'Open Journal',
          path: '/dashboard/wellness',
          icon: 'journal',
        },
      ],
    };
  }
  if (score <= 14) {
    return {
      score,
      maxScore,
      level: 'Moderate Symptoms (10–14)',
      badgeStyle: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      summary: 'Moderate emotional strain and fatigue reported.',
      guidance: 'You may be feeling exhausted, self-critical, or struggling with focus. Sharing your feelings with a trusted peer or mentor can significantly relieve this pressure.',
      exercises: [
        {
          title: 'WellMind Companion Chat',
          desc: 'Therapist-grounded conversational support to process emotions.',
          actionText: 'Chat Now',
          path: '/chat',
          icon: 'chat',
        },
        {
          title: '4-7-8 Breathing',
          desc: 'Physiological reset to lower cortisol and mental tension.',
          actionText: 'Breathe Now',
          path: '/dashboard/wellness',
          icon: 'wind',
        },
        {
          title: 'Campus & Peer Support',
          desc: 'Consider discussing your workload with a mentor or counselor.',
          actionText: 'Open Resources',
          path: '/dashboard',
          icon: 'heart',
        },
      ],
    };
  }
  return {
    score,
    maxScore,
    level: 'Elevated Strain (15–27)',
    badgeStyle: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
    summary: 'Elevated emotional strain and persistent distress noted.',
    guidance: 'Carrying this level of weight alone is exhausting. We encourage you to reach out to professional counseling services or trusted support networks.',
    exercises: [
      {
        title: 'Confidential Helplines & Counseling',
        desc: 'National Tele-MANAS (14416), 988, or your campus wellness center.',
        actionText: 'View Support',
        path: '/chat',
        icon: 'heart',
      },
      {
        title: '5-4-3-2-1 Sensory Grounding',
        desc: 'Somatic exercise to help anchor yourself right now.',
        actionText: 'Start Grounding',
        path: '/dashboard/wellness',
        icon: 'wind',
      },
    ],
  };
}

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
  const [completedFeedback, setCompletedFeedback] = useState<AssessmentFeedback | null>(null);

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
      const feedback = calculateFeedback(survey.id, nextResponses);
      setCompletedFeedback(feedback);
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

  // Render Completion & Feedback Screen if finished
  if (completedFeedback) {
    const percentage = Math.round((completedFeedback.score / completedFeedback.maxScore) * 100);

    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
          <div className="card rounded-2xl p-6 sm:p-10 shadow-md space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-line">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Screening Summary
                </h2>
                <p className="text-xs text-ink-mute">{survey.title} Completed</p>
              </div>
            </div>

            {/* Score & Category Card */}
            <div className="p-5 rounded-2xl bg-surface-2/60 border border-line space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-xs text-ink-mute uppercase tracking-wider font-semibold">
                    Calculated Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-display font-bold text-ink">
                      {completedFeedback.score}
                    </span>
                    <span className="text-sm text-ink-mute font-medium">
                      / {completedFeedback.maxScore}
                    </span>
                  </div>
                </div>

                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-center ${completedFeedback.badgeStyle}`}>
                  {completedFeedback.level}
                </span>
              </div>

              {/* Progress visual */}
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-line/40">
                <div
                  className="bg-lavender h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(8, percentage))}%` }}
                />
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-sm font-medium text-ink">{completedFeedback.summary}</p>
                <p className="text-xs text-ink-soft leading-relaxed">{completedFeedback.guidance}</p>
              </div>
            </div>

            {/* Suggested Wellness Exercises */}
            <div>
              <h3 className="font-display text-base font-semibold text-ink mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-lavender" /> Recommended Coping Exercises
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {completedFeedback.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-line bg-surface hover:border-lavender/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                        {ex.icon === 'wind' && <Wind className="h-4 w-4 text-lavender" />}
                        {ex.icon === 'journal' && <BookOpen className="h-4 w-4 text-teal-600" />}
                        {ex.icon === 'chat' && <MessageSquare className="h-4 w-4 text-lavender" />}
                        {ex.icon === 'heart' && <Heart className="h-4 w-4 text-coral" />}
                        <span>{ex.title}</span>
                      </div>
                      <p className="text-xs text-ink-mute mt-1.5 leading-relaxed">
                        {ex.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(ex.path)}
                      className="btn-ghost !py-1.5 !px-3 text-xs mt-3 self-start text-lavender font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      {ex.actionText} <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3.5 rounded-xl bg-surface-2/40 border border-line text-[11.5px] text-ink-mute leading-relaxed">
              <strong>Educational Disclaimer:</strong> This assessment is an informational self-check, not a psychiatric diagnosis or medical prescription. If you are experiencing distress, please reach out to trusted friends, a campus counselor, or national helplines like Tele-MANAS (<strong>14416</strong>) or <strong>988</strong>.
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard/wellness')}
                className="btn-primary"
              >
                Go to Wellness Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-ghost"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

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
