import React, { memo } from "react";
import { StatMetricProps } from "../../types";

const StatMetric = memo(({
  icon, value, label, variant = "default"
}: StatMetricProps) => {
  const variantClasses = {
    default: "bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border-slate-200/60 shadow-sm",
    primary: "bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 border-blue-200/60 shadow-sm",        
    success: "bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 border-emerald-200/60 shadow-sm",
    warning: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 border-amber-200/60 shadow-sm"
  };

  const iconColors = {
    default: "text-slate-600",
    primary: "text-blue-600",
    success: "text-emerald-600", 
    warning: "text-amber-600"
  };

  const valueColors = {
    default: "text-slate-700",
    primary: "text-blue-700",
    success: "text-emerald-700",
    warning: "text-amber-700"
  };

  return (
    <div className={`p-3 sm:p-4 lg:p-5 rounded-xl border transition-all duration-300 min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] ${variantClasses[variant]}`}>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        <div className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0 ${iconColors[variant]}`}>
          {icon}
        </div>
        <span className="text-xs sm:text-xs lg:text-sm font-medium text-slate-500 truncate">{label}</span>
      </div>
      
      <div className={`text-base sm:text-lg lg:text-xl xl:text-2xl font-bold ${valueColors[variant]} leading-tight mb-1`}>
        {value}
      </div>
      
      <div className="text-xs sm:text-xs lg:text-sm text-slate-400 leading-tight">
        {label === "Minutes" ? "Duration" : 
         label === "Questions" ? "Total" :
         label === "Total Marks" ? "Points" : "Parts"}
      </div>
    </div>
  );
});

StatMetric.displayName = "StatMetric";
export default StatMetric;
