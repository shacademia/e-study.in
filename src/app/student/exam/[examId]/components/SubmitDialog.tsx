import React from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { SubmitDialogProps } from "../types";

const SubmitDialog: React.FC<SubmitDialogProps> = ({
  isOpen,
  answeredCount,
  markedForReviewCount,
  totalQuestions,
  onSubmit,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Exam</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to submit your exam?
            <br />
            • Answered: {answeredCount}/{totalQuestions} questions
            <br />
            • Marked for review: {markedForReviewCount} questions
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} className="cursor-pointer">
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SubmitDialog;
