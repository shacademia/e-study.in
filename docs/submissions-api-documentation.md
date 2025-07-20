# Submissions API Documentation

## Overview

The submissions API provides comprehensive management of exam submissions including detailed analytics, scoring, and performance tracking. This endpoint handles CRUD operations for individual submissions with advanced analytics.

## Endpoint

**Base URL:** `/api/submissions/[id]`

**Authentication:** Bearer token required

## Supported Methods

### 1. GET - Retrieve Submission Details

**URL:** `GET /api/submissions/[id]`

**Authentication:** Bearer token required

**Authorization:**
- Users can view their own submissions
- ADMIN and MODERATOR roles can view any submission

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "submission-uuid",
    "userId": "user-uuid",
    "examId": "exam-uuid",
    "score": 85,
    "totalQuestions": 20,
    "timeSpent": 1800,
    "isSubmitted": true,
    "completedAt": "2025-01-20T15:30:00Z",
    "createdAt": "2025-01-20T14:00:00Z",
    "updatedAt": "2025-01-20T15:30:00Z",
    "user": {
      "id": "user-uuid",
      "name": "Student Name",
      "email": "student@example.com"
    },
    "exam": {
      "id": "exam-uuid",
      "name": "Mathematics Final Exam",
      "description": "Comprehensive mathematics assessment",
      "totalMarks": 100,
      "timeLimit": 120
    },
    "statistics": {
      "correctAnswers": 17,
      "wrongAnswers": 2,
      "unanswered": 1,
      "percentage": 85,
      "totalQuestions": 20,
      "totalMarks": 100,
      "earnedMarks": 85,
      "accuracy": 89,
      "timeUtilization": 75
    },
    "questionAnalysis": [
      {
        "questionId": "question-uuid",
        "question": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correctOption": 1,
        "userAnswer": 1,
        "isCorrect": true,
        "timeSpent": 30,
        "status": "ANSWERED",
        "subject": "Mathematics",
        "topic": "Arithmetic",
        "difficulty": "EASY",
        "marks": 5,
        "earnedMarks": 5
      }
    ],
    "subjectAnalysis": {
      "Mathematics": {
        "total": 15,
        "correct": 13,
        "wrong": 1,
        "unanswered": 1,
        "totalMarks": 75,
        "earnedMarks": 65
      },
      "Physics": {
        "total": 5,
        "correct": 4,
        "wrong": 1,
        "unanswered": 0,
        "totalMarks": 25,
        "earnedMarks": 20
      }
    },
    "performance": {
      "grade": "A",
      "remarks": "Very Good"
    }
  },
  "message": "Submission details retrieved successfully"
}
```

**Grade Scale:**
- A+ (90-100%): Excellent
- A (80-89%): Very Good
- B+ (70-79%): Good
- B (60-69%): Satisfactory
- C (50-59%): Needs Improvement
- F (0-49%): Poor

### 2. PUT - Update Submission

**URL:** `PUT /api/submissions/[id]`

**Authentication:** Bearer token required

**Authorization:**
- Users can update their own submissions (if not submitted)
- ADMIN role can update any submission
- MODERATOR role can update any submission

**Request Body:**
```json
{
  "answers": {
    "question-id-1": 2,
    "question-id-2": 0,
    "question-id-3": 1
  },
  "timeSpent": 1200,
  "isSubmitted": false,
  "score": 75
}
```

**Field Descriptions:**
- `answers`: Object mapping question IDs to selected option indices
- `timeSpent`: Time spent in seconds
- `isSubmitted`: Whether the submission is finalized
- `score`: Total score (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "submission-uuid",
    "userId": "user-uuid",
    "examId": "exam-uuid",
    "score": 75,
    "totalQuestions": 20,
    "timeSpent": 1200,
    "isSubmitted": false,
    "completedAt": null,
    "createdAt": "2025-01-20T14:00:00Z",
    "updatedAt": "2025-01-20T15:00:00Z",
    "user": {
      "id": "user-uuid",
      "name": "Student Name",
      "email": "student@example.com"
    },
    "exam": {
      "id": "exam-uuid",
      "name": "Mathematics Final Exam",
      "description": "Comprehensive mathematics assessment",
      "totalMarks": 100,
      "timeLimit": 120
    }
  },
  "message": "Submission updated successfully"
}
```

### 3. DELETE - Delete Submission

**URL:** `DELETE /api/submissions/[id]`

**Authentication:** Bearer token required

**Authorization:**
- Only ADMIN role can delete submissions

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "submission-uuid",
    "userId": "user-uuid",
    "examId": "exam-uuid"
  },
  "message": "Submission deleted successfully and rankings updated"
}
```

**Note:** Deleting a submission will:
1. Remove the submission record
2. Delete associated question statuses
3. Remove related rankings
4. Recalculate rankings for all remaining submissions in the exam

## Usage Examples

### 1. Get Submission Details

```javascript
const getSubmissionDetails = async (submissionId) => {
  const response = await fetch(`/api/submissions/${submissionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Submission details:', result.data);
    console.log('Performance grade:', result.data.performance.grade);
    console.log('Subject analysis:', result.data.subjectAnalysis);
  } else {
    console.error('Failed to get submission:', result.message);
  }
};

// Usage
getSubmissionDetails('submission-uuid-123');
```

### 2. Update Submission Answers

```javascript
const updateSubmission = async (submissionId, answers, timeSpent) => {
  const response = await fetch(`/api/submissions/${submissionId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      answers,
      timeSpent,
      isSubmitted: false
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Submission updated:', result.data);
  } else {
    console.error('Update failed:', result.message);
  }
};

// Usage
const answers = {
  'question-1': 2,
  'question-2': 0,
  'question-3': 1
};
updateSubmission('submission-uuid-123', answers, 1200);
```

### 3. Submit Final Answers

```javascript
const submitExam = async (submissionId, finalAnswers, totalTimeSpent) => {
  const response = await fetch(`/api/submissions/${submissionId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      answers: finalAnswers,
      timeSpent: totalTimeSpent,
      isSubmitted: true
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Exam submitted successfully!');
    console.log('Final score:', result.data.score);
  } else {
    console.error('Submission failed:', result.message);
  }
};

// Usage
submitExam('submission-uuid-123', finalAnswers, 3600);
```

### 4. Delete Submission (Admin Only)

```javascript
const deleteSubmission = async (submissionId) => {
  const response = await fetch(`/api/submissions/${submissionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Submission deleted successfully');
  } else {
    console.error('Deletion failed:', result.message);
  }
};

// Usage (admin only)
deleteSubmission('submission-uuid-123');
```

## Analytics Features

### Performance Metrics
- **Accuracy**: Percentage of correct answers among attempted questions
- **Time Utilization**: Percentage of allocated time used
- **Grade Calculation**: Letter grade based on percentage score
- **Performance Remarks**: Descriptive feedback based on score

### Subject-wise Analysis
- Total questions per subject
- Correct, wrong, and unanswered counts
- Marks breakdown per subject
- Subject-specific performance metrics

### Question-level Analytics
- Individual question performance
- Time spent per question
- Question status tracking
- Difficulty-based analysis

## Security Features

### Authentication & Authorization
- JWT token validation for all operations
- Role-based access control
- User ownership verification
- Admin-only deletion capability

### Data Protection
- Prevents updates to submitted exams (except by admins)
- Secure answer storage and retrieval
- Protection against unauthorized access
- Audit trail through timestamps

### Input Validation
- Submission ID validation
- Request body validation
- Authorization checks
- Data integrity verification

## Error Handling

### Common Errors

**401 Unauthorized - Missing Token:**
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**403 Forbidden - Unauthorized Access:**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

**403 Forbidden - Cannot Update Submitted:**
```json
{
  "success": false,
  "error": "Cannot update already submitted submission"
}
```

**404 Not Found - Submission Not Found:**
```json
{
  "success": false,
  "error": "Submission not found"
}
```

**400 Bad Request - Missing ID:**
```json
{
  "success": false,
  "error": "Submission ID is required"
}
```

## Frontend Integration

### React Hook for Submission Management

```javascript
import { useState, useEffect } from 'react';

const useSubmission = (submissionId) => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubmission = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmission(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch submission');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmission = async (updateData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmission(result.data);
        return result.data;
      } else {
        setError(result.message);
        throw new Error(result.message);
      }
    } catch (err) {
      setError('Failed to update submission');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  return {
    submission,
    loading,
    error,
    updateSubmission,
    refetch: fetchSubmission
  };
};

// Usage in component
const ExamPage = ({ submissionId }) => {
  const { submission, loading, error, updateSubmission } = useSubmission(submissionId);

  const handleAnswerChange = async (questionId, answerIndex) => {
    if (submission && !submission.isSubmitted) {
      const newAnswers = {
        ...submission.answers,
        [questionId]: answerIndex
      };
      
      try {
        await updateSubmission({
          answers: newAnswers,
          timeSpent: submission.timeSpent + 1
        });
      } catch (err) {
        console.error('Failed to save answer:', err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!submission) return <div>No submission found</div>;

  return (
    <div>
      <h1>{submission.exam.name}</h1>
      <div>Score: {submission.score}/{submission.exam.totalMarks}</div>
      <div>Grade: {submission.performance?.grade}</div>
      {/* Render questions and answers */}
    </div>
  );
};
```

### Performance Dashboard Component

```javascript
const PerformanceDashboard = ({ submission }) => {
  const { statistics, subjectAnalysis, performance } = submission;

  return (
    <div className="performance-dashboard">
      <div className="overall-stats">
        <h2>Overall Performance</h2>
        <div className="stat-cards">
          <div className="stat-card">
            <h3>Score</h3>
            <p>{statistics.earnedMarks}/{statistics.totalMarks}</p>
            <p>{statistics.percentage}%</p>
          </div>
          <div className="stat-card">
            <h3>Grade</h3>
            <p className={`grade grade-${performance.grade.toLowerCase()}`}>
              {performance.grade}
            </p>
            <p>{performance.remarks}</p>
          </div>
          <div className="stat-card">
            <h3>Accuracy</h3>
            <p>{statistics.accuracy}%</p>
            <p>{statistics.correctAnswers}/{statistics.correctAnswers + statistics.wrongAnswers} attempted</p>
          </div>
          <div className="stat-card">
            <h3>Time</h3>
            <p>{Math.floor(statistics.timeUtilization)}%</p>
            <p>{Math.floor(submission.timeSpent / 60)} minutes used</p>
          </div>
        </div>
      </div>

      <div className="subject-analysis">
        <h2>Subject-wise Performance</h2>
        <div className="subject-cards">
          {Object.entries(subjectAnalysis).map(([subject, data]) => (
            <div key={subject} className="subject-card">
              <h3>{subject}</h3>
              <div className="subject-stats">
                <p>Correct: {data.correct}/{data.total}</p>
                <p>Score: {data.earnedMarks}/{data.totalMarks}</p>
                <p>Percentage: {Math.round((data.earnedMarks / data.totalMarks) * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## Database Operations

### Ranking Recalculation
When a submission is deleted, the system automatically:
1. Removes the submission and related data
2. Deletes associated question statuses
3. Removes related rankings
4. Recalculates rankings for remaining submissions
5. Updates ranking positions based on score, time, and completion order

### Data Consistency
- Uses database transactions for deletion operations
- Maintains referential integrity
- Ensures ranking consistency after modifications
- Proper cascade handling for related records

## Performance Considerations

### Database Optimization
- Efficient queries with proper includes
- Selective field projection
- Optimized aggregation queries
- Transaction-based operations for consistency

### Response Optimization
- Comprehensive analytics in single request
- Calculated fields for frontend convenience
- Structured data for easy consumption
- Minimal database round trips

This comprehensive submissions API provides complete exam submission management with detailed analytics and secure operations!
