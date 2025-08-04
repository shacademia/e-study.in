'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UsedQuestionsContextType {
  usedQuestionIds: Set<string>;
  addUsedQuestions: (questionIds: string[]) => void;
  removeUsedQuestions: (questionIds: string[]) => void;
  clearUsedQuestions: () => void;
  isQuestionUsed: (questionId: string) => boolean;
  getUsedQuestionsCount: () => number;
  initializeFromExam: (examId: string) => Promise<void>;
  resetUsedQuestionsForNewExam: () => void;
  initializeFromExamData: (examData: {
    sections?: Array<{
      questions?: Array<{ questionId: string }>;
    }>;
    questions?: Array<{ questionId: string }>;
  }) => void;
}

const UsedQuestionsContext = createContext<UsedQuestionsContextType | undefined>(undefined);

interface UsedQuestionsProviderProps {
  children: ReactNode;
}

export const UsedQuestionsProvider: React.FC<UsedQuestionsProviderProps> = ({ children }) => {
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

  const addUsedQuestions = useCallback((questionIds: string[]) => {
    setUsedQuestionIds(prev => {
      const newSet = new Set(prev);
      questionIds.forEach(id => newSet.add(id));
      console.log(`🎯 Added ${questionIds.length} questions to global used questions. Total: ${newSet.size}`);
      return newSet;
    });
  }, []);

  const removeUsedQuestions = useCallback((questionIds: string[]) => {
    setUsedQuestionIds(prev => {
      const newSet = new Set(prev);
      questionIds.forEach(id => newSet.delete(id));
      console.log(`🗑️ Removed ${questionIds.length} questions from global used questions. Total: ${newSet.size}`);
      return newSet;
    });
  }, []);

  const clearUsedQuestions = useCallback(() => {
    setUsedQuestionIds(new Set());
    console.log('🧹 Cleared all used questions from global context');
  }, []);

  const isQuestionUsed = useCallback((questionId: string) => {
    return usedQuestionIds.has(questionId);
  }, [usedQuestionIds]);

  const getUsedQuestionsCount = useCallback(() => {
    return usedQuestionIds.size;
  }, [usedQuestionIds]);

  const initializeFromExam = useCallback(async (examId: string) => {
    // This function will be implemented later to fetch used questions for an exam
    console.log(`Initializing used questions from exam ID: ${examId}`);
    // Example: setUsedQuestionIds(new Set(await fetchExamUsedQuestions(examId)));
  }, []);

  const resetUsedQuestionsForNewExam = useCallback(() => {
    setUsedQuestionIds(new Set());
    console.log('🧹 Reset used questions for a new exam.');
  }, []);

  const initializeFromExamData = useCallback((examData: {
    sections?: Array<{
      questions?: Array<{ questionId: string }>;
    }>;
    questions?: Array<{ questionId: string }>;
  }) => {
    const allQuestions: string[] = [];
    if (examData.sections) {
      examData.sections.forEach(section => {
        if (section.questions) {
          section.questions.forEach(q => allQuestions.push(q.questionId));
        }
      });
    }
    if (examData.questions) {
      examData.questions.forEach(q => allQuestions.push(q.questionId));
    }
    setUsedQuestionIds(new Set(allQuestions));
    console.log(`Initialized used questions from exam data. Total: ${allQuestions.length}`);
  }, []);

  const value: UsedQuestionsContextType = {
    usedQuestionIds,
    addUsedQuestions,
    removeUsedQuestions,
    clearUsedQuestions,
    isQuestionUsed,
    getUsedQuestionsCount,
    initializeFromExam,
    resetUsedQuestionsForNewExam,
    initializeFromExamData,
  };

  return (
    <UsedQuestionsContext.Provider value={value}>
      {children}
    </UsedQuestionsContext.Provider>
  );
};

export const useUsedQuestions = (): UsedQuestionsContextType => {
  const context = useContext(UsedQuestionsContext);
  if (context === undefined) {
    throw new Error('useUsedQuestions must be used within a UsedQuestionsProvider');
  }
  return context;
}; 