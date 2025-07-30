'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  CheckCircle,
  Grid,
  List,
  RefreshCw,
  Upload,
  Eye,
  Tags,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Question, CreateQuestionRequest } from '@/constants/types';
import {
  useQuestions,
  useFilteredQuestions,
  useQuestionsLoading,
  useQuestionsError,
  useQuestionActions,
  useQuestionFilters,
  useStoreInitialization
} from '@/store';
import MathDisplay from '../../_questionbank/components/math-display';
import QuestionPreviewDialog from '../../exam/components/QuestionPreviewDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { QuestionForm } from '../components/forms/QuestionForm';

// Enhanced BulkUploadForm with better error handling
const BulkUploadForm = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      validateFile(file);
    }
  };

  const validateFile = async (file: File) => {
    setIsValidating(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('File must contain an array of questions');
      }
      
      // Basic validation
      if (data.length === 0) {
        throw new Error('File is empty');
      }
      
      toast({
        title: 'File Valid',
        description: `Found ${data.length} questions in file`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('File validation error:', error);
      toast({
        title: 'Invalid File',
        description: error instanceof Error ? error.message : 'Invalid JSON file',
        variant: 'destructive'
      });
      setSelectedFile(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
          Upload JSON file with questions
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <span className="text-sm">{selectedFile.name}</span>
            {isValidating && <RefreshCw className="h-4 w-4 animate-spin" />}
          </div>
          <Button onClick={handleUpload} size="sm" disabled={isValidating}>
            Upload
          </Button>
        </div>
      )}
    </div>
  );
};

interface QuestionBankContainerProps {
  onBack: () => void;
  onSelectQuestions?: (questions: Question[]) => void;
  multiSelect?: boolean;
  preSelectedQuestions?: string[];
}

export const QuestionBankContainer: React.FC<QuestionBankContainerProps> = ({
  onBack,
  onSelectQuestions,
  multiSelect = false,
  preSelectedQuestions = []
}) => {
  // Initialize stores
  useStoreInitialization();

  // Store hooks
  const questions = useQuestions();
  const filteredQuestions = useFilteredQuestions();
  const isLoading = useQuestionsLoading();
  const error = useQuestionsError();
  const { fetchQuestions, createQuestion, updateQuestion, deleteQuestion, setFilters, resetFilters } = useQuestionActions();
  const { filters } = useQuestionFilters();

  // Local state - minimized
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [searchText, setSearchText] = useState(filters.search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(preSelectedQuestions);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // ✅ NEW: Tag filtering state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  // Optimized new question form state
  const defaultQuestion: CreateQuestionRequest = useMemo(() => ({
    content: '',
    questionImage: '',
    layer1Type: 'none',
    layer1Text: '',
    layer1Image: '',
    layer2Type: 'none',
    layer2Text: '',
    layer2Image: '',
    layer3Type: 'none',
    layer3Text: '',
    layer3Image: '',
    options: ['', '', '', ''],
    optionImages: ['', '', '', ''],
    optionTypes: ['text', 'text', 'text', 'text'],
    correctOption: 0,
    positiveMarks: 4,
    negativeMarks: 1,
    explanationType: 'none',
    explanationText: '',
    explanationImage: '',
    difficulty: 'EASY',
    subject: '',
    topic: '',
    tags: [],
  }), []);

  const [newQuestion, setNewQuestion] = useState<CreateQuestionRequest>(defaultQuestion);

  // Memoized derived data - only recalculate when questions change
  const derivedData = useMemo(() => ({
    subjects: [...new Set(questions.map(q => q.subject))].filter(Boolean).sort(),
    topics: [...new Set(questions.map(q => q.topic))].filter(Boolean).sort(),
    allTags: [...new Set(questions.flatMap(q => q.tags || []))].filter(Boolean).sort()
  }), [questions]);

  // ✅ NEW: Filtered tags for search functionality
  const filteredTagsForDisplay = useMemo(() => {
    if (!tagSearchTerm) return derivedData.allTags.slice(0, 20);
    return derivedData.allTags
      .filter(tag => tag.toLowerCase().includes(tagSearchTerm.toLowerCase()))
      .slice(0, 20);
  }, [derivedData.allTags, tagSearchTerm]);

  // ✅ NEW: Client-side tag filtering combined with store filtering
  const tagFilteredQuestions = useMemo(() => {
    if (selectedTags.length === 0) return filteredQuestions;
    
    return filteredQuestions.filter(question => {
      // Question must have at least one of the selected tags
      return selectedTags.some(selectedTag => 
        question.tags && question.tags.includes(selectedTag)
      );
    });
  }, [filteredQuestions, selectedTags]);

  // Memoized difficulty color function
  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HARD': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Memoized question content renderer with error handling
  const renderQuestionContent = useCallback((question: Question) => {
    const layers = [];

    // Helper function to render images with error handling
    const renderImage = (src: string, alt: string, key: string) => (
      <div key={key} className="mb-2">
        <Image
          src={src}
          alt={alt}
          width={200}
          height={120}
          className="rounded-md object-contain max-h-32"
          unoptimized={true}
          onError={(e) => {
            console.error('Image load error:', src);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );

    // Layer 1
    if (question.layer1Type === 'text' && question.layer1Text?.trim()) {
      layers.push(
        <div key="layer1" className="mb-2">
          <MathDisplay>{question.layer1Text}</MathDisplay>
        </div>
      );
    } else if (question.layer1Type === 'image' && question.layer1Image?.trim()) {
      layers.push(renderImage(question.layer1Image, "Question layer 1", "layer1"));
    }

    // Layer 2
    if (question.layer2Type === 'text' && question.layer2Text?.trim()) {
      layers.push(
        <div key="layer2" className="mb-2">
          <MathDisplay>{question.layer2Text}</MathDisplay>
        </div>
      );
    } else if (question.layer2Type === 'image' && question.layer2Image?.trim()) {
      layers.push(renderImage(question.layer2Image, "Question layer 2", "layer2"));
    }

    // Layer 3
    if (question.layer3Type === 'text' && question.layer3Text?.trim()) {
      layers.push(
        <div key="layer3" className="mb-2">
          <MathDisplay>{question.layer3Text}</MathDisplay>
        </div>
      );
    } else if (question.layer3Type === 'image' && question.layer3Image?.trim()) {
      layers.push(renderImage(question.layer3Image, "Question layer 3", "layer3"));
    }

    // Fallback to legacy content
    if (layers.length === 0 && question.content?.trim()) {
      layers.push(
        <div key="legacy" className="mb-2">
          <MathDisplay>{question.content}</MathDisplay>
        </div>
      );
    }

    // Legacy question image
    if (question.questionImage?.trim()) {
      layers.push(renderImage(question.questionImage, "Question", "legacy-image"));
    }

    return layers.length > 0 ? layers : <span className="text-gray-500 italic">No content available</span>;
  }, []);

  // Fixed search effect with proper cleanup
  useEffect(() => {
    if (searchText === filters.search) return;

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        await setFilters({ ...filters, search: searchText.trim() });
      } catch (error) {
        console.error('Filter error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchText, filters, setFilters]);

  // Sync search text with store filter only when needed
  useEffect(() => {
    if (filters.search !== searchText) {
      setSearchText(filters.search || '');
    }
  }, [filters.search, searchText]);

  // Initial load - run only once
  useEffect(() => {
    fetchQuestions().catch(console.error);
  }, [fetchQuestions]);

  // Debug effect to track filter issues (remove in production)
  useEffect(() => {
    console.log('Filter Debug:', {
      storeFilters: filters,
      searchText,
      selectedTags,
      questionsCount: questions.length,
      filteredCount: filteredQuestions.length,
      tagFilteredCount: tagFilteredQuestions.length,
      isLoading,
      error
    });
  }, [filters, searchText, selectedTags, questions.length, filteredQuestions.length, tagFilteredQuestions.length, isLoading, error]);

  // ✅ NEW: Tag filtering handlers
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  }, []);

  const removeTag = useCallback((tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  }, []);

  const clearAllTags = useCallback(() => {
    setSelectedTags([]);
    setTagSearchTerm('');
  }, []);

  // Optimized handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  // Fixed filter change handler - no more "ALL" conversion
  const handleFilterChange = useCallback(async (key: string, value: string) => {
    // Convert "ALL" back to empty string for the store
    const filterValue = value === 'ALL' ? '' : value;
    const newFilters = { ...filters, [key]: filterValue };
    try {
      await setFilters(newFilters);
    } catch (error) {
      console.error('Filter change error:', error);
    }
  }, [filters, setFilters]);

  const clearFilters = useCallback(async () => {
    try {
      await resetFilters();
      setSearchText('');
      // ✅ NEW: Also clear tag filters
      setSelectedTags([]);
      setTagSearchTerm('');
    } catch (error) {
      console.error('Clear filters error:', error);
    }
  }, [resetFilters]);

  const toggleSelection = useCallback((questionId: string) => {
    if (!multiSelect) {
      const newSelected = selectedQuestions.includes(questionId) ? [] : [questionId];
      setSelectedQuestions(newSelected);
      if (onSelectQuestions) {
        const selectedQuestionObjects = questions.filter(q => newSelected.includes(q.id));
        onSelectQuestions(selectedQuestionObjects);
      }
      return;
    }
    
    const newSelected = selectedQuestions.includes(questionId)
      ? selectedQuestions.filter(id => id !== questionId)
      : [...selectedQuestions, questionId];
    
    setSelectedQuestions(newSelected);
    
    if (onSelectQuestions) {
      const selectedQuestionObjects = questions.filter(q => newSelected.includes(q.id));
      onSelectQuestions(selectedQuestionObjects);
    }
  }, [multiSelect, selectedQuestions, onSelectQuestions, questions]);

  // Optimized add question handler
  const handleAddQuestion = useCallback(async () => {
    try {
      setIsCreating(true);
      await createQuestion(newQuestion);
      toast({
        title: 'Success',
        description: 'Question added successfully'
      });
      setNewQuestion(defaultQuestion);
      setShowAddQuestion(false);
    } catch (error: unknown) {
      console.error('Failed to add question:', error);
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      let errorTitle = 'Error';
      let errorMessage = 'Failed to add question';

      if (errorMsg.includes('permission') || errorMsg.includes('403')) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to create questions.';
      } else if (errorMsg.includes('401')) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (errorMsg.includes('validation') || errorMsg.includes('400')) {
        errorTitle = 'Validation Error';
        errorMessage = 'Please check that all required fields are filled correctly.';
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  }, [newQuestion, createQuestion, defaultQuestion]);

  // Optimized edit question handler
  const handleEditQuestion = useCallback(async (updatedQuestion: Question) => {
    try {
      setIsUpdating(true);
      await updateQuestion(updatedQuestion.id, updatedQuestion);
      setEditingQuestion(null);
      toast({
        title: 'Success',
        description: 'Question updated successfully'
      });
    } catch (error: unknown) {
      console.error('Failed to update question:', error);
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Error',
        description: errorMsg.includes('permission') ? 'Permission denied' : 'Failed to update question',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  }, [updateQuestion]);

  // Optimized delete question handler
  const handleDeleteQuestion = useCallback(async (id: string) => {
    try {
      await deleteQuestion(id);
      toast({
        title: 'Success',
        description: 'Question deleted successfully'
      });
    } catch (error: unknown) {
      console.error('Failed to delete question:', error);
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Error',
        description: errorMsg.includes('permission') ? 'Permission denied' : 'Failed to delete question',
        variant: 'destructive'
      });
    }
  }, [deleteQuestion]);

  // Optimized bulk upload handler with parallel processing
  const handleBulkUpload = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const questionsData = JSON.parse(text);
      
      if (!Array.isArray(questionsData)) {
        throw new Error('File must contain an array of questions');
      }

      if (questionsData.length === 0) {
        throw new Error('File is empty');
      }

      // Create all questions in parallel for better performance
      const results = await Promise.allSettled(
        questionsData.map(questionData => createQuestion(questionData))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (failed > 0) {
        toast({
          title: 'Partial Success',
          description: `${successful} questions uploaded successfully, ${failed} failed`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Success',
          description: `${successful} questions uploaded successfully`
        });
      }
      
      setShowBulkUpload(false);
    } catch (error: unknown) {
      console.error('Failed to upload questions:', error);
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Upload Error',
        description: errorMsg.includes('JSON') ? 'Invalid JSON file format' : 'Failed to upload questions',
        variant: 'destructive'
      });
    }
  }, [createQuestion]);

  // ✅ UPDATED: Fixed active filter count to include tags
  const activeFilterCount = useMemo(() => {
    const storeFilters = [filters.difficulty, filters.subject, filters.topic]
      .filter(value => value && value.trim() !== '').length;
    const tagFilters = selectedTags.length;
    return storeFilters + tagFilters;
  }, [filters.difficulty, filters.subject, filters.topic, selectedTags.length]);

  // ✅ UPDATED: Use tag-filtered questions as the final display
  const displayQuestions = tagFilteredQuestions;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Question Bank</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkUpload(true)}
              className="hidden sm:flex cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => setShowAddQuestion(true)}
              className="gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Question</span>
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search questions..."
              className="pl-9"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-2 top-2">
                <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto w-full justify-center gap-1 cursor-pointer"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="sm:w-auto w-full justify-center gap-1 cursor-pointer"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>

        {/* ✅ UPDATED: Enhanced Filter panel with tags */}
        {showFilters && (
          <div className="mt-4 border rounded-md p-4 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium">Filter Questions</h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFilterCount} active
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs cursor-pointer"
                disabled={activeFilterCount === 0}
              >
                Clear All
              </Button>
            </div>

            {/* Basic Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subject-filter">Subject</Label>
                <Select
                  value={filters.subject || 'ALL'}
                  onValueChange={(value) => handleFilterChange('subject', value === 'ALL' ? '' : value)}
                >
                  <SelectTrigger id="subject-filter">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                    {derivedData.subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="topic-filter">Topic</Label>
                <Select
                  value={filters.topic || 'ALL'}
                  onValueChange={(value) => handleFilterChange('topic', value === 'ALL' ? '' : value)}
                >
                  <SelectTrigger id="topic-filter">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Topics</SelectItem>
                    {derivedData.topics.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty-filter">Difficulty</Label>
                <Select
                  value={filters.difficulty || 'ALL'}
                  onValueChange={(value) => handleFilterChange('difficulty', value === 'ALL' ? '' : value)}
                >
                  <SelectTrigger id="difficulty-filter">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Difficulties</SelectItem>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ✅ NEW: Tags Filter Section */}
            {derivedData.allTags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Tags className="h-4 w-4" />
                    Filter by Tags
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedTags.length} selected
                      </Badge>
                    )}
                  </Label>
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllTags}
                      className="h-6 px-2 text-xs cursor-pointer"
                    >
                      Clear Tags
                    </Button>
                  )}
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-blue-50 rounded-md border">
                    <span className="text-xs text-blue-700 font-medium">Selected:</span>
                    {selectedTags.map(tag => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tag Search */}
                {derivedData.allTags.length > 10 && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400" />
                    <Input
                      placeholder="Search tags..."
                      value={tagSearchTerm}
                      onChange={(e) => setTagSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                )}

                {/* Available Tags */}
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {filteredTagsForDisplay.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:scale-105 focus:ring-2 focus:ring-blue-500"
                      onClick={() => toggleTag(tag)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTag(tag);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedTags.includes(tag)}
                    >
                      <Tags className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {derivedData.allTags.length > 20 && !tagSearchTerm && (
                    <Badge variant="outline" className="cursor-default text-gray-500">
                      +{derivedData.allTags.length - 20} more tags available
                    </Badge>
                  )}
                </div>

                {/* Tag Statistics */}
                {selectedTags.length > 0 && (
                  <div className="text-xs text-gray-600">
                    Showing {displayQuestions.length} questions with selected tags
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        {/* Loading state */}
        {isLoading && <LoadingSpinner />}
        
        {/* Error state */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error loading questions</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchQuestions()}
                className="mt-2 w-full cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Empty state */}
        {!isLoading && !error && displayQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No questions found</h3>
            <p className="text-gray-500 mb-4 max-w-md">
              {questions.length === 0
                ? "Your question bank is empty. Add questions to get started."
                : activeFilterCount > 0
                ? "No questions match your current filters. Try adjusting your search, filters, or selected tags."
                : "No questions match your current filters. Try adjusting your search or filters."}
            </p>
            {questions.length === 0 ? (
              <Button onClick={() => setShowAddQuestion(true)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters} className="cursor-pointer">
                Clear All Filters
              </Button>
            )}
          </div>
        )}
        
        {/* Questions grid/list */}
        {!isLoading && !error && displayQuestions.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-4"
          }>
            {displayQuestions.map(question => (
              <Card 
                key={question.id} 
                className={`overflow-hidden transition-all hover:shadow-md ${
                  selectedQuestions.includes(question.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => multiSelect && toggleSelection(question.id)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      {multiSelect && (
                        <div className="h-5 w-5 rounded-full border flex items-center justify-center">
                          {selectedQuestions.includes(question.id) && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      )}
                      {((question.explanationType === 'text' && question.explanationText) || 
                        (question.explanationType === 'image' && question.explanationImage)) && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          ✓ Explanation
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewQuestion(question);
                        }}
                        title="Preview Question"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingQuestion(question);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Question</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this question? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-2">
                  <div className="mb-3">
                    <div className="text-sm text-gray-500 mb-1">
                      {question.subject} {question.topic && `• ${question.topic}`}
                    </div>
                    <div className="font-medium break-words">
                      {renderQuestionContent(question)}
                    </div>
                  </div>
                  
                  {Array.isArray(question.options) && question.options.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <div className="text-sm font-medium">Options ({question.options.length}):</div>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, i) => {
                          const isCorrect = question.correctOption === i;
                          const optionType = question.optionTypes?.[i] || 'text';
                          const optionImage = question.optionImages?.[i];
                          
                          return (
                            <div 
                              key={i}
                              className={`text-sm p-2 rounded-md border ${
                                isCorrect ? 'bg-green-50 border-green-200' : ''
                              }`}
                            >
                              {optionType === 'text' ? (
                                option ? (
                                  <MathDisplay className="text-sm">{option}</MathDisplay>
                                ) : (
                                  <span className="text-gray-400 italic">No text</span>
                                )
                              ) : optionType === 'image' && optionImage ? (
                                <Image
                                  src={optionImage}
                                  alt={`Option ${i+1}`}
                                  width={100}
                                  height={60}
                                  className="rounded-md object-contain max-h-16"
                                  unoptimized={true}
                                  onError={(e) => {
                                    console.error('Option image load error:', optionImage);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-gray-400 italic">No content</span>
                              )}
                              {isCorrect && (
                                <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-800">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* ✅ ENHANCED: Clickable tags that can be used for filtering */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {question.tags.slice(0, 3).map(tag => (
                        <Badge 
                          key={tag} 
                          variant={selectedTags.includes(tag) ? "default" : "secondary"} 
                          className={`text-xs cursor-pointer transition-colors ${
                            selectedTags.includes(tag) 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'hover:bg-gray-200'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTag(tag);
                          }}
                          title={`Click to ${selectedTags.includes(tag) ? 'remove' : 'add'} tag filter`}
                        >
                          #{tag}
                        </Badge>
                      ))}
                      {question.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs cursor-default">
                          +{question.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Question Preview Dialog */}
      <QuestionPreviewDialog
        previewQuestion={previewQuestion}
        setPreviewQuestion={setPreviewQuestion}
        getDifficultyColor={getDifficultyColor}
      />
      
      {/* Add Question Dialog */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new question for your question bank.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <QuestionForm
              question={newQuestion}
              onChange={setNewQuestion}
              isSubmitting={isCreating}
              onSubmit={handleAddQuestion}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>
                Update the details of this question.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <QuestionForm
                question={editingQuestion}
                onChange={(updatedQuestion) => {
                  setEditingQuestion(updatedQuestion as Question);
                }}
                isSubmitting={isUpdating}
                onSubmit={() => handleEditQuestion(editingQuestion)}
                isEditMode
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Enhanced Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Questions</DialogTitle>
            <DialogDescription>
              Upload multiple questions at once using JSON format. The file will be validated before upload.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <BulkUploadForm onUpload={handleBulkUpload} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
