import React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bookmark } from "lucide-react";
import { QuestionCardProps } from "../types";

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentSection,
  currentQuestionIndex,
  hasMultipleSections,
  answer,
  questionStatus,
  onAnswerChange,
}) => {
  if (!question) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              Question {currentQuestionIndex + 1} of{" "}
              {currentSection
                ? currentSection.questions?.length
                : "Unknown"}
              {hasMultipleSections && (
                <Badge variant="outline" className="ml-2">
                  {currentSection?.name}
                </Badge>
              )}
              {questionStatus?.status === "MARKED_FOR_REVIEW" && (
                <Bookmark className="h-4 w-4 ml-2 text-yellow-600" />
              )}
            </CardTitle>
            <CardDescription>
              Choose the correct answer from the options below
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {question.difficulty}
            </Badge>
            <Badge variant="outline">
              {question.subject}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Question Text */}
          <div className="text-lg font-medium">
            {question.content}
          </div>

          {/* Question Image */}
          {question.questionImage && (
            <div className="flex justify-center">
              <div className="relative max-w-full max-h-96 overflow-hidden rounded-lg border shadow-sm">
                <Image
                  src={question.questionImage}
                  alt="Question illustration"
                  width={800}
                  height={400}
                  className="w-auto h-auto max-w-full max-h-96 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <RadioGroup
            value={answer !== undefined ? String(answer) : ""}
            onValueChange={(value) =>
              onAnswerChange(question.id, parseInt(value))
            }
          >
            {question?.options?.map((option, index) => (
              <div
                key={`${question.id}-${index}`}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-100"
              >
                <RadioGroupItem
                  value={String(index)}
                  id={`${question.id}-${index}`}
                />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className="flex-1 cursor-pointer flex items-center space-x-3"
                >
                  <span>{option}</span>
                  {/* Option Image */}
                  {question.optionImages && question.optionImages[index] && (
                    <div className="relative h-16 w-16 overflow-hidden rounded border">
                      <Image
                        src={question.optionImages[index]}
                        alt={`Option ${index + 1} illustration`}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
