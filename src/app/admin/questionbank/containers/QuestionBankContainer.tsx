'use client';

import React from 'react';
import { QuestionBankHeader } from '../components/QuestionBankHeader';
import { QuestionFilters } from '../components/QuestionFilters';
import { QuestionGrid } from '../components/display/QuestionGrid';
import { QuestionList } from '../components/display/QuestionList';
import { EmptyState } from '../components/display/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { AddQuestionDialog } from '../components/dialogs/AddQuestionDialog';
import { EditQuestionDialog } from '../components/dialogs/EditQuestionDialog';
import { BulkUploadDialog } from '../components/dialogs/BulkUploadDialog';
import { useQuestionBankData } from '../hooks/useQuestionBankData';
import { useQuestionBankActions } from '../hooks/useQuestionBankActions';
import { useQuestionBankUI } from '../hooks/useQuestionBankUI';
import { QuestionBankProps } from '../types';
import { Question } from '@/constants/types';

/**
 * Main container component for the Question Bank module
 * Orchestrates all question bank functionality including:
 * - Data management and API integration
 * - User interactions and state management
 * - UI coordination and component composition
 */
export const QuestionBankContainer: React.FC<QuestionBankProps> = ({
  onBack,
  onSelectQuestions,
  multiSelect = false,
  preSelectedQuestions = []
}) => {
  // Data hooks
  const {
    questions,
    filteredQuestions,
    isLoading,
    error,
    subjects,
    topics,
    allTags,
    filters,
    refreshQuestions
  } = useQuestionBankData();

  // Action hooks
  const {
    newQuestion,
    setNewQuestion,
    editingQuestion,
    setEditingQuestion,
    searchText,
    isSearching,
    isCreating,
    isUpdating,
    operationError,
    handleAddQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleDuplicateQuestion,
    clearOperationError,
    handlers
  } = useQuestionBankActions();

  // UI state hooks
  const {
    viewMode,
    showAddQuestion,
    showFilters,
    showBulkUpload,
    selectedQuestions,
    uiHandlers
  } = useQuestionBankUI({ 
    multiSelect, 
    preSelectedQuestions,
    onSelectQuestions 
  });

  // Wrapper functions to match component interfaces
  const handleDeleteQuestionWrapper = async (questionId: string): Promise<void> => {
    await handleDeleteQuestion(questionId);
  };

  const handleDuplicateQuestionWrapper = async (questionId: string): Promise<void> => {
    await handleDuplicateQuestion(questionId);
  };

  // Enhanced UI handlers that coordinate with actions
  const enhancedUIHandlers = {
    ...uiHandlers,
    openEditDialog: (question: Question) => {
      setEditingQuestion(question);
    },
    closeEditDialog: () => {
      setEditingQuestion(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <QuestionBankHeader
          searchText={searchText}
          viewMode={viewMode}
          isSearching={isSearching}
          showFilters={showFilters}
          questionsCount={questions.length}
          filteredCount={filteredQuestions.length}
          onBack={onBack}
          onSearchChange={handlers.handleSearchChange}
          onViewModeChange={enhancedUIHandlers.setViewMode}
          onToggleFilters={enhancedUIHandlers.toggleFilters}
          onAddQuestion={enhancedUIHandlers.openAddDialog}
          onRefresh={refreshQuestions}
        />
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <QuestionBankHeader
          searchText={searchText}
          viewMode={viewMode}
          isSearching={isSearching}
          showFilters={showFilters}
          questionsCount={questions.length}
          filteredCount={filteredQuestions.length}
          onBack={onBack}
          onSearchChange={handlers.handleSearchChange}
          onViewModeChange={enhancedUIHandlers.setViewMode}
          onToggleFilters={enhancedUIHandlers.toggleFilters}
          onAddQuestion={enhancedUIHandlers.openAddDialog}
          onRefresh={refreshQuestions}
        />
        <ErrorAlert 
          error={error} 
          onRetry={refreshQuestions}
          onDismiss={() => {/* Handle error dismissal */}}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <QuestionBankHeader
        searchText={searchText}
        viewMode={viewMode}
        isSearching={isSearching}
        showFilters={showFilters}
        questionsCount={questions.length}
        filteredCount={filteredQuestions.length}
        onBack={onBack}
        onSearchChange={handlers.handleSearchChange}
        onViewModeChange={enhancedUIHandlers.setViewMode}
        onToggleFilters={enhancedUIHandlers.toggleFilters}
        onAddQuestion={enhancedUIHandlers.openAddDialog}
        onRefresh={refreshQuestions}
      />

      {/* Operation Error Display */}
      {operationError && (
        <ErrorAlert 
          error={operationError}
          onDismiss={() => clearOperationError()}
        />
      )}

      {/* Filters Section */}
      {showFilters && (
        <QuestionFilters
          filters={filters}
          subjects={subjects}
          topics={topics}
          allTags={allTags}
          onFilterChange={handlers.handleFilterChange}
          onTagFilter={handlers.handleTagFilter}
          onClearFilters={handlers.clearFilters}
        />
      )}

      {/* Main Content */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          hasQuestions={questions.length > 0}
          onAddQuestion={enhancedUIHandlers.openAddDialog}
          onClearFilters={handlers.clearFilters}
        />
      ) : (
        <>
          {/* Question Display */}
          {viewMode === 'grid' ? (
            <QuestionGrid
              questions={filteredQuestions}
              selectedQuestions={selectedQuestions}
              multiSelect={multiSelect}
              onSelectQuestion={enhancedUIHandlers.toggleSelection}
              onEditQuestion={enhancedUIHandlers.openEditDialog}
              onDeleteQuestion={handleDeleteQuestionWrapper}
              onDuplicateQuestion={handleDuplicateQuestionWrapper}
            />
          ) : (
            <QuestionList
              questions={filteredQuestions}
              selectedQuestions={selectedQuestions}
              multiSelect={multiSelect}
              onSelectQuestion={enhancedUIHandlers.toggleSelection}
              onEditQuestion={enhancedUIHandlers.openEditDialog}
              onDeleteQuestion={handleDeleteQuestionWrapper}
              onDuplicateQuestion={handleDuplicateQuestionWrapper}
            />
          )}
        </>
      )}

      {/* Dialog Components */}
      <AddQuestionDialog
        isOpen={showAddQuestion}
        isCreating={isCreating}
        newQuestion={newQuestion}
        onClose={enhancedUIHandlers.closeAddDialog}
        onSubmit={handleAddQuestion}
        onQuestionChange={setNewQuestion}
      />

      <EditQuestionDialog
        isOpen={!!editingQuestion}
        isUpdating={isUpdating}
        question={editingQuestion}
        onClose={enhancedUIHandlers.closeEditDialog}
        onSubmit={handleEditQuestion}
        onQuestionChange={setEditingQuestion}
      />

      <BulkUploadDialog
        isOpen={showBulkUpload}
        onClose={enhancedUIHandlers.closeBulkUploadDialog}
        onUpload={handlers.handleBulkUpload}
      />
    </div>
  );
};
