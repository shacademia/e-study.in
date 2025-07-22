import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UIStore } from '../types';
import { generateId } from '../utils/cache';

const initialState = {
  examBuilder: {
    activeSection: 0,
    selectedQuestions: new Set<string>(),
    showQuestionSelector: false,
  },
  notifications: [],
  modals: {},
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Exam Builder Actions
        setActiveSection: (index) => {
          set((state) => ({
            examBuilder: {
              ...state.examBuilder,
              activeSection: index
            }
          }));
        },

        toggleQuestionSelection: (questionId) => {
          set((state: UIStore) => {
            // Ensure selectedQuestions is a Set
            const currentSelection = state.examBuilder.selectedQuestions instanceof Set 
              ? state.examBuilder.selectedQuestions 
              : new Set(Array.isArray(state.examBuilder.selectedQuestions) 
                  ? state.examBuilder.selectedQuestions 
                  : []);
              
            const newSet = new Set<string>(currentSelection);
            if (newSet.has(questionId)) {
              newSet.delete(questionId);
            } else {
              newSet.add(questionId);
            }
            
            return {
              examBuilder: {
                ...state.examBuilder,
                selectedQuestions: newSet
              }
            };
          });
        },

        clearSelectedQuestions: () => {
          set((state) => ({
            examBuilder: {
              ...state.examBuilder,
              selectedQuestions: new Set<string>()
            }
          }));
        },

        setShowQuestionSelector: (show) => {
          set((state) => ({
            examBuilder: {
              ...state.examBuilder,
              showQuestionSelector: show
            }
          }));
        },

        // Notification Actions
        addNotification: (notification) => {
          const id = generateId();
          const timestamp = Date.now();
          
          set((state) => ({
            notifications: [
              ...state.notifications,
              { ...notification, id, timestamp }
            ]
          }));

          // Auto-remove notification after 5 seconds
          setTimeout(() => {
            get().removeNotification(id);
          }, 5000);
        },

        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        },

        clearNotifications: () => {
          set({ notifications: [] });
        },

        // Modal Actions
        openModal: (modalName) => {
          set((state) => ({
            modals: {
              ...state.modals,
              [modalName]: true
            }
          }));
        },

        closeModal: (modalName) => {
          set((state) => ({
            modals: {
              ...state.modals,
              [modalName]: false
            }
          }));
        },

        closeAllModals: () => {
          set({ modals: {} });
        }
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          examBuilder: {
            activeSection: state.examBuilder.activeSection,
            selectedQuestions: Array.from(state.examBuilder.selectedQuestions), // Convert Set to Array for persistence
            showQuestionSelector: false // Don't persist modal states
          }
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.examBuilder?.selectedQuestions && Array.isArray(state.examBuilder.selectedQuestions)) {
            // Convert array back to Set after rehydration
            state.examBuilder.selectedQuestions = new Set(state.examBuilder.selectedQuestions as string[]);
          }
        },
        version: 1
      }
    ),
    { name: 'UIStore' }
  )
);
