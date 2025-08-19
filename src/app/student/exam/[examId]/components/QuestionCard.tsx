import React, { useState, useEffect, JSX } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Bookmark, 
  X, 
  CheckCircle, 
  Target,
  Award,
  BookOpen,
  Zap,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Question } from "@/constants/types";
import SafeMathDisplay from "@/components/SafeMathDisplay";

// QuestionCardProps interface
interface QuestionCardProps {
  question: Question;
  currentSection?: {
    id: string;
    name: string;
  };
  currentQuestionIndex: number;
  hasMultipleSections: boolean;
  answer?: number;
  questionStatus?: {
    status: string;
  };
  onAnswerChange: (questionId: string, answer: number) => void;
  exam?: {
    sections: Array<{
      id: string;
      name: string;
      questions: Question[];
    }>;
  };
  isReviewMode?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
}

// ✅ SIMPLIFIED: Static Image Component
const StaticImage: React.FC<{ 
  src: string; 
  alt: string; 
  className?: string;
  maxHeight?: string;
  showLoadingSpinner?: boolean;
}> = ({ src, alt, className = "", maxHeight = "300px", showLoadingSpinner = true }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className="flex flex-col items-center justify-center h-24 sm:h-32 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-3 sm:p-4">
        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-gray-400" />
        <p className="text-xs font-medium text-gray-600 text-center">Image failed to load</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(src, '_blank')}
          className="mt-2 text-xs cursor-pointer px-2 py-1"
        >
          Open in new tab
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center">
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading && showLoadingSpinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
              <p className="text-xs text-gray-500">Loading...</p>
            </div>
          </div>
        )}
        
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className={`w-auto h-auto object-contain ${className}`}
          style={{ maxHeight, minHeight: isLoading ? '60px' : 'auto' }}
          unoptimized
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={false}
        />
      </div>
    </div>
  );
};

// Main Question Card Component
const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentSection,
  currentQuestionIndex,
  hasMultipleSections,
  answer,
  questionStatus,
  onAnswerChange,
  exam,
  isReviewMode = false,
  questionNumber,
  totalQuestions: propTotalQuestions,
}) => {

  // ✅ CONDITIONAL LOGGING: Only in development mode
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development' && question) {
  //     console.log("=== QUESTION DATA (DEV MODE) ===");
  //     console.log("ID:", question.id);
  //     console.log("Difficulty:", question.difficulty);
  //     console.log("Subject:", question.subject);
  //     console.log("Topic:", question.topic);
  //     console.log("Options:", question.options);
  //     console.log("Correct Option:", question.correctOption);
  //     console.log("==================");
  //   }
  // }, [question]);

  // ✅ SINGLE VALIDATION BLOCK
  if (!question) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="flex items-center justify-center h-48 sm:h-64 p-4 sm:p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
            <p className="text-base sm:text-lg font-medium">Question not found</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">This question may have been removed or is temporarily unavailable.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!question.options || !Array.isArray(question.options)) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="flex items-center justify-center h-48 sm:h-64 p-4 sm:p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
            <p className="text-base sm:text-lg font-medium">Invalid Question Data</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">This question has missing or invalid options data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleClearAnswer = () => {
    onAnswerChange(question.id, -1);
  };

  const getTotalQuestions = () => {
    if (propTotalQuestions) return propTotalQuestions;
    if (!exam?.sections) return 0;
    return exam.sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
  };

  const getGlobalQuestionNumber = () => {
    if (questionNumber) return questionNumber;
    
    if (!hasMultipleSections || !exam?.sections) {
      return currentQuestionIndex + 1;
    }
    
    let globalIndex = 0;
    for (let i = 0; i < exam.sections.length; i++) {
      if (i < (exam.sections.findIndex(s => s.id === currentSection?.id))) {
        globalIndex += exam.sections[i].questions?.length || 0;
      }
    }
    return globalIndex + currentQuestionIndex + 1;
  };

  const getDifficultyDetails = (difficulty: Question['difficulty']) => {
    switch (difficulty?.toUpperCase()) {
      case 'EASY':
        return { 
          icon: <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />, 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'MEDIUM':
        return { 
          icon: <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3" />, 
          color: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'HARD':
        return { 
          icon: <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3" />, 
          color: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return { 
          icon: <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3" />, 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const renderQuestionContent = () => {
    const layers: JSX.Element[] = [];
    
    // Layer 1 Content
    if (question.layer1Type === 'text' && question.layer1Text?.trim()) {
      layers.push(
        <div key="l1t" className="mb-3 sm:mb-4">
          <SafeMathDisplay className="text-gray-800 text-base">{question.layer1Text}</SafeMathDisplay>
        </div>
      );
    } else if (question.layer1Type === 'image' && question.layer1Image?.trim()) {
      layers.push(
        <StaticImage 
          key="l1i" 
          src={question.layer1Image}
          alt="Question Layer 1" 
          maxHeight="150px"
        />
      );
    }

    // Layer 2 Content
    if (question.layer2Type === 'text' && question.layer2Text?.trim()) {
      layers.push(
        <div key="l2t" className="mt-3 sm:mt-4 mb-3 sm:mb-4">
          <SafeMathDisplay className="text-gray-800 text-base">{question.layer2Text}</SafeMathDisplay>
        </div>
      );
    } else if (question.layer2Type === 'image' && question.layer2Image?.trim()) {
      layers.push(
        <StaticImage 
          key="l2i" 
          src={question.layer2Image}
          alt="Question Layer 2" 
          maxHeight="150px"
        />
      );
    }
    
    // Layer 3 Content
    if (question.layer3Type === 'text' && question.layer3Text?.trim()) {
      layers.push(
        <div key="l3t" className="mt-3 sm:mt-4">
          <SafeMathDisplay className="text-gray-800 text-base">{question.layer3Text}</SafeMathDisplay>
        </div>
      );
    } else if (question.layer3Type === 'image' && question.layer3Image?.trim()) {
      layers.push(
        <StaticImage 
          key="l3i" 
          src={question.layer3Image}
          alt="Question Layer 3" 
          maxHeight="150px"
        />
      );
    }

    return layers.length > 0 ? layers : (
      <div className="text-gray-500 italic flex items-center gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> 
        <span className="text-sm sm:text-base">No question content available.</span>
      </div>
    );
  };

  const totalQuestions = getTotalQuestions();
  const globalQuestionNumber = getGlobalQuestionNumber();
  const difficultyDetails = getDifficultyDetails(question.difficulty);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0">
                <div className="bg-blue-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-bold">
                  {globalQuestionNumber}
                </div>
                <span className="text-sm sm:text-base">of {totalQuestions}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {hasMultipleSections && currentSection && (
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                    <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    <span className="hidden sm:inline">{currentSection.name}</span>
                    <span className="sm:hidden">{currentSection.name}</span>
                  </Badge>
                )}
                
                {questionStatus?.status === "MARKED_FOR_REVIEW" && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                    <Bookmark className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 fill-current" />
                    Marked
                  </Badge>
                )}

                {isReviewMode && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    Review
                  </Badge>
                )}
              </div>
            </CardTitle>
            
            <CardDescription className="text-gray-600 text-[13px] sm:text-sm">
              {isReviewMode ? "Review your answer and explanation" : "Choose the correct answer from the options below"}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end">
            {/* MARKS BADGES */}
            <div className="flex items-center gap-1">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                +{question.positiveMarks}
              </Badge>
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                -{question.negativeMarks}
              </Badge>
            </div>
            
            {/* SUBJECT BADGE */}
            {question.subject && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                <span className="truncate max-w-20 sm:max-w-none">{question.subject}</span>
              </Badge>
            )}

            {/* TOPIC BADGE */}
            {question.topic && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                <span className="truncate max-w-20 sm:max-w-none">{question.topic}</span>
              </Badge>
            )}

            {/* DIFFICULTY BADGE */}
            <Badge className={`${difficultyDetails.color} flex items-center gap-1 font-semibold text-xs`}>
              {difficultyDetails.icon}
              {question.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Question Content Section */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            Question
          </h3>
          <div className="text-gray-800 leading-relaxed">
            {renderQuestionContent()}
          </div>
        </div>

        {/* Answer Options Section - Single radio button*/}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            Answer Options
          </h3>
          
          {question.options && question.options.length > 0 ? (
            <RadioGroup 
              value={answer !== undefined && answer !== -1 ? String(answer) : ""} 
              onValueChange={(value) => !isReviewMode && onAnswerChange(question.id, parseInt(value))} 
              className="space-y-2 sm:space-y-3"
              disabled={isReviewMode}
            >
              {question.options.map((option, index) => {
                const optionType = question.optionTypes?.[index] || 'text';
                const optionImage = question.optionImages?.[index];
                const isCorrect = isReviewMode && question.correctOption === index;
                const isUserAnswer = answer === index;
                
                const hasTextContent = optionType === 'text' && option?.trim();
                const hasImageContent = optionType === 'image' && optionImage?.trim();
                
                if (!hasTextContent && !hasImageContent) {
                  return (
                    <div key={`${question.id}-${index}`} className="p-3 sm:p-4 border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-xs sm:text-sm text-gray-400 flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-gray-400 italic text-sm">No content available for this option</span>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={`${question.id}-${index}`} className="group relative transition-all duration-200">
                    {/* Hidden RadioGroupItem for functionality */}
                    {!isReviewMode && (
                      <RadioGroupItem 
                        value={String(index)} 
                        id={`${question.id}-${index}`} 
                        className="sr-only" 
                      />
                    )}
                    
                    {/* Clickable label that wraps everything */}
                    <Label 
                      htmlFor={`${question.id}-${index}`} 
                      className={`block ${!isReviewMode ? 'cursor-pointer' : ''}`}
                    >
                      <div className={`flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                        isReviewMode && isCorrect
                          ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md ring-1 ring-green-200'
                          : isReviewMode && isUserAnswer && !isCorrect
                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 shadow-md ring-1 ring-red-200'
                            : !isReviewMode && answer === index 
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md ring-1 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        
                        <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0">
                          {/* SINGLE Option Letter Button - Acts as the selector */}
                          <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm transition-colors ${
                            isReviewMode && isCorrect
                              ? 'bg-green-600 border-green-600 text-white'
                              : isReviewMode && isUserAnswer && !isCorrect
                                ? 'bg-red-600 border-red-600 text-white'
                                : !isReviewMode && answer === index 
                                  ? 'bg-blue-600 border-blue-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-600 group-hover:border-gray-400'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          
                          {/* Option Image on Left (if exists) */}
                          {optionType === 'image' && hasImageContent && optionImage && (
                            <div className="flex-shrink-0 w-24 h-auto sm:w-32">
                              <StaticImage
                                src={optionImage}
                                alt={`Option ${String.fromCharCode(65 + index)}`}
                                className="w-full h-full object-contain rounded"
                                maxHeight="80px"
                                showLoadingSpinner={true}
                              />
                            </div>
                          )}
                          
                          {/* text options*/}
                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            {optionType === 'text' && hasTextContent && (
                              <div className="text-gray-800 leading-relaxed">
                                <SafeMathDisplay className="text-gray-800 text-sm sm:text-base">{option}</SafeMathDisplay>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Review Mode Indicators */}
                        {isReviewMode && (
                          <div className="flex flex-col gap-1 flex-shrink-0 sm:ml-0 ml-9">
                            {isCorrect && (
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                ✓ Correct
                              </Badge>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                ✗ Your Answer
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          ) : (
            <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
              <p className="text-base sm:text-lg font-medium text-gray-600 mb-2">No Options Available</p>
              <p className="text-xs sm:text-sm text-gray-500">This question doesn&apos;t have any answer options configured.</p>
            </div>
          )}
        </div>

        {/* Selected Answer Indicator */}
        {answer !== undefined && answer !== -1 && !isReviewMode && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 mt-[-8px] sm:mt-[-16px]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
              </div>
              <span className="text-blue-500 font-semibold text-sm sm:text-base">
                Selected Answer: Option {String.fromCharCode(65 + answer)}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAnswer} 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 w-full sm:w-auto"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
