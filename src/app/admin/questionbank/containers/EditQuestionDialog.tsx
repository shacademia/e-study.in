'use client';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuestionForm } from '../components/forms/QuestionForm';
import { Question } from '@/constants/types';

interface EditQuestionDialogProps {
  question: Question | null;
  onClose: () => void;
  onQuestionChange: (question: Question) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const EditQuestionDialog: React.FC<EditQuestionDialogProps> = ({
  question,
  onClose,
  onQuestionChange,
  onSubmit,
  isSubmitting
}) => {
  if (!question) return null;

  return (
    <Dialog open={!!question} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the details of this question.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <QuestionForm
            question={question}
            onChange={(updatedQuestion) => {
              onQuestionChange(updatedQuestion as Question);
            }}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            isEditMode
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
