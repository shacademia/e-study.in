import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { Question } from '@/constants/types';

interface QuestionResultItemProps {
  question: Question;
  index: number;
  userAnswer: number | undefined;
  isCorrect: boolean;
}

const QuestionResultItem: React.FC<QuestionResultItemProps> = ({
  question,
  index,
  userAnswer,
  isCorrect,
}) => {
  // Debug logging to see what we're receiving
  console.log(`QuestionResultItem ${index + 1}:`, {
    question: question,
    questionId: question?.id,
    content: question?.content,
    options: question?.options,
    optionsType: typeof question?.options,
    optionsIsArray: Array.isArray(question?.options),
    correctOption: question?.correctOption,
    userAnswer: userAnswer,
    isCorrect: isCorrect
  });

  // Safety check - ensure question has required data
  if (!question || !question.content) {
    console.error('QuestionResultItem: Missing question or content', question);
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-500">Question data not available</p>
      </div>
    );
  }

  // Safety check for options
  const options = Array.isArray(question.options) ? question.options : [];
  if (options.length === 0) {
    console.error('QuestionResultItem: Missing or invalid options', {
      questionId: question.id,
      options: question.options,
      optionsType: typeof question.options
    });
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-500">Question options not available</p>
        <p className="text-sm text-gray-400 mt-1">Content: {question.content}</p>
        <p className="text-xs text-gray-300 mt-1">Debug: options={JSON.stringify(question.options)}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-600 mr-2">
            Question {index + 1}
          </span>
          <Badge variant={isCorrect ? 'default' : 'destructive'}>
            {isCorrect ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {isCorrect ? 'Correct' : 'Incorrect'}
          </Badge>
        </div>
        <Badge variant="outline" className="text-xs">
          {question.difficulty}
        </Badge>
      </div>

      <p className="font-medium mb-3">{question.content}</p>

      {/* Question Image */}
      {question.questionImage && (
        <div className="flex justify-center mb-3">
          <div className="relative max-w-full max-h-48 overflow-hidden rounded-lg border shadow-sm">
            <Image
              src={question.questionImage}
              alt="Question illustration"
              width={400}
              height={200}
              className="w-auto h-auto max-w-full max-h-48 object-contain"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option: string, optionIndex: number) => {
          const isOptionCorrect = optionIndex === question.correctOption;
          const isUserIncorrect = userAnswer === optionIndex && !isCorrect;

          const optionStyle = isOptionCorrect
            ? 'bg-green-50 border-green-200 text-green-800'
            : isUserIncorrect
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-gray-50 border-gray-200';

          return (
            <div
              key={optionIndex}
              className={`p-2 rounded border text-sm ${optionStyle}`}
            >
              <div className="flex items-center">
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + optionIndex)}.
                </span>
                <span className="flex-1">{option}</span>
                
                {/* Option Image */}
                {question.optionImages && question.optionImages[optionIndex] && (
                  <div className="relative h-8 w-8 overflow-hidden rounded border ml-2">
                    <Image
                      src={question.optionImages[optionIndex]}
                      alt={`Option ${optionIndex + 1} illustration`}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-cover"
                    />
                  </div>
                )}
                
                {isOptionCorrect && (
                  <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                )}
                {isUserIncorrect && (
                  <XCircle className="h-4 w-4 ml-2 text-red-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {userAnswer === undefined && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          No answer provided
        </div>
      )}
    </div>
  );
};

export default QuestionResultItem;
