import React from 'react';
import ExamResults from '../ExamResults';

interface ExamResultsContainerProps {
  params: { examId: string };
}

const ExamResultsContainer: React.FC<ExamResultsContainerProps> = ({ params }) => {
  return <ExamResults examId={params.examId} />;
};

export default ExamResultsContainer;
