import React from 'react';
import EnhancedExamBuilder from '../create/EnhancedExamBuilder';
import { Exam, Question } from '@/constants/types';

interface ExamBuilderContainerProps {
  onBack: () => void;
  editingExam?: Partial<Exam>;
  availableQuestions?: Question[];
}

const ExamBuilderContainer: React.FC<ExamBuilderContainerProps> = ({
  onBack,
  editingExam,
  availableQuestions
}) => {
  return (
    <EnhancedExamBuilder
      onBack={onBack}
      editingExam={editingExam}
      availableQuestions={availableQuestions}
    />
  );
};

export default ExamBuilderContainer;
