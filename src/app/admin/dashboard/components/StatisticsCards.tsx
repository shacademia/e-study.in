'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Edit, BookOpen } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatisticsCardsProps {
  dashboardStats: DashboardStats | null;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ dashboardStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Students Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">
            Total Students
          </CardTitle>
          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {dashboardStats?.totalStudents || 0}
          </div>
          <p className="text-xs text-blue-600 mt-1">In the system</p>
        </CardContent>
      </Card>

      {/* Published Exams Card */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">
            Published
          </CardTitle>
          <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {dashboardStats?.publishedExams || 0}
          </div>
          <p className="text-xs text-green-600 mt-1">Active exams</p>
        </CardContent>
      </Card>

      {/* Draft Exams Card */}
      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800">
            Draft
          </CardTitle>
          <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <Edit className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900">
            {dashboardStats?.draftExams || 0}
          </div>
          <p className="text-xs text-yellow-600 mt-1">Pending exams</p>
        </CardContent>
      </Card>

      {/* Total Questions Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">
            Questions
          </CardTitle>
          <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {dashboardStats?.totalQuestions || 0}
          </div>
          <p className="text-xs text-purple-600 mt-1">In question bank</p>
        </CardContent>
      </Card>
    </div>
  );
};
