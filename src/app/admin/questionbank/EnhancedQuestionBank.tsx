'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageUploadComponent from '@/components/ui/image-upload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  BookOpen,
  Tag,
  CheckCircle,
  Grid,
  List,
  RefreshCw,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Question, CreateQuestionRequest, UpdateQuestionRequest } from '@/constants/types';
import { 
  useQuestions, 
  useFilteredQuestions, 
  useQuestionsLoading, 
  useQuestionsError,
  useQuestionActions,
  useQuestionFilters,
  useStoreInitialization
} from '@/store';
import { questionService } from '@/services/question';

interface EnhancedQuestionBankProps {
  onBack: () => void;
  onSelectQuestions?: (questions: Question[]) => void;
  multiSelect?: boolean;
  preSelectedQuestions?: string[];
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface NewQuestion {
  content: string;
  questionImage?: string; // ImageKit URL for question image
  options: string[];
  optionImages: string[]; // Array of ImageKit URLs for option images
  correctOption: number;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  tags: string;
}

const EnhancedQuestionBank: React.FC<EnhancedQuestionBankProps> = ({
  onBack,
}) => {
  // Initialize stores
  useStoreInitialization();

  // Store hooks
  const questions = useQuestions();
  console.log('Questions:', questions.length, questions.slice(0, 2)); // Debugging: log first 2 questions
  const filteredQuestions = useFilteredQuestions();
  console.log('Filtered Questions:', filteredQuestions.length, filteredQuestions.slice(0, 2)); // Debugging: log first 2 filtered questions
  const isLoading = useQuestionsLoading();
  const error = useQuestionsError();
  const { fetchQuestions, createQuestion, updateQuestion, deleteQuestion, setFilters, resetFilters } = useQuestionActions();
  // console.log('Question Actions:', { fetchQuestions, setFilters, resetFilters });

  const { filters } = useQuestionFilters();

  // Local state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchText, setSearchText] = useState(filters.search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  // New question form state
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    content: '',
    questionImage: '',
    options: ['', '', '', ''],
    optionImages: ['', '', '', ''],
    correctOption: 0,
    subject: '',
    topic: '',
    difficulty: 'EASY',
    tags: ''
  });

  // Available options for filters (derived from questions)
  const subjects = React.useMemo(() => 
    [...new Set(questions.map(q => q.subject))], [questions]
  );
  
  const topics = React.useMemo(() => 
    [...new Set(questions.map(q => q.topic))], [questions]
  );
  
  const allTags = React.useMemo(() => 
    [...new Set(questions.flatMap(q => q.tags))], [questions]
  );

  // Debug logging
  React.useEffect(() => {
    console.log('QuestionBank Debug:', {
      questionsLength: questions.length,
      filteredQuestionsLength: filteredQuestions.length,
      isLoading,
      error,
      filters,
      searchText,
      strategy: questions.length === 0 ? 'NETWORK_FETCH' : 'LOCAL_FILTER',
      questions: questions.slice(0, 2), // Show first 2 questions for debugging
    });
  }, [questions, filteredQuestions, isLoading, error, filters, searchText]);

  // Debounced search effect
  useEffect(() => {
    if (searchText !== filters.search) {
      setIsSearching(true);
    }
    
    const timeout = setTimeout(async () => {
      try {
        await setFilters({ search: searchText.trim() });
      } catch (error) {
        console.error('Filter error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // debounce delay

    return () => {
      clearTimeout(timeout);
      setIsSearching(false);
    };
  }, [searchText, setFilters, filters.search]);

  // Sync local search text with store filter
  useEffect(() => {
    setSearchText(filters.search || '');
  }, [filters.search]);

  // Additional debugging for initial load
  React.useEffect(() => {
    console.log('Component mounted, triggering fetchQuestions...');
    
    // Don't reset filters on mount to preserve user's filter state
    
    fetchQuestions().then(() => {
      console.log('fetchQuestions completed');
    }).catch(err => {
      console.error('fetchQuestions failed:', err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update store filters when local search changes
  const handleSearchChange = (value: string) => {
    console.log('Search change:', value);
    setSearchText(value);
  };

  // Handle filter changes
  const handleFilterChange = async (key: string, value: string) => {
    console.log('Filter change:', { key, value, currentFilters: filters });
    const newFilters = { ...filters, [key]: value };
    console.log('New filters:', newFilters);
    
    try {
      await setFilters(newFilters);
    } catch (error) {
      console.error('Filter change error:', error);
    }
  };

  // Handle adding a new question
  const handleAddQuestion = async () => {
    try {
      setIsCreating(true);
      
      const question: CreateQuestionRequest = {
        content: newQuestion.content,
        questionImage: newQuestion.questionImage || undefined,
        options: newQuestion.options,
        optionImages: newQuestion.optionImages.filter(img => img !== ''),
        correctOption: newQuestion.correctOption,
        subject: newQuestion.subject,
        topic: newQuestion.topic,
        difficulty: newQuestion.difficulty,
        tags: newQuestion.tags.split(',').map((t) => t.trim()).filter((t) => t)
      };

      await createQuestion(question);

      toast({
        title: 'Success',
        description: 'Question added successfully'
      });

      setNewQuestion({
        content: '',
        questionImage: '',
        options: ['', '', '', ''],
        optionImages: ['', '', '', ''],
        correctOption: 0,
        subject: '',
        topic: '',
        difficulty: 'EASY',
        tags: ''
      });
      setShowAddQuestion(false);
    } catch (error: unknown) {
      console.error('Failed to add question:', error);
      
      // Clear any previous operation error
      setOperationError(null);
      
      // Show specific error messages based on the error
      let errorMessage = 'Failed to add question';
      let errorTitle = 'Error';
      
      // Safely extract error message
      const errorMsg = error instanceof Error ? error.message : 
                      (error && typeof error === 'object' && 'message' in error) ? 
                      String((error as { message: unknown }).message) : 
                      'Unknown error';
      
      if (errorMsg.includes('permission') || errorMsg.includes('403')) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to create questions. Please contact your administrator to get ADMIN or MODERATOR access.';
        setOperationError('insufficient_permissions');
      } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (errorMsg.includes('validation') || errorMsg.includes('400')) {
        errorTitle = 'Validation Error';
        errorMessage = 'Please check that all required fields are filled correctly.';
      } else {
        errorMessage = errorMsg || 'An unexpected error occurred while creating the question.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle editing question
  const handleEditQuestion = async (question: Question) => {
    // Validation
    if (!question.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Question content is required",
        variant: 'destructive'
      });
      return;
    }

    if (question.options.some(option => !option.trim())) {
      toast({
        title: "Validation Error", 
        description: "All answer options are required",
        variant: 'destructive'
      });
      return;
    }

    if (!question.subject.trim() || !question.topic.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and topic are required",
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const updates: UpdateQuestionRequest = {
        content: question.content.trim(),
        options: question.options.map(opt => opt.trim()),
        correctOption: question.correctOption,
        subject: question.subject.trim(),
        topic: question.topic.trim(),
        difficulty: question.difficulty,
        tags: question.tags.filter(tag => tag.trim() !== "")
      };

      await updateQuestion(question.id, updates);

      toast({
        title: "Success",
        description: "Question updated successfully"
      });

      setEditingQuestion(null);
    } catch (error: unknown) {
      console.error("Failed to edit question:", error);
      
      // Clear any previous operation error
      setOperationError(null);
      
      // Show specific error messages based on the error
      let errorMessage = 'Failed to update question';
      let errorTitle = 'Error';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = (error as { message: string }).message;
        
        if (errorMsg.includes('permission') || errorMsg.includes('403')) {
          errorTitle = 'Permission Denied';
          errorMessage = 'You do not have permission to edit this question.';
          setOperationError('insufficient_permissions');
        } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
          errorTitle = 'Authentication Required';
          errorMessage = 'Your session has expired. Please log in again.';
        } else {
          errorMessage = errorMsg || 'An unexpected error occurred while updating the question.';
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting question
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);
      
      toast({
        title: 'Deleted',
        description: 'Question deleted successfully'
      });
    } catch (error: unknown) {
      console.error('Failed to delete question:', error);
      
      // Clear any previous operation error
      setOperationError(null);
      
      // Show specific error messages based on the error
      let errorMessage = 'Failed to delete question';
      let errorTitle = 'Error';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = (error as { message: string }).message;
        
        if (errorMsg.includes('permission') || errorMsg.includes('403')) {
          errorTitle = 'Permission Denied';
          errorMessage = 'You do not have permission to delete this question.';
          setOperationError('insufficient_permissions');
        } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
          errorTitle = 'Authentication Required';
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (errorMsg.includes('409') || errorMsg.includes('used in exams') || errorMsg.includes('being used') || errorMsg.includes('QUESTION_IN_USE') || 
                 (error && typeof error === 'object' && 'code' in error && error.code === 'QUESTION_IN_USE')) {
          errorTitle = 'Question In Use';
          errorMessage = 'This question cannot be deleted because it is currently being used in one or more active exams. Please remove it from all exams before deleting.';
          
          // Set a specific error type for UI handling
          setOperationError('question_in_use');
          
          // Create a custom alert for this specific error
          toast({
            title: "Question In Use",
            description: (
              <div className="space-y-2">
                <p>Cannot delete question that is used in exams.</p>
                <div className="text-xs text-muted-foreground">
                  To delete this question, you must first remove it from all exams where it is being used.
                </div>
              </div>
            ),
            variant: "destructive",
            duration: 8000 // longer duration to ensure user sees it
          });
        } else {
          errorMessage = errorMsg || 'An unexpected error occurred while deleting the question.';
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Handle duplicating question
  const handleDuplicateQuestion = async (questionId: string) => {
    try {
      // Find the original question
      const originalQuestion = questions.find(q => q.id === questionId);
      if (!originalQuestion) {
        throw new Error('Question not found');
      }

      // Create a copy without the ID
      const duplicateData = {
        content: `Copy of ${originalQuestion.content}`,
        options: [...originalQuestion.options],
        correctOption: originalQuestion.correctOption,
        subject: originalQuestion.subject,
        topic: originalQuestion.topic,
        difficulty: originalQuestion.difficulty,
        tags: [...originalQuestion.tags]
      };

      await questionService.createQuestion(duplicateData);
      
      toast({
        title: 'Duplicated',
        description: 'Question duplicated successfully'
      });

      await fetchQuestions(); // Reload questions
    } catch (error) {
      console.error('Failed to duplicate question:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate question',
        variant: 'destructive'
      });
    }
  };

  // Handle tag filtering
  const handleTagFilter = (tag: string) => {
    // For now, just log since tags aren't in the current filter structure
    console.log('Tag filter clicked:', tag);
  };

  // Clear all filters
  const clearFilters = () => {
    console.log('Clearing filters...');
    setSearchText('');
    resetFilters();
    setIsSearching(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground">Manage your question database</p>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <p className="text-lg font-medium">Loading Questions</p>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your question bank...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground">Manage your question database</p>
          </div>
        </div>

        {/* Error Alert */}
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Unable to Load Questions
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-3">
              <p>We&apos;re having trouble loading your questions. This could be due to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Network connectivity issues</li>
                <li>Server temporarily unavailable</li>
                <li>Authentication problems</li>
              </ul>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => {
                    fetchQuestions();
                  }}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Refresh Page
                </Button>
              </div>
              {error && (
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer text-muted-foreground">Technical Details</summary>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs">{error}</code>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">
            Manage questions for exams ({filteredQuestions.length} of {questions.length} questions)
          </p>
          {/* Temporary debug info */}
          <div className="text-xs text-gray-500 mt-1">
            Debug: isLoading={isLoading.toString()}, error={error || 'none'}, 
            questions={questions.length}, filtered={filteredQuestions.length}, 
            strategy={questions.length === 0 ? 'NETWORK' : 'LOCAL'}
          </div>
        </div>
      </div>

      {/* Permission Warning Banner */}
      {operationError === 'insufficient_permissions' && (
        <Alert variant="destructive">
          <AlertTitle className="flex items-center gap-2">
            🔒 Permission Required
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>You need ADMIN or MODERATOR privileges to create, edit, or delete questions.</p>
              <p className="text-sm">Contact your system administrator to request elevated permissions.</p>
              <Button 
                onClick={() => setOperationError(null)} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              {isSearching ? (
                <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder="Search questions..."
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>

              <Button onClick={() => setShowAddQuestion(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Select 
                    value={filters.subject} 
                    onValueChange={(value) => handleFilterChange('subject', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select 
                    value={filters.difficulty} 
                    onValueChange={(value) => handleFilterChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Difficulties</SelectItem>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Topic</Label>
                  <Select 
                    value={filters.topic} 
                    onValueChange={(value) => handleFilterChange('topic', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Topics</SelectItem>
                      {topics.map(topic => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      console.log('Manual filter reset and fetch');
                      setSearchText('');
                      resetFilters();
                      setIsSearching(false);
                      fetchQuestions();
                    }} 
                    className="w-full"
                  >
                    Show All
                  </Button>
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mt-4">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleTagFilter(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      question.difficulty === 'EASY' ? 'secondary' :
                      question.difficulty === 'MEDIUM' ? 'default' : 'destructive'
                    }>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline">{question.subject}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{question.topic}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateQuestion(question.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the question.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                      
                      {/* Additional context for specific error conditions */}
                      {operationError === 'question_in_use' && (
                        <div className="mt-4 pt-4 border-t">
                          <Alert variant="destructive" className="bg-amber-50">
                            <AlertTitle className="text-amber-700">Question In Use Warning</AlertTitle>
                            <AlertDescription className="text-amber-600">
                              <p className="mb-2">This question may be used in one or more exams.</p>
                              <p className="text-xs">Questions that are used in exams cannot be deleted. 
                              You&apos;ll need to remove this question from all exams before it can be deleted.</p>
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3 line-clamp-3">{question.content}</p>
              
              {/* Question Image */}
              {question.questionImage && (
                <div className="mb-3">
                  <Image
                    src={question.questionImage}
                    alt="Question image"
                    width={300}
                    height={200}
                    className="rounded-md object-contain border bg-white"
                    style={{ minHeight: '200px', maxHeight: '200px' }}
                    onError={(e) => {
                      console.error('Failed to load question image:', question.questionImage);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Options */}
              <div className="space-y-1 mb-3">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                      index === question.correctOption 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className={index === question.correctOption ? 'font-medium text-green-800' : ''}>
                        {option}
                      </span>
                      {/* Option Image */}
                      {question.optionImages && question.optionImages[index] && (
                        <Image
                          src={question.optionImages[index]}
                          alt={`Option ${String.fromCharCode(65 + index)} image`}
                          width={80}
                          height={60}
                          className="rounded-sm object-contain border bg-white"
                          style={{ minHeight: '60px', maxHeight: '60px' }}
                          onError={(e) => {
                            console.error('Failed to load option image:', question.optionImages?.[index]);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    {index === question.correctOption && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                ))}
              </div>

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first question.
            </p>
            <Button onClick={() => setShowAddQuestion(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No matching questions</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search or filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Add/Edit Question Dialog */}
      <Dialog open={showAddQuestion || editingQuestion !== null} onOpenChange={(open) => {
        if (!open) {
          setShowAddQuestion(false);
          setEditingQuestion(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Update the question details below.' : 'Create a new question for your question bank.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question Content */}
            <div>
              <Label htmlFor="content">Question Content *</Label>
              <Textarea
                id="content"
                value={editingQuestion ? editingQuestion.content : newQuestion.content}
                onChange={(e) => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, content: e.target.value });
                  } else {
                    setNewQuestion({ ...newQuestion, content: e.target.value });
                  }
                }}
                placeholder="Enter the question..."
                className="min-h-24"
                required
              />
            </div>

            {/* Question Image */}
            <div>
              <ImageUploadComponent
                label="Question Image (Optional)"
                placeholder="Upload an image for the question"
                folder="questions"
                tags="question"
                currentImageUrl={editingQuestion?.questionImage || newQuestion.questionImage}
                onImageUpload={(imageUrl) => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, questionImage: imageUrl });
                  } else {
                    setNewQuestion({ ...newQuestion, questionImage: imageUrl });
                  }
                }}
                onImageRemove={() => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, questionImage: undefined });
                  } else {
                    setNewQuestion({ ...newQuestion, questionImage: '' });
                  }
                }}
              />
            </div>

            {/* Options */}
            <div>
              <Label>Answer Options *</Label>
              <div className="space-y-4">
                {(editingQuestion ? editingQuestion.options : newQuestion.options).map((option, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editingQuestion ? editingQuestion.options : newQuestion.options)];
                          newOptions[index] = e.target.value;
                          if (editingQuestion) {
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          } else {
                            setNewQuestion({ ...newQuestion, options: newOptions });
                          }
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        required
                      />
                    </div>
                    
                    {/* Option Image Upload */}
                    <div className="ml-10">
                      <ImageUploadComponent
                        label={`Option ${String.fromCharCode(65 + index)} Image (Optional)`}
                        placeholder={`Upload image for option ${String.fromCharCode(65 + index)}`}
                        folder="questions/options"
                        tags={`question,option,option-${index}`}
                        currentImageUrl={
                          editingQuestion?.optionImages?.[index] || 
                          newQuestion.optionImages[index]
                        }
                        onImageUpload={(imageUrl) => {
                          const newOptionImages = editingQuestion 
                            ? [...(editingQuestion.optionImages || ['', '', '', ''])]
                            : [...newQuestion.optionImages];
                          newOptionImages[index] = imageUrl;
                          
                          if (editingQuestion) {
                            setEditingQuestion({ ...editingQuestion, optionImages: newOptionImages });
                          } else {
                            setNewQuestion({ ...newQuestion, optionImages: newOptionImages });
                          }
                        }}
                        onImageRemove={() => {
                          const newOptionImages = editingQuestion 
                            ? [...(editingQuestion.optionImages || ['', '', '', ''])]
                            : [...newQuestion.optionImages];
                          newOptionImages[index] = '';
                          
                          if (editingQuestion) {
                            setEditingQuestion({ ...editingQuestion, optionImages: newOptionImages });
                          } else {
                            setNewQuestion({ ...newQuestion, optionImages: newOptionImages });
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div>
              <Label>Correct Answer *</Label>
              <Select
                value={(editingQuestion ? editingQuestion.correctOption : newQuestion.correctOption).toString()}
                onValueChange={(value) => {
                  const correctOption = parseInt(value);
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, correctOption });
                  } else {
                    setNewQuestion({ ...newQuestion, correctOption });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3].map((index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Option {String.fromCharCode(65 + index)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject and Topic */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={editingQuestion ? editingQuestion.subject : newQuestion.subject}
                  onChange={(e) => {
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, subject: e.target.value });
                    } else {
                      setNewQuestion({ ...newQuestion, subject: e.target.value });
                    }
                  }}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  value={editingQuestion ? editingQuestion.topic : newQuestion.topic}
                  onChange={(e) => {
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, topic: e.target.value });
                    } else {
                      setNewQuestion({ ...newQuestion, topic: e.target.value });
                    }
                  }}
                  placeholder="e.g., Algebra"
                  required
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <Label>Difficulty *</Label>
              <Select
                value={editingQuestion ? editingQuestion.difficulty : newQuestion.difficulty}
                onValueChange={(value: Difficulty) => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, difficulty: value });
                  } else {
                    setNewQuestion({ ...newQuestion, difficulty: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={editingQuestion ? editingQuestion.tags.join(', ') : newQuestion.tags}
                onChange={(e) => {
                  if (editingQuestion) {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                    setEditingQuestion({ ...editingQuestion, tags });
                  } else {
                    setNewQuestion({ ...newQuestion, tags: e.target.value });
                  }
                }}
                placeholder="Enter tags separated by commas"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddQuestion(false);
                  setEditingQuestion(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingQuestion) {
                    handleEditQuestion(editingQuestion);
                  } else {
                    handleAddQuestion();
                  }
                }}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {editingQuestion ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingQuestion ? 'Update Question' : 'Add Question'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedQuestionBank;
