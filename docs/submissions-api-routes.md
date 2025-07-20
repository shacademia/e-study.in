# Submissions API Routes - Updated with Prisma

All submission routes have been updated to use Prisma instead of mock data. Here's a comprehensive overview:

## Routes Overview

### 1. Main Submissions Route: `/api/submissions`
**File**: `src/app/api/submissions/route.ts`

#### GET - Get all submissions (with filtering)
- **Authentication**: Required (JWT token)
- **Authorization**: Users see only their own submissions, Admin/Moderator see all
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `examId` (optional): Filter by exam ID
  - `userId` (optional): Filter by user ID (admin only)
  - `sortBy` (optional): Sort field (createdAt, score, completedAt) (default: createdAt)
  - `sortOrder` (optional): Sort order (asc, desc) (default: desc)

#### POST - Create new submission (submit exam)
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "examId": "uuid",
    "answers": { "questionId": selectedOption },
    "questionStatuses": { 
      "questionId": {
        "status": "NOT_ANSWERED|ANSWERED|MARKED_FOR_REVIEW",
        "answer": number,
        "timeSpent": number
      }
    },
    "timeSpent": number
  }
  ```
- **Features**:
  - Automatic score calculation
  - Creates/updates question statuses
  - Creates/updates rankings
  - Prevents duplicate submissions

### 2. Draft Submissions Route: `/api/submissions/draft`
**File**: `src/app/api/submissions/draft/route.ts`

#### POST - Save draft submission (auto-save)
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "examId": "uuid",
    "answers": { "questionId": selectedOption },
    "questionStatuses": { 
      "questionId": {
        "status": "NOT_ANSWERED|ANSWERED|MARKED_FOR_REVIEW",
        "answer": number,
        "timeSpent": number
      }
    },
    "timeSpent": number,
    "currentQuestionId": "uuid",
    "sectionId": "uuid"
  }
  ```

#### GET - Get draft submission
- **Authentication**: Required (JWT token)
- **Query Parameters**:
  - `examId`: Required exam ID

#### DELETE - Delete draft submission
- **Authentication**: Required (JWT token)
- **Query Parameters**:
  - `examId`: Required exam ID

### 3. Individual Submission Route: `/api/submissions/[id]`
**File**: `src/app/api/submissions/[id]/route.ts`

#### GET - Get submission details
- **Authentication**: Required (JWT token)
- **Authorization**: Users can only see their own submissions, Admin/Moderator see all
- **Features**:
  - Detailed question analysis
  - Subject-wise statistics
  - Performance metrics and grades
  - Time utilization analysis

#### PUT - Update submission (Admin only)
- **Authentication**: Required (JWT token)
- **Authorization**: Admin/Moderator only
- **Request Body**:
  ```json
  {
    "score": number,
    "isSubmitted": boolean,
    "completedAt": "ISO date string"
  }
  ```

#### DELETE - Delete submission (Admin only)
- **Authentication**: Required (JWT token)
- **Authorization**: Admin/Moderator only

### 4. Exam Submissions Route: `/api/submissions/exam/[examId]`
**File**: `src/app/api/submissions/exam/[examId]/route.ts`

#### GET - Get submissions by exam
- **Authentication**: Required (JWT token)
- **Authorization**: Users see only their own submissions, Admin/Moderator see all
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Sort field (score, completedAt, timeSpent, createdAt)
  - `sortOrder` (optional): Sort order (asc, desc)
  - `includeDetails` (optional): Include detailed statistics (boolean)
  - `status` (optional): Filter by status (submitted, draft, all)

### 5. User Submissions Route: `/api/submissions/user/[userId]`
**File**: `src/app/api/submissions/user/[userId]/route.ts`

#### GET - Get submissions by user
- **Authentication**: Required (JWT token)
- **Authorization**: Users can only see their own submissions, Admin/Moderator see all
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `examId` (optional): Filter by exam ID
  - `sortBy` (optional): Sort field (score, completedAt, timeSpent, createdAt)
  - `sortOrder` (optional): Sort order (asc, desc)
  - `includeStats` (optional): Include user statistics (boolean)
  - `status` (optional): Filter by status (submitted, draft, all)

## Key Features Implemented

### 1. Authentication & Authorization
- JWT token validation on all routes
- Role-based access control (Admin, Moderator, User)
- Users can only access their own data unless admin

### 2. Data Validation
- Zod schemas for request validation
- Type-safe parameter parsing
- Comprehensive error handling

### 3. Database Operations
- Proper Prisma queries with relations
- Optimized queries with selective field inclusion
- Cascade operations for data consistency

### 4. Scoring System
- Automatic score calculation based on correct answers
- Marks per question support
- Percentage calculations

### 5. Question Status Management
- Individual question status tracking
- Time spent per question
- Answer recording for each question

### 6. Statistics & Analytics
- User performance statistics
- Exam-wide statistics
- Subject-wise analysis
- Time utilization metrics
- Grade calculation

### 7. Draft System
- Auto-save functionality
- Resume exam capability
- Draft vs submitted state management

## Database Schema Integration

The routes work with the following Prisma models:
- `Submission`: Main submission data
- `QuestionStatus`: Individual question tracking
- `Ranking`: Exam rankings
- `User`: User information
- `Exam`: Exam details
- `Question`: Question data
- `ExamQuestion`: Exam-question relationships

## Error Handling

All routes include:
- JWT token validation
- Database error handling
- Input validation errors
- Authorization errors
- Resource not found errors
- Proper HTTP status codes

## Response Format

All routes follow a consistent response format:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error"?: string,
  "details"?: any
}
```

## Authentication Headers

All requests require:
```
x-auth-token: <JWT_TOKEN>
```

This implementation provides a complete, production-ready submissions API system with proper authentication, authorization, validation, and comprehensive functionality for an e-learning platform.
