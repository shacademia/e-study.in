'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { DialogTrigger } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Switch } from '@/components/ui/switch';
// import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Upload,
  Download,
  BookOpen,
  Tag,
  CheckCircle,
  Eye,
  SortAsc,
  SortDesc,
  Grid,
  List,
  RefreshCw,
  // FileText,
  // Target,
  // Star,
  // Share2,
  Clock,
  Copy } from
'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mockDataService, Question } from '../../../services/mockData';

interface QuestionFilters {
  subject: string;
  difficulty: string;
  topic: string;
  tags: string[];
  dateRange: string;
}

interface EnhancedQuestionBankProps {
  onBack: () => void;
  onSelectQuestions?: (questions: Question[]) => void;
  multiSelect?: boolean;
  preSelectedQuestions?: string[];
}

type Difficulty = "easy" | "medium" | "hard";

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
  onSelectQuestions,
  multiSelect = false,
  preSelectedQuestions = []
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set(preSelectedQuestions));
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<QuestionFilters>({
    subject: 'all',
    difficulty: 'all',
    topic: 'all',
    tags: [],
    dateRange: 'all'
  });
  const [sortBy, setSortBy] = useState<'date' | 'difficulty' | 'subject' | 'topic'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // New question form state
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
  content: '',
  options: ['', '', '', ''],
  correctOption: 0,
  subject: '',
  topic: '',
  difficulty: 'easy',
  tags: ''
});

  // Available options for filters
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await mockDataService.getQuestions();
      setQuestions(questionsData);

      // Extract unique values for filters
      const uniqueSubjects = [...new Set(questionsData.map((q) => q.subject))];
      const uniqueTopics = [...new Set(questionsData.map((q) => q.topic))];
      const uniqueTags = [...new Set(questionsData.flatMap((q) => q.tags))];

      setSubjects(uniqueSubjects);
      setTopics(uniqueTopics);
      setAllTags(uniqueTags);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
  let filtered = questions;

  if (searchTerm) {
    filtered = filtered.filter((q) =>
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  if (filters.subject !== 'all') {
    filtered = filtered.filter((q) => q.subject === filters.subject);
  }

  if (filters.difficulty !== 'all') {
    filtered = filtered.filter((q) => q.difficulty === filters.difficulty);
  }

  if (filters.topic !== 'all') {
    filtered = filtered.filter((q) => q.topic === filters.topic);
  }

  if (filters.tags.length > 0) {
    filtered = filtered.filter((q) =>
      filters.tags.some((tag) => q.tags.includes(tag))
    );
  }

  filtered.sort((a, b) => {
    let aValue: number | string, bValue: number | string;

    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        aValue = difficultyOrder[a.difficulty];
        bValue = difficultyOrder[b.difficulty];
        break;
      case 'subject':
        aValue = a.subject.toLowerCase();
        bValue = b.subject.toLowerCase();
        break;
      case 'topic':
        aValue = a.topic.toLowerCase();
        bValue = b.topic.toLowerCase();
        break;
      default:
        return 0;
    }

    return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  setFilteredQuestions(filtered);
  }, [questions, searchTerm, filters, sortBy, sortOrder]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        if (multiSelect) {
          newSet.add(questionId);
        } else {
          newSet.clear();
          newSet.add(questionId);
        }
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map((q) => q.id)));
    }
  };

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

      await mockDataService.createQuestion(question);

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
        difficulty: 'easy',
        tags: ''
      });
      setShowAddQuestion(false);
      loadQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add question',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await mockDataService.deleteQuestion(questionId);
      toast({
        title: 'Success',
        description: 'Question deleted successfully'
      });
      loadQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive'
      });
    }
  };

  const handleTagFilter = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ?
      prev.tags.filter((t) => t !== tag) :
      [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: 'all',
      difficulty: 'all',
      topic: 'all',
      tags: [],
      dateRange: 'all'
    });
    setSearchTerm('');
  };

  const handleUseSelectedQuestions = () => {
    const selectedQuestionObjects = questions.filter((q) => selectedQuestions.has(q.id));
    if (onSelectQuestions) {
      onSelectQuestions(selectedQuestionObjects);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800',
      'General Knowledge': 'bg-purple-100 text-purple-800',
      'Reasoning': 'bg-orange-100 text-orange-800',
      'English': 'bg-green-100 text-green-800',
      'Science': 'bg-teal-100 text-teal-800',
      'History': 'bg-amber-100 text-amber-800'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-id="chc62mki3" data-path="src/components/EnhancedQuestionBank.tsx">
        <div className="text-center" data-id="r9kxtvekq" data-path="src/components/EnhancedQuestionBank.tsx">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" data-id="c4h9ryiu9" data-path="src/components/EnhancedQuestionBank.tsx" />
          <p data-id="xkmfruw93" data-path="src/components/EnhancedQuestionBank.tsx">Loading questions...</p>
        </div>
      </div>);
  }

  return (
    <div className="min-h-screen bg-gray-50" data-id="bmtk6oo2y" data-path="src/components/EnhancedQuestionBank.tsx">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-id="d3iretmkk" data-path="src/components/EnhancedQuestionBank.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="2dz0oykfc" data-path="src/components/EnhancedQuestionBank.tsx">
          <div className="flex justify-between items-center h-16" data-id="q5yzp8815" data-path="src/components/EnhancedQuestionBank.tsx">
            <div className="flex items-center" data-id="iso2jjawo" data-path="src/components/EnhancedQuestionBank.tsx">
              <Button variant="ghost" size="sm" onClick={onBack} data-id="wdjqvvcqc" data-path="src/components/EnhancedQuestionBank.tsx">
                <ArrowLeft className="h-4 w-4 mr-2" data-id="6nxcyu7no" data-path="src/components/EnhancedQuestionBank.tsx" />
                Back
              </Button>
              <BookOpen className="h-8 w-8 text-blue-600 mr-3 ml-4" data-id="0wlp7uwhh" data-path="src/components/EnhancedQuestionBank.tsx" />
              <div data-id="cv3b7ci3q" data-path="src/components/EnhancedQuestionBank.tsx">
                <h1 className="text-xl font-bold text-gray-900" data-id="dq5y6ktiw" data-path="src/components/EnhancedQuestionBank.tsx">Enhanced Question Bank</h1>
                <p className="text-sm text-gray-600" data-id="8r65aps22" data-path="src/components/EnhancedQuestionBank.tsx">{filteredQuestions.length} questions available</p>
              </div>
            </div>
            <div className="flex items-center space-x-4" data-id="wznmkm1cr" data-path="src/components/EnhancedQuestionBank.tsx">
              <div className="flex items-center space-x-2" data-id="zin8nwkkg" data-path="src/components/EnhancedQuestionBank.tsx">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')} data-id="1cyadockx" data-path="src/components/EnhancedQuestionBank.tsx">

                  <List className="h-4 w-4" data-id="rgemf8zdc" data-path="src/components/EnhancedQuestionBank.tsx" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')} data-id="2ol15e6cx" data-path="src/components/EnhancedQuestionBank.tsx">

                  <Grid className="h-4 w-4" data-id="5ztbnor0f" data-path="src/components/EnhancedQuestionBank.tsx" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowBulkUpload(true)} data-id="hvyl5fhb5" data-path="src/components/EnhancedQuestionBank.tsx">
                <Upload className="h-4 w-4 mr-2" data-id="odggljoo1" data-path="src/components/EnhancedQuestionBank.tsx" />
                Bulk Upload
              </Button>
              <Button size="sm" onClick={() => setShowAddQuestion(true)} data-id="j562uja25" data-path="src/components/EnhancedQuestionBank.tsx">
                <Plus className="h-4 w-4 mr-2" data-id="epa0pzuhw" data-path="src/components/EnhancedQuestionBank.tsx" />
                Add Question
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="iti4t06p9" data-path="src/components/EnhancedQuestionBank.tsx">
        <div className="space-y-6" data-id="jbrh3f8ba" data-path="src/components/EnhancedQuestionBank.tsx">
          {/* Enhanced Search and Filters */}
          <Card data-id="76t8d1wft" data-path="src/components/EnhancedQuestionBank.tsx">
            <CardHeader data-id="9gprtu6v2" data-path="src/components/EnhancedQuestionBank.tsx">
              <div className="flex justify-between items-center" data-id="mbdcanxk" data-path="src/components/EnhancedQuestionBank.tsx">
                <CardTitle className="flex items-center" data-id="akd9ih5jb" data-path="src/components/EnhancedQuestionBank.tsx">
                  <Search className="h-5 w-5 mr-2" data-id="khppzoyro" data-path="src/components/EnhancedQuestionBank.tsx" />
                  Search & Filter Questions
                </CardTitle>
                <div className="flex items-center space-x-2" data-id="bklanf5qy" data-path="src/components/EnhancedQuestionBank.tsx">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)} data-id="bzcun7bi6" data-path="src/components/EnhancedQuestionBank.tsx">

                    <Filter className="h-4 w-4 mr-2" data-id="df4qvjqkt" data-path="src/components/EnhancedQuestionBank.tsx" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearFilters} data-id="vrphz3o0f" data-path="src/components/EnhancedQuestionBank.tsx">
                    <RefreshCw className="h-4 w-4 mr-2" data-id="w8ot30r0d" data-path="src/components/EnhancedQuestionBank.tsx" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent data-id="zh0v6c1ab" data-path="src/components/EnhancedQuestionBank.tsx">
              {/* Search Bar */}
              <div className="relative mb-4" data-id="oyzzraf8g" data-path="src/components/EnhancedQuestionBank.tsx">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" data-id="2d1pl7hhg" data-path="src/components/EnhancedQuestionBank.tsx" />
                <Input
                  placeholder="Search questions by content, subject, topic, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" data-id="hpjp3crxk" data-path="src/components/EnhancedQuestionBank.tsx" />

              </div>

              {/* Advanced Filters */}
              {showFilters &&
              <div className="space-y-4" data-id="teulaprj8" data-path="src/components/EnhancedQuestionBank.tsx">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4" data-id="rp4j0b0rl" data-path="src/components/EnhancedQuestionBank.tsx">
                    <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })} data-id="5lhiyhtxj" data-path="src/components/EnhancedQuestionBank.tsx">
                      <SelectTrigger data-id="jh24u9afx" data-path="src/components/EnhancedQuestionBank.tsx">
                        <SelectValue placeholder="All Subjects" data-id="j8g375c4l" data-path="src/components/EnhancedQuestionBank.tsx" />
                      </SelectTrigger>
                      <SelectContent data-id="xbub134mn" data-path="src/components/EnhancedQuestionBank.tsx">
                        <SelectItem value="all" data-id="ua6ypfbbt" data-path="src/components/EnhancedQuestionBank.tsx">All Subjects</SelectItem>
                        {subjects.map((subject) =>
                      <SelectItem key={subject} value={subject} data-id="8jilwtf56" data-path="src/components/EnhancedQuestionBank.tsx">{subject}</SelectItem>
                      )}
                      </SelectContent>
                    </Select>

                    <Select value={filters.difficulty} onValueChange={(value) => setFilters({ ...filters, difficulty: value })} data-id="7keqrfyyo" data-path="src/components/EnhancedQuestionBank.tsx">
                      <SelectTrigger data-id="lsr3t5ufu" data-path="src/components/EnhancedQuestionBank.tsx">
                        <SelectValue placeholder="All Difficulties" data-id="81e24n7x4" data-path="src/components/EnhancedQuestionBank.tsx" />
                      </SelectTrigger>
                      <SelectContent data-id="pb0uolcbf" data-path="src/components/EnhancedQuestionBank.tsx">
                        <SelectItem value="all" data-id="fg9ea70dk" data-path="src/components/EnhancedQuestionBank.tsx">All Difficulties</SelectItem>
                        <SelectItem value="easy" data-id="bqybcpy1f" data-path="src/components/EnhancedQuestionBank.tsx">Easy</SelectItem>
                        <SelectItem value="medium" data-id="r80lbfyd7" data-path="src/components/EnhancedQuestionBank.tsx">Medium</SelectItem>
                        <SelectItem value="hard" data-id="2013t7hla" data-path="src/components/EnhancedQuestionBank.tsx">Hard</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.topic} onValueChange={(value) => setFilters({ ...filters, topic: value })} data-id="bk82qa4vk" data-path="src/components/EnhancedQuestionBank.tsx">
                      <SelectTrigger data-id="dkjk5xt1r" data-path="src/components/EnhancedQuestionBank.tsx">
                        <SelectValue placeholder="All Topics" data-id="wc49zruqk" data-path="src/components/EnhancedQuestionBank.tsx" />
                      </SelectTrigger>
                      <SelectContent data-id="l8l7mwiim" data-path="src/components/EnhancedQuestionBank.tsx">
                        <SelectItem value="all" data-id="1efk0ic42" data-path="src/components/EnhancedQuestionBank.tsx">All Topics</SelectItem>
                        {topics.map((topic) =>
                      <SelectItem key={topic} value={topic} data-id="0cciyz9ec" data-path="src/components/EnhancedQuestionBank.tsx">{topic}</SelectItem>
                      )}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)} data-id="bg01i6877" data-path="src/components/EnhancedQuestionBank.tsx">
                      <SelectTrigger data-id="y3l8buaj2" data-path="src/components/EnhancedQuestionBank.tsx">
                        <SelectValue placeholder="Sort by" data-id="vbapatog7" data-path="src/components/EnhancedQuestionBank.tsx" />
                      </SelectTrigger>
                      <SelectContent data-id="4hmti6am5" data-path="src/components/EnhancedQuestionBank.tsx">
                        <SelectItem value="date" data-id="uex2w63tx" data-path="src/components/EnhancedQuestionBank.tsx">Date Created</SelectItem>
                        <SelectItem value="difficulty" data-id="86d3vmhkp" data-path="src/components/EnhancedQuestionBank.tsx">Difficulty</SelectItem>
                        <SelectItem value="subject" data-id="liv1qge9s" data-path="src/components/EnhancedQuestionBank.tsx">Subject</SelectItem>
                        <SelectItem value="topic" data-id="nl8756gmc" data-path="src/components/EnhancedQuestionBank.tsx">Topic</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} data-id="s8sbgi24h" data-path="src/components/EnhancedQuestionBank.tsx">

                      {sortOrder === 'asc' ?
                    <SortAsc className="h-4 w-4 mr-2" data-id="iqwrx2nyi" data-path="src/components/EnhancedQuestionBank.tsx" /> :

                    <SortDesc className="h-4 w-4 mr-2" data-id="npc6q7lds" data-path="src/components/EnhancedQuestionBank.tsx" />
                    }
                      {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                  </div>

                  {/* Tag Filter */}
                  <div data-id="y1xsrixwd" data-path="src/components/EnhancedQuestionBank.tsx">
                    <Label className="text-sm font-medium mb-2 block" data-id="tcox3rykj" data-path="src/components/EnhancedQuestionBank.tsx">Filter by Tags:</Label>
                    <div className="flex flex-wrap gap-2" data-id="x0ee9vgek" data-path="src/components/EnhancedQuestionBank.tsx">
                      {allTags.map((tag) =>
                    <Button
                      key={tag}
                      variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTagFilter(tag)} data-id="e3x3wwy39" data-path="src/components/EnhancedQuestionBank.tsx">

                          <Tag className="h-3 w-3 mr-1" data-id="yr7qty3oc" data-path="src/components/EnhancedQuestionBank.tsx" />
                          {tag}
                        </Button>
                    )}
                    </div>
                  </div>
                </div>
              }
            </CardContent>
          </Card>

          {/* Selection Actions */}
          {selectedQuestions.size > 0 &&
          <Card data-id="wt1ov5ilm" data-path="src/components/EnhancedQuestionBank.tsx">
              <CardContent className="py-4" data-id="4n7gglfex" data-path="src/components/EnhancedQuestionBank.tsx">
                <div className="flex items-center justify-between" data-id="5dwrfgzk8" data-path="src/components/EnhancedQuestionBank.tsx">
                  <div className="flex items-center space-x-2" data-id="8w7qplqob" data-path="src/components/EnhancedQuestionBank.tsx">
                    <CheckCircle className="h-5 w-5 text-green-600" data-id="12mpw46yg" data-path="src/components/EnhancedQuestionBank.tsx" />
                    <span className="font-medium" data-id="zl4g0bw7m" data-path="src/components/EnhancedQuestionBank.tsx">{selectedQuestions.size} questions selected</span>
                  </div>
                  <div className="flex items-center space-x-2" data-id="jdlil6nyz" data-path="src/components/EnhancedQuestionBank.tsx">
                    {multiSelect &&
                  <Checkbox
                    id="select-all"
                    checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
                    onCheckedChange={handleSelectAll} data-id="8yndhg19c" data-path="src/components/EnhancedQuestionBank.tsx" />

                  }
                    <Label htmlFor="select-all" className="text-sm mr-4" data-id="gw92uzhau" data-path="src/components/EnhancedQuestionBank.tsx">
                      Select All
                    </Label>
                    
                    {onSelectQuestions &&
                  <Button size="sm" onClick={handleUseSelectedQuestions} data-id="bhu7xrvv5" data-path="src/components/EnhancedQuestionBank.tsx">
                        <CheckCircle className="h-4 w-4 mr-2" data-id="gsnficc0t" data-path="src/components/EnhancedQuestionBank.tsx" />
                        Use Selected Questions
                      </Button>
                  }
                    
                    <Button variant="outline" size="sm" data-id="2dqmkjaj4" data-path="src/components/EnhancedQuestionBank.tsx">
                      <Download className="h-4 w-4 mr-2" data-id="psgmx7rss" data-path="src/components/EnhancedQuestionBank.tsx" />
                      Export Selected
                    </Button>
                    <Button variant="outline" size="sm" data-id="n8xjrp414" data-path="src/components/EnhancedQuestionBank.tsx">
                      <Copy className="h-4 w-4 mr-2" data-id="k0tskqwh9" data-path="src/components/EnhancedQuestionBank.tsx" />
                      Duplicate Selected
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" data-id="ldrkj139u" data-path="src/components/EnhancedQuestionBank.tsx">
                      <Trash2 className="h-4 w-4 mr-2" data-id="eg78a3clr" data-path="src/components/EnhancedQuestionBank.tsx" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          }

          {/* Questions List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'} data-id="vbe5615ta" data-path="src/components/EnhancedQuestionBank.tsx">
            {filteredQuestions.map((question) =>
            <Card key={question.id} className="hover:shadow-lg transition-shadow" data-id="xgr0onlv4" data-path="src/components/EnhancedQuestionBank.tsx">
                <CardContent className="p-6" data-id="1levke2ps" data-path="src/components/EnhancedQuestionBank.tsx">
                  <div className="flex items-start space-x-4" data-id="6wiz8x58y" data-path="src/components/EnhancedQuestionBank.tsx">
                    <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => handleSelectQuestion(question.id)} data-id="a99l21ayp" data-path="src/components/EnhancedQuestionBank.tsx" />

                    
                    <div className="flex-1" data-id="ng6ahwu3l" data-path="src/components/EnhancedQuestionBank.tsx">
                      <div className="flex items-center justify-between mb-2" data-id="4pjvrz3a3" data-path="src/components/EnhancedQuestionBank.tsx">
                        <div className="flex items-center space-x-2" data-id="f7magd3pn" data-path="src/components/EnhancedQuestionBank.tsx">
                          <Badge className={getSubjectColor(question.subject)} data-id="f0d2am9el" data-path="src/components/EnhancedQuestionBank.tsx">
                            {question.subject}
                          </Badge>
                          <Badge className={getDifficultyColor(question.difficulty)} data-id="4m6ucrngt" data-path="src/components/EnhancedQuestionBank.tsx">
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline" data-id="38w6514om" data-path="src/components/EnhancedQuestionBank.tsx">{question.topic}</Badge>
                        </div>
                        <div className="flex items-center space-x-2" data-id="1pvfhl2ad" data-path="src/components/EnhancedQuestionBank.tsx">
                          <Button variant="ghost" size="sm" data-id="d32z1saee" data-path="src/components/EnhancedQuestionBank.tsx">
                            <Eye className="h-4 w-4" data-id="fsigfqpvg" data-path="src/components/EnhancedQuestionBank.tsx" />
                          </Button>
                          <Button variant="ghost" size="sm" data-id="a6xmu57kx" data-path="src/components/EnhancedQuestionBank.tsx">
                            <Edit className="h-4 w-4" data-id="l7a5uj3tu" data-path="src/components/EnhancedQuestionBank.tsx" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(question.id)} data-id="wb3u6wxwg" data-path="src/components/EnhancedQuestionBank.tsx">
                            <Trash2 className="h-4 w-4" data-id="plm03ky1o" data-path="src/components/EnhancedQuestionBank.tsx" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-3 line-clamp-2" data-id="znv9ei6xb" data-path="src/components/EnhancedQuestionBank.tsx">
                        {question.content}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3" data-id="q5kkiea0z" data-path="src/components/EnhancedQuestionBank.tsx">
                        {question.options.map((option, index) =>
                      <div
                        key={index}
                        className={`p-2 rounded border text-sm ${
                        index === question.correctOption ?
                        'bg-green-50 border-green-200 text-green-800' :
                        'bg-gray-50 border-gray-200'}`
                        } data-id="vjx0xide6" data-path="src/components/EnhancedQuestionBank.tsx">

                            {String.fromCharCode(65 + index)}. {option}
                            {index === question.correctOption &&
                        <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" data-id="ydylwcepy" data-path="src/components/EnhancedQuestionBank.tsx" />
                        }
                          </div>
                      )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500" data-id="iocqb72t8" data-path="src/components/EnhancedQuestionBank.tsx">
                        <div className="flex items-center space-x-2" data-id="9golfccan" data-path="src/components/EnhancedQuestionBank.tsx">
                          <Tag className="h-3 w-3" data-id="jxsuosppo" data-path="src/components/EnhancedQuestionBank.tsx" />
                          <span data-id="h5fsvda9o" data-path="src/components/EnhancedQuestionBank.tsx">Tags: {question.tags.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-2" data-id="gcjk6vfny" data-path="src/components/EnhancedQuestionBank.tsx">
                          <Clock className="h-3 w-3" data-id="7eozh8lwr" data-path="src/components/EnhancedQuestionBank.tsx" />
                          <span data-id="ck8yvvmb1" data-path="src/components/EnhancedQuestionBank.tsx">{new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {filteredQuestions.length === 0 &&
          <Card data-id="8i6oto51m" data-path="src/components/EnhancedQuestionBank.tsx">
              <CardContent className="text-center py-8" data-id="8851jtvyj" data-path="src/components/EnhancedQuestionBank.tsx">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" data-id="454n09i5l" data-path="src/components/EnhancedQuestionBank.tsx" />
                <p className="text-gray-600" data-id="1neoh0ydb" data-path="src/components/EnhancedQuestionBank.tsx">No questions found matching your criteria</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters} data-id="kfjp2qh87" data-path="src/components/EnhancedQuestionBank.tsx">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          }
        </div>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion} data-id="7eygyeeyo" data-path="src/components/EnhancedQuestionBank.tsx">
        <DialogContent className="max-w-2xl" data-id="8wygo8g1u" data-path="src/components/EnhancedQuestionBank.tsx">
          <DialogHeader data-id="j3jkwttbz" data-path="src/components/EnhancedQuestionBank.tsx">
            <DialogTitle data-id="ee04jytsa" data-path="src/components/EnhancedQuestionBank.tsx">Add New Question</DialogTitle>
            <DialogDescription data-id="nuxq6sqdc" data-path="src/components/EnhancedQuestionBank.tsx">
              Create a new question for your question bank
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4" data-id="fmdnyzo98" data-path="src/components/EnhancedQuestionBank.tsx">
            <div data-id="2r8h0s2nh" data-path="src/components/EnhancedQuestionBank.tsx">
              <Label htmlFor="question" data-id="q58uee245" data-path="src/components/EnhancedQuestionBank.tsx">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })} data-id="khdlaiz6z" data-path="src/components/EnhancedQuestionBank.tsx" />

            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="c5yraa7mw" data-path="src/components/EnhancedQuestionBank.tsx">
              {newQuestion.options.map((option, index) =>
              <div key={index} data-id="6hrq39a75" data-path="src/components/EnhancedQuestionBank.tsx">
                  <Label htmlFor={`option-${index}`} data-id="eyxhdtu2z" data-path="src/components/EnhancedQuestionBank.tsx">
                    Option {String.fromCharCode(65 + index)}
                    {index === newQuestion.correctOption &&
                  <Badge className="ml-2 bg-green-100 text-green-800" data-id="col78dmp3" data-path="src/components/EnhancedQuestionBank.tsx">Correct</Badge>
                  }
                  </Label>
                  <Input
                  id={`option-${index}`}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[index] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }} data-id="6kia4u5gq" data-path="src/components/EnhancedQuestionBank.tsx" />

                </div>
              )}
            </div>
            
            <div data-id="rqxcaprqs" data-path="src/components/EnhancedQuestionBank.tsx">
              <Label data-id="5qqtcv4di" data-path="src/components/EnhancedQuestionBank.tsx">Correct Answer</Label>
              <Select
                value={newQuestion.correctOption.toString()}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, correctOption: parseInt(value) })} data-id="29dcqngrk" data-path="src/components/EnhancedQuestionBank.tsx">

                <SelectTrigger data-id="4t8286q1f" data-path="src/components/EnhancedQuestionBank.tsx">
                  <SelectValue data-id="3uxuq43c9" data-path="src/components/EnhancedQuestionBank.tsx" />
                </SelectTrigger>
                <SelectContent data-id="m3gu33lat" data-path="src/components/EnhancedQuestionBank.tsx">
                  {newQuestion.options.map((_, index) =>
                  <SelectItem key={index} value={index.toString()} data-id="p89j2sz5t" data-path="src/components/EnhancedQuestionBank.tsx">
                      Option {String.fromCharCode(65 + index)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="5o5hmbunn" data-path="src/components/EnhancedQuestionBank.tsx">
              <div data-id="ept10u7a3" data-path="src/components/EnhancedQuestionBank.tsx">
                <Label htmlFor="subject" data-id="xp4l7705f" data-path="src/components/EnhancedQuestionBank.tsx">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })} data-id="qx0hofs2i" data-path="src/components/EnhancedQuestionBank.tsx" />

              </div>
              <div data-id="cv597ati6" data-path="src/components/EnhancedQuestionBank.tsx">
                <Label htmlFor="topic" data-id="lmyh4f5c6" data-path="src/components/EnhancedQuestionBank.tsx">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Algebra"
                  value={newQuestion.topic}
                  onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })} data-id="k6tcv7tjr" data-path="src/components/EnhancedQuestionBank.tsx" />

              </div>
              <div data-id="bpu1v0yow" data-path="src/components/EnhancedQuestionBank.tsx">
                <Label data-id="wyl3wqw8b" data-path="src/components/EnhancedQuestionBank.tsx">Difficulty</Label>
                <Select
                  value={newQuestion.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") => setNewQuestion({ ...newQuestion, difficulty: value })} data-id="6wasniudv" data-path="src/components/EnhancedQuestionBank.tsx">

                  <SelectTrigger data-id="v141pyh07" data-path="src/components/EnhancedQuestionBank.tsx">
                    <SelectValue data-id="4t60vvzv2" data-path="src/components/EnhancedQuestionBank.tsx" />
                  </SelectTrigger>
                  <SelectContent data-id="g3a6v4kk3" data-path="src/components/EnhancedQuestionBank.tsx">
                    <SelectItem value="easy" data-id="4etglzxsy" data-path="src/components/EnhancedQuestionBank.tsx">Easy</SelectItem>
                    <SelectItem value="medium" data-id="qf999kyy5" data-path="src/components/EnhancedQuestionBank.tsx">Medium</SelectItem>
                    <SelectItem value="hard" data-id="8gxlh1q76" data-path="src/components/EnhancedQuestionBank.tsx">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div data-id="2tla7pncd" data-path="src/components/EnhancedQuestionBank.tsx">
              <Label htmlFor="tags" data-id="41v01tpxh" data-path="src/components/EnhancedQuestionBank.tsx">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., algebra, equations, basic"
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })} data-id="83vzwfg44" data-path="src/components/EnhancedQuestionBank.tsx" />

            </div>
            
            <div className="flex justify-end space-x-2" data-id="cgp1khzvn" data-path="src/components/EnhancedQuestionBank.tsx">
              <Button variant="outline" onClick={() => setShowAddQuestion(false)} data-id="4f7d0g8lg" data-path="src/components/EnhancedQuestionBank.tsx">
                Cancel
              </Button>
              <Button onClick={handleAddQuestion} data-id="w7285sqln" data-path="src/components/EnhancedQuestionBank.tsx">
                Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload} data-id="o5r8erzud" data-path="src/components/EnhancedQuestionBank.tsx">
        <DialogContent data-id="0okgkkpkn" data-path="src/components/EnhancedQuestionBank.tsx">
          <DialogHeader data-id="8cig6lsyn" data-path="src/components/EnhancedQuestionBank.tsx">
            <DialogTitle data-id="xcg6p1tpz" data-path="src/components/EnhancedQuestionBank.tsx">Bulk Upload Questions</DialogTitle>
            <DialogDescription data-id="uoqefgw0o" data-path="src/components/EnhancedQuestionBank.tsx">
              Upload questions from CSV or Excel file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4" data-id="8nwbpuvyg" data-path="src/components/EnhancedQuestionBank.tsx">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center" data-id="pf8y3yie9" data-path="src/components/EnhancedQuestionBank.tsx">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" data-id="os3kngjxb" data-path="src/components/EnhancedQuestionBank.tsx" />
              <p className="text-gray-600 mb-2" data-id="di2k6l02f" data-path="src/components/EnhancedQuestionBank.tsx">Drop your file here or click to browse</p>
              <p className="text-sm text-gray-500" data-id="5b1q1vazy" data-path="src/components/EnhancedQuestionBank.tsx">Supports CSV and Excel files</p>
              <Button variant="outline" className="mt-4" data-id="jgiobwfux" data-path="src/components/EnhancedQuestionBank.tsx">
                Choose File
              </Button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg" data-id="5fgd0bd01" data-path="src/components/EnhancedQuestionBank.tsx">
              <h4 className="font-medium text-blue-900 mb-2" data-id="y0fdnhy6u" data-path="src/components/EnhancedQuestionBank.tsx">File Format Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1" data-id="76epaug2o" data-path="src/components/EnhancedQuestionBank.tsx">
                <li data-id="3bwpu9tlv" data-path="src/components/EnhancedQuestionBank.tsx">• Column 1: Question</li>
                <li data-id="8zlk197a4" data-path="src/components/EnhancedQuestionBank.tsx">• Column 2-5: Options A, B, C, D</li>
                <li data-id="hor3trdj1" data-path="src/components/EnhancedQuestionBank.tsx">• Column 6: Correct Answer (0-3)</li>
                <li data-id="qr8f6lxnn" data-path="src/components/EnhancedQuestionBank.tsx">• Column 7: Subject</li>
                <li data-id="wmsfggwv1" data-path="src/components/EnhancedQuestionBank.tsx">• Column 8: Topic</li>
                <li data-id="74sm1juul" data-path="src/components/EnhancedQuestionBank.tsx">• Column 9: Difficulty (easy/medium/hard)</li>
                <li data-id="e71gy98yv" data-path="src/components/EnhancedQuestionBank.tsx">• Column 10: Tags (comma separated)</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-2" data-id="gpt8pm999" data-path="src/components/EnhancedQuestionBank.tsx">
              <Button variant="outline" onClick={() => setShowBulkUpload(false)} data-id="72wimhfnj" data-path="src/components/EnhancedQuestionBank.tsx">
                Cancel
              </Button>
              <Button data-id="s8zuoj4vj" data-path="src/components/EnhancedQuestionBank.tsx">
                Upload Questions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default EnhancedQuestionBank;