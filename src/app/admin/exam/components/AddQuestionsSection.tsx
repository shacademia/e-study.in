'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Filter,
  BookOpen,
  CheckCircle,
  Plus,
  Eye,
  Grid,
  List,
  Tags,
  Shield,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Question, ExamSection } from '@/constants/types';
import { examService } from '@/services/exam';

// Custom hooks
import { useQuestions } from '../create/hooks/useQuestions';
import { useQuestionSelection } from '../create/hooks/useQuestionSelection';
import { useQuestionFilters } from '../create/hooks/useQuestionFilters';
import { useDebounce } from '../create/hooks/useDebounce';
import { useUserPermissions } from '../create/hooks/useUserPermissions';
import QuestionPreviewDialog from './QuestionPreviewDialog';

interface AddQuestionsSectionProps {
  examId?: string;
  sectionId?: string;
  section?: ExamSection;
  onQuestionsAdded?: (addedQuestions: Question[], totalQuestions: number) => void;
  onClose?: () => void;
  isOpen: boolean;
  mode?: 'dialog' | 'inline';
}

type ViewMode = 'grid' | 'list';

// Utility function to transform section questions for saveExamWithSections API
const transformSectionQuestions = (questions: unknown[]) => {
  return questions.map(q => ({
    questionId: q.questionId,
    order: q.order,
    marks: q.marks,
  }));
};

const AddQuestionsSection: React.FC<AddQuestionsSectionProps> = ({
  examId,
  sectionId,
  section,
  onQuestionsAdded,
  onClose,
  isOpen,
  mode = 'dialog'
}) => {
  // Custom hooks
  const { questions, loading, error, loadQuestions, refreshQuestions, hasMore } = useQuestions();
  const { selectedQuestions, toggleSelection, clearSelection, selectedCount } = useQuestionSelection();
  const { filters, updateFilter, toggleTag, clearFilters, filterOptions } = useQuestionFilters(questions);
  const userPermissions = useUserPermissions();

  // State for question IDs already added to this section to filter them out
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [addingQuestions, setAddingQuestions] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounced search term for loading questions
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load questions already added to this section by examId and sectionId
  useEffect(() => {
    const loadUsedQuestions = async () => {
      if (!examId || !sectionId) return;
      try {
        const response = await examService.getSectionQuestions(examId, sectionId);

        // Handle the API response format: { section, questions, statistics }
        let questionsArray = [];
        if (Array.isArray(response)) {
          // Direct array response (fallback)
          questionsArray = response;
        } else if (response && typeof response === 'object' && Array.isArray(response.questions)) {
          // Expected format: { section, questions, statistics }
          questionsArray = response.questions;
        } else if (response && typeof response === 'object' && response.data && Array.isArray(response.data.questions)) {
          // Nested data format: { data: { section, questions, statistics } }
          questionsArray = response.data.questions;
        } else {
          console.error('Invalid response format for section questions:', response);
          setUsedQuestionIds(new Set());
          toast({
            title: 'Warning',
            description: 'Could not load existing questions - unexpected response format',
            variant: 'destructive'
          });
          return;
        }

        // Extract question IDs from the questions array
        const ids = questionsArray.map(q => {
          // Handle both direct question objects and nested question objects
          return q.questionId || q.question?.id || q.id;
        }).filter(Boolean);

        setUsedQuestionIds(new Set(ids));
      } catch (err) {
        console.error('Failed to load used questions for section:', err);
        setUsedQuestionIds(new Set());
        toast({
          title: 'Error',
          description: 'Failed to load section questions',
          variant: 'destructive'
        });
      }
    };
    loadUsedQuestions();
  }, [examId, sectionId]);

  // Load questions when filters or search changes
  React.useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (isCancelled) return;

      const params = {
        subject: filters.subject !== 'all' ? filters.subject : undefined,
        difficulty: filters.difficulty !== 'all' ? filters.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : undefined,
        search: debouncedSearchTerm || undefined,
      };

      // Reset and load first batch
      await loadQuestions(params, { reset: true });
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [loadQuestions, filters.subject, filters.difficulty, debouncedSearchTerm]);

  // Filter out used questions and apply client-side filters for topic & tags
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      // Exclude questions that are already used
      if (usedQuestionIds.has(question.id)) return false;

      const matchesTopic = filters.topic === 'all' || question.topic === filters.topic;
      const matchesTags = filters.tags.length === 0 || filters.tags.some(tag => question.tags.includes(tag));

      return matchesTopic && matchesTags;
    });
  }, [questions, filters.topic, filters.tags, usedQuestionIds]);

  // Handle loading more questions
  const handleLoadMore = async () => {
    setLoadingMore(true);

    const params = {
      subject: filters.subject !== 'all' ? filters.subject : undefined,
      difficulty: filters.difficulty !== 'all' ? filters.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : undefined,
      search: debouncedSearchTerm || undefined,
    };

    // Append next batch
    await loadQuestions(params, { loadMore: true });
    setLoadingMore(false);
  };

  // Handle adding questions selected by admin to the section using saveExamWithSections
  const handleAddQuestions = async () => {
    if (!userPermissions.canCreateQuestions) {
      toast({
        title: 'Permission Denied',
        description: !userPermissions.hasToken
          ? 'Please log in to add questions'
          : !userPermissions.isActive
            ? 'Your account is not active. Contact an administrator.'
            : `You need ADMIN or MODERATOR role to add questions. Current role: ${userPermissions.userRole}`,
        variant: 'destructive',
      });
      return;
    }

    if (selectedCount === 0) {
      toast({
        title: 'No Questions Selected',
        description: 'Please select at least one question to add',
        variant: 'destructive',
      });
      return;
    }

    // Demo mode fallback
    if (!examId || !sectionId) {
      const addedQuestions = filteredQuestions.filter(q => selectedQuestions.has(q.id));

      toast({
        title: 'Questions Added (Demo)',
        description: `Successfully selected ${selectedCount} questions. In real mode, these would be added to ${section?.name || 'the section'}`,
      });

      clearSelection();
      onQuestionsAdded?.(addedQuestions, selectedCount);

      if (mode === 'dialog' && onClose) {
        onClose();
      }
      return;
    }

    // Real API call using saveExamWithSections for atomic operation
    // Benefits: 
    // - Atomic transaction ensures data consistency
    // - Updates both exam-section and exam-question relationships
    // - Handles section marks calculation automatically
    // - More reliable than individual API calls
    try {
      setAddingQuestions(true);

      // First, get the current exam data to preserve existing structure
      toast({
        title: 'Loading exam data...',
        description: 'Fetching current exam structure',
      });

      const currentExamData = await examService.getExamForEdit(examId);

      if (!currentExamData || !currentExamData.exam || !currentExamData.sections) {
        throw new Error('Failed to load current exam data or invalid data structure');
      }

      const { exam, sections } = currentExamData;

      // Find the target section and add new questions to it
      const updatedSections = sections.map(existingSection => {
        if (existingSection.id === sectionId) {
          // Get existing questions in this section
          const existingQuestions = existingSection.questions || [];

          // Create new question entries for selected questions
          const selectedQuestionsList = Array.from(selectedQuestions);
          const newQuestions = selectedQuestionsList.map((questionId, index) => ({
            questionId,
            order: existingQuestions.length + index,
            marks: 1, // Default marks, could be made configurable
          }));

          // Combine existing and new questions
          const allQuestions = [
            ...transformSectionQuestions(existingQuestions),
            ...newQuestions
          ];

          return {
            id: existingSection.id,
            name: existingSection.name,
            description: existingSection.description,
            timeLimit: existingSection.timeLimit,
            questions: allQuestions,
          };
        }

        // Return other sections unchanged
        return {
          id: existingSection.id,
          name: existingSection.name,
          description: existingSection.description,
          timeLimit: existingSection.timeLimit,
          questions: transformSectionQuestions(existingSection.questions || []),
        };
      });

      // Prepare the payload for saveExamWithSections
      const savePayload = {
        exam: {
          name: exam.name,
          description: exam.description || '',
          timeLimit: exam.timeLimit,
          isPasswordProtected: exam.isPasswordProtected || false,
          password: exam.password || undefined,
          instructions: exam.instructions || '',
          isPublished: exam.isPublished || false,
          isDraft: exam.isDraft !== false, // Default to true if not explicitly false
        },
        sections: updatedSections,
      };

      // Check payload size and processing requirements
      const totalQuestions = updatedSections.reduce((sum, section) => 
        sum + section.questions.length, 0
      );
      
      const payloadSize = JSON.stringify(savePayload).length;
      const isLargePayload = payloadSize > 1024 * 1024; // 1MB
      const isManyQuestions = totalQuestions > 50;
      
      console.log(`📊 Save operation:`, {
        sections: updatedSections.length,
        totalQuestions,
        payloadSizeKB: Math.round(payloadSize / 1024),
        isLargePayload,
        isManyQuestions
      });

      // Warn user about potential timeout in production
      if (isManyQuestions || isLargePayload) {
        toast({
          title: 'Large Dataset Detected',
          description: `Saving ${totalQuestions} questions (${Math.round(payloadSize / 1024)}KB). This may take longer in production.`,
        });
      }

      // Save using the atomic saveExamWithSections API
      await examService.saveExamWithSections(examId, savePayload);

      const addedQuestions = filteredQuestions.filter(q => selectedQuestions.has(q.id));

      toast({
        title: 'Questions Added Successfully',
        description: `Successfully added ${selectedCount} questions to ${section?.name || 'the section'}`,
      });

      clearSelection();
      onQuestionsAdded?.(addedQuestions, selectedCount);

      // Refresh used question IDs after successful add
      try {
        const response = await examService.getSectionQuestions(examId, sectionId);

        // Handle the API response format consistently
        let questionsArray = [];
        if (Array.isArray(response)) {
          questionsArray = response;
        } else if (response && typeof response === 'object' && Array.isArray(response.questions)) {
          questionsArray = response.questions;
        } else if (response && typeof response === 'object' && response.data && Array.isArray(response.data.questions)) {
          questionsArray = response.data.questions;
        }

        const ids = questionsArray.map(q => {
          return q.questionId || q.question?.id || q.id;
        }).filter(Boolean);

        setUsedQuestionIds(new Set(ids));
      } catch (refreshError) {
        console.warn('Failed to refresh used questions:', refreshError);
        // Non-critical error, don't show to user
      }

      if (mode === 'dialog' && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to add questions:', error);

      let errorMessage = 'Failed to add questions to section';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = (error as unknown).error || errorMessage;
      }

      toast({
        title: 'Error Adding Questions',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setAddingQuestions(false);
    }
  };

  // Clear all filters and search
  const handleClearAll = () => {
    clearFilters();
    setSearchTerm('');
  };

  // Question difficulty color helper
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HARD': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Question card component with React.memo for performance
  const QuestionCard = React.memo(({ question, isSelected }: { question: Question; isSelected: boolean }) => {
    // Helper to render a single layer
    const renderLayer = (
      type: 'text' | 'image' | 'none',
      text?: string,
      imageUrl?: string
    ) => {
      if (type === 'text' && text) {
        return <p className="text-sm line-clamp-3 mb-1 break-words">{text}</p>;
      } else if (type === 'image' && imageUrl) {
        return (
          <div className="mb-1 flex justify-start">
            <div className="relative w-full max-w-full h-auto max-h-[150px]">
              <Image
                src={imageUrl}
                alt="Question layer image"
                width={60}
                height={50}
                className="rounded-md object-contain border bg-white"
                unoptimized={true} // Optional, if you're loading external URLs without next.config domains
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        );
      }
      return null; // none or missing content renders nothing
    };

    return (
      <Card className={`transition-all hover:shadow-md cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleSelection(question.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex flex-wrap gap-1 cursor-text">
                <Badge variant="outline">{question.subject}</Badge>
                <Badge variant="secondary">{question.topic}</Badge>
                <Badge className={`${getDifficultyColor(question.difficulty)} text-[10px] px-[6px] py-[1px] items-center`}>
                  {question.difficulty}
                </Badge>
              </div>
            </div>
            <div className="flex justify-start space-x-2">
              <div className='flex items-center space-x-1 cursor-text'>
                <Badge className='bg-green-100 text-green-800 border-green-200'>+ {question.positiveMarks}</Badge>
                <Badge className="bg-red-100 text-red-800 border-red-200">- {question.negativeMarks}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className='cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewQuestion(question);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent onClick={() => toggleSelection(question.id)}>
          {/* Render 3 layers with proper conditional content */}
          {renderLayer(question.layer1Type, question.layer1Text, question.layer1Image)}
          {renderLayer(question.layer2Type, question.layer2Text, question.layer2Image)}
          {renderLayer(question.layer3Type, question.layer3Text, question.layer3Image)}

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-3">
              <span className='text-[12px] py-4 mt-[0.5px] cursor-text'>Tags: </span>
              {question.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs cursor-text">{tag}</Badge>
              ))}
              {question.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs cursor-text">+{question.tags.length - 3}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  });
  QuestionCard.displayName = 'QuestionCard';

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2 text-red-600">Failed to Load Questions</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshQuestions} variant="outline" className='cursor-pointer'>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main content
  const content = (
    <div className="space-y-6 px-2">
      {/* Permission Warning */}
      {!userPermissions.canCreateQuestions && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Shield className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-1">Limited Access</div>
            {!userPermissions.hasToken ? (
              'You are not authenticated. Please log in to access question creation features.'
            ) : !userPermissions.isActive ? (
              'Your account is not active. Please contact an administrator.'
            ) : (
              `You do not have permission to create questions. Current role: ${userPermissions.userRole}`
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mt-[-10px]">
        <div>
          <h2 className="text-2xl font-bold">Add Questions</h2>
          <p className="text-muted-foreground">
            Select questions to add to {section?.name || 'your exam section'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{selectedCount} selected</Badge>
          <Badge variant="outline">{filteredQuestions.length} available</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, subjects, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Subject</Label>
              <Select value={filters.subject} onValueChange={(value) => updateFilter('subject', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {filterOptions.subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={filters.difficulty} onValueChange={(value) => updateFilter('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {filterOptions.difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Topic</Label>
              <Select value={filters.topic} onValueChange={(value) => updateFilter('topic', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {filterOptions.topics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearAll} className="w-full cursor-pointer">
                Clear All
              </Button>
            </div>
          </div>

          {/* Tags Filter */}
          {filterOptions.allTags.length > 0 && (
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filterOptions.allTags.slice(0, 15).map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    <Tags className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {filterOptions.allTags.length > 15 && (
                  <Badge variant="outline" className="cursor-default">
                    +{filterOptions.allTags.length - 15} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            className='cursor-pointer'
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            className='cursor-pointer'
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredQuestions.length} questions
        </div>
      </div>

      {/* Questions Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {questions.length === 0
                ? 'No questions available in the database.'
                : 'Try adjusting your search criteria or filters to find questions.'
              }
            </p>
            {questions.length === 0 && (
              <Button onClick={refreshQuestions} variant="outline" className='cursor-pointer'>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }>
            {filteredQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                isSelected={selectedQuestions.has(question.id)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading more questions...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Load More Questions
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Question Preview Dialog */}
      <QuestionPreviewDialog
        previewQuestion={previewQuestion}
        setPreviewQuestion={setPreviewQuestion}
        selectedQuestions={selectedQuestions}
        toggleSelection={toggleSelection}
        getDifficultyColor={getDifficultyColor}
        handleAddQuestions={handleAddQuestions}
        addingQuestions={addingQuestions}
        selectedCount={selectedCount}
        onClose={onClose}
        mode={mode}
      />
    </div>
  );

  // Render based on mode
  if (mode === 'dialog') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto pb-0">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          {content}
          <div className="flex justify-between items-center py-4 border-t sticky bottom-0 bg-white">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">
                {selectedCount} question{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2 bg-white">
              {mode === 'dialog' && (
                <Button variant="outline" onClick={onClose} className='cursor-pointer'>
                  Cancel
                </Button>
              )}
              <Button
                className='cursor-pointer'
                onClick={handleAddQuestions}
                disabled={selectedCount === 0 || addingQuestions || !userPermissions.canCreateQuestions}
                title={!userPermissions.canCreateQuestions ? 'You do not have permission to add questions' : undefined}
              >
                {addingQuestions ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {selectedCount} Question{selectedCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return content;
};

export default AddQuestionsSection;
