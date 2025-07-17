# 📋 Postman Testing Guide for Questions API

## 🚀 Prerequisites

### 1. Setup Environment Variables in Postman
Create a new environment in Postman with these variables:
- `base_url`: `http://localhost:3000`
- `auth_token`: (will be set after login)

### 2. Get Authentication Token First
Before testing questions API, you need to login and get a JWT token.

---

## 🔐 Step 1: Authentication Setup

### Login Request
```
POST {{base_url}}/api/users/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@example.com",
  "password": "your_password_here"
}
```

**Test Script (Add to Tests tab):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    // Extract token from response or cookie
    // Adjust based on your login response structure
    pm.environment.set("auth_token", response.token);
    console.log("Token saved:", response.token);
}
```

---

## 📝 Step 2: Questions API Testing

### 🔍 Test 1: Get All Questions (Basic)
```
GET {{base_url}}/api/questions
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 🔍 Test 2: Get Questions with Pagination
```
GET {{base_url}}/api/questions?page=2&limit=10
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 3: Filter Questions by Subject
```
GET {{base_url}}/api/questions?subject=Mathematics
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 4: Filter Questions by Difficulty
```
GET {{base_url}}/api/questions?difficulty=EASY
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 5: Search Questions
```
GET {{base_url}}/api/questions?search=algebra
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 6: Filter by Tags
```
GET {{base_url}}/api/questions?tags=math,algebra
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 7: Complex Query with Multiple Filters
```
GET {{base_url}}/api/questions?subject=Mathematics&difficulty=MEDIUM&page=1&limit=5&sortBy=createdAt&sortOrder=desc
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 8: Get All Subjects
```
GET {{base_url}}/api/questions/subjects
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

**Expected Response:**
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

### 🔍 Test 9: Get Topics by Subject
```
GET {{base_url}}/api/questions/topics?subject=Mathematics
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 10: Get Topics with Statistics
```
GET {{base_url}}/api/questions/topics?subject=Mathematics&includeStats=true
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Mathematics",
    "topics": ["Algebra", "Calculus", "Geometry"],
    "totalTopics": 3,
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

### 🔍 Test 11: Create New Question
```
POST {{base_url}}/api/questions/create
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "content": "What is the derivative of x²?",
  "options": ["2x", "x²", "2", "x"],
  "correctOption": 0,
  "difficulty": "MEDIUM",
  "subject": "Mathematics",
  "topic": "Calculus",
  "tags": ["calculus", "derivatives", "polynomial"]
}
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "content": "What is the derivative of x²?",
  "options": ["2x", "x²", "2", "x"],
  "correctOption": 0,
  "difficulty": "MEDIUM",
  "subject": "Mathematics",
  "topic": "Calculus",
  "tags": ["calculus", "derivatives", "polynomial"],
  "author": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 🔍 Test 12: Get Specific Question
```
GET {{base_url}}/api/questions/{{question_id}}
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 13: Update Question
```
PUT {{base_url}}/api/questions/{{question_id}}
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "content": "What is the derivative of x² + 3x?",
  "options": ["2x + 3", "x² + 3", "2x", "3x"],
  "correctOption": 0
}
```

### 🔍 Test 14: Delete Question
```
DELETE {{base_url}}/api/questions/{{question_id}}
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

---

## 🧪 Error Testing Scenarios

### Test 15: Unauthorized Access (No Token)
```
GET {{base_url}}/api/questions
```
**Expected Response:** 401 Unauthorized

### Test 16: Invalid Token
```
GET {{base_url}}/api/questions
```
**Headers:**
```
x-auth-token: invalid_token_here
```
**Expected Response:** 401 Invalid token

### Test 17: Invalid Pagination Parameters
```
GET {{base_url}}/api/questions?page=0&limit=101
```
**Headers:**
```
x-auth-token: {{auth_token}}
```
**Expected Response:** 400 Bad Request

### Test 18: Invalid Difficulty Filter
```
GET {{base_url}}/api/questions?difficulty=INVALID
```
**Headers:**
```
x-auth-token: {{auth_token}}
```
**Expected Response:** 400 Bad Request

### Test 19: Missing Subject Parameter for Topics
```
GET {{base_url}}/api/questions/topics
```
**Headers:**
```
x-auth-token: {{auth_token}}
```
**Expected Response:** 400 Bad Request

### Test 20: Non-existent Subject for Topics
```
GET {{base_url}}/api/questions/topics?subject=NonExistentSubject
```
**Headers:**
```
x-auth-token: {{auth_token}}
```
**Expected Response:** 404 Not Found

---

## 📊 Testing Checklist

### ✅ Authentication
- [ ] Login successful and token obtained
- [ ] Unauthorized requests return 401
- [ ] Invalid tokens return 401

### ✅ Question Listing
- [ ] Basic listing works
- [ ] Pagination works correctly
- [ ] Subject filtering works
- [ ] Difficulty filtering works
- [ ] Search functionality works
- [ ] Tag filtering works
- [ ] Sorting works (createdAt, subject, difficulty)
- [ ] Complex queries with multiple filters work

### ✅ Subjects API
- [ ] Get all subjects works
- [ ] Subject statistics are correct
- [ ] Response format matches documentation

### ✅ Topics API
- [ ] Get topics by subject works
- [ ] Topics with statistics work
- [ ] Error handling for missing/invalid subject

### ✅ Question CRUD
- [ ] Create question works (Admin/Moderator only)
- [ ] Get specific question works
- [ ] Update question works (Author/Admin only)
- [ ] Delete question works (Author/Admin only)

### ✅ Error Handling
- [ ] Invalid parameters return 400
- [ ] Non-existent resources return 404
- [ ] Authorization errors return 401/403
- [ ] Server errors return 500

---

## 🔧 Postman Collection Setup

### 1. Create Collection Structure
```
Questions API Tests/
├── Authentication/
│   └── Login
├── Questions CRUD/
│   ├── Get All Questions
│   ├── Create Question
│   ├── Get Question by ID
│   ├── Update Question
│   └── Delete Question
├── Questions Listing & Filtering/
│   ├── Basic Pagination
│   ├── Filter by Subject
│   ├── Filter by Difficulty
│   ├── Search Questions
│   ├── Filter by Tags
│   └── Complex Query
├── Subjects & Topics/
│   ├── Get All Subjects
│   ├── Get Topics by Subject
│   └── Get Topics with Stats
└── Error Scenarios/
    ├── Unauthorized Access
    ├── Invalid Token
    ├── Invalid Parameters
    └── Not Found
```

### 2. Environment Variables
```
base_url: http://localhost:3000
auth_token: (auto-populated from login)
question_id: (set manually for testing specific question)
```

### 3. Pre-request Scripts (Collection Level)
```javascript
// Auto-refresh token if needed
if (!pm.environment.get("auth_token")) {
    console.log("No auth token found. Please run login request first.");
}
```

This comprehensive testing guide will help you thoroughly validate your Questions API functionality! 🚀
