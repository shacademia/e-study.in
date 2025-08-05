import { useRouter } from "next/navigation";

interface DashboardActions {
  handleStartExam: (examId: string) => void;
  handleViewResults: (examId: string) => void;
  handleRankingsClick: () => void;
}

const useDashboardActions = (): DashboardActions => {
  const router = useRouter();

  const handleStartExam = (examId: string) => {
    // router.push(`/student/exam/${examId}`, { target: '_blank' });
    window.open(`/student/exam/${examId}`, '_blank');
  };

  const handleViewResults = (examId: string) => {
    router.push(`/student/results/${examId}`);
  };

  const handleRankingsClick = () => {
    router.push('/rankings');
  };

  return {
    handleStartExam,
    handleViewResults,
    handleRankingsClick
  };
};

export default useDashboardActions;
