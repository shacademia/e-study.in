'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import EnhancedExamBuilder from './EnhancedExamBuilder';

const EnhancedExamBuilderPage = () => {
  const router = useRouter();

  return <EnhancedExamBuilder onBack={() => router.back()} />;
};

export default EnhancedExamBuilderPage;