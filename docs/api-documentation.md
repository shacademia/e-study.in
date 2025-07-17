# E-Study.in Backend API Documentation

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Question Management APIs](#question-management-apis)
4. [Exam Management APIs](#exam-management-apis)
5. [Exam Section APIs](#exam-section-apis)
6. [Submission APIs](#submission-apis)
7. [Ranking APIs](#ranking-apis)
8. [Admin Dashboard APIs](#admin-dashboard-apis)
9. [File Upload APIs](#file-upload-apis)
10. [Search and Filter APIs](#search-and-filter-apis)

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { /* additional error details */ }
}
```

### Authentication
All protected endpoints require a JWT token in the `x-auth-token` header.

---

## Authentication APIs

### ✅ POST /api/users/signup
**Status**: DONE
**Description**: Create a new user account
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```
**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### ✅ POST /api/users/login
**Status**: DONE
**Description**: Login user and return JWT token
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```
**Note**: JWT token is set as httpOnly cookie

### ✅ GET /api/users/logout
**Status**: DONE
**Description**: Logout user and clear authentication cookie
**Response**:
```json
{
  "message": "Logout successful"
}
```

---

## User Management APIs

### ✅ GET /api/users/[me]
**Status**: DONE
**Description**: Get current user profile
**Headers**: `x-auth-token: <JWT>`
**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "profileImage": "url",
  "bio": "User bio",
  "isActive": true,
  "lastLogin": "2024-01-01T00:00:00.000Z",
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### ✅ PUT /api/users/updateuserprofile
**Status**: DONE
**Description**: Update user profile
**Headers**: `x-auth-token: <JWT>`
**Request Body**:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### ✅ GET /api/users/all
**Status**: DONE
**Description**: Get all users (Admin only)
**Headers**: `x-auth-token: <JWT>`
**Response**:
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### ✅ GET /api/users/admins
**Status**: DONE
**Description**: Get all admin users
**Headers**: `x-auth-token: <JWT>`
**Response**: Same as GET /api/users/all but filtered for ADMIN role

### ❌ PUT /api/users/[id]/role
**Status**: TODO
**Description**: Update user role (Admin only)
**Request Body**:
```json
{
  "role": "ADMIN" | "USER" | "MODERATOR" | "GUEST"
}
```

### ❌ DELETE /api/users/[id]
**Status**: TODO
**Description**: Delete user account (Admin only)

---

## Question Management APIs

### ✅ POST /api/questions/create
**Status**: DONE
**Description**: Create a new question (Admin/Moderator only)
**Headers**: `x-auth-token: <JWT>`
**Request Body**:
```json
{
  "content": "What is 2+2?",
  "options": ["2", "3", "4", "5"],
  "correctOption": 2,
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "subject": "Mathematics",
  "topic": "Basic Arithmetic",
  "tags": ["math", "arithmetic", "basic"]
}
```
**Response**:
```json
{
  "id": "uuid",
  "content": "What is 2+2?",
  "options": ["2", "3", "4", "5"],
  "correctOption": 2,
  "difficulty": "EASY",
  "subject": "Mathematics",
  "topic": "Basic Arithmetic",
  "tags": ["math", "arithmetic", "basic"],
  "author": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### ✅ GET /api/questions/[id]
**Status**: DONE
**Description**: Get a specific question by ID
**Headers**: `x-auth-token: <JWT>`
**Response**: Same as create response

### ✅ PUT /api/questions/[id]
**Status**: DONE
**Description**: Update a question (Author or Admin only)
**Headers**: `x-auth-token: <JWT>`
**Request Body**: Same as create (all fields optional)

### ✅ DELETE /api/questions/[id]
**Status**: DONE
**Description**: Delete a question (Author or Admin only)
**Headers**: `x-auth-token: <JWT>`

### ✅ GET /api/questions
**Status**: DONE
**Description**: Get all questions with pagination and filters
**Headers**: `x-auth-token: <JWT>`
**Query Parameters**:
- `page=1` (default: 1)
- `limit=20` (default: 20, max: 100)
- `subject=Mathematics`
- `difficulty=EASY|MEDIUM|HARD`
- `search=keyword` (searches content, subject, topic, tags)
- `tags=math,algebra` (comma-separated)
- `authorId=uuid`
- `sortBy=createdAt|updatedAt|subject|difficulty` (default: createdAt)
- `sortOrder=asc|desc` (default: desc)
**Response**:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "content": "What is 2+2?",
        "options": ["2", "3", "4", "5"],
        "correctOption": 2,
        "difficulty": "EASY",
        "subject": "Mathematics",
        "topic": "Basic Arithmetic",
        "tags": ["math", "arithmetic"],
        "author": {
          "id": "uuid",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "_count": {
          "exams": 2,
          "examSections": 1
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "subject": "Mathematics",
      "difficulty": "EASY",
      "search": "algebra",
      "tags": ["math", "algebra"],
      "authorId": "uuid"
    },
    "sorting": {
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

### ✅ GET /api/questions/subjects
**Status**: DONE
**Description**: Get all unique subjects with statistics
**Headers**: `x-auth-token: <JWT>`
**Response**:
```json
{
  "success": true,
  "data": {
    "subjects": ["Chemistry", "English", "Mathematics", "Physics"],
    "subjectStats": [
      {
        "name": "Mathematics",
        "questionCount": 45,
        "difficultyBreakdown": {
          "EASY": 15,
          "MEDIUM": 20,
          "HARD": 10
        }
      }
    ],
    "totalSubjects": 4
  }
}
```

### ✅ GET /api/questions/topics
**Status**: DONE
**Description**: Get topics by subject with optional statistics
**Headers**: `x-auth-token: <JWT>`
**Query Parameters**: 
- `subject=Mathematics` (required)
- `includeStats=true` (optional, includes detailed statistics)
**Response**:
```json
{
  "success": true,
  "data": {
    "subject": "Mathematics",
    "topics": ["Algebra", "Calculus", "Geometry", "Statistics"],
    "totalTopics": 4,
    "topicStats": [
      {
        "name": "Algebra",
        "questionCount": 25,
        "difficultyBreakdown": {
          "EASY": 8,
          "MEDIUM": 12,
          "HARD": 5
        },
        "topTags": [
          { "tag": "equations", "count": 10 },
          { "tag": "linear", "count": 8 }
        ]
      }
    ]
  }
}
```

---

## Exam Management APIs

### ❌ POST /api/exams
**Status**: TODO
**Description**: Create a new exam
**Request Body**:
```json
{
  "name": "Mid-term Mathematics Exam",
  "description": "Comprehensive math exam",
  "timeLimit": 120,
  "isPasswordProtected": true,
  "password": "exam123",
  "instructions": "Read all questions carefully",
  "isPublished": false
}
```

### ❌ GET /api/exams
**Status**: TODO
**Description**: Get all exams
**Query Parameters**:
- `published=true`
- `page=1`
- `limit=20`

### ❌ GET /api/exams/[id]
**Status**: TODO
**Description**: Get exam details
**Response**:
```json
{
  "id": "uuid",
  "name": "Mid-term Mathematics Exam",
  "description": "Comprehensive math exam",
  "timeLimit": 120,
  "totalMarks": 100,
  "isPublished": true,
  "isPasswordProtected": true,
  "instructions": "Read all questions carefully",
  "sections": [
    {
      "id": "uuid",
      "name": "Algebra",
      "description": "Algebra questions",
      "timeLimit": 60,
      "marks": 50,
      "questions": []
    }
  ],
  "creator": {
    "id": "uuid",
    "name": "Admin User"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### ❌ PUT /api/exams/[id]
**Status**: TODO
**Description**: Update exam details

### ❌ DELETE /api/exams/[id]
**Status**: TODO
**Description**: Delete exam

### ❌ POST /api/exams/[id]/publish
**Status**: TODO
**Description**: Publish/unpublish exam
**Request Body**:
```json
{
  "isPublished": true
}
```

### ❌ POST /api/exams/[id]/validate-password
**Status**: TODO
**Description**: Validate exam password
**Request Body**:
```json
{
  "password": "exam123"
}
```

---

## Exam Section APIs

### ❌ POST /api/exams/[examId]/sections
**Status**: TODO
**Description**: Create exam section
**Request Body**:
```json
{
  "name": "Algebra Section",
  "description": "Algebra questions",
  "timeLimit": 60,
  "marks": 50
}
```

### ❌ GET /api/exams/[examId]/sections
**Status**: TODO
**Description**: Get all sections for an exam

### ❌ PUT /api/exams/[examId]/sections/[sectionId]
**Status**: TODO
**Description**: Update exam section

### ❌ DELETE /api/exams/[examId]/sections/[sectionId]
**Status**: TODO
**Description**: Delete exam section

### ❌ POST /api/exams/[examId]/sections/[sectionId]/questions
**Status**: TODO
**Description**: Add questions to section
**Request Body**:
```json
{
  "questionIds": ["uuid1", "uuid2", "uuid3"]
}
```

### ❌ DELETE /api/exams/[examId]/sections/[sectionId]/questions/[questionId]
**Status**: TODO
**Description**: Remove question from section

---

## Submission APIs

### ❌ POST /api/exams/[examId]/submissions
**Status**: TODO
**Description**: Submit exam answers
**Request Body**:
```json
{
  "answers": {
    "questionId1": {
      "selectedOption": 2,
      "timeSpent": 45
    },
    "questionId2": {
      "selectedOption": 1,
      "timeSpent": 30
    }
  },
  "totalTimeSpent": 75
}
```

### ❌ GET /api/submissions/[id]
**Status**: TODO
**Description**: Get submission details
**Response**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "examId": "uuid",
  "answers": {},
  "score": 85,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "wrongAnswers": 2,
  "unanswered": 0,
  "percentage": 85,
  "completedAt": "2024-01-01T00:00:00.000Z",
  "exam": {
    "name": "Mid-term Mathematics Exam",
    "totalMarks": 100
  },
  "user": {
    "name": "John Doe"
  }
}
```

### ❌ GET /api/users/[userId]/submissions
**Status**: TODO
**Description**: Get user's submissions

### ❌ GET /api/exams/[examId]/submissions
**Status**: TODO
**Description**: Get all submissions for an exam (Admin only)

---

## Ranking APIs

### ❌ GET /api/exams/[examId]/rankings
**Status**: TODO
**Description**: Get exam rankings
**Response**:
```json
[
  {
    "rank": 1,
    "userId": "uuid",
    "userName": "John Doe",
    "score": 95,
    "percentage": 95,
    "completedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### ❌ GET /api/rankings/global
**Status**: TODO
**Description**: Get global rankings across all exams

### ❌ GET /api/student/ranking (Empty file exists)
**Status**: TODO
**Description**: Get current student's ranking

---

## Admin Dashboard APIs

### ❌ GET /api/admin/stats
**Status**: TODO
**Description**: Get dashboard statistics
**Response**:
```json
{
  "totalUsers": 150,
  "totalExams": 25,
  "totalQuestions": 500,
  "totalSubmissions": 1200,
  "recentUsers": [],
  "recentExams": [],
  "recentSubmissions": []
}
```

### ❌ GET /api/admin/analytics
**Status**: TODO
**Description**: Get detailed analytics data

---

## File Upload APIs

### ❌ POST /api/upload/profile-image
**Status**: TODO
**Description**: Upload user profile image

### ❌ POST /api/upload/question-image
**Status**: TODO
**Description**: Upload image for question content

---

## Search and Filter APIs

### ❌ GET /api/search/questions
**Status**: TODO
**Description**: Advanced question search
**Query Parameters**:
- `q=search term`
- `subject=Mathematics`
- `difficulty=EASY`
- `tags=algebra,geometry`

### ❌ GET /api/search/exams
**Status**: TODO
**Description**: Search exams

---

## Priority Implementation Order

### Phase 1 (Critical for MVP)
1. ❌ GET /api/questions - List questions with pagination
2. ❌ POST /api/exams - Create exam
3. ❌ GET /api/exams - List exams
4. ❌ GET /api/exams/[id] - Get exam details
5. ❌ POST /api/exams/[examId]/sections - Create exam sections
6. ❌ POST /api/exams/[examId]/submissions - Submit exam

### Phase 2 (Enhanced Features)
1. ❌ GET /api/exams/[examId]/rankings - Exam rankings
2. ❌ GET /api/admin/stats - Dashboard stats
3. ❌ POST /api/exams/[id]/publish - Publish exam
4. ❌ POST /api/exams/[id]/validate-password - Password validation

### Phase 3 (Advanced Features)
1. ❌ File upload endpoints
2. ❌ Advanced search endpoints
3. ❌ Analytics endpoints
4. ❌ Global rankings

---

## Database Schema Alignment

Based on the Prisma schema, ensure all APIs align with:
- User roles: ADMIN, USER, GUEST, MODERATOR
- Question difficulties: EASY, MEDIUM, HARD
- Proper foreign key relationships
- UUID primary keys
- Timestamp fields (createdAt, updatedAt)

---

## Security Considerations

1. **Authentication**: JWT tokens with proper expiration
2. **Authorization**: Role-based access control
3. **Validation**: Zod schema validation for all inputs
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **CORS**: Configure proper CORS settings
6. **Input Sanitization**: Sanitize all user inputs
7. **Password Security**: Bcrypt hashing with appropriate salt rounds

---


This documentation provides a comprehensive overview of the current API state and required implementations to replace mock data functionality with real backend endpoints.
