import React from 'react';
import { Link } from 'react-router-dom';
import { useSurvey } from '../contexts/SurveyContext';
import { ClipboardCheck, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const SurveyList: React.FC = () => {
  const { surveys, getLatestSurveyResult } = useSurvey();

  return (
    <div className="card rounded-2xl p-6 sm:p-8">
      <div className="pb-6 border-b border-line">
        <p className="eyebrow">Assessments</p>
        <h2 className="font-display text-2xl font-semibold text-ink mt-1">
          Standardized Screenings
        </h2>
        <p className="text-sm text-ink-mute mt-1">
          Informational questionnaires. Completed responses are saved to your account, not only in this browser.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {surveys.map((survey) => {
          const latestResult = getLatestSurveyResult(survey.id);

          return (
            <div
              key={survey.id}
              className="p-5 rounded-xl border border-line bg-surface hover:border-lavender/50 card-hover transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-lavender-soft text-lavender-deep flex items-center justify-center shrink-0">
                      <ClipboardCheck className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-semibold text-ink text-base">
                      {survey.title}
                    </h3>
                  </div>
                  <p className="text-sm text-ink-mute mt-2">
                    {survey.description}
                  </p>

                  {latestResult && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-sage font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>
                        Last completed:{' '}
                        {format(new Date(latestResult.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/survey/${survey.id}`}
                  className="btn-primary !py-2 !px-4 text-xs shrink-0 self-start sm:self-center"
                >
                  <span>{latestResult ? 'Retake screening' : 'Start screening'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SurveyList;
