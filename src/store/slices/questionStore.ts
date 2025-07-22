import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
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
    subject: "ALL",
    difficulty: "ALL",
    topic: "ALL",
    search: "",
  },
};

export const useQuestionStore = create<QuestionStore>()(
  devtools(
    persist(
      (set, get) => {
        // Apply filters to questions
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
            const matchesSubject =
              subject === "ALL" || question.subject === subject;

            const matchesDifficulty =
              difficulty === "ALL" || question.difficulty === difficulty;

            const matchesTopic = topic === "ALL" || question.topic === topic;

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

          // Fetch questions with filters (network request)
          fetchQuestionsWithFilters: async (filters) => {
            set({ isLoading: true, error: null });

            // Convert filter types to match API expectations
            const apiFilters: {
              subject?: string;
              difficulty?: QuestionDifficulty;
              topic?: string;
            } = {};

            // if (filters.search) apiFilters.search = filters.search;
            if (filters.subject) apiFilters.subject = filters.subject;
            if (filters.difficulty) {
              // Validate and convert difficulty
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
            if (filters.topic) apiFilters.topic = filters.topic;

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
              // Update both questions and filteredQuestions with network results
              set({
                questions: [
                  ...get().questions,
                  ...questions.filter(
                    (q) =>
                      !get().questions.find((existing) => existing.id === q.id)
                  ),
                ], // Merge without duplicates
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

          // Set filters with smart fetching strategy
          setFilters: async (newFilters) => {
            const currentState = get();

            // Merge new filters
            const updatedFilters = { ...currentState.filters, ...newFilters };
            set({ filters: updatedFilters }, false, "setFilters");

            // Always apply local filters first
            applyFilters();

            // Check if we have no questions loaded at all
            if (currentState.questions.length === 0) {
              console.log("No questions loaded, fetching from network...");
              
              // Set loading state for network fetch
              set({ isLoading: true, error: null });
              
              // Only make network call if we have no data
              const hasActiveFilters =
                updatedFilters.subject !== "ALL" ||
                updatedFilters.difficulty !== "ALL" ||
                updatedFilters.topic !== "ALL" ||
                (updatedFilters.search && updatedFilters.search.trim() !== "");

              try {
                if (hasActiveFilters) {
                  const apiFilters: Record<string, string> = {};
                  if (updatedFilters.subject !== "ALL")
                    apiFilters.subject = updatedFilters.subject;
                  if (updatedFilters.difficulty !== "ALL")
                    apiFilters.difficulty = updatedFilters.difficulty;
                  if (updatedFilters.topic !== "ALL")
                    apiFilters.topic = updatedFilters.topic;
                  // Note: search is not passed to API, it's handled locally

                  await get().fetchQuestionsWithFilters(apiFilters);
                } else {
                  // No active filters, just fetch all questions
                  await get().fetchQuestions();
                }
              } catch (error) {
                console.error("Error fetching questions with filters:", error);
                set({ isLoading: false });
              }
            }
          },
          // Reset filters
          resetFilters: () => {
            set({
              filters: {
                subject: "ALL",
                difficulty: "ALL",
                topic: "ALL",
                search: "", // ✅ reset search
              },
              filteredQuestions: get().questions,
            });
          },

          // Clear error
          clearError: () => {
            set({ error: null });
          },

          // Create question
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
              // Add the new question to the store and re-apply filters
              const currentQuestions = get().questions;
              set({ 
                questions: [data, ...currentQuestions],
                lastFetch: getCurrentTimestamp()
              });
              
              // Re-apply filters to include the new question if it matches
              const state = get();
              const applyFilters = () => {
                const { questions, filters } = state;
                const { subject, difficulty, topic, search } = filters;

                const trimmedSearch = search?.trim().toLowerCase();

                const filtered = questions.filter((question) => {
                  const matchesSubject = subject === "ALL" || question.subject === subject;
                  const matchesDifficulty = difficulty === "ALL" || question.difficulty === difficulty;
                  const matchesTopic = topic === "ALL" || question.topic === topic;
                  const matchesSearch = !trimmedSearch ||
                    question.content?.toLowerCase().includes(trimmedSearch) ||
                    (Array.isArray(question.options) &&
                      question.options.some((option) =>
                        option?.toLowerCase().includes(trimmedSearch)
                      ));

                  return matchesSubject && matchesDifficulty && matchesTopic && matchesSearch;
                });

                set({ filteredQuestions: filtered });
              };
              
              applyFilters();
              return data;
            }
          },

          // Update question
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
              // Update the question in the store
              const currentQuestions = get().questions;
              const updatedQuestions = currentQuestions.map(q => 
                q.id === id ? data : q
              );
              
              set({ 
                questions: updatedQuestions,
                lastFetch: getCurrentTimestamp()
              });
              
              // Re-apply filters
              const state = get();
              const applyFilters = () => {
                const { questions, filters } = state;
                const { subject, difficulty, topic, search } = filters;

                const trimmedSearch = search?.trim().toLowerCase();

                const filtered = questions.filter((question) => {
                  const matchesSubject = subject === "ALL" || question.subject === subject;
                  const matchesDifficulty = difficulty === "ALL" || question.difficulty === difficulty;
                  const matchesTopic = topic === "ALL" || question.topic === topic;
                  const matchesSearch = !trimmedSearch ||
                    question.content?.toLowerCase().includes(trimmedSearch) ||
                    (Array.isArray(question.options) &&
                      question.options.some((option) =>
                        option?.toLowerCase().includes(trimmedSearch)
                      ));

                  return matchesSubject && matchesDifficulty && matchesTopic && matchesSearch;
                });

                set({ filteredQuestions: filtered });
              };
              
              applyFilters();
              return data;
            }
          },

          // Delete question
          deleteQuestion: async (id: string) => {
            const { data, error } = await safeAsync(
              () => questionService.deleteQuestion(id),
              "Failed to delete question"
            );

            if (error) {
              set({ error });
              
              // Don't show a toast here - let the component handle the error display
              // based on the specific error type and status code
              
              // Prepare error data with additional context if available
              const errorToThrow = new Error(error);
              
              // Create a simpler approach by directly checking for specific error types
              // This is safer than trying to cast the error object
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

            // Remove the question from the store
            const currentQuestions = get().questions;
            const updatedQuestions = currentQuestions.filter(q => q.id !== id);
            
            set({ 
              questions: updatedQuestions,
              lastFetch: getCurrentTimestamp()
            });
            
            // Re-apply filters
            const state = get();
            const applyFilters = () => {
              const { questions, filters } = state;
              const { subject, difficulty, topic, search } = filters;

              const trimmedSearch = search?.trim().toLowerCase();

              const filtered = questions.filter((question) => {
                const matchesSubject = subject === "ALL" || question.subject === subject;
                const matchesDifficulty = difficulty === "ALL" || question.difficulty === difficulty;
                const matchesTopic = topic === "ALL" || question.topic === topic;
                const matchesSearch = !trimmedSearch ||
                  question.content?.toLowerCase().includes(trimmedSearch) ||
                  (Array.isArray(question.options) &&
                    question.options.some((option) =>
                      option?.toLowerCase().includes(trimmedSearch)
                    ));

                return matchesSubject && matchesDifficulty && matchesTopic && matchesSearch;
              });

              set({ filteredQuestions: filtered });
            };
            
            applyFilters();
            return data;
          },

          // Reset store
          reset: () => {
            set(initialState);
          },
        };
      },
      {
        name: "question-store",
        partialize: (state) => ({
          questions: state.questions,
          lastFetch: state.lastFetch,
          filters: state.filters,
        }),
        version: 1,
      }
    ),
    { name: "QuestionStore" }
  )
);
