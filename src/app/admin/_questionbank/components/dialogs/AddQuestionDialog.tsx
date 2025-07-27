'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QuestionFormState } from '../../types';

interface AddQuestionDialogProps {
  isOpen: boolean;
  isCreating: boolean;
  newQuestion: QuestionFormState;
  onClose: () => void;
  onSubmit: () => Promise<boolean>;
  onQuestionChange: (question: QuestionFormState) => void;
}

export const AddQuestionDialog: React.FC<AddQuestionDialogProps> = ({
  isOpen,
  isCreating,
  newQuestion,
  onClose,
  onSubmit,
  onQuestionChange
}) => {
  const handleSubmit = async () => {
    const success = await onSubmit();
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for your question bank
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* TODO: Implement QuestionForm component */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Question form component will be implemented here...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Current question: {JSON.stringify(newQuestion, null, 2)}
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isCreating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isCreating}
              className="cursor-pointer"
            >
              {isCreating ? 'Creating...' : 'Add Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
