'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface QuestionFiltersProps {
  filters: {
    subject: string;
    difficulty: string;
    topic: string;
    search: string;
  };
  subjects: string[];
  topics: string[];
  allTags: string[];
  onFilterChange: (key: string, value: string) => void;
  onTagFilter: (tag: string) => void;
  onClearFilters: () => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  subjects,
  topics,
  allTags,
  onFilterChange,
  onTagFilter,
  onClearFilters
}) => {
  const hasActiveFilters = filters.subject !== 'all' || 
                          filters.difficulty !== 'all' || 
                          filters.topic !== 'all' ||
                          filters.search !== '';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="cursor-pointer text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Subject
              </label>
              <Select
                value={filters.subject}
                onValueChange={(value) => onFilterChange('subject', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Difficulty
              </label>
              <Select
                value={filters.difficulty}
                onValueChange={(value) => onFilterChange('difficulty', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Topic
              </label>
              <Select
                value={filters.topic}
                onValueChange={(value) => onFilterChange('topic', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 20).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => onTagFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
