import React, { useState, useEffect, JSX } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { 
  Bookmark, 
  X, 
  ZoomIn, 
  CheckCircle, 
  Target,
  Award,
  BookOpen,
  Zap,
  AlertCircle,
  Eye,
  ImageIcon,
  Clock,
  HelpCircle,
  User
} from "lucide-react";
import { Question } from "@/constants/types";
import MathDisplay from "@/components/math-display";

// QuestionCardProps interface
interface QuestionCardProps {
  question: Question; // Using the global Question interface
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
  showExplanation?: boolean;
  isReviewMode?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
  timeSpentOnQuestion?: number;
}


// ==============================================
// ENHANCED IMAGE COMPONENT WITH BETTER ERROR HANDLING
// ==============================================
const EnhancedImage: React.FC<{ 
  src: string; 
  alt: string; 
  onClick: () => void;
  className?: string;
  maxHeight?: string;
  showLoadingSpinner?: boolean;
}> = ({ src, alt, onClick, className = "", maxHeight = "400px", showLoadingSpinner = true }) => {
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
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6">
        <ImageIcon className="w-12 h-12 mb-2 text-gray-400" />
        <p className="text-sm font-medium text-gray-600">Image failed to load</p>
        <p className="text-xs text-gray-500 mt-1 break-all text-center">{src}</p>
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
    <div className="relative group mt-2 flex justify-center">
      <div 
        className="relative cursor-pointer bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all duration-200" 
        onClick={onClick}
      >
        {isLoading && showLoadingSpinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-xs text-gray-500">Loading image...</p>
            </div>
          </div>
        )}
        
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className={`w-auto h-auto object-contain hover:scale-[1.02] transition-transform duration-200 ${className}`}
          style={{ maxHeight, minHeight: isLoading ? '120px' : 'auto' }}
          unoptimized
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={false}
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ZoomIn className="h-5 w-5 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// MAIN QUESTION CARD COMPONENT
// ==============================================
const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentSection,
  currentQuestionIndex,
  hasMultipleSections,
  answer,
  questionStatus,
  onAnswerChange,
  exam,
  showExplanation = false,
  isReviewMode = false,
  questionNumber,
  totalQuestions: propTotalQuestions,
  timeSpentOnQuestion
}) => {
  
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!question) return;
    
    console.log("=== QUESTION DATA ===");
    console.log("ID:", question.id);
    console.log("Difficulty:", question.difficulty);
    console.log("Subject:", question.subject);
    console.log("Topic:", question.topic);
    console.log("Tags:", question.tags);
    
    console.log("=== LEGACY CONTENT ===");
    console.log("Content:", question.content);
    console.log("Question Image:", question.questionImage);
    console.log("Marks:", question.marks);
    
    console.log("=== 3-LAYER SYSTEM ===");
    console.log("Layer 1 Type:", question.layer1Type);
    console.log("Layer 1 Text:", question.layer1Text);
    console.log("Layer 1 Image:", question.layer1Image);
    console.log("Layer 2 Type:", question.layer2Type);
    console.log("Layer 2 Text:", question.layer2Text);
    console.log("Layer 2 Image:", question.layer2Image);
    console.log("Layer 3 Type:", question.layer3Type);
    console.log("Layer 3 Text:", question.layer3Text);
    console.log("Layer 3 Image:", question.layer3Image);
    
    console.log("=== OPTIONS SYSTEM ===");
    console.log("Options:", question.options);
    console.log("Option Images:", question.optionImages);
    console.log("Option Types:", question.optionTypes);
    console.log("Correct Option:", question.correctOption);
    
    console.log("=== MARKING SYSTEM ===");
    console.log("Positive Marks:", question.positiveMarks);
    console.log("Negative Marks:", question.negativeMarks);
    
    console.log("=== EXPLANATION SYSTEM ===");
    console.log("Explanation Type:", question.explanationType);
    console.log("Explanation Text:", question.explanationText);
    console.log("Explanation Image:", question.explanationImage);
    
    console.log("=== AUTHOR & METADATA ===");
    console.log("Author ID:", question.author?.id);
    console.log("Author Name:", question.author?.name);
    console.log("Author Email:", question.author?.email);
    console.log("Created At:", question.createdAt);
    console.log("Updated At:", question.updatedAt);
    console.log("==================");
    
  }, [question]); // Only runs when question changes

  // Handle null/undefined question
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

  // ✅ Add additional validation for critical question data
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

  // Handle null/undefined question
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

  // ✅ Add additional validation for critical question data
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

  // Calculate total questions helper
  const getTotalQuestions = () => {
    if (propTotalQuestions) return propTotalQuestions;
    if (!exam?.sections) return 0;
    return exam.sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
  };

  // CALCULATE GLOBAL QUESTION NUMBER
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

  // ENHANCED DIFFICULTY STYLING
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

  // ✅ Enhanced question content rendering (3-Layer System) - fully typed
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
        <EnhancedImage 
          key="l1i" 
          src={question.layer1Image}
          alt="Question Layer 1" 
          onClick={() => setSelectedImagePreview(question.layer1Image || null)}
          maxHeight="400px"
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
        <EnhancedImage 
          key="l2i" 
          src={question.layer2Image}
          alt="Question Layer 2" 
          onClick={() => setSelectedImagePreview(question.layer2Image || null)}
          maxHeight="400px"
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
        <EnhancedImage 
          key="l3i" 
          src={question.layer3Image}
          alt="Question Layer 3" 
          onClick={() => setSelectedImagePreview(question.layer3Image || null)}
          maxHeight="400px"
        />
      );
    }

    // Fallback for legacy content field (backward compatibility)
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
        <EnhancedImage 
          key="legacy-image" 
          src={question.questionImage}
          alt="Question Image" 
          onClick={() => setSelectedImagePreview(question.questionImage || null)}
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

  // ✅ Enhanced explanation rendering - fully typed
  const renderExplanation = () => {
    if (!showExplanation || !question.explanationType || question.explanationType === 'none') {
      return null;
    }

    return (
      <div className="bg-green-50 rounded-lg p-6 border border-green-200 shadow-sm">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-green-600" />
          Explanation
        </h3>
        <div className="text-green-800 leading-relaxed">
          {question.explanationType === 'text' && question.explanationText?.trim() ? (
            <MathDisplay className="text-green-800">{question.explanationText}</MathDisplay>
          ) : question.explanationType === 'image' && question.explanationImage?.trim() ? (
            <EnhancedImage 
              src={question.explanationImage}
              alt="Question Explanation" 
              onClick={() => setSelectedImagePreview(question.explanationImage || null)}
              maxHeight="300px"
            />
          ) : (
            <p className="text-green-600 italic">No explanation available for this question.</p>
          )}
        </div>
      </div>
    );
  };

  const totalQuestions = getTotalQuestions();
  const globalQuestionNumber = getGlobalQuestionNumber();
  const difficultyDetails = getDifficultyDetails(question.difficulty);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      {/* ENHANCED CARD HEADER */}
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            {/* QUESTION NUMBER AND SECTION INFO */}
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {globalQuestionNumber}
                </div>
                <span>of {totalQuestions}</span>
              </div>
              
              {/* SECTION BADGE */}
              {hasMultipleSections && currentSection && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {currentSection.name}
                </Badge>
              )}
              
              {/* MARKED FOR REVIEW BADGE */}
              {questionStatus?.status === "MARKED_FOR_REVIEW" && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Bookmark className="h-3 w-3 mr-1 fill-current" />
                  Marked
                </Badge>
              )}

              {/* REVIEW MODE INDICATOR */}
              {isReviewMode && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Eye className="h-3 w-3 mr-1" />
                  Review
                </Badge>
              )}
            </CardTitle>
            
            <CardDescription className="text-gray-600">
              {isReviewMode ? "Review your answer and explanation" : "Choose the correct answer from the options below"}
            </CardDescription>
          </div>
          
          {/* ENHANCED METADATA BADGES */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* DIFFICULTY BADGE */}
            <Badge className={`${difficultyDetails.color} flex items-center gap-1 font-semibold`}>
              {difficultyDetails.icon}
              {question.difficulty}
            </Badge>
            
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
            
            {/* MARKS BADGES */}
            <div className="flex items-center gap-1">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                +{question.positiveMarks}
              </Badge>
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                -{question.negativeMarks}
              </Badge>
            </div>

            {/* AUTHOR BADGE */}
            {question.author?.name && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                <User className="h-3 w-3 mr-1" />
                {question.author.name}
              </Badge>
            )}

            {/* TIME SPENT (if available) */}
            {timeSpentOnQuestion !== undefined && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {Math.floor(timeSpentOnQuestion / 60)}:{(timeSpentOnQuestion % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>
        </div>

        {/* TAGS DISPLAY */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {question.tags.length > 5 && (
              <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                +{question.tags.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      {/* ENHANCED CARD CONTENT */}
      <CardContent className="space-y-6">
        {/* QUESTION CONTENT SECTION */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Question
          </h3>
          <div className="text-gray-800 leading-relaxed">
            {renderQuestionContent()}
          </div>
        </div>

        {/* SELECTED ANSWER INDICATOR */}
        {answer !== undefined && answer !== -1 && !isReviewMode && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              <span className="text-blue-900 font-semibold">
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

        {/* ✅ FIXED: Answer Options Section with null safety */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Answer Options
          </h3>
          
          {/* ✅ Add null check for question.options */}
          {question.options && question.options.length > 0 ? (
            <RadioGroup 
              value={answer !== undefined && answer !== -1 ? String(answer) : ""} 
              onValueChange={(value) => !isReviewMode && onAnswerChange(question.id, parseInt(value))} 
              className="space-y-3"
              disabled={isReviewMode}
            >
              {question.options.map((option, index) => {
                // ✅ Proper option type and image handling using global types
                const optionType = question.optionTypes?.[index] || 'text';
                const optionImage = question.optionImages?.[index];
                const isCorrect = isReviewMode && question.correctOption === index;
                const isUserAnswer = answer === index;
                
                // ✅ Handle empty options gracefully
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
                  <div 
                    key={`${question.id}-${index}`} 
                    className={`group relative transition-all duration-200 ${
                      !isReviewMode && answer === index 
                        ? 'scale-[1.02] shadow-lg' 
                        : !isReviewMode 
                          ? 'hover:scale-[1.01] hover:shadow-md'
                          : ''
                    }`}
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
                      
                      {/* Option Letter */}
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
                      
                      {/* Radio Button (Hidden in review mode) */}
                      {!isReviewMode && (
                        <RadioGroupItem 
                          value={String(index)} 
                          id={`${question.id}-${index}`} 
                          className="mt-1 flex-shrink-0" 
                        />
                      )}
                      
                      {/* ✅ FIXED: Option Content with proper type handling and null checks */}
                      <Label 
                        htmlFor={`${question.id}-${index}`} 
                        className={`flex-1 ${!isReviewMode ? 'cursor-pointer' : ''} flex flex-col gap-4`}
                      >
                        {/* Text Content */}
                        {optionType === 'text' && hasTextContent && (
                          <div className="text-gray-800 leading-relaxed">
                            <MathDisplay className="text-gray-800">{option}</MathDisplay>
                          </div>
                        )}
                        
                        {/* Image Content - Fixed with proper null check */}
                        {optionType === 'image' && hasImageContent && optionImage && (
                          <div 
                            className="relative cursor-pointer group/img" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              setSelectedImagePreview(optionImage); 
                            }}
                          >
                            <EnhancedImage
                              src={optionImage}
                              alt={`Option ${String.fromCharCode(65 + index)}`}
                              onClick={() => setSelectedImagePreview(optionImage)}
                              className="group-hover/img:scale-105 transition-transform duration-200"
                              maxHeight="200px"
                              showLoadingSpinner={true}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center flex items-center justify-center gap-1">
                              <Eye className="h-3 w-3" />
                              Click to enlarge
                            </p>
                          </div>
                        )}
                      </Label>

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
                  </div>
                );
              })}
            </RadioGroup>
          ) : (
            /* ✅ Fallback when no options are available */
            <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-600 mb-2">No Options Available</p>
              <p className="text-sm text-gray-500">This question doesn&apos;t have any answer options configured.</p>
            </div>
          )}
        </div>

        {/* EXPLANATION SECTION (Review Mode) */}
        {showExplanation && renderExplanation()}
      </CardContent>

      {/* IMAGE PREVIEW DIALOG */}
      <Dialog open={!!selectedImagePreview} onOpenChange={() => setSelectedImagePreview(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-2 bg-black/90 border-0">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="relative flex items-center justify-center h-full">
            <div className="relative max-w-full max-h-[90vh] overflow-hidden">
              {selectedImagePreview && (
                <EnhancedImage
                  src={selectedImagePreview}
                  alt="Full size preview"
                  onClick={() => {}}
                  className="max-w-full max-h-[90vh] object-contain"
                  showLoadingSpinner={true}
                />
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedImagePreview(null)} 
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 rounded-full w-10 h-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default QuestionCard;
