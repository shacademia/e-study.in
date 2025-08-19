import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coffee, Play, Clock } from "lucide-react";
import { BreakModalProps } from "../types";

const BreakModal: React.FC<BreakModalProps> = ({
  isOpen,
  timeLeft,
  formatTime,
  getTimeColor,
  onResume,
}) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="[&>button:last-child]:hidden w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-base sm:text-lg">
            <Coffee className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            Break Time
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-gray-100 rounded-lg">
            <p className="text-xs sm:text-sm text-yellow-600 leading-relaxed">
              You&apos;re on a break. The timer continues in the background.
              Click &quot;Resume&quot; when you&apos;re ready to continue.
            </p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg font-medium border-2 text-sm sm:text-base ${getTimeColor()}`}>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">
                <span className="hidden sm:inline">Time Remaining: </span>
                <span className="sm:hidden">Time: </span>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <Button
            onClick={onResume}
            className="w-full cursor-pointer text-sm sm:text-base py-2 sm:py-3"
          >
            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Resume Exam</span>
            <span className="sm:hidden">Resume</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BreakModal;
