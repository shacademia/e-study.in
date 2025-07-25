'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExamEditContainer from '../../containers/ExamEditContainer';

const ExamEditPage = () => {
  const params = useParams();
  const examId = params?.examId as string;

  return <ExamEditContainer examId={examId} />;
};

export default ExamEditPage;
