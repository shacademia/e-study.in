'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  X
} from 'lucide-react';
import { ViewMode } from '../types';

interface QuestionBankHeaderProps {
  searchText: string;
  viewMode: ViewMode;
  isSearching: boolean;
  showFilters: boolean;
  questionsCount: number;
  filteredCount: number;
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleFilters: () => void;
  onAddQuestion: () => void;
  onRefresh: () => void;
}

export const QuestionBankHeader: React.FC<QuestionBankHeaderProps> = ({
  searchText,
  viewMode,
  isSearching,
  showFilters,
  questionsCount,
  filteredCount,
  onBack,
  onSearchChange,
  onViewModeChange,
  onToggleFilters,
  onAddQuestion,
  onRefresh
}) => {
  return (
    <div className="space-y-4">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <Badge variant="secondary">
            {filteredCount === questionsCount 
              ? `${questionsCount} questions`
              : `${filteredCount} of ${questionsCount} questions`
            }
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
            className="cursor-pointer"
          >
            {viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="cursor-pointer"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters && <X className="h-3 w-3 ml-1" />}
          </Button>
          <Button onClick={onAddQuestion} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Search row */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search questions by content, subject, topic, or tags..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};
