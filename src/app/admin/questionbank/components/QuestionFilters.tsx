'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Tags, Filter } from 'lucide-react';

interface QuestionFiltersProps {
  filters: {
    difficulty?: string;
    subject?: string;
    topic?: string;
    tags?: string[];
    [key: string]: string | string[] | number | boolean | undefined;
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
  // Count active filters
  const activeFilterCount = [
    filters.difficulty,
    filters.subject,
    filters.topic,
    ...(filters.tags || [])
  ].filter(Boolean).length;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold">Filter Questions</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            disabled={activeFilterCount === 0}
            className="cursor-pointer"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select 
              value={filters.difficulty || ''} 
              onValueChange={(value) => onFilterChange('difficulty', value)}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Any difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any difficulty</SelectItem>
                <SelectItem value="EASY">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Easy
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="HARD">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Hard
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select 
              value={filters.subject || ''} 
              onValueChange={(value) => onFilterChange('subject', value)}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Any subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any subject</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select 
              value={filters.topic || ''} 
              onValueChange={(value) => onFilterChange('topic', value)}
            >
              <SelectTrigger id="topic">
                <SelectValue placeholder="Any topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any topic</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {allTags.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Tags className="h-4 w-4 text-gray-600" />
              <Label>Tags</Label>
              {filters.tags && filters.tags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.tags.length} selected
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant={filters.tags?.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onTagFilter(tag)}
                >
                  {tag}
                  {filters.tags?.includes(tag) && (
                    <CheckCircle className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filter Summary */}
        {activeFilterCount > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Active Filters:</span>
              <div className="flex flex-wrap gap-1">
                {filters.difficulty && (
                  <Badge variant="secondary" className="text-xs bg-blue-100">
                    {filters.difficulty}
                  </Badge>
                )}
                {filters.subject && (
                  <Badge variant="secondary" className="text-xs bg-blue-100">
                    {filters.subject}
                  </Badge>
                )}
                {filters.topic && (
                  <Badge variant="secondary" className="text-xs bg-blue-100">
                    {filters.topic}
                  </Badge>
                )}
                {filters.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-blue-100">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
