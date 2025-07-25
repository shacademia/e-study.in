import React from "react";
import { ExamCard, NoExamsMessage } from "./";
import { ExamsSectionProps } from "../types";

const ExamsSection: React.FC<ExamsSectionProps> = ({
  availableExams,
  completedExams,
  userStats,
  onStartExam,
  onViewResults
}) => {
  return (
    <div className="lg:col-span-2">
      <div className="space-y-6">
        {/* Available Exams */}
        {availableExams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Exams
            </h2>
            <div className="space-y-4">
              {availableExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  isCompleted={false}
                  onStartExam={onStartExam}
                  onViewResults={onViewResults}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Exams */}
        {completedExams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Completed Exams
            </h2>
            <div className="space-y-4">
              {completedExams.map((exam) => {
                const submission = userStats?.recentSubmissions?.find(
                  (sub) => sub.examId === exam.id
                );
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
              })}
            </div>
          </div>
        )}

        {/* No Exams Available */}
        {availableExams.length === 0 && completedExams.length === 0 && (
          <NoExamsMessage type="none" />
        )}
      </div>
    </div>
  );
};

export default ExamsSection;
