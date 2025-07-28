'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Globe, 
  Lock, 
  Clock, 
  BookOpen, 
  Users, 
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Loader2
} from 'lucide-react';
import { useExamDetails } from '../hooks/useExamDetails';
import { useExamManagement } from '../hooks/useExamManagement';

interface ExamDetailsContainerProps {
  examId: string;
}

const ExamDetailsContainer: React.FC<ExamDetailsContainerProps> = ({ examId }) => {
  const router = useRouter();
  const { exam, loading, error, refetch } = useExamDetails(examId);
  const { publishExam, publishing } = useExamManagement();

  const handleBack = () => {
    router.push('/admin/exam/list');
  };

  const handleEdit = () => {
    router.push(`/admin/exam/${examId}/edit`);
  };

  const handlePreview = () => {
    router.push(`/admin/exam/${examId}/preview`);
  };

  const handlePublishToggle = async () => {
    if (!exam) return;
    
    const success = await publishExam(exam.id, !exam.isPublished);
    if (success) {
      refetch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            Loading exam details...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-4">{error || 'Exam not found'}</p>
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
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
            <h1 className="text-3xl font-bold text-gray-900">{exam.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={exam.isPublished ? 'default' : 'secondary'}>
                {exam.isPublished ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Published
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Draft
                  </>
                )}
              </Badge>
              {exam.isPasswordProtected && (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Protected
                </Badge>
              )}
            </div>
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
          <Button
            variant="outline"
            onClick={handleEdit}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={exam.isPublished ? "destructive" : "default"}
            onClick={handlePublishToggle}
            disabled={publishing}
            className="cursor-pointer"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            {exam.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {exam.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{exam.description}</p>
                </div>
              )}
              
              {exam.instructions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                  <p className="text-gray-600">{exam.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Time Limit</h4>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {exam.timeLimit} minutes
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Total Marks</h4>
                  <div className="flex items-center text-gray-600">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    {exam.totalMarks || 0} marks
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {exam.sections && exam.sections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Sections ({exam.sections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exam.sections.map((section, index) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {index + 1}. {section.name}
                          </h4>
                          {section.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {section.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {section.questions?.length || 0} questions
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {section.timeLimit && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {section.timeLimit} min
                          </div>
                        )}
                        {section.marks && (
                          <div className="flex items-center">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            {section.marks} marks
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Direct Questions (if no sections) */}
          {exam.questions && exam.questions.length > 0 && (!exam.sections || exam.sections.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Questions ({exam.questions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>This exam contains {exam.questions.length} questions</p>
                  <p className="text-sm mt-1">Click "Preview" to see the questions</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Questions</span>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1 text-gray-400" />
                  {exam.questionsCount || 0}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sections</span>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-gray-400" />
                  {exam.sectionsCount || 0}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Submissions</span>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-400" />
                  {exam.submissionsCount || 0}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <Badge variant={exam.isPublished ? 'default' : 'secondary'}>
                  {exam.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              
              {exam.isPasswordProtected && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Password</span>
                  <Badge variant="outline">Protected</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Created</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(exam.createdAt)}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Last Modified</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(exam.updatedAt)}
                </div>
              </div>
              
              {exam.createdBy && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Created By</h4>
                  <p className="text-sm text-gray-600">
                    {exam.createdBy.name || exam.createdBy.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsContainer;
