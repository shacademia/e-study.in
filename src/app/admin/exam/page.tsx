'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  List, 
  BarChart3, 
  BookOpen, 
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const AdminExamPage = () => {
  const router = useRouter();

  const handleCreateExam = () => {
    router.push('/admin/exam/create');
  };

  const handleViewExams = () => {
    router.push('/admin/exam/list');
  };

  const quickStats = [
    {
      title: 'Total Exams',
      value: '12',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Published',
      value: '8',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Questions',
      value: '156',
      icon: List,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Submissions',
      value: '342',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-2">Create, manage, and monitor your exams</p>
        </div>
        <Button onClick={handleCreateExam} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create New Exam
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCreateExam}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              Create New Exam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Start building a new exam with our exam builder tool</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewExams}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="h-5 w-5 mr-2 text-green-600" />
              Manage Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">View, edit, and organize your existing exams</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">View detailed analytics and reports for your exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium">Mathematics Quiz #1 published</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium">Science Test #3 created</p>
                  <p className="text-sm text-gray-600">5 hours ago</p>
                </div>
              </div>
              <BookOpen className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium">History Exam updated</p>
                  <p className="text-sm text-gray-600">1 day ago</p>
                </div>
              </div>
              <BookOpen className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExamPage;
