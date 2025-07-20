# 🧪 E-Study.in API Testing Guide

## 📋 Overview

This guide provides comprehensive testing instructions for the E-Study.in API, including Postman setup, authentication flows, and complete testing scenarios.

## 🚀 Quick Start

### 1. Import Postman Collection
1. Download the Postman collection: `E-Study-API-Postman-Collection.json`
2. Open Postman
3. Click **Import** → **Upload Files** → Select the JSON file
4. Collection will be imported with all endpoints and environment variables

### 2. Environment Setup
The collection includes pre-configured environment variables:
- `base_url`: http://localhost:3000
- `auth_token`: (auto-populated after login)
- `user_id`: (auto-populated after login)
- `exam_id`: (auto-populated after exam creation)
- `question_id`: (auto-populated after question creation)
- `submission_id`: (auto-populated after submission)
- `section_id`: (auto-populated after section creation)

### 3. Start Your Server
```bash
npm run dev
# Server should start on http://localhost:3000
```

## 🔐 Authentication Testing

### Step 1: Create Admin User
```javascript
// POST {{base_url}}/api/users/signup
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

### Step 2: Login
```javascript
// POST {{base_url}}/api/users/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
// Token will be auto-saved to environment
```

### Step 3: Test Protected Endpoint
```javascript
// GET {{base_url}}/api/users/me/current
// Headers: Authorization: Bearer {{auth_token}}
```

## 📝 Complete Testing Flow

### Phase 1: Basic Setup
1. ✅ **Signup** → Create admin user
2. ✅ **Login** → Get authentication token
3. ✅ **Get Current User** → Verify authentication works

### Phase 2: Question Management
4. ✅ **Create Question** → Store question_id
5. ✅ **Get All Questions** → Test pagination and filters
6. ✅ **Get Question by ID** → Test specific question retrieval
7. ✅ **Update Question** → Test question modification
8. ✅ **Get Subjects** → Test subject listing
9. ✅ **Get Topics** → Test topic filtering

### Phase 3: Exam Creation
10. ✅ **Create Exam** → Store exam_id
11. ✅ **Get All Exams** → Test exam listing
12. ✅ **Get Exam by ID** → Test exam details
13. ✅ **Create Section** → Store section_id
14. ✅ **Add Questions to Section** → Link questions
15. ✅ **Publish Exam** → Make exam available

### Phase 4: Exam Taking
16. ✅ **Validate Password** → Test password protection
17. ✅ **Submit Exam** → Create submission (store submission_id)
18. ✅ **Get Submission Details** → View detailed analytics
19. ✅ **Update Submission** → Test draft saving

### Phase 5: Analytics & Rankings
20. ✅ **Get Global Rankings** → Test ranking system
21. ✅ **Get Exam Rankings** → Test exam-specific rankings
22. ✅ **Get Student Ranking** → Test personal performance
23. ✅ **Admin Stats** → Test dashboard data
24. ✅ **Admin Analytics** → Test detailed analytics

### Phase 6: Advanced Features
25. ✅ **Search Questions** → Test search functionality
26. ✅ **Search Exams** → Test exam search
27. ✅ **Upload Profile Image** → Test file upload
28. ✅ **Upload Question Image** → Test question images

## 🎯 Testing Scenarios

### Scenario 1: Complete Exam Workflow
```javascript
// 1. Create questions
POST /api/questions/create (multiple questions)

// 2. Create exam
POST /api/exams

// 3. Create sections
POST /api/exams/{exam_id}/sections

// 4. Add questions to sections
POST /api/exams/exam/{exam_id}/sections/{section_id}/questions

// 5. Publish exam
POST /api/exams/{exam_id}/publish

// 6. Take exam
POST /api/exams/{exam_id}/submissions

// 7. View results
GET /api/submissions/{submission_id}

// 8. Check rankings
GET /api/rankings/exam/{exam_id}
```

### Scenario 2: User Management Workflow
```javascript
// 1. Create users
POST /api/users/signup (create multiple users)

// 2. Admin gets all users
GET /api/users/all

// 3. Update user roles
PUT /api/users/{user_id}/role

// 4. View user submissions
GET /api/users/{user_id}/submissions

// 5. Delete user (if needed)
DELETE /api/users/{user_id}
```

### Scenario 3: Search & Discovery
```javascript
// 1. Search questions by subject
GET /api/search/questions?q=mathematics&subjects=Mathematics

// 2. Search exams by keyword
GET /api/search/exams?q=final&published=true

// 3. Filter by difficulty
GET /api/questions?difficulty=EASY&subject=Mathematics

// 4. Get subjects and topics
GET /api/questions/subjects
GET /api/questions/topics?subject=Mathematics
```

## 🔧 Environment Variables Reference

### Required Variables
```javascript
{
  "base_url": "http://localhost:3000",           // Your server URL
  "auth_token": "",                              // JWT token (auto-populated)
  "user_id": "",                                 // Current user ID (auto-populated)
  "exam_id": "",                                 // Created exam ID (auto-populated)
  "question_id": "",                             // Created question ID (auto-populated)
  "submission_id": "",                           // Submission ID (auto-populated)
  "section_id": "",                              // Section ID (auto-populated)
  "user_id_to_delete": ""                       // User ID for deletion testing
}
```

### Optional Variables for Testing
```javascript
{
  "test_email": "test@example.com",
  "test_password": "testpassword123",
  "admin_email": "admin@example.com",
  "admin_password": "admin123",
  "exam_password": "exampass123"
}
```

## 📊 Test Data Templates

### Sample Question Data
```javascript
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

### Sample Exam Data
```javascript
{
  "name": "Geography Final Exam",
  "description": "Comprehensive geography assessment covering world capitals and major landmarks",
  "timeLimit": 120,
  "isPasswordProtected": true,
  "password": "geo123",
  "instructions": "Read all questions carefully. Each question carries equal marks."
}
```

### Sample Section Data
```javascript
{
  "name": "World Capitals",
  "description": "Questions about capital cities around the world",
  "timeLimit": 30,
  "marks": 50
}
```

### Sample Submission Data
```javascript
{
  "answers": {
    "question-uuid-1": 2,  // Selected option index
    "question-uuid-2": 1,
    "question-uuid-3": 0
  },
  "timeSpent": 1800,       // Time in seconds
  "isSubmitted": true      // Final submission
}
```

## 🧪 Advanced Testing

### Performance Testing
```javascript
// Test pagination with large datasets
GET /api/questions?page=1&limit=100
GET /api/exams?page=1&limit=50
GET /api/submissions?page=1&limit=20

// Test search performance
GET /api/search/questions?q=mathematics&limit=50
GET /api/search/exams?q=test&limit=25
```

### Security Testing
```javascript
// Test authentication
GET /api/admin/stats (without token - should fail)

// Test authorization
PUT /api/users/{other_user_id}/role (as regular user - should fail)

// Test input validation
POST /api/questions/create (with invalid data)
POST /api/exams (with missing required fields)
```

### Edge Case Testing
```javascript
// Test with empty results
GET /api/search/questions?q=nonexistentterm

// Test with invalid IDs
GET /api/questions/invalid-uuid
GET /api/exams/invalid-uuid

// Test with expired tokens
// (manually set expired token and test protected endpoints)
```

## 📱 Mobile API Testing

### Headers for Mobile Apps
```javascript
{
  "Authorization": "Bearer {{auth_token}}",
  "Content-Type": "application/json",
  "User-Agent": "E-Study-Mobile-App/1.0",
  "Accept": "application/json"
}
```

### Mobile-Specific Endpoints
```javascript
// Optimized for mobile
GET /api/exams?page=1&limit=10              // Smaller page sizes
GET /api/questions?page=1&limit=5           // Reduced data transfer
GET /api/submissions/draft                   // Resume functionality
```

## 🚨 Error Testing

### Test All Error Scenarios
1. **401 Unauthorized**
   ```javascript
   // Remove auth token and test protected endpoints
   GET /api/users/me/current (without token)
   ```

2. **403 Forbidden**
   ```javascript
   // Test role restrictions
   DELETE /api/users/{id} (as regular user)
   ```

3. **404 Not Found**
   ```javascript
   // Test with non-existent IDs
   GET /api/questions/non-existent-id
   ```

4. **400 Bad Request**
   ```javascript
   // Test with invalid data
   POST /api/questions/create (missing required fields)
   ```

5. **422 Validation Error**
   ```javascript
   // Test with invalid formats
   POST /api/users/signup (invalid email format)
   ```

## 📈 Monitoring & Logging

### Response Time Monitoring
```javascript
// Add to test scripts
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

### Error Rate Monitoring
```javascript
// Track error rates
pm.test("Success rate tracking", function () {
    const jsonData = pm.response.json();
    if (jsonData.success === false) {
        console.log("API Error:", jsonData.error);
    }
});
```

## 🔄 Automated Testing Scripts

### Newman (CLI) Testing
```bash
# Install Newman
npm install -g newman

# Run collection
newman run E-Study-API-Postman-Collection.json \
  --environment E-Study-Environment.json \
  --reporters cli,html \
  --reporter-html-export test-results.html
```

### CI/CD Integration
```yaml
# GitHub Actions example
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run API Tests
        run: |
          newman run collection.json \
            --environment environment.json \
            --reporters cli,junit \
            --reporter-junit-export test-results.xml
```

## 📝 Test Checklist

### ✅ Authentication & Authorization
- [ ] User signup with different roles
- [ ] User login with valid/invalid credentials
- [ ] Token validation on protected routes
- [ ] Role-based access control
- [ ] Token expiration handling

### ✅ CRUD Operations
- [ ] Create operations (POST)
- [ ] Read operations (GET)
- [ ] Update operations (PUT)
- [ ] Delete operations (DELETE)
- [ ] Bulk operations where applicable

### ✅ Data Validation
- [ ] Required field validation
- [ ] Data type validation
- [ ] Format validation (email, etc.)
- [ ] Range validation (pagination limits)
- [ ] Unique constraint validation

### ✅ Search & Filtering
- [ ] Text search functionality
- [ ] Filter combinations
- [ ] Pagination with filters
- [ ] Sort operations
- [ ] Empty result handling

### ✅ File Operations
- [ ] File upload (valid files)
- [ ] File upload (invalid files)
- [ ] File size limits
- [ ] File type restrictions
- [ ] File URL generation

### ✅ Performance
- [ ] Response times under load
- [ ] Large dataset handling
- [ ] Concurrent user simulation
- [ ] Memory usage monitoring
- [ ] Database query optimization

### ✅ Error Handling
- [ ] Graceful error responses
- [ ] Appropriate HTTP status codes
- [ ] Error message clarity
- [ ] Stack trace security
- [ ] Rate limiting

## 🎯 Success Criteria

### API Quality Metrics
- ✅ All endpoints return appropriate HTTP status codes
- ✅ Response times < 2 seconds for standard operations
- ✅ Error rates < 1% under normal load
- ✅ 100% test coverage for critical paths
- ✅ Consistent response format across all endpoints

### Security Requirements
- ✅ All protected endpoints require authentication
- ✅ Role-based access control properly enforced
- ✅ No sensitive data in error messages
- ✅ Input validation prevents injection attacks
- ✅ File uploads are secure and validated

### Documentation Requirements
- ✅ All endpoints documented with examples
- ✅ Error codes and messages documented
- ✅ Authentication flow clearly explained
- ✅ Postman collection includes all endpoints
- ✅ Testing scenarios cover all use cases

---

## 🎉 Ready to Test!

Your E-Study.in API is now fully documented and ready for comprehensive testing. Use this guide to ensure all functionality works correctly and meets production standards.

**Happy Testing! 🚀**
