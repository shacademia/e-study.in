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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Coffee className="h-5 w-5 mr-2" />
            Break Time
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-yellow-600">
              You&apos;re on a break. The timer continues in the background.
              Click &quot;Resume&quot; when you&apos;re ready to continue.
            </p>
          </div>
          <div className="text-center">
            <div className={`inline-block px-4 py-2 rounded-lg font-medium border-2 ${getTimeColor()}`}>
              <Clock className="h-5 w-5 mr-2 inline" />
              Time Remaining: {formatTime(timeLeft)}
            </div>
          </div>
          <Button
            onClick={onResume}
            className="w-full cursor-pointer"
          >
            <Play className="h-4 w-4 mr-2 mt-[2px]" />
            Resume Exam
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BreakModal;
