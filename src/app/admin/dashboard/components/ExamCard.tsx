'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Lock,
} from 'lucide-react';
import { Exam } from '@/constants/types';

interface ExamCardProps {
  exam: Exam;
  publishingExamId: string | null;
  refreshingData: boolean;
  onTogglePublish: (examId: string, isPublished: boolean) => void;
  onDuplicate: () => void;
  onEdit: (exam: Exam) => void;
  onDelete: (examId: string) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  publishingExamId,
  refreshingData,
  onTogglePublish,
  onDuplicate,
  onEdit,
  onDelete,
}) => {
  const isPublishing = publishingExamId === exam.id;
  const questionsCount = exam._count?.questions || exam.questions?.length || 0;
  const canPublish = exam.isPublished || questionsCount > 0;

  return (
    <Card key={exam.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {exam.name}
              {exam.isPasswordProtected && (
                <Lock className="h-4 w-4 text-yellow-600" />
              )}
            </CardTitle>
            <CardDescription>{exam.description}</CardDescription>
            {exam.isPasswordProtected && exam.password && (
              <div className="mt-2">
                <Badge variant="outline">Password: {exam.password}</Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={exam.isPublished ? "default" : "secondary"}>
              {isPublishing ? (
                exam.isPublished ? "Publishing..." : "Unpublishing..."
              ) : (
                exam.isPublished ? "Published" : "Draft"
              )}
            </Badge>
            <Button
              variant="outline"
              className="cursor-pointer"
              size="sm"
              disabled={isPublishing || refreshingData || !canPublish}
              onClick={() => onTogglePublish(exam.id, !exam.isPublished)}
              title={!canPublish ? 'Add questions before publishing' : ''}
            >
              {isPublishing ? (
                <>
                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                  {exam.isPublished ? 'Publishing...' : 'Unpublishing...'}
                </>
              ) : refreshingData ? (
                <>
                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                  Refreshing...
                </>
              ) : exam.isPublished ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Publish
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              size="sm"
              disabled={refreshingData}
              onClick={onDuplicate}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={refreshingData}
              onClick={() => onEdit(exam)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              size="sm"
              disabled={refreshingData}
              onClick={() => onDelete(exam.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {exam.timeLimit} mins
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{exam.totalMarks}</span> marks
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{questionsCount}</span> questions
            {questionsCount === 0 && !exam.isPublished && (
              <span className="text-red-500 text-xs ml-1">
                (Add questions to publish)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 mr-1 inline" />
            {exam.isPublished ? 'Published' : 'Draft'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
