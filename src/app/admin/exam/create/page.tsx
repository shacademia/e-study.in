'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import ExamBuilderContainer from '../containers/ExamBuilderContainer';

const EnhancedExamBuilderPage = () => {
  const router = useRouter();

  return (
    <ExamBuilderContainer
      onBack={() => router.back()}
    />
  );
};

export default EnhancedExamBuilderPage;