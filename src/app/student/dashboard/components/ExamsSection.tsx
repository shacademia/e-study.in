import React, { useState, useMemo } from "react";
import { ExamCard, NoExamsMessage } from "./";
import { ExamsSectionProps } from "../types";

const ExamsSection: React.FC<ExamsSectionProps> = ({
  availableExams,
  completedExams,
  userStats,
  onStartExam,
  onViewResults
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');

  const submissionsMap = useMemo(() => {
    const map = new Map<string, any>();
    userStats?.recentSubmissions?.forEach(submission => {
      map.set(submission.examId, submission);
    });
    return map;
  }, [userStats?.recentSubmissions]);

  const hasAvailableExams = availableExams.length > 0;
  const hasCompletedExams = completedExams.length > 0;

  return (
    <div className="lg:col-span-2">
      {/* Clean Tab Header */}
      <div className="border-b border-slate-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer
              ${activeTab === 'available'
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
              ${!hasAvailableExams ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={!hasAvailableExams}
          >
            Available Exams
            <span className="ml-2 bg-slate-100 text-slate-600 py-1 px-2 rounded-full text-xs">
              {availableExams.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer
              ${activeTab === 'completed'
                ? 'border-emerald-500 text-emerald-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
              ${!hasCompletedExams ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={!hasCompletedExams}
          >
            Completed Exams
            <span className="ml-2 bg-slate-100 text-slate-600 py-1 px-2 rounded-full text-xs">
              {completedExams.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'available' && (
          <div className="grid grid-cols-1 gap-6">
            {hasAvailableExams ? (
              availableExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  isCompleted={false}
                  onStartExam={onStartExam}
                  onViewResults={onViewResults}
                />
              ))
            ) : (
              <NoExamsMessage type="available" />
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="grid grid-cols-1 gap-6">
            {hasCompletedExams ? (
              completedExams.map((exam) => {
                const submission = submissionsMap.get(exam.id);
                return (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    submission={submission}
                    isCompleted={true}
                    onStartExam={onStartExam}
                    onViewResults={onViewResults}
                  />
                );
              })
            ) : (
              <NoExamsMessage type="completed" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamsSection;
