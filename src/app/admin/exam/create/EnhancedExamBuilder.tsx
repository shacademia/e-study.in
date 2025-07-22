'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  BookOpen,
  Settings,
  Lock
} from 'lucide-react';
import AddQuestionsSection from '../components/AddQuestionsSection';
import { toast } from '@/hooks/use-toast';
import { Exam, ExamSection, Question } from '@/constants/types';
import { 
  useExamForEdit, 
  useExamActions,
  useFilteredQuestions,
  useExamBuilderUI,
  useStoreInitialization
} from '@/store';

interface EnhancedExamBuilderProps {
  onBack: () => void;
  editingExam?: Partial<Exam>;
  availableQuestions?: Question[]; // Pass questions from parent to avoid duplicate API calls
}

const EnhancedExamBuilder: React.FC<EnhancedExamBuilderProps> = ({ onBack, editingExam, availableQuestions }) => {
  // Initialize stores
  useStoreInitialization();

  // Zustand store hooks
  const examForEdit = useExamForEdit();
  const { 
    createExam, 
    saveExamWithSections, 
    fetchExamForEdit,
    clearExamForEdit
  } = useExamActions();
  
  const filteredQuestions = useFilteredQuestions();
  
  const {
    activeSection,
    showQuestionSelector,
    setActiveSection,
    setShowQuestionSelector
  } = useExamBuilderUI();

  // Local state for exam details and sections
  const [examDetails, setExamDetails] = useState({
    title: '',
    description: '',
    duration: 180,
    totalMarks: 0,
    instructions: '',
    status: 'draft',
    password: '',
    isPasswordRequired: false
  });

  const [sections, setSections] = useState<ExamSection[]>([
    {
      id: '1',
      name: 'Section 1',
      description: 'Main section of the exam',
      questions: [],
      timeLimit: 60,
      marks: 0,
      examId: '',
      questionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Use available questions from store or props
  const questions = availableQuestions?.length ? availableQuestions : filteredQuestions;

  // Update state when exam data loads from store
  useEffect(() => {
    if (editingExam?.id) {
      fetchExamForEdit(editingExam.id);
    } else {
      // Clear cached exam data when creating new exam
      clearExamForEdit();
    }
  }, [editingExam?.id, fetchExamForEdit, clearExamForEdit]);

  // Reset form when switching to create mode
  useEffect(() => {
    if (!editingExam?.id) {
      // Reset to default values for new exam creation
      setExamDetails({
        title: '',
        description: '',
        duration: 180,
        totalMarks: 0,
        instructions: '',
        status: 'draft',
        password: '',
        isPasswordRequired: false
      });
      
      // Reset sections to default empty section
      setSections([{
        id: 'section-1',
        name: 'Section 1',
        description: '',
        timeLimit: 0,
        marks: 0,
        questionsCount: 0,
        examId: '',
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]);
    }
  }, [editingExam?.id]);

  useEffect(() => {
    // Only apply exam data if we're in edit mode AND have exam data
    if (editingExam?.id && examForEdit && examForEdit.exam) {
      // Set exam details from store data
      setExamDetails({
        title: examForEdit.exam.name || '',
        description: examForEdit.exam.description || '',
        duration: examForEdit.exam.timeLimit || 180,
        totalMarks: examForEdit.exam.totalMarks || 0,
        instructions: examForEdit.exam.instructions || '',
        status: examForEdit.exam.isPublished ? 'published' : 'draft',
        password: examForEdit.exam.password || '',
        isPasswordRequired: examForEdit.exam.isPasswordProtected || false
      });
      
      // Handle both sections and direct questions
      if (examForEdit.sections && examForEdit.sections.length > 0) {
        // Transform and set sections with complete question data
        const transformedSections: ExamSection[] = examForEdit.sections.map((section) => {
          const sectionQuestions: Question[] = section.questions?.map((esq) => {
            // The esq should have the structure { question: Question, marks: number, order: number }
            return {
              ...esq.question,
              // Add marks and order as additional properties on the Question
              marks: esq.marks,
              order: esq.order
            } as Question & { marks: number; order: number };
          }) || [];

          return {
            id: section.id,
            name: section.name,
            description: section.description || '',
            timeLimit: section.timeLimit || 0,
            marks: section.marks || 0,
            questionsCount: section.questionsCount,
            examId: examForEdit.exam.id || '',
            questions: sectionQuestions,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          };
        });
        
        setSections(transformedSections);
      }
    } else if (editingExam && !editingExam.id) {
      // Fallback to basic editing data (for backward compatibility)
      setExamDetails({
        title: editingExam.name || '',
        description: editingExam.description || '',
        duration: editingExam.timeLimit || 180,
        totalMarks: editingExam.totalMarks || 0,
        instructions: editingExam.instructions || '',
        status: editingExam.isPublished ? 'published' : 'draft',
        password: editingExam.password || '',
        isPasswordRequired: editingExam.isPasswordProtected || false
      });
      if (editingExam.sections) {
        setSections(editingExam.sections);
      }
    }
  }, [examForEdit, editingExam]);

  const handleAddSection = () => {
    const newSection: ExamSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      description: '',
      questions: [],
      timeLimit: 60,
      marks: 0,
      examId: '',
      questionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    if (activeSection >= sections.length - 1) {
      setActiveSection(Math.max(0, sections.length - 2));
    }
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<ExamSection>) => {
    setSections(sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    ));
  };

  const handleRemoveQuestion = (sectionId: string, questionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section && section.questions) {
      const updatedQuestions = section.questions.filter((q) => q.id !== questionId);
      const updatedMarks = updatedQuestions.length * 1; // 1 mark per question
      handleUpdateSection(sectionId, {
        questions: updatedQuestions,
        marks: updatedMarks,
        questionsCount: updatedQuestions.length
      });
    }
  };

  const getTotalQuestions = () => {
    return sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
  };

  const getTotalMarks = () => {
    return sections.reduce((total, section) => total + (section.marks || 0), 0);
  };

  const handleSaveExam = async (status: 'draft' | 'published') => {
    try {
      // Validation
      if (!examDetails.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Exam title is required",
          variant: "destructive",
        });
        return;
      }

      if (sections.length === 0) {
        toast({
          title: "Validation Error", 
          description: "At least one section is required",
          variant: "destructive",
        });
        return;
      }

      // Check if we have questions in sections (for published exams)
      const totalQuestions = getTotalQuestions();
      if (status === 'published' && totalQuestions === 0) {
        toast({
          title: "Validation Error",
          description: "Cannot publish exam without questions. Please add questions to sections first.",
          variant: "destructive",
        });
        return;
      }

      const examData = {
        name: examDetails.title,
        description: examDetails.description,
        timeLimit: examDetails.duration,
        instructions: examDetails.instructions,
        password: examDetails.password,
        isPasswordProtected: examDetails.isPasswordRequired,
        isPublished: status === 'published',
        isDraft: status === 'draft',
      };

      // Transform sections for API - ensure we have proper data
      const sectionsData = sections.map(section => ({
        id: section.id,
        name: section.name,
        description: section.description || '',
        timeLimit: section.timeLimit || 0,
        questions: (section.questions || []).map((question, index) => ({
          questionId: question.id,
          order: (question as { order?: number }).order ?? index, // Use order if available, fallback to index
          marks: Number((question as { marks?: number }).marks) || 1
        }))
      }));

      const payload = {
        exam: examData,
        sections: sectionsData
      };

      console.log('💾 Saving exam with payload:', payload);

      if (editingExam && editingExam.id) {
        // Update existing exam with sections
        console.log('🔄 Updating existing exam:', editingExam.id);
        const result = await saveExamWithSections(editingExam.id, payload);
        if (result) {
          toast({
            title: "Success",
            description: `Exam ${status === 'published' ? 'published' : 'saved as draft'} successfully`,
            variant: "default",
          });
          onBack();
        }
      } else {
        // Create new exam first, then save with sections
        console.log('🆕 Creating new exam...');
        const newExam = await createExam(examData);
        
        if (newExam && newExam.id) {
          console.log('✅ Exam created, now saving sections:', newExam.id);
          const result = await saveExamWithSections(newExam.id, payload);
          if (result) {
            toast({
              title: "Success",
              description: `Exam ${status === 'published' ? 'published' : 'saved as draft'} successfully`,
              variant: "default",
            });
            onBack();
          }
        } else {
          throw new Error('Failed to create exam - no ID returned');
        }
      }
    } catch (error) {
      console.error('❌ Failed to save exam:', error);
      toast({
        title: "Error",
        description: "Failed to save exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="cursor-pointer" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Edit className="h-8 w-8 text-blue-600 mr-3 ml-4" />
              <h1 className="text-xl font-bold text-gray-900">
                {editingExam ? 'Edit Exam' : 'Create New Exam'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => handleSaveExam('draft')}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm" className="cursor-pointer" onClick={() => handleSaveExam('published')}>
                <Eye className="h-4 w-4 mr-2" />
                Publish Exam
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Exam Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Exam Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="exam-title">Exam Title</Label>
                  <Input
                    id="exam-title"
                    placeholder="Enter exam title"
                    value={examDetails.title}
                    onChange={(e) => setExamDetails({ ...examDetails, title: e.target.value })} />
                </div>

                <div>
                  <Label htmlFor="exam-description">Description</Label>
                  <Textarea
                    id="exam-description"
                    placeholder="Enter exam description"
                    value={examDetails.description}
                    onChange={(e) => setExamDetails({ ...examDetails, description: e.target.value })} />
                </div>

                <div>
                  <Label htmlFor="exam-duration">Duration (minutes)</Label>
                  <Input
                    id="exam-duration"
                    type="number"
                    placeholder="Enter duration in minutes"
                    value={examDetails.duration}
                    onChange={(e) => setExamDetails({ ...examDetails, duration: parseInt(e.target.value) || 0 })} />
                </div>

                <div>
                  <Label htmlFor="exam-instructions">Instructions</Label>
                  <Textarea
                    id="exam-instructions"
                    placeholder="Enter exam instructions"
                    value={examDetails.instructions}
                    onChange={(e) => setExamDetails({ ...examDetails, instructions: e.target.value })} />
                </div>

                {/* Password Protection */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-gray-500" />
                    <Label className="text-base font-medium">Password Protection</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="password-required"
                      checked={examDetails.isPasswordRequired}
                      onCheckedChange={(checked) => setExamDetails({ ...examDetails, isPasswordRequired: checked })} />
                    <Label htmlFor="password-required">Require password to access exam</Label>
                  </div>
                  {examDetails.isPasswordRequired &&
                    <div>
                      <Label htmlFor="exam-password">Exam Password</Label>
                      <Input
                        id="exam-password"
                        type="password"
                        placeholder="Enter exam password"
                        value={examDetails.password}
                        onChange={(e) => setExamDetails({ ...examDetails, password: e.target.value })} />
                    </div>
                  }
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Questions</Label>
                    <div className="text-2xl font-bold text-blue-600">{getTotalQuestions()}</div>
                  </div>
                  <div>
                    <Label>Total Marks</Label>
                    <div className="text-2xl font-bold text-green-600">{getTotalMarks()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sections ({sections.length})</Label>
                  {sections.map((section, index) =>
                    <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant={index === activeSection ? "default" : "outline"}>
                          {section.name}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {section.questions?.length || 0} questions
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleDeleteSection(section.id)}
                        disabled={sections.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer w-full"
                    onClick={handleAddSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Section Builder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Section Configuration</CardTitle>
                <CardDescription>
                  Configure sections and add questions to your exam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeSection.toString()} onValueChange={(value) => setActiveSection(parseInt(value))}>
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                    {sections.map((section, index) =>
                      <TabsTrigger key={section.id} value={index.toString()} className='cursor-pointer'>
                        {section.name}
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {sections.map((section, index) =>
                    <TabsContent key={section.id} value={index.toString()} className="space-y-6">
                      {/* Section Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`section-name-${section.id}`}>Section Name</Label>
                          <Input
                            id={`section-name-${section.id}`}
                            value={section.name}
                            onChange={(e) => handleUpdateSection(section.id, { name: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor={`section-time-${section.id}`}>Time Limit (minutes)</Label>
                          <Input
                            id={`section-time-${section.id}`}
                            type="number"
                            value={section.timeLimit || ''}
                            onChange={(e) => handleUpdateSection(section.id, { timeLimit: parseInt(e.target.value) || undefined })} />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`section-description-${section.id}`}>Section Description</Label>
                        <Textarea
                          id={`section-description-${section.id}`}
                          value={section.description}
                          onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })} />
                      </div>

                      {/* Section Questions */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-base font-medium">Questions ({section.questions?.length || 0})</Label>
                          <Button size="sm" className="cursor-pointer" onClick={() => setShowQuestionSelector(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Questions
                          </Button>
                        </div>

                        {(section.questions?.length || 0) > 0 ?
                          <div className="space-y-3">
                            {section.questions?.map((question, qIndex) =>
                              <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-sm font-medium">Q{qIndex + 1}.</span>
                                    <Badge variant="outline">{question.subject}</Badge>
                                    <Badge className={getDifficultyColor(question.difficulty)}>
                                      {question.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-700">{question.content}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() => handleRemoveQuestion(section.id, question.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div> :
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No questions added yet</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 cursor-pointer"
                              onClick={() => setShowQuestionSelector(true)}>
                              Add Questions
                            </Button>
                          </div>
                        }
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Add Questions Section */}
      <AddQuestionsSection
        examId={editingExam?.id}
        sectionId={sections[activeSection]?.id}
        section={sections[activeSection]}
        availableQuestions={questions}
        isOpen={showQuestionSelector}
        mode="dialog"
        onClose={() => setShowQuestionSelector(false)}
        onQuestionsAdded={(addedQuestions, totalQuestions) => {
          // Update the current section with the added questions
          const currentSection = sections[activeSection];
          if (currentSection) {
            const currentQuestions = currentSection.questions || [];
            const updatedQuestions = [...currentQuestions, ...addedQuestions];
            const updatedMarks = updatedQuestions.length * 1; // 1 mark per question

            handleUpdateSection(currentSection.id, {
              questions: updatedQuestions,
              marks: updatedMarks,
              questionsCount: updatedQuestions.length
            });

            toast({
              title: 'Success',
              description: `Added ${totalQuestions} questions to ${currentSection.name}`
            });
          }
        }}
      />
    </div>
  );
};

export default EnhancedExamBuilder;
