# 📋 Postman Testing Guide for Exams API

## 🚀 Prerequisites

### 1. Setup Environment Variables in Postman
- `base_url`: `http://localhost:3000`
- `auth_token`: (will be set after login)
- `exam_id`: (will be set after creating an exam)
- `section_id`: (will be set after creating a section)
- `question_id`: (will be set manually for testing)

### 2. Authentication Required
You must be logged in as **ADMIN** or **MODERATOR** to test most exam creation/modification endpoints.

### 3. API Route Structure
This API has two different routing patterns:
- **Main Exam Routes**: `/api/exams/{id}/...` (for basic exam operations like CRUD, publish, validate-password)
- **Extended Exam Routes**: `/api/exams/exam/{examId}/...` (for sections, rankings, submissions, and question management)

> **Note**: The routing was designed this way to avoid Next.js dynamic route conflicts and to logically separate basic exam operations from complex multi-level operations.

### 4. Key API Endpoints
- **User Profile**: `/api/users/me` (get current user info)
- **User Management**: `/api/users/{id}/...` (admin operations)
- **Exam Sections**: `/api/exams/exam/{examId}/sections`
- **Section Questions**: `/api/exams/exam/{examId}/sections/{sectionId}/questions`

---

## 🔐 Step 1: Authentication Setup

### Login as Admin/Moderator
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
  "password": "your_admin_password"
}
```

**Test Script (Add to Tests tab):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("auth_token", response.token);
    console.log("Admin token saved:", response.token);
}
```

---

## 📝 Step 2: Exams API Testing

### 🔍 Test 1: Create New Exam
```
POST {{base_url}}/api/exams
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "name": "Mathematics Final Exam",
  "description": "Comprehensive mathematics exam covering algebra, calculus, and geometry",
  "timeLimit": 120,
  "isPasswordProtected": true,
  "password": "math2024",
  "instructions": "Read all questions carefully. You can navigate between sections during the exam."
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("exam_id", response.data.id);
    console.log("Exam created with ID:", response.data.id);
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Mathematics Final Exam",
    "description": "Comprehensive mathematics exam...",
    "timeLimit": 120,
    "isPasswordProtected": true,
    "password": "math2024",
    "instructions": "Read all questions carefully...",
    "isPublished": false,
    "isDraft": true,
    "totalMarks": 0,
    "createdBy": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "sections": [],
    "_count": {
      "questions": 0,
      "sections": 0,
      "submissions": 0
    }
  },
  "message": "Exam created successfully"
}
```

### 🔍 Test 2: Get All Exams (With Pagination)
```
GET {{base_url}}/api/exams?page=1&limit=10&published=false
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 3: Get All Exams (Published Only)
```
GET {{base_url}}/api/exams?published=true
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 4: Search Exams
```
GET {{base_url}}/api/exams?search=mathematics&sortBy=name&sortOrder=asc
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 5: Get Specific Exam Details
```
GET {{base_url}}/api/exams/{{exam_id}}
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 6: Update Exam
```
PUT {{base_url}}/api/exams/{{exam_id}}
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "name": "Advanced Mathematics Final Exam",
  "description": "Updated comprehensive mathematics exam",
  "timeLimit": 150,
  "instructions": "Updated instructions: Read all questions carefully and manage your time wisely."
}
```

### 🔍 Test 7: Validate Exam Password
```
POST {{base_url}}/api/exams/{{exam_id}}/validate-password
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "password": "math2024"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "message": "Password validated successfully",
    "examId": "uuid-here",
    "examName": "Mathematics Final Exam",
    "accessGranted": true
  }
}
```

---

## 📚 Step 3: Exam Sections Testing (Extended API)

### 🔍 Test 8: Create Exam Section
```
POST {{base_url}}/api/exams/exam/{{exam_id}}/sections
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "name": "Algebra Section",
  "description": "Questions related to algebraic equations and functions",
  "timeLimit": 45,
  "marks": 50
}
```

**Test Script:**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("section_id", response.data.id);
    console.log("Section created with ID:", response.data.id);
}
```

### 🔍 Test 9: Get All Sections for Exam
```
GET {{base_url}}/api/exams/exam/{{exam_id}}/sections
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 10: Get Specific Section
```
GET {{base_url}}/api/exams/exam/{{exam_id}}/sections/{{section_id}}
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 11: Update Section
```
PUT {{base_url}}/api/exams/exam/{{exam_id}}/sections/{{section_id}}
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "name": "Advanced Algebra Section",
  "description": "Advanced questions on algebraic equations, inequalities, and functions",
  "timeLimit": 60,
  "marks": 75
}
```

---

## ❓ Step 4: Section Questions Testing (Extended API)

### 🔍 Test 12: Add Questions to Section
First, you need question IDs. Get them from the Questions API:

```
GET {{base_url}}/api/questions?subject=Mathematics&limit=5
```

Then add questions to section:

```
POST {{base_url}}/api/exams/exam/{{exam_id}}/sections/{{section_id}}/questions
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "questionIds": [
    "question-uuid-1",
    "question-uuid-2", 
    "question-uuid-3"
  ],
  "marks": 5
}
```

### 🔍 Test 13: Get Questions in Section
```
GET {{base_url}}/api/exams/exam/{{exam_id}}/sections/{{section_id}}/questions
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

### 🔍 Test 14: Remove Question from Section
```
DELETE {{base_url}}/api/exams/exam/{{exam_id}}/sections/{{section_id}}/questions/{{question_id}}
```

**Headers:**
```
x-auth-token: {{auth_token}}
```

---

## 🚀 Step 5: Exam Publishing

### 🔍 Test 15: Publish Exam
```
POST {{base_url}}/api/exams/{{exam_id}}/publish
```

**Headers:**
```
Content-Type: application/json
x-auth-token: {{auth_token}}
```

**Body (raw JSON):**
```json
{
  "isPublished": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "isPublished": true,
    "isDraft": false,
    "totalMarks": 75,
    // ... other exam details
  },
  "message": "Exam published successfully",
  "summary": {
    "totalQuestions": 5,
    "totalMarks": 75,
    "sectionsCount": 1
  }
}
```

### 🔍 Test 16: Unpublish Exam
```
POST {{base_url}}/api/exams/{{exam_id}}/publish
```

**Body (raw JSON):**
```json
{
  "isPublished": false
}
```

---

## 🧪 Error Testing Scenarios

### Test 17: Unauthorized Access (No Token)
```
GET {{base_url}}/api/exams
```
**Expected Response:** 401 Unauthorized

### Test 18: Invalid Token
```
GET {{base_url}}/api/exams
```
**Headers:**
```
x-auth-token: invalid_token_here
```
**Expected Response:** 401 Invalid token

### Test 19: Student User Creating Exam (Insufficient Permissions)
Login as student first, then:
```
POST {{base_url}}/api/exams
```
**Expected Response:** 403 Insufficient permissions

### Test 20: Create Exam Without Required Fields
```
POST {{base_url}}/api/exams
```
**Body:**
```json
{
  "description": "Missing name field"
}
```
**Expected Response:** 400 Validation failed

### Test 21: Publish Exam Without Questions
```
POST {{base_url}}/api/exams/{{exam_id}}/publish
```
**Body:**
```json
{
  "isPublished": true
}
```
**Expected Response:** 400 Cannot publish exam without questions

### Test 22: Add Non-existent Questions to Section
```
POST {{base_url}}/api/exams/exam/{{exam_id}}/sections/{{section_id}}/questions
```
**Body:**
```json
{
  "questionIds": ["non-existent-uuid"]
}
```
**Expected Response:** 404 Some questions not found

### Test 23: Delete Exam with Submissions
First create submissions, then:
```
DELETE {{base_url}}/api/exams/{{exam_id}}
```
**Expected Response:** 400 Cannot delete exam with existing submissions

---

## 📊 Testing Checklist

### ✅ Exam Management
- [ ] Create exam (Admin/Moderator only)
- [ ] Get all exams with pagination
- [ ] Get exam by ID
- [ ] Update exam details
- [ ] Delete exam (Admin only)
- [ ] Search exams by name/description
- [ ] Filter exams by published status

### ✅ Exam Publishing
- [ ] Publish exam (validates questions exist)
- [ ] Unpublish exam
- [ ] Published exams visible to students
- [ ] Draft exams only visible to creators/admins

### ✅ Password Protection
- [ ] Create password-protected exam
- [ ] Validate correct password
- [ ] Reject incorrect password
- [ ] Access non-protected exam without password

### ✅ Section Management
- [ ] Create section in exam
- [ ] Get all sections
- [ ] Get specific section
- [ ] Update section details
- [ ] Delete section
- [ ] Section name uniqueness within exam

### ✅ Section Questions
- [ ] Add questions to section
- [ ] Get questions in section
- [ ] Remove questions from section
- [ ] Question ordering in section
- [ ] Marks calculation per section
- [ ] Prevent duplicate questions in same section

### ✅ Authorization & Security
- [ ] Admin/Moderator can create/modify exams
- [ ] Students cannot create/modify exams
- [ ] Only exam creators and admins can modify specific exams
- [ ] Password protection works correctly
- [ ] Published status controls visibility

### ✅ Data Validation
- [ ] Required fields validation
- [ ] Time limit validation (positive numbers)
- [ ] Marks validation (non-negative)
- [ ] Question ID format validation
- [ ] Password requirements when protected

### ✅ Error Handling
- [ ] Non-existent exam returns 404
- [ ] Non-existent section returns 404
- [ ] Invalid permissions return 403
- [ ] Validation errors return 400
- [ ] Server errors return 500

---

## 🔧 Postman Collection Structure

```
Exams API Tests/
├── Authentication/
│   └── Admin Login
├── Exam Management/
│   ├── Create Exam
│   ├── Get All Exams
│   ├── Get Exam by ID
│   ├── Update Exam
│   ├── Delete Exam
│   ├── Search Exams
│   └── Validate Password
├── Exam Publishing/
│   ├── Publish Exam
│   └── Unpublish Exam
├── Section Management/
│   ├── Create Section
│   ├── Get All Sections
│   ├── Get Section by ID
│   ├── Update Section
│   └── Delete Section
├── Section Questions/
│   ├── Add Questions to Section
│   ├── Get Questions in Section
│   └── Remove Question from Section
└── Error Scenarios/
    ├── Unauthorized Access
    ├── Invalid Permissions
    ├── Validation Errors
    └── Resource Not Found
```

This comprehensive testing guide covers all aspects of the Exams API with proper validation, security, and error handling! 🚀
