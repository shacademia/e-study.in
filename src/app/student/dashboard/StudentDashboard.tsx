"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Trophy, User, LogOut, Play, Lock, Award, Target, Users } from 'lucide-react';
import { useAuth } from '../../../hooks/useMockAuth';
import { mockDataService, Exam, UserStats, Ranking } from '../../../services/mockData';

const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userRanking, setUserRanking] = useState<Ranking | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [examData, statsData, rankingData] = await Promise.all([
        mockDataService.getExams(),
        mockDataService.getUserStats(user?.id || ''),
        mockDataService.getUserRank(user?.id || '')]
        );
        setExams(examData);
        setUserStats(statsData);
        setUserRanking(rankingData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleStartExam = (examId: string) => {
    router.push(`/exam/${examId}`);
  };

  const handleViewResults = (examId: string) => {
    router.push(`/results/${examId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const completedExamIds = userStats?.recentSubmissions.map((sub) => sub.examId) || [];
  const availableExams = exams.filter((exam) => !completedExamIds.includes(exam.id));
  const completedExams = exams.filter((exam) => completedExamIds.includes(exam.id));

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
              <h1 className="text-xl font-bold text-gray-900" data-id="6ividrgod" data-path="src/components/StudentDashboard.tsx">ExamPortal</h1>
            </div>
            <div className="flex items-center space-x-4" data-id="z56qj7usv" data-path="src/components/StudentDashboard.tsx">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/rankings')} data-id="eutl428n1" data-path="src/components/StudentDashboard.tsx">

                <Trophy className="h-4 w-4 mr-2" data-id="cf64zxn0a" data-path="src/components/StudentDashboard.tsx" />
                Rankings
              </Button>
              <Button
                variant="outline"
                size="sm"
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
          <p className="text-gray-600" data-id="e7cvpgr9m" data-path="src/components/StudentDashboard.tsx">Here&apos; an overview of your academic progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-id="7m1ah7aaw" data-path="src/components/StudentDashboard.tsx">
          <Card data-id="6rp9pbktu" data-path="src/components/StudentDashboard.tsx">
            <CardHeader className="pb-3" data-id="5bp08em9n" data-path="src/components/StudentDashboard.tsx">
              <CardTitle className="text-sm font-medium text-gray-600" data-id="0cimijxg8" data-path="src/components/StudentDashboard.tsx">Exams Attended</CardTitle>
            </CardHeader>
            <CardContent data-id="foolgx06h" data-path="src/components/StudentDashboard.tsx">
              <div className="flex items-center" data-id="rmd3tm6zg" data-path="src/components/StudentDashboard.tsx">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" data-id="iu3nmwnwb" data-path="src/components/StudentDashboard.tsx" />
                <div data-id="mb2e8mh24" data-path="src/components/StudentDashboard.tsx">
                  <p className="text-2xl font-bold text-gray-900" data-id="lz0q5u7fo" data-path="src/components/StudentDashboard.tsx">{userStats?.totalExamsAttended || 0}</p>
                  <p className="text-sm text-gray-600" data-id="51m3p2cnv" data-path="src/components/StudentDashboard.tsx">Total completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-id="kq2mzoyqe" data-path="src/components/StudentDashboard.tsx">
            <CardHeader className="pb-3" data-id="3k2wr2mzq" data-path="src/components/StudentDashboard.tsx">
              <CardTitle className="text-sm font-medium text-gray-600" data-id="pn3s6c2nl" data-path="src/components/StudentDashboard.tsx">Highest Score</CardTitle>
            </CardHeader>
            <CardContent data-id="x4j5et62b" data-path="src/components/StudentDashboard.tsx">
              <div className="flex items-center" data-id="z2owuahwe" data-path="src/components/StudentDashboard.tsx">
                <Target className="h-8 w-8 text-green-600 mr-3" data-id="ksuk44cd4" data-path="src/components/StudentDashboard.tsx" />
                <div data-id="28sozdgtw" data-path="src/components/StudentDashboard.tsx">
                  <p className="text-2xl font-bold text-gray-900" data-id="0c68puj7e" data-path="src/components/StudentDashboard.tsx">{userStats?.highestScore || 0}</p>
                  <p className="text-sm text-gray-600" data-id="qnv4759cc" data-path="src/components/StudentDashboard.tsx">Best performance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-id="pkjoeakx9" data-path="src/components/StudentDashboard.tsx">
            <CardHeader className="pb-3" data-id="grje3xiuj" data-path="src/components/StudentDashboard.tsx">
              <CardTitle className="text-sm font-medium text-gray-600" data-id="2k1w4a6vg" data-path="src/components/StudentDashboard.tsx">Current Rank</CardTitle>
            </CardHeader>
            <CardContent data-id="ss5gi69lx" data-path="src/components/StudentDashboard.tsx">
              <div className="flex items-center" data-id="euucxsmfg" data-path="src/components/StudentDashboard.tsx">
                <Award className="h-8 w-8 text-purple-600 mr-3" data-id="rsajmr5bk" data-path="src/components/StudentDashboard.tsx" />
                <div data-id="pqhypln6d" data-path="src/components/StudentDashboard.tsx">
                  <p className="text-2xl font-bold text-gray-900" data-id="lqh8jwei0" data-path="src/components/StudentDashboard.tsx">
                    {userRanking?.rank ? `#${userRanking.rank}` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600" data-id="i6pjjj141" data-path="src/components/StudentDashboard.tsx">Among students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-id="5tv3lqb1o" data-path="src/components/StudentDashboard.tsx">
            <CardHeader className="pb-3" data-id="50q9oq27t" data-path="src/components/StudentDashboard.tsx">
              <CardTitle className="text-sm font-medium text-gray-600" data-id="cp5wwv63h" data-path="src/components/StudentDashboard.tsx">Total Students</CardTitle>
            </CardHeader>
            <CardContent data-id="0ibtvxmwu" data-path="src/components/StudentDashboard.tsx">
              <div className="flex items-center" data-id="gklfw83i9" data-path="src/components/StudentDashboard.tsx">
                <Users className="h-8 w-8 text-orange-600 mr-3" data-id="6kp4uvho0" data-path="src/components/StudentDashboard.tsx" />
                <div data-id="k65c74232" data-path="src/components/StudentDashboard.tsx">
                  <p className="text-2xl font-bold text-gray-900" data-id="pfmj0gssz" data-path="src/components/StudentDashboard.tsx">{userStats?.totalStudents || 0}</p>
                  <p className="text-sm text-gray-600" data-id="67hd3773m" data-path="src/components/StudentDashboard.tsx">In the system</p>
                </div>
              </div>
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
                        Current Rank: #{userRanking.rank}
                      </p>
                      <p className="text-sm text-purple-600" data-id="cdgjb1s6t" data-path="src/components/StudentDashboard.tsx">
                        Last exam: {userRanking.examName}
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
                  {userStats?.recentSubmissions.slice(0, 3).map((submission, index) => {
                    const exam = exams.find((e) => e.id === submission.examId);
                    return (
                      <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded" data-id="138ywudx3" data-path="src/components/StudentDashboard.tsx">
                        <div data-id="4poa5iqih" data-path="src/components/StudentDashboard.tsx">
                          <p className="text-sm font-medium" data-id="d6mk2kw0n" data-path="src/components/StudentDashboard.tsx">{exam?.name}</p>
                          <p className="text-xs text-gray-600" data-id="v6uz1juap" data-path="src/components/StudentDashboard.tsx">
                            {new Date(submission.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" data-id="dxplqqv3a" data-path="src/components/StudentDashboard.tsx">{submission.score} pts</Badge>
                      </div>);

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
                              <span className="font-medium" data-id="jxo9kqfyd" data-path="src/components/StudentDashboard.tsx">{exam.questions.length}</span> questions
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
                          className="flex items-center" data-id="abi2sip24" data-path="src/components/StudentDashboard.tsx">

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
                    const submission = userStats?.recentSubmissions.find((sub) => sub.examId === exam.id);
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
                                <span className="font-medium" data-id="gb6oy569p" data-path="src/components/StudentDashboard.tsx">{exam.questions.length}</span> questions
                              </div>
                            </div>
                            
                            {submission &&
                          <div className="mb-4 p-3 bg-green-50 rounded-lg" data-id="hflqoefvx" data-path="src/components/StudentDashboard.tsx">
                                <p className="text-sm font-medium text-green-800" data-id="yzo8hksja" data-path="src/components/StudentDashboard.tsx">
                                  Score: {submission.score} marks ({Math.round(submission.score / exam.totalMarks * 100)}%)
                                </p>
                                <p className="text-sm text-green-600" data-id="m19eyh27x" data-path="src/components/StudentDashboard.tsx">
                                  Completed on: {new Date(submission.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                          }
                            
                            <div className="flex space-x-2" data-id="b2cei6eot" data-path="src/components/StudentDashboard.tsx">
                              <Button
                              variant="outline"
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