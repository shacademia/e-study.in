'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { examService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { Exam } from '@/constants/types';
import ExamBuilderContainer from '../containers/ExamBuilderContainer';

interface ExamEditContainerProps {
  examId: string;
}

const ExamEditContainer: React.FC<ExamEditContainerProps> = ({ examId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [editingExam, setEditingExam] = useState<Partial<Exam> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExamForEdit = async () => {
      try {
        setLoading(true);
        const examData = await examService.getExamForEdit(examId);
        // Extract just the exam data from the response
        setEditingExam(examData.exam);
      } catch (error) {
        console.error('Error loading exam for edit:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exam for editing',
          variant: 'destructive',
        });
        router.push('/admin/exam/list');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      loadExamForEdit();
    }
  }, [examId, toast, router]);

  const handleBack = () => {
    router.push('/admin/exam/list');
  };

  const handlePreview = () => {
    router.push(`/admin/exam/${examId}/preview`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            Loading exam for editing...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!editingExam) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-4">Exam not found or access denied</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exam List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Edit Exam: {editingExam.name}
              </h1>
              <p className="text-sm text-gray-600">
                Make changes to your exam structure and content
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Exam Builder */}
      <ExamBuilderContainer
        editingExam={editingExam}
        onBack={handleBack}
      />
    </div>
  );
};

export default ExamEditContainer;
