'use client';

import React, { useState, useMemo } from 'react';
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
  const { questions, loading, error, loadQuestions, refreshQuestions } = useQuestions();
  const { selectedQuestions, toggleSelection, clearSelection, selectedCount } = useQuestionSelection();
  const { filters, updateFilter, toggleTag, clearFilters, filterOptions } = useQuestionFilters(questions);
  const userPermissions = useUserPermissions();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [addingQuestions, setAddingQuestions] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load questions when filters or search changes
  React.useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (isCancelled) return;

      const params = {
        page: 1,
        limit: 50,
        subject: filters.subject !== 'all' ? filters.subject : undefined,
        difficulty: filters.difficulty !== 'all' ? filters.difficulty as 'EASY' | 'MEDIUM' | 'HARD' : undefined,
        search: debouncedSearchTerm || undefined
      };

      await loadQuestions(params);
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [loadQuestions, filters.subject, filters.difficulty, debouncedSearchTerm]);

  // Client-side filtering for additional filters (tags, topic)
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesTopic = filters.topic === 'all' || question.topic === filters.topic;
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => question.tags.includes(tag));

      return matchesTopic && matchesTags;
    });
  }, [questions, filters.topic, filters.tags]);

  // Handle adding questions
  const handleAddQuestions = async () => {
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

    if (selectedCount === 0) {
      toast({
        title: 'No Questions Selected',
        description: 'Please select at least one question to add',
        variant: 'destructive'
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

    // Real API call
    try {
      setAddingQuestions(true);
      
      const selectedQuestionsList = Array.from(selectedQuestions);
      await examService.addQuestionsToSection(examId, sectionId, {
        questionIds: selectedQuestionsList,
        marks: 1
      });

      const addedQuestions = filteredQuestions.filter(q => selectedQuestionsList.includes(q.id));
      
      toast({
        title: 'Questions Added Successfully',
        description: `Successfully added ${selectedCount} questions to ${section?.name || 'the section'}`
      });

      clearSelection();
      onQuestionsAdded?.(addedQuestions, selectedCount);

      if (mode === 'dialog' && onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Failed to add questions:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add questions to section';
      toast({
        title: 'Error Adding Questions',
        description: errorMessage,
        variant: 'destructive'
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
  const QuestionCard = React.memo(({ question, isSelected }: { question: Question; isSelected: boolean }) => (
    <Card className={`transition-all hover:shadow-md cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelection(question.id)}
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
      <CardContent onClick={() => toggleSelection(question.id)}>
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
  ));

  // Add display name
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
      <div className="flex items-center justify-between">
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

      {/* Question Preview Dialog */}
      {previewQuestion && (
        <Dialog open={!!previewQuestion} onOpenChange={(open) => !open && setPreviewQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Question Preview</DialogTitle>
              <DialogDescription>
                {previewQuestion.subject} - {previewQuestion.topic}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{previewQuestion.subject}</Badge>
                <Badge className={getDifficultyColor(previewQuestion.difficulty)}>
                  {previewQuestion.difficulty}
                </Badge>
                <Badge variant="secondary">{previewQuestion.topic}</Badge>
              </div>
              
              <div>
                <Label>Question</Label>
                <div className="mt-1 space-y-3">
                  <p className="p-3 border rounded break-words">{previewQuestion.content}</p>
                  {previewQuestion.questionImage && (
                    <div className="flex justify-center w-full">
                      <div className="relative max-w-full">
                        <Image
                          src={previewQuestion.questionImage}
                          alt="Question image"
                          width={300}
                          height={200}
                          className="rounded-md object-contain border bg-white max-w-full h-auto"
                          style={{ maxHeight: '300px', width: 'auto' }}
                          onError={(e) => {
                            console.error('Failed to load question image:', previewQuestion.questionImage);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Options</Label>
                <div className="mt-1 space-y-2">
                  {previewQuestion.options.map((option, index) => (
                    <div key={index} className={`p-3 border rounded ${
                      index === previewQuestion.correctOption ? 'bg-green-50 border-green-200' : ''
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                          index === previewQuestion.correctOption 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="break-words">{option}</span>
                          {previewQuestion.optionImages && previewQuestion.optionImages[index] && (
                            <div className="mt-3 flex justify-center">
                              <div className="relative max-w-full">
                                <Image
                                  src={previewQuestion.optionImages[index]}
                                  alt={`Option ${String.fromCharCode(65 + index)} image`}
                                  width={120}
                                  height={90}
                                  className="rounded-sm object-contain border bg-white max-w-full h-auto"
                                  style={{ maxHeight: '120px', width: 'auto' }}
                                  onError={(e) => {
                                    console.error('Failed to load option image:', previewQuestion.optionImages?.[index]);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {index === previewQuestion.correctOption && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
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
                  className='cursor-pointer'
                  variant={selectedQuestions.has(previewQuestion.id) ? "destructive" : "default"}
                  onClick={() => {
                    toggleSelection(previewQuestion.id);
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
        {/* Footer Actions */}
      </Dialog>
    );
  }

  return content;
};

export default AddQuestionsSection;
