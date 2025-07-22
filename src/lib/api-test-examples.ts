// Test API endpoints for exam creation and retrieval

// Test data for creating an exam with sections and questions
export const testExamData = {
  exam: {
    name: "Test Math Exam",
    description: "A comprehensive test for mathematics",
    timeLimit: 120,
    isPasswordProtected: false,
    instructions: "Please read all questions carefully before answering.",
    isPublished: false,
    isDraft: true,
  },
  sections: [
    {
      name: "Algebra Section",
      description: "Questions related to algebraic concepts",
      timeLimit: 60,
      questions: [
        {
          questionId: "test-question-1",
          order: 0,
          marks: 2,
        },
        {
          questionId: "test-question-2", 
          order: 1,
          marks: 3,
        }
      ]
    },
    {
      name: "Geometry Section",
      description: "Questions related to geometric concepts",
      timeLimit: 60,
      questions: [
        {
          questionId: "test-question-3",
          order: 0,
          marks: 4,
        }
      ]
    }
  ]
};

// Test data for direct question addition (without sections)
export const testDirectQuestions = {
  questions: [
    {
      questionId: "test-question-1",
      order: 0,
      marks: 2,
    },
    {
      questionId: "test-question-2",
      order: 1,
      marks: 3,
    },
    {
      questionId: "test-question-3",
      order: 2,
      marks: 4,
    }
  ]
};

// Expected response structure for exam with sections
export interface ExamWithSections {
  id: string;
  name: string;
  description: string;
  timeLimit: number;
  isPasswordProtected: boolean;
  password?: string;
  instructions: string;
  isPublished: boolean;
  isDraft: boolean;
  totalMarks: number;
  questionsCount: number;
  sectionsCount?: number;
  submissionsCount?: number;
  createdBy: {
    id: string;
    name: string;
    email?: string;
  };
  sections?: Array<{
    id: string;
    name: string;
    description?: string;
    timeLimit?: number;
    marks: number;
    questions: Array<{
      id: string;
      questionId: string;
      order: number;
      marks: number;
      question: {
        id: string;
        content: string;
        options: string[];
        correctOption: number;
        difficulty: string;
        subject: string;
        topic: string;
        tags: string[];
        createdAt: string;
        updatedAt: string;
        author: {
          id: string;
          name: string;
          email?: string;
        };
      };
    }>;
  }>;
  questions?: Array<{
    id: string;
    questionId: string;
    order: number;
    marks: number;
    question: {
      id: string;
      content: string;
      options: string[];
      correctOption: number;
      difficulty: string;
      subject: string;
      topic: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
      author: {
        id: string;
        name: string;
        email?: string;
      };
    };
  }>;
  _count?: {
    questions?: number;
    sections?: number;
    submissions?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// API endpoints available:
export const API_ENDPOINTS = {
  // Exam CRUD
  CREATE_EXAM: '/api/exams',                           // POST - Create new exam
  GET_EXAMS: '/api/exams',                            // GET - List all exams with pagination
  GET_EXAM: '/api/exams/[id]',                        // GET - Get specific exam
  UPDATE_EXAM: '/api/exams/[id]',                     // PUT - Update exam basic info
  DELETE_EXAM: '/api/exams/[id]',                     // DELETE - Delete exam
  
  // Exam with Sections
  SAVE_WITH_SECTIONS: '/api/exams/[id]/save-with-sections', // PUT - Save exam with sections and questions
  
  // Direct Question Management
  MANAGE_QUESTIONS: '/api/exams/[id]/questions',      // PUT/GET - Add/get questions directly to exam
} as const;

// Usage Examples:
export const usageExamples = {
  // 1. Create a basic exam
  createExam: async (authToken: string) => {
    const response = await fetch('/api/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken,
      },
      body: JSON.stringify({
        name: "Sample Exam",
        description: "A sample exam for testing",
        timeLimit: 60,
        isPasswordProtected: false,
        instructions: "Please answer all questions",
      }),
    });
    return response.json();
  },

  // 2. Save exam with sections and questions
  saveWithSections: async (examId: string, authToken: string) => {
    const response = await fetch(`/api/exams/${examId}/save-with-sections`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken,
      },
      body: JSON.stringify(testExamData),
    });
    return response.json();
  },

  // 3. Add questions directly to exam (without sections)
  addDirectQuestions: async (examId: string, authToken: string) => {
    const response = await fetch(`/api/exams/${examId}/questions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken,
      },
      body: JSON.stringify(testDirectQuestions),
    });
    return response.json();
  },

  // 4. Get exam with all questions and sections
  getExam: async (examId: string, authToken: string) => {
    const response = await fetch(`/api/exams/${examId}`, {
      headers: {
        'x-auth-token': authToken,
      },
    });
    return response.json();
  },

  // 5. Get only questions for an exam
  getExamQuestions: async (examId: string, authToken: string) => {
    const response = await fetch(`/api/exams/${examId}/questions`, {
      headers: {
        'x-auth-token': authToken,
      },
    });
    return response.json();
  },
};
