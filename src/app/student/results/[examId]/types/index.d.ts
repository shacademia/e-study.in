type LayerType = 'text' | 'image' | 'none';
type OptionType = 'text' | 'image';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type QuestionStatus = 'ANSWERED' | 'NOT_ANSWERED';
type ExplanationType = 'text' | 'image' | 'none';
type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';



export interface ApiResponse {
  success: boolean;
  data: ExamSubmissionData;
  message: string;
}



interface User {
  id: string;
  name: string;
  email: string;
}

interface Exam {
  id: string;
  name: string;
  description: string;
  totalMarks: number;
  timeLimit: number;
}

interface Statistics {
  correctAnswers: number | null;
  wrongAnswers: number;
  unanswered: number;
  percentage: number;
  totalQuestions: number;
  totalMarks: number;
  earnedMarks: number;
  accuracy: number;
  timeUtilization: number;
}

interface QuestionAnalysis {
  questionId: string;
  question: string;
  questionImage: string | null;
  layer1Type: LayerType;
  layer1Text: string;
  layer1Image: string;
  layer2Type: LayerType;
  layer2Text: string;
  layer2Image: string;
  layer3Type: LayerType;
  layer3Text: string;
  layer3Image: string;
  options: string[];
  optionImages: string[];
  optionTypes: OptionType[];
  correctOption: number;
  userAnswer: number;
  isCorrect: boolean;
  positiveMarks: number;
  negativeMarks: number;
  marks: number;
  earnedMarks: number;
  timeSpent: number;
  status: QuestionStatus;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  explanationType: ExplanationType;
  explanationText: string;
  explanationImage: string;
}

interface SubjectStats {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  totalMarks: number;
  earnedMarks: number;
}

interface Performance {
  grade: Grade;
  remarks: string;
}

interface ExamSubmissionData {
  id: string;
  userId: string;
  examId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  isSubmitted: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  exam: Exam;
  statistics: Statistics;
  questionAnalysis: QuestionAnalysis[];
  subjectAnalysis: Record<string, SubjectStats>;
  performance: Performance;
}

interface ApiResponse {
  success: boolean;
  data: ExamSubmissionData;
  message: string;
}
