import { useRouter } from "next/navigation";
import { useAuth } from "@hooks/useApiAuth";

export interface RankingsActions {
  handleExamFilterChange: (examId: string) => void;
  handleBackNavigation: () => void;
  refreshRankings: () => Promise<void>;
}

const useRankingsActions = (setSelectedExam?: (exam: string) => void): RankingsActions => {
  const router = useRouter();
  const { user } = useAuth();

  const handleExamFilterChange = (examId: string) => {
    if (setSelectedExam) {
      setSelectedExam(examId);
    }
  };

  const handleBackNavigation = () => {
    if (user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  };

  const refreshRankings = async () => {
    // Implementation for refreshing rankings data
    window.location.reload();
  };

  return {
    handleExamFilterChange,
    handleBackNavigation,
    refreshRankings
  };
};

export default useRankingsActions;
