'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExamPreviewContainer from '../../containers/ExamPreviewContainer';

const ExamPreviewPage = () => {
  const params = useParams();
  const examId = params?.examId as string;

  return <ExamPreviewContainer examId={examId} />;
};

export default ExamPreviewPage;
