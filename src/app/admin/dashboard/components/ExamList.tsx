'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { ExamCard } from './ExamCard';
import { Exam } from '@/constants/types';
import { ExamFilter } from '../types';

interface ExamListProps {
  exams: Exam[];
  examFilter: ExamFilter;
  publishingExamId: string | null;
  refreshingData: boolean;
  onTogglePublish: (examId: string, isPublished: boolean) => void;
  onDuplicate: () => void;
  onEdit: (exam: Exam) => void;
  onDelete: (examId: string) => void;
}

export const ExamList: React.FC<ExamListProps> = ({
  exams,
  examFilter,
  publishingExamId,
  refreshingData,
  onTogglePublish,
  onDuplicate,
  onEdit,
  onDelete,
}) => {
  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">
            {examFilter === 'all'
              ? 'No exams found. Create your first exam to get started!'
              : `No ${examFilter} exams found.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 relative">
      {refreshingData && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg border">
            <Clock className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Refreshing exam data...
            </span>
          </div>
        </div>
      )}
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          publishingExamId={publishingExamId}
          refreshingData={refreshingData}
          onTogglePublish={onTogglePublish}
          onDuplicate={onDuplicate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
