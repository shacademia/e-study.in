'use client';

import React from 'react';
import { Question } from '@/constants/types';
import { QuestionCard } from '../QuestionCard';

interface QuestionGridProps {
  questions: Question[];
  selectedQuestions?: Set<string>;
  multiSelect?: boolean;
  onSelectQuestion?: (questionId: string) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onDuplicateQuestion: (questionId: string) => Promise<void>;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  selectedQuestions = new Set(),
  multiSelect = false,
  onSelectQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          isSelected={selectedQuestions.has(question.id)}
          multiSelect={multiSelect}
          onSelect={onSelectQuestion}
          onEdit={onEditQuestion}
          onDelete={onDeleteQuestion}
          onDuplicate={onDuplicateQuestion}
          viewMode="grid"
        />
      ))}
    </div>
  );
};
