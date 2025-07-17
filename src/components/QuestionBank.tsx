import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Plus,
  Search,
  // Filter,
  Edit,
  Trash2,
  Upload,
  Download,
  BookOpen,
  Tag,
  CheckCircle } from
'lucide-react';

type Difficulty = "easy" | "medium" | "hard";

interface NewQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  tags: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
}

interface QuestionBankProps {
  onBack: () => void;
}

// Mock question data
const mockQuestions: Question[] = [
{
  id: 1,
  question: "What is 15% of 200?",
  options: ["25", "30", "35", "40"],
  correctAnswer: 1,
  subject: "Mathematics",
  topic: "Percentage",
  difficulty: "easy",
  tags: ["percentage", "basic-math"],
  createdAt: "2024-01-15"
},
{
  id: 2,
  question: "If a = 5 and b = 3, what is a² + b²?",
  options: ["25", "34", "30", "28"],
  correctAnswer: 1,
  subject: "Mathematics",
  topic: "Algebra",
  difficulty: "medium",
  tags: ["algebra", "squares"],
  createdAt: "2024-01-16"
},
{
  id: 3,
  question: "Who is the current President of India?",
  options: ["Ram Nath Kovind", "Droupadi Murmu", "A.P.J. Abdul Kalam", "Pranab Mukherjee"],
  correctAnswer: 1,
  subject: "General Knowledge",
  topic: "Current Affairs",
  difficulty: "easy",
  tags: ["current-affairs", "politics"],
  createdAt: "2024-01-17"
},
{
  id: 4,
  question: "Which is the largest planet in our solar system?",
  options: ["Earth", "Mars", "Jupiter", "Saturn"],
  correctAnswer: 2,
  subject: "Science",
  topic: "Astronomy",
  difficulty: "easy",
  tags: ["astronomy", "planets"],
  createdAt: "2024-01-18"
},
{
  id: 5,
  question: "If BOOK is coded as 2663, then COOK is coded as?",
  options: ["2663", "3663", "3553", "2553"],
  correctAnswer: 1,
  subject: "Reasoning",
  topic: "Coding-Decoding",
  difficulty: "medium",
  tags: ["coding", "reasoning"],
  createdAt: "2024-01-19"
}];


const QuestionBank: React.FC<QuestionBankProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // New question form state
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    subject: '',
    topic: '',
    difficulty: 'easy',
    tags: ''
  });

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const subjects = [...new Set(questions.map((q) => q.subject))];
  const difficulties = ['easy', 'medium', 'hard'];

  const handleSelectQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
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

  const handleAddQuestion = () => {
    const question: Question = {
      id: Date.now(),
      question: newQuestion.question,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      subject: newQuestion.subject,
      topic: newQuestion.topic,
      difficulty: newQuestion.difficulty,
      tags: newQuestion.tags.split(',').map((t) => t.trim()).filter((t) => t),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setQuestions([...questions, question]);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      subject: '',
      topic: '',
      difficulty: 'easy',
      tags: ''
    });
    setShowAddQuestion(false);
  };

  const handleDeleteQuestion = (questionId: number) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':return 'bg-green-100 text-green-800';
      case 'medium':return 'bg-yellow-100 text-yellow-800';
      case 'hard':return 'bg-red-100 text-red-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-id="7d1qn6cx7" data-path="src/components/QuestionBank.tsx">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-id="wgrhxs03o" data-path="src/components/QuestionBank.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="sd0igswad" data-path="src/components/QuestionBank.tsx">
          <div className="flex justify-between items-center h-16" data-id="5krhgvaut" data-path="src/components/QuestionBank.tsx">
            <div className="flex items-center" data-id="ptgnhpfkg" data-path="src/components/QuestionBank.tsx">
              <Button variant="ghost" size="sm" onClick={onBack} data-id="6xwo815yi" data-path="src/components/QuestionBank.tsx">
                <ArrowLeft className="h-4 w-4 mr-2" data-id="tiimkvmzc" data-path="src/components/QuestionBank.tsx" />
                Back
              </Button>
              <BookOpen className="h-8 w-8 text-blue-600 mr-3 ml-4" data-id="nma7usfkx" data-path="src/components/QuestionBank.tsx" />
              <h1 className="text-xl font-bold text-gray-900" data-id="kl60ppges" data-path="src/components/QuestionBank.tsx">Question Bank</h1>
            </div>
            <div className="flex items-center space-x-4" data-id="ssn9hn1gp" data-path="src/components/QuestionBank.tsx">
              <Button variant="outline" size="sm" onClick={() => setShowBulkUpload(true)} data-id="ibrj63pzm" data-path="src/components/QuestionBank.tsx">
                <Upload className="h-4 w-4 mr-2" data-id="mx3ygytww" data-path="src/components/QuestionBank.tsx" />
                Bulk Upload
              </Button>
              <Button size="sm" onClick={() => setShowAddQuestion(true)} data-id="i18zr30j8" data-path="src/components/QuestionBank.tsx">
                <Plus className="h-4 w-4 mr-2" data-id="57xxxe34s" data-path="src/components/QuestionBank.tsx" />
                Add Question
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="z46jd1s9q" data-path="src/components/QuestionBank.tsx">
        <div className="space-y-6" data-id="bldi784li" data-path="src/components/QuestionBank.tsx">
          {/* Filters and Search */}
          <Card data-id="6fl70wab8" data-path="src/components/QuestionBank.tsx">
            <CardHeader data-id="61y1fyol4" data-path="src/components/QuestionBank.tsx">
              <CardTitle data-id="hdrn00cau" data-path="src/components/QuestionBank.tsx">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent data-id="3en84pdza" data-path="src/components/QuestionBank.tsx">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-id="yy8rxjpdg" data-path="src/components/QuestionBank.tsx">
                <div className="relative" data-id="x1ag86tgx" data-path="src/components/QuestionBank.tsx">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" data-id="38eicptg0" data-path="src/components/QuestionBank.tsx" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10" data-id="gdfowgpyb" data-path="src/components/QuestionBank.tsx" />

                </div>
                <Select value={filterSubject} onValueChange={setFilterSubject} data-id="tj1gezvp5" data-path="src/components/QuestionBank.tsx">
                  <SelectTrigger data-id="hrlk3ajgx" data-path="src/components/QuestionBank.tsx">
                    <SelectValue placeholder="All Subjects" data-id="ixng0ra1w" data-path="src/components/QuestionBank.tsx" />
                  </SelectTrigger>
                  <SelectContent data-id="fzwjisyap" data-path="src/components/QuestionBank.tsx">
                    <SelectItem value="all" data-id="lpoc2zrb5" data-path="src/components/QuestionBank.tsx">All Subjects</SelectItem>
                    {subjects.map((subject) =>
                    <SelectItem key={subject} value={subject} data-id="bkskl1doq" data-path="src/components/QuestionBank.tsx">{subject}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty} data-id="5b02z8uxx" data-path="src/components/QuestionBank.tsx">
                  <SelectTrigger data-id="rudw5kufu" data-path="src/components/QuestionBank.tsx">
                    <SelectValue placeholder="All Difficulties" data-id="7k2jgks6d" data-path="src/components/QuestionBank.tsx" />
                  </SelectTrigger>
                  <SelectContent data-id="83p5qq7ai" data-path="src/components/QuestionBank.tsx">
                    <SelectItem value="all" data-id="g2acliprz" data-path="src/components/QuestionBank.tsx">All Difficulties</SelectItem>
                    {difficulties.map((difficulty) =>
                    <SelectItem key={difficulty} value={difficulty} data-id="ehf7m36ow" data-path="src/components/QuestionBank.tsx">
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2" data-id="7fy237yx7" data-path="src/components/QuestionBank.tsx">
                  <Checkbox
                    id="select-all"
                    checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
                    onCheckedChange={handleSelectAll} data-id="pg6akulps" data-path="src/components/QuestionBank.tsx" />

                  <Label htmlFor="select-all" className="text-sm" data-id="qa4vu7wk1" data-path="src/components/QuestionBank.tsx">
                    Select All ({selectedQuestions.size} selected)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Questions Actions */}
          {selectedQuestions.size > 0 &&
          <Card data-id="9jqawgnq9" data-path="src/components/QuestionBank.tsx">
              <CardContent className="py-4" data-id="4p7gi57oy" data-path="src/components/QuestionBank.tsx">
                <div className="flex items-center justify-between" data-id="hl78sjlts" data-path="src/components/QuestionBank.tsx">
                  <div className="flex items-center space-x-2" data-id="5sh8mpz9i" data-path="src/components/QuestionBank.tsx">
                    <CheckCircle className="h-5 w-5 text-green-600" data-id="y38r0xp88" data-path="src/components/QuestionBank.tsx" />
                    <span className="font-medium" data-id="39kf7lpwj" data-path="src/components/QuestionBank.tsx">{selectedQuestions.size} questions selected</span>
                  </div>
                  <div className="flex items-center space-x-2" data-id="r946jxy2x" data-path="src/components/QuestionBank.tsx">
                    <Button variant="outline" size="sm" data-id="z9o8yae7z" data-path="src/components/QuestionBank.tsx">
                      <Download className="h-4 w-4 mr-2" data-id="sey5nti9c" data-path="src/components/QuestionBank.tsx" />
                      Export Selected
                    </Button>
                    <Button variant="outline" size="sm" data-id="opsrroq4z" data-path="src/components/QuestionBank.tsx">
                      <Plus className="h-4 w-4 mr-2" data-id="m2eadxu2x" data-path="src/components/QuestionBank.tsx" />
                      Add to Exam
                    </Button>
                    <Button variant="outline" size="sm" data-id="d2zvjzeop" data-path="src/components/QuestionBank.tsx">
                      <Trash2 className="h-4 w-4 mr-2" data-id="zjn7qocdc" data-path="src/components/QuestionBank.tsx" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          }

          {/* Questions List */}
          <div className="space-y-4" data-id="5oj8oj3mz" data-path="src/components/QuestionBank.tsx">
            {filteredQuestions.map((question) =>
            <Card key={question.id} className="hover:shadow-md transition-shadow" data-id="gd6s5q1zs" data-path="src/components/QuestionBank.tsx">
                <CardContent className="p-6" data-id="2u7gnlt5l" data-path="src/components/QuestionBank.tsx">
                  <div className="flex items-start space-x-4" data-id="z53scyyma" data-path="src/components/QuestionBank.tsx">
                    <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => handleSelectQuestion(question.id)} data-id="un96hzz55" data-path="src/components/QuestionBank.tsx" />

                    <div className="flex-1" data-id="yzg3c75n0" data-path="src/components/QuestionBank.tsx">
                      <div className="flex items-center justify-between mb-2" data-id="ccf0b5d1z" data-path="src/components/QuestionBank.tsx">
                        <div className="flex items-center space-x-2" data-id="4fllmo80s" data-path="src/components/QuestionBank.tsx">
                          <Badge variant="outline" data-id="6e2pl4coh" data-path="src/components/QuestionBank.tsx">{question.subject}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)} data-id="qh8oah0mx" data-path="src/components/QuestionBank.tsx">
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline" data-id="pew1y7xpi" data-path="src/components/QuestionBank.tsx">{question.topic}</Badge>
                        </div>
                        <div className="flex items-center space-x-2" data-id="rmkccdkht" data-path="src/components/QuestionBank.tsx">
                          <Button variant="ghost" size="sm" data-id="r0xoazygb" data-path="src/components/QuestionBank.tsx">
                            <Edit className="h-4 w-4" data-id="4x0ez11on" data-path="src/components/QuestionBank.tsx" />
                          </Button>
                          <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)} data-id="9ck5onecs" data-path="src/components/QuestionBank.tsx">

                            <Trash2 className="h-4 w-4" data-id="cmiftgc0i" data-path="src/components/QuestionBank.tsx" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-3" data-id="oa63jhgnb" data-path="src/components/QuestionBank.tsx">{question.question}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3" data-id="qmy7kx5ym" data-path="src/components/QuestionBank.tsx">
                        {question.options.map((option, index) =>
                      <div
                        key={index}
                        className={`p-2 rounded border text-sm ${
                        index === question.correctAnswer ?
                        'bg-green-50 border-green-200 text-green-800' :
                        'bg-gray-50 border-gray-200'}`
                        } data-id="9dc5ym7hk" data-path="src/components/QuestionBank.tsx">

                            {String.fromCharCode(65 + index)}. {option}
                            {index === question.correctAnswer &&
                        <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" data-id="7zvkk9y0z" data-path="src/components/QuestionBank.tsx" />
                        }
                          </div>
                      )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500" data-id="7n13s5jux" data-path="src/components/QuestionBank.tsx">
                        <Tag className="h-3 w-3" data-id="zscwm9ibo" data-path="src/components/QuestionBank.tsx" />
                        <span data-id="9i0s1v6fr" data-path="src/components/QuestionBank.tsx">Tags: {question.tags.join(', ')}</span>
                        <span data-id="o2yw3a8sp" data-path="src/components/QuestionBank.tsx">•</span>
                        <span data-id="19ykyi2mk" data-path="src/components/QuestionBank.tsx">Created: {question.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {filteredQuestions.length === 0 &&
          <Card data-id="9xsc5zu5y" data-path="src/components/QuestionBank.tsx">
              <CardContent className="text-center py-8" data-id="7xsa18kwi" data-path="src/components/QuestionBank.tsx">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" data-id="m4rc0uk7s" data-path="src/components/QuestionBank.tsx" />
                <p className="text-gray-600" data-id="rfs65dqxf" data-path="src/components/QuestionBank.tsx">No questions found matching your criteria</p>
              </CardContent>
            </Card>
          }
        </div>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion} data-id="w8megl7lo" data-path="src/components/QuestionBank.tsx">
        <DialogContent className="max-w-2xl" data-id="hrx0ur47x" data-path="src/components/QuestionBank.tsx">
          <DialogHeader data-id="0hy8rbr13" data-path="src/components/QuestionBank.tsx">
            <DialogTitle data-id="kturv7gy5" data-path="src/components/QuestionBank.tsx">Add New Question</DialogTitle>
            <DialogDescription data-id="0potv656y" data-path="src/components/QuestionBank.tsx">
              Create a new question for your question bank
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4" data-id="yelcysj8y" data-path="src/components/QuestionBank.tsx">
            <div data-id="z2vdzdg0x" data-path="src/components/QuestionBank.tsx">
              <Label htmlFor="question" data-id="3ch9q8sl0" data-path="src/components/QuestionBank.tsx">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} data-id="s4d0modrt" data-path="src/components/QuestionBank.tsx" />

            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="r1pmpqyax" data-path="src/components/QuestionBank.tsx">
              {newQuestion.options.map((option, index) =>
              <div key={index} data-id="znm9hw15k" data-path="src/components/QuestionBank.tsx">
                  <Label htmlFor={`option-${index}`} data-id="ausmq3d9r" data-path="src/components/QuestionBank.tsx">
                    Option {String.fromCharCode(65 + index)}
                    {index === newQuestion.correctAnswer &&
                  <Badge className="ml-2 bg-green-100 text-green-800" data-id="x0rnxdqel" data-path="src/components/QuestionBank.tsx">Correct</Badge>
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
                  }} data-id="yt4nzxdo8" data-path="src/components/QuestionBank.tsx" />

                </div>
              )}
            </div>
            
            <div data-id="qfoitv6oc" data-path="src/components/QuestionBank.tsx">
              <Label data-id="qarm3y1tr" data-path="src/components/QuestionBank.tsx">Correct Answer</Label>
              <Select
                value={newQuestion.correctAnswer.toString()}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(value) })} data-id="x7d4vthrv" data-path="src/components/QuestionBank.tsx">

                <SelectTrigger data-id="9h9yvbo97" data-path="src/components/QuestionBank.tsx">
                  <SelectValue data-id="2dm3akisq" data-path="src/components/QuestionBank.tsx" />
                </SelectTrigger>
                <SelectContent data-id="zax9h6mxx" data-path="src/components/QuestionBank.tsx">
                  {newQuestion.options.map((_, index) =>
                  <SelectItem key={index} value={index.toString()} data-id="1ovc5nuof" data-path="src/components/QuestionBank.tsx">
                      Option {String.fromCharCode(65 + index)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="kkmlobwwm" data-path="src/components/QuestionBank.tsx">
              <div data-id="fhegyhn5r" data-path="src/components/QuestionBank.tsx">
                <Label htmlFor="subject" data-id="2obysr8nf" data-path="src/components/QuestionBank.tsx">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })} data-id="1z78d6ocn" data-path="src/components/QuestionBank.tsx" />

              </div>
              <div data-id="7latx8zri" data-path="src/components/QuestionBank.tsx">
                <Label htmlFor="topic" data-id="tz34pvcbe" data-path="src/components/QuestionBank.tsx">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Algebra"
                  value={newQuestion.topic}
                  onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })} data-id="qzbvw82oo" data-path="src/components/QuestionBank.tsx" />

              </div>
              <div data-id="lnn1lz1xq" data-path="src/components/QuestionBank.tsx">
                <Label data-id="auo2j7b3o" data-path="src/components/QuestionBank.tsx">Difficulty</Label>
                <Select
                  value={newQuestion.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") => setNewQuestion({ ...newQuestion, difficulty: value })} data-id="qs5aeikyo" data-path="src/components/QuestionBank.tsx">

                  <SelectTrigger data-id="jfqfikygt" data-path="src/components/QuestionBank.tsx">
                    <SelectValue data-id="757fdcmf5" data-path="src/components/QuestionBank.tsx" />
                  </SelectTrigger>
                  <SelectContent data-id="hnmwvralg" data-path="src/components/QuestionBank.tsx">
                    <SelectItem value="easy" data-id="0m67gvirz" data-path="src/components/QuestionBank.tsx">Easy</SelectItem>
                    <SelectItem value="medium" data-id="h8g4j1lhp" data-path="src/components/QuestionBank.tsx">Medium</SelectItem>
                    <SelectItem value="hard" data-id="3w3m9ncfn" data-path="src/components/QuestionBank.tsx">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div data-id="8gtynkjmo" data-path="src/components/QuestionBank.tsx">
              <Label htmlFor="tags" data-id="x580xdufk" data-path="src/components/QuestionBank.tsx">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., algebra, equations, basic"
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })} data-id="ygn2pghb1" data-path="src/components/QuestionBank.tsx" />

            </div>
            
            <div className="flex justify-end space-x-2" data-id="z5qny4an2" data-path="src/components/QuestionBank.tsx">
              <Button variant="outline" onClick={() => setShowAddQuestion(false)} data-id="geaext5jt" data-path="src/components/QuestionBank.tsx">
                Cancel
              </Button>
              <Button onClick={handleAddQuestion} data-id="r0tw2pf97" data-path="src/components/QuestionBank.tsx">
                Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload} data-id="6eoi4192a" data-path="src/components/QuestionBank.tsx">
        <DialogContent data-id="4xcxt9d3a" data-path="src/components/QuestionBank.tsx">
          <DialogHeader data-id="fordeh3de" data-path="src/components/QuestionBank.tsx">
            <DialogTitle data-id="73c3bwu2y" data-path="src/components/QuestionBank.tsx">Bulk Upload Questions</DialogTitle>
            <DialogDescription data-id="vzdjy5e4s" data-path="src/components/QuestionBank.tsx">
              Upload questions from CSV or Excel file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4" data-id="f3ohnph10" data-path="src/components/QuestionBank.tsx">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center" data-id="xp6wmythw" data-path="src/components/QuestionBank.tsx">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" data-id="8fvb4amj2" data-path="src/components/QuestionBank.tsx" />
              <p className="text-gray-600 mb-2" data-id="0u1thr443" data-path="src/components/QuestionBank.tsx">Drop your file here or click to browse</p>
              <p className="text-sm text-gray-500" data-id="x8eadh2rb" data-path="src/components/QuestionBank.tsx">Supports CSV and Excel files</p>
              <Button variant="outline" className="mt-4" data-id="kbz11gdpp" data-path="src/components/QuestionBank.tsx">
                Choose File
              </Button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg" data-id="cuoi7kbou" data-path="src/components/QuestionBank.tsx">
              <h4 className="font-medium text-blue-900 mb-2" data-id="oj75imz98" data-path="src/components/QuestionBank.tsx">File Format Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1" data-id="xm1rzf4t3" data-path="src/components/QuestionBank.tsx">
                <li data-id="s8cnjchp4" data-path="src/components/QuestionBank.tsx">• Column 1: Question</li>
                <li data-id="cd5re2bap" data-path="src/components/QuestionBank.tsx">• Column 2-5: Options A, B, C, D</li>
                <li data-id="37obslger" data-path="src/components/QuestionBank.tsx">• Column 6: Correct Answer (0-3)</li>
                <li data-id="9neof4j8v" data-path="src/components/QuestionBank.tsx">• Column 7: Subject</li>
                <li data-id="z1lmngkfk" data-path="src/components/QuestionBank.tsx">• Column 8: Topic</li>
                <li data-id="pny2rmwhw" data-path="src/components/QuestionBank.tsx">• Column 9: Difficulty (easy/medium/hard)</li>
                <li data-id="2sodfn9ct" data-path="src/components/QuestionBank.tsx">• Column 10: Tags (comma separated)</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-2" data-id="95bmcx7f6" data-path="src/components/QuestionBank.tsx">
              <Button variant="outline" onClick={() => setShowBulkUpload(false)} data-id="sxuaevtp9" data-path="src/components/QuestionBank.tsx">
                Cancel
              </Button>
              <Button data-id="r2n7xbwtr" data-path="src/components/QuestionBank.tsx">
                Upload Questions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default QuestionBank;