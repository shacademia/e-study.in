import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Lock } from "lucide-react";
import { StatusBadgeProps } from "../../types";

const StatusBadge = memo(({ isCompleted, isPasswordProtected }: StatusBadgeProps) => {
  if (isCompleted) {
    return (
      <Badge className="text-[10px] md:text-xs md:px-4 px-3 md:py-2 py-[5px] bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Completed
      </Badge>
    );
  }

  return (
    <Badge className="text-[10px] md:text-xs md:px-4 px-3 md:py-2 py-[5px] bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 text-white border-0 shadow-lg transition-all duration-200">
      <Sparkles className="md:h-4 md:w-4 h-3 w-3 mr-1" />
      Available
      {isPasswordProtected && <Lock className="h-3 w-3 ml-1" />}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";
export default StatusBadge;
