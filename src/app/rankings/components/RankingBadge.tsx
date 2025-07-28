import React from "react";
import { getRankBadge } from "../utils";
import { RankingBadgeProps } from "../types";

const RankingBadge: React.FC<RankingBadgeProps> = ({ rank }) => {
  return (
    <div className="flex-shrink-0 text-2xl font-bold">
      {getRankBadge(rank)}
    </div>
  );
};

export default RankingBadge;
