import React, { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play, BookOpen, Target, Clock, X, FileText, AlertTriangle, 
  User, Shield, CheckCircle2, Eye, Sparkles
} from "lucide-react";

interface StartExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam: () => void;
  exam: {
    name: string;
    instructions?: string;
    timeLimit: number;
    totalMarks: number;
    questionsCount?: number;
    isPasswordProtected?: boolean;
  };
}

const StartExamDialog: React.FC<StartExamDialogProps> = memo(({
  isOpen,
  onClose,
  onStartExam,
  exam
}) => {
  const systemInstructions = [
    "Ensure you have a stable internet connection throughout the exam",
    "Do not refresh or close the browser tab during the exam", 
    "You cannot go back to previous questions once submitted",
    "The exam will auto-submit when time expires",
    "Switching tabs or minimizing the window may be monitored"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-xs sm:max-w-lg md:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50/50 to-gray-50/30 border-slate-200/60 shadow-2xl mx-auto">
        {/* Header */}
        <DialogHeader className="text-center pb-3 sm:pb-4 border-b border-slate-200/60">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2 px-2">
            Ready to Start?
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-slate-600 px-2">
            Please read the instructions carefully before beginning your exam
          </DialogDescription>
        </DialogHeader>

        {/* Exam Info */}
        <div className="py-4 sm:py-6 space-y-4 sm:space-y-6 px-1 sm:px-0">
          {/* Exam Title & Stats */}
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center justify-center gap-2 px-2">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-[-25px] sm:mt-0" />
              <span className="break-words">{exam.name}</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Badge variant="secondary" className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">{exam.timeLimit} minutes</span>
              </Badge>
              <Badge variant="secondary" className="px-3 py-2 sm:px-4 sm:py-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">{exam.totalMarks} marks</span>
              </Badge>
              {exam.questionsCount && (
                <Badge variant="secondary" className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-50 text-purple-700 border-purple-200">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="text-xs sm:text-sm">{exam.questionsCount} questions</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Instructor Instructions */}
          {exam.instructions && exam.instructions.trim() && (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-200/60 shadow-sm">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <h4 className="text-sm sm:text-base font-semibold text-blue-800">Instructions from Instructor</h4>
              </div>
              <div className="text-xs sm:text-sm text-blue-700 leading-relaxed whitespace-pre-wrap break-words">
                {exam.instructions}
              </div>
            </div>
          )}

          {/* System Instructions */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-amber-200/60 shadow-sm">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
              <h4 className="text-sm sm:text-base font-semibold text-amber-800">System Guidelines</h4>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              {systemInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-amber-700">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Password Protection Notice */}
          {exam.isPasswordProtected && (
            <div className="bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-red-200/60 shadow-sm">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-red-800">Password Required</p>
                  <p className="text-xs text-red-700 mt-0.5">You&apos;ll be prompted for the exam password after clicking Start</p>
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 rounded-xl p-3 sm:p-4 border border-slate-300/60">
            <div className="flex items-start gap-2 sm:gap-3">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-slate-700 min-w-0">
                <p className="font-semibold mb-1">Important Notice:</p>
                <p className="leading-relaxed">Once you start the exam, the timer begins immediately. Make sure you&apos;re ready and have adequate time to complete it.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200/60">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 md:mr-2 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={onStartExam}
            className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 hover:shadow-xl cursor-pointer"
          >
            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Start Exam
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

StartExamDialog.displayName = "StartExamDialog";
export default StartExamDialog;
