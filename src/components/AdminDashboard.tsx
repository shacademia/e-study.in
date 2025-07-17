import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
// import { Checkbox } from '@/components/ui/checkbox';
import {
  BookOpen,
  // Users,
  // Trophy,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Clock,
  FileText,
  CheckCircle,
  Copy,
  Search,
  // Filter,
  // Settings,
  // BarChart3,
  Undo2 } from
'lucide-react';
import { useAuth } from '../hooks/useMockAuth';
import { mockDataService, Exam, Question, Ranking } from '../services/mockData';
import { toast } from '@/hooks/use-toast';
import ExamBuilder from './ExamBuilder';
import QuestionBank from './QuestionBank';
// import StudentRankings from './StudentRankings';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [showExamBuilder, setShowExamBuilder] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | undefined>(undefined);
  // const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedExamForRankings, setSelectedExamForRankings] = useState('all');

  const [newExam, setNewExam] = useState({
    name: '',
    description: '',
    timeLimit: 60,
    password: '',
    isPasswordProtected: false,
    instructions: ''
  });

  const [newQuestion, setNewQuestion] = useState({
    content: '',
    options: ['', '', '', ''],
    correctOption: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    subject: '',
    topic: '',
    tags: [] as string[]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [examData, questionData, rankingData] = await Promise.all([
        mockDataService.getAllExams(),
        mockDataService.getQuestions(),
        mockDataService.getRankings()]
        );
        setExams(examData);
        setQuestions(questionData);
        setRankings(rankingData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateExam = async () => {
    try {
      const createdExam = await mockDataService.createExam(newExam);
      setShowCreateExam(false);
      setNewExam({
        name: '',
        description: '',
        timeLimit: 60,
        password: '',
        isPasswordProtected: false,
        instructions: ''
      });
      toast({
        title: 'Success',
        description: 'Exam created successfully'
      });
      // Optimistically update the UI
      setExams([...exams, createdExam]);
      const examData = await mockDataService.getAllExams();
      setExams(examData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create exam',
        variant: 'destructive'
      });
    }
  };

  const handleCreateQuestion = async () => {
    try {
      const createdQuestion = await mockDataService.createQuestion(newQuestion);
      setShowCreateQuestion(false);
      setNewQuestion({
        content: '',
        options: ['', '', '', ''],
        correctOption: 0,
        difficulty: 'medium',
        subject: '',
        topic: '',
        tags: []
      });
      toast({
        title: 'Success',
        description: 'Question created successfully'
      });
      // Optimistically update the UI
      setQuestions([...questions, createdQuestion]);
      const questionData = await mockDataService.getQuestions();
      setQuestions(questionData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create question',
        variant: 'destructive'
      });
    }
  };

  const handleTogglePublish = async (examId: string, isPublished: boolean) => {
    try {
      // Optimistically update the UI
      setExams(exams.map((exam) =>
      exam.id === examId ? { ...exam, isPublished, isDraft: !isPublished } : exam
      ));

      await mockDataService.updateExam(examId, { isPublished, isDraft: !isPublished });

      toast({
        title: 'Success',
        description: `Exam ${isPublished ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      // Revert on error
      const examData = await mockDataService.getAllExams();
      setExams(examData);
      toast({
        title: 'Error',
        description: 'Failed to update exam',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      // Optimistically update the UI
      setExams(exams.filter((exam) => exam.id !== examId));

      await mockDataService.deleteExam(examId);

      toast({
        title: 'Success',
        description: 'Exam deleted successfully'
      });
    } catch (error) {
      // Revert on error
      const examData = await mockDataService.getAllExams();
      setExams(examData);
      toast({
        title: 'Error',
        description: 'Failed to delete exam',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicateExam = async (examId: string) => {
    try {
      const duplicatedExam = await mockDataService.duplicateExam(examId);

      // Optimistically update the UI
      setExams([...exams, duplicatedExam]);

      toast({
        title: 'Success',
        description: 'Exam duplicated successfully'
      });
    } catch (error) {
      // Revert on error
      const examData = await mockDataService.getAllExams();
      setExams(examData);
      toast({
        title: 'Error',
        description: 'Failed to duplicate exam',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      // Optimistically update the UI
      setQuestions(questions.filter((q) => q.id !== questionId));

      const deletedQuestion = await mockDataService.deleteQuestion(questionId);

      // Show undo toast
      toast({
        title: 'Question Deleted',
        description: `"${deletedQuestion.content.substring(0, 50)}..." was deleted`,
        action:
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndoDeleteQuestion}
          className="ml-2" data-id="0sposwo3c" data-path="src/components/AdminDashboard.tsx">

            <Undo2 className="h-4 w-4 mr-1" data-id="86mtgxhkq" data-path="src/components/AdminDashboard.tsx" />
            Undo
          </Button>

      });
    } catch (error) {
      // Revert on error
      const questionData = await mockDataService.getQuestions();
      setQuestions(questionData);
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive'
      });
    }
  };

  const handleUndoDeleteQuestion = async () => {
    try {
      const restoredQuestion = await mockDataService.undoDeleteQuestion();

      // Optimistically update the UI
      setQuestions([...questions, restoredQuestion]);

      toast({
        title: 'Question Restored',
        description: `"${restoredQuestion.content.substring(0, 50)}..." was restored`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore question',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicateQuestion = async (questionId: string) => {
    try {
      const duplicatedQuestion = await mockDataService.duplicateQuestion(questionId);

      // Optimistically update the UI
      setQuestions([...questions, duplicatedQuestion]);

      toast({
        title: 'Success',
        description: 'Question duplicated successfully'
      });
    } catch (error) {
      // Revert on error
      const questionData = await mockDataService.getQuestions();
      setQuestions(questionData);
      toast({
        title: 'Error',
        description: 'Failed to duplicate question',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || q.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const subjects = [...new Set(questions.map((q) => q.subject))];
  const publishedExams = exams.filter((exam) => exam.isPublished);
  const draftExams = exams.filter((exam) => exam.isDraft);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Filter rankings based on selected exam
  const filteredRankings = selectedExamForRankings === 'all' ?
  rankings.slice(0, 10) :
  rankings.filter((r) => r.examId === selectedExamForRankings).slice(0, 10);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen" data-id="w70oqqbma" data-path="src/components/AdminDashboard.tsx">Loading...</div>;
  }

  // Show other components
  if (showExamBuilder) {
    return <ExamBuilder onBack={() => setShowExamBuilder(false)} editingExam={selectedExam} data-id="bzurrhcs8" data-path="src/components/AdminDashboard.tsx" />;
  }

  if (showQuestionBank) {
    return <QuestionBank onBack={() => setShowQuestionBank(false)} data-id="viylgv3pn" data-path="src/components/AdminDashboard.tsx" />;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-id="l89qdsy95" data-path="src/components/AdminDashboard.tsx">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-id="z2nxs9yx3" data-path="src/components/AdminDashboard.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="tla4astmp" data-path="src/components/AdminDashboard.tsx">
          <div className="flex justify-between items-center h-16" data-id="g3gp36scy" data-path="src/components/AdminDashboard.tsx">
            <div className="flex items-center" data-id="d2pj8vqcw" data-path="src/components/AdminDashboard.tsx">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" data-id="pp81cdy8q" data-path="src/components/AdminDashboard.tsx" />
              <h1 className="text-xl font-bold text-gray-900" data-id="4g316wbyn" data-path="src/components/AdminDashboard.tsx">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4" data-id="nuvwnqeea" data-path="src/components/AdminDashboard.tsx">
              <Badge variant="outline" data-id="s09w41gss" data-path="src/components/AdminDashboard.tsx">{user?.name}</Badge>
              <Button variant="outline" size="sm" onClick={handleLogout} data-id="j5rgmjj0h" data-path="src/components/AdminDashboard.tsx">
                <LogOut className="h-4 w-4 mr-2" data-id="fvrgm0z68" data-path="src/components/AdminDashboard.tsx" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="xlclk3tzs" data-path="src/components/AdminDashboard.tsx">
        <Tabs defaultValue="overview" className="space-y-6" data-id="5xtyi6x5p" data-path="src/components/AdminDashboard.tsx">
          <TabsList className="grid w-full grid-cols-3" data-id="7t8fa02mc" data-path="src/components/AdminDashboard.tsx">
            <TabsTrigger value="overview" data-id="ob0g639av" data-path="src/components/AdminDashboard.tsx">Overview & Exams</TabsTrigger>
            <TabsTrigger value="questions" data-id="2lk1278hw" data-path="src/components/AdminDashboard.tsx">Questions</TabsTrigger>
            <TabsTrigger value="rankings" data-id="upcn7a0t1" data-path="src/components/AdminDashboard.tsx">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" data-id="43ibzgfud" data-path="src/components/AdminDashboard.tsx">
            <div className="space-y-6" data-id="3riy9xrl1" data-path="src/components/AdminDashboard.tsx">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-id="f1lzdf8m0" data-path="src/components/AdminDashboard.tsx">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200" data-id="s5z7wkw1r" data-path="src/components/AdminDashboard.tsx">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="6rvlspzlv" data-path="src/components/AdminDashboard.tsx">
                    <CardTitle className="text-sm font-medium text-blue-800" data-id="6xxk38u23" data-path="src/components/AdminDashboard.tsx">Total Exams</CardTitle>
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center" data-id="za698udhb" data-path="src/components/AdminDashboard.tsx">
                      <FileText className="h-4 w-4 text-white" data-id="mz4npxq6m" data-path="src/components/AdminDashboard.tsx" />
                    </div>
                  </CardHeader>
                  <CardContent data-id="afi2wbc6u" data-path="src/components/AdminDashboard.tsx">
                    <div className="text-2xl font-bold text-blue-900" data-id="7xuzewo68" data-path="src/components/AdminDashboard.tsx">{exams.length}</div>
                    <p className="text-xs text-blue-600 mt-1" data-id="1h0zeldzj" data-path="src/components/AdminDashboard.tsx">All created exams</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200" data-id="lx7yrct4f" data-path="src/components/AdminDashboard.tsx">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="rbagywiu2" data-path="src/components/AdminDashboard.tsx">
                    <CardTitle className="text-sm font-medium text-green-800" data-id="jbj8g1405" data-path="src/components/AdminDashboard.tsx">Published</CardTitle>
                    <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center" data-id="zndp3h3so" data-path="src/components/AdminDashboard.tsx">
                      <CheckCircle className="h-4 w-4 text-white" data-id="e79djbb52" data-path="src/components/AdminDashboard.tsx" />
                    </div>
                  </CardHeader>
                  <CardContent data-id="gsg4xb137" data-path="src/components/AdminDashboard.tsx">
                    <div className="text-2xl font-bold text-green-900" data-id="5l1fpfm6c" data-path="src/components/AdminDashboard.tsx">{publishedExams.length}</div>
                    <p className="text-xs text-green-600 mt-1" data-id="onlun1dmf" data-path="src/components/AdminDashboard.tsx">Active exams</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200" data-id="c4l8jstmq" data-path="src/components/AdminDashboard.tsx">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="6jo8uxocl" data-path="src/components/AdminDashboard.tsx">
                    <CardTitle className="text-sm font-medium text-yellow-800" data-id="skg2ne28o" data-path="src/components/AdminDashboard.tsx">Draft</CardTitle>
                    <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center" data-id="6gcw78jn0" data-path="src/components/AdminDashboard.tsx">
                      <Edit className="h-4 w-4 text-white" data-id="3esxwko6b" data-path="src/components/AdminDashboard.tsx" />
                    </div>
                  </CardHeader>
                  <CardContent data-id="aherkjd09" data-path="src/components/AdminDashboard.tsx">
                    <div className="text-2xl font-bold text-yellow-900" data-id="z958vlw2r" data-path="src/components/AdminDashboard.tsx">{draftExams.length}</div>
                    <p className="text-xs text-yellow-600 mt-1" data-id="32q91opc6" data-path="src/components/AdminDashboard.tsx">Pending exams</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200" data-id="v9a1ijkia" data-path="src/components/AdminDashboard.tsx">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="1qg0floo8" data-path="src/components/AdminDashboard.tsx">
                    <CardTitle className="text-sm font-medium text-purple-800" data-id="4i0l0gma7" data-path="src/components/AdminDashboard.tsx">Questions</CardTitle>
                    <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center" data-id="a8ybzlfxw" data-path="src/components/AdminDashboard.tsx">
                      <BookOpen className="h-4 w-4 text-white" data-id="xsczpi7r6" data-path="src/components/AdminDashboard.tsx" />
                    </div>
                  </CardHeader>
                  <CardContent data-id="rbt7czok4" data-path="src/components/AdminDashboard.tsx">
                    <div className="text-2xl font-bold text-purple-900" data-id="2n0obf6td" data-path="src/components/AdminDashboard.tsx">{questions.length}</div>
                    <p className="text-xs text-purple-600 mt-1" data-id="53o92lowk" data-path="src/components/AdminDashboard.tsx">Question bank</p>
                  </CardContent>
                </Card>
              </div>

              {/* Exam Management */}
              <div className="space-y-6" data-id="d1mscx5d9" data-path="src/components/AdminDashboard.tsx">
                <div className="flex justify-between items-center" data-id="jashzh9wk" data-path="src/components/AdminDashboard.tsx">
                  <h2 className="text-2xl font-bold" data-id="3dfwnzxp7" data-path="src/components/AdminDashboard.tsx">Exam Management</h2>
                  <div className="flex space-x-2" data-id="y1towoot3" data-path="src/components/AdminDashboard.tsx">
                    <Button variant="outline" onClick={() => setShowQuestionBank(true)} data-id="44qcee5pl" data-path="src/components/AdminDashboard.tsx">
                      <BookOpen className="h-4 w-4 mr-2" data-id="gy34as799" data-path="src/components/AdminDashboard.tsx" />
                      Question Bank
                    </Button>
                    <Dialog open={showCreateExam} onOpenChange={setShowCreateExam} data-id="e46uu5j9z" data-path="src/components/AdminDashboard.tsx">
                      <DialogTrigger asChild data-id="sj6wucftz" data-path="src/components/AdminDashboard.tsx">
                        <Button data-id="a9d337j06" data-path="src/components/AdminDashboard.tsx">
                          <Plus className="h-4 w-4 mr-2" data-id="bh61i5qdt" data-path="src/components/AdminDashboard.tsx" />
                          Create Exam
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-id="lz0ejpve3" data-path="src/components/AdminDashboard.tsx">
                        <DialogHeader data-id="e0j10pj12" data-path="src/components/AdminDashboard.tsx">
                          <DialogTitle data-id="tzwx6awvo" data-path="src/components/AdminDashboard.tsx">Create New Exam</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4" data-id="uu3hqux9t" data-path="src/components/AdminDashboard.tsx">
                          <div data-id="hxmhm787q" data-path="src/components/AdminDashboard.tsx">
                            <Label htmlFor="exam-name" data-id="pcff4vuny" data-path="src/components/AdminDashboard.tsx">Exam Name</Label>
                            <Input
                              id="exam-name"
                              value={newExam.name}
                              onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                              placeholder="Enter exam name" data-id="ka7k1fway" data-path="src/components/AdminDashboard.tsx" />

                          </div>
                          <div data-id="bj8rgr0gj" data-path="src/components/AdminDashboard.tsx">
                            <Label htmlFor="exam-description" data-id="771580c8e" data-path="src/components/AdminDashboard.tsx">Description</Label>
                            <Textarea
                              id="exam-description"
                              value={newExam.description}
                              onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                              placeholder="Enter exam description" data-id="etam4zylz" data-path="src/components/AdminDashboard.tsx" />

                          </div>
                          <div data-id="sfo5n3o78" data-path="src/components/AdminDashboard.tsx">
                            <Label htmlFor="exam-instructions" data-id="zr5o5b428" data-path="src/components/AdminDashboard.tsx">Instructions</Label>
                            <Textarea
                              id="exam-instructions"
                              value={newExam.instructions}
                              onChange={(e) => setNewExam({ ...newExam, instructions: e.target.value })}
                              placeholder="Enter exam instructions" data-id="9rnh3w529" data-path="src/components/AdminDashboard.tsx" />

                          </div>
                          <div data-id="ab9f2mne3" data-path="src/components/AdminDashboard.tsx">
                            <Label htmlFor="exam-time" data-id="8posrlu6k" data-path="src/components/AdminDashboard.tsx">Time Limit (minutes)</Label>
                            <Input
                              id="exam-time"
                              type="number"
                              value={newExam.timeLimit}
                              onChange={(e) => setNewExam({ ...newExam, timeLimit: parseInt(e.target.value) })} data-id="diprv1v9x" data-path="src/components/AdminDashboard.tsx" />

                          </div>
                          <div className="flex items-center space-x-2" data-id="gfrl8f61q" data-path="src/components/AdminDashboard.tsx">
                            <Switch
                              id="password-protected"
                              checked={newExam.isPasswordProtected}
                              onCheckedChange={(checked) => setNewExam({ ...newExam, isPasswordProtected: checked })} data-id="fuwte8y9i" data-path="src/components/AdminDashboard.tsx" />

                            <Label htmlFor="password-protected" data-id="90qwy2045" data-path="src/components/AdminDashboard.tsx">Password Protected</Label>
                          </div>
                          {newExam.isPasswordProtected &&
                          <div data-id="mmll8hxwf" data-path="src/components/AdminDashboard.tsx">
                              <Label htmlFor="exam-password" data-id="uhslx68t7" data-path="src/components/AdminDashboard.tsx">Password</Label>
                              <Input
                              id="exam-password"
                              type="password"
                              value={newExam.password}
                              onChange={(e) => setNewExam({ ...newExam, password: e.target.value })}
                              placeholder="Enter exam password" data-id="kla9jgnqx" data-path="src/components/AdminDashboard.tsx" />

                            </div>
                          }
                          <Button onClick={handleCreateExam} className="w-full" data-id="9yzmjz9ld" data-path="src/components/AdminDashboard.tsx">
                            Create Exam
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid gap-4" data-id="h1p9ln3of" data-path="src/components/AdminDashboard.tsx">
                  {exams.map((exam) =>
                  <Card key={exam.id} data-id="288xc6cfj" data-path="src/components/AdminDashboard.tsx">
                      <CardHeader data-id="sfcoervit" data-path="src/components/AdminDashboard.tsx">
                        <div className="flex justify-between items-start" data-id="8mx9vpvjp" data-path="src/components/AdminDashboard.tsx">
                          <div data-id="ewweq3v5d" data-path="src/components/AdminDashboard.tsx">
                            <CardTitle className="flex items-center gap-2" data-id="4d4z5eef1" data-path="src/components/AdminDashboard.tsx">
                              {exam.name}
                              {exam.isPasswordProtected &&
                            <Lock className="h-4 w-4 text-yellow-600" data-id="p9mars6lv" data-path="src/components/AdminDashboard.tsx" />
                            }
                            </CardTitle>
                            <CardDescription data-id="darsto63w" data-path="src/components/AdminDashboard.tsx">{exam.description}</CardDescription>
                            {exam.isPasswordProtected && exam.password &&
                          <div className="mt-2" data-id="pj6j29dyn" data-path="src/components/AdminDashboard.tsx">
                                <Badge variant="outline" data-id="w0e135fwd" data-path="src/components/AdminDashboard.tsx">Password: {exam.password}</Badge>
                              </div>
                          }
                          </div>
                          <div className="flex items-center gap-2" data-id="7wy9t45e2" data-path="src/components/AdminDashboard.tsx">
                            <Badge variant={exam.isPublished ? "default" : "secondary"} data-id="og6kohn5n" data-path="src/components/AdminDashboard.tsx">
                              {exam.isPublished ? "Published" : "Draft"}
                            </Badge>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(exam.id, !exam.isPublished)} data-id="b9irbdk42" data-path="src/components/AdminDashboard.tsx">

                              {exam.isPublished ?
                            <>
                                  <EyeOff className="h-4 w-4 mr-1" data-id="xhll2oszv" data-path="src/components/AdminDashboard.tsx" />
                                  Unpublish
                                </> :

                            <>
                                  <Eye className="h-4 w-4 mr-1" data-id="t31nduqls" data-path="src/components/AdminDashboard.tsx" />
                                  Publish
                                </>
                            }
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateExam(exam.id)} data-id="u5thkck0e" data-path="src/components/AdminDashboard.tsx">

                              <Copy className="h-4 w-4" data-id="ws9s0wq56" data-path="src/components/AdminDashboard.tsx" />
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowExamBuilder(true);
                            }} data-id="plu6du83g" data-path="src/components/AdminDashboard.tsx">

                              <Edit className="h-4 w-4" data-id="wjs96azu5" data-path="src/components/AdminDashboard.tsx" />
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)} data-id="5yvp6ybwv" data-path="src/components/AdminDashboard.tsx">

                              <Trash2 className="h-4 w-4" data-id="hah4mtzt4" data-path="src/components/AdminDashboard.tsx" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent data-id="n0i2u2b8a" data-path="src/components/AdminDashboard.tsx">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-id="dqbegh371" data-path="src/components/AdminDashboard.tsx">
                          <div className="flex items-center text-sm text-gray-600" data-id="1itioe8wj" data-path="src/components/AdminDashboard.tsx">
                            <Clock className="h-4 w-4 mr-1" data-id="2to2b7aul" data-path="src/components/AdminDashboard.tsx" />
                            {exam.timeLimit} mins
                          </div>
                          <div className="text-sm text-gray-600" data-id="rioavcmu8" data-path="src/components/AdminDashboard.tsx">
                            <span className="font-medium" data-id="rtb4208j7" data-path="src/components/AdminDashboard.tsx">{exam.totalMarks}</span> marks
                          </div>
                          <div className="text-sm text-gray-600" data-id="o1rl1tm40" data-path="src/components/AdminDashboard.tsx">
                            <span className="font-medium" data-id="ee03l3k1v" data-path="src/components/AdminDashboard.tsx">{exam.questions.length}</span> questions
                          </div>
                          <div className="text-sm text-gray-600" data-id="kogdnxgwp" data-path="src/components/AdminDashboard.tsx">
                            <CheckCircle className="h-4 w-4 mr-1 inline" data-id="xcd2f9033" data-path="src/components/AdminDashboard.tsx" />
                            {exam.isPublished ? 'Published' : 'Draft'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions" data-id="vxokuh88j" data-path="src/components/AdminDashboard.tsx">
            <div className="space-y-6" data-id="jnbi0hcsf" data-path="src/components/AdminDashboard.tsx">
              <div className="flex justify-between items-center" data-id="mdreeav7t" data-path="src/components/AdminDashboard.tsx">
                <h2 className="text-2xl font-bold" data-id="tafhfzq9t" data-path="src/components/AdminDashboard.tsx">Question Bank</h2>
                <Dialog open={showCreateQuestion} onOpenChange={setShowCreateQuestion} data-id="q8q3x9dki" data-path="src/components/AdminDashboard.tsx">
                  <DialogTrigger asChild data-id="yhv9ss0cn" data-path="src/components/AdminDashboard.tsx">
                    <Button data-id="remtp8vqc" data-path="src/components/AdminDashboard.tsx">
                      <Plus className="h-4 w-4 mr-2" data-id="xxvtf1c8y" data-path="src/components/AdminDashboard.tsx" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" data-id="r8a3w5udx" data-path="src/components/AdminDashboard.tsx">
                    <DialogHeader data-id="b59xgf1eg" data-path="src/components/AdminDashboard.tsx">
                      <DialogTitle data-id="db636egn5" data-path="src/components/AdminDashboard.tsx">Add New Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4" data-id="6ldjmmzt9" data-path="src/components/AdminDashboard.tsx">
                      <div data-id="l52m278er" data-path="src/components/AdminDashboard.tsx">
                        <Label htmlFor="question-content" data-id="aoaiiqwn8" data-path="src/components/AdminDashboard.tsx">Question</Label>
                        <Textarea
                          id="question-content"
                          value={newQuestion.content}
                          onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                          placeholder="Enter question here..." data-id="0bvzjwcij" data-path="src/components/AdminDashboard.tsx" />

                      </div>
                      <div className="grid grid-cols-2 gap-4" data-id="aigi7f8y8" data-path="src/components/AdminDashboard.tsx">
                        {newQuestion.options.map((option, index) =>
                        <div key={index} data-id="1gblxlqoe" data-path="src/components/AdminDashboard.tsx">
                            <Label htmlFor={`option-${index}`} data-id="r44pql6m4" data-path="src/components/AdminDashboard.tsx">
                              Option {String.fromCharCode(65 + index)}
                              {index === newQuestion.correctOption &&
                            <Badge className="ml-2 bg-green-100 text-green-800" data-id="9m3demw75" data-path="src/components/AdminDashboard.tsx">Correct</Badge>
                            }
                            </Label>
                            <Input
                            id={`option-${index}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion({ ...newQuestion, options: newOptions });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`} data-id="d0dd77pxb" data-path="src/components/AdminDashboard.tsx" />

                          </div>
                        )}
                      </div>
                      <div data-id="f337qm8wg" data-path="src/components/AdminDashboard.tsx">
                        <Label data-id="75yl9tj3n" data-path="src/components/AdminDashboard.tsx">Correct Answer</Label>
                        <Select
                          value={newQuestion.correctOption.toString()}
                          onValueChange={(value) => setNewQuestion({ ...newQuestion, correctOption: parseInt(value) })} data-id="pqy2qasvh" data-path="src/components/AdminDashboard.tsx">

                          <SelectTrigger data-id="ysbefpodz" data-path="src/components/AdminDashboard.tsx">
                            <SelectValue data-id="fhu08jnpw" data-path="src/components/AdminDashboard.tsx" />
                          </SelectTrigger>
                          <SelectContent data-id="x8j6p4a9f" data-path="src/components/AdminDashboard.tsx">
                            {newQuestion.options.map((_, index) =>
                            <SelectItem key={index} value={index.toString()} data-id="0787o1nj6" data-path="src/components/AdminDashboard.tsx">
                                Option {String.fromCharCode(65 + index)}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-4" data-id="qg6zwv69c" data-path="src/components/AdminDashboard.tsx">
                        <div data-id="sjn7137fx" data-path="src/components/AdminDashboard.tsx">
                          <Label htmlFor="subject" data-id="qgp5qu202" data-path="src/components/AdminDashboard.tsx">Subject</Label>
                          <Input
                            id="subject"
                            value={newQuestion.subject}
                            onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                            placeholder="e.g., Mathematics" data-id="vss5vktoz" data-path="src/components/AdminDashboard.tsx" />

                        </div>
                        <div data-id="z7v2ee5h2" data-path="src/components/AdminDashboard.tsx">
                          <Label htmlFor="topic" data-id="j9q5r4jsg" data-path="src/components/AdminDashboard.tsx">Topic</Label>
                          <Input
                            id="topic"
                            value={newQuestion.topic}
                            onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                            placeholder="e.g., Algebra" data-id="028z6egy7" data-path="src/components/AdminDashboard.tsx" />

                        </div>
                        <div data-id="yce1riwmx" data-path="src/components/AdminDashboard.tsx">
                          <Label data-id="il4ysac0o" data-path="src/components/AdminDashboard.tsx">Difficulty</Label>
                          <Select
                            value={newQuestion.difficulty}
                            onValueChange={(value: "easy" | "medium" | "hard") => setNewQuestion({ ...newQuestion, difficulty: value })} data-id="jermlq8jv" data-path="src/components/AdminDashboard.tsx">

                            <SelectTrigger data-id="r1uvvkpd2" data-path="src/components/AdminDashboard.tsx">
                              <SelectValue data-id="98q1rdzmz" data-path="src/components/AdminDashboard.tsx" />
                            </SelectTrigger>
                            <SelectContent data-id="cttpmtwwp" data-path="src/components/AdminDashboard.tsx">
                              <SelectItem value="easy" data-id="pzn46j66s" data-path="src/components/AdminDashboard.tsx">Easy</SelectItem>
                              <SelectItem value="medium" data-id="z0p5f4cgn" data-path="src/components/AdminDashboard.tsx">Medium</SelectItem>
                              <SelectItem value="hard" data-id="hbc8llc90" data-path="src/components/AdminDashboard.tsx">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleCreateQuestion} className="w-full" data-id="4c46isisq" data-path="src/components/AdminDashboard.tsx">
                        Add Question
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Question Filters */}
              <Card data-id="01nyppk4h" data-path="src/components/AdminDashboard.tsx">
                <CardHeader data-id="48ageoejo" data-path="src/components/AdminDashboard.tsx">
                  <CardTitle data-id="idyk4lu4h" data-path="src/components/AdminDashboard.tsx">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent data-id="m1e2blc2k" data-path="src/components/AdminDashboard.tsx">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="8lc5zugm3" data-path="src/components/AdminDashboard.tsx">
                    <div className="relative" data-id="9kkk8ym2c" data-path="src/components/AdminDashboard.tsx">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" data-id="k5n8hlrfa" data-path="src/components/AdminDashboard.tsx" />
                      <Input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10" data-id="ydc53m3if" data-path="src/components/AdminDashboard.tsx" />

                    </div>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter} data-id="78q45zxcs" data-path="src/components/AdminDashboard.tsx">
                      <SelectTrigger data-id="haol52vxz" data-path="src/components/AdminDashboard.tsx">
                        <SelectValue placeholder="All Subjects" data-id="ltb2o5cud" data-path="src/components/AdminDashboard.tsx" />
                      </SelectTrigger>
                      <SelectContent data-id="z79a6vs0v" data-path="src/components/AdminDashboard.tsx">
                        <SelectItem value="all" data-id="n9ii1h5z3" data-path="src/components/AdminDashboard.tsx">All Subjects</SelectItem>
                        {subjects.map((subject) =>
                        <SelectItem key={subject} value={subject} data-id="s0dfhias0" data-path="src/components/AdminDashboard.tsx">{subject}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter} data-id="yqnf87q9a" data-path="src/components/AdminDashboard.tsx">
                      <SelectTrigger data-id="6bo4m4i5c" data-path="src/components/AdminDashboard.tsx">
                        <SelectValue placeholder="All Difficulties" data-id="y4oyg4od0" data-path="src/components/AdminDashboard.tsx" />
                      </SelectTrigger>
                      <SelectContent data-id="0b011vvbx" data-path="src/components/AdminDashboard.tsx">
                        <SelectItem value="all" data-id="cnd0jp82k" data-path="src/components/AdminDashboard.tsx">All Difficulties</SelectItem>
                        <SelectItem value="easy" data-id="gxn0crrw1" data-path="src/components/AdminDashboard.tsx">Easy</SelectItem>
                        <SelectItem value="medium" data-id="anpkka2tx" data-path="src/components/AdminDashboard.tsx">Medium</SelectItem>
                        <SelectItem value="hard" data-id="5l6ghgzg8" data-path="src/components/AdminDashboard.tsx">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Questions List */}
              <div className="space-y-4" data-id="gdthkp0h0" data-path="src/components/AdminDashboard.tsx">
                {filteredQuestions.map((question) =>
                <Card key={question.id} data-id="omqsdjaa7" data-path="src/components/AdminDashboard.tsx">
                    <CardContent className="p-6" data-id="rnu4gthu4" data-path="src/components/AdminDashboard.tsx">
                      <div className="flex items-start justify-between" data-id="hzsz4pg75" data-path="src/components/AdminDashboard.tsx">
                        <div className="flex-1" data-id="bnyh8vsxt" data-path="src/components/AdminDashboard.tsx">
                          <div className="flex items-center gap-2 mb-2" data-id="gt8hremth" data-path="src/components/AdminDashboard.tsx">
                            <Badge variant="outline" data-id="tcafefa42" data-path="src/components/AdminDashboard.tsx">{question.subject}</Badge>
                            <Badge
                            className={
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                            } data-id="bv9mjehn2" data-path="src/components/AdminDashboard.tsx">

                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline" data-id="3nxtdt2xw" data-path="src/components/AdminDashboard.tsx">{question.topic}</Badge>
                          </div>
                          <h3 className="font-medium mb-3" data-id="x5k8sk8er" data-path="src/components/AdminDashboard.tsx">{question.content}</h3>
                          <div className="grid grid-cols-2 gap-2 mb-3" data-id="0al0v0fig" data-path="src/components/AdminDashboard.tsx">
                            {question.options.map((option, index) =>
                          <div
                            key={index}
                            className={`p-2 rounded border text-sm ${
                            index === question.correctOption ?
                            'bg-green-50 border-green-200 text-green-800' :
                            'bg-gray-50 border-gray-200'}`
                            } data-id="n56bc45d5" data-path="src/components/AdminDashboard.tsx">

                                {String.fromCharCode(65 + index)}. {option}
                                {index === question.correctOption &&
                            <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" data-id="a2i2nlexc" data-path="src/components/AdminDashboard.tsx" />
                            }
                              </div>
                          )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500" data-id="r8ae556z7" data-path="src/components/AdminDashboard.tsx">
                            <span data-id="95275ik6g" data-path="src/components/AdminDashboard.tsx">Tags: {question.tags.join(', ')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" data-id="vr1rpawlz" data-path="src/components/AdminDashboard.tsx">
                          <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateQuestion(question.id)} data-id="f17o2d5db" data-path="src/components/AdminDashboard.tsx">

                            <Copy className="h-4 w-4" data-id="ihrdrn9tf" data-path="src/components/AdminDashboard.tsx" />
                          </Button>
                          <Button variant="outline" size="sm" data-id="qtypugh2e" data-path="src/components/AdminDashboard.tsx">
                            <Edit className="h-4 w-4" data-id="t79vo10n3" data-path="src/components/AdminDashboard.tsx" />
                          </Button>
                          <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)} data-id="7en9f2r7m" data-path="src/components/AdminDashboard.tsx">

                            <Trash2 className="h-4 w-4" data-id="bs5gq5nwf" data-path="src/components/AdminDashboard.tsx" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rankings" data-id="pf35rwl3r" data-path="src/components/AdminDashboard.tsx">
            <div className="space-y-6" data-id="q83eol5u9" data-path="src/components/AdminDashboard.tsx">
              <div className="flex justify-between items-center" data-id="imitfhy9c" data-path="src/components/AdminDashboard.tsx">
                <h2 className="text-2xl font-bold" data-id="safeghi56" data-path="src/components/AdminDashboard.tsx">Student Rankings</h2>
                <div className="flex items-center space-x-2" data-id="sxpled1w8" data-path="src/components/AdminDashboard.tsx">
                  <span className="text-sm font-medium text-gray-700" data-id="220kss66z" data-path="src/components/AdminDashboard.tsx">Filter by exam:</span>
                  <Select value={selectedExamForRankings} onValueChange={setSelectedExamForRankings} data-id="e5pkzmp0q" data-path="src/components/AdminDashboard.tsx">
                    <SelectTrigger className="w-48" data-id="bsii63llo" data-path="src/components/AdminDashboard.tsx">
                      <SelectValue placeholder="All Exams" data-id="aouift03w" data-path="src/components/AdminDashboard.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="b3s1mqs9v" data-path="src/components/AdminDashboard.tsx">
                      <SelectItem value="all" data-id="cignq2zy4" data-path="src/components/AdminDashboard.tsx">All Exams</SelectItem>
                      {exams.filter((exam) => exam.isPublished).map((exam) =>
                      <SelectItem key={exam.id} value={exam.id} data-id="5sezp412j" data-path="src/components/AdminDashboard.tsx">{exam.name}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4" data-id="wlt3pfdyx" data-path="src/components/AdminDashboard.tsx">
                {filteredRankings.map((ranking) =>
                <Card key={ranking.id} data-id="ls8netz14" data-path="src/components/AdminDashboard.tsx">
                    <CardContent className="pt-6" data-id="0j40u2n51" data-path="src/components/AdminDashboard.tsx">
                      <div className="flex justify-between items-center" data-id="3mw38802l" data-path="src/components/AdminDashboard.tsx">
                        <div className="flex items-center gap-4" data-id="l1cgqvnv9" data-path="src/components/AdminDashboard.tsx">
                          <div className="text-2xl font-bold" data-id="a9aecqcuk" data-path="src/components/AdminDashboard.tsx">
                            {getRankBadge(ranking.rank)}
                          </div>
                          <div data-id="ckvow31io" data-path="src/components/AdminDashboard.tsx">
                            <p className="font-medium" data-id="omu82fib8" data-path="src/components/AdminDashboard.tsx">{ranking.userName}</p>
                            <p className="text-sm text-gray-600" data-id="sc7rxfg5w" data-path="src/components/AdminDashboard.tsx">{ranking.examName}</p>
                          </div>
                        </div>
                        <div className="text-right" data-id="1792ib65q" data-path="src/components/AdminDashboard.tsx">
                          <p className="text-lg font-bold text-blue-600" data-id="er7vmp066" data-path="src/components/AdminDashboard.tsx">{ranking.score} points</p>
                          <p className="text-sm text-gray-600" data-id="b8mlhqu0j" data-path="src/components/AdminDashboard.tsx">{ranking.percentage}% ({ranking.score}/{ranking.totalQuestions * 10})</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>);

};

export default AdminDashboard;