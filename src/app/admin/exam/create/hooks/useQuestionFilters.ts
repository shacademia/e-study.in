import { useState, useCallback, useMemo } from 'react';
import { Question } from '@/constants/types';

export interface QuestionFilters {
  subject: string;
  difficulty: string;
  topic: string;
  tags: string[];
}

const defaultFilters: QuestionFilters = {
  subject: 'all',
  difficulty: 'all',
  topic: 'all',
  tags: []
};

export const useQuestionFilters = (questions: Question[]) => {
  const [filters, setFilters] = useState<QuestionFilters>(defaultFilters);

  const updateFilter = useCallback((key: keyof QuestionFilters, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filterOptions = useMemo(() => {
    // For backend-optimized filtering, we need to be more comprehensive
    // since the current questions array might be filtered and not contain all options
    const currentOptions = {
      subjects: [...new Set(questions.map(q => q.subject))].filter(Boolean),
      topics: [...new Set(questions.map(q => q.topic))].filter(Boolean),
      allTags: [...new Set(questions.flatMap(q => q.tags))].filter(Boolean),
      difficulties: ['EASY', 'MEDIUM', 'HARD'] as const
    };

    // Note: In a production app, you might want to fetch these from a separate API
    // to get all available options regardless of current filters
    return currentOptions;
  }, [questions]);

  return {
    filters,
    updateFilter,
    toggleTag,
    clearFilters,
    filterOptions
  };
};
