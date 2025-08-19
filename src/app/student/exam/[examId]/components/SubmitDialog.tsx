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
      <AlertDialogContent className="w-[95vw] max-w-md mx-auto px-4 sm:px-6 rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg font-medium">Submit Exam</AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base leading-relaxed text-start pl-2">
            Are you sure you want to submit your exam?
            <br className="hidden sm:block" />
            <span className="block mt-2 sm:mt-0 sm:inline text-start">• Answered: {answeredCount}/{totalQuestions} questions</span>
            <br className="hidden sm:block" />
            <span className="block mt-2 sm:mt-0 sm:inline text-start">• Marked for review: {markedForReviewCount} questions</span>
            <br className="hidden sm:block" />
            <span className="block mt-2 sm:mt-0 sm:inline text-start">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row justify-center sm:justify-end gap-3 sm:gap-2">
          <AlertDialogCancel onClick={onCancel} className="cursor-pointer w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} className="cursor-pointer w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3">
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SubmitDialog;
