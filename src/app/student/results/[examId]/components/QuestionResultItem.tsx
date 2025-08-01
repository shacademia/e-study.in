import React, { JSX, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  ZoomIn,
  HelpCircle,
  Target,
  ImageIcon,
  AlertCircle,
  BookOpen,
  Zap,
  Award
} from 'lucide-react';
import { Question } from '@/constants/types';
import MathDisplay from '@/components/math-display';
import { QuestionAnalysis } from '../types';

interface QuestionResultItemProps {
  question: QuestionAnalysis;
  index: number;
  userAnswer: number | undefined;
  isCorrect: boolean;
  showExplanation?: boolean;
}

// ==============================================
// ENHANCED IMAGE COMPONENT FOR EXAM RESULTS
// ==============================================
const EnhancedResultImage: React.FC<{ 
  src: string; 
  alt: string; 
  onClick: () => void;
  className?: string;
  maxHeight?: string;
}> = ({ src, alt, onClick, className = "", maxHeight = "200px" }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError) {
    return (
      <div className="flex flex-col items-center justify-center h-24 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4">
        <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
        <p className="text-xs text-gray-600">Image failed to load</p>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all duration-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className={`w-auto h-auto object-contain ${className}`}
          style={{ maxHeight }}
          unoptimized
          onLoad={() => setIsLoading(false)}
          onError={() => setImageError(true)}
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionResultItem: React.FC<QuestionResultItemProps> = ({
  question,
  index,
  userAnswer,
  isCorrect,
  showExplanation = true
}) => {
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // ✅ ENHANCED DIFFICULTY STYLING FUNCTION
  const getDifficultyDetails = (difficulty: Question['difficulty']) => {
    switch (difficulty?.toUpperCase()) {
      case 'EASY':
        return { 
          icon: <Zap className="h-3 w-3" />, 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          textColor: 'text-emerald-800'
        };
      case 'MEDIUM':
        return { 
          icon: <Target className="h-3 w-3" />, 
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          textColor: 'text-amber-800'
        };
      case 'HARD':
        return { 
          icon: <Award className="h-3 w-3" />, 
          color: 'bg-rose-100 text-rose-800 border-rose-200',
          textColor: 'text-rose-800'
        };
      default:
        return { 
          icon: <BookOpen className="h-3 w-3" />, 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  // Safety check - ensure question has required data
  if (!question) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-500">Question data not available</p>
      </div>
    );
  }

  // // Safety check for options
  // const options = Array.isArray(question.options) ? question.options : [];
  // if (options.length === 0) {
  //   return (
  //     <div className="border rounded-lg p-4 bg-gray-50">
  //       <p className="text-gray-500">Question options not available</p>
  //       {question.content && (
  //         <p className="text-sm text-gray-400 mt-1">Content: {question.content}</p>
  //       )}
  //     </div>
  //   );
  // }

  // ✅ ENHANCED: Render 3-layer question content
  const renderQuestionContent = () => {
    const layers: JSX.Element[] = [];
    
    // Layer 1 Content
    if (question.layer1Type === 'text' && question.layer1Text?.trim()) {
      layers.push(
        <div key="l1t" className="mb-3">
          <MathDisplay className="text-gray-800 leading-relaxed">{question.layer1Text}</MathDisplay>
        </div>
      );
    } else if (question.layer1Type === 'image' && question.layer1Image?.trim()) {
      layers.push(
        <div key="l1i" className="mb-3 flex justify-center">
          <EnhancedResultImage
            src={question.layer1Image}
            alt="Question Layer 1"
            onClick={() => setSelectedImagePreview(question.layer1Image || null)}
            maxHeight="300px"
          />
        </div>
      );
    }

    // Layer 2 Content
    if (question.layer2Type === 'text' && question.layer2Text?.trim()) {
      layers.push(
        <div key="l2t" className="mb-3">
          <MathDisplay className="text-gray-800 leading-relaxed">{question.layer2Text}</MathDisplay>
        </div>
      );
    } else if (question.layer2Type === 'image' && question.layer2Image?.trim()) {
      layers.push(
        <div key="l2i" className="mb-3 flex justify-center">
          <EnhancedResultImage
            src={question.layer2Image}
            alt="Question Layer 2"
            onClick={() => setSelectedImagePreview(question.layer2Image || null)}
            maxHeight="300px"
          />
        </div>
      );
    }

    // Layer 3 Content
    if (question.layer3Type === 'text' && question.layer3Text?.trim()) {
      layers.push(
        <div key="l3t" className="mb-3">
          <MathDisplay className="text-gray-800 leading-relaxed">{question.layer3Text}</MathDisplay>
        </div>
      );
    } else if (question.layer3Type === 'image' && question.layer3Image?.trim()) {
      layers.push(
        <div key="l3i" className="mb-3 flex justify-center">
          <EnhancedResultImage
            src={question.layer3Image}
            alt="Question Layer 3"
            onClick={() => setSelectedImagePreview(question.layer3Image || null)}
            maxHeight="300px"
          />
        </div>
      );
    }

    // // Fallback to legacy content (backward compatibility)
    // if (layers.length === 0 && question.content?.trim()) {
    //   layers.push(
    //     <div key="legacy-content" className="mb-3">
    //       <MathDisplay className="text-gray-800 leading-relaxed">{question.content}</MathDisplay>
    //     </div>
    //   );
    // }

    // Legacy question image
    if (question.questionImage?.trim()) {
      layers.push(
        <div key="legacy-image" className="mb-3 flex justify-center">
          <EnhancedResultImage
            src={question.questionImage}
            alt="Question Image"
            onClick={() => setSelectedImagePreview(question.questionImage || null)}
            maxHeight="300px"
          />
        </div>
      );
    }

    return layers.length > 0 ? layers : (
      <div className="text-gray-500 italic flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-3">
        <AlertCircle className="h-4 w-4" />
        No question content available.
      </div>
    );
  };

  // ✅ ENHANCED: Render explanation section with better styling
  const renderExplanation = () => {
    if (!showExplanation || !question.explanationType || question.explanationType === 'none') {
      return null;
    }

    const hasExplanationContent =
      (question.explanationType === 'text' && question.explanationText?.trim()) ||
      (question.explanationType === 'image' && question.explanationImage?.trim());

    if (!hasExplanationContent) {
      return (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-gray-500" />
            Explanation
          </h4>
          <p className="text-gray-500 italic text-sm">No explanation available for this question.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
        <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-green-600" />
          Explanation
        </h4>
        <div className="text-green-800 leading-relaxed">
          {/* ✅ TEXT EXPLANATION with MathDisplay */}
          {question.explanationType === 'text' && question.explanationText?.trim() && (
            <MathDisplay className="text-green-800 text-sm leading-relaxed">
              {question.explanationText}
            </MathDisplay>
          )}

          {/* ✅ IMAGE EXPLANATION with proper display and click hint */}
          {question.explanationType === 'image' && question.explanationImage?.trim() && (
            <div>
              <div className="flex justify-center mb-2">
                <EnhancedResultImage
                  src={question.explanationImage}
                  alt="Question Explanation"
                  onClick={() => setSelectedImagePreview(question.explanationImage || null)}
                  maxHeight="250px"
                />
              </div>
              <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" />
                Click to enlarge
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ Get difficulty styling details
  const difficultyDetails = getDifficultyDetails(question.difficulty);

  return (
    <>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-2">
                Question {index + 1}
              </span>
              <Badge variant={isCorrect ? 'default' : 'destructive'} className="flex items-center gap-1">
                {isCorrect ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {isCorrect ? 'Correct' : 'Incorrect'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* ✅ ENHANCED: Colored Difficulty Badge */}
            <Badge className={`${difficultyDetails.color} flex items-center gap-1 font-semibold text-xs`}>
              {difficultyDetails.icon}
              {question.difficulty}
            </Badge>
            {question.subject && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <BookOpen className="h-3 w-3 mr-1" />
                {question.subject}
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                +{question.positiveMarks}
              </Badge>
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                -{question.negativeMarks}
              </Badge>
            </div>
          </div>
        </div>

        {/* Question Content Section */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Question
          </h3>
          {renderQuestionContent()}
        </div>

        {/* Answer Options Section */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Answer Options
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {question.options.map((option: string, optionIndex: number) => {
              const isOptionCorrect = optionIndex === question.correctOption;
              const isUserChoice = userAnswer === optionIndex;
              const isUserIncorrect = isUserChoice && !isCorrect;

              // Enhanced option styling
              const optionStyle = isOptionCorrect
                ? 'bg-green-50 border-green-200 text-green-800 shadow-sm'
                : isUserIncorrect
                ? 'bg-red-50 border-red-200 text-red-800 shadow-sm'
                : isUserChoice && isCorrect
                ? 'bg-green-50 border-green-200 text-green-800 shadow-sm'
                : 'bg-gray-50 border-gray-200';

              const optionType = question.optionTypes?.[optionIndex] || 'text';
              const optionImage = question.optionImages?.[optionIndex];

              return (
                <div
                  key={optionIndex}
                  className={`p-3 rounded-lg border text-sm transition-all duration-200 ${optionStyle}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Option Letter */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                      isOptionCorrect 
                        ? 'bg-green-600 border-green-600 text-white'
                        : isUserIncorrect
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + optionIndex)}
                    </div>

                    {/* Option Content */}
                    <div className="flex-1">
                      {/* Text Content */}
                      {optionType === 'text' && option?.trim() && (
                        <MathDisplay className="text-sm">{option}</MathDisplay>
                      )}
                      
                      {/* Image Content */}
                      {optionType === 'image' && optionImage?.trim() && (
                        <div className="mt-1">
                          <EnhancedResultImage
                            src={optionImage}
                            alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            onClick={() => setSelectedImagePreview(optionImage)}
                            maxHeight="100px"
                          />
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Click to enlarge
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Icons */}
                    <div className="flex flex-col gap-1">
                      {isOptionCorrect && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Correct
                        </Badge>
                      )}
                      {isUserChoice && !isOptionCorrect && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Your Answer
                        </Badge>
                      )}
                      {isUserChoice && isCorrect && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Your Answer
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* No Answer Indicator */}
        {userAnswer === undefined && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            No answer provided - This question was left unanswered
          </div>
        )}

        {/* ✅ DEDICATED EXPLANATION SECTION */}
        {renderExplanation()}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImagePreview} onOpenChange={() => setSelectedImagePreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2 bg-black/90 border-0">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="relative flex items-center justify-center h-full">
            <div className="relative max-w-full max-h-[85vh] overflow-hidden">
              {selectedImagePreview && (
                <EnhancedResultImage
                  src={selectedImagePreview}
                  alt="Full size preview"
                  onClick={() => {}}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedImagePreview(null)} 
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 rounded-full w-8 h-8 p-0"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionResultItem;
