'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Question } from '@/constants/types';

interface EditQuestionDialogProps {
  isOpen: boolean;
  isUpdating: boolean;
  question: Question | null;
  onClose: () => void;
  onSubmit: (question: Question) => Promise<boolean>;
  onQuestionChange: (question: Question | null) => void;
}

export const EditQuestionDialog: React.FC<EditQuestionDialogProps> = ({
  isOpen,
  isUpdating,
  question,
  onClose,
  onSubmit,
  onQuestionChange
}) => {
  const handleSubmit = async () => {
    if (!question) return;
    const success = await onSubmit(question);
    if (success) {
      onClose();
    }
  };

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* TODO: Implement QuestionForm component */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Question edit form component will be implemented here...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Current question: {question?.content}
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isUpdating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isUpdating}
              className="cursor-pointer"
            >
              {isUpdating ? 'Updating...' : 'Update Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
