import React, { JSX, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
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
import SafeMathDisplay from '@/components/SafeMathDisplay';
import { QuestionAnalysis } from '../types';

interface QuestionResultItemProps {
  question: QuestionAnalysis;
  index: number;
  userAnswer: number | undefined;
  isCorrect: boolean;
  showExplanation?: boolean;
}

// ==========
// ENHANCED IMAGE COMPONENT FOR EXAM RESULTS
// ==========
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
      <div className="flex flex-col items-center justify-center h-20 sm:h-24 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-3 sm:p-4">
        <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-gray-400" />
        <p className="text-xs text-gray-600 text-center">Image failed to load</p>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all duration-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
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
        
        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
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
      <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
        <p className="text-gray-500 text-sm sm:text-base">Question data not available</p>
      </div>
    );
  }

  // ✅ ENHANCED: Render 3-layer question content
  const renderQuestionContent = () => {
    const layers: JSX.Element[] = [];
    
    // Layer 1 Content
    if (question.layer1Type === 'text' && question.layer1Text?.trim()) {
      layers.push(
        <div key="l1t" className="mb-3">
          <SafeMathDisplay className="text-gray-800 leading-relaxed text-sm sm:text-base">{question.layer1Text}</SafeMathDisplay>
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
          <SafeMathDisplay className="text-gray-800 leading-relaxed text-sm sm:text-base">{question.layer2Text}</SafeMathDisplay>
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
          <SafeMathDisplay className="text-gray-800 leading-relaxed text-sm sm:text-base">{question.layer3Text}</SafeMathDisplay>
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
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm sm:text-base">No question content available.</span>
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
        <div className="mt-4 bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
            Explanation
          </h4>
          <p className="text-gray-500 italic text-sm">No explanation available for this question.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
        <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          Explanation
        </h4>
        <div className="text-green-800 leading-relaxed">
          {/* ✅ TEXT EXPLANATION with SafeMathDisplay */}
          {question.explanationType === 'text' && question.explanationText?.trim() && (
            <SafeMathDisplay className="text-green-800 text-sm leading-relaxed">
              {question.explanationText}
            </SafeMathDisplay>
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
      <div className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">
                Question {index + 1}
              </span>
              {userAnswer === undefined ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  N/A
                </Badge>
              ) : isCorrect ? (
                <Badge variant="default" className="flex items-center gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Correct
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                  <XCircle className="h-3 w-3" />
                  Incorrect
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {/* Colored Difficulty Badge */}
            <Badge className={`${difficultyDetails.color} flex items-center gap-1 font-semibold text-xs`}>
              {difficultyDetails.icon}
              <span className="hidden xs:inline">{question.difficulty}</span>
              <span className="xs:hidden">{question.difficulty?.[0]}</span>
            </Badge>
            {question.subject && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <BookOpen className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate max-w-20 sm:max-w-none">{question.subject}</span>
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
            <Target className="h-4 w-4 text-blue-600 flex-shrink-0" />
            Question
          </h3>
          {renderQuestionContent()}
        </div>

        {/* Answer Options Section */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
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
                  <div className="flex items-start gap-2 sm:gap-3">
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
                    <div className="flex-1 min-w-0">
                      {/* Text Content */}
                      {optionType === 'text' && option?.trim() && (
                        <SafeMathDisplay className="text-sm">{option}</SafeMathDisplay>
                      )}
                      
                      {/* Image Content */}
                      {optionType === 'image' && optionImage?.trim() && (
                        <div className="mt-1">
                          <EnhancedResultImage
                            src={optionImage}
                            alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            onClick={() => setSelectedImagePreview(optionImage)}
                            maxHeight="80px"
                          />
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span className="hidden sm:inline">Click to enlarge</span>
                            <span className="sm:hidden">Tap to enlarge</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Icons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {isOptionCorrect && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Correct</span>
                          <span className="sm:hidden">✓</span>
                        </Badge>
                      )}
                      {isUserChoice && !isOptionCorrect && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Your Answer</span>
                          <span className="sm:hidden">You</span>
                        </Badge>
                      )}
                      {isUserChoice && isCorrect && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Your Answer</span>
                          <span className="sm:hidden">You</span>
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
          <div className="mb-4 p-3 bg-amber-100 border-2 border-amber-200 rounded-lg text-sm text-amber-700 flex items-start gap-2 font-medium">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>
              <span className="hidden sm:inline">No answer provided - This question was left unanswered</span>
              <span className="sm:hidden">Question left unanswered</span>
            </span>
          </div>
        )}

        {/* ✅ DEDICATED EXPLANATION SECTION */}
        {renderExplanation()}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImagePreview} onOpenChange={() => setSelectedImagePreview(null)}>
        <DialogContent className="border-0 shadow-none bg-transparent [&>button:last-child]:hidden max-w-[95vw] max-h-[95vh] w-auto h-auto p-0">
          <DialogTitle></DialogTitle>
          <div className="relative flex items-center justify-center h-full w-full">
            <div className="relative overflow-hidden scale-100 sm:scale-[1.7] max-w-full max-h-full">
              {selectedImagePreview && (
                <EnhancedResultImage
                  src={selectedImagePreview}
                  alt="Full size preview"
                  onClick={() => {}}
                  className="object-contain max-w-full max-h-full"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionResultItem;
