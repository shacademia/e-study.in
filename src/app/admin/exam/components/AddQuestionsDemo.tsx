'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, ArrowLeft } from 'lucide-react';
import AddQuestionsSection from './AddQuestionsSection';
import UserDebugInfo from './UserDebugInfo';
import { Question, ExamSection } from '@/constants/types';

interface AddQuestionsDemoProps {
  examId?: string;
  section?: ExamSection;
  onBack?: () => void;
}

const AddQuestionsDemo: React.FC<AddQuestionsDemoProps> = ({
  examId = 'demo-exam-id',
  section = {
    id: 'demo-section-id',
    name: 'Demo Section',
    description: 'A demo section for testing',
    timeLimit: 60,
    marks: 0,
    examId: 'demo-exam-id',
    questionsCount: 0,
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  onBack
}) => {
  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [sectionQuestions, setSectionQuestions] = useState<Question[]>(section.questions || []);
  const [currentSection, setCurrentSection] = useState<ExamSection>(section);

  const handleQuestionsAdded = (addedQuestions: Question[], totalAdded: number) => {
    // Update the local state with the new questions
    const updatedQuestions = [...sectionQuestions, ...addedQuestions];
    setSectionQuestions(updatedQuestions);
    
    // Update section metadata
    setCurrentSection(prev => ({
      ...prev,
      questions: updatedQuestions,
      questionsCount: updatedQuestions.length,
      marks: updatedQuestions.length * 1 // 1 mark per question
    }));

    console.log(`Added ${totalAdded} questions to section "${currentSection.name}"`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with back button */}
      {onBack && (
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Add Questions Section Demo</h1>
        </div>
      )}

      {/* User Debug Info - Remove this after testing */}
      <UserDebugInfo />
      
      {/* Section Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            {currentSection.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentSection.questionsCount}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentSection.marks}</div>
              <div className="text-sm text-muted-foreground">Total Marks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentSection.timeLimit}</div>
              <div className="text-sm text-muted-foreground">Time Limit (min)</div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={() => setShowAddQuestions(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Questions to Section
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Questions */}
      {sectionQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Questions ({sectionQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectionQuestions.slice(0, 5).map((question, index) => (
                <div key={question.id} className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">Q{index + 1}.</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {question.subject}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      question.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{question.content}</p>
                </div>
              ))}
              {sectionQuestions.length > 5 && (
                <div className="text-center text-gray-500 text-sm">
                  ... and {sectionQuestions.length - 5} more questions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use AddQuestionsSection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Advanced search and filtering by subject, difficulty, topic, and tags</li>
              <li>Multiple view modes: List, Grid, and Detailed view</li>
              <li>Smart selection algorithms for balanced question sets</li>
              <li>Bulk selection and individual question selection</li>
              <li>Question preview with full details</li>
              <li>Real-time selection counter and validation</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Selection Modes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Individual:</strong> Click on questions to select them one by one</li>
              <li><strong>Bulk Actions:</strong> Select all filtered questions or clear selection</li>
              <li><strong>Smart Selection:</strong> AI-powered selection with difficulty balance and subject distribution</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Integration:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Can be used as a dialog (modal) or inline component</li>
              <li>Handles both existing questions and API loading</li>
              <li>Provides callbacks for question addition events</li>
              <li>Fully integrated with the exam builder system</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* AddQuestionsSection Component */}
      <AddQuestionsSection
        examId={examId}
        sectionId={currentSection.id}
        section={currentSection}
        isOpen={showAddQuestions}
        mode="dialog"
        onClose={() => setShowAddQuestions(false)}
        onQuestionsAdded={handleQuestionsAdded}
      />
    </div>
  );
};

export default AddQuestionsDemo;
