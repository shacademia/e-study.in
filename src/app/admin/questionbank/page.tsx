'use client';

import React from 'react';
import QuestionBank from './QuestionBank';

import { useRouter } from 'next/navigation';

const QuestionBankPage = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigates to the previous page
  };

  return <QuestionBank onBack={handleBack} />;
};
export default QuestionBankPage;