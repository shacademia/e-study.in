'use client';

import { useMemo } from 'react';
import { Exam, Question, User } from '@/constants/types';
import { AdminStats, DashboardStats } from '../types';

interface UseDashboardStatsProps {
  exams: Exam[];
  questions: Question[];
  users: User[];
  adminStats: AdminStats | null;
}

export const useDashboardStats = ({
  exams,
  questions,
  users,
  adminStats,
}: UseDashboardStatsProps): DashboardStats => {
  return useMemo(() => {
    // Prefer admin stats from API, fallback to calculated values from loaded data
    const totalExams = adminStats?.totalExams ?? exams.length;
    const publishedExams = adminStats?.publishedExams ?? exams.filter(exam => exam.isPublished === true).length;
    const draftExams = adminStats?.draftExams ?? exams.filter(exam => exam.isPublished === false || exam.isDraft === true).length;
    const totalQuestions = adminStats?.totalQuestions ?? questions.length;
    const totalUsers = adminStats?.totalUsers ?? users.length;
    const totalStudents = adminStats?.totalStudents ?? users.filter(user => user.role === 'USER').length;
    const totalAdmins = adminStats?.totalAdmins ?? users.filter(user => user.role === 'ADMIN').length;

    // Debug logging
    console.log('=== DASHBOARD STATS DEBUG ===');
    console.log('Admin Stats from API:', adminStats);
    console.log('Exams loaded:', exams.length);
    console.log('Exams with isDraft=true:', exams.filter(exam => exam.isDraft).length);
    console.log('Exams with isPublished=true:', exams.filter(exam => exam.isPublished).length);
    console.log('Exams with isPublished=false:', exams.filter(exam => !exam.isPublished).length);
    console.log('Calculated draft exams (isPublished=false OR isDraft=true):', exams.filter(exam => exam.isPublished === false || exam.isDraft === true).length);
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
      totalSubmissions: adminStats?.totalSubmissions,
      completedSubmissions: adminStats?.completedSubmissions,
      recentExams: exams.slice(0, 5), // Most recent 5 exams
    };
  }, [exams, questions, users, adminStats]);
};
