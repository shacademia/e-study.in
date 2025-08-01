'use client';

import React from 'react';
import { useExamResults } from './hooks/useExamResults';
import { useResultsCalculation } from './hooks/useResultsCalculation';
import ResultsHeader from './components/ResultsHeader';
import ResultsLoading from './components/ResultsLoading';
import ResultsNotFound from './components/ResultsNotFound';
import ResultsSummary from './components/ResultsSummary';
import QuestionResultsList from './components/QuestionResultsList';
import ResultsActions from './components/ResultsActions';
import { useResult } from '@/context/ResultContext';



const ExamResults= () => {
  // const { exam, submission, loading, error } = useExamResults(examId);
 const {ResultData, loading } = useResult();

  
  // Only calculate results when we have valid data
  // const { correctAnswers, totalQuestions, percentage, grade } = useResultsCalculation(
  //   loading ? null : exam, 
  //   loading ? null : submission
  // );


  if(loading){
    return <ResultsLoading />;
  }
  if (!ResultData || !ResultData.success) {
    return <ResultsNotFound />;
  }
  if (!ResultData?.success) {
    return <ResultsNotFound />;
  }

  const data = ResultData.data;

  const statistics = data.statistics;
  const exam = data.exam;
  const submission = data;
  const correctAnswers = statistics.correctAnswers;
  const totalQuestions = statistics.totalQuestions;
  const percentage = statistics.percentage;
  const grade = data.performance.grade;
  const remarks = data.performance.remarks;
  const questions = data.questionAnalysis;

  console.log("ExamResults - ResultData:", ResultData);



  return (
    <div className="min-h-screen bg-gray-50">
      <ResultsHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <ResultsSummary
            exam={exam}
            submission={submission}
            correctAnswers={correctAnswers}
            totalQuestions={totalQuestions}
            percentage={percentage}
            grade={grade}
            statistics={statistics}
          />

          <QuestionResultsList exam={exam} submission={submission} />

          <ResultsActions />
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
