import { useState, useCallback, useRef } from 'react';

export const useQuestionSelection = () => {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const lastToggleTime = useRef<{ [key: string]: number }>({});

  const toggleSelection = useCallback((questionId: string) => {
    const now = Date.now();
    const lastToggle = lastToggleTime.current[questionId] || 0;
    
    // Prevent rapid clicking (debounce)
    if (now - lastToggle < 20) {
      console.log(`⏱️ Debouncing rapid click for question: ${questionId}`);
      return;
    }
    
    lastToggleTime.current[questionId] = now;
    console.log(`🔄 Toggling selection for question: ${questionId}`);
    
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      const wasSelected = newSet.has(questionId);
      
      if (wasSelected) {
        newSet.delete(questionId);
        console.log(`❌ Removed question ${questionId} from selection`);
      } else {
        newSet.add(questionId);
        console.log(`✅ Added question ${questionId} to selection`);
      }
      
      console.log(`📊 Total selected: ${newSet.size}`);
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    console.log('🧹 Clearing all selections');
    setSelectedQuestions(new Set());
    lastToggleTime.current = {};
  }, []);

  return {
    selectedQuestions,
    toggleSelection,
    clearSelection,
    selectedCount: selectedQuestions.size
  };
};
