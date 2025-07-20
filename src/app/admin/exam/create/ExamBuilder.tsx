'use client';
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Plus,
  Search,
  // Filter,
  Edit,
  Trash2,
  Save,
  Eye,
  // Clock,
  BookOpen,
  CheckCircle,
  Settings,
  Lock,
  // FileText,
  Timer,
  Shield,
  Import,
  List,
  Target,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { mockDataService, Exam, Question } from "../../../../services/mockData";
// import { Value } from "@radix-ui/react-select";

interface ExamSection {
  id: string;
  name: string;
  questions: string[];
  description: string;
  timeLimit?: number;
  marks: number;
}

interface ExamBuilderProps {
  onBack: () => void;
  editingExam?: Exam;
}

// Mock questions for selection
const mockQuestions: Question[] = [
  {
    id: "1",
    content: "What is 15% of 200?",
    options: ["10", "20", "25", "30"],
    correctOption: 2,
    subject: "Mathematics",
    topic: "Percentage",
    difficulty: "easy",
    tags: ["percentage", "basic-math"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    content: "If a = 5 and b = 3, what is a² + b²?",
    options: ["25", "34", "15", "9"],
    correctOption: 1,
    subject: "Mathematics",
    topic: "Algebra",
    difficulty: "medium",
    tags: ["algebra", "squares"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    content: "Who is the current President of India?",
    options: ["Narendra Modi", "Droupadi Murmu", "Ramnath Kovind", "Amit Shah"],
    correctOption: 1,
    subject: "General Knowledge",
    topic: "Current Affairs",
    difficulty: "easy",
    tags: ["current-affairs", "politics"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    content: "Which is the largest planet in our solar system?",
    options: ["Earth", "Jupiter", "Saturn", "Neptune"],
    correctOption: 1,
    subject: "Science",
    topic: "Astronomy",
    difficulty: "easy",
    tags: ["astronomy", "planets"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    content: "If BOOK is coded as 2663, then COOK is coded as?",
    options: ["3773", "2664", "3663", "2773"],
    correctOption: 0,
    subject: "Reasoning",
    topic: "Coding-Decoding",
    difficulty: "medium",
    tags: ["coding", "reasoning"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const ExamBuilder: React.FC<ExamBuilderProps> = ({ onBack, editingExam }) => {
  const [examDetails, setExamDetails] = useState({
    title: "",
    description: "",
    duration: 180,
    totalMarks: 0,
    instructions: "",
    status: "draft",
    password: "",
    isPasswordRequired: false,
  });

  const [sections, setSections] = useState<ExamSection[]>([
    {
      id: "1",
      name: "Section 1",
      questions: [],
      description: "Main section of the exam",
      timeLimit: 60,
      marks: 0,
    },
  ]);

  const [activeSection, setActiveSection] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  // Load editing exam data
  useEffect(() => {
    if (editingExam) {
      setExamDetails({
        title: editingExam.name || "",
        description: editingExam.description || "",
        duration: editingExam.timeLimit || 180,
        totalMarks: editingExam.totalMarks || 0,
        instructions: editingExam.instructions || "",
        status: editingExam.isPublished ? "published" : "draft",
        password: editingExam.password || "",
        isPasswordRequired: editingExam.isPasswordProtected || false,
      });
    }
  }, [editingExam]);

  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch =
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      filterSubject === "all" || q.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = [...new Set(mockQuestions.map((q) => q.subject))];

  const handleAddSection = () => {
    const newSection: ExamSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      questions: [],
      description: "",
      timeLimit: 60,
      marks: 0,
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    if (activeSection >= sections.length - 1) {
      setActiveSection(Math.max(0, sections.length - 2));
    }
  };

  const handleUpdateSection = (
    sectionId: string,
    updates: Partial<ExamSection>
  ) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleAddSelectedQuestions = () => {
    const currentSection = sections[activeSection];
    const updatedQuestions = [
      ...currentSection.questions,
      ...Array.from(selectedQuestions),
    ];
    const updatedMarks = updatedQuestions.length * 10;

    handleUpdateSection(currentSection.id, {
      questions: updatedQuestions,
      marks: updatedMarks,
    });

    setSelectedQuestions(new Set());
    setShowQuestionSelector(false);

    toast({
      title: "Success",
      description: `${selectedQuestions.size} questions added to ${currentSection.name}`,
    });
  };

  const handleRemoveQuestion = (sectionId: string, questionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      const updatedQuestions = section.questions.filter(
        (q) => q !== questionId
      );
      const updatedMarks = updatedQuestions.length * 10;
      handleUpdateSection(sectionId, {
        questions: updatedQuestions,
        marks: updatedMarks,
      });
    }
  };

  const getTotalQuestions = () => {
    return sections.reduce(
      (total, section) => total + section.questions.length,
      0
    );
  };

  const getTotalMarks = () => {
    return sections.reduce((total, section) => total + section.marks, 0);
  };

  const handleSaveExam = async (status: "draft" | "published") => {
  try {
    // Prepare sections with full Question[] instead of question IDs
    const fullSections = sections.map((section) => ({
      ...section,
      questions: section.questions
        .map((qId) => mockQuestions.find((q) => q.id === qId))
        .filter((q): q is Question => q !== undefined),
    }));

    const examData = {
      name: examDetails.title,
      description: examDetails.description,
      timeLimit: examDetails.duration,
      instructions: examDetails.instructions,
      password: examDetails.password,
      isPasswordProtected: examDetails.isPasswordRequired,
      isPublished: status === "published",
      isDraft: status === "draft",
      totalMarks: getTotalMarks(),
      sections: fullSections,
      questions: fullSections.flatMap((section) => section.questions),
    };

    if (editingExam) {
      await mockDataService.updateExam(editingExam.id, examData);
    } else {
      await mockDataService.createExam(examData);
    }

    toast({
      title: "Success",
      description: `Exam ${status === "published" ? "published" : "saved as draft"} successfully`,
    });

    onBack();
  } catch (error) {
    console.error("Failed to save exam:", error);
    toast({
      title: "Error",
      description: "Failed to save exam",
      variant: "destructive",
    });
  }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <header
        className="bg-white shadow-sm border-b"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-id="nn635e6qb"
          data-path="src/components/ExamBuilder.tsx"
        >
          <div
            className="flex justify-between items-center h-16"
            data-id="akjhe8o70"
            data-path="src/components/ExamBuilder.tsx"
          >
            <div
              className="flex items-center"
              data-id="adoh5gzth"
              data-path="src/components/ExamBuilder.tsx"
            >
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={onBack}
                data-id="pa1os2of9"
                data-path="src/components/ExamBuilder.tsx"
              >
                <ArrowLeft
                  className="h-4 w-4 mr-2"
                  data-id="myatwaluj"
                  data-path="src/components/ExamBuilder.tsx"
                />
                Back
              </Button>
              <Edit
                className="h-8 w-8 text-blue-600 mr-3 ml-4"
                data-id="gadxtdxyk"
                data-path="src/components/ExamBuilder.tsx"
              />
              <h1
                className="text-xl font-bold text-gray-900"
                data-id="lnpzstbwt"
                data-path="src/components/ExamBuilder.tsx"
              >
                {editingExam ? "Edit Exam" : "Create New Exam"}
              </h1>
            </div>
            <div
              className="flex items-center space-x-4"
              data-id="elmx8yvss"
              data-path="src/components/ExamBuilder.tsx"
            >
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => handleSaveExam("draft")}
                data-id="czirpr9no"
                data-path="src/components/ExamBuilder.tsx"
              >
                <Save
                  className="h-4 w-4 mr-2"
                  data-id="s9zdsxzf8"
                  data-path="src/components/ExamBuilder.tsx"
                />
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => handleSaveExam("published")}
                data-id="zve3jos0s"
                data-path="src/components/ExamBuilder.tsx"
              >
                <Eye
                  className="h-4 w-4 mr-2"
                  data-id="wr7gnktcv"
                  data-path="src/components/ExamBuilder.tsx"
                />
                Publish Exam
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        data-id="ktmxvad4r"
        data-path="src/components/ExamBuilder.tsx"
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          data-id="exopkhrwa"
          data-path="src/components/ExamBuilder.tsx"
        >
          {/* Left Sidebar - Exam Details */}
          <div
            className="lg:col-span-1"
            data-id="vtjmwcfgl"
            data-path="src/components/ExamBuilder.tsx"
          >
            <Card
              className="sticky top-4"
              data-id="6zq7wj1po"
              data-path="src/components/ExamBuilder.tsx"
            >
              <CardHeader
                data-id="t6rm5p6uf"
                data-path="src/components/ExamBuilder.tsx"
              >
                <CardTitle
                  className="flex items-center"
                  data-id="6hwlgvi1k"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <Settings
                    className="h-5 w-5 mr-2"
                    data-id="j3apx7v4z"
                    data-path="src/components/ExamBuilder.tsx"
                  />
                  Exam Configuration
                </CardTitle>
                <CardDescription
                  data-id="scadgjlid"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  Configure exam settings, sections, and password protection
                </CardDescription>
              </CardHeader>
              <CardContent
                className="space-y-4"
                data-id="kvkqdbysb"
                data-path="src/components/ExamBuilder.tsx"
              >
                <div
                  data-id="a6cewvys7"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <Label
                    htmlFor="exam-title"
                    data-id="19prsgttj"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    Exam Title
                  </Label>
                  <Input
                    id="exam-title"
                    placeholder="Enter exam title"
                    value={examDetails.title}
                    onChange={(e) =>
                      setExamDetails({ ...examDetails, title: e.target.value })
                    }
                    data-id="u3es64qjq"
                    data-path="src/components/ExamBuilder.tsx"
                  />
                </div>

                <div
                  data-id="rvc889tpc"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <Label
                    htmlFor="exam-description"
                    data-id="79a1joltq"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="exam-description"
                    placeholder="Enter exam description"
                    value={examDetails.description}
                    onChange={(e) =>
                      setExamDetails({
                        ...examDetails,
                        description: e.target.value,
                      })
                    }
                    data-id="62ecm2w0h"
                    data-path="src/components/ExamBuilder.tsx"
                  />
                </div>

                <div
                  data-id="b6s888xgy"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <Label
                    htmlFor="exam-duration"
                    className="flex items-center"
                    data-id="8grw60r2v"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    <Timer
                      className="h-4 w-4 mr-2"
                      data-id="10bwe9tna"
                      data-path="src/components/ExamBuilder.tsx"
                    />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="exam-duration"
                    type="number"
                    placeholder="Enter duration in minutes"
                    value={examDetails.duration}
                    onChange={(e) =>
                      setExamDetails({
                        ...examDetails,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    data-id="wx7f0gbqx"
                    data-path="src/components/ExamBuilder.tsx"
                  />
                </div>

                <div
                  data-id="m5ufpyx0e"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <Label
                    htmlFor="exam-instructions"
                    data-id="p43doz0mi"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    Instructions
                  </Label>
                  <Textarea
                    id="exam-instructions"
                    placeholder="Enter exam instructions"
                    value={examDetails.instructions}
                    onChange={(e) =>
                      setExamDetails({
                        ...examDetails,
                        instructions: e.target.value,
                      })
                    }
                    data-id="a9vj4yjgw"
                    data-path="src/components/ExamBuilder.tsx"
                  />
                </div>

                {/* Password Protection */}
                <div
                  className="space-y-3 p-4 border rounded-lg bg-gray-50"
                  data-id="qy3ovo40m"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <div
                    className="flex items-center space-x-2"
                    data-id="5m34cxq16"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    <Shield
                      className="h-5 w-5 text-gray-500"
                      data-id="2rw2itaa5"
                      data-path="src/components/ExamBuilder.tsx"
                    />
                    <Label
                      className="text-base font-medium"
                      data-id="cqte5gnqa"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      Security Settings
                    </Label>
                  </div>
                  <div
                    className="flex items-center space-x-2"
                    data-id="tspfiydrz"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    <Switch
                      id="password-required"
                      checked={examDetails.isPasswordRequired}
                      onCheckedChange={(checked) =>
                        setExamDetails({
                          ...examDetails,
                          isPasswordRequired: checked,
                        })
                      }
                      data-id="tr39iiy93"
                      data-path="src/components/ExamBuilder.tsx"
                    />

                    <Label
                      htmlFor="password-required"
                      data-id="1amy6fex9"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      Require password to access exam
                    </Label>
                  </div>
                  {examDetails.isPasswordRequired && (
                    <div
                      data-id="5qp8xi2vg"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      <Label
                        htmlFor="exam-password"
                        className="flex items-center"
                        data-id="yqo8wv5t5"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        <Lock
                          className="h-4 w-4 mr-2"
                          data-id="t93pd26y3"
                          data-path="src/components/ExamBuilder.tsx"
                        />
                        Exam Password
                      </Label>
                      <Input
                        id="exam-password"
                        type="password"
                        placeholder="Enter exam password"
                        value={examDetails.password}
                        onChange={(e) =>
                          setExamDetails({
                            ...examDetails,
                            password: e.target.value,
                          })
                        }
                        data-id="ttgghqip7"
                        data-path="src/components/ExamBuilder.tsx"
                      />
                    </div>
                  )}
                </div>

                <Separator
                  data-id="6c0wxyhl6"
                  data-path="src/components/ExamBuilder.tsx"
                />

                <div
                  className="grid grid-cols-2 gap-4"
                  data-id="yz4kwis6n"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <div
                    className="p-3 bg-blue-50 rounded-lg"
                    data-id="617y47y9r"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    <Label
                      className="flex items-center text-blue-700"
                      data-id="r8pn5f5eq"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      <List
                        className="h-4 w-4 mr-2"
                        data-id="2eo0ufktq"
                        data-path="src/components/ExamBuilder.tsx"
                      />
                      Total Questions
                    </Label>
                    <div
                      className="text-2xl font-bold text-blue-600"
                      data-id="4f0mad4a2"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      {getTotalQuestions()}
                    </div>
                  </div>
                  <div
                    className="p-3 bg-green-50 rounded-lg"
                    data-id="td0vuuhh9"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    <Label
                      className="flex items-center text-green-700"
                      data-id="pkr8zpqcc"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      <Target
                        className="h-4 w-4 mr-2"
                        data-id="jevj5j13f"
                        data-path="src/components/ExamBuilder.tsx"
                      />
                      Total Marks
                    </Label>
                    <div
                      className="text-2xl font-bold text-green-600"
                      data-id="16yln2nbc"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      {getTotalMarks()}
                    </div>
                  </div>
                </div>

                <div
                  className="space-y-2"
                  data-id="q41ujo68u"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <Label
                    data-id="7iyskza3a"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    Sections ({sections.length})
                  </Label>
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      data-id="tygroz59c"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      <div
                        className="flex items-center space-x-2"
                        data-id="vxxda7n1j"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        <Badge
                          variant={
                            index === activeSection ? "default" : "outline"
                          }
                          data-id="5civ8aspw"
                          data-path="src/components/ExamBuilder.tsx"
                        >
                          {section.name}
                        </Badge>
                        <span
                          className="text-sm text-gray-600"
                          data-id="z6bfntj4d"
                          data-path="src/components/ExamBuilder.tsx"
                        >
                          {section.questions.length} questions
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleDeleteSection(section.id)}
                        disabled={sections.length === 1}
                        data-id="ex16qlc6c"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        <Trash2
                          className="h-4 w-4"
                          data-id="iebxka894"
                          data-path="src/components/ExamBuilder.tsx"
                        />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer w-full"
                    onClick={handleAddSection}
                    data-id="8rpu276za"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    <Plus
                      className="h-4 w-4 mr-2"
                      data-id="8yxec2dm1"
                      data-path="src/components/ExamBuilder.tsx"
                    />
                    Add Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Section Builder */}
          <div
            className="lg:col-span-2"
            data-id="p071z9q4u"
            data-path="src/components/ExamBuilder.tsx"
          >
            <Card
              data-id="ckwi6tfas"
              data-path="src/components/ExamBuilder.tsx"
            >
              <CardHeader
                data-id="ps72n9f84"
                data-path="src/components/ExamBuilder.tsx"
              >
                <CardTitle
                  data-id="suawqsxqm"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  Section Configuration
                </CardTitle>
                <CardDescription
                  data-id="43prefj25"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  Configure sections and add questions to your exam
                </CardDescription>
              </CardHeader>
              <CardContent
                data-id="8p03pli0d"
                data-path="src/components/ExamBuilder.tsx"
              >
                <Tabs
                  value={activeSection.toString()}
                  onValueChange={(value) => setActiveSection(parseInt(value))}
                  data-id="bo7sqe7a7"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <TabsList
                    className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
                    data-id="kmantz2ah"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    {sections.map((section, index) => (
                      <TabsTrigger
                        key={section.id}
                        value={index.toString()}
                        data-id="ybptxba8c"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        {section.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {sections.map((section, index) => (
                    <TabsContent
                      key={section.id}
                      value={index.toString()}
                      className="space-y-6"
                      data-id="x3j6t3v4x"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      {/* Section Details */}
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        data-id="jqqlf6wtx"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        <div
                          data-id="wzieq9ra9"
                          data-path="src/components/ExamBuilder.tsx"
                        >
                          <Label
                            htmlFor={`section-name-${section.id}`}
                            data-id="i83fewb8s"
                            data-path="src/components/ExamBuilder.tsx"
                          >
                            Section Name
                          </Label>
                          <Input
                            id={`section-name-${section.id}`}
                            value={section.name}
                            onChange={(e) =>
                              handleUpdateSection(section.id, {
                                name: e.target.value,
                              })
                            }
                            data-id="b018x9q7p"
                            data-path="src/components/ExamBuilder.tsx"
                          />
                        </div>
                        <div
                          data-id="p9jde7e7p"
                          data-path="src/components/ExamBuilder.tsx"
                        >
                          <Label
                            htmlFor={`section-time-${section.id}`}
                            data-id="2onuoiaa3"
                            data-path="src/components/ExamBuilder.tsx"
                          >
                            Time Limit (minutes)
                          </Label>
                          <Input
                            id={`section-time-${section.id}`}
                            type="number"
                            value={section.timeLimit || ""}
                            onChange={(e) =>
                              handleUpdateSection(section.id, {
                                timeLimit:
                                  parseInt(e.target.value) || undefined,
                              })
                            }
                            data-id="xukf2ri4v"
                            data-path="src/components/ExamBuilder.tsx"
                          />
                        </div>
                      </div>

                      <div
                        data-id="asm8sgytl"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        <Label
                          htmlFor={`section-description-${section.id}`}
                          data-id="xatz8b9zt"
                          data-path="src/components/ExamBuilder.tsx"
                        >
                          Section Description
                        </Label>
                        <Textarea
                          id={`section-description-${section.id}`}
                          value={section.description}
                          onChange={(e) =>
                            handleUpdateSection(section.id, {
                              description: e.target.value,
                            })
                          }
                          data-id="419rw7vs2"
                          data-path="src/components/ExamBuilder.tsx"
                        />
                      </div>

                      {/* Section Questions */}
                      <div
                        data-id="yeqdal9ma"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        <div
                          className="flex items-center justify-between mb-4"
                          data-id="ulmsq6p5v"
                          data-path="src/components/ExamBuilder.tsx"
                        >
                          <Label
                            className="text-base font-medium flex items-center"
                            data-id="i94uvyp8d"
                            data-path="src/components/ExamBuilder.tsx"
                          >
                            <List
                              className="h-4 w-4 mr-2"
                              data-id="brhx1q6ge"
                              data-path="src/components/ExamBuilder.tsx"
                            />
                            Questions ({section.questions.length})
                          </Label>
                          <Button
                            size="sm"
                            onClick={() => setShowQuestionSelector(true)}
                            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            data-id="1azdnauc2"
                            data-path="src/components/ExamBuilder.tsx"
                          >
                            <Import
                              className="h-4 w-4 mr-2"
                              data-id="4y5b3jgw9"
                              data-path="src/components/ExamBuilder.tsx"
                            />
                            Import Questions
                          </Button>
                        </div>

                        {section.questions.length > 0 ? (
                          <div
                            className="space-y-3"
                            data-id="kdbngrraf"
                            data-path="src/components/ExamBuilder.tsx"
                          >
                            {section.questions.map((questionId, qIndex) => {
                              const question = mockQuestions.find(
                                (q) => q.id === questionId
                              );
                              if (!question) return null;

                              return (
                                <div
                                  key={questionId}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                  data-id="r09nhda2y"
                                  data-path="src/components/ExamBuilder.tsx"
                                >
                                  <div
                                    className="flex-1"
                                    data-id="mp7wqpri5"
                                    data-path="src/components/ExamBuilder.tsx"
                                  >
                                    <div
                                      className="flex items-center space-x-2 mb-1"
                                      data-id="5zcqujksc"
                                      data-path="src/components/ExamBuilder.tsx"
                                    >
                                      <span
                                        className="text-sm font-medium"
                                        data-id="vqpz8ccpf"
                                        data-path="src/components/ExamBuilder.tsx"
                                      >
                                        Q{qIndex + 1}.
                                      </span>
                                      <Badge
                                        variant="outline"
                                        data-id="a5gwipc58"
                                        data-path="src/components/ExamBuilder.tsx"
                                      >
                                        {question.subject}
                                      </Badge>
                                      <Badge
                                        className={getDifficultyColor(
                                          question.difficulty
                                        )}
                                        data-id="l4nz4xgd2"
                                        data-path="src/components/ExamBuilder.tsx"
                                      >
                                        {question.difficulty}
                                      </Badge>
                                    </div>
                                    <p
                                      className="text-sm text-gray-700"
                                      data-id="5f7f4s6my"
                                      data-path="src/components/ExamBuilder.tsx"
                                    >
                                      {question.content}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleRemoveQuestion(
                                        section.id,
                                        questionId
                                      )
                                    }
                                    data-id="p4g9v57co"
                                    data-path="src/components/ExamBuilder.tsx"
                                  >
                                    <Trash2
                                      className="h-4 w-4"
                                      data-id="xnmwkv3oz"
                                      data-path="src/components/ExamBuilder.tsx"
                                    />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
                            data-id="na9hphecl"
                            data-path="src/components/ExamBuilder.tsx"
                          >
                            <BookOpen
                              className="h-12 w-12 text-gray-400 mx-auto mb-4"
                              data-id="agpeubisu"
                              data-path="src/components/ExamBuilder.tsx"
                            />
                            <p
                              className="text-gray-600"
                              data-id="4r064g5rh"
                              data-path="src/components/ExamBuilder.tsx"
                            >
                              No questions added yet
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 cursor-pointer"
                              onClick={() => setShowQuestionSelector(true)}
                              data-id="hbg5q4nzl"
                              data-path="src/components/ExamBuilder.tsx"
                            >
                              Add Questions
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Question Selection Dialog */}
      <Dialog
        open={showQuestionSelector}
        onOpenChange={setShowQuestionSelector}
        data-id="o0fhcl0yi"
        data-path="src/components/ExamBuilder.tsx"
      >
        <DialogContent
          className="max-w-4xl"
          data-id="hz1aq68q3"
          data-path="src/components/ExamBuilder.tsx"
        >
          <DialogHeader
            data-id="voscynrq9"
            data-path="src/components/ExamBuilder.tsx"
          >
            <DialogTitle
              className="flex items-center"
              data-id="acjwxtpuh"
              data-path="src/components/ExamBuilder.tsx"
            >
              <Import
                className="h-5 w-5 mr-2"
                data-id="iplc8u58h"
                data-path="src/components/ExamBuilder.tsx"
              />
              Import Questions from Question Bank
            </DialogTitle>
            <DialogDescription
              data-id="sipsdvgvf"
              data-path="src/components/ExamBuilder.tsx"
            >
              Search and import questions from question bank to{" "}
              <span
                className="font-medium text-blue-600"
                data-id="b2zx0z4rr"
                data-path="src/components/ExamBuilder.tsx"
              >
                {sections[activeSection]?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div
            className="space-y-4"
            data-id="fh9syowkh"
            data-path="src/components/ExamBuilder.tsx"
          >
            {/* Search and Filter */}
            <div
              className="flex space-x-4"
              data-id="amrf7tas3"
              data-path="src/components/ExamBuilder.tsx"
            >
              <div
                className="flex-1 relative"
                data-id="iimo0cl8f"
                data-path="src/components/ExamBuilder.tsx"
              >
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  data-id="qt2jd37lq"
                  data-path="src/components/ExamBuilder.tsx"
                />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-id="yfstt5fkc"
                  data-path="src/components/ExamBuilder.tsx"
                />
              </div>
              <Select
                value={filterSubject}
                onValueChange={setFilterSubject}
                data-id="m1t8azep0"
                data-path="src/components/ExamBuilder.tsx"
              >
                <SelectTrigger
                  className="w-48"
                  data-id="grrrdgm2g"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <SelectValue
                    placeholder="All Subjects"
                    data-id="3byrjyf4b"
                    data-path="src/components/ExamBuilder.tsx"
                  />
                </SelectTrigger>
                <SelectContent
                  data-id="lkv6k8pye"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <SelectItem
                    value="all"
                    data-id="sjhuru772"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    All Subjects
                  </SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem
                      key={subject}
                      value={subject}
                      data-id="rd9uwzbhn"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Questions List */}
            <div
              className="max-h-96 overflow-y-auto space-y-2"
              data-id="kl63b3r0n"
              data-path="src/components/ExamBuilder.tsx"
            >
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                  data-id="t6va0c4wp"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => handleSelectQuestion(question.id)}
                    data-id="f5pfilxo5"
                    data-path="src/components/ExamBuilder.tsx"
                  />

                  <div
                    className="flex-1"
                    data-id="moqvnyrnt"
                    data-path="src/components/ExamBuilder.tsx"
                  >
                    <div
                      className="flex items-center space-x-2 mb-1"
                      data-id="6342uzbws"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      <Badge
                        variant="outline"
                        data-id="4474xz8bi"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        {question.subject}
                      </Badge>
                      <Badge
                        className={getDifficultyColor(question.difficulty)}
                        data-id="silbzw4zz"
                        data-path="src/components/ExamBuilder.tsx"
                      >
                        {question.difficulty}
                      </Badge>
                    </div>
                    <p
                      className="text-sm text-gray-700"
                      data-id="zq8cyd8vk"
                      data-path="src/components/ExamBuilder.tsx"
                    >
                      {question.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div
              className="flex items-center justify-between"
              data-id="gap0n70ep"
              data-path="src/components/ExamBuilder.tsx"
            >
              <div
                className="flex items-center space-x-2"
                data-id="cc52s87a8"
                data-path="src/components/ExamBuilder.tsx"
              >
                <CheckCircle
                  className="h-4 w-4 text-green-600"
                  data-id="sdjztlis7"
                  data-path="src/components/ExamBuilder.tsx"
                />
                <span
                  className="text-sm"
                  data-id="jyisp6lwo"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  {selectedQuestions.size} questions selected
                </span>
              </div>
              <div
                className="flex space-x-2"
                data-id="hyy4pj44m"
                data-path="src/components/ExamBuilder.tsx"
              >
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setShowQuestionSelector(false)}
                  data-id="f8bkf53fx"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={handleAddSelectedQuestions}
                  disabled={selectedQuestions.size === 0}
                  data-id="qj3hmnedn"
                  data-path="src/components/ExamBuilder.tsx"
                >
                  Add Selected Questions
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamBuilder;
