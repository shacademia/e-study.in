import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useApiAuth";
import { useExams, useSubmissions, useRankings } from "@/hooks/useApiServices";
import { Exam, Submission, StudentRanking } from "@/constants/types";
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
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id || dataLoaded) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setDataLoaded(true); // Set this early to prevent multiple calls

        // Load all dashboard data in parallel
        const [examResult, submissionResult, rankingResult] = await Promise.allSettled([
          examsApi.getAllExams({ page: 1, limit: 50, published: true }),
          submissionsApi.getUserSubmissions(user.id, { page: 1, limit: 50 }),
          rankingsApi.getStudentRanking({ userId: user.id })
        ]);

        // Handle exams result
        if (examResult.status === 'fulfilled') {
          console.log('Exam API Response:', examResult.value);
          const examData = examResult.value.data as { exams: Exam[] };
          setExams(Array.isArray(examData.exams) ? examData.exams : []);
        } else {
          console.error('Failed to load exams:', examResult.reason);
          setExams([]);
        }

        // Handle submissions result - Note: API returns { submissions: Submission[] }
        if (submissionResult.status === 'fulfilled') {
          console.log('Submissions API Response:', submissionResult.value);
          const submissionData = submissionResult.value.data as { submissions: Submission[] };
          const submissions = submissionData?.submissions || [];
          setUserSubmissions(Array.isArray(submissions) ? submissions : []);
        } else {
          console.error('Failed to load submissions:', submissionResult.reason);
          setUserSubmissions([]);
        }

        // Handle ranking result - Note: API returns StudentRanking directly in data
        if (rankingResult.status === 'fulfilled') {
          console.log('Ranking API Response:', rankingResult.value);
          const rankingData = rankingResult.value.data;
          setUserRanking(rankingData || null);
        } else {
          console.error('Failed to load ranking:', rankingResult.reason);
          setUserRanking(null);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, dataLoaded]); // Only run when user.id changes or if data hasn't been loaded

  // Calculate user statistics from submissions
  const userStats = useMemo(() => {
    return calculateUserStats(userSubmissions, userRanking);
  }, [userSubmissions, userRanking]);

  // Filter exams based on completed submissions
  const completedExamIds = useMemo(() => {
    const submissions = Array.isArray(userSubmissions) ? userSubmissions : [];
    return submissions.map(sub => sub.examId) || [];
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
