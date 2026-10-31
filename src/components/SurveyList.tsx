import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSurvey } from '../contexts/SurveyContext';
import { ClipboardCheck, ArrowRight, CheckCircle, TrendingDown, TrendingUp, Minus, History, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { SurveyResponse, SurveyResult } from '../types';

function computeScore(responses: SurveyResponse[]): number {
  return responses.reduce((sum, r) => sum + (typeof r.answer === 'number' ? r.answer : 0), 0);
}

function getMaxScore(surveyId: string): number {
  return surveyId.toLowerCase().includes('gad7') ? 21 : 27;
}

function getSeverity(surveyId: string, score: number) {
  if (surveyId.toLowerCase().includes('gad7')) {
    if (score <= 4) return { text: 'Minimal Anxiety', style: 'text-teal-700 bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300' };
    if (score <= 9) return { text: 'Mild Anxiety', style: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300' };
    if (score <= 14) return { text: 'Moderate Anxiety', style: 'text-orange-700 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300' };
    return { text: 'Elevated Anxiety', style: 'text-rose-700 bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300' };
  }
  // PHQ-9
  if (score <= 4) return { text: 'Minimal Symptoms', style: 'text-teal-700 bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300' };
  if (score <= 9) return { text: 'Mild Symptoms', style: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300' };
  if (score <= 14) return { text: 'Moderate Symptoms', style: 'text-orange-700 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300' };
  return { text: 'Elevated Symptoms', style: 'text-rose-700 bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300' };
}

const SurveyList: React.FC = () => {
  const { surveys, surveyResults } = useSurvey();
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const toggleHistory = (surveyId: string) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [surveyId]: !prev[surveyId],
    }));
  };

  return (
    <div className="card rounded-2xl p-6 sm:p-8">
      <div className="pb-6 border-b border-line">
        <p className="eyebrow">Assessments & Tracking</p>
        <h2 className="font-display text-2xl font-semibold text-ink mt-1">
          Standardized Screenings & Progress
        </h2>
        <p className="text-sm text-ink-mute mt-1">
          Clinically standardized informational questionnaires. Track your previous assessments and symptom improvements over time.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {surveys.map((survey) => {
          const history = surveyResults
            .filter((r) => r.surveyId === survey.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          const latestResult = history[0];
          const previousResult = history[1];
          const maxScore = getMaxScore(survey.id);

          const latestScore = latestResult ? computeScore(latestResult.responses) : null;
          const prevScore = previousResult ? computeScore(previousResult.responses) : null;
          const latestSeverity = latestScore !== null ? getSeverity(survey.id, latestScore) : null;

          const scoreDiff = latestScore !== null && prevScore !== null ? latestScore - prevScore : null;
          const isExpanded = Boolean(expandedHistory[survey.id]);

          return (
            <div
              key={survey.id}
              className="p-5 sm:p-6 rounded-2xl border border-line bg-surface hover:border-lavender/50 card-hover transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-lavender-soft text-lavender-deep flex items-center justify-center shrink-0">
                      <ClipboardCheck className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-semibold text-ink text-base">
                      {survey.title}
                    </h3>
                  </div>

                  <p className="text-sm text-ink-mute mt-2 leading-relaxed">
                    {survey.description}
                  </p>

                  {/* Latest Score & Improvement Section */}
                  {latestResult && latestScore !== null && latestSeverity && (
                    <div className="mt-4 pt-3 border-t border-line/60 flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink">
                          Latest Score: {latestScore}/{maxScore}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${latestSeverity.style}`}>
                          {latestSeverity.text}
                        </span>
                      </div>

                      {/* Comparison / Improvement Badge */}
                      {scoreDiff !== null && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium">
                          {scoreDiff < 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                              <TrendingDown className="h-3 w-3" />
                              Improved by {Math.abs(scoreDiff)} pt{Math.abs(scoreDiff) > 1 ? 's' : ''}
                            </span>
                          ) : scoreDiff === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-2 text-ink-mute border border-line">
                              <Minus className="h-3 w-3" /> Steady baseline
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              <TrendingUp className="h-3 w-3" /> +{scoreDiff} pts from previous
                            </span>
                          )}
                        </div>
                      )}

                      <span className="text-[11px] text-ink-mute ml-auto">
                        Last completed: {format(new Date(latestResult.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                  <Link
                    to={`/survey/${survey.id}`}
                    className="btn-primary !py-2 !px-4 text-xs shrink-0 self-start sm:self-center"
                  >
                    <span>{latestResult ? 'Retake screening' : 'Start screening'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {history.length > 1 && (
                    <button
                      type="button"
                      onClick={() => toggleHistory(survey.id)}
                      className="text-xs text-lavender hover:underline font-medium inline-flex items-center gap-1 mt-1"
                    >
                      <History className="h-3 w-3" />
                      <span>{isExpanded ? 'Hide history' : `View past history (${history.length})`}</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible History of Past Screenings */}
              {isExpanded && history.length > 1 && (
                <div className="mt-4 pt-3 border-t border-line space-y-2">
                  <p className="text-xs font-semibold text-ink">Past Assessment Timeline</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {history.map((record, idx) => {
                      const recordScore = computeScore(record.responses);
                      const recordSeverity = getSeverity(survey.id, recordScore);

                      return (
                        <div
                          key={record.id}
                          className="p-2.5 rounded-xl bg-surface-2/40 border border-line text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-ink">
                              {recordScore} / {maxScore}
                            </span>{' '}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${recordSeverity.style}`}>
                              {recordSeverity.text}
                            </span>
                            <p className="text-[10px] text-ink-mute mt-1">
                              {format(new Date(record.date), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          {idx === 0 && (
                            <span className="text-[10px] font-semibold text-lavender uppercase">
                              Latest
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SurveyList;
