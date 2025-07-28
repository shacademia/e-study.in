import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Lock } from 'lucide-react';

interface ExamDetails {
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  status: 'draft' | 'published';
  password: string;
  isPasswordRequired: boolean;
}

interface ExamDetailsFormProps {
  examDetails: ExamDetails;
  setExamDetails: React.Dispatch<React.SetStateAction<ExamDetails>>;
  totalMarks: number;
}

const ExamDetailsForm: React.FC<ExamDetailsFormProps> = ({
  examDetails,
  setExamDetails,
  totalMarks
}) => {
  const handleInputChange = (field: keyof ExamDetails, value: string | number | boolean) => {
    setExamDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Exam Details
        </CardTitle>
        <CardDescription>
          Configure the basic information and settings for your exam.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="title">Exam Title *</Label>
            <Input
              id="title"
              value={examDetails.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter exam title..."
              className="mt-1"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={examDetails.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter exam description..."
              className="mt-1 min-h-20"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              value={examDetails.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
              placeholder="180"
              className="mt-1"
              min="1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="totalMarks">Total Marks</Label>
            <Input
              id="totalMarks"
              type="number"
              value={totalMarks}
              disabled
              className="mt-1 bg-gray-50"
              placeholder="Auto-calculated"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated based on questions added
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <Label htmlFor="instructions">Instructions for Students</Label>
          <Textarea
            id="instructions"
            value={examDetails.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="Enter detailed instructions for students..."
            className="mt-1 min-h-24"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            These instructions will be shown to students before they start the exam
          </p>
        </div>

        {/* Security Settings */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Security Settings</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="password-protection">Password Protection</Label>
                <p className="text-sm text-gray-500">
                  Require a password to access this exam
                </p>
              </div>
              <Switch
                id="password-protection"
                checked={examDetails.isPasswordRequired}
                onCheckedChange={(checked) => handleInputChange('isPasswordRequired', checked)}
              />
            </div>
            
            {examDetails.isPasswordRequired && (
              <div>
                <Label htmlFor="password">Exam Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={examDetails.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter exam password..."
                  className="mt-1"
                  required={examDetails.isPasswordRequired}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Students will need this password to access the exam
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Information */}
        <div className="border-t pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Publishing Information</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Draft:</strong> Exam is saved but not accessible to students</p>
              <p><strong>Published:</strong> Exam is live and accessible to students</p>
              <p className="mt-2 text-blue-700">
                Current Status: <span className="font-medium capitalize">{examDetails.status}</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamDetailsForm;
