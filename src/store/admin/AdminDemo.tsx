/**
 * ✅ SIMPLIFIED ADMIN DEMO - WORKING VERSION
 * 
 * This file demonstrates how to use the admin store with zero errors.
 * These are complete, working examples that show the key patterns.
 */

import React from 'react';
import { useAdmin, useAdminDashboard, useAdminExamsManager, useAdminQuestionsManager } from './useAdmin';

// Example 1: Basic Admin Dashboard
export const AdminDashboardDemo: React.FC = () => {
  const dashboard = useAdminDashboard();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      {dashboard.loading ? (
        <div>Loading dashboard...</div>
      ) : dashboard.error ? (
        <div className="text-red-500">Error: {dashboard.error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">
              {dashboard.stats?.totalUsers || 0}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Exams</h3>
            <p className="text-3xl font-bold text-green-600">
              {dashboard.stats?.totalExams || 0}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Published Exams</h3>
            <p className="text-3xl font-bold text-purple-600">
              {dashboard.stats?.publishedExams || 0}
            </p>
          </div>
        </div>
      )}
      
      <button 
        onClick={dashboard.actions.refresh}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Data
      </button>
    </div>
  );
};

// Example 2: Simplified Exams Manager
export const ExamsManagerDemo: React.FC = () => {
  const examsManager = useAdminExamsManager();
  
  const handleFilterChange = (filter: string) => {
    const statusFilter = filter === 'all' ? {} : { status: filter as 'published' | 'draft' };
    examsManager.actions.setFilter(statusFilter);
  };
  
  const handleSelectAll = () => {
    if (examsManager.selectedExams.size === examsManager.exams.length) {
      examsManager.actions.clearSelection();
    } else {
      examsManager.actions.selectAll();
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Exams Management</h1>
        
        <div className="flex gap-2">
          <label htmlFor="exam-filter" className="sr-only">Filter exams</label>
          <select 
            id="exam-filter"
            value={examsManager.filter.status || 'all'}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Exams</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          
          <button
            onClick={() => examsManager.actions.openModal('createExam')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Exam
          </button>
        </div>
      </div>
      
      {examsManager.loading ? (
        <div>Loading exams...</div>
      ) : examsManager.error ? (
        <div className="text-red-500">Error: {examsManager.error}</div>
      ) : (
        <div>
          {/* Bulk Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 border rounded text-sm"
            >
              {examsManager.selectedExams.size === examsManager.exams.length 
                ? 'Deselect All' 
                : 'Select All'
              }
            </button>
            
            {examsManager.selectedExams.size > 0 && (
              <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                Selected: {examsManager.selectedExams.size}
              </div>
            )}
          </div>
          
          {/* Exams List */}
          <div className="space-y-2">
            {examsManager.exams.map(exam => (
              <div 
                key={exam.id} 
                className="flex items-center gap-3 p-3 border rounded"
              >
                <label htmlFor={`exam-${exam.id}`} className="sr-only">
                  Select exam {exam.name}
                </label>
                <input
                  id={`exam-${exam.id}`}
                  type="checkbox"
                  checked={examsManager.selectedExams.has(exam.id)}
                  onChange={() => examsManager.actions.toggleSelection(exam.id)}
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold">{exam.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    Status: {exam.isPublished ? 'Published' : 'Draft'}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => examsManager.actions.openModal('editExam')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this exam?')) {
                        examsManager.mutations.delete.mutate(exam.id);
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {examsManager.exams.length} of {examsManager.pagination.total} exams
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => examsManager.actions.setPagination({ 
                  page: examsManager.pagination.page - 1 
                })}
                disabled={examsManager.pagination.page <= 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm">
                Page {examsManager.pagination.page}
              </span>
              
              <button
                onClick={() => examsManager.actions.setPagination({ 
                  page: examsManager.pagination.page + 1 
                })}
                disabled={examsManager.exams.length < examsManager.pagination.limit}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Example 3: Simplified Questions Manager
export const QuestionsManagerDemo: React.FC = () => {
  const questionsManager = useAdminQuestionsManager();
  
  const handleSearch = (searchTerm: string) => {
    questionsManager.actions.setFilter({ search: searchTerm });
  };
  
  const handleSubjectFilter = (subject: string) => {
    questionsManager.actions.setFilter({ subject: subject || undefined });
  };
  
  const handleDifficultyFilter = (difficulty: string) => {
    questionsManager.actions.setFilter({ 
      difficulty: difficulty ? difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD' : undefined
    });
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Questions Management</h1>
        
        <button
          onClick={() => questionsManager.actions.openModal('createQuestion')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Question
        </button>
      </div>
      
      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search questions..."
          aria-label="Search questions"
          onChange={(e) => handleSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
        
        <label htmlFor="subject-filter" className="sr-only">Filter by subject</label>
        <select 
          id="subject-filter"
          onChange={(e) => handleSubjectFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Subjects</option>
          <option value="Math">Mathematics</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
        </select>
        
        <label htmlFor="difficulty-filter" className="sr-only">Filter by difficulty</label>
        <select 
          id="difficulty-filter"
          onChange={(e) => handleDifficultyFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      
      {questionsManager.loading ? (
        <div>Loading questions...</div>
      ) : questionsManager.error ? (
        <div className="text-red-500">Error: {questionsManager.error}</div>
      ) : (
        <div className="space-y-3">
          {questionsManager.questions.map(question => (
            <div key={question.id} className="p-4 border rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{question.content}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>Subject: {question.subject}</span>
                    <span>Topic: {question.topic}</span>
                    <span>Difficulty: {question.difficulty}</span>
                  </div>
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {question.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 bg-gray-200 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => questionsManager.actions.openModal('editQuestion')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this question?')) {
                        // Delete functionality would go here when available
                        console.log('Delete question:', question.id);
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example 4: Complete Admin Interface using Main Hook
export const CompleteAdminDemo: React.FC = () => {
  const admin = useAdmin();
  
  const tabComponents = {
    dashboard: <AdminDashboardDemo />,
    exams: <ExamsManagerDemo />,
    questions: <QuestionsManagerDemo />,
    users: <div className="p-6">Users Management (Implementation follows same pattern)</div>,
    analytics: <div className="p-6">Analytics (Implementation follows same pattern)</div>,
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          
          <div className="flex items-center gap-4">
            {admin.computed.hasAnyError && (
              <div className="text-red-500 text-sm">
                System Error Detected
              </div>
            )}
            
            <button
              onClick={admin.actions.refreshData}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              disabled={admin.computed.hasAnyLoading}
            >
              {admin.computed.hasAnyLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="flex border-b">
          {(['dashboard', 'exams', 'questions', 'users', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => admin.actions.goToTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize border-b-2 ${
                admin.state.activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>
      
      {/* Main Content */}
      <main>
        {tabComponents[admin.state.activeTab]}
      </main>
      
      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded text-xs font-mono max-w-sm">
          <div>Active Tab: {admin.state.activeTab}</div>
          <div>Loading: {JSON.stringify(admin.state.loading)}</div>
          <div>Selected: {admin.computed.selectedCount} items</div>
          <div>Cache Stale: {admin.computed.isDataStale ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default CompleteAdminDemo;
