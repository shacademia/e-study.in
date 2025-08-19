'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import ResultsHeader from './components/ResultsHeader';
import ResultsLoading from './components/ResultsLoading';
import ResultsNotFound from './components/ResultsNotFound';
import ResultsSummary from './components/ResultsSummary';
import QuestionResultsList from './components/QuestionResultsList';
import ResultsActions from './components/ResultsActions';
import { useResult } from '@/context/ResultContext';

const ExamResults = () => {
  const { ResultData, loading } = useResult();
  const [showGoToTop, setShowGoToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const threshold = 300;
      setShowGoToTop(scrolled > threshold);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return <ResultsLoading />;
  }
  if (!ResultData || !ResultData.success) {
    return <ResultsNotFound />;
  }

  const data = ResultData?.data;
  const statistics = data?.statistics;
  const exam = data?.exam;
  const submission = data;
  const correctAnswers = statistics?.correctAnswers || null;
  const totalQuestions = statistics?.totalQuestions;
  const percentage = statistics?.percentage;
  const grade = data?.performance?.grade;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <ResultsHeader />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
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

      {/* GO TO TOP BUTTON */}
      {showGoToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-slate-950 hover:bg-slate-800 cursor-pointer text-white p-2.5 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 z-50 touch-manipulation"
          style={{
            // Safe area considerations for devices with notches/rounded corners
            bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
            right: 'max(1.5rem, env(safe-area-inset-right, 1.5rem))'
          }}
          aria-label="Go to top"
        >
          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
    </div>
  );
};

export default ExamResults;
