import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, BookOpen } from 'lucide-react';
import { generateExamSummary } from '../utils/examUtils';
import { ExamSection } from '@/constants/types';
import { useRouter } from 'next/navigation';

interface ExamBuilderHeaderProps {
  examTitle: string;
  sections: ExamSection[];
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void | Promise<void>;
  onPreview: () => void;
  loading: boolean;
  isEditing: boolean;
  duration: number;  
}

function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const min = minutes % 60;
  // Pad with leading zeros if needed
  const paddedHrs = String(hrs).padStart(2, '0');
  const paddedMin = String(min).padStart(2, '0');
  return `${paddedHrs}:${paddedMin}:00`;
}

const ExamBuilderHeader: React.FC<ExamBuilderHeaderProps> = ({
  examTitle,
  sections,
  onBack,
  onSaveDraft,
  onPublish,
  onPreview,
  loading,
  isEditing,
  duration,
}) => {
  const router = useRouter();
  const examSummary = generateExamSummary(sections);

  const handlePublish = async () => {
    try {
      await Promise.resolve(onPublish()); // This works for both sync and async
      router.replace('/admin/dashboard');
    } catch (error) {
      console.error('Publish failed:', error);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center cursor-pointer">
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
              className="flex items-center cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview (extra)
            </Button>
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={loading}
              className="flex items-center cursor-pointer"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={loading || examSummary.totalQuestions === 0}
              className="flex items-center cursor-pointer"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {loading ? 'Publishing...' : isEditing ? 'Update & Publish' : 'Publish Exam'}
            </Button>
          </div>
        </div>

        {/* Compact Exam Overview */}
        <div className="bg-white shadow-lg rounded-xl px-6 py-4 mb-2 border border-gray-100">
          <div className="flex items-center justify-between">
            {/* Left: Overview */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <span className="text-base font-semibold text-gray-800">Overview</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-purple-600">{examSummary.sectionsCount}</span>
                  <span className="text-xs text-gray-500">Sections</span>
                </div>
                <div className="w-px h-5 bg-gray-200 mx-2" />
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-green-600">{examSummary.totalQuestions}</span>
                  <span className="text-xs text-gray-500">Questions</span>
                </div>
                <div className="w-px h-5 bg-gray-200 mx-2" />
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-yellow-500">{examSummary.totalMarks}</span>
                  <span className="text-xs text-gray-500">Total Marks</span>
                </div>
                <div className="w-px h-5 bg-gray-200 mx-2" />
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-blue-500">{formatDuration(duration)}</span>
                  <span className="text-xs text-gray-500">Total Time</span>
                </div>
              </div>
            </div>
            {/* Right: Difficulty */}
            {examSummary.totalQuestions > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-800">Difficulty:</span>
                {examSummary.difficultyDistribution.EASY > 0 && (
                  <span className="rounded-full bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 font-medium">
                    Easy: {examSummary.difficultyDistribution.EASY}
                  </span>
                )}
                {examSummary.difficultyDistribution.MEDIUM > 0 && (
                  <span className="rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs px-3 py-1 font-medium">
                    Medium: {examSummary.difficultyDistribution.MEDIUM}
                  </span>
                )}
                {examSummary.difficultyDistribution.HARD > 0 && (
                  <span className="rounded-full bg-red-50 text-red-700 border border-red-200 text-xs px-3 py-1 font-medium">
                    Hard: {examSummary.difficultyDistribution.HARD}
                  </span>
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
