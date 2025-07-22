import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { questionService } from '@/services/question';
import { QuestionStore } from '../types';
import { QuestionDifficulty } from '@/constants/types';
import { isCacheValid, getCurrentTimestamp, safeAsync } from '../utils/cache';
import { toast } from '@/hooks/use-toast';

const initialState = {
  questions: [],
  filteredQuestions: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  filters: {
    search: '',
    subject: 'all',
    difficulty: 'all',
    topic: 'all'
  }
};

export const useQuestionStore = create<QuestionStore>()(
  devtools(
    persist(
      (set, get) => {
        // Apply filters to questions
        const applyFilters = () => {
          const state = get();
          const { questions, filters } = state;

          console.log('Applying filters:', { 
            totalQuestions: questions.length, 
            filters,
            firstQuestion: questions[0]?.subject 
          });

          const filtered = questions.filter((question) => {
            const matchesSearch = 
              filters.search === '' ||
              question.content.toLowerCase().includes(filters.search.toLowerCase()) ||
              question.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
              question.topic.toLowerCase().includes(filters.search.toLowerCase());

            const matchesSubject = 
              filters.subject === 'all' || 
              question.subject === filters.subject;

            const matchesDifficulty = 
              filters.difficulty === 'all' || 
              question.difficulty === filters.difficulty;

            const matchesTopic = 
              filters.topic === 'all' || 
              question.topic === filters.topic;

            const matches = matchesSearch && matchesSubject && matchesDifficulty && matchesTopic;
            
            if (!matches) {
              console.log('Question filtered out:', {
                content: question.content.substring(0, 50),
                subject: question.subject,
                difficulty: question.difficulty,
                topic: question.topic,
                matchesSearch,
                matchesSubject,
                matchesDifficulty,
                matchesTopic
              });
            }

            return matches;
          });

          console.log('Filter result:', { 
            originalCount: questions.length, 
            filteredCount: filtered.length 
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
              'Failed to fetch questions'
            );

            if (error) {
              set({ isLoading: false, error });
              toast({
                title: 'Error',
                description: error,
                variant: 'destructive'
              });
              return;
            }

            if (data?.data?.questions) {
              const questions = data.data.questions;
              set({
                questions,
                isLoading: false,
                error: null,
                lastFetch: getCurrentTimestamp()
              });
              
              // Apply filters after setting questions
              applyFilters();
            } else {
              set({
                isLoading: false,
                error: 'Invalid response format'
              });
            }
          },

          // Fetch questions with filters (network request)
          fetchQuestionsWithFilters: async (filters) => {
            set({ isLoading: true, error: null });

            // Convert filter types to match API expectations
            const apiFilters: {
              search?: string;
              subject?: string;
              difficulty?: QuestionDifficulty;
              topic?: string;
            } = {};

            if (filters.search) apiFilters.search = filters.search;
            if (filters.subject) apiFilters.subject = filters.subject;
            if (filters.difficulty) {
              // Validate and convert difficulty
              const validDifficulties: QuestionDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
              if (validDifficulties.includes(filters.difficulty.toUpperCase() as QuestionDifficulty)) {
                apiFilters.difficulty = filters.difficulty.toUpperCase() as QuestionDifficulty;
              }
            }
            if (filters.topic) apiFilters.topic = filters.topic;

            const { data, error } = await safeAsync(
              () => questionService.getAllQuestions(apiFilters),
              'Failed to fetch filtered questions'
            );

            if (error) {
              set({ isLoading: false, error });
              toast({
                title: 'Error',
                description: error,
                variant: 'destructive'
              });
              return;
            }

            if (data?.data?.questions) {
              const questions = data.data.questions;
              // Update both questions and filteredQuestions with network results
              set({
                questions: [...get().questions, ...questions.filter(q => !get().questions.find(existing => existing.id === q.id))], // Merge without duplicates
                filteredQuestions: questions,
                isLoading: false,
                error: null,
                lastFetch: getCurrentTimestamp()
              });
            } else {
              set({
                isLoading: false,
                error: 'Invalid response format'
              });
            }
          },

          // Set filters with smart fetching
          setFilters: async (newFilters) => {
            const state = get();
            const updatedFilters = { ...state.filters, ...newFilters };
            
            set({ filters: updatedFilters }, false, 'setFilters');

            // First try to apply filters locally
            applyFilters();
            
            // Check if we have meaningful results locally
            const currentState = get();
            const hasActiveFilters = updatedFilters.search !== '' || 
                                   updatedFilters.subject !== 'all' || 
                                   updatedFilters.difficulty !== 'all' || 
                                   updatedFilters.topic !== 'all';
            
            // If we have active filters but no results, or very few results, fetch from network
            if (hasActiveFilters && currentState.filteredQuestions.length === 0) {
              console.log('No local results found, fetching from network with filters:', updatedFilters);
              
              // Convert filters to API format (remove 'all' values)
              const apiFilters: {
                search?: string;
                subject?: string;
                difficulty?: string;
                topic?: string;
              } = {};
              
              if (updatedFilters.search && updatedFilters.search !== '') {
                apiFilters.search = updatedFilters.search;
              }
              if (updatedFilters.subject && updatedFilters.subject !== 'all') {
                apiFilters.subject = updatedFilters.subject;
              }
              if (updatedFilters.difficulty && updatedFilters.difficulty !== 'all') {
                apiFilters.difficulty = updatedFilters.difficulty;
              }
              if (updatedFilters.topic && updatedFilters.topic !== 'all') {
                apiFilters.topic = updatedFilters.topic;
              }

              // Only fetch if we have actual filter values
              if (Object.keys(apiFilters).length > 0) {
                await get().fetchQuestionsWithFilters(apiFilters);
              }
            }
          },

          // Reset filters
          resetFilters: () => {
            set({ 
              filters: initialState.filters,
              filteredQuestions: get().questions 
            });
          },

          // Clear error
          clearError: () => {
            set({ error: null });
          },

          // Reset store
          reset: () => {
            set(initialState);
          }
        };
      },
      {
        name: 'question-store',
        partialize: (state) => ({
          questions: state.questions,
          lastFetch: state.lastFetch,
          filters: state.filters
        }),
        version: 1
      }
    ),
    { name: 'QuestionStore' }
  )
);
