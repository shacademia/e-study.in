'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  BookOpen, 
  AlertTriangle,
  Eye,
  BarChart3,
  FileText,
  Loader2,
  Timer
} from 'lucide-react';
import { useExamDetails } from '../hooks/useExamDetails';

interface ExamPreviewContainerProps {
  examId: string;
}

interface ExamState {
  currentSection: number;
  currentQuestion: number;
  timeRemaining: number;
  responses: Record<string, string | number | boolean>;
  isStarted: boolean;
  isCompleted: boolean;
}

const ExamPreviewContainer: React.FC<ExamPreviewContainerProps> = ({ examId }) => {
  const router = useRouter();
  const { exam, loading, error } = useExamDetails(examId);
  
  const [examState, setExamState] = useState<ExamState>({
    currentSection: 0,
    currentQuestion: 0,
    timeRemaining: 0,
    responses: {},
    isStarted: false,
    isCompleted: false,
  });
  
  const [previewMode, setPreviewMode] = useState<'overview' | 'simulate'>('overview');

  useEffect(() => {
    if (exam && previewMode === 'simulate') {
      setExamState(prev => ({
        ...prev,
        timeRemaining: exam.timeLimit * 60, // Convert to seconds
      }));
    }
  }, [exam, previewMode]);

  // Timer effect for simulation mode
  useEffect(() => {
    if (previewMode === 'simulate' && examState.isStarted && examState.timeRemaining > 0 && !examState.isCompleted) {
      const timer = setInterval(() => {
        setExamState(prev => {
          if (prev.timeRemaining <= 1) {
            return { ...prev, timeRemaining: 0, isCompleted: true };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [previewMode, examState.isStarted, examState.timeRemaining, examState.isCompleted]);

  const handleBack = () => {
    router.push(`/admin/exam/${examId}/details`);
  };

  const handleStartSimulation = () => {
    setPreviewMode('simulate');
    setExamState(prev => ({
      ...prev,
      isStarted: true,
      timeRemaining: exam?.timeLimit ? exam.timeLimit * 60 : 0,
    }));
  };

  const handleStopSimulation = () => {
    setPreviewMode('overview');
    setExamState({
      currentSection: 0,
      currentQuestion: 0,
      timeRemaining: 0,
      responses: {},
      isStarted: false,
      isCompleted: false,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSection = () => {
    if (!exam?.sections || exam.sections.length === 0) return null;
    return exam.sections[examState.currentSection];
  };

  const getCurrentQuestion = () => {
    const section = getCurrentSection();
    if (!section?.questions || section.questions.length === 0) {
      // Check direct questions on exam
      if (exam?.questions && exam.questions.length > 0) {
        return exam.questions[examState.currentQuestion];
      }
      return null;
    }
    return section.questions[examState.currentQuestion];
  };

  const getTotalQuestions = () => {
    if (exam?.sections && exam.sections.length > 0) {
      return exam.sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
    }
    return exam?.questions?.length || 0;
  };

  const getQuestionNumber = () => {
    if (exam?.sections && exam.sections.length > 0) {
      let questionNumber = 1;
      for (let i = 0; i < examState.currentSection; i++) {
        questionNumber += exam.sections[i].questions?.length || 0;
      }
      return questionNumber + examState.currentQuestion;
    }
    return examState.currentQuestion + 1;
  };

  const handleNextQuestion = () => {
    const section = getCurrentSection();
    const totalQuestions = section?.questions?.length || exam?.questions?.length || 0;
    
    if (examState.currentQuestion < totalQuestions - 1) {
      setExamState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    } else if (exam?.sections && examState.currentSection < exam.sections.length - 1) {
      setExamState(prev => ({ 
        ...prev, 
        currentSection: prev.currentSection + 1, 
        currentQuestion: 0 
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (examState.currentQuestion > 0) {
      setExamState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
    } else if (examState.currentSection > 0) {
      const prevSection = exam?.sections?.[examState.currentSection - 1];
      const prevSectionQuestions = prevSection?.questions?.length || 0;
      setExamState(prev => ({ 
        ...prev, 
        currentSection: prev.currentSection - 1,
        currentQuestion: Math.max(0, prevSectionQuestions - 1)
      }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            Loading exam preview...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-4">{error || 'Exam not found'}</p>
            <Button onClick={handleBack} className='cursor-pointer'>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = getTotalQuestions();

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preview: {exam.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                Preview Mode
              </Badge>
              {previewMode === 'simulate' && (
                <Badge variant="default">
                  <Timer className="h-3 w-3 mr-1" />
                  Simulation Active
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {previewMode === 'overview' ? (
            <Button
              onClick={handleStartSimulation}
              className="cursor-pointer"
              disabled={totalQuestions === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Simulation
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleStopSimulation}
              className="cursor-pointer"
            >
              Stop Simulation
            </Button>
          )}
        </div>
      </div>

      {previewMode === 'overview' ? (
        // Overview Mode
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Exam Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <p className="font-medium">Time Limit</p>
                      <p className="text-sm text-gray-600">{exam.timeLimit} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                    <div>
                      <p className="font-medium">Total Questions</p>
                      <p className="text-sm text-gray-600">{totalQuestions} questions</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                    <div>
                      <p className="font-medium">Total Marks</p>
                      <p className="text-sm text-gray-600">{exam.totalMarks || 0} marks</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-orange-500" />
                    <div>
                      <p className="font-medium">Sections</p>
                      <p className="text-sm text-gray-600">{exam.sections?.length || 0} sections</p>
                    </div>
                  </div>
                </div>

                {exam.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600">{exam.description}</p>
                  </div>
                )}

                {exam.instructions && (
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <p className="text-gray-600">{exam.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sections Overview */}
            {exam.sections && exam.sections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sections Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exam.sections.map((section, index) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {index + 1}. {section.name}
                            </h4>
                            {section.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {section.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">
                            {section.questions?.length || 0} questions
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {section.timeLimit && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {section.timeLimit} min
                            </div>
                          )}
                          {section.marks && (
                            <div className="flex items-center">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {section.marks} marks
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Preview Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleStartSimulation}
                  disabled={totalQuestions === 0}
                  className="w-full cursor-pointer"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </Button>
                
                {totalQuestions === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This exam has no questions. Add questions to enable simulation.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Simulation Mode
        <div className="space-y-6">
          {/* Timer Bar */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Timer className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="font-medium">Time Remaining:</span>
                    <span className={`ml-2 font-mono text-lg ${
                      examState.timeRemaining < 300 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatTime(examState.timeRemaining)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Question {getQuestionNumber()} of {totalQuestions}
                  </span>
                  <Badge variant="outline">
                    {getCurrentSection()?.name || 'Direct Questions'}
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((getQuestionNumber() - 1) / totalQuestions) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Display */}
          {currentQuestion ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {getQuestionNumber()}</span>
                  <Badge variant="outline">
                    {currentQuestion.marks} marks
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{currentQuestion.content}</h3>
                  
                  {currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            id={`option-${index}`}
                            className="h-4 w-4 text-blue-600"
                            disabled
                          />
                          <label 
                            htmlFor={`option-${index}`}
                            className="text-gray-700 cursor-not-allowed"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={examState.currentSection === 0 && examState.currentQuestion === 0}
                    className="cursor-pointer"
                  >
                    Previous
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    {examState.currentSection + 1} of {exam.sections?.length || 1} sections
                  </div>
                  
                  <Button
                    onClick={handleNextQuestion}
                    disabled={
                      getQuestionNumber() === totalQuestions ||
                      examState.isCompleted
                    }
                    className="cursor-pointer"
                  >
                    {getQuestionNumber() === totalQuestions ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No questions available in this exam.</p>
              </CardContent>
            </Card>
          )}

          {/* Time Warning */}
          {examState.timeRemaining < 300 && examState.timeRemaining > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Less than 5 minutes remaining!
              </AlertDescription>
            </Alert>
          )}

          {/* Time Up */}
          {examState.timeRemaining === 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Time&apos;s up! This exam would be automatically submitted.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamPreviewContainer;
