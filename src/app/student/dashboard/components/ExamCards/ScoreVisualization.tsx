import React, { memo, useMemo } from "react";
import { ScoreVisualizationProps } from "../../types";
import { getGradeInfo } from "../ExamCards/utils/examUtils";

const ScoreVisualization = memo(({ percentage, score, totalMarks }: ScoreVisualizationProps) => {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  
  const { grade, gradeColor, gradeDescription, gradientBg, circleGradient } = useMemo(() => 
    getGradeInfo(normalizedPercentage), [normalizedPercentage]);

  return (
    <div className={`p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm transition-all duration-300 ${gradientBg}`}>
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Enhanced Circular Progress */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-full border-2 sm:border-4 border-white/80 bg-white/90 flex items-center justify-center relative overflow-hidden shadow-lg">
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${circleGradient} ${normalizedPercentage * 3.6}deg, #e2e8f0 0deg)`
                }}
              />
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-white/95 flex items-center justify-center z-10 shadow-inner">
                <div className="text-center">
                  <div className={`text-xs sm:text-sm lg:text-base font-bold ${gradeColor} leading-tight`}>
                    {Math.round(normalizedPercentage)}%
                  </div>
                  <div className={`text-xs sm:text-xs lg:text-sm font-medium ${gradeColor} leading-tight`}>
                    {grade}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Score Details */}
          <div className="text-center sm:text-left">
            <div className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold ${gradeColor} leading-tight mb-1`}>
              <span className="inline sm:hidden">{score} / {totalMarks}</span>
              <span className="hidden sm:inline">{score} / {totalMarks}</span>
            </div>
            <div className={`text-sm sm:text-sm lg:text-base font-medium ${gradeColor} opacity-90`}>
              {gradeDescription}
            </div>
            
            {/* Additional mobile info */}
            <div className="mt-2 sm:hidden">
              <div className="text-xs text-slate-500">
                Score: {Math.round(normalizedPercentage)}% • Grade: {grade}
              </div>
            </div>
          </div>
        </div>

        {/* Optional additional stats for larger screens */}
        <div className="hidden lg:flex flex-col items-end text-right">
          <div className={`text-sm font-medium ${gradeColor} opacity-75`}>
            Performance
          </div>
          <div className={`text-xs text-slate-500 mt-1`}>
            {normalizedPercentage >= 90 ? "Outstanding" :
             normalizedPercentage >= 80 ? "Excellent" :
             normalizedPercentage >= 70 ? "Good" :
             normalizedPercentage >= 60 ? "Satisfactory" : "Needs Work"}
          </div>
        </div>
      </div>

      {/* Progress bar for mobile */}
      <div className="mt-4 sm:hidden">
        <div className="w-full bg-slate-200/60 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${normalizedPercentage}%`,
              background: circleGradient
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
});

ScoreVisualization.displayName = "ScoreVisualization";
export default ScoreVisualization;
