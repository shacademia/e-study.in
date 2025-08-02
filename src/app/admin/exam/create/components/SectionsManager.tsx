'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  Target,
  Users,
  Eye
} from 'lucide-react';
import { ExamSection, Question } from '@/constants/types';
import { getDifficultyColor } from '../utils/examUtils';
import QuestionPreviewDialog from '../../components/QuestionPreviewDialog';

interface SectionsManagerProps {
  sections: ExamSection[];
  activeSection: number;
  setActiveSection: (index: number) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, updates: Partial<ExamSection>) => void;
  onRemoveQuestion: (sectionId: string, questionId: string) => void;
  onAddQuestions: () => void;
}

const SectionsManager: React.FC<SectionsManagerProps> = ({
  sections,
  activeSection,
  setActiveSection,
  onAddSection,
  onDeleteSection,
  onUpdateSection,
  onRemoveQuestion,
  onAddQuestions
}) => {
  const currentSection = sections[activeSection];
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const handleSectionUpdate = (field: keyof ExamSection, value: string | number) => {
    if (currentSection) {
      onUpdateSection(currentSection.id, { [field]: value });
    }
  };

  const getSectionStats = (section: ExamSection) => {
    const questions = section.questions || [];
    const difficultyCount = { EASY: 0, MEDIUM: 0, HARD: 0 };
    
    questions.forEach(question => {
      const difficulty = question.difficulty?.toUpperCase() as keyof typeof difficultyCount;
      if (difficulty in difficultyCount) {
        difficultyCount[difficulty]++;
      }
    });

    return {
      totalQuestions: questions.length,
      totalMarks: section.marks || 0,
      timeLimit: section.timeLimit || 0,
      difficultyCount
    };
  };

  // Helper to render a single question layer (text/image/none)
  const renderLayer = (
    type: 'text' | 'image' | 'none',
    text?: string,
    imageUrl?: string,
    key?: React.Key
  ) => {
    if (type === 'text' && text) {
      return (
        <p key={`layer-text-${key}`} className="text-sm line-clamp-2 mb-1 break-words">
          {text}
        </p>
      );
    } 
    if (type === 'image' && imageUrl) {
      return (
        <div key={`layer-image-${key}`} className="mb-1 flex justify-start">
          <div className="relative w-full max-w-full h-auto max-h-[120px]">
            <Image
              src={imageUrl}
              alt="Question layer image"
              width={80}
              height={60}
              className="rounded-md object-contain border bg-white"
              unoptimized={true}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Sections Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Exam Sections ({sections.length})
            </CardTitle>
            <Button onClick={onAddSection} className="flex items-center cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Sections Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {sections.map((section, index) => {
              const stats = getSectionStats(section);
              return (
                <Card 
                  key={section.id}
                  className={`cursor-pointer transition-all ${
                    activeSection === index 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveSection(index)}
                >
                  <CardContent className="p-4 pl-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{section.name}</h4>
                      {sections.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSection(section.id);
                          }}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600 pr-4">
                      <div className="flex justify-between">
                        <span>Questions:</span>
                        <span className="font-medium">{stats.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marks:</span>
                        <span className="font-medium">{stats.totalMarks}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Section Details */}
      {currentSection && (
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className='cursor-pointer'>Section Details</TabsTrigger>
            <TabsTrigger value="questions" className='cursor-pointer'>Questions ({currentSection.questions?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Section: {currentSection.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="section-name">Section Name *</Label>
                  <Input
                    id="section-name"
                    value={currentSection.name}
                    onChange={(e) => handleSectionUpdate('name', e.target.value)}
                    placeholder="Enter section name..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="section-description">Description</Label>
                  <Textarea
                    id="section-description"
                    value={currentSection.description || ''}
                    onChange={(e) => handleSectionUpdate('description', e.target.value)}
                    placeholder="Enter section description..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Section Questions
                  </CardTitle>
                  <Button onClick={onAddQuestions} className="flex items-center cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Questions
                  </Button>
                </div>
              </CardHeader>

              {/* Display section questions */}
              <CardContent>
                {!currentSection.questions || currentSection.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
                    <p className="text-gray-600 mb-4">Add questions to this section to build your exam.</p>
                    <Button onClick={onAddQuestions} className="flex items-center cursor-pointer">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentSection.questions.map((question: any, index: number) => (
                      <Card key={question.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-sm">Q{index + 1}.</span>
                                <Badge variant="outline" className="text-xs">{question.subject}</Badge>
                                <Badge variant="outline" className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </Badge>
                              </div>
                
                              {/* Replace single content with 3-layer rendering */}
                              <div>
                                {renderLayer(question.layer1Type, question.layer1Text, question.layer1Image, `${question.id}-1`)}
                                {renderLayer(question.layer2Type, question.layer2Text, question.layer2Image, `${question.id}-2`)}
                                {renderLayer(question.layer3Type, question.layer3Text, question.layer3Image, `${question.id}-3`)}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-[-4px]">
                              <div className='flex items-center space-x-1 cursor-text'>
                                <Badge className='bg-green-100 text-green-800 border-green-200'>+ {question.positiveMarks}</Badge>
                                <Badge className="bg-red-100 text-red-800 border-red-200">- {question.negativeMarks}</Badge>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewQuestion(question)}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveQuestion(currentSection.id, question.id)}
                                className="text-red-600 hover:text-red-800 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Question Preview Dialog */}
      <QuestionPreviewDialog
        previewQuestion={previewQuestion}
        setPreviewQuestion={setPreviewQuestion}
        getDifficultyColor={getDifficultyColor}
      />
    </div>
  );
};

export default SectionsManager;
