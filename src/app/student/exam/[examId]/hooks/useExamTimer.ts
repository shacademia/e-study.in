import { useEffect, useCallback } from "react";
import { Exam } from "@/constants/types";
import { ExamTimerState } from "../types";

interface UseExamTimerProps {
  exam: Exam | null;
  timerState: ExamTimerState;
  setTimerState: React.Dispatch<React.SetStateAction<ExamTimerState>>;
  handleSubmitExam: () => void;
}

export const useExamTimer = ({
  exam,
  timerState,
  setTimerState,
  handleSubmitExam,
}: UseExamTimerProps) => {

  // Timer effect
  useEffect(() => {
    if (timerState.examStarted && timerState.startTime && exam?.timeLimit) {
      const timer = setInterval(() => {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - timerState.startTime!.getTime()) / 1000);
        const totalAllowedSeconds = exam.timeLimit * 60;
        const remainingSeconds = totalAllowedSeconds - elapsedSeconds;

        if (remainingSeconds <= 0) {
          clearInterval(timer);
          setTimerState(prev => ({ ...prev, timeLeft: 0 }));
          handleSubmitExam();
        } else {
          setTimerState(prev => ({ ...prev, timeLeft: remainingSeconds }));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timerState.examStarted, timerState.startTime, exam, handleSubmitExam, setTimerState]);

  // Track question time start
  useEffect(() => {
    if (timerState.examStarted && !timerState.questionStartTime && exam) {
      setTimerState(prev => ({
        ...prev,
        questionStartTime: new Date(),
      }));
    }
  }, [timerState.examStarted, timerState.questionStartTime, exam, setTimerState]);

  const resetQuestionTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      questionStartTime: new Date(),
    }));
  }, [setTimerState]);

  return {
    resetQuestionTimer,
  };
};
