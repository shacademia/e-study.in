import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { RankingCard } from "./";
import { ExamRankingsSectionProps } from "../types";

const ExamRankingsSection: React.FC<ExamRankingsSectionProps> = ({
  rankingsByExam
}) => {
  return (
    <>
      {Object.entries(rankingsByExam).map(([examName, examRankings]) => (
        <div key={examName}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                {examName}
              </CardTitle>
              <CardDescription>
                Rankings for {examRankings.length} students • Real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {examRankings
                  .sort((a, b) => a.rank - b.rank)
                  .slice(0, 10)
                  .map((ranking) => (
                    <RankingCard
                      key={`${ranking.userId}-${ranking.rank}`}
                      ranking={ranking}
                      showExamName={false}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </>
  );
};

export default ExamRankingsSection;
