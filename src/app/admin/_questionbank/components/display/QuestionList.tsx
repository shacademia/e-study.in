'use client';

import React from 'react';
import { Question } from '@/constants/types';
import { QuestionCard } from '../QuestionCard';

interface QuestionListProps {
  questions: Question[];
  selectedQuestions?: Set<string>;
  multiSelect?: boolean;
  onSelectQuestion?: (questionId: string) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onDuplicateQuestion: (questionId: string) => Promise<void>;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestions = new Set(),
  multiSelect = false,
  onSelectQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion
}) => {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          isSelected={selectedQuestions.has(question.id)}
          multiSelect={multiSelect}
          onSelect={onSelectQuestion}
          onEdit={onEditQuestion}
          onDelete={(id) => onDeleteQuestion(id)}
          onDuplicate={(id) => onDuplicateQuestion(id)}
          viewMode="list"
        />
      ))}
    </div>
  );
};
