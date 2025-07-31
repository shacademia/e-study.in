import { create } from "zustand";
import { devtools } from "zustand/middleware"; // Remove persist import
import { questionService } from "@/services/question";
import { QuestionStore } from "../types";
import { QuestionDifficulty, CreateQuestionRequest, UpdateQuestionRequest } from "@/constants/types";
import { isCacheValid, getCurrentTimestamp, safeAsync } from "../utils/cache";
import { toast } from "@/hooks/use-toast";

const initialState = {
  questions: [],
  filteredQuestions: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  filters: {
    subject: "",      
    difficulty: "",  
    topic: "",        
    search: "",
  },
};

export const useQuestionStore = create<QuestionStore>()(
  devtools(
    (set, get) => {
      // Extracted and fixed applyFilters function
      const applyFilters = () => {
        const state = get();
        const { questions, filters } = state;
        const { subject, difficulty, topic, search } = filters;

        console.log("Applying filters:", {
          totalQuestions: questions.length,
          filters,
          firstQuestion: questions[0]?.subject,
        });

        const trimmedSearch = search?.trim().toLowerCase();

        const filtered = questions.filter((question) => {
          // empty string means "show all"
          const matchesSubject = !subject || subject === "" || question.subject === subject;
          const matchesDifficulty = !difficulty || difficulty === "" || question.difficulty === difficulty;
          const matchesTopic = !topic || topic === "" || question.topic === topic;

          const matchesSearch =
            !trimmedSearch ||
            question.content?.toLowerCase().includes(trimmedSearch) ||
            (Array.isArray(question.options) &&
              question.options.some((option) =>
                option?.toLowerCase().includes(trimmedSearch)
              ));

          return (
            matchesSubject &&
            matchesDifficulty &&
            matchesTopic &&
            matchesSearch
          );
        });

        console.log("Filter result:", {
          originalCount: questions.length,
          filteredCount: filtered.length,
        });

        set({ filteredQuestions: filtered });
      };

      return {
        ...initialState,

        // Fetch all questions with caching
        fetchQuestions: async () => {
          const state = get();

          // Check if cache is valid
          if (isCacheValid(state.lastFetch) && state.questions.length > 0) {
            console.log("Using cached questions");
            applyFilters(); // Apply filters to cached data
            return;
          }

          set({ isLoading: true, error: null });

          const { data, error } = await safeAsync(
            () => questionService.getAllQuestions(),
            "Failed to fetch questions"
          );

          if (error) {
            set({ isLoading: false, error });
            toast({
              title: "Error",
              description: error,
              variant: "destructive",
            });
            return;
          }

          if (data?.data?.questions) {
            const questions = data.data.questions;
            set({
              questions,
              isLoading: false,
              error: null,
              lastFetch: getCurrentTimestamp(),
            });

            // Apply filters after setting questions
            applyFilters();
          } else {
            set({
              isLoading: false,
              error: "Invalid response format",
            });
          }
        },

        // ... rest of your store methods remain the same

        fetchQuestionsWithFilters: async (filters) => {
          set({ isLoading: true, error: null });

          const apiFilters: {
            subject?: string;
            difficulty?: QuestionDifficulty;
            topic?: string;
          } = {};

          if (filters.subject && filters.subject !== "") apiFilters.subject = filters.subject;
          if (filters.difficulty && filters.difficulty !== "") {
            const validDifficulties: QuestionDifficulty[] = [
              "EASY",
              "MEDIUM",
              "HARD",
            ];
            if (
              validDifficulties.includes(
                filters.difficulty.toUpperCase() as QuestionDifficulty
              )
            ) {
              apiFilters.difficulty =
                filters.difficulty.toUpperCase() as QuestionDifficulty;
            }
          }
          if (filters.topic && filters.topic !== "") apiFilters.topic = filters.topic;

          const { data, error } = await safeAsync(
            () => questionService.getAllQuestions(apiFilters),
            "Failed to fetch filtered questions"
          );

          if (error) {
            set({ isLoading: false, error });
            toast({
              title: "Error",
              description: error,
              variant: "destructive",
            });
            return;
          }

          if (data?.data?.questions) {
            const questions = data.data.questions;
            set({
              questions: [
                ...get().questions,
                ...questions.filter(
                  (q) =>
                    !get().questions.find((existing) => existing.id === q.id)
                ),
              ],
              filteredQuestions: questions,
              isLoading: false,
              error: null,
              lastFetch: getCurrentTimestamp(),
            });
          } else {
            set({
              isLoading: false,
              error: "Invalid response format",
            });
          }
        },

        setFilters: async (newFilters) => {
          const currentState = get();

          const updatedFilters = { ...currentState.filters, ...newFilters };
          set({ filters: updatedFilters }, false, "setFilters");

          applyFilters();

          if (currentState.questions.length === 0) {
            console.log("No questions loaded, fetching from network...");
            
            set({ isLoading: true, error: null });
            
            const hasActiveFilters =
              (updatedFilters.subject && updatedFilters.subject !== "") ||
              (updatedFilters.difficulty && updatedFilters.difficulty !== "") ||
              (updatedFilters.topic && updatedFilters.topic !== "") ||
              (updatedFilters.search && updatedFilters.search.trim() !== "");

            try {
              if (hasActiveFilters) {
                const apiFilters: Record<string, string> = {};
                if (updatedFilters.subject && updatedFilters.subject !== "")
                  apiFilters.subject = updatedFilters.subject;
                if (updatedFilters.difficulty && updatedFilters.difficulty !== "")
                  apiFilters.difficulty = updatedFilters.difficulty;
                if (updatedFilters.topic && updatedFilters.topic !== "")
                  apiFilters.topic = updatedFilters.topic;

                await get().fetchQuestionsWithFilters(apiFilters);
              } else {
                await get().fetchQuestions();
              }
            } catch (error) {
              console.error("Error fetching questions with filters:", error);
              set({ isLoading: false });
            }
          }
        },

        resetFilters: () => {
          const resetFilters = {
            subject: "",
            difficulty: "",
            topic: "",
            search: "",
          };
          
          set({ filters: resetFilters });
          applyFilters();
        },

        clearError: () => {
          set({ error: null });
        },

        createQuestion: async (questionData: CreateQuestionRequest) => {
          const { data, error } = await safeAsync(
            () => questionService.createQuestion(questionData),
            "Failed to create question"
          );

          if (error) {
            set({ error });
            toast({
              title: "Error",
              description: error,
              variant: "destructive",
            });
            throw new Error(error);
          }

          if (data) {
            const currentQuestions = get().questions;
            set({ 
              questions: [data, ...currentQuestions],
              lastFetch: getCurrentTimestamp()
            });
            
            applyFilters();
            return data;
          }
        },

        updateQuestion: async (id: string, updates: UpdateQuestionRequest) => {
          const { data, error } = await safeAsync(
            () => questionService.updateQuestion(id, updates),
            "Failed to update question"
          );

          if (error) {
            set({ error });
            toast({
              title: "Error",
              description: error,
              variant: "destructive",
            });
            throw new Error(error);
          }

          if (data) {
            const currentQuestions = get().questions;
            const updatedQuestions = currentQuestions.map(q => 
              q.id === id ? data : q
            );
            
            set({ 
              questions: updatedQuestions,
              lastFetch: getCurrentTimestamp()
            });
            
            applyFilters();
            return data;
          }
        },

        deleteQuestion: async (id: string) => {
          const { data, error } = await safeAsync(
            () => questionService.deleteQuestion(id),
            "Failed to delete question"
          );

          if (error) {
            set({ error });
            
            const errorToThrow = new Error(error);
            
            if (typeof error === 'string') {
              if (error.includes('used in exams') || error.includes('QUESTION_IN_USE') || error.includes('409')) {
                // @ts-expect-error - Adding custom property to Error object
                errorToThrow.code = 'QUESTION_IN_USE';
                // @ts-expect-error - Adding custom property to Error object
                errorToThrow.statusCode = 409;
              }
            }
            
            throw errorToThrow;
          }

          const currentQuestions = get().questions;
          const updatedQuestions = currentQuestions.filter(q => q.id !== id);
          
          set({ 
            questions: updatedQuestions,
            lastFetch: getCurrentTimestamp()
          });
          
          applyFilters();
          return data;
        },

        reset: () => {
          set(initialState);
        },
      };
    },
    { name: "QuestionStore" }
  )
);
