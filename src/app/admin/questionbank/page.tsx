'use client';

import React from 'react';
import EnhancedQuestionBank from './EnhancedQuestionBank';

import { useRouter } from 'next/navigation';

const EnhancedQuestionBankPage = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigates to the previous page
  };

  return <EnhancedQuestionBank onBack={handleBack} />;
};
export default EnhancedQuestionBankPage;