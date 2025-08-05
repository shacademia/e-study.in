'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Search,
    Filter,
    X,
    SortAsc,
    SortDesc,
    RefreshCw,
    Calendar,
    User,
    BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ExamSearchFilters {
    search: string;
    published: 'all' | 'true' | 'false';
    sortBy: 'createdAt' | 'updatedAt' | 'name';
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
}

interface ExamSearchAndFilterProps {
    filters: ExamSearchFilters;
    onFiltersChange: (filters: ExamSearchFilters) => void;
    onRefresh: () => void;
    isLoading?: boolean;
    totalResults?: number;
    className?: string;
}

export const ExamSearchAndFilter: React.FC<ExamSearchAndFilterProps> = ({
    filters,
    onFiltersChange,
    onRefresh,
    isLoading = false,
    totalResults = 0,
    className = '',
}) => {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchInput !== filters.search) {
                onFiltersChange({
                    ...filters,
                    search: searchInput,
                    page: 1, // Reset to first page when searching
                });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchInput, filters, onFiltersChange]);

    const handleFilterChange = useCallback((key: keyof ExamSearchFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value,
            page: key !== 'page' ? 1 : value, // Reset to first page unless changing page
        });
    }, [filters, onFiltersChange]);

    const clearAllFilters = useCallback(() => {
        const defaultFilters: ExamSearchFilters = {
            search: '',
            published: 'all',
            sortBy: 'createdAt',
            sortOrder: 'desc',
            page: 1,
            limit: 20,
        };
        setSearchInput('');
        onFiltersChange(defaultFilters);
    }, [onFiltersChange]);

    const hasActiveFilters = filters.search || filters.published !== 'all' ||
        filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc';

    const getPublishedLabel = (value: string) => {
        switch (value) {
            case 'true': return 'Published';
            case 'false': return 'Draft';
            default: return 'All Status';
        }
    };

    const getSortLabel = (sortBy: string, sortOrder: string) => {
        const field = sortBy === 'createdAt' ? 'Created' :
            sortBy === 'updatedAt' ? 'Updated' : 'Name';
        const order = sortOrder === 'asc' ? 'Oldest' : 'Newest';
        return `${field} (${order})`;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main Search and Quick Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search exams by name or description..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 pr-4"
                        disabled={isLoading}
                    />
                    {searchInput && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 cursor-pointer"
                            onClick={() => setSearchInput('')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Quick Status Filter */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={filters.published === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('published', 'all')}
                        disabled={isLoading}
                        className='cursor-pointer'
                    >
                        All
                    </Button>
                    <Button
                        variant={filters.published === 'true' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('published', 'true')}
                        disabled={isLoading}
                        className='cursor-pointer'
                    >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Published
                    </Button>
                    <Button
                        variant={filters.published === 'false' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('published', 'false')}
                        disabled={isLoading}
                        className='cursor-pointer'
                    >
                        Draft
                    </Button>
                </div>

                {/* Advanced Filters Toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    disabled={isLoading}
                    className='cursor-pointer'
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                            {[filters.search, filters.published !== 'all',
                            filters.sortBy !== 'createdAt', filters.sortOrder !== 'desc']
                                .filter(Boolean).length}
                        </Badge>
                    )}
                </Button>

                {/* Refresh Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className='cursor-pointer'
                    title="Refresh exams"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Advanced Filters</h3>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="text-xs cursor-pointer"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Sort By */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Sort By</label>
                            <Select
                                value={filters.sortBy}
                                onValueChange={(value: 'createdAt' | 'updatedAt' | 'name') =>
                                    handleFilterChange('sortBy', value)
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="createdAt">
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-2" />
                                            Created Date
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="updatedAt">
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-2" />
                                            Updated Date
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="name">
                                        <div className="flex items-center">
                                            <BookOpen className="h-3 w-3 mr-2" />
                                            Name
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Order */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Order</label>
                            <Select
                                value={filters.sortOrder}
                                onValueChange={(value: 'asc' | 'desc') =>
                                    handleFilterChange('sortOrder', value)
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">
                                        <div className="flex items-center">
                                            <SortDesc className="h-3 w-3 mr-2" />
                                            Newest First
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="asc">
                                        <div className="flex items-center">
                                            <SortAsc className="h-3 w-3 mr-2" />
                                            Oldest First
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Items Per Page */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Per Page</label>
                            <Select
                                value={filters.limit.toString()}
                                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 items</SelectItem>
                                    <SelectItem value="20">20 items</SelectItem>
                                    <SelectItem value="50">50 items</SelectItem>
                                    <SelectItem value="100">100 items</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Active filters:</span>

                    {filters.search && (
                        <Badge variant="secondary" className="text-xs">
                            Search: &quot;{filters.search}&quot;
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-3 w-3 p-0 cursor-pointer"
                                onClick={() => {
                                    setSearchInput('');
                                    handleFilterChange('search', '');
                                }}
                            >
                                <X className="h-2 w-2" />
                            </Button>
                        </Badge>
                    )}

                    {filters.published !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                            Status: {getPublishedLabel(filters.published)}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-3 w-3 p-0 cursor-pointer"
                                onClick={() => handleFilterChange('published', 'all')}
                            >
                                <X className="h-2 w-2" />
                            </Button>
                        </Badge>
                    )}

                    {(filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') && (
                        <Badge variant="secondary" className="text-xs">
                            Sort: {getSortLabel(filters.sortBy, filters.sortOrder)}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-3 w-3 p-0 cursor-pointer"
                                onClick={() => {
                                    handleFilterChange('sortBy', 'createdAt');
                                    handleFilterChange('sortOrder', 'desc');
                                }}
                            >
                                <X className="h-2 w-2" />
                            </Button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Results Summary */}
            {totalResults > 0 && (
                <div className="text-xs text-gray-500">
                    Showing {Math.min(filters.limit, totalResults)} of {totalResults} exams
                    {filters.search && ` matching "${filters.search}"`}
                </div>
            )}
        </div>
    );
};