'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Trash2, Clock, RefreshCw } from 'lucide-react';
import { ExamFilter } from '../types';
import { Exam } from '@/constants/types';

interface ExamManagementHeaderProps {
  examFilter: ExamFilter;
  refreshingData: boolean;
  deletingAllExams: boolean;
  exams: Exam[];
  onFilterChange: (filter: ExamFilter) => void;
  onRefresh: () => void;
  onShowQuestionBank: () => void;
  onRemoveAllExams: () => void;
  onCreateExam: () => void;
}

export const ExamManagementHeader: React.FC<ExamManagementHeaderProps> = ({
  examFilter,
  refreshingData,
  deletingAllExams,
  exams,
  onFilterChange,
  onRefresh,
  onShowQuestionBank,
  onRemoveAllExams,
  onCreateExam,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold">Exam Management</h2>
        <div className="flex space-x-2">
          <Button
            variant={examFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            disabled={refreshingData}
            onClick={() => onFilterChange('all')}
          >
            {refreshingData && examFilter === 'all' && (
              <Clock className="h-3 w-3 mr-1 animate-spin" />
            )}
            All Exams
          </Button>
          <Button
            variant={examFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            disabled={refreshingData}
            onClick={() => onFilterChange('published')}
          >
            {refreshingData && examFilter === 'published' && (
              <Clock className="h-3 w-3 mr-1 animate-spin" />
            )}
            Published
          </Button>
          <Button
            variant={examFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            disabled={refreshingData}
            onClick={() => onFilterChange('draft')}
          >
            {refreshingData && examFilter === 'draft' && (
              <Clock className="h-3 w-3 mr-1 animate-spin" />
            )}
            Draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={refreshingData}
            onClick={onRefresh}
            title="Refresh exam data"
          >
            <RefreshCw className={`h-3 w-3 ${refreshingData ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={onShowQuestionBank}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Question Bank
        </Button>
        {exams.length > 0 && (
          <Button
            variant="outline"
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onRemoveAllExams}
            disabled={deletingAllExams || refreshingData}
          >
            {deletingAllExams ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove All Exams
              </>
            )}
          </Button>
        )}
        <Button onClick={onCreateExam} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>
    </div>
  );
};
