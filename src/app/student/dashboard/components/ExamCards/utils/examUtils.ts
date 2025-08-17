// Utility function to format date for display
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Utility function to calculate percentage score
export const calculateScorePercentage = (score: number, totalMarks: number): number => {
  if (totalMarks === 0) return 0;
  return (score / totalMarks) * 100;
};

// Grade calculation utility
export const getGradeInfo = (percentage: number) => {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  
  if (normalizedPercentage >= 90) return { 
    grade: "A+", 
    gradeColor: "text-emerald-700", 
    gradeDescription: "Excellent", 
    gradientBg: "bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100",
    circleGradient: "linear-gradient(135deg, #10b981, #059669)"
  };
  if (normalizedPercentage >= 80) return { 
    grade: "A", 
    gradeColor: "text-emerald-600", 
    gradeDescription: "Very Good", 
    gradientBg: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100",
    circleGradient: "linear-gradient(135deg, #34d399, #10b981)"
  };
  if (normalizedPercentage >= 70) return { 
    grade: "B+", 
    gradeColor: "text-blue-600", 
    gradeDescription: "Good", 
    gradientBg: "bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100",
    circleGradient: "linear-gradient(135deg, #3b82f6, #2563eb)"
  };
  if (normalizedPercentage >= 60) return { 
    grade: "B", 
    gradeColor: "text-purple-600", 
    gradeDescription: "Fair", 
    gradientBg: "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100",
    circleGradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)"
  };
  if (normalizedPercentage >= 50) return { 
    grade: "C", 
    gradeColor: "text-orange-600", 
    gradeDescription: "Needs Improvement", 
    gradientBg: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100",
    circleGradient: "linear-gradient(135deg, #f97316, #ea580c)"
  };
  return { 
    grade: "F", 
    gradeColor: "text-red-600", 
    gradeDescription: "Failed", 
    gradientBg: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-100",
    circleGradient: "linear-gradient(135deg, #ef4444, #dc2626)"
  };
};
