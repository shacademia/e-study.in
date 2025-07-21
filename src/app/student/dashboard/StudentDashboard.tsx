"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Trophy, User, LogOut, Play, Lock, Award, Goal, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useApiAuth';
import { useExams, useSubmissions, useRankings } from '@/hooks/useApiServices';
import { Exam, Submission, StudentRanking } from '@/constants/types';

const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // API hooks
  const examsApi = useExams();
  const submissionsApi = useSubmissions();
  const rankingsApi = useRankings();
  
  // Local state
  const [exams, setExams] = useState<Exam[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [userRanking, setUserRanking] = useState<StudentRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id || dataLoaded) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setDataLoaded(true); // Set this early to prevent multiple calls
        
        // Load all dashboard data in parallel
        const [examResult, submissionResult, rankingResult] = await Promise.allSettled([
          examsApi.getAllExams({ page: 1, limit: 50, published: true }),
          submissionsApi.getUserSubmissions(user.id, { page: 1, limit: 50 }),
          rankingsApi.getStudentRanking({ userId: user.id })
        ]);

        // Handle exams result
        if (examResult.status === 'fulfilled') {
          console.log('Exam API Response:', examResult.value);
          const examData = examResult.value as { data: Exam[] };
          setExams(Array.isArray(examData.data) ? examData.data : []);
        } else {
          console.error('Failed to load exams:', examResult.reason);
          setExams([]);
        }

        // Handle submissions result - Note: API returns { submissions: Submission[] }
        if (submissionResult.status === 'fulfilled') {
          console.log('Submissions API Response:', submissionResult.value);
          const submissionData = submissionResult.value as { data: { submissions: Submission[] } };
          const submissions = submissionData?.data?.submissions || [];
          setUserSubmissions(Array.isArray(submissions) ? submissions : []);
        } else {
          console.error('Failed to load submissions:', submissionResult.reason);
          setUserSubmissions([]);
        }

        // Handle ranking result - Note: API returns StudentRanking directly in data
        if (rankingResult.status === 'fulfilled') {
          console.log('Ranking API Response:', rankingResult.value);
          const rankingData = rankingResult.value as { data: StudentRanking };
          setUserRanking(rankingData?.data || null);
        } else {
          console.error('Failed to load ranking:', rankingResult.reason);
          setUserRanking(null);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, dataLoaded]); // Only run when user.id changes or if data hasn't been loaded

  const handleStartExam = (examId: string) => {
    router.push(`/student/exam/${examId}`);
  };

  const handleViewResults = (examId: string) => {
    router.push(`/student/results/${examId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Calculate user statistics from submissions
  const userStats = useMemo(() => {
    // Ensure userSubmissions is an array
    const submissions = Array.isArray(userSubmissions) ? userSubmissions : [];
    
    if (submissions.length === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        highestScore: 0,
        totalExamsAttended: 0,
        totalStudents: userRanking?.totalStudents || 0
      };
    }

    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const totalQuestions = submissions.reduce((sum, sub) => sum + (sub.totalQuestions || 0), 0);
    const correctAnswers = submissions.reduce((sum, sub) => sum + (sub.statistics?.correctAnswers || 0), 0);
    const highestScore = Math.max(...submissions.map(sub => sub.score || 0));

    return {
      totalExams: submissions.length,
      totalExamsAttended: submissions.length,
      averageScore: submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0,
      totalQuestions,
      correctAnswers,
      highestScore,
      totalStudents: userRanking?.totalStudents || 0,
      recentSubmissions: submissions.slice(0, 3) // Add recent submissions for compatibility
    };
  }, [userSubmissions, userRanking]);
  
  // Filter exams based on completed submissions
  const completedExamIds = useMemo(() => {
    const submissions = Array.isArray(userSubmissions) ? userSubmissions : [];
    return submissions.map(sub => sub.examId) || [];
  }, [userSubmissions]);

  const availableExams = useMemo(
    () => exams.filter((exam) => !completedExamIds.includes(exam.id)),
    [exams, completedExamIds]
  );

  const completedExams = useMemo(
    () => exams.filter((exam) => completedExamIds.includes(exam.id)),
    [exams, completedExamIds]
  );

  // If user is not logged in, show a message
  // if (!user) {
  //   return (
  //     <div className="text-center mt-10 space-y-4">
  //     <p>Please log in to access the dashboard.</p>
  //     <Button onClick={() => router.push('/login')}>Login</Button>
  //   </div>
  //   )
  // }

  // If loading, show a loading state
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen" data-id="y59u53ns2" data-path="src/components/StudentDashboard.tsx">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-id="we1i2qfey" data-path="src/components/StudentDashboard.tsx">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-id="07hcjxloo" data-path="src/components/StudentDashboard.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="tv1igjpe8" data-path="src/components/StudentDashboard.tsx">
          <div className="flex justify-between items-center h-16" data-id="x2k6iw089" data-path="src/components/StudentDashboard.tsx">
            <div className="flex items-center" data-id="ff196ap4x" data-path="src/components/StudentDashboard.tsx">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" data-id="19mczx8ba" data-path="src/components/StudentDashboard.tsx" />
              <h1 className="text-xl font-bold text-gray-900" data-id="6ividrgod" data-path="src/components/StudentDashboard.tsx">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4" data-id="z56qj7usv" data-path="src/components/StudentDashboard.tsx">
              <Button
                variant="outline"
                size="sm"
                className='cursor-pointer'
                onClick={() => router.push('/rankings')} data-id="eutl428n1" data-path="src/components/StudentDashboard.tsx">

                <Trophy className="h-4 w-4 mr-2" data-id="cf64zxn0a" data-path="src/components/StudentDashboard.tsx" />
                Rankings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className='cursor-pointer'
                onClick={handleLogout} data-id="jse02euxe" data-path="src/components/StudentDashboard.tsx">

                <LogOut className="h-4 w-4 mr-2" data-id="9xquuayor" data-path="src/components/StudentDashboard.tsx" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="qlotrwsgn" data-path="src/components/StudentDashboard.tsx">
        {/* Welcome Section */}
        <div className="mb-8" data-id="jx44x3omn" data-path="src/components/StudentDashboard.tsx">
          <h2 className="text-3xl font-bold text-gray-900 mb-2" data-id="uxzgbt3u7" data-path="src/components/StudentDashboard.tsx">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600" data-id="e7cvpgr9m" data-path="src/components/StudentDashboard.tsx">Here&apos;s an overview of your academic progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-id="7m1ah7aaw" data-path="src/components/StudentDashboard.tsx">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200" data-id="s5z7wkw1r" data-path="src/components/AdminDashboard.tsx">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="6rvlspzlv" data-path="src/components/AdminDashboard.tsx">
              <CardTitle className="text-sm font-medium text-blue-600" data-id="6xxk38u23" data-path="src/components/AdminDashboard.tsx">Exams Attended</CardTitle>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center" data-id="za698udhb" data-path="src/components/AdminDashboard.tsx">
                <BookOpen className="h-4 w-4 text-white" data-id="mz4npxq6m" data-path="src/components/AdminDashboard.tsx" />
              </div>
            </CardHeader>
            <CardContent data-id="afi2wbc6u" data-path="src/components/AdminDashboard.tsx">
              <div className="text-2xl font-bold text-blue-600" data-id="7xuzewo68" data-path="src/components/AdminDashboard.tsx">{userStats?.totalExamsAttended || 0}</div>
              <p className="text-xs text-blue-600 mt-1" data-id="1h0zeldzj" data-path="src/components/AdminDashboard.tsx">Total completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200" data-id="s5z7wkw1r" data-path="src/components/AdminDashboard.tsx">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="6rvlspzlv" data-path="src/components/AdminDashboard.tsx">
              <CardTitle className="text-sm font-medium text-green-600" data-id="6xxk38u23" data-path="src/components/AdminDashboard.tsx">Highest Score</CardTitle>
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center" data-id="za698udhb" data-path="src/components/AdminDashboard.tsx">
                <Goal className="h-4 w-4 text-white" data-id="mz4npxq6m" data-path="src/components/AdminDashboard.tsx" />
              </div>
            </CardHeader>
            <CardContent data-id="afi2wbc6u" data-path="src/components/AdminDashboard.tsx">
              <div className="text-2xl font-bold text-green-600" data-id="7xuzewo68" data-path="src/components/AdminDashboard.tsx">{userStats?.highestScore || 0}</div>
              <p className="text-xs text-green-600 mt-1" data-id="1h0zeldzj" data-path="src/components/AdminDashboard.tsx">Best performance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200" data-id="s5z7wkw1r" data-path="src/components/AdminDashboard.tsx">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="6rvlspzlv" data-path="src/components/AdminDashboard.tsx">
              <CardTitle className="text-sm font-medium text-purple-600" data-id="6xxk38u23" data-path="src/components/AdminDashboard.tsx">Current Rank</CardTitle>
              <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center" data-id="za698udhb" data-path="src/components/AdminDashboard.tsx">
                <Award className="h-4 w-4 text-white" data-id="mz4npxq6m" data-path="src/components/AdminDashboard.tsx" />
              </div>
            </CardHeader>
            <CardContent data-id="afi2wbc6u" data-path="src/components/AdminDashboard.tsx">
              <div className="text-2xl font-bold text-purple-600" data-id="7xuzewo68" data-path="src/components/AdminDashboard.tsx">{userRanking?.globalRank ? `#${userRanking.globalRank}` : 'N/A'}</div>
              <p className="text-xs text-purple-600 mt-1" data-id="1h0zeldzj" data-path="src/components/AdminDashboard.tsx">Among students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200" data-id="s5z7wkw1r" data-path="src/components/AdminDashboard.tsx">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="6rvlspzlv" data-path="src/components/AdminDashboard.tsx">
              <CardTitle className="text-sm font-medium text-orange-500" data-id="6xxk38u23" data-path="src/components/AdminDashboard.tsx">Total Students</CardTitle>
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center" data-id="za698udhb" data-path="src/components/AdminDashboard.tsx">
                <Users className="h-4 w-4 text-white" data-id="mz4npxq6m" data-path="src/components/AdminDashboard.tsx" />
              </div>
            </CardHeader>
            <CardContent data-id="afi2wbc6u" data-path="src/components/AdminDashboard.tsx">
              <div className="text-2xl font-bold text-orange-500" data-id="7xuzewo68" data-path="src/components/AdminDashboard.tsx">{userStats?.totalStudents || 0}</div>
              <p className="text-xs text-orange-500 mt-1" data-id="1h0zeldzj" data-path="src/components/AdminDashboard.tsx">In the system</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-id="pbl1xa5fo" data-path="src/components/StudentDashboard.tsx">
          {/* Profile & Performance Card */}
          <div className="lg:col-span-1" data-id="99ksrq8p9" data-path="src/components/StudentDashboard.tsx">
            <Card data-id="omn3aspm5" data-path="src/components/StudentDashboard.tsx">
              <CardHeader data-id="mth2mr3fg" data-path="src/components/StudentDashboard.tsx">
                <CardTitle className="flex items-center" data-id="p774fbj8r" data-path="src/components/StudentDashboard.tsx">
                  <User className="h-5 w-5 mr-2" data-id="ejn902562" data-path="src/components/StudentDashboard.tsx" />
                  Profile & Performance
                </CardTitle>
              </CardHeader>
              <CardContent data-id="p9h9m9gre" data-path="src/components/StudentDashboard.tsx">
                <div className="space-y-4" data-id="1cm0fgt5r" data-path="src/components/StudentDashboard.tsx">
                  <div data-id="vi84stqm1" data-path="src/components/StudentDashboard.tsx">
                    <p className="font-semibold text-lg" data-id="83f6qpsm9" data-path="src/components/StudentDashboard.tsx">{user?.name}</p>
                    <p className="text-sm text-gray-600" data-id="khayzuhze" data-path="src/components/StudentDashboard.tsx">Email: {user?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4" data-id="ct86kue47" data-path="src/components/StudentDashboard.tsx">
                    <div className="text-center p-3 bg-blue-50 rounded-lg" data-id="6g2esseop" data-path="src/components/StudentDashboard.tsx">
                      <p className="text-xl font-bold text-blue-600" data-id="v9w7omptr" data-path="src/components/StudentDashboard.tsx">{userStats?.totalExamsAttended || 0}</p>
                      <p className="text-sm text-gray-600" data-id="lfde0qo38" data-path="src/components/StudentDashboard.tsx">Attended</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg" data-id="u2d5n1c4l" data-path="src/components/StudentDashboard.tsx">
                      <p className="text-xl font-bold text-green-600" data-id="epwx7xdpu" data-path="src/components/StudentDashboard.tsx">{Math.round(userStats?.averageScore || 0)}</p>
                      <p className="text-sm text-gray-600" data-id="dy5es47le" data-path="src/components/StudentDashboard.tsx">Avg Score</p>
                    </div>
                  </div>

                  <div className="space-y-2" data-id="hjrm5y14w" data-path="src/components/StudentDashboard.tsx">
                    <div className="flex justify-between text-sm" data-id="67o3s8y1c" data-path="src/components/StudentDashboard.tsx">
                      <span data-id="8cj5kw8x0" data-path="src/components/StudentDashboard.tsx">Average Performance</span>
                      <span className="font-medium" data-id="hjub2cq60" data-path="src/components/StudentDashboard.tsx">{Math.round(userStats?.averageScore || 0)}%</span>
                    </div>
                    <Progress value={userStats?.averageScore || 0} className="h-2" data-id="5ccgu24pr" data-path="src/components/StudentDashboard.tsx" />
                  </div>

                  {userRanking &&
                    <div className="p-3 bg-purple-50 rounded-lg" data-id="wwx9ks0qn" data-path="src/components/StudentDashboard.tsx">
                      <p className="text-sm font-medium text-purple-800" data-id="ermgf4bqu" data-path="src/components/StudentDashboard.tsx">
                        Current Rank: #{userRanking.globalRank}
                      </p>
                      <p className="text-sm text-purple-600" data-id="cdgjb1s6t" data-path="src/components/StudentDashboard.tsx">
                        Last exam: {userRanking.recentPerformance[0]?.examName || 'No recent exams'}
                      </p>
                    </div>
                  }
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6" data-id="o1ekavhwy" data-path="src/components/StudentDashboard.tsx">
              <CardHeader data-id="22ed53icm" data-path="src/components/StudentDashboard.tsx">
                <CardTitle className="text-sm" data-id="zqxp0rwge" data-path="src/components/StudentDashboard.tsx">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent data-id="7yus9duxf" data-path="src/components/StudentDashboard.tsx">
                <div className="space-y-3" data-id="jm193b7bx" data-path="src/components/StudentDashboard.tsx">
                  {userStats?.recentSubmissions?.slice(0, 3).map((submission) => {
                    const exam = exams.find((e) => e.id === submission.examId);
                    return (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm"
                        data-id="138ywudx3"
                        data-path="src/components/StudentDashboard.tsx"
                      >
                        <div className="flex flex-col" data-id="4poa5iqih" data-path="src/components/StudentDashboard.tsx">
                          <p className="text-sm font-semibold" data-id="d6mk2kw0n" data-path="src/components/StudentDashboard.tsx">
                            {exam?.name || "Unknown Exam"}
                          </p>
                          <p className="text-xs text-gray-500" data-id="v6uz1juap" data-path="src/components/StudentDashboard.tsx">
                            {submission.completedAt ? new Date(submission.completedAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1"
                          data-id="dxplqqv3a"
                          data-path="src/components/StudentDashboard.tsx"
                        >
                          {submission.score} pts
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exams List */}
          <div className="lg:col-span-2" data-id="e23a526mf" data-path="src/components/StudentDashboard.tsx">
            <div className="space-y-6" data-id="8uygofuwt" data-path="src/components/StudentDashboard.tsx">
              {/* Available Exams */}
              {availableExams.length > 0 &&
                <div data-id="pk99jqv6i" data-path="src/components/StudentDashboard.tsx">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6" data-id="8fli45em0" data-path="src/components/StudentDashboard.tsx">Available Exams</h2>
                  <div className="space-y-4" data-id="y2iij0b8v" data-path="src/components/StudentDashboard.tsx">
                    {availableExams.map((exam) =>
                      <Card key={exam.id} className="hover:shadow-md transition-shadow" data-id="78en1fj2x" data-path="src/components/StudentDashboard.tsx">
                        <CardHeader data-id="t20elh6us" data-path="src/components/StudentDashboard.tsx">
                          <div className="flex justify-between items-start" data-id="oqifjtskj" data-path="src/components/StudentDashboard.tsx">
                            <div data-id="tkba2rvzf" data-path="src/components/StudentDashboard.tsx">
                              <CardTitle className="text-lg flex items-center" data-id="kphsanx5k" data-path="src/components/StudentDashboard.tsx">
                                {exam.name}
                                {exam.isPasswordProtected &&
                                  <Lock className="h-4 w-4 ml-2 text-yellow-600" data-id="itxs45hb0" data-path="src/components/StudentDashboard.tsx" />
                                }
                              </CardTitle>
                              <CardDescription className="mt-1" data-id="lpm57vvyg" data-path="src/components/StudentDashboard.tsx">{exam.description}</CardDescription>
                            </div>
                            <Badge variant="default" data-id="b484a7yln" data-path="src/components/StudentDashboard.tsx">Available</Badge>
                          </div>
                        </CardHeader>
                        <CardContent data-id="f0hpegyu5" data-path="src/components/StudentDashboard.tsx">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4" data-id="psqav71ik" data-path="src/components/StudentDashboard.tsx">
                            <div className="flex items-center text-sm text-gray-600" data-id="2vmq1dnl7" data-path="src/components/StudentDashboard.tsx">
                              <Clock className="h-4 w-4 mr-1" data-id="zqvh4t4et" data-path="src/components/StudentDashboard.tsx" />
                              {exam.timeLimit} mins
                            </div>
                            <div className="text-sm text-gray-600" data-id="9opc1of23" data-path="src/components/StudentDashboard.tsx">
                              <span className="font-medium" data-id="1qpo7n4cu" data-path="src/components/StudentDashboard.tsx">{exam.totalMarks}</span> marks
                            </div>
                            <div className="text-sm text-gray-600" data-id="5uisegmf4" data-path="src/components/StudentDashboard.tsx">
                              <span className="font-medium" data-id="jxo9kqfyd" data-path="src/components/StudentDashboard.tsx">{exam.questions?.length || exam.questionsCount || 0}</span> questions
                            </div>
                          </div>

                          {exam.isPasswordProtected &&
                            <div className="mb-4 p-3 bg-yellow-50 rounded-lg" data-id="6lwb8zyhj" data-path="src/components/StudentDashboard.tsx">
                              <p className="text-sm font-medium text-yellow-800 flex items-center" data-id="inzswk1bb" data-path="src/components/StudentDashboard.tsx">
                                <Lock className="h-4 w-4 mr-2" data-id="sl2wwusih" data-path="src/components/StudentDashboard.tsx" />
                                Password protected exam
                              </p>
                            </div>
                          }

                          <div className="flex space-x-2" data-id="aihlg9mbr" data-path="src/components/StudentDashboard.tsx">
                            <Button
                              onClick={() => handleStartExam(exam.id)}
                              className="flex items-center cursor-pointer" data-id="abi2sip24" data-path="src/components/StudentDashboard.tsx">

                              <Play className="h-4 w-4 mr-2" data-id="8n0u2wd1f" data-path="src/components/StudentDashboard.tsx" />
                              Start Exam
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              }

              {/* Completed Exams */}
              {completedExams.length > 0 &&
                <div data-id="a8cj9t7i8" data-path="src/components/StudentDashboard.tsx">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6" data-id="dby06kjih" data-path="src/components/StudentDashboard.tsx">Completed Exams</h2>
                  <div className="space-y-4" data-id="99c5pud3w" data-path="src/components/StudentDashboard.tsx">
                    {completedExams.map((exam) => {
                      const submission = userStats?.recentSubmissions?.find((sub) => sub.examId === exam.id);
                      return (
                        <Card key={exam.id} className="hover:shadow-md transition-shadow" data-id="ctmnmoidb" data-path="src/components/StudentDashboard.tsx">
                          <CardHeader data-id="tffkk817y" data-path="src/components/StudentDashboard.tsx">
                            <div className="flex justify-between items-start" data-id="n85ovfb6n" data-path="src/components/StudentDashboard.tsx">
                              <div data-id="75qdvno3z" data-path="src/components/StudentDashboard.tsx">
                                <CardTitle className="text-lg" data-id="crx4t8i88" data-path="src/components/StudentDashboard.tsx">{exam.name}</CardTitle>
                                <CardDescription className="mt-1" data-id="nwwydjms2" data-path="src/components/StudentDashboard.tsx">{exam.description}</CardDescription>
                              </div>
                              <Badge variant="secondary" data-id="lmrb0k11q" data-path="src/components/StudentDashboard.tsx">Completed</Badge>
                            </div>
                          </CardHeader>
                          <CardContent data-id="t300fefdy" data-path="src/components/StudentDashboard.tsx">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4" data-id="1n40h6lvt" data-path="src/components/StudentDashboard.tsx">
                              <div className="flex items-center text-sm text-gray-600" data-id="8a74omswc" data-path="src/components/StudentDashboard.tsx">
                                <Clock className="h-4 w-4 mr-1" data-id="ksn4n0702" data-path="src/components/StudentDashboard.tsx" />
                                {exam.timeLimit} mins
                              </div>
                              <div className="text-sm text-gray-600" data-id="7msv0cugy" data-path="src/components/StudentDashboard.tsx">
                                <span className="font-medium" data-id="8agfl4huw" data-path="src/components/StudentDashboard.tsx">{exam.totalMarks}</span> marks
                              </div>
                              <div className="text-sm text-gray-600" data-id="hkgszd8xl" data-path="src/components/StudentDashboard.tsx">
                                <span className="font-medium" data-id="gb6oy569p" data-path="src/components/StudentDashboard.tsx">{exam.questions?.length || exam.questionsCount || 0}</span> questions
                              </div>
                            </div>

                            {submission &&
                              <div className="mb-4 p-3 bg-green-50 rounded-lg" data-id="hflqoefvx" data-path="src/components/StudentDashboard.tsx">
                                <p className="text-sm font-medium text-green-800" data-id="yzo8hksja" data-path="src/components/StudentDashboard.tsx">
                                  Score: {submission.score} marks ({Math.round(submission.score / exam.totalMarks * 100)}%)
                                </p>
                                <p className="text-sm text-green-600" data-id="m19eyh27x" data-path="src/components/StudentDashboard.tsx">
                                  Completed on: {submission.completedAt ? new Date(submission.completedAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            }

                            <div className="flex space-x-2" data-id="b2cei6eot" data-path="src/components/StudentDashboard.tsx">
                              <Button
                                variant="outline"
                                className='cursor-pointer'
                                onClick={() => handleViewResults(exam.id)} data-id="0n9odoucl" data-path="src/components/StudentDashboard.tsx">

                                View Results
                              </Button>
                            </div>
                          </CardContent>
                        </Card>);

                    })}
                  </div>
                </div>
              }

              {/* No Exams Available */}
              {availableExams.length === 0 && completedExams.length === 0 &&
                <div className="text-center py-12" data-id="o6f0af85r" data-path="src/components/StudentDashboard.tsx">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" data-id="54mxlisqe" data-path="src/components/StudentDashboard.tsx" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2" data-id="cns5soj0d" data-path="src/components/StudentDashboard.tsx">No Exams Available</h3>
                  <p className="text-gray-600" data-id="544qmcnk4" data-path="src/components/StudentDashboard.tsx">There are no published exams available at the moment.</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default StudentDashboard;