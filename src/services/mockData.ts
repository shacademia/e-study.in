// Mock data service for the exam portal
export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
}

export interface Question {
  id: string;
  content: string;
  options: string[];
  correctOption: number;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamSection {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  marks: number;
}

export interface Exam {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  isDraft: boolean;
  timeLimit: number; // in minutes
  totalMarks: number;
  sections: ExamSection[];
  questions: Question[];
  password?: string;
  isPasswordProtected: boolean;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionStatus {
  questionId: string;
  status: "not-answered" | "answered" | "marked-for-review";
  answer?: number;
  timeSpent: number;
}

export interface Submission {
  id: string;
  userId: string;
  examId: string;
  answers: Record<string, number>;
  questionStatuses: Record<string, QuestionStatus>;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  isSubmitted: boolean;
  completedAt: Date;
}

export interface Ranking {
  id: string;
  userId: string;
  userName: string;
  examId: string;
  examName: string;
  score: number;
  rank: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}

export interface UserStats {
  totalExamsAttended: number;
  highestScore: number;
  averageScore: number;
  currentRank: number;
  totalStudents: number;
  recentExams: Exam[];
  recentSubmissions: Submission[];
}

// Mock users
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "student@example.com",
    name: "John Doe",
    role: "student",
  },
  {
    id: "user-2",
    email: "jane@example.com",
    name: "Jane Smith",
    role: "student",
  },
  {
    id: "user-3",
    email: "mike@example.com",
    name: "Mike Johnson",
    role: "student",
  },
  {
    id: "user-4",
    email: "sarah@example.com",
    name: "Sarah Wilson",
    role: "student",
  },
  {
    id: "user-5",
    email: "alex@example.com",
    name: "Alex Brown",
    role: "student",
  },
  {
    id: "user-6",
    email: "emma@example.com",
    name: "Emma Davis",
    role: "student",
  },
  {
    id: "user-7",
    email: "david@example.com",
    name: "David Miller",
    role: "student",
  },
  {
    id: "user-8",
    email: "lisa@example.com",
    name: "Lisa Taylor",
    role: "student",
  },
  {
    id: "user-9",
    email: "tom@example.com",
    name: "Tom Anderson",
    role: "student",
  },
  {
    id: "user-10",
    email: "amy@example.com",
    name: "Amy Martinez",
    role: "student",
  },
  {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  },
];

// Mock current user
export const mockCurrentUser: User = mockUsers[0];

// Mock admin user
export const mockAdminUser: User = mockUsers[mockUsers.length - 1];

// Enhanced mock questions with better categorization for multi-section exams
export const mockQuestions: Question[] = [
  // Mathematics Questions
  {
    id: "q1",
    content: "What is 15% of 200?",
    options: ["25", "30", "35", "40"],
    correctOption: 1,
    difficulty: "easy",
    subject: "Mathematics",
    topic: "Percentage",
    tags: ["math", "percentage", "basic"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "q2",
    content: "If a train travels 120 km in 2 hours, what is its speed?",
    options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
    correctOption: 1,
    difficulty: "easy",
    subject: "Mathematics",
    topic: "Speed and Distance",
    tags: ["math", "speed", "distance"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "q3",
    content: "What is the value of √144?",
    options: ["10", "12", "14", "16"],
    correctOption: 1,
    difficulty: "easy",
    subject: "Mathematics",
    topic: "Square Roots",
    tags: ["math", "square-root", "basic"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "q4",
    content: "If 3x + 5 = 17, what is the value of x?",
    options: ["3", "4", "5", "6"],
    correctOption: 1,
    difficulty: "medium",
    subject: "Mathematics",
    topic: "Algebra",
    tags: ["math", "algebra", "equations"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "q5",
    content: "What is the area of a circle with radius 7 cm? (Use π = 22/7)",
    options: ["154 cm²", "144 cm²", "164 cm²", "134 cm²"],
    correctOption: 0,
    difficulty: "medium",
    subject: "Mathematics",
    topic: "Geometry",
    tags: ["math", "geometry", "circle"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },

  // General Knowledge Questions
  {
    id: "q6",
    content: "Who is the current Prime Minister of India?",
    options: ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Manmohan Singh"],
    correctOption: 0,
    difficulty: "easy",
    subject: "General Knowledge",
    topic: "Current Affairs",
    tags: ["gk", "current-affairs", "politics"],
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
  },
  {
    id: "q7",
    content: "Which is the largest state in India by area?",
    options: ["Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Maharashtra"],
    correctOption: 2,
    difficulty: "medium",
    subject: "General Knowledge",
    topic: "Geography",
    tags: ["gk", "geography", "india"],
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
  },
  {
    id: "q8",
    content: "Who invented the telephone?",
    options: [
      "Thomas Edison",
      "Alexander Graham Bell",
      "Nikola Tesla",
      "Benjamin Franklin",
    ],
    correctOption: 1,
    difficulty: "easy",
    subject: "General Knowledge",
    topic: "Inventions",
    tags: ["gk", "inventions", "history"],
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
  },
  {
    id: "q9",
    content: "In which year did India gain independence?",
    options: ["1945", "1947", "1948", "1950"],
    correctOption: 1,
    difficulty: "easy",
    subject: "General Knowledge",
    topic: "History",
    tags: ["gk", "history", "independence"],
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
  },
  {
    id: "q10",
    content: "Which gas is most abundant in Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctOption: 2,
    difficulty: "medium",
    subject: "General Knowledge",
    topic: "Science",
    tags: ["gk", "science", "atmosphere"],
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
  },

  // Reasoning Questions
  {
    id: "q11",
    content: "If BOOK is coded as 2663, then COOK is coded as?",
    options: ["2663", "3663", "3553", "2553"],
    correctOption: 1,
    difficulty: "medium",
    subject: "Reasoning",
    topic: "Coding-Decoding",
    tags: ["reasoning", "coding", "logical"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "q12",
    content: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correctOption: 1,
    difficulty: "medium",
    subject: "Reasoning",
    topic: "Number Series",
    tags: ["reasoning", "series", "numbers"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "q13",
    content:
      "A is the father of B. B is the sister of C. How is C related to A?",
    options: ["Son", "Daughter", "Son or Daughter", "Nephew"],
    correctOption: 2,
    difficulty: "easy",
    subject: "Reasoning",
    topic: "Blood Relations",
    tags: ["reasoning", "relations", "family"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "q14",
    content:
      "If in a certain code, DELHI is written as CCIGG, how would MUMBAI be written?",
    options: ["LTLAZH", "NVNCBJ", "OVOCBJ", "LTMAZI"],
    correctOption: 0,
    difficulty: "hard",
    subject: "Reasoning",
    topic: "Coding-Decoding",
    tags: ["reasoning", "coding", "difficult"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "q15",
    content: "Which one does not belong to the group?",
    options: ["Triangle", "Square", "Circle", "Pentagon"],
    correctOption: 2,
    difficulty: "easy",
    subject: "Reasoning",
    topic: "Odd One Out",
    tags: ["reasoning", "classification", "shapes"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },

  // English Questions
  {
    id: "q16",
    content: 'Choose the correct synonym for "Abundant":',
    options: ["Scarce", "Plentiful", "Rare", "Limited"],
    correctOption: 1,
    difficulty: "easy",
    subject: "English",
    topic: "Vocabulary",
    tags: ["english", "vocabulary", "synonyms"],
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
  {
    id: "q17",
    content: "Identify the grammatically correct sentence:",
    options: [
      "She don't like coffee",
      "She doesn't likes coffee",
      "She doesn't like coffee",
      "She not like coffee",
    ],
    correctOption: 2,
    difficulty: "easy",
    subject: "English",
    topic: "Grammar",
    tags: ["english", "grammar", "sentence"],
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
  {
    id: "q18",
    content: 'What is the antonym of "Optimistic"?',
    options: ["Hopeful", "Positive", "Pessimistic", "Confident"],
    correctOption: 2,
    difficulty: "easy",
    subject: "English",
    topic: "Vocabulary",
    tags: ["english", "vocabulary", "antonyms"],
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
  {
    id: "q19",
    content:
      'Choose the correct form: "I have been working here _____ five years."',
    options: ["since", "for", "from", "during"],
    correctOption: 1,
    difficulty: "medium",
    subject: "English",
    topic: "Grammar",
    tags: ["english", "grammar", "prepositions"],
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
  {
    id: "q20",
    content:
      'Which figure of speech is used in: "The stars danced in the night sky"?',
    options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
    correctOption: 2,
    difficulty: "medium",
    subject: "English",
    topic: "Literature",
    tags: ["english", "literature", "figures-of-speech"],
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
];

// Mock exam sections with different subjects
export const mockSections: ExamSection[] = [
  {
    id: "section-1",
    name: "Mathematics",
    description: "Quantitative Aptitude and Mathematical Reasoning",
    questions: [
      mockQuestions[0],
      mockQuestions[1],
      mockQuestions[2],
      mockQuestions[3],
      mockQuestions[4],
    ],
    timeLimit: 30,
    marks: 50,
  },
  {
    id: "section-2",
    name: "General Knowledge",
    description: "Current Affairs, History, Geography and Science",
    questions: [
      mockQuestions[5],
      mockQuestions[6],
      mockQuestions[7],
      mockQuestions[8],
      mockQuestions[9],
    ],
    timeLimit: 20,
    marks: 50,
  },
  {
    id: "section-3",
    name: "Reasoning",
    description: "Logical and Analytical Reasoning",
    questions: [
      mockQuestions[10],
      mockQuestions[11],
      mockQuestions[12],
      mockQuestions[13],
      mockQuestions[14],
    ],
    timeLimit: 25,
    marks: 50,
  },
  {
    id: "section-4",
    name: "English",
    description: "Language Comprehension and Grammar",
    questions: [
      mockQuestions[15],
      mockQuestions[16],
      mockQuestions[17],
      mockQuestions[18],
      mockQuestions[19],
    ],
    timeLimit: 25,
    marks: 50,
  },
];

// Enhanced mock exams with multi-section support
export const mockExams: Exam[] = [
  {
    id: "exam-1",
    name: "Railway Recruitment Exam",
    description:
      "Comprehensive exam for railway recruitment covering Math, GK, Reasoning, and English",
    isPublished: true,
    isDraft: false,
    timeLimit: 120,
    totalMarks: 200,
    sections: [
      {
        id: "section-1",
        name: "Mathematics",
        description: "Quantitative Aptitude and Mathematical Reasoning",
        questions: [
          mockQuestions[0],
          mockQuestions[1],
          mockQuestions[2],
          mockQuestions[3],
          mockQuestions[4],
        ],
        timeLimit: 30,
        marks: 50,
      },
      {
        id: "section-2",
        name: "General Knowledge",
        description: "Current Affairs, History, Geography and Science",
        questions: [
          mockQuestions[5],
          mockQuestions[6],
          mockQuestions[7],
          mockQuestions[8],
          mockQuestions[9],
        ],
        timeLimit: 20,
        marks: 50,
      },
      {
        id: "section-3",
        name: "Reasoning",
        description: "Logical and Analytical Reasoning",
        questions: [
          mockQuestions[10],
          mockQuestions[11],
          mockQuestions[12],
          mockQuestions[13],
          mockQuestions[14],
        ],
        timeLimit: 25,
        marks: 50,
      },
      {
        id: "section-4",
        name: "English",
        description: "Language Comprehension and Grammar",
        questions: [
          mockQuestions[15],
          mockQuestions[16],
          mockQuestions[17],
          mockQuestions[18],
          mockQuestions[19],
        ],
        timeLimit: 25,
        marks: 50,
      },
    ],

    questions: [...mockQuestions.slice(0, 20)],
    password: "rail2024",
    isPasswordProtected: true,
    instructions:
      "This is a multi-section exam. You can navigate between sections during the exam. Each section has questions from different subjects. Read all instructions carefully before starting.",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "exam-2",
    name: "Banking Aptitude Test",
    description:
      "Banking sector recruitment exam with Math and Reasoning sections",
    isPublished: true,
    isDraft: false,
    timeLimit: 90,
    totalMarks: 100,
    sections: [
      {
        id: "section-1",
        name: "Mathematics",
        description: "Quantitative Aptitude for Banking",
        questions: [
          mockQuestions[0],
          mockQuestions[1],
          mockQuestions[3],
          mockQuestions[4],
        ],
        timeLimit: 45,
        marks: 50,
      },
      {
        id: "section-2",
        name: "Reasoning",
        description: "Logical Reasoning for Banking",
        questions: [
          mockQuestions[10],
          mockQuestions[11],
          mockQuestions[12],
          mockQuestions[14],
        ],
        timeLimit: 45,
        marks: 50,
      },
    ],

    questions: [...mockQuestions.slice(0, 8)],
    isPasswordProtected: false,
    instructions:
      "Navigate between Math and Reasoning sections. Each section has equal weightage.",
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-21"),
  },
  {
    id: "exam-3",
    name: "SSC Combined Graduate Level",
    description: "SSC CGL exam with comprehensive coverage of all subjects",
    isPublished: true,
    isDraft: false,
    timeLimit: 150,
    totalMarks: 200,
    sections: [
      {
        id: "section-1",
        name: "Mathematics",
        description: "Quantitative Aptitude",
        questions: [
          mockQuestions[0],
          mockQuestions[1],
          mockQuestions[2],
          mockQuestions[3],
          mockQuestions[4],
        ],
        timeLimit: 40,
        marks: 50,
      },
      {
        id: "section-2",
        name: "General Knowledge",
        description: "General Awareness",
        questions: [
          mockQuestions[5],
          mockQuestions[6],
          mockQuestions[7],
          mockQuestions[8],
          mockQuestions[9],
        ],
        timeLimit: 30,
        marks: 50,
      },
      {
        id: "section-3",
        name: "Reasoning",
        description: "General Intelligence & Reasoning",
        questions: [
          mockQuestions[10],
          mockQuestions[11],
          mockQuestions[12],
          mockQuestions[13],
          mockQuestions[14],
        ],
        timeLimit: 40,
        marks: 50,
      },
      {
        id: "section-4",
        name: "English",
        description: "English Comprehension",
        questions: [
          mockQuestions[15],
          mockQuestions[16],
          mockQuestions[17],
          mockQuestions[18],
          mockQuestions[19],
        ],
        timeLimit: 40,
        marks: 50,
      },
    ],

    questions: [...mockQuestions.slice(0, 20)],
    password: "ssc2024",
    isPasswordProtected: true,
    instructions:
      "This is a tier-1 exam with 4 sections. You can navigate between sections within the time limit.",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-22"),
  },
  {
    id: "exam-4",
    name: "Basic Math Test",
    description: "Simple mathematics test for practice",
    isPublished: true,
    isDraft: false,
    timeLimit: 30,
    totalMarks: 50,
    sections: [],
    questions: mockQuestions.slice(0, 5),
    isPasswordProtected: false,
    instructions: "Basic math test with 5 questions. Good luck!",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-23"),
  },
];

// Enhanced mock submissions
export const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    userId: "user-1",
    examId: "exam-1",
    answers: { q1: 1, q2: 1, q3: 1, q4: 1, q5: 0 },
    questionStatuses: {
      q1: { questionId: "q1", status: "answered", answer: 1, timeSpent: 120 },
      q2: { questionId: "q2", status: "answered", answer: 1, timeSpent: 180 },
      q3: { questionId: "q3", status: "answered", answer: 1, timeSpent: 90 },
      q4: { questionId: "q4", status: "answered", answer: 1, timeSpent: 150 },
      q5: { questionId: "q5", status: "answered", answer: 0, timeSpent: 200 },
    },
    score: 85,
    totalQuestions: 20,
    completedAt: new Date("2024-01-15T10:30:00"),
    timeSpent: 450,
    isSubmitted: true,
  },
  {
    id: "sub-2",
    userId: "user-1",
    examId: "exam-2",
    answers: { q1: 1, q2: 1, q10: 1, q11: 1 },
    questionStatuses: {
      q1: { questionId: "q1", status: "answered", answer: 1, timeSpent: 150 },
      q2: { questionId: "q2", status: "answered", answer: 1, timeSpent: 120 },
      q10: { questionId: "q10", status: "answered", answer: 1, timeSpent: 90 },
      q11: { questionId: "q11", status: "answered", answer: 1, timeSpent: 110 },
    },
    score: 92,
    totalQuestions: 8,
    completedAt: new Date("2024-01-16T14:20:00"),
    timeSpent: 470,
    isSubmitted: true,
  },
];

// Generate more submissions for ranking
const generateAdditionalSubmissions = (): Submission[] => {
  const submissions: Submission[] = [];
  const examIds = ["exam-1", "exam-2", "exam-3"];

  mockUsers.slice(1, 10).forEach((user, index) => {
    examIds.forEach((examId, examIndex) => {
      const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
      const exam = mockExams.find((e) => e.id === examId);
      if (exam) {
        submissions.push({
          id: `sub-${user.id}-${examId}`,
          userId: user.id,
          examId: examId,
          answers: {},
          questionStatuses: {},
          score,
          totalQuestions: exam.questions.length,
          completedAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ),
          timeSpent: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
          isSubmitted: true,
        });
      }
    });
  });

  return submissions;
};

// Add generated submissions to mock submissions
mockSubmissions.push(...generateAdditionalSubmissions());

// Enhanced mock rankings
export const mockRankings: Ranking[] = mockSubmissions
  .filter((sub) => sub.isSubmitted)
  .map((submission, index) => {
    const user = mockUsers.find((u) => u.id === submission.userId);
    const exam = mockExams.find((e) => e.id === submission.examId);

    return {
      id: `rank-${submission.id}`,
      userId: submission.userId,
      userName: user?.name || "Unknown User",
      examId: submission.examId,
      examName: exam?.name || "Unknown Exam",
      score: submission.score,
      rank: index + 1,
      totalQuestions: submission.totalQuestions,
      percentage: Math.round(
        (submission.score / (submission.totalQuestions * 10)) * 100
      ),
      completedAt: submission.completedAt,
    };
  })
  .sort((a, b) => b.score - a.score)
  .map((ranking, index) => ({ ...ranking, rank: index + 1 }));

// Deleted questions tracking for undo functionality
const deletedQuestions: Question[] = [];

/////////////////////////////////////

import { v4 as uuidv4 } from "uuid";

// Mock data service functions
export const mockDataService = {
  // Auth functions
  getCurrentUser: () => Promise.resolve(mockCurrentUser),
  signIn: (email: string, password: string) => {
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      return Promise.resolve(user);
    }
    return Promise.resolve(mockCurrentUser);
  },
  signUp: (email: string, password: string, name: string) => {
    return Promise.resolve({ ...mockCurrentUser, email, name });
  },
  signOut: () => Promise.resolve(),

  // Exam functions
  getExams: () => Promise.resolve(mockExams.filter((exam) => exam.isPublished)),
  getAllExams: () => Promise.resolve(mockExams),
  getExam: (id: string) =>
    Promise.resolve(mockExams.find((exam) => exam.id === id)),
  createExam: (exam: Partial<Exam>) => {
    if (!exam.name?.trim()) {
      return Promise.reject(new Error("Exam name is required"));
    }
    const newExam = {
      id: uuidv4(),
      isPublished: false,
      isDraft: true,
      totalMarks: 0,
      sections: [],
      questions: exam.sections
        ? exam.sections.flatMap((s) => s.questions || [])
        : [],
      isPasswordProtected: false,
      instructions: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...exam,
    } as Exam;
    mockExams.push(newExam);
    return Promise.resolve(newExam);
  },
  updateExam: (id: string, updates: Partial<Exam>) => {
    const examIndex = mockExams.findIndex((exam) => exam.id === id);
    if (examIndex !== -1) {
      mockExams[examIndex] = {
        ...mockExams[examIndex],
        ...updates,
        questions: updates.sections
          ? updates.sections.flatMap((s) => s.questions || [])
          : mockExams[examIndex].questions,
        updatedAt: new Date(),
      };
      return Promise.resolve(mockExams[examIndex]);
    }
    return Promise.reject(new Error("Exam not found"));
  },
  deleteExam: (id: string) => {
    const examIndex = mockExams.findIndex((exam) => exam.id === id);
    if (examIndex !== -1) {
      mockExams.splice(examIndex, 1);
      return Promise.resolve();
    }
    return Promise.reject(new Error("Exam not found"));
  },
  duplicateExam: (id: string) => {
    const exam = mockExams.find((exam) => exam.id === id);
    if (exam) {
      const duplicatedExam = {
        ...exam,
        id: `exam-${Date.now()}`,
        name: `${exam.name} (Copy)`,
        isPublished: false,
        isDraft: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockExams.push(duplicatedExam);
      return Promise.resolve(duplicatedExam);
    }
    return Promise.reject(new Error("Exam not found"));
  },

  // Question functions
  getQuestions: () => Promise.resolve(mockQuestions),
  getQuestion: (id: string) =>
    Promise.resolve(mockQuestions.find((q) => q.id === id)),
  createQuestion: (question: Partial<Question>) => {
    if (
      !question.content?.trim() ||
      !question.options?.every((opt) => opt.trim())
    ) {
      return Promise.reject(
        new Error("Question content and all options are required")
      );
    }
    const newQuestion = {
      id: uuidv4(),
      difficulty: "medium",
      subject: "",
      topic: "",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...question,
    } as Question;
    mockQuestions.push(newQuestion);
    return Promise.resolve(newQuestion);
  },
  createSection: (examId: string, section: Partial<ExamSection>) => {
    const newSection = {
      id: uuidv4(),
      questions: [],
      marks: 0,
      ...section,
    } as ExamSection;
    const examIndex = mockExams.findIndex((e) => e.id === examId);
    if (examIndex !== -1) {
      mockExams[examIndex].sections.push(newSection);
      return Promise.resolve(newSection);
    }
    return Promise.reject(new Error("Exam not found"));
  },
  updateQuestion: (id: string, updates: Partial<Question>) => {
    const questionIndex = mockQuestions.findIndex((q) => q.id === id);
    if (questionIndex !== -1) {
      mockQuestions[questionIndex] = {
        ...mockQuestions[questionIndex],
        ...updates,
        updatedAt: new Date(),
      };
      return Promise.resolve(mockQuestions[questionIndex]);
    }
    return Promise.reject(new Error("Question not found"));
  },
  deleteQuestion: (id: string) => {
    const questionIndex = mockQuestions.findIndex((q) => q.id === id);
    if (questionIndex !== -1) {
      const deletedQuestion = mockQuestions[questionIndex];
      deletedQuestions.push(deletedQuestion);
      mockQuestions.splice(questionIndex, 1);
      return Promise.resolve(deletedQuestion);
    }
    return Promise.reject(new Error("Question not found"));
  },
  undoDeleteQuestion: () => {
    if (deletedQuestions.length > 0) {
      const restoredQuestion = deletedQuestions.pop()!;
      mockQuestions.push(restoredQuestion);
      return Promise.resolve(restoredQuestion);
    }
    return Promise.reject(new Error("No deleted questions to restore"));
  },
  duplicateQuestion: (id: string) => {
    const question = mockQuestions.find((q) => q.id === id);
    if (question) {
      const duplicatedQuestion = {
        ...question,
        id: `q-${Date.now()}`,
        content: `${question.content} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockQuestions.push(duplicatedQuestion);
      return Promise.resolve(duplicatedQuestion);
    }
    return Promise.reject(new Error("Question not found"));
  },

  // Submission functions
  getUserSubmissions: (userId: string) =>
    Promise.resolve(mockSubmissions.filter((sub) => sub.userId === userId)),
  getExamSubmissions: (examId: string) =>
    Promise.resolve(mockSubmissions.filter((sub) => sub.examId === examId)),
  createSubmission: (submission: Partial<Submission>) => {
    const newSubmission = {
      id: `sub-${Date.now()}`,
      completedAt: new Date(),
      timeSpent: 0,
      isSubmitted: false,
      questionStatuses: {},
      ...submission,
    } as Submission;
    mockSubmissions.push(newSubmission);

    // Update rankings if submission is complete
    if (newSubmission.isSubmitted) {
      const user = mockUsers.find((u) => u.id === newSubmission.userId);
      const exam = mockExams.find((e) => e.id === newSubmission.examId);
      if (user && exam) {
        const newRanking: Ranking = {
          id: `rank-${newSubmission.id}`,
          userId: newSubmission.userId,
          userName: user.name,
          examId: newSubmission.examId,
          examName: exam.name,
          score: newSubmission.score,
          rank: 1,
          totalQuestions: newSubmission.totalQuestions,
          percentage: Math.round(
            (newSubmission.score / (newSubmission.totalQuestions * 10)) * 100
          ),
          completedAt: newSubmission.completedAt,
        };
        mockRankings.push(newRanking);
        // Recalculate ranks
        mockRankings.sort((a, b) => b.score - a.score);
        mockRankings.forEach((ranking, index) => {
          ranking.rank = index + 1;
        });
      }
    }

    return Promise.resolve(newSubmission);
  },
  updateSubmission: (id: string, updates: Partial<Submission>) => {
    const submissionIndex = mockSubmissions.findIndex((sub) => sub.id === id);
    if (submissionIndex !== -1) {
      mockSubmissions[submissionIndex] = {
        ...mockSubmissions[submissionIndex],
        ...updates,
      };
      return Promise.resolve(mockSubmissions[submissionIndex]);
    }
    return Promise.reject(new Error("Submission not found"));
  },

  // Ranking functions
  getRankings: (examId?: string) => {
    if (examId) {
      return Promise.resolve(
        mockRankings
          .filter((rank) => rank.examId === examId)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
      );
    }
    return Promise.resolve(
      mockRankings.sort((a, b) => b.score - a.score).slice(0, 10)
    );
  },
  getUserRank: (userId: string, examId?: string) => {
    if (examId) {
      const ranking = mockRankings.find(
        (rank) => rank.userId === userId && rank.examId === examId
      );
      return Promise.resolve(ranking);
    }
    const userRankings = mockRankings.filter((rank) => rank.userId === userId);
    return Promise.resolve(userRankings[0]); // Return best rank
  },
  updateRankings: (examId: string) => {
    const examSubmissions = mockSubmissions.filter(
      (sub) => sub.examId === examId && sub.isSubmitted
    );
    examSubmissions.sort((a, b) => b.score - a.score);

    examSubmissions.forEach((submission, index) => {
      const existingRankingIndex = mockRankings.findIndex(
        (rank) => rank.userId === submission.userId && rank.examId === examId
      );

      if (existingRankingIndex !== -1) {
        mockRankings[existingRankingIndex].rank = index + 1;
        mockRankings[existingRankingIndex].score = submission.score;
      }
    });

    return Promise.resolve(
      mockRankings.filter((rank) => rank.examId === examId)
    );
  },

  // Stats functions
  getUserStats: (userId: string): Promise<UserStats> => {
    const userSubmissions = mockSubmissions.filter(
      (sub) => sub.userId === userId && sub.isSubmitted
    );
    const scores = userSubmissions.map((sub) => sub.score);
    const userRankings = mockRankings.filter((rank) => rank.userId === userId);

    const stats: UserStats = {
      totalExamsAttended: userSubmissions.length,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      averageScore:
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0,
      currentRank:
        userRankings.length > 0
          ? Math.min(...userRankings.map((r) => r.rank))
          : 0,
      totalStudents: mockUsers.filter((u) => u.role === "student").length,
      recentExams: mockExams.filter((e) => e.isPublished).slice(0, 5),
      recentSubmissions: userSubmissions.slice(-5),
    };

    return Promise.resolve(stats);
  },

  // Search and filter functions
  searchQuestions: (
    query: string,
    filters?: { subject?: string; difficulty?: string; tags?: string[] }
  ) => {
    let filteredQuestions = mockQuestions;

    if (query) {
      filteredQuestions = filteredQuestions.filter(
        (q) =>
          q.content.toLowerCase().includes(query.toLowerCase()) ||
          q.subject.toLowerCase().includes(query.toLowerCase()) ||
          q.topic.toLowerCase().includes(query.toLowerCase()) ||
          q.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (filters?.subject) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.subject === filters.subject
      );
    }

    if (filters?.difficulty) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.difficulty === filters.difficulty
      );
    }

    if (filters?.tags?.length) {
      filteredQuestions = filteredQuestions.filter((q) =>
        filters.tags!.some((tag) => q.tags.includes(tag))
      );
    }

    return Promise.resolve(filteredQuestions);
  },

  updateSection: (
    examId: string,
    sectionId: string,
    updates: Partial<ExamSection>
  ) => {
    const examIndex = mockExams.findIndex((e) => e.id === examId);
    if (examIndex !== -1) {
      const sectionIndex = mockExams[examIndex].sections.findIndex(
        (s) => s.id === sectionId
      );
      if (sectionIndex !== -1) {
        mockExams[examIndex].sections[sectionIndex] = {
          ...mockExams[examIndex].sections[sectionIndex],
          ...updates,
        };
        return Promise.resolve(mockExams[examIndex].sections[sectionIndex]);
      }
    }
    return Promise.reject(new Error("Section not found"));
  },

  deleteSection: (examId: string, sectionId: string) => {
    const examIndex = mockExams.findIndex((e) => e.id === examId);
    if (examIndex !== -1) {
      const sectionIndex = mockExams[examIndex].sections.findIndex(
        (s) => s.id === sectionId
      );
      if (sectionIndex !== -1) {
        mockExams[examIndex].sections.splice(sectionIndex, 1);
        return Promise.resolve();
      }
    }
    return Promise.reject(new Error("Section not found"));
  },
};
