import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useApiAuth';
import { examService, submissionService } from '@/services';
import { Exam, Submission } from '@/constants/types';

interface UseExamResultsReturn {
  exam: Exam | null;
  submission: Submission | null;
  loading: boolean;
  error: string | null;
}

// Transform API exam data to expected frontend format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformExamData = (apiExam: any): Exam => {
  if (!apiExam) return apiExam;
  
  // Transform questions from nested API format to flat format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedQuestions = (apiExam.questions || []).map((examQuestion: any) => {
    if (examQuestion.question) {
      // API returns nested structure: examQuestion.question contains the actual question data
      return examQuestion.question;
    }
    // If already in flat format, return as is
    return examQuestion;
  });

  return {
    ...apiExam,
    questions: transformedQuestions,
  };
};

export const useExamResults = (examId: string): UseExamResultsReturn => {
  const { user } = useAuth();

  const [exam, setExam] = useState<Exam | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!examId || !user) {
      console.log('useExamResults: Missing examId or user', { examId, user: !!user });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('useExamResults: Loading data for examId:', examId, 'userId:', user.id);
      
      const [examData, submissionsResponse] = await Promise.all([
        examService.getExamById(examId),
        submissionService.getUserSubmissions(user.id),
      ]);

      console.log('useExamResults: Loaded data', { 
        examData: !!examData, 
        submissionsResponse: submissionsResponse?.data?.submissions?.length || 0 
      });

      if (examData) {
        console.log('useExamResults: Exam data structure:', {
          hasQuestions: !!examData.questions,
          questionsLength: examData.questions?.length || 0,
          firstQuestion: examData.questions?.[0],
          firstQuestionStructure: examData.questions?.[0] ? Object.keys(examData.questions[0]) : [],
        });
        
        // Transform the exam data to handle nested API structure
        const transformedExam = transformExamData(examData);
        console.log('useExamResults: Transformed exam structure:', {
          hasQuestions: !!transformedExam.questions,
          questionsLength: transformedExam.questions?.length || 0,
          firstTransformedQuestion: transformedExam.questions?.[0],
          firstTransformedQuestionStructure: transformedExam.questions?.[0] ? Object.keys(transformedExam.questions[0]) : [],
        });
        
        setExam(transformedExam);

        // Extract submissions from the API response
        const submissions = submissionsResponse?.data?.submissions || [];
        console.log('useExamResults: All submissions:', submissions.map(s => ({ id: s.id, examId: s.examId })));
        
        const userSubmission = submissions.find(
          (sub: Submission) => sub.examId === examId
        );

        console.log('useExamResults: Found submission for exam:', !!userSubmission);
        if (userSubmission) {
          console.log('useExamResults: Submission details:', {
            id: userSubmission.id,
            examId: userSubmission.examId,
            hasAnswers: !!userSubmission.answers,
            answersType: typeof userSubmission.answers,
            answersKeys: userSubmission.answers ? Object.keys(userSubmission.answers) : []
          });
        }
        setSubmission(userSubmission ?? null);
      } else {
        console.log('useExamResults: No exam data found');
        setError('Exam not found');
      }
    } catch (err) {
      console.error('useExamResults: Error loading results:', err);
      setError('Failed to load exam results');
    } finally {
      setLoading(false);
    }
  }, [examId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    exam,
    submission,
    loading,
    error,
  };
};
