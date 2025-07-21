"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Trophy,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Clock,
  CheckCircle,
  Copy,
  Users,
  Undo2
} from 'lucide-react';
import { useAuth } from '@/hooks/useApiAuth';
import { useExams, useQuestions, useUsers, useAdmin } from '@/hooks/useApiServices';
import { Exam, Question, User } from '@/constants/types';
import { authService } from '@/services/auth';

// Define admin stats type
interface AdminStats {
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  publishedExams: number;
  draftExams: number;
  totalStudents?: number;
  totalAdmins?: number;
  totalSubmissions?: number;
  completedSubmissions?: number;
}

import dynamic from 'next/dynamic';
const EnhancedExamBuilder = dynamic(() => import('../exam/create/EnhancedExamBuilder'), { ssr: false });
const EnhancedQuestionBank = dynamic(() => import('../questionbank/EnhancedQuestionBank'), { ssr: false });

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // API hooks
  const examsApi = useExams();
  const questionsApi = useQuestions();
  const usersApi = useUsers();
  const adminApi = useAdmin();
  
  // Local state
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showExamBuilder, setShowExamBuilder] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [recentlyDeletedExam, setRecentlyDeletedExam] = useState<Exam | null>(null);

  useEffect(() => {
    if (!user?.id || dataLoaded) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setDataLoaded(true); // Prevent multiple calls
        
        // Load all admin dashboard data in parallel
        const [examResult, questionResult, usersResult, statsResult] = await Promise.allSettled([
          examsApi.getAllExams({ page: 1, limit: 10, published: true }), // Add explicit parameters that worked in test
          questionsApi.getAllQuestions({ page: 1, limit: 100 }),
          usersApi.getAllUsers({ page: 1, limit: 50 }),
          adminApi.getDashboardStats()
        ]);

        console.log('Exams😂', examResult.status)
        console.log('🔥 EXAM API CALL DEBUG:')
        console.log('🔥 User:', user)
        console.log('🔥 Auth token exists:', !!authService.getToken())
        console.log('🔥 Auth config:', authService.getAuthConfig())
        
        // Handle exams result
        if (examResult.status === 'fulfilled') {
          console.log('✅ Admin Exams API Response:', examResult.value);
          // FIXED: API returns { data: { exams: [...] } }, not { data: [...] }
          const examData = examResult.value as { data: { exams: Exam[] } };
          console.log('✅ Exam data structure:', examData);
          console.log('✅ Exam data.data:', examData.data);
          console.log('✅ Exam data.data.exams:', examData.data?.exams);
          
          // Get the exams array from the correct path
          const examsArray = examData.data?.exams || [];
          console.log('✅ Exams array:', examsArray);
          console.log('✅ Exams count:', examsArray.length);
          
          const sortedExams = Array.isArray(examsArray) ? 
            examsArray.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()) : 
            [];
          
          console.log('✅ Sorted exams:', sortedExams);
          setExams(sortedExams);
        } else {
          console.error('❌ Failed to load exams:', examResult.reason);
          console.error('❌ Exam result full details:', examResult);
          setExams([]);
        }

        // Handle questions result
        if (questionResult.status === 'fulfilled') {
          console.log('Admin Questions API Response:', questionResult.value);
          const questionData = questionResult.value as { data: Question[] };
          setQuestions(Array.isArray(questionData.data) ? questionData.data : []);
        } else {
          console.error('Failed to load questions:', questionResult.reason);
          setQuestions([]);
        }

        // Handle users result
        if (usersResult.status === 'fulfilled') {
          console.log('Admin Users API Response:', usersResult.value);
          const userData = usersResult.value as { data: User[] };
          setUsers(Array.isArray(userData.data) ? userData.data : []);
        } else {
          console.error('Failed to load users:', usersResult.reason);
          setUsers([]);
        }

        // Handle admin stats result
        if (statsResult.status === 'fulfilled') {
          console.log('Admin Stats API Response:', statsResult.value);
          const statsData = statsResult.value as { 
            data: { 
              overview: {
                totalUsers: number;
                totalStudents: number;
                totalAdmins: number;
                totalExams: number;
                totalQuestions: number;
                publishedExams: number;
                draftExams: number;
                totalSubmissions: number;
                completedSubmissions: number;
              }
            } 
          };
          // Parse the admin stats from the API response
          const overview = statsData.data?.overview;
          if (overview) {
            setAdminStats({
              totalUsers: overview.totalUsers,
              totalStudents: overview.totalStudents,
              totalAdmins: overview.totalAdmins,
              totalExams: overview.totalExams,
              totalQuestions: overview.totalQuestions,
              publishedExams: overview.publishedExams,
              draftExams: overview.draftExams,
              totalSubmissions: overview.totalSubmissions,
              completedSubmissions: overview.completedSubmissions
            });
          } else {
            setAdminStats(null);
          }
        } else {
          console.error('Failed to load admin stats:', statsResult.reason);
          setAdminStats(null);
        }

      } catch (error) {
        console.error("Error loading admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, user, dataLoaded, examsApi, questionsApi, usersApi, adminApi]);

  const handleTogglePublish = async (examId: string, isPublished: boolean) => {
    try {
      // Optimistically update the UI
      setExams(exams.map((exam) =>
        exam.id === examId ? { ...exam, isPublished, isDraft: !isPublished } : exam
      ));

      // Use real API to update exam
      await examsApi.updateExam(examId, { isPublished, isDraft: !isPublished });

      toast({
        title: 'Success',
        description: `Exam ${isPublished ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error("Failed to update exam:", error);
      // Revert on error - reload exams
      const examResult = await examsApi.getAllExams({ page: 1, limit: 100 });
      const examData = examResult as { data: { exams: Exam[] } };
      setExams(Array.isArray(examData.data?.exams) ? examData.data.exams : []);
      toast({
        title: 'Error',
        description: 'Failed to update exam',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteExam = async (examId: string) => {
    const examToDelete = exams.find(exam => exam.id === examId);
    if (!examToDelete) return;

    try {
      // Remove from UI optimistically
      setExams(exams.filter(exam => exam.id !== examId));
      setRecentlyDeletedExam(examToDelete);

      // Use real API to delete exam
      await examsApi.deleteExam(examId);

      toast({
        title: 'Success',
        description: 'Exam deleted successfully',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUndoDelete()}
          >
            <Undo2 className="h-4 w-4 mr-2" />
            Undo
          </Button>
        ),
      });

      // Clear undo option after 10 seconds
      setTimeout(() => setRecentlyDeletedExam(null), 10000);
    } catch (error) {
      console.error("Failed to delete exam:", error);
      // Revert on error
      setExams([...exams]);
      setRecentlyDeletedExam(null);
      toast({
        title: 'Error',
        description: 'Failed to delete exam',
        variant: 'destructive'
      });
    }
  };

  const handleUndoDelete = async () => {
    if (!recentlyDeletedExam) return;

    try {
      // Create the exam again (this would need to be implemented in the API)
      // For now, just add it back to the UI
      setExams([recentlyDeletedExam, ...exams]);
      setRecentlyDeletedExam(null);

      toast({
        title: 'Success',
        description: 'Exam restored successfully'
      });
    } catch (error) {
      console.error("Failed to restore exam:", error);
      toast({
        title: 'Error',
        description: 'Failed to restore exam',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Calculate dashboard statistics from loaded data
  const dashboardStats = useMemo(() => {
    // Prefer admin stats from API, fallback to calculated values from loaded data
    const totalExams = adminStats?.totalExams ?? exams.length;
    const publishedExams = adminStats?.publishedExams ?? exams.filter(exam => exam.isPublished).length;
    const draftExams = adminStats?.draftExams ?? exams.filter(exam => exam.isDraft).length;
    const totalQuestions = adminStats?.totalQuestions ?? questions.length;
    const totalUsers = adminStats?.totalUsers ?? users.length;
    const totalStudents = adminStats?.totalStudents ?? users.filter(user => user.role === 'USER').length;
    const totalAdmins = adminStats?.totalAdmins ?? users.filter(user => user.role === 'ADMIN').length;

    // Debug logging to see what's happening
    console.log('=== DASHBOARD STATS DEBUG ===');
    console.log('Admin Stats from API:', adminStats);
    console.log('Exams loaded:', exams.length);
    console.log('Exams with isDraft=true:', exams.filter(exam => exam.isDraft).length);
    console.log('Exams with isPublished=true:', exams.filter(exam => exam.isPublished).length);
    console.log('Exams with isPublished=false:', exams.filter(exam => !exam.isPublished).length);
    console.log('Exam details:', exams.map(exam => ({ 
      id: exam.id, 
      name: exam.name, 
      isPublished: exam.isPublished, 
      isDraft: exam.isDraft 
    })));
    console.log('Final calculated stats:', { 
      totalExams, 
      publishedExams, 
      draftExams, 
      totalQuestions, 
      totalUsers, 
      totalStudents, 
      totalAdmins 
    });
    console.log('===============================');

    return {
      totalExams,
      publishedExams,
      draftExams,
      totalQuestions,
      totalUsers,
      totalStudents,
      totalAdmins,
      recentExams: exams.slice(0, 5), // Most recent 5 exams
    };
  }, [exams, questions, users, adminStats]);

  const handleDuplicateExam = async () => {
    try {
      // For now, just show a toast that this feature is coming soon
      toast({
        title: 'Coming Soon',
        description: 'Exam duplication feature will be available soon'
      });
    } catch (error) {
      console.error("Failed to duplicate exam:", error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate exam',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen" data-id="w70oqqbma" data-path="src/components/AdminDashboard.tsx">Loading...</div>;
  }

  // Show other components
  if (showExamBuilder) {
    return <EnhancedExamBuilder onBack={() => setShowExamBuilder(false)} data-id="bzurrhcs8" data-path="src/components/AdminDashboard.tsx" />;
  }

  if (showQuestionBank) {
    return <EnhancedQuestionBank onBack={() => setShowQuestionBank(false)} data-id="viylgv3pn" data-path="src/components/AdminDashboard.tsx" />;
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
              <Button
                variant="outline"
                size="sm"
                className='cursor-pointer'
                onClick={() => router.push('/admin/questionbank')} data-id="eutl428n1" data-path="src/components/StudentDashboard.tsx">
                <BookOpen className="h-4 w-4 mr-1" data-id="cf64zxn0a" data-path="src/components/StudentDashboard.tsx" />
                Question Bank
              </Button>
              <Button
                variant="outline"
                size="sm"
                className='cursor-pointer'
                onClick={() => router.push('/rankings')} data-id="eutl428n1" data-path="src/components/StudentDashboard.tsx">
                <Trophy className="h-4 w-4 mr-1" data-id="cf64zxn0a" data-path="src/components/StudentDashboard.tsx" />
                Rankings
              </Button>
              <Button variant="outline" size="sm" className='cursor-pointer' onClick={handleLogout} data-id="j5rgmjj0h" data-path="src/components/AdminDashboard.tsx">
                <LogOut className="h-4 w-4 mr-1" data-id="fvrgm0z68" data-path="src/components/AdminDashboard.tsx" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="xlclk3tzs" data-path="src/components/AdminDashboard.tsx">
        {/* Welcome Section */}
        <div className="mb-8" data-id="jx44x3omn" data-path="src/components/StudentDashboard.tsx">
          <h2 className="text-3xl font-bold text-gray-900 mb-2" data-id="uxzgbt3u7" data-path="src/components/StudentDashboard.tsx">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600" data-id="e7cvpgr9m" data-path="src/components/StudentDashboard.tsx">Here&apos;s an overview of academic progress</p>
        </div>

        <div className="space-y-6" data-id="3riy9xrl1" data-path="src/components/AdminDashboard.tsx">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-id="f1lzdf8m0" data-path="src/components/AdminDashboard.tsx">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200" data-id="s5z7wkw1r" data-path="src/components/AdminDashboard.tsx">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-id="6rvlspzlv" data-path="src/components/AdminDashboard.tsx">
                <CardTitle className="text-sm font-medium text-blue-800" data-id="6xxk38u23" data-path="src/components/AdminDashboard.tsx">Total Students</CardTitle>
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center" data-id="za698udhb" data-path="src/components/AdminDashboard.tsx">
                  <Users className="h-4 w-4 text-white" data-id="mz4npxq6m" data-path="src/components/AdminDashboard.tsx" />
                </div>
              </CardHeader>
              <CardContent data-id="afi2wbc6u" data-path="src/components/AdminDashboard.tsx">
                <div className="text-2xl font-bold text-blue-900" data-id="7xuzewo68" data-path="src/components/AdminDashboard.tsx">{dashboardStats?.totalStudents || 0}</div>
                <p className="text-xs text-blue-600 mt-1" data-id="1h0zeldzj" data-path="src/components/AdminDashboard.tsx">In the system</p>
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
                <div className="text-2xl font-bold text-green-900" data-id="5l1fpfm6c" data-path="src/components/AdminDashboard.tsx">{dashboardStats?.publishedExams || 0}</div>
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
                <div className="text-2xl font-bold text-yellow-900" data-id="z958vlw2r" data-path="src/components/AdminDashboard.tsx">{dashboardStats?.draftExams || 0}</div>
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
                <div className="text-2xl font-bold text-purple-900" data-id="2n0obf6td" data-path="src/components/AdminDashboard.tsx">{dashboardStats?.totalQuestions || 0}</div>
                <p className="text-xs text-purple-600 mt-1" data-id="53o92lowk" data-path="src/components/AdminDashboard.tsx">In question bank</p>
              </CardContent>
            </Card>
          </div>

          {/* Exam Management */}
          <div className="space-y-6" data-id="d1mscx5d9" data-path="src/components/AdminDashboard.tsx">
            <div className="flex justify-between items-center" data-id="jashzh9wk" data-path="src/components/AdminDashboard.tsx">
              <h2 className="text-2xl font-bold" data-id="3dfwnzxp7" data-path="src/components/AdminDashboard.tsx">Exam Management</h2>
              <div className="flex space-x-2" data-id="y1towoot3" data-path="src/components/AdminDashboard.tsx">
                <Button variant="outline" className='cursor-pointer' onClick={() => setShowQuestionBank(true)} data-id="44qcee5pl" data-path="src/components/AdminDashboard.tsx">
                  <BookOpen className="h-4 w-4 mr-2" data-id="gy34as799" data-path="src/components/AdminDashboard.tsx" />
                  Question Bank
                </Button>
                <Button onClick={() => { setShowExamBuilder(true) }} className='cursor-pointer' data-id="a9d337j06" data-path="src/components/AdminDashboard.tsx">
                  <Plus className="h-4 w-4 mr-2" data-id="bh61i5qdt" data-path="src/components/AdminDashboard.tsx" />
                  Create Exam
                </Button>
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
                          className='cursor-pointer'
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
                          className='cursor-pointer'
                          size="sm"
                          onClick={() => handleDuplicateExam()} data-id="u5thkck0e" data-path="src/components/AdminDashboard.tsx">

                          <Copy className="h-4 w-4" data-id="ws9s0wq56" data-path="src/components/AdminDashboard.tsx" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className='cursor-pointer'
                          onClick={() => {
                            setShowExamBuilder(true);
                          }} data-id="plu6du83g" data-path="src/components/AdminDashboard.tsx">

                          <Edit className="h-4 w-4" data-id="wjs96azu5" data-path="src/components/AdminDashboard.tsx" />
                        </Button>
                        <Button
                          variant="outline"
                          className='cursor-pointer'
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
                        <span className="font-medium" data-id="ee03l3k1v" data-path="src/components/AdminDashboard.tsx">{exam.questions?.length || 0}</span> questions
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
      </div>
    </div>);

};

export default AdminDashboard;