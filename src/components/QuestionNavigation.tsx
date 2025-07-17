import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type QuestionStatus = 'current' | 'answered' | 'marked' | 'unanswered';

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  onQuestionSelect: (questionIndex: number) => void;
  getQuestionStatus: (questionIndex: number) => QuestionStatus;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  totalQuestions,
  // currentQuestion,
  onQuestionSelect,
  getQuestionStatus
}) => {
  const getButtonVariant = (status: string) => {
    switch (status) {
      case 'current':
        return 'default';
      case 'answered':
        return 'secondary';
      case 'marked':
        return 'outline';
      default:
        return 'ghost';
    }
  };

  const getButtonColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'answered':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'marked':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
  };

  const statusCounts = {
    answered: 0,
    marked: 0,
    unanswered: 0
  };

  // Count question statuses
  for (let i = 0; i < totalQuestions; i++) {
    const status = getQuestionStatus(i);
    if (status === 'answered') statusCounts.answered++;else
    if (status === 'marked') statusCounts.marked++;else
    if (status === 'unanswered') statusCounts.unanswered++;
  }

  return (
    <Card className="sticky top-4" data-id="u3vf1bkg5" data-path="src/components/QuestionNavigation.tsx">
      <CardHeader data-id="tqt7htilu" data-path="src/components/QuestionNavigation.tsx">
        <CardTitle className="text-lg" data-id="4zo5uzntl" data-path="src/components/QuestionNavigation.tsx">Question Navigation</CardTitle>
      </CardHeader>
      <CardContent data-id="rlb7zr6t2" data-path="src/components/QuestionNavigation.tsx">
        <div className="space-y-4" data-id="xitpnotyb" data-path="src/components/QuestionNavigation.tsx">
          {/* Status Legend */}
          <div className="space-y-2" data-id="bgmhfwkiu" data-path="src/components/QuestionNavigation.tsx">
            <div className="flex items-center justify-between text-sm" data-id="skd3a2aoz" data-path="src/components/QuestionNavigation.tsx">
              <div className="flex items-center space-x-2" data-id="p8yv3hwsf" data-path="src/components/QuestionNavigation.tsx">
                <div className="w-3 h-3 bg-green-500 rounded" data-id="gaofdg1sw" data-path="src/components/QuestionNavigation.tsx"></div>
                <span data-id="b9y6wftlm" data-path="src/components/QuestionNavigation.tsx">Answered</span>
              </div>
              <Badge variant="secondary" className="text-xs" data-id="ju9olqiiz" data-path="src/components/QuestionNavigation.tsx">
                {statusCounts.answered}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm" data-id="8bsqeim5q" data-path="src/components/QuestionNavigation.tsx">
              <div className="flex items-center space-x-2" data-id="qfxz3a3s1" data-path="src/components/QuestionNavigation.tsx">
                <div className="w-3 h-3 bg-yellow-500 rounded" data-id="sl526m4q0" data-path="src/components/QuestionNavigation.tsx"></div>
                <span data-id="4o5a1vqxd" data-path="src/components/QuestionNavigation.tsx">Marked</span>
              </div>
              <Badge variant="outline" className="text-xs" data-id="kv7ukpj9w" data-path="src/components/QuestionNavigation.tsx">
                {statusCounts.marked}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm" data-id="crh07lh0x" data-path="src/components/QuestionNavigation.tsx">
              <div className="flex items-center space-x-2" data-id="zgnx6ceb8" data-path="src/components/QuestionNavigation.tsx">
                <div className="w-3 h-3 bg-gray-300 rounded" data-id="tb1cvd2by" data-path="src/components/QuestionNavigation.tsx"></div>
                <span data-id="ti565w0ol" data-path="src/components/QuestionNavigation.tsx">Not Answered</span>
              </div>
              <Badge variant="outline" className="text-xs" data-id="e07govdig" data-path="src/components/QuestionNavigation.tsx">
                {statusCounts.unanswered}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm" data-id="ai26m70bi" data-path="src/components/QuestionNavigation.tsx">
              <div className="flex items-center space-x-2" data-id="lkdv79wwf" data-path="src/components/QuestionNavigation.tsx">
                <div className="w-3 h-3 bg-blue-500 rounded" data-id="n1nvtvwz7" data-path="src/components/QuestionNavigation.tsx"></div>
                <span data-id="g11oce08x" data-path="src/components/QuestionNavigation.tsx">Current</span>
              </div>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-4 gap-2" data-id="pnt014jep" data-path="src/components/QuestionNavigation.tsx">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const status = getQuestionStatus(index);
              return (
                <Button
                  key={index}
                  variant={getButtonVariant(status)}
                  size="sm"
                  className={`h-10 w-10 p-0 text-sm font-medium ${getButtonColor(status)}`}
                  onClick={() => onQuestionSelect(index)} data-id="ej7awmdrn" data-path="src/components/QuestionNavigation.tsx">

                  {index + 1}
                </Button>);

            })}
          </div>

          {/* Progress Summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg" data-id="ije6evotd" data-path="src/components/QuestionNavigation.tsx">
            <div className="text-sm text-gray-600" data-id="jcfhh65l3" data-path="src/components/QuestionNavigation.tsx">
              Progress: {statusCounts.answered + statusCounts.marked}/{totalQuestions} questions
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2" data-id="1lrb8804n" data-path="src/components/QuestionNavigation.tsx">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(statusCounts.answered + statusCounts.marked) / totalQuestions * 100}%`
                }} data-id="amn1o8p6k" data-path="src/components/QuestionNavigation.tsx">
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default QuestionNavigation;