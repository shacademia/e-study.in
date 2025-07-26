'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Copy } from 'lucide-react';
import { Question } from '@/constants/types';
import { getDifficultyColor, getSubjectColor, formatQuestionPreview, hasQuestionImages } from '../utils';
import MathDisplay from './math-display';

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (questionId: string) => void;
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
  viewMode,
  isSelected = false,
  multiSelect = false,
  onSelect
}) => {
  const renderQuestionContent = (question: Question) => {
    // Check if using new 3-layer system
    if (question.layer1Type !== 'none') {
      return (
        <div className="space-y-2">
          {/* Layer 1 */}
          {question.layer1Type === 'text' && question.layer1Text && (
            <MathDisplay className="text-sm">{question.layer1Text}</MathDisplay>
          )}
          {question.layer1Type === 'image' && question.layer1Image && (
            <div className="relative w-full h-32">
              <Image
                src={question.layer1Image}
                alt="Layer 1"
                fill
                className="object-contain rounded"
              />
            </div>
          )}

          {/* Layer 2 */}
          {question.layer2Type === 'text' && question.layer2Text && (
            <MathDisplay className="text-sm">{question.layer2Text}</MathDisplay>
          )}
          {question.layer2Type === 'image' && question.layer2Image && (
            <div className="relative w-full h-32">
              <Image
                src={question.layer2Image}
                alt="Layer 2"
                fill
                className="object-contain rounded"
              />
            </div>
          )}

          {/* Layer 3 */}
          {question.layer3Type === 'text' && question.layer3Text && (
            <MathDisplay className="text-sm">{question.layer3Text}</MathDisplay>
          )}
          {question.layer3Type === 'image' && question.layer3Image && (
            <div className="relative w-full h-32">
              <Image
                src={question.layer3Image}
                alt="Layer 3"
                fill
                className="object-contain rounded"
              />
            </div>
          )}
        </div>
      );
    } else {
      // Fallback to legacy content + image system
      return (
        <div className="space-y-2">
          <MathDisplay className="text-sm">
            {formatQuestionPreview(question.content, viewMode === 'grid' ? 100 : 200)}
          </MathDisplay>
          {question.questionImage && (
            <div className="relative w-full h-32">
              <Image
                src={question.questionImage}
                alt="Question"
                fill
                className="object-contain rounded"
              />
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <Badge className={getSubjectColor(question.subject)}>
              {question.subject}
            </Badge>
            {question.topic && (
              <Badge variant="outline" className="text-xs">
                {question.topic}
              </Badge>
            )}
            {hasQuestionImages(question) && (
              <Badge variant="secondary" className="text-xs">
                📷 Images
              </Badge>
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(question)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(question.id)}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderQuestionContent(question)}
        
        {/* Options preview */}
        <div className="mt-3 space-y-1">
          {question.options.slice(0, viewMode === 'grid' ? 2 : 4).map((option, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${
                idx === question.correctOption ? 'text-green-600' : 'text-gray-500'
              }`}>
                {String.fromCharCode(65 + idx)}.
              </span>
              <div className="flex-1">
                {question.optionTypes?.[idx] === 'image' && question.optionImages?.[idx] ? (
                  <div className="relative w-16 h-12">
                    <Image
                      src={question.optionImages[idx]}
                      alt={`Option ${String.fromCharCode(65 + idx)}`}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                ) : (
                  <MathDisplay className="text-xs">
                    {formatQuestionPreview(option, 50)}
                  </MathDisplay>
                )}
              </div>
            </div>
          ))}
          {question.options.length > (viewMode === 'grid' ? 2 : 4) && (
            <div className="text-xs text-gray-500">
              +{question.options.length - (viewMode === 'grid' ? 2 : 4)} more options
            </div>
          )}
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {question.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {question.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{question.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="mt-3 text-xs text-gray-500">
          <div>Created: {new Date(question.createdAt).toLocaleDateString()}</div>
          {question.updatedAt && (
            <div>Updated: {new Date(question.updatedAt).toLocaleDateString()}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
