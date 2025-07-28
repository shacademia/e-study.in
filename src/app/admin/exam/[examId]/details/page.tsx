'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExamDetailsContainer from '../../containers/ExamDetailsContainer';

const ExamDetailsPage = () => {
  const params = useParams();
  const examId = params?.examId as string;

  return <ExamDetailsContainer examId={examId} />;
};

export default ExamDetailsPage;
