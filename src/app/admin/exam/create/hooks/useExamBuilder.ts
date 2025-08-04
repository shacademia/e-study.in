import { useState, useEffect, useCallback, useMemo } from 'react';
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
  loading: boolean;
  error: string | null;
  examForEdit: any;
  
  // Actions
  setActiveSection: (index: number) => void;
  setShowQuestionSelector: (show: boolean) => void;
  handleAddSection: () => void;
  handleDeleteSection: (sectionId: string) => void;
  handleUpdateSection: (sectionId: string, updates: Partial<ExamSection>) => void;
  handleRemoveQuestion: (sectionId: string, questionId: string) => void;
  handleAddQuestionsToSection: (sectionId: string, questions: Question[], marks?: number) => void;
  handleSaveExam: (status: 'draft' | 'published') => Promise<boolean>;
  resetExam: () => void;
  
  // Computed values
  getTotalQuestions: () => number;
  getTotalMarks: () => number;
  isValid: boolean;
  canPublish: boolean;
}

// Default states
const DEFAULT_EXAM_DETAILS: ExamDetails = {
  title: '',
  description: '',
  duration: 180,
  totalMarks: 0,
  instructions: '',
  status: 'draft',
  password: '',
  isPasswordRequired: false
};

const createDefaultSection = (index: number = 1): ExamSection => ({
  id: `section-${Date.now()}-${index}`,
  name: `Section ${index}`,
  description: '',
  questions: [],
  timeLimit: 0,
  marks: 0,
  examId: '',
  questionsCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const useExamBuilder = ({ 
  editingExam, 
  availableQuestions 
}: UseExamBuilderProps): UseExamBuilderReturn => {
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

  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examDetails, setExamDetails] = useState<ExamDetails>(DEFAULT_EXAM_DETAILS);
  const [sections, setSections] = useState<ExamSection[]>([createDefaultSection(1)]);

  // Use available questions from store or props
  const questions = useMemo(() => {
    return availableQuestions?.length ? availableQuestions : filteredQuestions;
  }, [availableQuestions, filteredQuestions]);

  // Computed values
  const getTotalQuestions = useCallback(() => {
    return sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
  }, [sections]);

  const getTotalMarks = useCallback(() => {
    return sections.reduce((total, section) => total + (section.marks || 0), 0);
  }, [sections]);

  const isValid = useMemo(() => {
    return examDetails.title.trim().length > 0 && sections.length > 0;
  }, [examDetails.title, sections.length]);

  const canPublish = useMemo(() => {
    return isValid && getTotalQuestions() > 0;
  }, [isValid, getTotalQuestions]);

  // Reset function
  const resetExam = useCallback(() => {
    setExamDetails(DEFAULT_EXAM_DETAILS);
    setSections([createDefaultSection(1)]);
    setActiveSection(0);
    setError(null);
    clearExamForEdit();
  }, [setActiveSection, clearExamForEdit]);

  // Load exam data for editing
  useEffect(() => {
    let isCancelled = false;

    const loadExamData = async () => {
      if (editingExam?.id) {
        try {
          setLoading(true);
          setError(null);
          await fetchExamForEdit(editingExam.id);
        } catch (err) {
          if (!isCancelled) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load exam data';
            setError(errorMessage);
            toast({
              title: 'Error Loading Exam',
              description: errorMessage,
              variant: 'destructive'
            });
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      } else {
        // Clear cached exam data when creating new exam
        clearExamForEdit();
      }
    };

    loadExamData();

    return () => {
      isCancelled = true;
    };
  }, [editingExam?.id, fetchExamForEdit, clearExamForEdit]);

  // Reset form when switching to create mode
  useEffect(() => {
    if (!editingExam?.id) {
      resetExam();
    }
  }, [editingExam?.id, resetExam]);

  // Update local state when exam data loads from store
  useEffect(() => {
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
      
      // Handle sections with complete question data
      if (examForEdit.sections && examForEdit.sections.length > 0) {
        const transformedSections: ExamSection[] = examForEdit.sections.map((section) => {
          const sectionQuestions: Question[] = section.questions?.map((esq) => ({
            ...esq.question,
            marks: esq.marks,
            order: esq.order
          } as Question & { marks: number; order: number })) || [];

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

  // Section management
  const handleAddSection = useCallback(() => {
    const newSection = createDefaultSection(sections.length + 1);
    setSections(prev => [...prev, newSection]);
  }, [sections.length]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections(prev => {
      const filtered = prev.filter((s) => s.id !== sectionId);
      // Ensure we always have at least one section
      return filtered.length > 0 ? filtered : [createDefaultSection(1)];
    });
    
    // Adjust active section if necessary
    setSections(current => {
      if (activeSection >= current.length) {
        setActiveSection(Math.max(0, current.length - 1));
      }
      return current;
    });
  }, [activeSection, setActiveSection]);

  const handleUpdateSection = useCallback((sectionId: string, updates: Partial<ExamSection>) => {
    setSections(prev => prev.map((s) =>
      s.id === sectionId ? { 
        ...s, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      } : s
    ));
  }, []);

  // Question management
  const handleRemoveQuestion = useCallback((sectionId: string, questionId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId && section.questions) {
        const updatedQuestions = section.questions.filter((q) => q.id !== questionId);
        const updatedMarks = updatedQuestions.reduce((total, q) => total + ((q as any).marks || 1), 0);
        
        return {
          ...section,
          questions: updatedQuestions,
          marks: updatedMarks,
          questionsCount: updatedQuestions.length,
          updatedAt: new Date().toISOString()
        };
      }
      return section;
    }));
  }, []);

  const handleAddQuestionsToSection = useCallback((
    sectionId: string, 
    questionsToAdd: Question[], 
    marksPerQuestion: number = 1
  ) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        const existingQuestionIds = new Set(section.questions?.map(q => q.id) || []);
        const newQuestions = questionsToAdd
          .filter(q => !existingQuestionIds.has(q.id))
          .map((q, index) => ({
            ...q,
            marks: marksPerQuestion,
            order: (section.questions?.length || 0) + index
          }));

        const updatedQuestions = [...(section.questions || []), ...newQuestions];
        const updatedMarks = updatedQuestions.reduce((total, q) => total + ((q as unknown).marks || 1), 0);

        return {
          ...section,
          questions: updatedQuestions,
          marks: updatedMarks,
          questionsCount: updatedQuestions.length,
          updatedAt: new Date().toISOString()
        };
      }
      return section;
    }));

    toast({
      title: 'Questions Added',
      description: `Successfully added ${questionsToAdd.length} questions to the section`,
    });
  }, []);

  // Save exam
  const handleSaveExam = useCallback(async (status: 'draft' | 'published'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Enhanced validation
      if (!examDetails.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Exam title is required",
          variant: "destructive",
        });
        return false;
      }

      if (sections.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one section is required",
          variant: "destructive",
        });
        return false;
      }

      const totalQuestions = getTotalQuestions();
      if (status === 'published' && totalQuestions === 0) {
        toast({
          title: "Validation Error",
          description: "Cannot publish exam without questions. Please add questions to sections.",
          variant: "destructive",
        });
        return false;
      }

      // Validate section data
      const invalidSections = sections.filter(s => !s.name.trim());
      if (invalidSections.length > 0) {
        toast({
          title: "Validation Error",
          description: "All sections must have a name",
          variant: "destructive",
        });
        return false;
      }

      const examData = {
        name: examDetails.title.trim(),
        description: examDetails.description.trim(),
        timeLimit: examDetails.duration,
        instructions: examDetails.instructions.trim(),
        password: examDetails.password,
        isPasswordProtected: examDetails.isPasswordRequired,
        isPublished: status === 'published',
        isDraft: status === 'draft',
      };

      // Transform sections for API
      const sectionsData = sections.map(section => ({
        id: section.id,
        name: section.name.trim(),
        description: section.description?.trim() || '',
        timeLimit: section.timeLimit || 0,
        questions: (section.questions || []).map((question, index) => ({
          questionId: question.id,
          order: (question as { order?: number }).order ?? index,
          marks: Number((question as { marks?: number }).marks) || question.positiveMarks || 1
        }))
      }));

      const payload = {
        exam: examData,
        sections: sectionsData
      };

      console.log('💾 Saving exam with payload:', payload);

      let result;
      if (editingExam && editingExam.id) {
        // Update existing exam
        result = await saveExamWithSections(editingExam.id, payload);
      } else {
        // Create new exam
        const newExam = await createExam(examData);
        
        if (newExam && newExam.id) {
          result = await saveExamWithSections(newExam.id, payload);
        } else {
          throw new Error('Failed to create exam - no ID returned');
        }
      }

      if (result) {
        toast({
          title: "Success",
          description: `Exam ${status === 'published' ? 'published' : 'saved as draft'} successfully!`,
        });
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Failed to save exam:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save exam';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    examDetails, 
    sections, 
    getTotalQuestions, 
    editingExam, 
    saveExamWithSections, 
    createExam
  ]);

  return {
    examDetails,
    setExamDetails,
    sections,
    setSections,
    questions,
    activeSection,
    showQuestionSelector,
    loading,
    error,
    examForEdit,
    
    // Actions
    setActiveSection,
    setShowQuestionSelector,
    handleAddSection,
    handleDeleteSection,
    handleUpdateSection,
    handleRemoveQuestion,
    handleAddQuestionsToSection,
    handleSaveExam,
    resetExam,
    
    // Computed values
    getTotalQuestions,
    getTotalMarks,
    isValid,
    canPublish
  };
};
