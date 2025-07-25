import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecentActivityProps } from "../types";
import { formatDate } from "../utils";

const RecentActivity: React.FC<RecentActivityProps> = ({ recentSubmissions, exams }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentSubmissions?.slice(0, 3).map((submission) => {
            const exam = exams.find((e) => e.id === submission.examId);
            return (
              <div
                key={submission.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm"
              >
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">
                    {exam?.name || "Unknown Exam"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {submission.completedAt ? formatDate(submission.completedAt) : "N/A"}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {submission.score} pts
                </Badge>
              </div>
            );
          })}
          
          {(!recentSubmissions || recentSubmissions.length === 0) && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
