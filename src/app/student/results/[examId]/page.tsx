"use client";
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ExamResults from './ExamResults';
import { useResult } from '@/context/ResultContext';

const ExamResultsPage = () => {
  const params = useParams();
  const submissionId = params?.examId as string;
  const { fetchResultData } = useResult();

  useEffect(() => {
    if (submissionId) {
      fetchResultData(submissionId);
    }
  }, []);

  // console.log("ExamResultsPage - ResultData:", ResultData);

  return <ExamResults/>;
};

export default ExamResultsPage;
