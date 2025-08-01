import { useState, useCallback } from 'react';

export const useQuestionSelection = () => {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedQuestions(new Set());
  }, []);

  return {
    selectedQuestions,
    toggleSelection,
    clearSelection,
    selectedCount: selectedQuestions.size
  };
};
