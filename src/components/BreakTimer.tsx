import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Clock, ArrowLeft } from 'lucide-react';

interface BreakTimerProps {
  timeRemaining: number;
  onReturnToExam: () => void;
}

const BreakTimer: React.FC<BreakTimerProps> = ({ timeRemaining, onReturnToExam }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" data-id="g4t2tlvnu" data-path="src/components/BreakTimer.tsx">
      <Card className="w-full max-w-md" data-id="d8h5cy3d3" data-path="src/components/BreakTimer.tsx">
        <CardHeader className="text-center" data-id="6416mu8oy" data-path="src/components/BreakTimer.tsx">
          <div className="flex justify-center mb-4" data-id="o6xb0xjja" data-path="src/components/BreakTimer.tsx">
            <Coffee className="h-16 w-16 text-blue-600" data-id="kma4tx1e5" data-path="src/components/BreakTimer.tsx" />
          </div>
          <CardTitle className="text-2xl font-bold" data-id="i7y9km5mr" data-path="src/components/BreakTimer.tsx">Break Time</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6" data-id="gia1cr45g" data-path="src/components/BreakTimer.tsx">
          <div data-id="sbptebbb8" data-path="src/components/BreakTimer.tsx">
            <p className="text-gray-600 mb-4" data-id="7z5g1gxm9" data-path="src/components/BreakTimer.tsx">
              Take a moment to relax. Your exam timer is still running.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg" data-id="tvfumpwqp" data-path="src/components/BreakTimer.tsx">
              <div className="flex items-center justify-center space-x-2 mb-2" data-id="x76hmnvl6" data-path="src/components/BreakTimer.tsx">
                <Clock className="h-5 w-5 text-blue-600" data-id="tf1pmea74" data-path="src/components/BreakTimer.tsx" />
                <span className="text-sm text-blue-600 font-medium" data-id="kirtmbugp" data-path="src/components/BreakTimer.tsx">Break Time Remaining</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 font-mono" data-id="ztk5xoaov" data-path="src/components/BreakTimer.tsx">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          <div className="space-y-3" data-id="y8lbu5atr" data-path="src/components/BreakTimer.tsx">
            <Button onClick={onReturnToExam} className="w-full" data-id="8kz6a15s5" data-path="src/components/BreakTimer.tsx">
              <ArrowLeft className="h-4 w-4 mr-2" data-id="6891rrn7g" data-path="src/components/BreakTimer.tsx" />
              Return to Exam
            </Button>
            
            <p className="text-xs text-gray-500" data-id="efjhisf7k" data-path="src/components/BreakTimer.tsx">
              You will be automatically returned to the exam when the break time ends.
            </p>
          </div>

          <div className="text-center" data-id="hjw9wiw63" data-path="src/components/BreakTimer.tsx">
            <div className="inline-flex items-center space-x-4 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg" data-id="90wplk0pg" data-path="src/components/BreakTimer.tsx">
              <div className="flex items-center space-x-1" data-id="1xlbd2r7b" data-path="src/components/BreakTimer.tsx">
                <div className="w-2 h-2 bg-green-500 rounded-full" data-id="4v7w7jvrs" data-path="src/components/BreakTimer.tsx"></div>
                <span data-id="j61mzmy3x" data-path="src/components/BreakTimer.tsx">Stretch</span>
              </div>
              <div className="flex items-center space-x-1" data-id="m49ar8tog" data-path="src/components/BreakTimer.tsx">
                <div className="w-2 h-2 bg-blue-500 rounded-full" data-id="6uaf3sebd" data-path="src/components/BreakTimer.tsx"></div>
                <span data-id="8l96vdlna" data-path="src/components/BreakTimer.tsx">Hydrate</span>
              </div>
              <div className="flex items-center space-x-1" data-id="01mpsm924" data-path="src/components/BreakTimer.tsx">
                <div className="w-2 h-2 bg-purple-500 rounded-full" data-id="y1d0b2fwt" data-path="src/components/BreakTimer.tsx"></div>
                <span data-id="ob0npnzyu" data-path="src/components/BreakTimer.tsx">Breathe</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default BreakTimer;