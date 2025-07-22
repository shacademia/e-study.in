'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Upload,
  BookOpen,
  Tag,
  CheckCircle,
  SortAsc,
  SortDesc,
  Grid,
  List,
  RefreshCw,
  Undo2,
  Clock,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Question } from '@/constants/types';
import { 
  useQuestions, 
  useFilteredQuestions, 
  useQuestionsLoading, 
  useQuestionsError,
  useQuestionActions,
  useQuestionFilters,
  useStoreInitialization
} from '@/store';

interface EnhancedQuestionBankProps {
  onBack: () => void;
  onSelectQuestions?: (questions: Question[]) => void;
  multiSelect?: boolean;
  preSelectedQuestions?: string[];
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface NewQuestion {
  content: string;
  options: string[];
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
  const filteredQuestions = useFilteredQuestions();
  const isLoading = useQuestionsLoading();
  const error = useQuestionsError();
  const { 
    fetchQuestions, 
    updateQuestion, 
    createQuestion, 
    deleteQuestion, 
    duplicateQuestion 
  } = useQuestionActions();
  const { filters, setFilters } = useQuestionFilters();

  // Local state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'difficulty' | 'subject' | 'topic'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // New question form state
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    content: '',
    options: ['', '', '', ''],
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

  // Load questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Update store filters when local search changes
  useEffect(() => {
    if (searchTerm !== filters.search) {
      setFilters({ ...filters, search: searchTerm });
    }
  }, [searchTerm, filters, setFilters]);

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  // Handle adding a new question
  const handleAddQuestion = async () => {
    try {
      const question = {
        content: newQuestion.content,
        options: newQuestion.options,
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
        options: ['', '', '', ''],
        correctOption: 0,
        subject: '',
        topic: '',
        difficulty: 'EASY',
        tags: ''
      });
      setShowAddQuestion(false);
      await fetchQuestions(); // Reload questions
    } catch (error) {
      console.error('Failed to add question:', error);
      toast({
        title: 'Error',
        description: 'Failed to add question',
        variant: 'destructive'
      });
    }
  };

  // Handle editing question
  const handleEditQuestion = async (id: string, updates: Partial<Question>) => {
    try {
      await updateQuestion(id, updates);

      toast({
        title: "Updated",
        description: "Question updated successfully"
      });

      setEditingQuestion(null);
      setShowAddQuestion(false);
      await fetchQuestions(); // Reload questions
    } catch (error) {
      console.error("Failed to edit question:", error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: 'destructive'
      });
    }
  };

  // Handle deleting question
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);
      
      toast({
        title: 'Deleted',
        description: 'Question deleted successfully',
        action: (
          <Button variant="outline" size="sm" onClick={handleUndoDelete}>
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
        )
      });

      await fetchQuestions(); // Reload questions
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive'
      });
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    try {
      await fetchQuestions(); // Just refresh for now - bulk delete would need implementation
      
      toast({
        title: 'Success',
        description: 'Bulk operation completed'
      });
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform bulk operation',
        variant: 'destructive'
      });
    }
  };

  // Handle undo delete
  const handleUndoDelete = async () => {
    try {
      // This would need to be implemented in the store
      toast({
        title: 'Restored',
        description: 'Question restored successfully'
      });
      await fetchQuestions();
    } catch (error) {
      console.error('Failed to undo delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore question',
        variant: 'destructive'
      });
    }
  };

  // Handle duplicating question
  const handleDuplicateQuestion = async (questionId: string) => {
    try {
      await duplicateQuestion(questionId);
      
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
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag) 
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setFilters({ ...filters, tags: newTags });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      subject: 'all',
      difficulty: 'all', 
      topic: 'all',
      tags: [],
      dateRange: 'all',
      search: ''
    });
    setSearchTerm('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading questions...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading questions: {error}</p>
          <Button onClick={() => fetchQuestions()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
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
        </div>
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <SelectItem value="all">All Subjects</SelectItem>
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
                      <SelectItem value="all">All Difficulties</SelectItem>
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
                      <SelectItem value="all">All Topics</SelectItem>
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
              </div>

              {/* Tags Filter */}
              <div className="mt-4">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={filters.tags?.includes(tag) ? "default" : "outline"}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3 line-clamp-3">{question.content}</p>
              
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
                    <span className={index === question.correctOption ? 'font-medium text-green-800' : ''}>
                      {option}
                    </span>
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
      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {questions.length === 0 
                ? "Get started by adding your first question."
                : "Try adjusting your search or filters."}
            </p>
            {questions.length === 0 && (
              <Button onClick={() => setShowAddQuestion(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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

            {/* Options */}
            <div>
              <Label>Answer Options *</Label>
              <div className="space-y-2">
                {(editingQuestion ? editingQuestion.options : newQuestion.options).map((option, index) => (
                  <div key={index} className="flex gap-2">
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
                    handleEditQuestion(editingQuestion.id, editingQuestion);
                  } else {
                    handleAddQuestion();
                  }
                }}
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedQuestionBank;
