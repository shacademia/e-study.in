import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@hooks/useApiAuth";
import { UserAvatar, RankingBadge } from "./";
import { getRankIcon, getCardBorder, getScoreColor } from "../utils";
import { RankingCardProps } from "../types";

const RankingCard: React.FC<RankingCardProps> = ({
  ranking,
  exams = [],
  showExamName = false
}) => {
  const { user } = useAuth();

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-md ${getCardBorder(
        ranking.rank
      )} ${
        ranking.userId === user?.id ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="flex items-center space-x-4">
        <RankingBadge rank={ranking.rank} />
        <div className="flex-shrink-0">
          {getRankIcon(ranking.rank)}
        </div>
        <UserAvatar 
          userName={ranking.userName}
        />
        <div>
          <div className="font-medium text-gray-900 flex items-center flex-wrap gap-2">
            <span>{ranking.userName}</span>
            {ranking.userId === user?.id && (
              <Badge variant="secondary">You</Badge>
            )}
            {ranking.rank <= 3 && (
              <Badge
                variant="outline"
                className={`ml-2 ${
                  ranking.rank === 1
                    ? "border-yellow-400 text-yellow-600"
                    : ranking.rank === 2
                    ? "border-gray-400 text-gray-600"
                    : "border-amber-400 text-amber-600"
                }`}
              >
                {ranking.rank === 1
                  ? "Gold"
                  : ranking.rank === 2
                  ? "Silver"
                  : "Bronze"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {showExamName && (
              <>
                {exams.find(e => e.id === ranking.submission?.id)?.name || "Unknown Exam"} •{" "}
              </>
            )}
            {showExamName ? "Completed on " : ""}
            {new Date(ranking.completedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xl font-bold ${getScoreColor(ranking.rank)}`}>
          {ranking.score} pts
        </p>
        <p className="text-sm text-gray-600">
          {ranking.percentage}% ({ranking.score}/{ranking.totalScore})
        </p>
      </div>
    </div>
  );
};

export default RankingCard;
