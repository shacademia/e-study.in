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
import MathDisplay from "@/components/math-display";

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
}> = ({ src, alt, className = "", maxHeight = "400px", showLoadingSpinner = true }) => {
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
      <div className="flex flex-col items-center justify-center h-32 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4">
        <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
        <p className="text-xs font-medium text-gray-600">Image failed to load</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(src, '_blank')}
          className="mt-2 text-xs"
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
          style={{ maxHeight, minHeight: isLoading ? '80px' : 'auto' }}
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
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && question) {
      console.log("=== QUESTION DATA (DEV MODE) ===");
      console.log("ID:", question.id);
      console.log("Difficulty:", question.difficulty);
      console.log("Subject:", question.subject);
      console.log("Topic:", question.topic);
      console.log("Options:", question.options);
      console.log("Correct Option:", question.correctOption);
      console.log("==================");
    }
  }, [question]);

  // ✅ SINGLE VALIDATION BLOCK
  if (!question) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Question not found</p>
            <p className="text-sm text-gray-500 mt-2">This question may have been removed or is temporarily unavailable.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!question.options || !Array.isArray(question.options)) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Invalid Question Data</p>
            <p className="text-sm text-gray-500 mt-2">This question has missing or invalid options data.</p>
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
          icon: <Zap className="h-3 w-3" />, 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'MEDIUM':
        return { 
          icon: <Target className="h-3 w-3" />, 
          color: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'HARD':
        return { 
          icon: <Award className="h-3 w-3" />, 
          color: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return { 
          icon: <BookOpen className="h-3 w-3" />, 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const renderQuestionContent = () => {
    const layers: JSX.Element[] = [];
    
    // Layer 1 Content
    if (question.layer1Type === 'text' && question.layer1Text?.trim()) {
      layers.push(
        <div key="l1t" className="mb-4">
          <MathDisplay className="text-gray-800">{question.layer1Text}</MathDisplay>
        </div>
      );
    } else if (question.layer1Type === 'image' && question.layer1Image?.trim()) {
      layers.push(
        <StaticImage 
          key="l1i" 
          src={question.layer1Image}
          alt="Question Layer 1" 
          maxHeight="200px"
        />
      );
    }

    // Layer 2 Content
    if (question.layer2Type === 'text' && question.layer2Text?.trim()) {
      layers.push(
        <div key="l2t" className="mt-4 mb-4">
          <MathDisplay className="text-gray-800">{question.layer2Text}</MathDisplay>
        </div>
      );
    } else if (question.layer2Type === 'image' && question.layer2Image?.trim()) {
      layers.push(
        <StaticImage 
          key="l2i" 
          src={question.layer2Image}
          alt="Question Layer 2" 
          maxHeight="200px"
        />
      );
    }
    
    // Layer 3 Content
    if (question.layer3Type === 'text' && question.layer3Text?.trim()) {
      layers.push(
        <div key="l3t" className="mt-4">
          <MathDisplay className="text-gray-800">{question.layer3Text}</MathDisplay>
        </div>
      );
    } else if (question.layer3Type === 'image' && question.layer3Image?.trim()) {
      layers.push(
        <StaticImage 
          key="l3i" 
          src={question.layer3Image}
          alt="Question Layer 3" 
          maxHeight="200px"
        />
      );
    }

    // Fallback for legacy content field
    if (layers.length === 0 && question.content?.trim()) {
      layers.push(
        <div key="legacy-content" className="mb-4">
          <MathDisplay className="text-gray-800">{question.content}</MathDisplay>
        </div>
      );
    }

    // Legacy question image support
    if (question.questionImage?.trim()) {
      layers.push(
        <StaticImage 
          key="legacy-image" 
          src={question.questionImage}
          alt="Question Image" 
          maxHeight="400px"
        />
      );
    }

    return layers.length > 0 ? layers : (
      <div className="text-gray-500 italic flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <AlertCircle className="h-5 w-5" /> 
        No question content available.
      </div>
    );
  };

  const totalQuestions = getTotalQuestions();
  const globalQuestionNumber = getGlobalQuestionNumber();
  const difficultyDetails = getDifficultyDetails(question.difficulty);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {globalQuestionNumber}
                </div>
                <span>of {totalQuestions}</span>
              </div>
              
              {hasMultipleSections && currentSection && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {currentSection.name}
                </Badge>
              )}
              
              {questionStatus?.status === "MARKED_FOR_REVIEW" && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Bookmark className="h-3 w-3 mr-1 fill-current" />
                  Marked
                </Badge>
              )}

              {isReviewMode && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Review
                </Badge>
              )}
            </CardTitle>
            
            <CardDescription className="text-gray-600">
              {isReviewMode ? "Review your answer and explanation" : "Choose the correct answer from the options below"}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
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
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <BookOpen className="h-3 w-3 mr-1" />
                {question.subject}
              </Badge>
            )}

            {/* TOPIC BADGE */}
            {question.topic && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Target className="h-3 w-3 mr-1" />
                {question.topic}
              </Badge>
            )}

            {/* DIFFICULTY BADGE */}
            <Badge className={`${difficultyDetails.color} flex items-center gap-1 font-semibold`}>
              {difficultyDetails.icon}
              {question.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Content Section */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Question
          </h3>
          <div className="text-gray-800 leading-relaxed">
            {renderQuestionContent()}
          </div>
        </div>

        {/* ✅ FIXED: Answer Options Section - Single radio button, no extra text */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Answer Options
          </h3>
          
          {question.options && question.options.length > 0 ? (
            <RadioGroup 
              value={answer !== undefined && answer !== -1 ? String(answer) : ""} 
              onValueChange={(value) => !isReviewMode && onAnswerChange(question.id, parseInt(value))} 
              className="space-y-3"
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
                    <div key={`${question.id}-${index}`} className="p-4 border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-sm text-gray-400">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-gray-400 italic">No content available for this option</span>
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
                    
                    {/* ✅ FIXED: Clickable label that wraps everything */}
                    <Label 
                      htmlFor={`${question.id}-${index}`} 
                      className={`block ${!isReviewMode ? 'cursor-pointer' : ''}`}
                    >
                      <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                        isReviewMode && isCorrect
                          ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md ring-1 ring-green-200'
                          : isReviewMode && isUserAnswer && !isCorrect
                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 shadow-md ring-1 ring-red-200'
                            : !isReviewMode && answer === index 
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md ring-1 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        
                        {/* ✅ SINGLE Option Letter Button - Acts as the selector */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${
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
                        
                        {/* ✅ FIXED: Option Image on Left (if exists) */}
                        {optionType === 'image' && hasImageContent && optionImage && (
                          <div className="flex-shrink-0 w-32 h-auto">
                            <StaticImage
                              src={optionImage}
                              alt={`Option ${String.fromCharCode(65 + index)}`}
                              className="w-full h-full object-contain rounded"
                              maxHeight=""
                              showLoadingSpinner={true}
                            />
                          </div>
                        )}
                        
                        {/* ✅ FIXED: Content - Only show text for text options, nothing extra for images */}
                        <div className="flex-1 flex flex-col justify-center">
                          {optionType === 'text' && hasTextContent && (
                            <div className="text-gray-800 leading-relaxed">
                              <MathDisplay className="text-gray-800">{option}</MathDisplay>
                            </div>
                          )}
                          
                          {/* ✅ REMOVED: Extra "Option A" text for image options */}
                        </div>

                        {/* Review Mode Indicators */}
                        {isReviewMode && (
                          <div className="flex flex-col gap-1">
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
            <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-600 mb-2">No Options Available</p>
              <p className="text-sm text-gray-500">This question doesn&apos;t have any answer options configured.</p>
            </div>
          )}
        </div>

        {/* Selected Answer Indicator */}
        {answer !== undefined && answer !== -1 && !isReviewMode && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 mt-[-16px]">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              <span className="text-blue-500 font-semibold">
                Selected Answer: Option {String.fromCharCode(65 + answer)}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAnswer} 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
