'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Plus,
  Search,
  // Filter,
  Edit,
  Trash2,
  Save,
  Eye,
  // Clock,
  BookOpen,
  CheckCircle,
  Settings,
  // Timer,
  // Users,
  // FileText,
  Lock
} from
  'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mockDataService, Exam, ExamSection, Question } from '../../../../services/mockData';

interface EnhancedExamBuilderProps {
  onBack: () => void;
  editingExam?: Partial<Exam>;
}

// Mock questions for selection
const mockQuestions: Question[] = [
  {
    id: '1',
    content: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctOption: 1,
    difficulty: 'easy',
    subject: 'Mathematics',
    topic: 'Percentage',
    tags: ['percentage', 'basic-math'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    content: 'If a = 5 and b = 3, what is a² + b²?',
    options: ['25', '34', '30', '28'],
    correctOption: 1,
    difficulty: 'medium',
    subject: 'Mathematics',
    topic: 'Algebra',
    tags: ['algebra', 'squares'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    content: 'Who is the current President of India?',
    options: ['Ram Nath Kovind', 'Droupadi Murmu', 'A.P.J. Abdul Kalam', 'Pranab Mukherjee'],
    correctOption: 1,
    difficulty: 'easy',
    subject: 'General Knowledge',
    topic: 'Current Affairs',
    tags: ['current-affairs', 'politics'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    content: 'Which is the largest planet in our solar system?',
    options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
    correctOption: 2,
    difficulty: 'easy',
    subject: 'Science',
    topic: 'Astronomy',
    tags: ['astronomy', 'planets'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    content: 'If BOOK is coded as 2663, then COOK is coded as?',
    options: ['2663', '3663', '3553', '2553'],
    correctOption: 1,
    difficulty: 'medium',
    subject: 'Reasoning',
    topic: 'Coding-Decoding',
    tags: ['coding', 'reasoning'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const EnhancedExamBuilder: React.FC<EnhancedExamBuilderProps> = ({ onBack, editingExam }) => {
  const [examDetails, setExamDetails] = useState({
    title: '',
    description: '',
    duration: 180,
    totalMarks: 0,
    instructions: '',
    status: 'draft',
    password: '',
    isPasswordRequired: false
  });

  const [sections, setSections] = useState<ExamSection[]>([
    {
      id: '1',
      name: 'Section 1',
      description: 'Main section of the exam',
      questions: [],
      timeLimit: 60,
      marks: 0
    }]
  );

  const [activeSection, setActiveSection] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Load editing exam data
  useEffect(() => {
    if (editingExam) {
      setExamDetails({
        title: editingExam.name || '',
        description: editingExam.description || '',
        duration: editingExam.timeLimit || 180,
        totalMarks: editingExam.totalMarks || 0,
        instructions: editingExam.instructions || '',
        status: editingExam.isPublished ? 'published' : 'draft',
        password: editingExam.password || '',
        isPasswordRequired: editingExam.isPasswordProtected || false
      });
      if (editingExam.sections) {
        setSections(editingExam.sections);
      }
    }
  }, [editingExam]);

  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const subjects = [...new Set(mockQuestions.map((q) => q.subject))];
  const difficulties = ['easy', 'medium', 'hard'];

  const handleAddSection = () => {
    const newSection: ExamSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      description: '',
      questions: [],
      timeLimit: 60,
      marks: 0
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    if (activeSection >= sections.length - 1) {
      setActiveSection(Math.max(0, sections.length - 2));
    }
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<ExamSection>) => {
    setSections(sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    ));
  };

  const handleSelectQuestion = (questionId: string) => {
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

  const handleAddSelectedQuestions = () => {
    const currentSection = sections[activeSection];
    const questionsToAdd = Array.from(selectedQuestions).map((id) =>
      mockQuestions.find((q) => q.id === id)
    ).filter(Boolean) as Question[];

    const updatedQuestions = [...currentSection.questions, ...questionsToAdd];
    const updatedMarks = updatedQuestions.length * 10; // 10 marks per question

    handleUpdateSection(currentSection.id, {
      questions: updatedQuestions,
      marks: updatedMarks
    });

    setSelectedQuestions(new Set());
    setShowQuestionSelector(false);

    toast({
      title: 'Success',
      description: `${questionsToAdd.length} questions added to ${currentSection.name}`
    });
  };

  const handleRemoveQuestion = (sectionId: string, questionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      const updatedQuestions = section.questions.filter((q) => q.id !== questionId);
      const updatedMarks = updatedQuestions.length * 10;
      handleUpdateSection(sectionId, {
        questions: updatedQuestions,
        marks: updatedMarks
      });
    }
  };

  const getTotalQuestions = () => {
    return sections.reduce((total, section) => total + section.questions.length, 0);
  };

  const getTotalMarks = () => {
    return sections.reduce((total, section) => total + section.marks, 0);
  };

  const handleSaveExam = async (status: 'draft' | 'published') => {
    try {
      const examData: Partial<Exam> = {
        name: examDetails.title,
        description: examDetails.description,
        timeLimit: examDetails.duration,
        instructions: examDetails.instructions,
        password: examDetails.password,
        isPasswordProtected: examDetails.isPasswordRequired,
        isPublished: status === 'published',
        isDraft: status === 'draft',
        totalMarks: getTotalMarks(),
        sections: sections,
        createdAt: editingExam?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingExam && editingExam.id) {
        await mockDataService.updateExam(editingExam.id, examData);
      } else {
        await mockDataService.createExam(examData);
      }

      toast({
        title: 'Success',
        description: `Exam ${status === 'published' ? 'published' : 'saved as draft'} successfully`
      });

      onBack();
    } catch (error) {
      console.error('Failed to save exam:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save exam';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-id="2n41p99hv" data-path="src/components/EnhancedExamBuilder.tsx">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-id="x8khhvi35" data-path="src/components/EnhancedExamBuilder.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="76zucb8c4" data-path="src/components/EnhancedExamBuilder.tsx">
          <div className="flex justify-between items-center h-16" data-id="dbyio5jc2" data-path="src/components/EnhancedExamBuilder.tsx">
            <div className="flex items-center" data-id="p2oo2h658" data-path="src/components/EnhancedExamBuilder.tsx">
              <Button variant="ghost" size="sm" className="cursor-pointer" onClick={onBack} data-id="4oktkr8ze" data-path="src/components/EnhancedExamBuilder.tsx">
                <ArrowLeft className="h-4 w-4 mr-2" data-id="o090qt49d" data-path="src/components/EnhancedExamBuilder.tsx" />
                Back
              </Button>
              <Edit className="h-8 w-8 text-blue-600 mr-3 ml-4" data-id="a9mdfscd2" data-path="src/components/EnhancedExamBuilder.tsx" />
              <h1 className="text-xl font-bold text-gray-900" data-id="md9kz79mo" data-path="src/components/EnhancedExamBuilder.tsx">
                {editingExam ? 'Edit Exam' : 'Create New Exam'}
              </h1>
            </div>
            <div className="flex items-center space-x-4" data-id="vowaiw3ek" data-path="src/components/EnhancedExamBuilder.tsx">
              <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => handleSaveExam('draft')} data-id="pv4jesm32" data-path="src/components/EnhancedExamBuilder.tsx">
                <Save className="h-4 w-4 mr-2" data-id="e1v4a0dha" data-path="src/components/EnhancedExamBuilder.tsx" />
                Save Draft
              </Button>
              <Button size="sm" className="cursor-pointer" onClick={() => handleSaveExam('published')} data-id="dqbzbll83" data-path="src/components/EnhancedExamBuilder.tsx">
                <Eye className="h-4 w-4 mr-2" data-id="ftwqqqhqm" data-path="src/components/EnhancedExamBuilder.tsx" />
                Publish Exam
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="k35b64ki7" data-path="src/components/EnhancedExamBuilder.tsx">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-id="q6v32aom8" data-path="src/components/EnhancedExamBuilder.tsx">
          {/* Left Sidebar - Exam Details */}
          <div className="lg:col-span-1" data-id="n2wpvjixa" data-path="src/components/EnhancedExamBuilder.tsx">
            <Card className="sticky top-4" data-id="ymzfxmohg" data-path="src/components/EnhancedExamBuilder.tsx">
              <CardHeader data-id="t0xbip0jh" data-path="src/components/EnhancedExamBuilder.tsx">
                <CardTitle className="flex items-center" data-id="jo0u2tces" data-path="src/components/EnhancedExamBuilder.tsx">
                  <Settings className="h-5 w-5 mr-2" data-id="8n6hcs7dm" data-path="src/components/EnhancedExamBuilder.tsx" />
                  Exam Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4" data-id="alr50o9xy" data-path="src/components/EnhancedExamBuilder.tsx">
                <div data-id="ynkiwq4q3" data-path="src/components/EnhancedExamBuilder.tsx">
                  <Label htmlFor="exam-title" data-id="734snb53f" data-path="src/components/EnhancedExamBuilder.tsx">Exam Title</Label>
                  <Input
                    id="exam-title"
                    placeholder="Enter exam title"
                    value={examDetails.title}
                    onChange={(e) => setExamDetails({ ...examDetails, title: e.target.value })} data-id="r71tpkqzx" data-path="src/components/EnhancedExamBuilder.tsx" />

                </div>

                <div data-id="8n607ao8b" data-path="src/components/EnhancedExamBuilder.tsx">
                  <Label htmlFor="exam-description" data-id="fcu17g65v" data-path="src/components/EnhancedExamBuilder.tsx">Description</Label>
                  <Textarea
                    id="exam-description"
                    placeholder="Enter exam description"
                    value={examDetails.description}
                    onChange={(e) => setExamDetails({ ...examDetails, description: e.target.value })} data-id="k9xsx81cu" data-path="src/components/EnhancedExamBuilder.tsx" />

                </div>

                <div data-id="ied4p3jll" data-path="src/components/EnhancedExamBuilder.tsx">
                  <Label htmlFor="exam-duration" data-id="utskdh4v3" data-path="src/components/EnhancedExamBuilder.tsx">Duration (minutes)</Label>
                  <Input
                    id="exam-duration"
                    type="number"
                    placeholder="Enter duration in minutes"
                    value={examDetails.duration}
                    onChange={(e) => setExamDetails({ ...examDetails, duration: parseInt(e.target.value) || 0 })} data-id="pfskmkcpe" data-path="src/components/EnhancedExamBuilder.tsx" />

                </div>

                <div data-id="r41bfqn9z" data-path="src/components/EnhancedExamBuilder.tsx">
                  <Label htmlFor="exam-instructions" data-id="mcd8cm0sc" data-path="src/components/EnhancedExamBuilder.tsx">Instructions</Label>
                  <Textarea
                    id="exam-instructions"
                    placeholder="Enter exam instructions"
                    value={examDetails.instructions}
                    onChange={(e) => setExamDetails({ ...examDetails, instructions: e.target.value })} data-id="zqyjwsd0p" data-path="src/components/EnhancedExamBuilder.tsx" />

                </div>

                {/* Password Protection */}
                <div className="space-y-3 p-4 border rounded-lg" data-id="f0ovy9gjn" data-path="src/components/EnhancedExamBuilder.tsx">
                  <div className="flex items-center space-x-2" data-id="hsqb5o8ir" data-path="src/components/EnhancedExamBuilder.tsx">
                    <Lock className="h-5 w-5 text-gray-500" data-id="cyq9vzylf" data-path="src/components/EnhancedExamBuilder.tsx" />
                    <Label className="text-base font-medium" data-id="c3wya47ip" data-path="src/components/EnhancedExamBuilder.tsx">Password Protection</Label>
                  </div>
                  <div className="flex items-center space-x-2" data-id="ghb7yjyom" data-path="src/components/EnhancedExamBuilder.tsx">
                    <Switch
                      id="password-required"
                      checked={examDetails.isPasswordRequired}
                      onCheckedChange={(checked) => setExamDetails({ ...examDetails, isPasswordRequired: checked })} data-id="wnh9l9fhl" data-path="src/components/EnhancedExamBuilder.tsx" />

                    <Label htmlFor="password-required" data-id="dhsl1ue7f" data-path="src/components/EnhancedExamBuilder.tsx">Require password to access exam</Label>
                  </div>
                  {examDetails.isPasswordRequired &&
                    <div data-id="y9ehr3x1l" data-path="src/components/EnhancedExamBuilder.tsx">
                      <Label htmlFor="exam-password" data-id="q4jj8g84r" data-path="src/components/EnhancedExamBuilder.tsx">Exam Password</Label>
                      <Input
                        id="exam-password"
                        type="password"
                        placeholder="Enter exam password"
                        value={examDetails.password}
                        onChange={(e) => setExamDetails({ ...examDetails, password: e.target.value })} data-id="ybir57noj" data-path="src/components/EnhancedExamBuilder.tsx" />

                    </div>
                  }
                </div>

                <Separator data-id="cck88ywo8" data-path="src/components/EnhancedExamBuilder.tsx" />

                <div className="grid grid-cols-2 gap-4" data-id="6t0n9jl3s" data-path="src/components/EnhancedExamBuilder.tsx">
                  <div data-id="4pu0azti7" data-path="src/components/EnhancedExamBuilder.tsx">
                    <Label data-id="kl1qppnr9" data-path="src/components/EnhancedExamBuilder.tsx">Total Questions</Label>
                    <div className="text-2xl font-bold text-blue-600" data-id="k6cq6fvpd" data-path="src/components/EnhancedExamBuilder.tsx">{getTotalQuestions()}</div>
                  </div>
                  <div data-id="04is16jth" data-path="src/components/EnhancedExamBuilder.tsx">
                    <Label data-id="huak1oli3" data-path="src/components/EnhancedExamBuilder.tsx">Total Marks</Label>
                    <div className="text-2xl font-bold text-green-600" data-id="1cj8myf7w" data-path="src/components/EnhancedExamBuilder.tsx">{getTotalMarks()}</div>
                  </div>
                </div>

                <div className="space-y-2" data-id="wksj0mb4m" data-path="src/components/EnhancedExamBuilder.tsx">
                  <Label data-id="4ljucoin5" data-path="src/components/EnhancedExamBuilder.tsx">Sections ({sections.length})</Label>
                  {sections.map((section, index) =>
                    <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded" data-id="5dw1sh31u" data-path="src/components/EnhancedExamBuilder.tsx">
                      <div className="flex items-center space-x-2" data-id="m48kel9lc" data-path="src/components/EnhancedExamBuilder.tsx">
                        <Badge variant={index === activeSection ? "default" : "outline"} data-id="6enzw0u17" data-path="src/components/EnhancedExamBuilder.tsx">
                          {section.name}
                        </Badge>
                        <span className="text-sm text-gray-600" data-id="5pcr3a1vx" data-path="src/components/EnhancedExamBuilder.tsx">
                          {section.questions.length} questions
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleDeleteSection(section.id)}
                        disabled={sections.length === 1} data-id="glk0cr1ad" data-path="src/components/EnhancedExamBuilder.tsx">

                        <Trash2 className="h-4 w-4" data-id="7zjpzvu56" data-path="src/components/EnhancedExamBuilder.tsx" />
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer w-full"
                    onClick={handleAddSection}
                    data-id="7ldnwfpg7" data-path="src/components/EnhancedExamBuilder.tsx">

                    <Plus className="h-4 w-4 mr-2" data-id="5ml6k54hl" data-path="src/components/EnhancedExamBuilder.tsx" />
                    Add Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Section Builder */}
          <div className="lg:col-span-2" data-id="kf2yswbp8" data-path="src/components/EnhancedExamBuilder.tsx">
            <Card data-id="63kz31ke0" data-path="src/components/EnhancedExamBuilder.tsx">
              <CardHeader data-id="l7bs7mwuc" data-path="src/components/EnhancedExamBuilder.tsx">
                <CardTitle data-id="z7p737k2n" data-path="src/components/EnhancedExamBuilder.tsx">Section Configuration</CardTitle>
                <CardDescription data-id="673u66ptt" data-path="src/components/EnhancedExamBuilder.tsx">
                  Configure sections and add questions to your exam
                </CardDescription>
              </CardHeader>
              <CardContent data-id="tw3f56y8e" data-path="src/components/EnhancedExamBuilder.tsx">
                <Tabs value={activeSection.toString()} onValueChange={(value) => setActiveSection(parseInt(value))} data-id="6qrh6x77c" data-path="src/components/EnhancedExamBuilder.tsx">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4" data-id="4u8anaq2a" data-path="src/components/EnhancedExamBuilder.tsx">
                    {sections.map((section, index) =>
                      <TabsTrigger key={section.id} value={index.toString()} data-id="z0sbx3a98" data-path="src/components/EnhancedExamBuilder.tsx">
                        {section.name}
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {sections.map((section, index) =>
                    <TabsContent key={section.id} value={index.toString()} className="space-y-6" data-id="p9ceao9sy" data-path="src/components/EnhancedExamBuilder.tsx">
                      {/* Section Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="zqh00i74b" data-path="src/components/EnhancedExamBuilder.tsx">
                        <div data-id="7uxausbgy" data-path="src/components/EnhancedExamBuilder.tsx">
                          <Label htmlFor={`section-name-${section.id}`} data-id="8mmln7ftu" data-path="src/components/EnhancedExamBuilder.tsx">Section Name</Label>
                          <Input
                            id={`section-name-${section.id}`}
                            value={section.name}
                            onChange={(e) => handleUpdateSection(section.id, { name: e.target.value })} data-id="r4f17r8mb" data-path="src/components/EnhancedExamBuilder.tsx" />

                        </div>
                        <div data-id="u43yb3e6r" data-path="src/components/EnhancedExamBuilder.tsx">
                          <Label htmlFor={`section-time-${section.id}`} data-id="7ajpegyst" data-path="src/components/EnhancedExamBuilder.tsx">Time Limit (minutes)</Label>
                          <Input
                            id={`section-time-${section.id}`}
                            type="number"
                            value={section.timeLimit || ''}
                            onChange={(e) => handleUpdateSection(section.id, { timeLimit: parseInt(e.target.value) || undefined })} data-id="pmaalhstx" data-path="src/components/EnhancedExamBuilder.tsx" />

                        </div>
                      </div>

                      <div data-id="z2tcsgeto" data-path="src/components/EnhancedExamBuilder.tsx">
                        <Label htmlFor={`section-description-${section.id}`} data-id="r5g1o62rw" data-path="src/components/EnhancedExamBuilder.tsx">Section Description</Label>
                        <Textarea
                          id={`section-description-${section.id}`}
                          value={section.description}
                          onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })} data-id="91da3ewgj" data-path="src/components/EnhancedExamBuilder.tsx" />

                      </div>

                      {/* Section Questions */}
                      <div data-id="qwuynpx6d" data-path="src/components/EnhancedExamBuilder.tsx">
                        <div className="flex items-center justify-between mb-4" data-id="s1fqd78dt" data-path="src/components/EnhancedExamBuilder.tsx">
                          <Label className="text-base font-medium" data-id="g5gwyjjju" data-path="src/components/EnhancedExamBuilder.tsx">Questions ({section.questions.length})</Label>
                          <Button size="sm" className="cursor-pointer" onClick={() => setShowQuestionSelector(true)} data-id="x792lqkxg" data-path="src/components/EnhancedExamBuilder.tsx">
                            <Plus className="h-4 w-4 mr-2" data-id="rgpppdgjx" data-path="src/components/EnhancedExamBuilder.tsx" />
                            Add Questions
                          </Button>
                        </div>

                        {section.questions.length > 0 ?
                          <div className="space-y-3" data-id="bcydoibp8" data-path="src/components/EnhancedExamBuilder.tsx">
                            {section.questions.map((question, qIndex) =>
                              <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg" data-id="1ipcvryyl" data-path="src/components/EnhancedExamBuilder.tsx">
                                <div className="flex-1" data-id="7aryzor33" data-path="src/components/EnhancedExamBuilder.tsx">
                                  <div className="flex items-center space-x-2 mb-1" data-id="9y4artu4t" data-path="src/components/EnhancedExamBuilder.tsx">
                                    <span className="text-sm font-medium" data-id="i8fl4927b" data-path="src/components/EnhancedExamBuilder.tsx">Q{qIndex + 1}.</span>
                                    <Badge variant="outline" data-id="q4jbiapbx" data-path="src/components/EnhancedExamBuilder.tsx">{question.subject}</Badge>
                                    <Badge className={getDifficultyColor(question.difficulty)} data-id="4zbqchjv8" data-path="src/components/EnhancedExamBuilder.tsx">
                                      {question.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-700" data-id="wrsff7hyi" data-path="src/components/EnhancedExamBuilder.tsx">{question.content}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() => handleRemoveQuestion(section.id, question.id)} data-id="v9yp2hb28" data-path="src/components/EnhancedExamBuilder.tsx">

                                  <Trash2 className="h-4 w-4" data-id="w87wouoee" data-path="src/components/EnhancedExamBuilder.tsx" />
                                </Button>
                              </div>
                            )}
                          </div> :

                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg" data-id="qaxqgqpfx" data-path="src/components/EnhancedExamBuilder.tsx">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" data-id="tfsd184oc" data-path="src/components/EnhancedExamBuilder.tsx" />
                            <p className="text-gray-600" data-id="6gqlnnkc4" data-path="src/components/EnhancedExamBuilder.tsx">No questions added yet</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 cursor-pointer"
                              onClick={() => setShowQuestionSelector(true)} data-id="snf03e16i" data-path="src/components/EnhancedExamBuilder.tsx">

                              Add Questions
                            </Button>
                          </div>
                        }
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Question Selection Dialog */}
      <Dialog open={showQuestionSelector} onOpenChange={setShowQuestionSelector} data-id="e15qb5l8h" data-path="src/components/EnhancedExamBuilder.tsx">
        <DialogContent className="max-w-4xl" data-id="6n18pj3ui" data-path="src/components/EnhancedExamBuilder.tsx">
          <DialogHeader data-id="k8h4dw4s7" data-path="src/components/EnhancedExamBuilder.tsx">
            <DialogTitle data-id="wzh2807oi" data-path="src/components/EnhancedExamBuilder.tsx">Select Questions from Question Bank</DialogTitle>
            <DialogDescription data-id="4x0qm0wjv" data-path="src/components/EnhancedExamBuilder.tsx">
              Choose questions to add to {sections[activeSection]?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4" data-id="jvqq2oza3" data-path="src/components/EnhancedExamBuilder.tsx">
            {/* Search and Filter */}
            <div className="flex space-x-4" data-id="9ovky4cng" data-path="src/components/EnhancedExamBuilder.tsx">
              <div className="flex-1 relative" data-id="mp08bn6yb" data-path="src/components/EnhancedExamBuilder.tsx">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" data-id="8r9vf0gz1" data-path="src/components/EnhancedExamBuilder.tsx" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" data-id="1slkjifx6" data-path="src/components/EnhancedExamBuilder.tsx" />

              </div>
              <Select value={filterSubject} onValueChange={setFilterSubject} data-id="e23tgbfb7" data-path="src/components/EnhancedExamBuilder.tsx">
                <SelectTrigger className="w-48" data-id="ntf99xd2t" data-path="src/components/EnhancedExamBuilder.tsx">
                  <SelectValue placeholder="All Subjects" data-id="iyq1m6dux" data-path="src/components/EnhancedExamBuilder.tsx" />
                </SelectTrigger>
                <SelectContent data-id="bjhhmipd1" data-path="src/components/EnhancedExamBuilder.tsx">
                  <SelectItem value="all" data-id="4tfiauig6" data-path="src/components/EnhancedExamBuilder.tsx">All Subjects</SelectItem>
                  {subjects.map((subject) =>
                    <SelectItem key={subject} value={subject} data-id="q40len0dg" data-path="src/components/EnhancedExamBuilder.tsx">{subject}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty} data-id="mtic2gtus" data-path="src/components/EnhancedExamBuilder.tsx">
                <SelectTrigger className="w-48" data-id="7v7l7mevl" data-path="src/components/EnhancedExamBuilder.tsx">
                  <SelectValue placeholder="All Difficulties" data-id="lblqmoic2" data-path="src/components/EnhancedExamBuilder.tsx" />
                </SelectTrigger>
                <SelectContent data-id="1g1fefcjn" data-path="src/components/EnhancedExamBuilder.tsx">
                  <SelectItem value="all" data-id="1eazg4pwg" data-path="src/components/EnhancedExamBuilder.tsx">All Difficulties</SelectItem>
                  {difficulties.map((difficulty) =>
                    <SelectItem key={difficulty} value={difficulty} data-id="fnwik3lbg" data-path="src/components/EnhancedExamBuilder.tsx">
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Questions List */}
            <div className="max-h-96 overflow-y-auto space-y-2" data-id="51woyd1e3" data-path="src/components/EnhancedExamBuilder.tsx">
              {filteredQuestions.map((question) =>
                <div key={question.id} className="flex items-start space-x-3 p-3 border rounded-lg" data-id="5y5siwuct" data-path="src/components/EnhancedExamBuilder.tsx">
                  <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => handleSelectQuestion(question.id)} data-id="3tkjazgg2" data-path="src/components/EnhancedExamBuilder.tsx" />

                  <div className="flex-1" data-id="kppcxzhca" data-path="src/components/EnhancedExamBuilder.tsx">
                    <div className="flex items-center space-x-2 mb-1" data-id="02t3m1607" data-path="src/components/EnhancedExamBuilder.tsx">
                      <Badge variant="outline" data-id="d1cofe0tc" data-path="src/components/EnhancedExamBuilder.tsx">{question.subject}</Badge>
                      <Badge className={getDifficultyColor(question.difficulty)} data-id="rgo8p2orz" data-path="src/components/EnhancedExamBuilder.tsx">
                        {question.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700" data-id="3zhnuhxdl" data-path="src/components/EnhancedExamBuilder.tsx">{question.content}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between" data-id="9it14d3la" data-path="src/components/EnhancedExamBuilder.tsx">
              <div className="flex items-center space-x-2" data-id="38vanc2jp" data-path="src/components/EnhancedExamBuilder.tsx">
                <CheckCircle className="h-4 w-4 text-green-600" data-id="3u50l1onp" data-path="src/components/EnhancedExamBuilder.tsx" />
                <span className="text-sm" data-id="4lmxr23sk" data-path="src/components/EnhancedExamBuilder.tsx">{selectedQuestions.size} questions selected</span>
              </div>
              <div className="flex space-x-2" data-id="fr2fk3bt6" data-path="src/components/EnhancedExamBuilder.tsx">
                <Button variant="outline" className="cursor-pointer" onClick={() => setShowQuestionSelector(false)} data-id="0fodzc38k" data-path="src/components/EnhancedExamBuilder.tsx">
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={handleAddSelectedQuestions}
                  disabled={selectedQuestions.size === 0} data-id="poibqh59j" data-path="src/components/EnhancedExamBuilder.tsx">

                  Add Selected Questions
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default EnhancedExamBuilder;