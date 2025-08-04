'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import AddQuestionsSection from '../components/AddQuestionsSection';
import ExamBuilderHeader from './components/ExamBuilderHeader';
import ExamDetailsForm from './components/ExamDetailsForm';
import SectionsManager from './components/SectionsManager';
import { useExamBuilder } from './hooks/useExamBuilder';
import { Exam, Question } from '@/constants/types';
import { toast } from '@/hooks/use-toast';

interface EnhancedExamBuilderProps {
  onBack: () => void;
  editingExam?: Partial<Exam>;
  availableQuestions?: Question[];
}

// Error Fallback Component
const ErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ error, resetError }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="max-w-md w-full mx-4">
      <CardContent className="pt-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-4">
            {error.message || 'An unexpected error occurred while loading the exam builder.'}
          </p>
          <Button onClick={resetError} className="cursor-pointer">
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Loading Component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="max-w-md w-full mx-4">
      <CardContent className="pt-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Exam Builder
          </h3>
          <p className="text-gray-600">
            Please wait while we load the exam builder...
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const EnhancedExamBuilderContent: React.FC<EnhancedExamBuilderProps> = ({
  onBack,
  editingExam,
  availableQuestions
}) => {
  const {
    examDetails,
    setExamDetails,
    sections,
    questions,
    activeSection,
    showQuestionSelector,
    setActiveSection,
    setShowQuestionSelector,
    handleAddSection,
    handleDeleteSection,
    handleUpdateSection,
    handleRemoveQuestion,
    handleSaveExam,
    getTotalQuestions,
    getTotalMarks,
    loading
  } = useExamBuilder({ editingExam, availableQuestions });

  const handleSaveDraft = async () => {
    try {
      await handleSaveExam('draft');
      toast({
        title: "Success",
        description: "Exam saved as draft successfully",
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast({
        title: "Error",
        description: "Failed to save exam as draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    try {
      await handleSaveExam('published');
      toast({
        title: "Success",
        description: "Exam published successfully",
      });
    } catch (error) {
      console.error('Failed to publish exam:', error);
      toast({
        title: "Error",
        description: "Failed to publish exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    // Navigate to preview page if exam is saved
    if (editingExam?.id) {
      window.open(`/admin/exam/${editingExam.id}/preview`, '_blank');
    } else {
      toast({
        title: "Info",
        description: "Please save the exam first to preview it.",
        variant: "default",
      });
    }
  };

  const handleQuestionsAdded = (addedQuestions: Question[], totalAdded: number) => {
    try {
      const currentSection = sections[activeSection];
      if (!currentSection) {
        throw new Error('No active section found');
      }

      const updatedQuestions = [...(currentSection.questions || []), ...addedQuestions];
      // Calculate total marks by summing up positiveMarks from all questions
      const updatedMarks = updatedQuestions.reduce((total, question) => {
        return total + (question.positiveMarks || question.marks || 1);
      }, 0);

      handleUpdateSection(currentSection.id, {
        questions: updatedQuestions,
        marks: updatedMarks,
        questionsCount: updatedQuestions.length
      });

      toast({
        title: "Success",
        description: `Added ${totalAdded} questions to "${currentSection.name}"`,
      });

      setShowQuestionSelector(false);
    } catch (error) {
      console.error('Failed to add questions:', error);
      toast({
        title: "Error",
        description: "Failed to add questions. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with exam overview and actions */}
      <ExamBuilderHeader
        examTitle={examDetails.title || 'Untitled Exam'}
        sections={sections}
        onBack={onBack}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onPreview={handlePreview}
        loading={loading}
        isEditing={!!editingExam?.id}
        duration={examDetails.duration}
      />

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-6 py-6 mb-4">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className='cursor-pointer'>Exam Details</TabsTrigger>
            <TabsTrigger value="sections" className='cursor-pointer'>Sections & Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <ExamDetailsForm
              examDetails={examDetails}
              setExamDetails={setExamDetails}
              totalMarks={getTotalMarks()}
            />
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <SectionsManager
              sections={sections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              onAddSection={handleAddSection}
              onDeleteSection={handleDeleteSection}
              onUpdateSection={handleUpdateSection}
              onRemoveQuestion={handleRemoveQuestion}
              onAddQuestions={() => setShowQuestionSelector(true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Questions Dialog */}
      {showQuestionSelector && (
        <AddQuestionsSection
          examId={editingExam?.id}
          sectionId={sections[activeSection]?.id}
          section={sections[activeSection]}
          availableQuestions={questions}
          isOpen={showQuestionSelector}
          mode="dialog"
          onClose={() => setShowQuestionSelector(false)}
          onQuestionsAdded={handleQuestionsAdded}
        />
      )}
    </div>
  );
};

// Error Boundary Component
const EnhancedExamBuilder: React.FC<EnhancedExamBuilderProps> = (props) => {
  try {
    return <EnhancedExamBuilderContent {...props} />;
  } catch (error) {
    console.error('EnhancedExamBuilder error:', error);
    return <ErrorFallback error={error as Error} resetError={() => window.location.reload()} />;
  }
};

// Wrap with React.memo for performance optimization
const MemoizedEnhancedExamBuilder = React.memo(EnhancedExamBuilder);

// Production-ready export with error boundary
const EnhancedExamBuilderWithErrorBoundary: React.FC<EnhancedExamBuilderProps> = (props) => {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <MemoizedEnhancedExamBuilder {...props} />
    </React.Suspense>
  );
};

export default EnhancedExamBuilderWithErrorBoundary;
