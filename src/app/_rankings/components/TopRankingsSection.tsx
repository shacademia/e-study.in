import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { RankingCard } from "./";
import { TopRankingsSectionProps } from "../types";

const TopRankingsSection: React.FC<TopRankingsSectionProps> = ({
  rankings,
  exams
}) => {
  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            🏆 Top 10 Rankers - Overall
          </CardTitle>
          <CardDescription>
            Best performers across all exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rankings.map((ranking) => (
              <RankingCard 
                key={`${ranking.userId}-${ranking.rank}`}
                ranking={ranking}
                exams={exams}
                showExamName={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopRankingsSection;
