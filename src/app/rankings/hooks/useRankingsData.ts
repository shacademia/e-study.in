import { useState, useEffect, useMemo } from "react";
import { useRankings, useExams } from "@/hooks/useApiServices";
import { Exam, ExamRanking } from "@/constants/types";

export interface RankingsData {
  rankings: ExamRanking[];
  exams: Exam[];
  selectedExam: string;
  setSelectedExam: (exam: string) => void;
  loading: boolean;
  topRankings: ExamRanking[];
  rankingsByExam: Record<string, ExamRanking[]>;
  filteredRankings: ExamRanking[];
}

const useRankingsData = (): RankingsData => {
  const examsApi = useExams();
  const rankingsApi = useRankings();

  const [rankings, setRankings] = useState<ExamRanking[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rankingData = await rankingsApi.getExamRankings("all") as ExamRanking[];
        const examData = await examsApi.getAllExams() as Exam[];
        setRankings(rankingData);
        setExams(examData.filter((exam) => exam.isPublished));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examsApi, rankingsApi]);

  const filteredRankings = useMemo(() => {
    return selectedExam === "all"
      ? rankings.slice(0, 20)
      : rankings.filter((r) => r.submission?.id === selectedExam);
  }, [rankings, selectedExam]);

  const rankingsByExam = useMemo(() => {
    return filteredRankings.reduce((acc, ranking) => {
      const examName = exams.find(e => e.id === ranking.submission?.id)?.name || "Unknown Exam";

      if (!acc[examName]) {
        acc[examName] = [];
      }
      acc[examName].push(ranking);
      return acc;
    }, {} as Record<string, ExamRanking[]>);
  }, [filteredRankings, exams]);

  const topRankings = useMemo(() => {
    return rankings
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((ranking, index) => ({ ...ranking, rank: index + 1 }));
  }, [rankings]);

  return {
    rankings,
    exams,
    selectedExam,
    setSelectedExam,
    loading,
    topRankings,
    rankingsByExam,
    filteredRankings
  };
};

export default useRankingsData;
