import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Lock } from "lucide-react";
import { ExamCardProps } from "../types";
import { calculateScorePercentage, formatDate } from "../utils";

const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  submission,
  isCompleted,
  onStartExam,
  onViewResults
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              {exam.name}
              {exam.isPasswordProtected && (
                <Lock className="h-4 w-4 ml-2 text-yellow-600" />
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {exam.description}
            </CardDescription>
          </div>
          <Badge variant={isCompleted ? "secondary" : "default"}>
            {isCompleted ? "Completed" : "Available"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {exam.timeLimit} mins
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{exam.totalMarks}</span> marks
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {exam.questions?.length || exam.questionsCount || 0}
            </span> questions
          </div>
        </div>

        {exam.isPasswordProtected && !isCompleted && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Password protected exam
            </p>
          </div>
        )}

        {submission && isCompleted && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Score: {submission.score} marks ({calculateScorePercentage(submission.score, exam.totalMarks)}%)
            </p>
            <p className="text-sm text-green-600">
              Completed on: {submission.completedAt ? formatDate(submission.completedAt) : 'N/A'}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          {isCompleted ? (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => onViewResults(exam.id)}
            >
              View Results
            </Button>
          ) : (
            <Button
              onClick={() => onStartExam(exam.id)}
              className="flex items-center cursor-pointer"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Exam
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCard;
