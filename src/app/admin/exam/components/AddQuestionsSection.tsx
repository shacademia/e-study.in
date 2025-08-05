'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { useUsedQuestions } from '@/contexts/UsedQuestionsContext';

// Custom hooks
import { useQuestions } from '../create/hooks/useQuestions';
import { useQuestionSelection } from '../create/hooks/useQuestionSelection';
import { useQuestionFilters } from '../create/hooks/useQuestionFilters';
import { useDebounce } from '../create/hooks/useDebounce';
import { useUserPermissions } from '../create/hooks/useUserPermissions';
import QuestionPreviewDialog from './QuestionPreviewDialog';
import { QuestionsPagination } from './QuestionsPagination';

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
  const {
    questions,
    FilterMetadata,
    loading,
    error,
    loadQuestions,
    refreshQuestions,
    hasMore,
    currentPage,
    totalQuestions,
    totalPages,
    itemsPerPage
  } = useQuestions();
  const { selectedQuestions, toggleSelection, clearSelection, selectedCount } = useQuestionSelection();
  const { filters, updateFilter, toggleTag, clearFilters, filterOptions } = useQuestionFilters(questions);
  const userPermissions = useUserPermissions();
  const { usedQuestionIds, addUsedQuestions, isQuestionUsed } = useUsedQuestions();

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [addingQuestions, setAddingQuestions] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  const [isSearching, setIsSearching] = useState(false);

  // Memoized callbacks to prevent unnecessary re-renders
  // const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchTerm(e.target.value);
  // }, []);


  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout - only update state after user stops typing
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value); // ✅ Only updates state after 300ms
    }, 300);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);


  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handlePreviewQuestion = useCallback((question: Question) => {
    setPreviewQuestion(question);
  }, []);

  // Memoized filter handlers
  const handleSubjectChange = useCallback((value: string) => {
    updateFilter('subject', value);
  }, [updateFilter]);

  const handleDifficultyChange = useCallback((value: string) => {
    updateFilter('difficulty', value);
  }, [updateFilter]);

  const handleTopicChange = useCallback((value: string) => {
    updateFilter('topic', value);
  }, [updateFilter]);
  // const debouncedSearchTerm = useDebounce(searchTerm, 300);
  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    const params = {
      page,
      limit: itemsPerPage,
      subject: filters.subject !== 'all' ? filters.subject : undefined,
      difficulty: filters.difficulty !== 'all' ? filters.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : undefined,
      topic: filters.topic !== 'all' ? filters.topic : undefined,
      tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
      search: debouncedSearchTerm || undefined,
    };

    console.log(`📄 Loading page ${page} with filters:`, params);
    loadQuestions(params);
  }, [itemsPerPage, filters.subject, filters.difficulty, filters.topic, filters.tags, debouncedSearchTerm, loadQuestions]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    const params = {
      page: 1, // Reset to first page when changing items per page
      limit: newItemsPerPage,
      subject: filters.subject !== 'all' ? filters.subject : undefined,
      difficulty: filters.difficulty !== 'all' ? filters.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : undefined,
      topic: filters.topic !== 'all' ? filters.topic : undefined,
      tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
      search: debouncedSearchTerm || undefined,
    };

    console.log(`📊 Changing items per page to ${newItemsPerPage}`);
    loadQuestions(params);
  }, [filters.subject, filters.difficulty, filters.topic, filters.tags, debouncedSearchTerm, loadQuestions]);



  // Debounced search term for loading questions - optimized delay

  // Track search state for better UX
  // useEffect(() => {
  //   if (searchTerm !== debouncedSearchTerm) {
  //     setIsSearching(true);
  //   } else {
  //     setIsSearching(false);
  //   }
  // }, [searchTerm, debouncedSearchTerm]);

  // Load questions when filters or search changes
  React.useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (isCancelled) return;

      const params = {
        page: 1, // Always start from page 1 when filters change
        limit: itemsPerPage,
        subject: filters.subject !== 'all' ? filters.subject : undefined,
        difficulty: filters.difficulty !== 'all' ? filters.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : undefined,
        topic: filters.topic !== 'all' ? filters.topic : undefined,
        tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
        search: debouncedSearchTerm || undefined,
      };

      const startTime = performance.now();
      console.log('🔍 Backend API call with filters:', params);

      // Reset and load first batch
      await loadQuestions(params, { reset: true });

      const endTime = performance.now();
      console.log(`⚡ Search completed in ${(endTime - startTime).toFixed(2)}ms`);
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [filters.subject, filters.difficulty, filters.topic, filters.tags, debouncedSearchTerm, itemsPerPage, loadQuestions]);

  // All filtering is now done at backend level - no client-side filtering needed!
  // Just use the questions directly from the API response
  const filteredQuestions = questions;

  // Separate available and used questions for better UX - optimized with early returns
  const { availableQuestions, usedQuestions } = useMemo(() => {
    if (filteredQuestions.length === 0) {
      return { availableQuestions: [], usedQuestions: [] };
    }

    if (usedQuestionIds.size === 0) {
      return { availableQuestions: filteredQuestions, usedQuestions: [] };
    }

    const available: Question[] = [];
    const used: Question[] = [];

    // Single loop instead of two filter operations
    for (const question of filteredQuestions) {
      if (isQuestionUsed(question.id)) {
        used.push(question);
      } else {
        available.push(question);
      }
    }

    // Debug logging
    console.log('🔍 Question separation:', {
      totalFiltered: filteredQuestions.length,
      usedQuestionIdsCount: usedQuestionIds.size,
      availableCount: available.length,
      usedCount: used.length,
      usedQuestionIds: Array.from(usedQuestionIds)
    });

    return { availableQuestions: available, usedQuestions: used };
  }, [filteredQuestions, usedQuestionIds, isQuestionUsed]);



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

      // Add questions to global used questions context (even in demo mode)
      const newlyAddedQuestionIds = Array.from(selectedQuestions);
      addUsedQuestions(newlyAddedQuestionIds);
      console.log(`🎯 Demo mode: Added ${newlyAddedQuestionIds.length} questions to global used questions context`);

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

      // Add questions to global used questions context
      const newlyAddedQuestionIds = Array.from(selectedQuestions);
      addUsedQuestions(newlyAddedQuestionIds);
      console.log(`🎯 Added ${newlyAddedQuestionIds.length} questions to global used questions context`);

      toast({
        title: 'Questions Added Successfully',
        description: `Successfully added ${selectedCount} questions to ${section?.name || 'the section'}`,
      });

      clearSelection();
      onQuestionsAdded?.(addedQuestions, selectedCount);

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
    // setSearchTerm('');
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
  const QuestionCard = React.memo(({
    question,
    isSelected,
    isUsed = false
  }: {
    question: Question;
    isSelected: boolean;
    isUsed?: boolean;
  }) => {
    // Handle card click
    const handleCardClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isUsed) {
        console.log(`🖱️ Card clicked for question: ${question.id}`);
        toggleSelection(question.id);
      }
    }, [question.id, isUsed, toggleSelection]);

    // Handle checkbox click
    const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isUsed) {
        console.log(`☑️ Checkbox clicked for question: ${question.id}`);
        toggleSelection(question.id);
      }
    }, [question.id, isUsed, toggleSelection]);
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
      <Card className={`transition-all ${isUsed
        ? 'opacity-60 bg-gray-50 border-gray-300 cursor-not-allowed'
        : isSelected
          ? 'ring-2 ring-blue-500 bg-blue-50 hover:shadow-md cursor-pointer'
          : 'hover:shadow-md cursor-pointer'
        }`} onClick={handleCardClick}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isSelected}
                disabled={isUsed}
                onCheckedChange={() => {
                  if (!isUsed) {
                    toggleSelection(question.id);
                  }
                }}
                onClick={handleCheckboxClick}
              />
              {isUsed && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                  Already Used
                </Badge>
              )}
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
                  handlePreviewQuestion(question);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
  }, (prevProps, nextProps) => {
    // Custom comparison function for better memoization
    return (
      prevProps.question.id === nextProps.question.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isUsed === nextProps.isUsed
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
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {availableQuestions.length} available
          </Badge>
          {usedQuestions.length > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {usedQuestions.length} already used
            </Badge>
          )}
          {totalQuestions > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {totalQuestions.toLocaleString()} total
            </Badge>
          )}
          {/* Debug info */}
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Global: {usedQuestionIds.size}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filters
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              ⚡ Backend Optimized
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, subjects, topics..."
              // value={searchTerm}
              ref={searchInputRef}
              onChange={handleSearchChange}
              className="pl-10"
              autoComplete="off"
              spellCheck="false"
            />
            {/* Search loading indicator */}
            {(loading || isSearching) && debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Subject</Label>
              <Select
                value={filters.subject}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {FilterMetadata && FilterMetadata.subjects?.length > 0 ? (
                    FilterMetadata.subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-data" value="no-data">
                      Data not available
                    </SelectItem>
                  )}

                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={filters.difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {FilterMetadata && FilterMetadata.difficulties?.length > 0 ? (
                    FilterMetadata.difficulties.map(difficulties => (
                      <SelectItem key={difficulties} value={difficulties}>
                        {difficulties}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-data" value="no-data">
                      Data not available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Topic</Label>
              <Select value={filters.topic} onValueChange={handleTopicChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {FilterMetadata && FilterMetadata.topics?.length > 0 ? (
                    FilterMetadata.topics.map(topic => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-data" value="no-data">
                      Data not available
                    </SelectItem>
                  )}
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
          {FilterMetadata && FilterMetadata?.tags.length > 0 && (
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {FilterMetadata?.tags.slice(0, 15).map(tag => (
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
                {FilterMetadata && FilterMetadata?.tags.length > 15 && (
                  <Badge variant="outline" className="cursor-default">
                    +{FilterMetadata?.tags.length - 15} more
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
            onClick={() => handleViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            className='cursor-pointer'
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {availableQuestions.length} available, {usedQuestions.length} already used
            {totalQuestions > 0 && (
              <span className="ml-2 text-blue-600">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>
          <div className="text-xs text-green-600 flex items-center">
            ⚡ Database-level filtering & pagination
          </div>
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
      ) : (availableQuestions.length + usedQuestions.length) === 0 ? (
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
          <div className="space-y-6">
            {/* Available Questions */}
            {availableQuestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-700">
                  Available Questions ({availableQuestions.length})
                </h3>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                }>
                  {availableQuestions.map(question => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      isSelected={selectedQuestions.has(question.id)}
                      isUsed={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Used Questions */}
            {usedQuestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-700">
                  Already Used in This Exam ({usedQuestions.length})
                </h3>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                }>
                  {usedQuestions.map(question => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      isSelected={false}
                      isUsed={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <QuestionsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalQuestions={totalQuestions}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            isLoading={loading}
            className="mt-6"
          />
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
