import React from "react";
import { Trophy } from "lucide-react";
import { NoRankingsMessageProps } from "../types";

const NoRankingsMessage: React.FC<NoRankingsMessageProps> = ({ selectedExam }) => {
  return (
    <div className="text-center py-12">
      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Rankings Available
      </h3>
      <p className="text-gray-600">
        {selectedExam === "all"
          ? "Complete some exams to see rankings here."
          : "No students have completed this exam yet."}
      </p>
    </div>
  );
};

export default NoRankingsMessage;
