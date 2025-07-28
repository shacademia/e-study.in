import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, BookOpen } from 'lucide-react';
import { generateExamSummary } from '../utils/examUtils';
import { ExamSection } from '@/constants/types';

interface ExamBuilderHeaderProps {
  examTitle: string;
  sections: ExamSection[];
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview: () => void;
  loading: boolean;
  isEditing: boolean;
}

const ExamBuilderHeader: React.FC<ExamBuilderHeaderProps> = ({
  examTitle,
  sections,
  onBack,
  onSaveDraft,
  onPublish,
  onPreview,
  loading,
  isEditing
}) => {
  const examSummary = generateExamSummary(sections);

  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Exam' : 'Create New Exam'}
              </h1>
              {examTitle && (
                <p className="text-sm text-gray-600">{examTitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onPreview}
              disabled={loading || examSummary.totalQuestions === 0}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={loading}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={onPublish}
              disabled={loading || examSummary.totalQuestions === 0}
              className="flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {loading ? 'Publishing...' : isEditing ? 'Update & Publish' : 'Publish Exam'}
            </Button>
          </div>
        </div>

        {/* Compact Exam Overview */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Overview:</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-blue-600">{examSummary.sectionsCount}</span>
                <span className="text-sm text-gray-600">Sections</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-green-600">{examSummary.totalQuestions}</span>
                <span className="text-sm text-gray-600">Questions</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-purple-600">{examSummary.totalMarks}</span>
                <span className="text-sm text-gray-600">Total Marks</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-orange-600">{examSummary.totalTime}</span>
                <span className="text-sm text-gray-600">Total Time</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-red-600">{examSummary.averageQuestionsPerSection}</span>
                <span className="text-sm text-gray-600">Avg Q/Section</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-indigo-600">{examSummary.averageMarksPerQuestion}</span>
                <span className="text-sm text-gray-600">Marks/Question</span>
              </div>
            </div>

            {/* Difficulty Distribution - Compact */}
            {examSummary.totalQuestions > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                {examSummary.difficultyDistribution.EASY > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1">
                    Easy: {examSummary.difficultyDistribution.EASY}
                  </Badge>
                )}
                {examSummary.difficultyDistribution.MEDIUM > 0 && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs px-2 py-1">
                    Medium: {examSummary.difficultyDistribution.MEDIUM}
                  </Badge>
                )}
                {examSummary.difficultyDistribution.HARD > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-1">
                    Hard: {examSummary.difficultyDistribution.HARD}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamBuilderHeader;
