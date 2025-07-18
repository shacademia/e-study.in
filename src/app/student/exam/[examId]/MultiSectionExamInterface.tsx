'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import BreakTimer from '../BreakTimer';
// import { Progress } from '@/components/ui/progress';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Lock,
  Bookmark,
  Coffee,
  Play,
  Navigation,
  CheckCircle,
  Circle,
  AlertTriangle,
  BookOpen,
  // AlertCircle,
  // Pause,
  // Timer,
  // Users,
  // BarChart3,
  // FileText,
  Target } from
'lucide-react';
import { useAuth } from '../../../../hooks/useMockAuth';
import { mockDataService, Exam, ExamSection, Question, QuestionStatus } from '../../../../services/mockData';
import { toast } from '@/hooks/use-toast';

const MultiSectionExamInterface: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionStatuses, setQuestionStatuses] = useState<
    Record<string, QuestionStatus>
  >({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [password, setPassword] = useState("");
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
              status: "not-answered",
              timeSpent: 0,
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
        console.error("Error loading exam:", error);
        toast({
          title: "Error",
          description: "Failed to load exam",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  // Define getCurrentQuestion with useCallback early
  const getCurrentQuestion = useCallback((): Question | null => {
    if (!exam || !exam.sections || exam.sections.length === 0) {
      return exam?.questions?.[currentQuestionIndex] || null;
    }

    const currentSection = exam.sections[currentSectionIndex];
    return currentSection?.questions?.[currentQuestionIndex] || null;
  }, [exam, currentSectionIndex, currentQuestionIndex]);

  // Define updateQuestionTimeSpent with useCallback
  const updateQuestionTimeSpent = useCallback(() => {
    if (!questionStartTime) return;

    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      const timeSpent = Math.floor(
        (new Date().getTime() - questionStartTime.getTime()) / 1000
      );
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          timeSpent: (prev[currentQuestion.id]?.timeSpent || 0) + timeSpent,
        },
      }));
    }
  }, [questionStartTime, getCurrentQuestion]);

  // Now define handleSubmitExam, after updateQuestionTimeSpent is ready
  const handleSubmitExam = useCallback(async () => {
    if (!exam || !user) return;

    updateQuestionTimeSpent();

    try {
      let score = 0;
      exam.questions.forEach((question) => {
        if (answers[question.id] === question.correctOption) {
          score += 1;
        }
      });

      const totalTimeSpent = startTime
        ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        : 0;

      await mockDataService.createSubmission({
        userId: user.id,
        examId: exam.id,
        answers,
        questionStatuses,
        score,
        totalQuestions: exam.questions.length,
        timeSpent: totalTimeSpent,
        isSubmitted: true,
      });

      toast({ title: "Success", description: "Exam submitted successfully" });
      router.push(`/results/${exam.id}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast({
        title: "Error",
        description: "Failed to submit exam",
        variant: "destructive",
      });
    }
  }, [
    exam,
    user,
    answers,
    questionStatuses,
    startTime,
    router,
    updateQuestionTimeSpent,
  ]);
  
  const getCurrentSection = useCallback((): ExamSection | null => {
    if (!exam || !exam.sections || exam.sections.length === 0) return null;
    return exam.sections[currentSectionIndex] || null;
  }, [exam, currentSectionIndex]);

  // Timer effect - now safe
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
  }, [examStarted, timeLeft, isOnBreak, handleSubmitExam]);

  // Track question time start
  useEffect(() => {
    if (examStarted && !isOnBreak && exam) {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        setQuestionStartTime(new Date());
      }
    }
  }, [
    currentSectionIndex,
    currentQuestionIndex,
    examStarted,
    isOnBreak,
    exam,
    getCurrentQuestion,
  ]);

  const handlePasswordSubmit = () => {
    if (!exam) return;

    if (password === exam.password) {
      setShowPasswordModal(false);
      setExamStarted(true);
      setStartTime(new Date());
      setQuestionStartTime(new Date());
      setPassword("");
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));

    setQuestionStatuses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        status: "answered",
        answer: answerIndex,
      },
    }));
  };

  const handleMarkForReview = (questionId: string) => {
    setQuestionStatuses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        status: "marked-for-review",
      },
    }));

    toast({
      title: "Marked for Review",
      description: "Question marked for later review",
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
      title: "Break Ended",
      description: "Exam resumed successfully",
    });
  };

  const handleSectionChange = (sectionIndex: number) => {
    updateQuestionTimeSpent();
    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(0);
  };

  const handleQuestionNavigation = (questionIndex: number) => {
    updateQuestionTimeSpent();
    setCurrentQuestionIndex(questionIndex);
  };

  const handleNextQuestion = () => {
    const currentSection = getCurrentSection();
    if (
      currentSection &&
      currentQuestionIndex < currentSection.questions.length - 1
    ) {
      handleQuestionNavigation(currentQuestionIndex + 1);
    } else if (
      exam?.sections &&
      currentSectionIndex < exam.sections.length - 1
    ) {
      handleSectionChange(currentSectionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      handleQuestionNavigation(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = exam?.sections?.[currentSectionIndex - 1];
      if (prevSection) {
        setCurrentSectionIndex(currentSectionIndex - 1);
        setCurrentQuestionIndex(prevSection.questions.length - 1);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 300)
      return "text-red-600 bg-red-50 border-red-200 animate-pulse"; // 5 minutes
    if (timeLeft <= 600)
      return "text-yellow-600 bg-yellow-50 border-yellow-200"; // 10 minutes
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getQuestionStatusColor = (questionId: string) => {
    const status = questionStatuses[questionId]?.status;
    switch (status) {
      case "answered":
        return "bg-green-100 text-green-800 border-green-300";
      case "marked-for-review":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getQuestionStatusIcon = (questionId: string) => {
    const status = questionStatuses[questionId]?.status;
    switch (status) {
      case "answered":
        return (
          <CheckCircle
            className="h-3 w-3"
            data-id="osr35zdc6"
            data-path="src/components/MultiSectionExamInterface.tsx"
          />
        );
      case "marked-for-review":
        return (
          <AlertTriangle
            className="h-3 w-3"
            data-id="ikopjfx10"
            data-path="src/components/MultiSectionExamInterface.tsx"
          />
        );
      default:
        return (
          <Circle
            className="h-3 w-3"
            data-id="o600tuscb"
            data-path="src/components/MultiSectionExamInterface.tsx"
          />
        );
    }
  };

  const getAnsweredCount = () => {
    return Object.values(questionStatuses).filter(
      (status) => status.status === "answered"
    ).length;
  };

  const getMarkedForReviewCount = () => {
    return Object.values(questionStatuses).filter(
      (status) => status.status === "marked-for-review"
    ).length;
  };

  const getSectionProgress = (section: ExamSection) => {
    const sectionQuestions = section.questions.map((q) => q.id);
    const answered = sectionQuestions.filter(
      (qId) => questionStatuses[qId]?.status === "answered"
    ).length;
    return (answered / sectionQuestions.length) * 100;
  };

  const isLastQuestion = () => {
    if (!exam) return false;

    if (exam.sections && exam.sections.length > 0) {
      const isLastSection = currentSectionIndex === exam.sections.length - 1;
      const currentSection = exam.sections[currentSectionIndex];
      const isLastQuestionInSection =
        currentQuestionIndex === currentSection.questions.length - 1;
      return isLastSection && isLastQuestionInSection;
    }

    return currentQuestionIndex === exam.questions.length - 1;
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        data-id="cbcnjxdek"
        data-path="src/components/MultiSectionExamInterface.tsx"
      >
        Loading...
      </div>
    );
  }

  if (!exam) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        data-id="wtynxb6je"
        data-path="src/components/MultiSectionExamInterface.tsx"
      >
        Exam not found
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const currentSection = getCurrentSection();
  const hasMultipleSections = exam.sections && exam.sections.length > 0;

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-id="jdd9emhpv"
      data-path="src/components/MultiSectionExamInterface.tsx"
    >
      {/* Header */}
      <header
        className="bg-white shadow-sm border-b sticky top-0 z-10"
        data-id="gnmlb6b3c"
        data-path="src/components/MultiSectionExamInterface.tsx"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-id="m4yet63sc"
          data-path="src/components/MultiSectionExamInterface.tsx"
        >
          <div
            className="flex justify-between items-center h-16"
            data-id="zhy58cjm3"
            data-path="src/components/MultiSectionExamInterface.tsx"
          >
            <div
              className="flex items-center"
              data-id="4jzsysqoz"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <h1
                className="text-xl font-bold text-gray-900"
                data-id="njgz9pohd"
                data-path="src/components/MultiSectionExamInterface.tsx"
              >
                {exam.name}
              </h1>
              {hasMultipleSections && (
                <Badge
                  variant="outline"
                  className="ml-4"
                  data-id="hdx6xb8v3"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                >
                  Section {currentSectionIndex + 1} of {exam.sections.length}
                </Badge>
              )}
            </div>
            <div
              className="flex items-center space-x-4"
              data-id="v82vp9mng"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              {examStarted && (
                <>
                  <div
                    className={`px-4 py-2 rounded-lg font-medium border-2 ${getTimeColor()}`}
                    data-id="k9hcqvkqc"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <Clock
                      className="h-5 w-5 mr-2 inline"
                      data-id="l83hgz3sl"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    />
                    ⏱️ {formatTime(timeLeft)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTakeBreak}
                    disabled={isOnBreak}
                    data-id="bo158kl3w"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <Coffee
                      className="h-4 w-4 mr-2"
                      data-id="vpuip82p8"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    />
                    Take Break
                  </Button>
                </>
              )}
              <Badge
                variant="outline"
                data-id="2woi5908q"
                data-path="src/components/MultiSectionExamInterface.tsx"
              >
                {getAnsweredCount()}/{exam.questions.length} Answered
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Password Modal */}
      <Dialog
        open={showPasswordModal}
        onOpenChange={() => {}}
        data-id="2cdsxas3z"
        data-path="src/components/MultiSectionExamInterface.tsx"
      >
        <DialogContent
          data-id="gd67p4slu"
          data-path="src/components/MultiSectionExamInterface.tsx"
        >
          <DialogHeader
            data-id="5clayvvzf"
            data-path="src/components/MultiSectionExamInterface.tsx"
          >
            <DialogTitle
              className="flex items-center"
              data-id="f6owykme2"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <Lock
                className="h-5 w-5 mr-2"
                data-id="wu1rd2f0l"
                data-path="src/components/MultiSectionExamInterface.tsx"
              />
              Enter Exam Password
            </DialogTitle>
          </DialogHeader>
          <div
            className="space-y-4"
            data-id="6h1ql66b9"
            data-path="src/components/MultiSectionExamInterface.tsx"
          >
            <div
              className="p-4 bg-yellow-50 rounded-lg"
              data-id="4mc8xb38s"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <p
                className="text-sm text-yellow-800"
                data-id="5gbzm7ikl"
                data-path="src/components/MultiSectionExamInterface.tsx"
              >
                This exam is password protected. Please enter the password to
                continue.
              </p>
            </div>
            <div
              data-id="5g5o5karr"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <Label
                htmlFor="exam-password"
                data-id="ni07ymr1w"
                data-path="src/components/MultiSectionExamInterface.tsx"
              >
                Password
              </Label>
              <Input
                id="exam-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                data-id="9axkxlx4o"
                data-path="src/components/MultiSectionExamInterface.tsx"
              />
            </div>
            <Button
              onClick={handlePasswordSubmit}
              className="w-full"
              data-id="qohr1rs2m"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              Start Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Break Modal */}
      
      {/* {showBreakModal && (
        <BreakTimer
          timeRemaining={timeLeft}
          onReturnToExam={handleResumeExam}
        />
      )} */}

      <Dialog
        open={showBreakModal}
        onOpenChange={() => {}}
        data-id="8aiswuxat"
        data-path="src/components/MultiSectionExamInterface.tsx"
      >
        <DialogContent
          data-id="6ts7eub41"
          data-path="src/components/MultiSectionExamInterface.tsx"
        >
          <DialogHeader
            data-id="8ulxreuoi"
            data-path="src/components/MultiSectionExamInterface.tsx"
          >
            <DialogTitle
              className="flex items-center"
              data-id="oack6rg58"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <Coffee
                className="h-5 w-5 mr-2"
                data-id="f5wcr0tnt"
                data-path="src/components/MultiSectionExamInterface.tsx"
              />
              Break Time
            </DialogTitle>
          </DialogHeader>
          <div
            className="space-y-4"
            data-id="q63yt26u9"
            data-path="src/components/MultiSectionExamInterface.tsx"
          >
            <div
              className="p-4 bg-blue-50 rounded-lg"
              data-id="juulsf1ry"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <p
                className="text-sm text-blue-800"
                data-id="t6yqmb33i"
                data-path="src/components/MultiSectionExamInterface.tsx"
              >
                You&apos;re on a break. The timer continues in the background.
                Click &quot;Resume&quot; when you&apos;re ready to continue.
              </p>
            </div>
            <div
              className="text-center"
              data-id="6qv5hl7i3"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg font-medium border-2 ${getTimeColor()}`}
                data-id="4d44uwzq7"
                data-path="src/components/MultiSectionExamInterface.tsx"
              >
                <Clock
                  className="h-5 w-5 mr-2 inline"
                  data-id="iovfp5dq3"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                />
                Time Remaining: {formatTime(timeLeft)}
              </div>
            </div>
            <Button
              onClick={handleResumeExam}
              className="w-full"
              data-id="68ftev4kg"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <Play
                className="h-4 w-4 mr-2"
                data-id="3z8xj4f2x"
                data-path="src/components/MultiSectionExamInterface.tsx"
              />
              Resume Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        data-id="g0e2ktgvn"
        data-path="src/components/MultiSectionExamInterface.tsx"
      >
        <AlertDialogContent
          data-id="y5dty7j8c"
          data-path="src/components/MultiSectionExamInterface.tsx"
        >
          <AlertDialogHeader
            data-id="8z6hy6sdm"
            data-path="src/components/MultiSectionExamInterface.tsx"
          >
            <AlertDialogTitle
              data-id="vkvmud7n8"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              Submit Exam?
            </AlertDialogTitle>
            <AlertDialogDescription
              data-id="g0l35c3ab"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              Are you sure you want to submit your exam?
              <br
                data-id="cqg5vxw6n"
                data-path="src/components/MultiSectionExamInterface.tsx"
              />
              • Answered: {getAnsweredCount()}/{exam.questions.length} questions
              <br
                data-id="jlevnbm34"
                data-path="src/components/MultiSectionExamInterface.tsx"
              />
              • Marked for review: {getMarkedForReviewCount()} questions
              <br
                data-id="p6ktncluv"
                data-path="src/components/MultiSectionExamInterface.tsx"
              />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter
            data-id="nkin870u9"
            data-path="src/components/MultiSectionExamInterface.tsx"
          >
            <AlertDialogCancel
              data-id="99f61dcsu"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitExam}
              data-id="1hh75ku7k"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {examStarted && (
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          data-id="wq2d51o5u"
          data-path="src/components/MultiSectionExamInterface.tsx"
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            data-id="g8a1yymfy"
            data-path="src/components/MultiSectionExamInterface.tsx"
          >
            {/* Question Content */}
            <div
              className="lg:col-span-3"
              data-id="agyf660c6"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              {/* Section Navigation for Multi-Section Exams */}
              {hasMultipleSections && (
                <Card
                  className="mb-6"
                  data-id="e65ayzyxj"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                >
                  <CardHeader
                    data-id="wqzygi1x9"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <CardTitle
                      className="flex items-center"
                      data-id="rb6hlq47a"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <BookOpen
                        className="h-5 w-5 mr-2"
                        data-id="nzzytysb1"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      />
                      Section Navigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent
                    data-id="1sk1ucrl0"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <Tabs
                      value={currentSectionIndex.toString()}
                      onValueChange={(value) =>
                        handleSectionChange(parseInt(value))
                      }
                      data-id="oeju7n7ih"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <TabsList
                        className="grid w-full grid-cols-4"
                        data-id="jx2bl6vmn"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        {exam.sections.map((section, index) => (
                          <TabsTrigger
                            key={section.id}
                            value={index.toString()}
                            className="relative"
                            data-id="11pcqsfs4"
                            data-path="src/components/MultiSectionExamInterface.tsx"
                          >
                            <div
                              className="flex flex-col items-center"
                              data-id="kbxw4bo5h"
                              data-path="src/components/MultiSectionExamInterface.tsx"
                            >
                              <span
                                className="text-sm font-medium"
                                data-id="q98ybyna8"
                                data-path="src/components/MultiSectionExamInterface.tsx"
                              >
                                {section.name}
                              </span>
                              <div
                                className="w-full bg-gray-200 rounded-full h-1 mt-1"
                                data-id="2b190pltr"
                                data-path="src/components/MultiSectionExamInterface.tsx"
                              >
                                <div
                                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${getSectionProgress(section)}%`,
                                  }}
                                  data-id="havxut9ae"
                                  data-path="src/components/MultiSectionExamInterface.tsx"
                                ></div>
                              </div>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Current Section Info */}
              {currentSection && (
                <Card
                  className="mb-6"
                  data-id="vggfoo0ae"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                >
                  <CardHeader
                    data-id="8qigupz66"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <CardTitle
                      className="flex items-center justify-between"
                      data-id="mspziwoux"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <div
                        className="flex items-center"
                        data-id="rskl8ft43"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        <Target
                          className="h-5 w-5 mr-2"
                          data-id="6xbsx0pr4"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        />
                        {currentSection.name}
                      </div>
                      <div
                        className="flex items-center space-x-4"
                        data-id="skxlgxykk"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        <Badge
                          variant="outline"
                          data-id="95mwduh5o"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          {currentSection.timeLimit} min
                        </Badge>
                        <Badge
                          variant="outline"
                          data-id="veawnuu22"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          {currentSection.marks} marks
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription
                      data-id="sy27h4ruo"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      {currentSection.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {/* Question Card */}
              {currentQuestion && (
                <Card
                  data-id="jk2fh435i"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                >
                  <CardHeader
                    data-id="sfh8k3drh"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <div
                      className="flex justify-between items-start"
                      data-id="mdpubb5yg"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <div
                        data-id="ydqaya1o4"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        <CardTitle
                          className="flex items-center"
                          data-id="67t404849"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          Question {currentQuestionIndex + 1} of{" "}
                          {currentSection
                            ? currentSection.questions.length
                            : exam.questions.length}
                          {hasMultipleSections && (
                            <Badge
                              variant="outline"
                              className="ml-2"
                              data-id="m41humnas"
                              data-path="src/components/MultiSectionExamInterface.tsx"
                            >
                              {currentSection?.name}
                            </Badge>
                          )}
                          {questionStatuses[currentQuestion.id]?.status ===
                            "marked-for-review" && (
                            <Bookmark
                              className="h-4 w-4 ml-2 text-yellow-600"
                              data-id="4cquuvh29"
                              data-path="src/components/MultiSectionExamInterface.tsx"
                            />
                          )}
                        </CardTitle>
                        <CardDescription
                          data-id="2ogtishpq"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          Choose the correct answer from the options below
                        </CardDescription>
                      </div>
                      <div
                        className="flex items-center space-x-2"
                        data-id="q6mjt2bxn"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        <Badge
                          variant="outline"
                          data-id="90pftcb58"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          {currentQuestion.difficulty}
                        </Badge>
                        <Badge
                          variant="outline"
                          data-id="c0thsuhsi"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          {currentQuestion.subject}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    data-id="6snqgcwf2"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <div
                      className="space-y-6"
                      data-id="ojh3rcp87"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <div
                        className="text-lg font-medium"
                        data-id="jjpen68vk"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        {currentQuestion.content}
                      </div>

                      <RadioGroup
                        value={answers[currentQuestion.id]?.toString()}
                        onValueChange={(value) =>
                          handleAnswerChange(
                            currentQuestion.id,
                            parseInt(value)
                          )
                        }
                        data-id="vngqxx6s6"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                            data-id="uoi6toeai"
                            data-path="src/components/MultiSectionExamInterface.tsx"
                          >
                            <RadioGroupItem
                              value={index.toString()}
                              id={`option-${index}`}
                              data-id="ab9jz89lr"
                              data-path="src/components/MultiSectionExamInterface.tsx"
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer"
                              data-id="2fp6hstyh"
                              data-path="src/components/MultiSectionExamInterface.tsx"
                            >
                              <span
                                className="font-medium"
                                data-id="akaj3kok7"
                                data-path="src/components/MultiSectionExamInterface.tsx"
                              >
                                {String.fromCharCode(65 + index)}.
                              </span>{" "}
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation and Actions */}
              <div
                className="flex justify-between items-center mt-6"
                data-id="gt0q7lhsj"
                data-path="src/components/MultiSectionExamInterface.tsx"
              >
                <div
                  className="flex space-x-2"
                  data-id="i14l719uz"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                >
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={
                      currentSectionIndex === 0 && currentQuestionIndex === 0
                    }
                    data-id="s2pxmwn2j"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <ChevronLeft
                      className="h-4 w-4 mr-2"
                      data-id="10itu532q"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      currentQuestion && handleMarkForReview(currentQuestion.id)
                    }
                    data-id="o9egk6cuz"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <Bookmark
                      className="h-4 w-4 mr-2"
                      data-id="cn1xcqqds"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    />
                    Mark for Review
                  </Button>
                </div>

                <div
                  className="flex space-x-2"
                  data-id="ox1r3f0g7"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                >
                  {isLastQuestion() ? (
                    <Button
                      onClick={() => setShowSubmitDialog(true)}
                      data-id="3g7yd55ce"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <Flag
                        className="h-4 w-4 mr-2"
                        data-id="n4mthtxdl"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      />
                      Submit Exam
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      data-id="absdg0un5"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      Next
                      <ChevronRight
                        className="h-4 w-4 ml-2"
                        data-id="s4w605gj7"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Navigation Panel */}
            <div
              className="lg:col-span-1"
              data-id="l7wcmpecx"
              data-path="src/components/MultiSectionExamInterface.tsx"
            >
              <Card
                className="sticky top-24"
                data-id="oyyh0of5s"
                data-path="src/components/MultiSectionExamInterface.tsx"
              >
                <CardHeader
                  data-id="duofl5cy5"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                >
                  <CardTitle
                    className="text-sm flex items-center"
                    data-id="4fu8eh7n1"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <Navigation
                      className="h-4 w-4 mr-2"
                      data-id="syy8nfwh3"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    />
                    Question Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent
                  data-id="2zx6wmmz3"
                  data-path="src/components/MultiSectionExamInterface.tsx"
                >
                  {/* Section-wise Question Navigation */}
                  {hasMultipleSections ? (
                    <div
                      className="space-y-4"
                      data-id="jg8c0eyok"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      {exam.sections.map((section, sectionIdx) => (
                        <div
                          key={section.id}
                          className="space-y-2"
                          data-id="0ofiu08iw"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          <div
                            className="flex items-center justify-between"
                            data-id="jle1hr70n"
                            data-path="src/components/MultiSectionExamInterface.tsx"
                          >
                            <Label
                              className="text-xs font-medium"
                              data-id="cjq1v54wx"
                              data-path="src/components/MultiSectionExamInterface.tsx"
                            >
                              {section.name}
                            </Label>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              data-id="vxr79ookv"
                              data-path="src/components/MultiSectionExamInterface.tsx"
                            >
                              {
                                section.questions.filter(
                                  (q) =>
                                    questionStatuses[q.id]?.status ===
                                    "answered"
                                ).length
                              }
                              /{section.questions.length}
                            </Badge>
                          </div>
                          <div
                            className="grid grid-cols-5 gap-1"
                            data-id="6089dqnst"
                            data-path="src/components/MultiSectionExamInterface.tsx"
                          >
                            {section.questions.map((question, qIdx) => (
                              <Button
                                key={question.id}
                                variant={
                                  sectionIdx === currentSectionIndex &&
                                  qIdx === currentQuestionIndex
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className={`h-8 w-8 p-0 text-xs ${getQuestionStatusColor(
                                  question.id
                                )}`}
                                onClick={() => {
                                  handleSectionChange(sectionIdx);
                                  handleQuestionNavigation(qIdx);
                                }}
                                data-id="95m9ip84g"
                                data-path="src/components/MultiSectionExamInterface.tsx"
                              >
                                <div
                                  className="flex flex-col items-center"
                                  data-id="lecuffrok"
                                  data-path="src/components/MultiSectionExamInterface.tsx"
                                >
                                  {getQuestionStatusIcon(question.id)}
                                  <span
                                    className="text-xs"
                                    data-id="uhcg0zw2i"
                                    data-path="src/components/MultiSectionExamInterface.tsx"
                                  >
                                    {qIdx + 1}
                                  </span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="grid grid-cols-5 gap-2 mb-4"
                      data-id="mj8zsw5po"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      {exam.questions.map((question, index) => (
                        <Button
                          key={question.id}
                          variant={
                            index === currentQuestionIndex
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={`h-10 w-10 p-0 text-xs ${getQuestionStatusColor(
                            question.id
                          )}`}
                          onClick={() => handleQuestionNavigation(index)}
                          data-id="yfkru1frk"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          <div
                            className="flex flex-col items-center"
                            data-id="b0d6stugb"
                            data-path="src/components/MultiSectionExamInterface.tsx"
                          >
                            {getQuestionStatusIcon(question.id)}
                            <span
                              className="text-xs mt-1"
                              data-id="y86v6ozys"
                              data-path="src/components/MultiSectionExamInterface.tsx"
                            >
                              {index + 1}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}

                  <div
                    className="space-y-3 text-xs mt-4"
                    data-id="zfcno84k8"
                    data-path="src/components/MultiSectionExamInterface.tsx"
                  >
                    <div
                      className="flex items-center justify-between"
                      data-id="ctehidf37"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <div
                        className="flex items-center"
                        data-id="qwlnuv54c"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        <div
                          className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"
                          data-id="igztx8di8"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        ></div>
                        <span
                          data-id="5xwnowbxi"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          Answered
                        </span>
                      </div>
                      <span
                        className="font-medium"
                        data-id="2edfsqd16"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        ✅ {getAnsweredCount()}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between"
                      data-id="6cq9k37hp"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <div
                        className="flex items-center"
                        data-id="l8ekhh9j8"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        <div
                          className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"
                          data-id="f040nrg2n"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        ></div>
                        <span
                          data-id="qn4h130xw"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          Marked for Review
                        </span>
                      </div>
                      <span
                        className="font-medium"
                        data-id="ua5ib3900"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        📋 {getMarkedForReviewCount()}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between"
                      data-id="3p0fbc6kn"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <div
                        className="flex items-center"
                        data-id="rxslensoc"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        <div
                          className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"
                          data-id="y4d3rqv6f"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        ></div>
                        <span
                          data-id="z4bygyaoi"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          Not Answered
                        </span>
                      </div>
                      <span
                        className="font-medium"
                        data-id="ofnyd1hxz"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        ⚪ {exam.questions.length - getAnsweredCount()}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between"
                      data-id="h7k0ux6xu"
                      data-path="src/components/MultiSectionExamInterface.tsx"
                    >
                      <div
                        className="flex items-center"
                        data-id="8mdx31id0"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        <div
                          className="w-3 h-3 bg-blue-600 rounded mr-2"
                          data-id="6q733vzgs"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        ></div>
                        <span
                          data-id="k50opck8y"
                          data-path="src/components/MultiSectionExamInterface.tsx"
                        >
                          Current
                        </span>
                      </div>
                      <span
                        className="font-medium"
                        data-id="j2kytsxvz"
                        data-path="src/components/MultiSectionExamInterface.tsx"
                      >
                        #{currentQuestionIndex + 1}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSectionExamInterface;