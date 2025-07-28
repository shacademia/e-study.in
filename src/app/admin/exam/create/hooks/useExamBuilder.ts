import { useState, useEffect, useCallback } from 'react';
import { Exam, ExamSection, Question } from '@/constants/types';
import { 
  useExamForEdit, 
  useExamActions,
  useFilteredQuestions,
  useExamBuilderUI,
  useStoreInitialization
} from '@/store';
import { toast } from '@/hooks/use-toast';

interface ExamDetails {
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  status: 'draft' | 'published';
  password: string;
  isPasswordRequired: boolean;
}

interface UseExamBuilderProps {
  editingExam?: Partial<Exam>;
  availableQuestions?: Question[];
}

interface UseExamBuilderReturn {
  examDetails: ExamDetails;
  setExamDetails: React.Dispatch<React.SetStateAction<ExamDetails>>;
  sections: ExamSection[];
  setSections: React.Dispatch<React.SetStateAction<ExamSection[]>>;
  questions: Question[];
  activeSection: number;
  showQuestionSelector: boolean;
  setActiveSection: (index: number) => void;
  setShowQuestionSelector: (show: boolean) => void;
  handleAddSection: () => void;
  handleDeleteSection: (sectionId: string) => void;
  handleUpdateSection: (sectionId: string, updates: Partial<ExamSection>) => void;
  handleRemoveQuestion: (sectionId: string, questionId: string) => void;
  handleSaveExam: (status: 'draft' | 'published') => Promise<void>;
  getTotalQuestions: () => number;
  getTotalMarks: () => number;
  loading: boolean;
  examForEdit: any;
}

export const useExamBuilder = ({ editingExam, availableQuestions }: UseExamBuilderProps): UseExamBuilderReturn => {
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

  const [loading, setLoading] = useState(false);

  // Local state for exam details and sections
  const [examDetails, setExamDetails] = useState<ExamDetails>({
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

  const handleAddSection = useCallback(() => {
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
    setSections(prev => [...prev, newSection]);
  }, [sections.length]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections(prev => prev.filter((s) => s.id !== sectionId));
    if (activeSection >= sections.length - 1) {
      setActiveSection(Math.max(0, sections.length - 2));
    }
  }, [activeSection, sections.length, setActiveSection]);

  const handleUpdateSection = useCallback((sectionId: string, updates: Partial<ExamSection>) => {
    setSections(prev => prev.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    ));
  }, []);

  const handleRemoveQuestion = useCallback((sectionId: string, questionId: string) => {
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
  }, [sections, handleUpdateSection]);

  const getTotalQuestions = useCallback(() => {
    return sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
  }, [sections]);

  const getTotalMarks = useCallback(() => {
    return sections.reduce((total, section) => total + (section.marks || 0), 0);
  }, [sections]);

  const handleSaveExam = useCallback(async (status: 'draft' | 'published') => {
    try {
      setLoading(true);
      
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
          description: "Cannot publish exam without questions. Please add questions to sections.",
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
          order: (question as { order?: number }).order ?? index,
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
        await saveExamWithSections(editingExam.id, payload);
        toast({
          title: "Success",
          description: `Exam ${status === 'published' ? 'published' : 'saved as draft'} successfully!`,
        });
      } else {
        // Create new exam first, then save with sections
        console.log('🆕 Creating new exam with data:', examData);
        const newExam = await createExam(examData);
        
        if (newExam && newExam.id) {
          console.log('✅ Exam created, now saving sections:', newExam.id);
          const result = await saveExamWithSections(newExam.id, payload);
          if (result) {
            toast({
              title: "Success",
              description: `Exam ${status === 'published' ? 'created and published' : 'created as draft'} successfully!`,
            });
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
    } finally {
      setLoading(false);
    }
  }, [examDetails, sections, getTotalQuestions, editingExam, saveExamWithSections, createExam]);

  return {
    examDetails,
    setExamDetails,
    sections,
    setSections,
    questions,
    activeSection,
    showQuestionSelector,
    setActiveSection,
    setShowQuestionSelector,
    handleAddSection,
    handleDeleteSection,
    handleUpdateSection,
    handleRemoveQuestion,
    handleSaveExam,
    getTotalQuestions,
    getTotalMarks,
    loading,
    examForEdit
  };
};
