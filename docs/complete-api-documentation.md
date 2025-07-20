# 🚀 E-Study.in Complete API Documentation

## 📋 Table of Contents
1. [Authentication APIs](#1-authentication-apis)
2. [User Management APIs](#2-user-management-apis)
3. [Question Management APIs](#3-question-management-apis)
4. [Exam Management APIs](#4-exam-management-apis)
5. [Exam Sections APIs](#5-exam-sections-apis)
6. [Submissions APIs](#6-submissions-apis)
7. [Rankings APIs](#7-rankings-apis)
8. [Admin APIs](#8-admin-apis)
9. [Upload APIs](#9-upload-apis)
10. [Search APIs](#10-search-apis)
11. [Student APIs](#11-student-apis)
12. [Testing Examples](#12-testing-examples)

---

## 🔐 Authentication & Headers

### Required Headers
All protected endpoints require authentication via middleware:

```http
Authorization: Bearer <jwt_token>
# OR (legacy support)
x-auth-token: <jwt_token>
Content-Type: application/json
```

### Authentication Flow
1. **Signup** → Get initial token
2. **Login** → Get token for subsequent requests
3. **Use token** in Authorization header for all protected endpoints
4. **Logout** to invalidate token

---

## 1. Authentication APIs

### 🟢 POST /api/users/signup
**Description**: Register a new user account  
**Auth Required**: ❌ No  
**Permissions**: Public  

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "USER"
}
```

**Response (201)**:
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Postman Example**:
```javascript
// POST {{base_url}}/api/users/signup
// Body (raw JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPassword123!",
  "role": "USER"
}

// Test Script:
pm.test("Signup successful", function () {
    pm.response.to.have.status(201);
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.environment.set("auth_token", jsonData.token);
    pm.environment.set("user_id", jsonData.user.id);
});
```

### 🟢 POST /api/users/login
**Description**: Authenticate user and get access token  
**Auth Required**: ❌ No  
**Permissions**: Public  

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Postman Example**:
```javascript
// POST {{base_url}}/api/users/login
// Body (raw JSON):
{
  "email": "admin@example.com",
  "password": "admin123"
}

// Test Script:
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.environment.set("auth_token", jsonData.token);
    pm.environment.set("user_id", jsonData.user.id);
    pm.environment.set("user_role", jsonData.user.role);
});
```

### 🟢 GET /api/users/logout
**Description**: Logout user and invalidate token  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Response (200)**:
```json
{
  "message": "Logout successful"
}
```

**Postman Example**:
```javascript
// GET {{base_url}}/api/users/logout
// Headers: Authorization: Bearer {{auth_token}}

// Test Script:
pm.test("Logout successful", function () {
    pm.response.to.have.status(200);
    pm.environment.unset("auth_token");
    pm.environment.unset("user_id");
});
```

---

## 2. User Management APIs

### 🟢 GET /api/users/me/[me]
**Description**: Get current user profile  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "profileImage": "https://...",
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  }
}
```

**Postman Example**:
```javascript
// GET {{base_url}}/api/users/me/current
// Headers: Authorization: Bearer {{auth_token}}

pm.test("Get current user", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('id');
});
```

### 🟢 PUT /api/users/updateuserprofile
**Description**: Update user profile information  
**Auth Required**: ✅ Yes  
**Permissions**: User can update own profile, Admin can update any  

**Request Body**:
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "newemail@example.com",
    "name": "Updated Name",
    "role": "USER",
    "updatedAt": "2025-01-20T12:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

**Postman Example**:
```javascript
// PUT {{base_url}}/api/users/updateuserprofile
// Headers: Authorization: Bearer {{auth_token}}
// Body (raw JSON):
{
  "name": "Updated User Name",
  "email": "updated@example.com"
}

pm.test("Profile update successful", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

### 🟢 GET /api/users/all
**Description**: Get all users (Admin only)  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

**Response (200)**:
```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  }
]
```

**Postman Example**:
```javascript
// GET {{base_url}}/api/users/all
// Headers: Authorization: Bearer {{auth_token}}

pm.test("Get all users", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

### 🟢 GET /api/users/admins
**Description**: Get all admin users  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

**Response (200)**:
```json
[
  {
    "id": "admin-uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  }
]
```

### 🟢 PUT /api/users/[id]/role
**Description**: Update user role (Admin only)  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN only  

**Request Body**:
```json
{
  "role": "MODERATOR"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "MODERATOR",
    "updatedAt": "2025-01-20T12:00:00.000Z"
  },
  "message": "User role updated successfully"
}
```

**Postman Example**:
```javascript
// PUT {{base_url}}/api/users/{{user_id}}/role
// Headers: Authorization: Bearer {{auth_token}}
// Body (raw JSON):
{
  "role": "MODERATOR"
}

pm.test("Role update successful", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.role).to.eql("MODERATOR");
});
```

### 🟢 DELETE /api/users/[id]
**Description**: Delete user account (Admin only)  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN only  

**Response (200)**:
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deletedUserId": "user-uuid",
    "deletedSubmissions": 5,
    "deletedRankings": 3
  }
}
```

**Postman Example**:
```javascript
// DELETE {{base_url}}/api/users/{{user_id_to_delete}}
// Headers: Authorization: Bearer {{auth_token}}

pm.test("User deletion successful", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

### 🟢 GET /api/users/[id]/submissions
**Description**: Get user's submissions  
**Auth Required**: ✅ Yes  
**Permissions**: User can view own, Admin can view any  

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `examId` (optional): Filter by exam ID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "submission-uuid",
        "examId": "exam-uuid",
        "score": 85,
        "totalQuestions": 20,
        "timeSpent": 1800,
        "isSubmitted": true,
        "completedAt": "2025-01-20T15:30:00Z",
        "exam": {
          "id": "exam-uuid",
          "name": "Mathematics Test",
          "totalMarks": 100
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 15,
      "itemsPerPage": 20
    }
  }
}
```

---

## 3. Question Management APIs

### 🟢 POST /api/questions/create
**Description**: Create a new question  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

**Request Body**:
```json
{
  "content": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correctOption": 2,
  "difficulty": "EASY",
  "subject": "Geography",
  "topic": "World Capitals",
  "tags": ["geography", "capitals", "europe"],
  "marks": 5
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "question-uuid",
    "content": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctOption": 2,
    "difficulty": "EASY",
    "subject": "Geography",
    "topic": "World Capitals",
    "tags": ["geography", "capitals", "europe"],
    "marks": 5,
    "author": {
      "id": "author-uuid",
      "name": "Question Author",
      "email": "author@example.com"
    },
    "createdAt": "2025-01-20T10:00:00Z"
  },
  "message": "Question created successfully"
}
```

**Postman Example**:
```javascript
// POST {{base_url}}/api/questions/create
// Headers: Authorization: Bearer {{auth_token}}
// Body (raw JSON):
{
  "content": "What is 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correctOption": 1,
  "difficulty": "EASY",
  "subject": "Mathematics",
  "topic": "Arithmetic",
  "tags": ["math", "basic"],
  "marks": 5
}

pm.test("Question created", function () {
    pm.response.to.have.status(201);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.environment.set("question_id", jsonData.data.id);
});
```

### 🟢 GET /api/questions
**Description**: Get all questions with pagination and filters  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `subject` (optional): Filter by subject
- `difficulty` (optional): EASY | MEDIUM | HARD
- `search` (optional): Search in content
- `tags` (optional): Comma-separated tags
- `authorId` (optional): Filter by author
- `sortBy` (optional): createdAt | updatedAt | subject | difficulty
- `sortOrder` (optional): asc | desc

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "question-uuid",
        "content": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correctOption": 2,
        "difficulty": "EASY",
        "subject": "Geography",
        "topic": "World Capitals",
        "tags": ["geography", "capitals"],
        "marks": 5,
        "author": {
          "id": "author-uuid",
          "name": "Question Author"
        },
        "createdAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "subject": "Geography",
      "difficulty": "EASY",
      "search": null
    }
  }
}
```

**Postman Example**:
```javascript
// GET {{base_url}}/api/questions?page=1&limit=10&subject=Mathematics&difficulty=EASY
// Headers: Authorization: Bearer {{auth_token}}

pm.test("Get questions", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.questions).to.be.an('array');
});
```

### 🟢 GET /api/questions/[id]
**Description**: Get specific question details  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "question-uuid",
    "content": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctOption": 2,
    "difficulty": "EASY",
    "subject": "Geography",
    "topic": "World Capitals",
    "tags": ["geography", "capitals"],
    "marks": 5,
    "author": {
      "id": "author-uuid",
      "name": "Question Author",
      "email": "author@example.com"
    },
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

### 🟢 PUT /api/questions/[id]
**Description**: Update question  
**Auth Required**: ✅ Yes  
**Permissions**: Author or ADMIN can edit  

**Request Body**:
```json
{
  "content": "Updated question content?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctOption": 1,
  "difficulty": "MEDIUM",
  "subject": "Updated Subject",
  "topic": "Updated Topic",
  "tags": ["updated", "tags"],
  "marks": 10
}
```

### 🟢 DELETE /api/questions/[id]
**Description**: Delete question  
**Auth Required**: ✅ Yes  
**Permissions**: Author or ADMIN can delete  

**Response (200)**:
```json
{
  "success": true,
  "message": "Question deleted successfully",
  "data": {
    "deletedQuestionId": "question-uuid"
  }
}
```

### 🟢 GET /api/questions/subjects
**Description**: Get all unique subjects  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Response (200)**:
```json
{
  "success": true,
  "data": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Geography",
    "History"
  ]
}
```

### 🟢 GET /api/questions/topics
**Description**: Get topics by subject  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Query Parameters**:
- `subject` (required): Subject name

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "subject": "Mathematics",
    "topics": [
      "Algebra",
      "Geometry",
      "Trigonometry",
      "Calculus",
      "Statistics"
    ]
  }
}
```

---

## 4. Exam Management APIs

### 🟢 POST /api/exams
**Description**: Create a new exam  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

**Request Body**:
```json
{
  "name": "Mathematics Final Exam",
  "description": "Comprehensive mathematics assessment",
  "timeLimit": 120,
  "isPasswordProtected": true,
  "password": "exam123",
  "instructions": "Read all questions carefully before answering."
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "exam-uuid",
    "name": "Mathematics Final Exam",
    "description": "Comprehensive mathematics assessment",
    "timeLimit": 120,
    "isPasswordProtected": true,
    "password": null,
    "instructions": "Read all questions carefully before answering.",
    "isPublished": false,
    "isDraft": true,
    "totalMarks": 0,
    "questionsCount": 0,
    "createdBy": {
      "id": "creator-uuid",
      "name": "Exam Creator",
      "email": "creator@example.com"
    },
    "createdAt": "2025-01-20T10:00:00Z"
  },
  "message": "Exam created successfully"
}
```

**Postman Example**:
```javascript
// POST {{base_url}}/api/exams
// Headers: Authorization: Bearer {{auth_token}}
// Body (raw JSON):
{
  "name": "Test Exam",
  "description": "A test exam for API testing",
  "timeLimit": 60,
  "isPasswordProtected": false,
  "instructions": "Answer all questions to the best of your ability."
}

pm.test("Exam created", function () {
    pm.response.to.have.status(201);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.environment.set("exam_id", jsonData.data.id);
});
```

### 🟢 GET /api/exams
**Description**: Get all exams with pagination and filters  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user (published only), ADMIN/MODERATOR (all)  

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `published` (optional): true | false (Admin only)
- `search` (optional): Search in name/description
- `sortBy` (optional): createdAt | updatedAt | name
- `sortOrder` (optional): asc | desc

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "exam-uuid",
        "name": "Mathematics Final Exam",
        "description": "Comprehensive mathematics assessment",
        "timeLimit": 120,
        "isPasswordProtected": true,
        "isPublished": true,
        "isDraft": false,
        "totalMarks": 100,
        "questionsCount": 20,
        "sectionsCount": 3,
        "submissionsCount": 15,
        "createdBy": {
          "id": "creator-uuid",
          "name": "Exam Creator"
        },
        "createdAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 🟢 GET /api/exams/[id]
**Description**: Get specific exam details  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "exam-uuid",
    "name": "Mathematics Final Exam",
    "description": "Comprehensive mathematics assessment",
    "timeLimit": 120,
    "isPasswordProtected": true,
    "instructions": "Read all questions carefully",
    "isPublished": true,
    "isDraft": false,
    "totalMarks": 100,
    "createdBy": {
      "id": "creator-uuid",
      "name": "Exam Creator",
      "email": "creator@example.com"
    },
    "sections": [
      {
        "id": "section-uuid",
        "name": "Algebra",
        "description": "Algebraic problems",
        "timeLimit": 40,
        "marks": 40,
        "questionsCount": 8
      }
    ],
    "questions": [
      {
        "id": "question-uuid",
        "content": "What is x + 5 = 10?",
        "options": ["3", "5", "7", "10"],
        "difficulty": "EASY",
        "subject": "Mathematics",
        "marks": 5
      }
    ],
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

### 🟢 PUT /api/exams/[id]
**Description**: Update exam details  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR, or exam creator  

**Request Body**:
```json
{
  "name": "Updated Exam Name",
  "description": "Updated description",
  "timeLimit": 150,
  "isPasswordProtected": false,
  "instructions": "Updated instructions"
}
```

### 🟢 DELETE /api/exams/[id]
**Description**: Delete exam  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN or exam creator  

**Response (200)**:
```json
{
  "success": true,
  "message": "Exam deleted successfully",
  "data": {
    "deletedExamId": "exam-uuid",
    "deletedSections": 3,
    "deletedSubmissions": 15,
    "deletedRankings": 15
  }
}
```

### 🟢 POST /api/exams/[id]/publish
**Description**: Publish or unpublish exam  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR, or exam creator  

**Request Body**:
```json
{
  "isPublished": true
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "exam-uuid",
    "name": "Mathematics Final Exam",
    "isPublished": true,
    "isDraft": false,
    "publishedAt": "2025-01-20T12:00:00Z"
  },
  "message": "Exam published successfully"
}
```

### 🟢 POST /api/exams/[id]/validate-password
**Description**: Validate exam password before access  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Request Body**:
```json
{
  "password": "exam123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password is correct",
  "data": {
    "examId": "exam-uuid",
    "isValid": true
  }
}
```

---

## 5. Exam Sections APIs

### 🟢 POST /api/exams/[id]/sections
**Description**: Create exam section  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR, or exam creator  

**Request Body**:
```json
{
  "name": "Algebra Section",
  "description": "Questions related to algebraic concepts",
  "timeLimit": 45,
  "marks": 50
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "section-uuid",
    "name": "Algebra Section",
    "description": "Questions related to algebraic concepts",
    "timeLimit": 45,
    "marks": 50,
    "examId": "exam-uuid",
    "questionsCount": 0,
    "createdAt": "2025-01-20T10:00:00Z"
  },
  "message": "Section created successfully"
}
```

### 🟢 GET /api/exams/[id]/sections
**Description**: Get all sections for an exam  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "section-uuid",
      "name": "Algebra Section",
      "description": "Questions related to algebraic concepts",
      "timeLimit": 45,
      "marks": 50,
      "questionsCount": 10,
      "questions": [
        {
          "id": "question-uuid",
          "content": "Solve for x: 2x + 5 = 15",
          "difficulty": "MEDIUM",
          "marks": 5
        }
      ]
    }
  ]
}
```

### 🟢 GET /api/exams/exam/[examId]/sections
**Description**: Get sections with full details (alternative endpoint)  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

### 🟢 GET /api/exams/exam/[examId]/sections/[sectionId]
**Description**: Get specific section details  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

### 🟢 PUT /api/exams/exam/[examId]/sections/[sectionId]
**Description**: Update section details  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR, or exam creator  

### 🟢 DELETE /api/exams/exam/[examId]/sections/[sectionId]
**Description**: Delete section  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR, or exam creator  

### 🟢 POST /api/exams/exam/[examId]/sections/[sectionId]/questions
**Description**: Add questions to section  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR, or exam creator  

**Request Body**:
```json
{
  "questions": [
    {
      "questionId": "question-uuid-1",
      "order": 1
    },
    {
      "questionId": "question-uuid-2",
      "order": 2
    }
  ]
}
```

### 🟢 DELETE /api/exams/exam/[examId]/sections/[sectionId]/questions/[questionId]
**Description**: Remove question from section  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR, or exam creator  

---

## 6. Submissions APIs

### 🟢 GET /api/submissions
**Description**: Get all submissions with filtering  
**Auth Required**: ✅ Yes  
**Permissions**: User sees own, ADMIN/MODERATOR see all  

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `examId` (optional): Filter by exam
- `userId` (optional): Filter by user (Admin only)
- `sortBy` (optional): createdAt | updatedAt | score
- `sortOrder` (optional): asc | desc

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "submission-uuid",
        "userId": "user-uuid",
        "examId": "exam-uuid",
        "score": 85,
        "totalQuestions": 20,
        "timeSpent": 1800,
        "isSubmitted": true,
        "completedAt": "2025-01-20T15:30:00Z",
        "user": {
          "name": "Student Name",
          "email": "student@example.com"
        },
        "exam": {
          "name": "Mathematics Test",
          "totalMarks": 100
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100
    }
  }
}
```

### 🟢 GET /api/submissions/[id]
**Description**: Get specific submission details with analytics  
**Auth Required**: ✅ Yes  
**Permissions**: User can view own, ADMIN/MODERATOR can view any  

**Response (200)**:
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
    "user": {
      "name": "Student Name",
      "email": "student@example.com"
    },
    "exam": {
      "name": "Mathematics Final Exam",
      "totalMarks": 100,
      "timeLimit": 120
    },
    "statistics": {
      "correctAnswers": 17,
      "wrongAnswers": 2,
      "unanswered": 1,
      "percentage": 85,
      "accuracy": 89,
      "timeUtilization": 75
    },
    "questionAnalysis": [
      {
        "questionId": "question-uuid",
        "question": "What is 2 + 2?",
        "userAnswer": 1,
        "correctOption": 1,
        "isCorrect": true,
        "timeSpent": 30,
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
      }
    },
    "performance": {
      "grade": "A",
      "remarks": "Very Good"
    }
  }
}
```

### 🟢 PUT /api/submissions/[id]
**Description**: Update submission answers  
**Auth Required**: ✅ Yes  
**Permissions**: User can update own (if not submitted), ADMIN can update any  

**Request Body**:
```json
{
  "answers": {
    "question-id-1": 2,
    "question-id-2": 0,
    "question-id-3": 1
  },
  "timeSpent": 1200,
  "isSubmitted": false
}
```

### 🟢 DELETE /api/submissions/[id]
**Description**: Delete submission (Admin only)  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN only  

### 🟢 POST /api/exams/[examId]/submissions
**Description**: Submit exam or create draft submission  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Request Body**:
```json
{
  "answers": {
    "question-uuid-1": 2,
    "question-uuid-2": 0,
    "question-uuid-3": 1
  },
  "timeSpent": 3600,
  "isSubmitted": true
}
```

### 🟢 GET /api/exams/[examId]/submissions
**Description**: Get all submissions for an exam (Admin only)  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

### 🟢 GET /api/submissions/user/[userId]
**Description**: Get submissions for specific user  
**Auth Required**: ✅ Yes  
**Permissions**: User can view own, ADMIN can view any  

### 🟢 GET /api/submissions/exam/[examId]
**Description**: Get submissions for specific exam  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

### 🟢 GET /api/submissions/draft
**Description**: Get draft submissions  
**Auth Required**: ✅ Yes  
**Permissions**: User sees own drafts  

---

## 7. Rankings APIs

### 🟢 GET /api/rankings
**Description**: Get general rankings  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

### 🟢 GET /api/rankings/global
**Description**: Get global rankings across all exams  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `timeframe` (optional): 7d | 30d | 90d | all

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "userId": "user-uuid",
        "userName": "Top Student",
        "userEmail": "top@example.com",
        "totalScore": 950,
        "totalMarks": 1000,
        "percentage": 95,
        "examsTaken": 10,
        "averageScore": 95,
        "totalTimeSpent": 18000
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 250
    },
    "filters": {
      "timeframe": "30d"
    }
  }
}
```

### 🟢 GET /api/rankings/exam/[examId]
**Description**: Get rankings for specific exam  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

### 🟢 GET /api/exams/exam/[examId]/rankings
**Description**: Get exam rankings (alternative endpoint)  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

### 🟢 GET /api/student/ranking
**Description**: Get current student's ranking  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "globalRank": 15,
    "totalStudents": 500,
    "percentile": 97,
    "totalScore": 850,
    "totalMarks": 1000,
    "percentage": 85,
    "examsTaken": 8,
    "averageScore": 85,
    "recentPerformance": [
      {
        "examId": "exam-uuid",
        "examName": "Math Test",
        "score": 90,
        "rank": 5,
        "totalParticipants": 50
      }
    ]
  }
}
```

---

## 8. Admin APIs

### 🟢 GET /api/admin/stats
**Description**: Get dashboard statistics  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

**Query Parameters**:
- `timeframe` (optional): 7d | 30d | 90d | all (default: 30d)
- `includeRecent` (optional): true | false (default: false)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 500,
      "totalStudents": 450,
      "totalAdmins": 5,
      "totalExams": 25,
      "publishedExams": 20,
      "draftExams": 5,
      "totalQuestions": 1000,
      "totalSubmissions": 2500,
      "completedSubmissions": 2000
    },
    "growth": {
      "newUsers": 25,
      "newExams": 3,
      "newQuestions": 50,
      "newSubmissions": 150
    },
    "examStats": {
      "averageTimeLimit": 120,
      "averageTotalMarks": 100,
      "totalSections": 75
    },
    "submissionStats": {
      "averageScore": 75.5,
      "averageTimeSpent": 3600,
      "completionRate": 85
    },
    "topSubjects": [
      {
        "subject": "Mathematics",
        "count": 300
      }
    ],
    "topUsers": [
      {
        "userId": "user-uuid",
        "userName": "Top Student",
        "averagePercentage": 95,
        "examCount": 10
      }
    ],
    "popularExams": [
      {
        "examId": "exam-uuid",
        "examName": "Math Final",
        "submissionCount": 150
      }
    ],
    "systemHealth": {
      "activeUserRate": 75,
      "examCompletionRate": 85,
      "systemUptimeHours": 720
    }
  }
}
```

**Postman Example**:
```javascript
// GET {{base_url}}/api/admin/stats?timeframe=30d&includeRecent=true
// Headers: Authorization: Bearer {{auth_token}}

pm.test("Admin stats retrieved", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('overview');
});
```

### 🟢 GET /api/admin/analytics
**Description**: Get detailed analytics data  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

**Query Parameters**:
- `timeframe` (optional): 7d | 30d | 90d | all (default: 30d)
- `includeCharts` (optional): true | false (default: true)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "performanceMetrics": {
      "averageScore": 75.5,
      "medianScore": 78,
      "scoreDistribution": {
        "0-20": 5,
        "21-40": 10,
        "41-60": 25,
        "61-80": 35,
        "81-100": 25
      }
    },
    "timeAnalytics": {
      "averageTimeSpent": 3600,
      "timeDistribution": {
        "0-30min": 10,
        "31-60min": 30,
        "61-90min": 40,
        "91-120min": 20
      }
    },
    "chartData": {
      "dailyActivity": [
        {
          "date": "2025-01-20",
          "submissions": 45,
          "activeUsers": 120
        }
      ],
      "userRegistrations": [
        {
          "date": "2025-01-20",
          "registrations": 5
        }
      ],
      "subjectPopularity": [
        {
          "subject": "Mathematics",
          "submissions": 500,
          "avgScore": 78
        }
      ]
    },
    "trends": {
      "submissionGrowth": 15.5,
      "userGrowth": 8.2,
      "scoreImprovement": 3.1
    }
  }
}
```

### 🟢 GET /api/admin/overview
**Description**: Get admin overview data  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

### 🟢 GET /api/admin/users
**Description**: Get comprehensive user management data  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

---

## 9. Upload APIs

### 🟢 POST /api/upload/profile-image
**Description**: Upload user profile image  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Request Body**: Form-data
- `file`: Image file (jpg, jpeg, png, gif, webp)
- Max size: 5MB

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://supabase-storage-url/profile-images/user-uuid/image.jpg",
    "fileName": "profile-image-1642680000000.jpg",
    "fileSize": 1024576,
    "mimeType": "image/jpeg"
  },
  "message": "Profile image uploaded successfully"
}
```

**Postman Example**:
```javascript
// POST {{base_url}}/api/upload/profile-image
// Headers: Authorization: Bearer {{auth_token}}
// Body: form-data
// Key: file, Value: [Select File]

pm.test("Profile image uploaded", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('imageUrl');
});
```

### 🟢 POST /api/upload/question-image
**Description**: Upload image for questions  
**Auth Required**: ✅ Yes  
**Permissions**: ADMIN, MODERATOR  

**Request Body**: Form-data
- `file`: Image file (jpg, jpeg, png, gif, webp)
- `questionId` (optional): Associate with specific question
- Max size: 10MB

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://supabase-storage-url/question-images/question-uuid/image.jpg",
    "fileName": "question-image-1642680000000.jpg",
    "fileSize": 2048576,
    "mimeType": "image/png",
    "questionId": "question-uuid"
  },
  "message": "Question image uploaded successfully"
}
```

---

## 10. Search APIs

### 🟢 GET /api/search/questions
**Description**: Advanced question search with filtering  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Query Parameters**:
- `q` (required): Search query
- `subjects` (optional): Comma-separated subjects
- `difficulties` (optional): Comma-separated difficulties
- `tags` (optional): Comma-separated tags
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): relevance | createdAt | difficulty
- `sortOrder` (optional): asc | desc

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "question-uuid",
        "content": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "difficulty": "EASY",
        "subject": "Geography",
        "topic": "World Capitals",
        "tags": ["geography", "capitals"],
        "marks": 5,
        "relevanceScore": 0.95
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 50
    },
    "filters": {
      "subjects": ["Geography"],
      "difficulties": ["EASY"],
      "tags": ["geography"]
    },
    "suggestions": [
      "capital cities",
      "world geography",
      "european capitals"
    ]
  }
}
```

**Postman Example**:
```javascript
// GET {{base_url}}/api/search/questions?q=mathematics&subjects=Mathematics&difficulties=EASY,MEDIUM&page=1&limit=10
// Headers: Authorization: Bearer {{auth_token}}

pm.test("Question search successful", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.questions).to.be.an('array');
});
```

### 🟢 GET /api/search/exams
**Description**: Search exams with advanced filtering  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

**Query Parameters**:
- `q` (required): Search query
- `published` (optional): true | false
- `subjects` (optional): Comma-separated subjects
- `difficulties` (optional): Comma-separated difficulties
- `minMarks` (optional): Minimum total marks
- `maxMarks` (optional): Maximum total marks
- `minTimeLimit` (optional): Minimum time limit
- `maxTimeLimit` (optional): Maximum time limit
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): relevance | createdAt | name | totalMarks
- `sortOrder` (optional): asc | desc

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "exam-uuid",
        "name": "Mathematics Final Exam",
        "description": "Comprehensive mathematics assessment",
        "timeLimit": 120,
        "isPublished": true,
        "totalMarks": 100,
        "questionsCount": 20,
        "submissionsCount": 15,
        "createdBy": {
          "name": "Exam Creator"
        },
        "subjects": ["Mathematics", "Algebra"],
        "averageDifficulty": "MEDIUM",
        "relevanceScore": 0.92
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 25
    },
    "analytics": {
      "totalResults": 25,
      "subjectDistribution": {
        "Mathematics": 15,
        "Physics": 8,
        "Chemistry": 2
      },
      "difficultyDistribution": {
        "EASY": 5,
        "MEDIUM": 15,
        "HARD": 5
      }
    }
  }
}
```

---

## 11. Student APIs

### 🟢 GET /api/student/ranking
**Description**: Get current student's ranking and performance  
**Auth Required**: ✅ Yes  
**Permissions**: Any authenticated user  

*(Detailed response shown in Rankings section above)*

---

## 12. Testing Examples

### Complete Postman Collection Setup

#### Environment Variables
```javascript
// Create these environment variables in Postman:
{
  "base_url": "http://localhost:3000",
  "auth_token": "",
  "user_id": "",
  "exam_id": "",
  "question_id": "",
  "submission_id": "",
  "section_id": ""
}
```

#### Pre-request Scripts
```javascript
// Add this to collection pre-request scripts for automatic token handling:
if (!pm.environment.get("auth_token")) {
    console.log("No auth token found, skipping authenticated request");
    // You could auto-login here if needed
}
```

#### Collection Test Scripts
```javascript
// Add this to collection test scripts for common validations:
pm.test("Status code is not 500", function () {
    pm.response.to.not.have.status(500);
});

pm.test("Response has success property", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

// Auto-refresh token if expired
if (pm.response.code === 401) {
    console.log("Token expired, need to re-authenticate");
}
```

### Authentication Flow Example
```javascript
// 1. First, signup or login
// POST {{base_url}}/api/users/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

// Test Script:
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.token);
    pm.environment.set("user_id", jsonData.user.id);
});

// 2. Use token in subsequent requests
// Headers: Authorization: Bearer {{auth_token}}
```

### Complete Exam Creation Flow
```javascript
// 1. Create Question
// POST {{base_url}}/api/questions/create
// Store question_id

// 2. Create Exam
// POST {{base_url}}/api/exams
// Store exam_id

// 3. Create Section
// POST {{base_url}}/api/exams/{{exam_id}}/sections
// Store section_id

// 4. Add Questions to Section
// POST {{base_url}}/api/exams/exam/{{exam_id}}/sections/{{section_id}}/questions

// 5. Publish Exam
// POST {{base_url}}/api/exams/{{exam_id}}/publish

// 6. Take Exam
// POST {{base_url}}/api/exams/{{exam_id}}/submissions
```

### Error Handling Examples
```javascript
// Common error responses to handle:

// 401 Unauthorized
{
  "error": "Authentication required"
}

// 403 Forbidden
{
  "success": false,
  "error": "Insufficient permissions"
}

// 404 Not Found
{
  "success": false,
  "error": "Resource not found"
}

// 400 Bad Request
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 🔧 API Status Summary

### ✅ Fully Implemented (42 endpoints)
- Authentication: 3/3
- User Management: 6/6
- Questions: 6/6
- Exams: 6/6
- Sections: 8/8
- Submissions: 8/8
- Rankings: 4/4
- Admin: 4/4
- Upload: 2/2
- Search: 2/2
- Student: 1/1

### 🎯 Key Features
- **JWT Authentication** with middleware support
- **Role-based permissions** (ADMIN, MODERATOR, USER)
- **Comprehensive validation** with Zod schemas
- **Advanced search** with filtering and analytics
- **File upload** to Supabase storage
- **Real-time rankings** and leaderboards
- **Detailed analytics** and reporting
- **Draft submissions** support
- **Password-protected exams**
- **Pagination** on all list endpoints

### 🔐 Security Features
- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- File upload security
- Protected routes via middleware

### 📊 Analytics & Reporting
- Dashboard statistics
- User performance analytics
- Exam completion rates
- Subject-wise analysis
- Time tracking and optimization
- Ranking systems
- Growth metrics

This API provides a complete e-learning platform with comprehensive exam management, user analytics, and administrative capabilities!
