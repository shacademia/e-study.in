import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Lock,
  AlertCircle,
  Bookmark,
  Coffee,
  Play,
  Pause,
  Navigation,
  CheckCircle,
  Circle,
  AlertTriangle } from
'lucide-react';
import { useAuth } from '../hooks/useMockAuth';
import { mockDataService, Exam, QuestionStatus } from '../services/mockData';
import { toast } from '@/hooks/use-toast';

const ExamInterface: React.FC = () => {
  const { examId } = useParams<{examId: string;}>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) return;

      try {
        const examData = await mockDataService.getExam(examId);
        if (examData) {
          setExam(examData);
          setTimeLeft(examData.timeLimit * 60); // Convert minutes to seconds

          // Initialize question statuses
          const initialStatuses: Record<string, QuestionStatus> = {};
          examData.questions.forEach((q) => {
            initialStatuses[q.id] = {
              questionId: q.id,
              status: 'not-answered',
              timeSpent: 0
            };
          });
          setQuestionStatuses(initialStatuses);

          // Check if exam is password protected
          if (examData.isPasswordProtected) {
            setShowPasswordModal(true);
          } else {
            setExamStarted(true);
            setStartTime(new Date());
            setQuestionStartTime(new Date());
          }
        }
      } catch (error) {
        console.error('Error loading exam:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exam',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  useEffect(() => {
    if (examStarted && timeLeft > 0 && !isOnBreak) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft, isOnBreak]);

  // Track time spent on current question
  useEffect(() => {
    if (examStarted && !isOnBreak && exam) {
      const currentQuestionId = exam.questions[currentQuestionIndex]?.id;
      if (currentQuestionId) {
        setQuestionStartTime(new Date());
      }
    }
  }, [currentQuestionIndex, examStarted, isOnBreak, exam]);

  const handlePasswordSubmit = () => {
    if (!exam) return;

    if (password === exam.password) {
      setShowPasswordModal(false);
      setExamStarted(true);
      setStartTime(new Date());
      setQuestionStartTime(new Date());
      setPassword('');
    } else {
      toast({
        title: 'Error',
        description: 'Incorrect password',
        variant: 'destructive'
      });
    }
  };

  const updateQuestionTimeSpent = () => {
    if (!exam || !questionStartTime) return;

    const currentQuestionId = exam.questions[currentQuestionIndex]?.id;
    if (currentQuestionId) {
      const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionId]: {
          ...prev[currentQuestionId],
          timeSpent: prev[currentQuestionId].timeSpent + timeSpent
        }
      }));
    }
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex
    }));

    setQuestionStatuses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        status: 'answered',
        answer: answerIndex
      }
    }));
  };

  const handleMarkForReview = (questionId: string) => {
    setQuestionStatuses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        status: 'marked-for-review'
      }
    }));

    toast({
      title: 'Marked for Review',
      description: 'Question marked for later review'
    });
  };

  const handleTakeBreak = () => {
    updateQuestionTimeSpent();
    setIsOnBreak(true);
    setShowBreakModal(true);
  };

  const handleResumeExam = () => {
    setIsOnBreak(false);
    setShowBreakModal(false);
    setQuestionStartTime(new Date());
    toast({
      title: 'Break Ended',
      description: 'Exam resumed successfully'
    });
  };

  const handleQuestionNavigation = (index: number) => {
    updateQuestionTimeSpent();
    setCurrentQuestionIndex(index);
  };

  const handleSubmitExam = async () => {
    if (!exam || !user) return;

    updateQuestionTimeSpent();

    try {
      // Calculate score
      let score = 0;
      exam.questions.forEach((question) => {
        if (answers[question.id] === question.correctOption) {
          score += 10; // Each correct answer = 10 points
        }
      });

      const totalTimeSpent = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0;

      await mockDataService.createSubmission({
        userId: user.id,
        examId: exam.id,
        answers,
        questionStatuses,
        score,
        totalQuestions: exam.questions.length,
        timeSpent: totalTimeSpent,
        isSubmitted: true
      });

      toast({
        title: 'Success',
        description: 'Exam submitted successfully'
      });

      navigate(`/results/${exam.id}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit exam',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 300) return 'text-red-600 bg-red-50 border-red-200 animate-pulse'; // 5 minutes
    if (timeLeft <= 600) return 'text-yellow-600 bg-yellow-50 border-yellow-200'; // 10 minutes
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getQuestionStatusColor = (questionId: string) => {
    const status = questionStatuses[questionId]?.status;
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'marked-for-review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getQuestionStatusIcon = (questionId: string) => {
    const status = questionStatuses[questionId]?.status;
    switch (status) {
      case 'answered':
        return <CheckCircle className="h-3 w-3" data-id="ivqylodga" data-path="src/components/ExamInterface.tsx" />;
      case 'marked-for-review':
        return <AlertTriangle className="h-3 w-3" data-id="drqezbor5" data-path="src/components/ExamInterface.tsx" />;
      default:
        return <Circle className="h-3 w-3" data-id="7nyeja6pf" data-path="src/components/ExamInterface.tsx" />;
    }
  };

  const getAnsweredCount = () => {
    return Object.values(questionStatuses).filter((status) => status.status === 'answered').length;
  };

  const getMarkedForReviewCount = () => {
    return Object.values(questionStatuses).filter((status) => status.status === 'marked-for-review').length;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen" data-id="hirvnl6mk" data-path="src/components/ExamInterface.tsx">Loading...</div>;
  }

  if (!exam) {
    return <div className="flex items-center justify-center min-h-screen" data-id="6dbywhowr" data-path="src/components/ExamInterface.tsx">Exam not found</div>;
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50" data-id="bt8x75axe" data-path="src/components/ExamInterface.tsx">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10" data-id="5itz3y1r8" data-path="src/components/ExamInterface.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="73ctbdzol" data-path="src/components/ExamInterface.tsx">
          <div className="flex justify-between items-center h-16" data-id="v58y481yk" data-path="src/components/ExamInterface.tsx">
            <div className="flex items-center" data-id="3gtf1ists" data-path="src/components/ExamInterface.tsx">
              <h1 className="text-xl font-bold text-gray-900" data-id="m9avyhnum" data-path="src/components/ExamInterface.tsx">{exam.name}</h1>
            </div>
            <div className="flex items-center space-x-4" data-id="uhu97uq2v" data-path="src/components/ExamInterface.tsx">
              {examStarted &&
              <>
                  <div className={`px-4 py-2 rounded-lg font-medium border-2 ${getTimeColor()}`} data-id="w52l1uk3s" data-path="src/components/ExamInterface.tsx">
                    <Clock className="h-5 w-5 mr-2 inline" data-id="x9bfbdgy0" data-path="src/components/ExamInterface.tsx" />
                    ⏱️ {formatTime(timeLeft)}
                  </div>
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTakeBreak}
                  disabled={isOnBreak} data-id="9jpd28bd7" data-path="src/components/ExamInterface.tsx">

                    <Coffee className="h-4 w-4 mr-2" data-id="r1sgi5dv0" data-path="src/components/ExamInterface.tsx" />
                    Take Break
                  </Button>
                </>
              }
              <Badge variant="outline" data-id="4v3f9mk13" data-path="src/components/ExamInterface.tsx">
                {getAnsweredCount()}/{exam.questions.length} Answered
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={() => {}} data-id="iq1s5pe5z" data-path="src/components/ExamInterface.tsx">
        <DialogContent data-id="346q4ijkt" data-path="src/components/ExamInterface.tsx">
          <DialogHeader data-id="5z73aynrn" data-path="src/components/ExamInterface.tsx">
            <DialogTitle className="flex items-center" data-id="5vkj2p6bw" data-path="src/components/ExamInterface.tsx">
              <Lock className="h-5 w-5 mr-2" data-id="q1mb39x8w" data-path="src/components/ExamInterface.tsx" />
              Enter Exam Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4" data-id="9ob7avkhi" data-path="src/components/ExamInterface.tsx">
            <div className="p-4 bg-yellow-50 rounded-lg" data-id="m3ejqnoar" data-path="src/components/ExamInterface.tsx">
              <p className="text-sm text-yellow-800" data-id="d6vpg720h" data-path="src/components/ExamInterface.tsx">
                This exam is password protected. Please enter the password to continue.
              </p>
            </div>
            <div data-id="gqkpjmbkb" data-path="src/components/ExamInterface.tsx">
              <Label htmlFor="exam-password" data-id="3ahpng49x" data-path="src/components/ExamInterface.tsx">Password</Label>
              <Input
                id="exam-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()} data-id="d9iw25u4u" data-path="src/components/ExamInterface.tsx" />

            </div>
            <Button onClick={handlePasswordSubmit} className="w-full" data-id="j8x60igtt" data-path="src/components/ExamInterface.tsx">
              Start Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Break Modal */}
      <Dialog open={showBreakModal} onOpenChange={() => {}} data-id="xuyc7jdiq" data-path="src/components/ExamInterface.tsx">
        <DialogContent data-id="j2amz6jcl" data-path="src/components/ExamInterface.tsx">
          <DialogHeader data-id="eiuf9q1vm" data-path="src/components/ExamInterface.tsx">
            <DialogTitle className="flex items-center" data-id="h1fckzmxy" data-path="src/components/ExamInterface.tsx">
              <Coffee className="h-5 w-5 mr-2" data-id="scaxz4vte" data-path="src/components/ExamInterface.tsx" />
              Break Time
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4" data-id="k8v4g94sf" data-path="src/components/ExamInterface.tsx">
            <div className="p-4 bg-blue-50 rounded-lg" data-id="n2f6fefv3" data-path="src/components/ExamInterface.tsx">
              <p className="text-sm text-blue-800" data-id="gg23wiciu" data-path="src/components/ExamInterface.tsx">
                You're on a break. The timer continues in the background. Click "Resume" when you're ready to continue.
              </p>
            </div>
            <div className="text-center" data-id="hgs5n68s3" data-path="src/components/ExamInterface.tsx">
              <div className={`inline-block px-4 py-2 rounded-lg font-medium border-2 ${getTimeColor()}`} data-id="z00x03drl" data-path="src/components/ExamInterface.tsx">
                <Clock className="h-5 w-5 mr-2 inline" data-id="ei03ejmcr" data-path="src/components/ExamInterface.tsx" />
                Time Remaining: {formatTime(timeLeft)}
              </div>
            </div>
            <Button onClick={handleResumeExam} className="w-full" data-id="npdzv6805" data-path="src/components/ExamInterface.tsx">
              <Play className="h-4 w-4 mr-2" data-id="ewmkqd7zs" data-path="src/components/ExamInterface.tsx" />
              Resume Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog} data-id="towm2aw91" data-path="src/components/ExamInterface.tsx">
        <AlertDialogContent data-id="uq23pvyjo" data-path="src/components/ExamInterface.tsx">
          <AlertDialogHeader data-id="6nksh8k0d" data-path="src/components/ExamInterface.tsx">
            <AlertDialogTitle data-id="m8qvcv68e" data-path="src/components/ExamInterface.tsx">Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription data-id="yjcy3vvlg" data-path="src/components/ExamInterface.tsx">
              Are you sure you want to submit your exam? 
              <br data-id="ditttj043" data-path="src/components/ExamInterface.tsx" />
              • Answered: {getAnsweredCount()}/{exam.questions.length} questions
              <br data-id="w1amaodnq" data-path="src/components/ExamInterface.tsx" />
              • Marked for review: {getMarkedForReviewCount()} questions
              <br data-id="uyfpa01pz" data-path="src/components/ExamInterface.tsx" />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter data-id="47ume2p6v" data-path="src/components/ExamInterface.tsx">
            <AlertDialogCancel data-id="zaurw277b" data-path="src/components/ExamInterface.tsx">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam} data-id="egif5aaqu" data-path="src/components/ExamInterface.tsx">Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {examStarted &&
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="qvsfvg09d" data-path="src/components/ExamInterface.tsx">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" data-id="wjr18aqk7" data-path="src/components/ExamInterface.tsx">
            {/* Question Content */}
            <div className="lg:col-span-3" data-id="9zwm3xi3s" data-path="src/components/ExamInterface.tsx">
              <Card data-id="3bpvjfqdj" data-path="src/components/ExamInterface.tsx">
                <CardHeader data-id="7sx43y1tc" data-path="src/components/ExamInterface.tsx">
                  <div className="flex justify-between items-start" data-id="yk6y1e29f" data-path="src/components/ExamInterface.tsx">
                    <div data-id="1e5696yrs" data-path="src/components/ExamInterface.tsx">
                      <CardTitle className="flex items-center" data-id="fn2lz2b1s" data-path="src/components/ExamInterface.tsx">
                        Question {currentQuestionIndex + 1} of {exam.questions.length}
                        {questionStatuses[currentQuestion.id]?.status === 'marked-for-review' &&
                      <Bookmark className="h-4 w-4 ml-2 text-yellow-600" data-id="40279v9wk" data-path="src/components/ExamInterface.tsx" />
                      }
                      </CardTitle>
                      <CardDescription data-id="xkrp7rkbo" data-path="src/components/ExamInterface.tsx">
                        Choose the correct answer from the options below
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2" data-id="tiyrlet9e" data-path="src/components/ExamInterface.tsx">
                      <Badge variant="outline" data-id="ohxo9h8kw" data-path="src/components/ExamInterface.tsx">{currentQuestion.difficulty}</Badge>
                      <Badge variant="outline" data-id="kmeszluff" data-path="src/components/ExamInterface.tsx">{currentQuestion.subject}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent data-id="dhg0nzlzz" data-path="src/components/ExamInterface.tsx">
                  <div className="space-y-6" data-id="9vitzjh4f" data-path="src/components/ExamInterface.tsx">
                    <div className="text-lg font-medium" data-id="n5p9skwmi" data-path="src/components/ExamInterface.tsx">
                      {currentQuestion.content}
                    </div>
                    
                    <RadioGroup
                    value={answers[currentQuestion.id]?.toString()}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))} data-id="23rzy8oxu" data-path="src/components/ExamInterface.tsx">

                      {currentQuestion.options.map((option, index) =>
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50" data-id="6volytacr" data-path="src/components/ExamInterface.tsx">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} data-id="1qhtl8py8" data-path="src/components/ExamInterface.tsx" />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer" data-id="u76kjr5lu" data-path="src/components/ExamInterface.tsx">
                            <span className="font-medium" data-id="qv5u09til" data-path="src/components/ExamInterface.tsx">{String.fromCharCode(65 + index)}.</span> {option}
                          </Label>
                        </div>
                    )}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation and Actions */}
              <div className="flex justify-between items-center mt-6" data-id="zvl32cr33" data-path="src/components/ExamInterface.tsx">
                <div className="flex space-x-2" data-id="7h54i5rlz" data-path="src/components/ExamInterface.tsx">
                  <Button
                  variant="outline"
                  onClick={() => handleQuestionNavigation(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0} data-id="wzeb2t152" data-path="src/components/ExamInterface.tsx">

                    <ChevronLeft className="h-4 w-4 mr-2" data-id="vs09vkshk" data-path="src/components/ExamInterface.tsx" />
                    Previous
                  </Button>
                  <Button
                  variant="outline"
                  onClick={() => handleMarkForReview(currentQuestion.id)} data-id="tciyq62q5" data-path="src/components/ExamInterface.tsx">

                    <Bookmark className="h-4 w-4 mr-2" data-id="3pxglokv1" data-path="src/components/ExamInterface.tsx" />
                    Mark for Review
                  </Button>
                </div>
                
                <div className="flex space-x-2" data-id="1cgull96n" data-path="src/components/ExamInterface.tsx">
                  {currentQuestionIndex === exam.questions.length - 1 ?
                <Button onClick={() => setShowSubmitDialog(true)} data-id="xawnvjltl" data-path="src/components/ExamInterface.tsx">
                      <Flag className="h-4 w-4 mr-2" data-id="2f3638obb" data-path="src/components/ExamInterface.tsx" />
                      Submit Exam
                    </Button> :

                <Button
                  onClick={() => handleQuestionNavigation(Math.min(exam.questions.length - 1, currentQuestionIndex + 1))} data-id="3lure1u6f" data-path="src/components/ExamInterface.tsx">

                      Next
                      <ChevronRight className="h-4 w-4 ml-2" data-id="s4mxcm7xz" data-path="src/components/ExamInterface.tsx" />
                    </Button>
                }
                </div>
              </div>
            </div>

            {/* Question Navigation Panel */}
            <div className="lg:col-span-1" data-id="5avvevjc1" data-path="src/components/ExamInterface.tsx">
              <Card className="sticky top-24" data-id="gszt9b2o2" data-path="src/components/ExamInterface.tsx">
                <CardHeader data-id="myzotppt1" data-path="src/components/ExamInterface.tsx">
                  <CardTitle className="text-sm flex items-center" data-id="bvgrqmdip" data-path="src/components/ExamInterface.tsx">
                    <Navigation className="h-4 w-4 mr-2" data-id="5bm31uxko" data-path="src/components/ExamInterface.tsx" />
                    Question Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent data-id="2gblku1wr" data-path="src/components/ExamInterface.tsx">
                  <div className="grid grid-cols-5 gap-2 mb-4" data-id="fjq2u2vqr" data-path="src/components/ExamInterface.tsx">
                    {exam.questions.map((_, index) =>
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    className={`h-10 w-10 p-0 text-xs ${getQuestionStatusColor(exam.questions[index].id)}`}
                    onClick={() => handleQuestionNavigation(index)} data-id="ofq633gec" data-path="src/components/ExamInterface.tsx">

                        <div className="flex flex-col items-center" data-id="honorpw6q" data-path="src/components/ExamInterface.tsx">
                          {getQuestionStatusIcon(exam.questions[index].id)}
                          <span className="text-xs mt-1" data-id="p2d5w1r0n" data-path="src/components/ExamInterface.tsx">{index + 1}</span>
                        </div>
                      </Button>
                  )}
                  </div>
                  
                  <div className="space-y-3 text-xs" data-id="osslx8bad" data-path="src/components/ExamInterface.tsx">
                    <div className="flex items-center justify-between" data-id="gsxuy7jk1" data-path="src/components/ExamInterface.tsx">
                      <div className="flex items-center" data-id="vcb5pavbg" data-path="src/components/ExamInterface.tsx">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2" data-id="vpr4znhf6" data-path="src/components/ExamInterface.tsx"></div>
                        <span data-id="bgl4dixka" data-path="src/components/ExamInterface.tsx">Answered</span>
                      </div>
                      <span className="font-medium" data-id="7x4u3g18d" data-path="src/components/ExamInterface.tsx">✅ {getAnsweredCount()}</span>
                    </div>
                    <div className="flex items-center justify-between" data-id="b4yn4lk4s" data-path="src/components/ExamInterface.tsx">
                      <div className="flex items-center" data-id="z8f0e404u" data-path="src/components/ExamInterface.tsx">
                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2" data-id="50qaw9mtf" data-path="src/components/ExamInterface.tsx"></div>
                        <span data-id="j1y6y1xx4" data-path="src/components/ExamInterface.tsx">Marked for Review</span>
                      </div>
                      <span className="font-medium" data-id="a4sclsd9x" data-path="src/components/ExamInterface.tsx">📋 {getMarkedForReviewCount()}</span>
                    </div>
                    <div className="flex items-center justify-between" data-id="rf51xwgtu" data-path="src/components/ExamInterface.tsx">
                      <div className="flex items-center" data-id="8vdlih144" data-path="src/components/ExamInterface.tsx">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2" data-id="pu49ryc4x" data-path="src/components/ExamInterface.tsx"></div>
                        <span data-id="0blg23kqo" data-path="src/components/ExamInterface.tsx">Not Answered</span>
                      </div>
                      <span className="font-medium" data-id="txcovf34k" data-path="src/components/ExamInterface.tsx">⚪ {exam.questions.length - getAnsweredCount()}</span>
                    </div>
                    <div className="flex items-center justify-between" data-id="pr6xkvodg" data-path="src/components/ExamInterface.tsx">
                      <div className="flex items-center" data-id="7rmdspc80" data-path="src/components/ExamInterface.tsx">
                        <div className="w-3 h-3 bg-blue-600 rounded mr-2" data-id="5y879xn2i" data-path="src/components/ExamInterface.tsx"></div>
                        <span data-id="2tqoq4a84" data-path="src/components/ExamInterface.tsx">Current</span>
                      </div>
                      <span className="font-medium" data-id="addyontf6" data-path="src/components/ExamInterface.tsx">#{currentQuestionIndex + 1}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default ExamInterface;