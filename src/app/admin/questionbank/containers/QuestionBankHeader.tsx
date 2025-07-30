'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  Upload,
  Tags,
  X
} from 'lucide-react';

interface QuestionBankHeaderProps {
  // Navigation
  onBack: () => void;
  
  // Search
  searchText: string;
  isSearching: boolean;
  onSearchChange: (value: string) => void;
  
  // View controls
  viewMode: 'grid' | 'list';
  onViewModeChange: () => void;
  
  // Filters
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  filters: {
    subject: string;
    topic: string;
    difficulty: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  
  // Filter data
  derivedData: {
    subjects: string[];
    topics: string[];
    allTags: string[];
  };
  
  // Tag filtering
  selectedTags: string[];
  tagSearchTerm: string;
  filteredTagsForDisplay: string[];
  onToggleTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClearAllTags: () => void;
  onTagSearchChange: (value: string) => void;
  
  // Actions
  onAddQuestion: () => void;
  onBulkUpload: () => void;
  
  // Statistics
  displayQuestionsCount: number;
}

export const QuestionBankHeader: React.FC<QuestionBankHeaderProps> = ({
  // Navigation
  onBack,
  
  // Search
  searchText,
  isSearching,
  onSearchChange,
  
  // View controls
  viewMode,
  onViewModeChange,
  
  // Filters
  showFilters,
  onToggleFilters,
  activeFilterCount,
  filters,
  onFilterChange,
  onClearFilters,
  
  // Filter data
  derivedData,
  
  // Tag filtering
  selectedTags,
  tagSearchTerm,
  filteredTagsForDisplay,
  onToggleTag,
  onRemoveTag,
  onClearAllTags,
  onTagSearchChange,
  
  // Actions
  onAddQuestion,
  onBulkUpload,
  
  // Statistics
  displayQuestionsCount
}) => {
  return (
    <div className="border-b bg-white p-4 shadow-sm">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Question Bank</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onBulkUpload}
            className="hidden sm:flex cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button
            onClick={onAddQuestion}
            className="gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Question</span>
          </Button>
        </div>
      </div>

      {/* Search and Controls Row */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search questions..."
            className="pl-9"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-2 top-2">
              <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="sm:w-auto w-full justify-center gap-1 cursor-pointer"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onViewModeChange}
          className="sm:w-auto w-full justify-center gap-1 cursor-pointer"
        >
          {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
        </Button>
      </div>

      {/* Enhanced Filter Panel */}
      {showFilters && (
        <div className="mt-4 border rounded-md p-4 bg-gray-50 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <h3 className="font-medium">Filter Questions</h3>
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
              className="h-7 text-xs cursor-pointer"
              disabled={activeFilterCount === 0}
            >
              Clear All
            </Button>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="subject-filter">Subject</Label>
              <Select
                value={filters.subject || 'ALL'}
                onValueChange={(value) => onFilterChange('subject', value === 'ALL' ? '' : value)}
              >
                <SelectTrigger id="subject-filter">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  {derivedData.subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="topic-filter">Topic</Label>
              <Select
                value={filters.topic || 'ALL'}
                onValueChange={(value) => onFilterChange('topic', value === 'ALL' ? '' : value)}
              >
                <SelectTrigger id="topic-filter">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Topics</SelectItem>
                  {derivedData.topics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty-filter">Difficulty</Label>
              <Select
                value={filters.difficulty || 'ALL'}
                onValueChange={(value) => onFilterChange('difficulty', value === 'ALL' ? '' : value)}
              >
                <SelectTrigger id="difficulty-filter">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Difficulties</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags Filter Section */}
          {derivedData.allTags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Filter by Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedTags.length} selected
                    </Badge>
                  )}
                </Label>
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAllTags}
                    className="h-6 px-2 text-xs cursor-pointer"
                  >
                    Clear Tags
                  </Button>
                )}
              </div>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-blue-50 rounded-md border">
                  <span className="text-xs text-blue-700 font-medium">Selected:</span>
                  {selectedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                      onClick={() => onRemoveTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tag Search */}
              {derivedData.allTags.length > 10 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400" />
                  <Input
                    placeholder="Search tags..."
                    value={tagSearchTerm}
                    onChange={(e) => onTagSearchChange(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              )}

              {/* Available Tags */}
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {filteredTagsForDisplay.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105 focus:ring-2 focus:ring-blue-500"
                    onClick={() => onToggleTag(tag)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleTag(tag);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedTags.includes(tag)}
                  >
                    <Tags className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {derivedData.allTags.length > 20 && !tagSearchTerm && (
                  <Badge variant="outline" className="cursor-default text-gray-500">
                    +{derivedData.allTags.length - 20} more tags available
                  </Badge>
                )}
              </div>

              {/* Tag Statistics */}
              {selectedTags.length > 0 && (
                <div className="text-xs text-gray-600">
                  Showing {displayQuestionsCount} questions with selected tags
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
