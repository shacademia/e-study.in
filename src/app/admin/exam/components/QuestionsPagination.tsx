'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';

interface QuestionsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const QuestionsPagination: React.FC<QuestionsPaginationProps> = ({
  currentPage,
  totalPages,
  totalQuestions,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  className = '',
}) => {
  console.log(`🔢 QuestionsPagination props:`, { currentPage, totalPages, totalQuestions, itemsPerPage });
  // Don't show pagination if there are no questions
  if (totalQuestions === 0) {
    return null;
  }

  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalQuestions);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Show pages 2-5 and ellipsis
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show ellipsis and last 5 pages
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show ellipsis, current page area, ellipsis
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results info and items per page */}
        <div className="flex flex-col sm:flex-row items-center gap-4 order-2 sm:order-1">
          <div className="text-sm text-gray-600">
            Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{' '}
            {totalQuestions.toLocaleString()} questions
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-center gap-1 order-1 sm:order-2">
          {/* First page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage || isLoading}
            className="hidden sm:flex px-3"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage || isLoading}
            title="Previous page"
            className="px-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {pageNumbers.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <div key={`ellipsis-${index}`} className="px-2">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>
                );
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    console.log(`🖱️ Page button clicked: ${page}`);
                    onPageChange(page);
                  }}
                  disabled={isLoading}
                  className="min-w-[2.5rem] h-8"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage || isLoading}
            title="Next page"
            className="px-3"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage || isLoading}
            className="hidden sm:flex px-3"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page info for mobile */}
        <div className="text-xs text-gray-500 sm:hidden order-3">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
};