'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Question, CreateQuestionRequest } from '@/constants/types';
import {
  useQuestions as useQuestionFrom,
  useFilteredQuestions,
  useQuestionsLoading,
  useQuestionsError,
  useQuestionActions,
  useQuestionFilters,
  useStoreInitialization
} from '@/store';
import MathDisplay from '../../../../components/math-display';
import QuestionPreviewDialog from '../../exam/components/QuestionPreviewDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { QuestionCard } from './QuestionCard';
import { QuestionBankHeader } from './QuestionBankHeader';
// ✅ NEW: Import the new dialog components
import { AddQuestionDialog } from './AddQuestionDialog';
import { EditQuestionDialog } from './EditQuestionDialog';

import { useQuestions } from '@/hooks/useApiServices' 
import { useRouter } from 'next/navigation';

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

  const router = useRouter()

  // Store hooks
  const questions = useQuestionFrom();
  const questionsAPI = useQuestions()
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

  // Tag filtering state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  // Checking Data
  console.log('From QB editingQuestion',editingQuestion)
  console.log('From QB isUpdating',isUpdating)





  // Optimized new question form state
  const defaultQuestion: CreateQuestionRequest = useMemo(() => ({
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
    positiveMarks: 2,
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

  // Filtered tags for search functionality
  const filteredTagsForDisplay = useMemo(() => {
    if (!tagSearchTerm) return derivedData.allTags.slice(0, 20);
    return derivedData.allTags
      .filter(tag => tag.toLowerCase().includes(tagSearchTerm.toLowerCase()))
      .slice(0, 20);
  }, [derivedData.allTags, tagSearchTerm]);

  // Client-side tag filtering combined with store filtering
  const tagFilteredQuestions = useMemo(() => {
    if (selectedTags.length === 0) return filteredQuestions;
    
    return filteredQuestions.filter(question => {
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

    const renderImage = (src: string, alt: string, key: string) => (
      <div key={key} className="mb-2">
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          className="rounded-md object-contain max-h-32 h-auto w-auto"
          unoptimized={true}
          onError={(e) => {
            console.error('Image load error:', src);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );

    // Layer rendering logic...
    if (question.layer1Type === 'text' && question.layer1Text?.trim()) {
      layers.push(
        <div key="layer1" className="mb-2">
          <MathDisplay>{question.layer1Text}</MathDisplay>
        </div>
      );
    } else if (question.layer1Type === 'image' && question.layer1Image?.trim()) {
      layers.push(renderImage(question.layer1Image, "Question layer 1", "layer1"));
    }

    if (question.layer2Type === 'text' && question.layer2Text?.trim()) {
      layers.push(
        <div key="layer2" className="mb-2">
          <MathDisplay>{question.layer2Text}</MathDisplay>
        </div>
      );
    } else if (question.layer2Type === 'image' && question.layer2Image?.trim()) {
      layers.push(renderImage(question.layer2Image, "Question layer 2", "layer2"));
    }

    if (question.layer3Type === 'text' && question.layer3Text?.trim()) {
      layers.push(
        <div key="layer3" className="mb-2">
          <MathDisplay>{question.layer3Text}</MathDisplay>
        </div>
      );
    } else if (question.layer3Type === 'image' && question.layer3Image?.trim()) {
      layers.push(renderImage(question.layer3Image, "Question layer 3", "layer3"));
    }

    if (layers.length === 0 && question.content?.trim()) {
      layers.push(
        <div key="legacy" className="mb-2">
          <MathDisplay>{question.content}</MathDisplay>
        </div>
      );
    }

    if (question.questionImage?.trim()) {
      layers.push(renderImage(question.questionImage, "Question", "legacy-image"));
    }

    return layers.length > 0 ? layers : <span className="text-gray-500 italic">No content available</span>;
  }, []);

  // Effects
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

  useEffect(() => {
    if (filters.search !== searchText) {
      setSearchText(filters.search || '');
    }
  }, [filters.search, searchText]);

  useEffect(() => {
    fetchQuestions().catch(console.error);
  }, [fetchQuestions]);

  // Tag filtering handlers
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

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  const handleFilterChange = useCallback(async (key: string, value: string) => {
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

  // ✅ UPDATED: Add question handler for dialog
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
  }, [newQuestion, createQuestion, defaultQuestion,router]);

  // ✅ UPDATED: Edit question handler for dialog
  const handleEditQuestion = useCallback(async () => {
    if (!editingQuestion) return;
    
    // Console
    console.log('from QB editingQuestion', editingQuestion)
    console.log('from QB editingQuestion', editingQuestion)


    try {
      setIsUpdating(true);
      // await updateQuestion(editingQuestion.id, editingQuestion);
      await questionsAPI.updateQuestion(editingQuestion.id, editingQuestion)
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
  }, [editingQuestion,questionsAPI]);

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

  // Computed values
  const activeFilterCount = useMemo(() => {
    const storeFilters = [filters.difficulty, filters.subject, filters.topic]
      .filter(value => value && value.trim() !== '').length;
    const tagFilters = selectedTags.length;
    return storeFilters + tagFilters;
  }, [filters.difficulty, filters.subject, filters.topic, selectedTags.length]);

  const displayQuestions = tagFilteredQuestions;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Using the extracted header component */}
      <QuestionBankHeader
        // Navigation
        onBack={onBack}
        
        // Search
        searchText={searchText}
        isSearching={isSearching}
        onSearchChange={handleSearchChange}
        
        // View controls
        viewMode={viewMode}
        onViewModeChange={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        
        // Filters
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFilterCount={activeFilterCount}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        
        // Filter data
        derivedData={derivedData}
        
        // Tag filtering
        selectedTags={selectedTags}
        tagSearchTerm={tagSearchTerm}
        filteredTagsForDisplay={filteredTagsForDisplay}
        onToggleTag={toggleTag}
        onRemoveTag={removeTag}
        onClearAllTags={clearAllTags}
        onTagSearchChange={setTagSearchTerm}
        
        // Actions
        onAddQuestion={() => setShowAddQuestion(true)}
        onBulkUpload={() => setShowBulkUpload(true)}
        
        // Statistics
        displayQuestionsCount={displayQuestions.length}
      />
      
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
              <QuestionCard
                key={question.id}
                question={question}
                isSelected={selectedQuestions.includes(question.id)}
                multiSelect={multiSelect}
                selectedTags={selectedTags}
                onToggleSelection={toggleSelection}
                onPreview={setPreviewQuestion}
                onEdit={setEditingQuestion}
                onDelete={handleDeleteQuestion}
                onToggleTag={toggleTag}
                getDifficultyColor={getDifficultyColor}
                renderQuestionContent={renderQuestionContent}
              />
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
      
      {/* ✅ NEW: Using separate dialog components */}
      
      {/* Add Question Dialog */}
      <AddQuestionDialog
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
        question={newQuestion}
        onQuestionChange={setNewQuestion}
        onSubmit={handleAddQuestion}
        isSubmitting={isCreating}
      />
      
      {/* Edit Question Dialog */}
      <EditQuestionDialog
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onQuestionChange={setEditingQuestion}
        onSubmit={handleEditQuestion}
        isSubmitting={isUpdating}
      />
      
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
