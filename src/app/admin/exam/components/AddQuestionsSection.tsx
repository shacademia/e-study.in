'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Target,
  Tags,
  Shield,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Question, ExamSection, User } from '@/constants/types';
import { questionService } from '@/services/question';
import { examService } from '@/services/exam';
import { authService } from '@/services/auth';

interface AddQuestionsSectionProps {
  examId?: string;
  sectionId?: string;
  section?: ExamSection;
  availableQuestions?: Question[];
  onQuestionsAdded?: (addedQuestions: Question[], totalQuestions: number) => void;
  onClose?: () => void;
  isOpen: boolean;
  mode?: 'dialog' | 'inline';
}

type ViewMode = 'grid' | 'list' | 'detailed';

const AddQuestionsSection: React.FC<AddQuestionsSectionProps> = ({
  examId,
  sectionId,
  section,
  availableQuestions = [],
  onQuestionsAdded,
  onClose,
  isOpen,
  mode = 'dialog'
}) => {
  // State management
  const [questions, setQuestions] = useState<Question[]>(availableQuestions);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [addingQuestions, setAddingQuestions] = useState(false);
  
  // User permission state
  const [userPermissions, setUserPermissions] = useState({
    canCreateQuestions: false,
    userRole: 'UNKNOWN',
    isActive: false,
    hasToken: false
  });
  
  // Filters
  const [filters, setFilters] = useState({
    subject: 'all',
    difficulty: 'all',
    topic: 'all',
    tags: [] as string[],
    markRange: 'all'
  });

  // Preview state
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading questions with filters:', { 
        subject: filters.subject, 
        difficulty: filters.difficulty, 
        searchTerm 
      });

      // First, try with proper pagination parameters
      const response = await questionService.getAllQuestions({
        page: 1,
        limit: 50, // Within API constraints
        subject: filters.subject !== 'all' ? filters.subject : undefined,
        difficulty: filters.difficulty !== 'all' ? filters.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : undefined,
        search: searchTerm || undefined
      });

      console.log('📦 Questions API response:', response);
      
      // Handle different response structures
      let questionsData: Question[] = [];
      if (response?.data?.questions) {
        questionsData = response.data.questions;
      } else if (Array.isArray(response?.data)) {
        questionsData = response.data;
      } else if (Array.isArray(response)) {
        questionsData = response;
      }

      console.log('✅ Processed questions:', questionsData);
      setQuestions(questionsData);

      if (questionsData.length === 0) {
        // Provide some sample questions if no questions are found
        const sampleQuestions: Question[] = [
          {
            id: 'sample-1',
            content: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Rome'],
            correctOption: 2,
            difficulty: 'EASY',
            subject: 'Geography',
            topic: 'World Capitals',
            tags: ['capitals', 'europe'],
            author: {
              id: 'sample-author',
              name: 'Sample Author'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sample-2',
            content: 'Which programming language is known for its simplicity and readability?',
            options: ['C++', 'Python', 'Assembly', 'Machine Code'],
            correctOption: 1,
            difficulty: 'MEDIUM',
            subject: 'Computer Science',
            topic: 'Programming Languages',
            tags: ['programming', 'languages'],
            author: {
              id: 'sample-author',
              name: 'Sample Author'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sample-3',
            content: 'What is the time complexity of binary search?',
            options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
            correctOption: 1,
            difficulty: 'HARD',
            subject: 'Computer Science',
            topic: 'Algorithms',
            tags: ['algorithms', 'complexity'],
            author: {
              id: 'sample-author',
              name: 'Sample Author'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setQuestions(sampleQuestions);
        toast({
          title: 'Sample Questions Loaded',
          description: 'No questions found via API. Showing sample questions for demonstration.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('❌ Failed to load questions:', error);
      
      // More specific error handling
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
          errorMessage = String((error as { message: string }).message);
        } else if ('error' in error) {
          errorMessage = String((error as { error: string }).error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      }

      // Provide sample questions on error
      const sampleQuestions: Question[] = [
        {
          id: 'sample-1',
          content: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Rome'],
          correctOption: 2,
          difficulty: 'EASY',
          subject: 'Geography',
          topic: 'World Capitals',
          tags: ['capitals', 'europe'],
          author: { id: 'sample-author', name: 'Sample Author' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sample-2',
          content: 'Which programming language is known for its simplicity and readability?',
          options: ['C++', 'Python', 'Assembly', 'Machine Code'],
          correctOption: 1,
          difficulty: 'MEDIUM',
          subject: 'Computer Science',
          topic: 'Programming Languages',
          tags: ['programming', 'languages'],
          author: { id: 'sample-author', name: 'Sample Author' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setQuestions(sampleQuestions);
      
      toast({
        title: 'API Error - Using Sample Data',
        description: `API failed: ${errorMessage}. Showing sample questions for demonstration.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [filters.subject, filters.difficulty, searchTerm]);

  // Load questions on mount if not provided
  useEffect(() => {
    if (availableQuestions.length === 0) {
      loadQuestions();
    } else {
      setQuestions(availableQuestions);
    }
  }, [availableQuestions, loadQuestions]);

  // Check user permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const token = authService.getToken();
        
        if (!token) {
          setUserPermissions({
            canCreateQuestions: false,
            userRole: 'NO_TOKEN',
            isActive: false,
            hasToken: false
          });
          return;
        }

        // Try to get user profile to check permissions
        const userProfile = await authService.getCurrentUser();
        // Assume user is active if isActive property doesn't exist (for backward compatibility)
        const isActive = (userProfile as User & { isActive?: boolean }).isActive !== false;
        const canCreate = isActive && ['ADMIN', 'MODERATOR'].includes(userProfile.role);
        
        setUserPermissions({
          canCreateQuestions: canCreate,
          userRole: userProfile.role,
          isActive: isActive,
          hasToken: true
        });
      } catch (error) {
        console.error('Permission check failed:', error);
        setUserPermissions({
          canCreateQuestions: false,
          userRole: 'ERROR',
          isActive: false,
          hasToken: !!authService.getToken()
        });
      }
    };

    checkPermissions();
  }, []);

  // Filter questions based on current filters
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesSearch = !searchTerm || 
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.topic.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject = filters.subject === 'all' || question.subject === filters.subject;
      const matchesDifficulty = filters.difficulty === 'all' || question.difficulty === filters.difficulty;
      const matchesTopic = filters.topic === 'all' || question.topic === filters.topic;
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => question.tags.includes(tag));

      return matchesSearch && matchesSubject && matchesDifficulty && matchesTopic && matchesTags;
    });
  }, [questions, searchTerm, filters]);

  // Get unique values for filters
  const subjects = useMemo(() => [...new Set(questions.map(q => q.subject))].filter(Boolean), [questions]);
  const topics = useMemo(() => [...new Set(questions.map(q => q.topic))].filter(Boolean), [questions]);
  const allTags = useMemo(() => [...new Set(questions.flatMap(q => q.tags))].filter(Boolean), [questions]);
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  // Question selection handlers
  const toggleQuestionSelection = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const selectAllFiltered = () => {
    const newSelected = new Set([...selectedQuestions, ...filteredQuestions.map(q => q.id)]);
    setSelectedQuestions(newSelected);
  };

  const clearSelection = () => {
    setSelectedQuestions(new Set());
  };

  // Add questions to section
  const handleAddQuestions = async () => {
    // Check permissions first
    if (!userPermissions.canCreateQuestions) {
      toast({
        title: 'Permission Denied',
        description: !userPermissions.hasToken 
          ? 'Please log in to add questions' 
          : !userPermissions.isActive 
          ? 'Your account is not active. Contact an administrator.'
          : `You need ADMIN or MODERATOR role to add questions. Current role: ${userPermissions.userRole}`,
        variant: 'destructive'
      });
      return;
    }

    if (selectedQuestions.size === 0) {
      toast({
        title: 'No Questions Selected',
        description: 'Please select at least one question to add',
        variant: 'destructive'
      });
      return;
    }

    if (!examId || !sectionId) {
      toast({
        title: 'Missing Information',
        description: 'This is a demo mode. In a real application, exam ID and section ID would be required.',
        variant: 'default'
      });
      
      // Simulate success in demo mode
      const addedQuestions = questions.filter(q => selectedQuestions.has(q.id));
      
      toast({
        title: 'Questions Added (Demo)',
        description: `Successfully selected ${selectedQuestions.size} questions. In real mode, these would be added to ${section?.name || 'the section'}`,
      });

      // Clear selection
      setSelectedQuestions(new Set());

      // Callback to parent
      if (onQuestionsAdded) {
        onQuestionsAdded(addedQuestions, selectedQuestions.size);
      }

      // Close dialog if in dialog mode
      if (mode === 'dialog' && onClose) {
        onClose();
      }
      
      return;
    }

    try {
      setAddingQuestions(true);
      
      const selectedQuestionsList = Array.from(selectedQuestions);
      console.log('Adding questions to section:', {
        examId,
        sectionId,
        questionIds: selectedQuestionsList,
        sectionName: section?.name
      });

      await examService.addQuestionsToSection(examId, sectionId, {
        questionIds: selectedQuestionsList,
        marks: 1 // Default marks per question
      });

      const addedQuestions = questions.filter(q => selectedQuestionsList.includes(q.id));
      
      toast({
        title: 'Questions Added Successfully',
        description: `Successfully added ${selectedQuestions.size} questions to ${section?.name || 'the section'}`
      });

      // Clear selection
      setSelectedQuestions(new Set());

      // Callback to parent
      if (onQuestionsAdded) {
        onQuestionsAdded(addedQuestions, selectedQuestions.size);
      }

      // Close dialog if in dialog mode
      if (mode === 'dialog' && onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Failed to add questions:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to add questions to section';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      
      toast({
        title: 'Error Adding Questions',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setAddingQuestions(false);
    }
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: 'all',
      difficulty: 'all',
      topic: 'all',
      tags: [],
      markRange: 'all'
    });
    setSearchTerm('');
  };

  // Question difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HARD': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Question card component
  const QuestionCard = ({ question, isSelected }: { question: Question; isSelected: boolean }) => (
    <Card className={`transition-all hover:shadow-md cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleQuestionSelection(question.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">{question.subject}</Badge>
              <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewQuestion(question);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">{question.topic}</div>
      </CardHeader>
      <CardContent onClick={() => toggleQuestionSelection(question.id)}>
        <p className="text-sm line-clamp-3 mb-3">{question.content}</p>
        
        {/* Quick preview of options */}
        <div className="space-y-1">
          {question.options.slice(0, 2).map((option, index) => (
            <div key={index} className="flex items-center text-xs text-gray-600">
              <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="truncate">{option}</span>
            </div>
          ))}
          {question.options.length > 2 && (
            <div className="text-xs text-gray-500">+{question.options.length - 2} more options</div>
          )}
        </div>

        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {question.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {question.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{question.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Main content
  const content = (
    <div className="space-y-6">
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
            ) : userPermissions.userRole === 'STUDENT' ? (
              'You have student access. Question creation requires ADMIN or MODERATOR role.'
            ) : (
              `You do not have permission to create questions. Current role: ${userPermissions.userRole}`
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Add Questions</h2>
          <p className="text-muted-foreground">
            Select questions to add to {section?.name || 'your exam section'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedQuestions.size} selected
          </Badge>
          <Badge variant="outline">
            {filteredQuestions.length} available
          </Badge>
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
              <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
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
              <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Topic</Label>
              <Select value={filters.topic} onValueChange={(value) => handleFilterChange('topic', value)}>
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
          {allTags.length > 0 && (
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allTags.slice(0, 15).map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => handleTagToggle(tag)}
                  >
                    <Tags className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selection Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="h-5 w-5 mr-2" />
            Selection Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={selectAllFiltered}>
              Select All Filtered ({filteredQuestions.length})
            </Button>
            <Button variant="outline" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredQuestions.length} of {questions.length} questions
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
            <p className="text-muted-foreground text-center">
              Try adjusting your search criteria or filters to find questions.
            </p>
          </CardContent>
        </Card>
      ) : (
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
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium">
            {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex space-x-2">
          {mode === 'dialog' && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleAddQuestions}
            disabled={selectedQuestions.size === 0 || addingQuestions || !userPermissions.canCreateQuestions}
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
                Add {selectedQuestions.size} Question{selectedQuestions.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Question Preview Dialog */}
      {previewQuestion && (
        <Dialog open={!!previewQuestion} onOpenChange={(open) => !open && setPreviewQuestion(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Question Preview</DialogTitle>
              <DialogDescription>
                {previewQuestion.subject} - {previewQuestion.topic}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline">{previewQuestion.subject}</Badge>
                <Badge className={getDifficultyColor(previewQuestion.difficulty)}>
                  {previewQuestion.difficulty}
                </Badge>
                <Badge variant="secondary">{previewQuestion.topic}</Badge>
              </div>
              
              <div>
                <Label>Question</Label>
                <p className="mt-1 p-3 border rounded">{previewQuestion.content}</p>
              </div>
              
              <div>
                <Label>Options</Label>
                <div className="mt-1 space-y-2">
                  {previewQuestion.options.map((option, index) => (
                    <div key={index} className={`p-2 border rounded flex items-center space-x-2 ${
                      index === previewQuestion.correctOption ? 'bg-green-50 border-green-200' : ''
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        index === previewQuestion.correctOption 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {index === previewQuestion.correctOption && (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {previewQuestion.tags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {previewQuestion.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  variant={selectedQuestions.has(previewQuestion.id) ? "destructive" : "default"}
                  onClick={() => {
                    toggleQuestionSelection(previewQuestion.id);
                    setPreviewQuestion(null);
                  }}
                >
                  {selectedQuestions.has(previewQuestion.id) ? 'Remove from Selection' : 'Add to Selection'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  // Render based on mode
  if (mode === 'dialog') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Questions to Section</DialogTitle>
            <DialogDescription>
              Select questions from the question bank to add to {section?.name || 'your section'}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
};

export default AddQuestionsSection;
