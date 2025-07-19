import React from 'react';
import { useParams } from 'next/navigation';
import ExamResults from './ExamResults';

const ExamResultsPage = () => {
  const params = useParams();
  const examId = params?.examId as string;

  return <ExamResults examId={examId} />;
};

export default ExamResultsPage;
