'use client';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuestionForm } from '../components/forms/QuestionForm';
import { CreateQuestionRequest } from '@/constants/types';

interface AddQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: CreateQuestionRequest;
  onQuestionChange: (question: CreateQuestionRequest) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const AddQuestionDialog: React.FC<AddQuestionDialogProps> = ({
  isOpen,
  onClose,
  question,
  onQuestionChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for your question bank.
          </DialogDescription>
        </DialogHeader>
        
        <div className="">
          <QuestionForm
            question={question}
            onChange={onQuestionChange}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
