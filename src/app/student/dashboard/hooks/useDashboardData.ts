import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useApiAuth";
import { useExams, useSubmissions, useRankings } from "@/hooks/useApiServices";
// Import the required types, including the new response types
import { 
  Exam, 
  Submission, 
  StudentRanking, 
  ApiResponse, 
  ExamsResponse, 
  SubmissionsResponse 
} from "@/constants/types";
import { calculateUserStats } from "../utils";
import { DashboardData } from "../types";

const useDashboardData = (): DashboardData => {
  const { user } = useAuth();
  
  // API hooks
  const examsApi = useExams();
  const submissionsApi = useSubmissions();
  const rankingsApi = useRankings();

  // Local state
  const [exams, setExams] = useState<Exam[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [userRanking, setUserRanking] = useState<StudentRanking | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('Dashboard Data Hook - User:', user?.id, 'Loading:', loading);

  useEffect(() => {
    if (!user?.id) return;

    console.log('Dashboard Data Hook - Starting data load for user:', user?.id);

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all dashboard data in parallel
        const [examResult, submissionResult, rankingResult] = await Promise.allSettled([
          examsApi.getAllExams({ page: 1, limit: 50, published: true }),
          submissionsApi.getUserSubmissions(user.id, { page: 1, limit: 50 }),
          rankingsApi.getStudentRanking({ userId: user.id })
        ]);

        // Handle exams result with proper typing
        if (examResult.status === 'fulfilled') {
          const response = examResult.value as ApiResponse<ExamsResponse>;
          setExams(response.data?.exams || []);
        } else {
          console.error('Failed to load exams:', examResult.reason);
          setExams([]);
        }

        // Handle submissions result with proper typing
        if (submissionResult.status === 'fulfilled') {
          const response = submissionResult.value as ApiResponse<SubmissionsResponse>;
          setUserSubmissions(response.data?.submissions || []);
        } else {
          console.error('Failed to load submissions:', submissionResult.reason);
          setUserSubmissions([]);
        }

        // Handle ranking result with proper typing
        if (rankingResult.status === 'fulfilled') {
          const response = rankingResult.value as ApiResponse<StudentRanking>;
          setUserRanking(response.data || null);
        } else {
          console.error('Failed to load ranking:', rankingResult.reason);
          setUserRanking(null);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set empty states to prevent infinite loading
        setExams([]);
        setUserSubmissions([]);
        setUserRanking(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]); // Only depend on user.id, remove dataLoaded dependency

  // Calculate user statistics from submissions
  const userStats = useMemo(() => {
    return calculateUserStats(userSubmissions, userRanking);
  }, [userSubmissions, userRanking]);

  // Filter exams based on completed submissions
  const completedExamIds = useMemo(() => {
    return userSubmissions.map(sub => sub.examId);
  }, [userSubmissions]);

  const availableExams = useMemo(
    () => exams.filter((exam) => !completedExamIds.includes(exam.id)),
    [exams, completedExamIds]
  );

  const completedExams = useMemo(
    () => exams.filter((exam) => completedExamIds.includes(exam.id)),
    [exams, completedExamIds]
  );

  return {
    exams,
    userSubmissions,
    userRanking,
    loading,
    userStats,
    availableExams,
    completedExams,
    user
  };
};

export default useDashboardData;
