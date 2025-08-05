'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Globe,
  Lock,
  BookOpen,
  Clock,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useExamList } from '../hooks/useExamList';
import { useExamManagement } from '../hooks/useExamManagement';
import { Exam } from '@/constants/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ExamListContainer: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { exams, loading, error, pagination, refetch } = useExamList({
    search: searchQuery,
    published: publishFilter === 'all' ? undefined : publishFilter === 'published',
    sortBy,
    sortOrder,
    limit: 12,
  });

  const { 
    deleting, 
    publishing, 
    deleteExam, 
    publishExam, 
    duplicateExam 
  } = useExamManagement();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateExam = () => {
    router.push('/admin/exam/create');
  };

  const handleEditExam = (exam: Exam) => {
    router.push(`/admin/exam/${exam.id}/edit`);
  };

  const handlePreviewExam = (exam: Exam) => {
    router.push(`/admin/exam/${exam.id}/preview`);
  };

  const handleViewDetails = (exam: Exam) => {
    router.push(`/admin/exam/${exam.id}/details`);
  };

  const handleDeleteExam = async (examId: string) => {
    const success = await deleteExam(examId);
    if (success) {
      refetch();
    }
  };

  const handlePublishToggle = async (exam: Exam) => {
    const success = await publishExam(exam.id, !exam.isPublished);
    if (success) {
      refetch();
    }
  };

  const handleDuplicateExam = async (examId: string) => {
    const duplicated = await duplicateExam(examId);
    if (duplicated) {
      refetch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} className='cursor-pointer'>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage your exams</p>
        </div>
        <Button onClick={handleCreateExam} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Publish Filter */}
            <Select value={publishFilter} onValueChange={(value: 'all' | 'published' | 'draft') => setPublishFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: 'createdAt' | 'updatedAt' | 'name') => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Modified Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exam Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No exams found</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first exam'}
            </p>
            <Button onClick={handleCreateExam} className='cursor-pointer'>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium line-clamp-2 mb-2">
                        {exam.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
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
                  
                  {exam.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {exam.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {exam.questionsCount || 0} questions
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {exam.timeLimit} min
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {exam.submissionsCount || 0} submissions
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(exam.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(exam)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewExam(exam)}
                          className="cursor-pointer"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExam(exam)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateExam(exam.id)}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={exam.isPublished ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handlePublishToggle(exam)}
                          disabled={publishing}
                          className="cursor-pointer"
                        >
                          {exam.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleting}
                              className="cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{exam.name}&quot;? This action cannot be undone.
                                {exam.submissionsCount && exam.submissionsCount > 0 && (
                                  <span className="block mt-2 text-red-600 font-medium">
                                    Warning: This exam has {exam.submissionsCount} submissions that will also be deleted.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteExam(exam.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} exams
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage}
                      className="cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      className="cursor-pointer"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ExamListContainer;
