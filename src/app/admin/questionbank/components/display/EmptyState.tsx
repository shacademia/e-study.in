'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Search } from 'lucide-react';

interface EmptyStateProps {
  hasQuestions: boolean;
  onAddQuestion: () => void;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasQuestions,
  onAddQuestion,
  onClearFilters
}) => {
  if (hasQuestions) {
    // No matching questions (filtered results)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching questions</h3>
          <p className="text-muted-foreground text-center mb-4">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          {onClearFilters && (
            <Button variant="outline" onClick={onClearFilters} className="cursor-pointer">
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // No questions at all
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No questions found</h3>
        <p className="text-muted-foreground text-center mb-4">
          Get started by adding your first question.
        </p>
        <Button onClick={onAddQuestion} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </CardContent>
    </Card>
  );
};
