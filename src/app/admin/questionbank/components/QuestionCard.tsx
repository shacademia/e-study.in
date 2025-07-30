'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Copy, Clock, Target, Award, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MathDisplay from './math-display';
import { Question } from '@/constants/types';

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (questionId: string) => void;
  onPreview?: (question: Question) => void; // Added preview functionality
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  multiSelect?: boolean;
  onSelect?: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  isSelected = false,
  multiSelect = false,
  onSelect
}) => {
  // Enhanced helper function to render question content with better error handling
  const renderQuestionContent = (question: Question) => {
    const layers = [];

    // Layer 1 - Enhanced with error handling
    if (question.layer1Type === 'text' && question.layer1Text?.trim()) {
      layers.push(
        <div key="layer1" className="mb-2">
          <MathDisplay>{question.layer1Text}</MathDisplay>
        </div>
      );
    } else if (question.layer1Type === 'image' && question.layer1Image?.trim()) {
      layers.push(
        <div key="layer1" className="mb-2 flex justify-start">
          <Image
            src={question.layer1Image}
            alt="Question layer 1"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white max-w-full"
            style={{ maxHeight: '200px', width: 'auto' }}
            unoptimized={true}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }

    // Layer 2 - Enhanced with error handling
    if (question.layer2Type === 'text' && question.layer2Text?.trim()) {
      layers.push(
        <div key="layer2" className="mb-2">
          <MathDisplay>{question.layer2Text}</MathDisplay>
        </div>
      );
    } else if (question.layer2Type === 'image' && question.layer2Image?.trim()) {
      layers.push(
        <div key="layer2" className="mb-2 flex justify-start">
          <Image
            src={question.layer2Image}
            alt="Question layer 2"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white max-w-full"
            style={{ maxHeight: '200px', width: 'auto' }}
            unoptimized={true}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }

    // Layer 3 - Enhanced with error handling
    if (question.layer3Type === 'text' && question.layer3Text?.trim()) {
      layers.push(
        <div key="layer3" className="mb-2">
          <MathDisplay>{question.layer3Text}</MathDisplay>
        </div>
      );
    } else if (question.layer3Type === 'image' && question.layer3Image?.trim()) {
      layers.push(
        <div key="layer3" className="mb-2 flex justify-start">
          <Image
            src={question.layer3Image}
            alt="Question layer 3"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white max-w-full"
            style={{ maxHeight: '200px', width: 'auto' }}
            unoptimized={true}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }

    // Fallback to legacy content if no layers (for backward compatibility)
    if (layers.length === 0 && question.content?.trim()) {
      layers.push(
        <div key="legacy" className="mb-2">
          <MathDisplay>{question.content}</MathDisplay>
        </div>
      );
    }

    // Legacy question image (show alongside content if exists)
    if (question.questionImage?.trim()) {
      layers.push(
        <div key="legacy-image" className="mb-2 flex justify-start">
          <Image
            src={question.questionImage}
            alt="Question image"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white max-w-full"
            style={{ maxHeight: '200px', width: 'auto' }}
            unoptimized={true}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }

    // If no content at all, show placeholder
    if (layers.length === 0) {
      layers.push(
        <div key="no-content" className="text-gray-500 italic text-sm p-3 border rounded bg-gray-50">
          No question content available
        </div>
      );
    }

    return layers;
  };

  // Helper function to get difficulty color for consistent styling
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
      case 'HARD': return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
    }
  };

  // Helper function to check if question has explanation
  const hasExplanation = () => {
    return question.explanationType !== 'none' && 
           ((question.explanationType === 'text' && question.explanationText?.trim()) ||
            (question.explanationType === 'image' && question.explanationImage?.trim()));
  };

  return (
    <Card className={`h-full hover:shadow-lg transition-all duration-200 border-l-4 ${
      question.difficulty === 'EASY' ? 'border-l-green-500' :
      question.difficulty === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-red-500'
    } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>

      {/* Header with metadata and actions */}
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          {/* Left side - Selection and basic info */}
          <div className="flex items-start gap-3 flex-1">
            {multiSelect && onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(question.id)}
                className="mt-1"
              />
            )}

            <div className="flex-1 min-w-0">
              {/* Subject and Topic */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                  {question.subject}
                </Badge>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm font-medium text-gray-700">{question.topic}</span>
                
                {/* Show explanation indicator */}
                {hasExplanation() && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    ✓ Explanation
                  </Badge>
                )}
              </div>

              {/* Question ID and stats */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-mono">ID: {question.id.slice(0, 8)}...</span>
                <span>•</span>
                <span>{question.options?.length || 0} options</span>
                {question.tags?.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{question.tags.length} tags</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Difficulty, marks, and actions */}
          <div className="flex flex-col items-end gap-2">
            {/* Difficulty Badge */}
            <Badge className={getDifficultyColor(question.difficulty)}>
              <Target className="w-3 h-3 mr-1" />
              {question.difficulty}
            </Badge>

            {/* Marks Display */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
                <Award className="w-3 h-3 text-green-600" />
                <span className="text-green-700 font-medium">+{question.positiveMarks || 1}</span>
              </div>
              <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                <span className="text-red-700 font-medium">-{question.negativeMarks || 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1">
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                  onClick={() => onPreview(question)}
                  title="Preview Question"
                >
                  <Eye className="h-4 w-4 text-purple-600" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100"
                onClick={() => onEdit(question)}
                title="Edit Question"
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-100"
                onClick={() => onDuplicate(question.id)}
                title="Duplicate Question"
              >
                <Copy className="h-4 w-4 text-green-600" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    title="Delete Question"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Question</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this question? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(question.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Question Content */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Question:</h4>
          <div className="bg-gray-50 p-3 rounded-lg border">
            {renderQuestionContent(question)}
          </div>
        </div>

        {/* Options - Enhanced for better filtering and display */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Options ({question.options?.length || 0}):
          </h4>
          <div className="space-y-2">
            {question.options?.length > 0 ? question.options.map((option, index) => {
              const isCorrect = index === question.correctOption;
              const optionType = question.optionTypes?.[index] || 'text';
              const optionImage = question.optionImages?.[index];

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-2 rounded-lg border transition-colors ${
                    isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {optionType === 'image' ? (
                      optionImage?.trim() ? (
                        <div className="flex justify-start">
                          <Image
                            src={optionImage}
                            alt={`Option ${String.fromCharCode(65 + index)}`}
                            width={120}
                            height={80}
                            className="rounded object-contain border bg-white max-w-full"
                            style={{ maxHeight: '80px', width: 'auto' }}
                            unoptimized={true}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-gray-400 italic text-sm">Image not available</div>
                      )
                    ) : (
                      option?.trim() ? (
                        <MathDisplay className="text-sm">{option}</MathDisplay>
                      ) : (
                        <div className="text-gray-400 italic text-sm">No option text</div>
                      )
                    )}
                  </div>

                  {isCorrect && (
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Correct
                      </Badge>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-gray-400 italic text-sm p-2 border rounded bg-gray-50">
                No options available
              </div>
            )}
          </div>
        </div>

        {/* Explanation - Enhanced display */}
        {hasExplanation() && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Explanation:</h4>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              {question.explanationType === 'text' && question.explanationText?.trim() && (
                <MathDisplay className="text-sm text-blue-900">{question.explanationText}</MathDisplay>
              )}
              {question.explanationType === 'image' && question.explanationImage?.trim() && (
                <div className="flex justify-start">
                  <Image
                    src={question.explanationImage}
                    alt="Explanation"
                    width={300}
                    height={200}
                    className="rounded object-contain border bg-white max-w-full"
                    style={{ maxHeight: '200px', width: 'auto' }}
                    unoptimized={true}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags - Enhanced for better filtering */}
        {question.tags?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tags ({question.tags.length}):</h4>
            <div className="flex flex-wrap gap-1">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs hover:bg-gray-100 cursor-default">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Created: {new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
            {question.author?.name && (
              <div className="flex items-center gap-2">
                <span>By: {question.author.name}</span>
              </div>
            )}
          </div>
          {question.updatedAt && question.updatedAt !== question.createdAt && (
            <div className="text-xs text-gray-400">
              Updated: {new Date(question.updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
