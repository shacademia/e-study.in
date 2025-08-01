# Fix for "Invalid response format for section questions" Error

## Problem
When editing an existing exam, the `AddQuestionsSection` component was failing with TypeScript errors about "Invalid response format for section questions". The issue occurred because:

1. **API Response Mismatch**: The `getSectionQuestions` API returns a complex object:
   ```json
   {
     "success": true,
     "data": {
       "section": { "id": "...", "name": "...", ... },
       "questions": [...],  // Array of question objects
       "statistics": { "totalQuestions": 5, ... }
     }
   }
   ```

2. **Code Expected Array**: The component code was expecting just an array of questions, not the full response object.

3. **Type Definition Mismatch**: The service method was typed to return `Question[]` but actually returned the complex object.

## Solution

### 1. Updated Response Handling in Component
Modified `AddQuestionsSection.tsx` to properly handle the API response format:

```typescript
// Before: Expected direct array
if (Array.isArray(questionsInSection)) {
  const ids = questionsInSection.map(q => q.id);
  setUsedQuestionIds(new Set(ids));
}

// After: Handle multiple response formats
let questionsArray = [];
if (Array.isArray(response)) {
  questionsArray = response;
} else if (response && typeof response === 'object' && Array.isArray(response.questions)) {
  questionsArray = response.questions;
} else if (response && typeof response === 'object' && response.data && Array.isArray(response.data.questions)) {
  questionsArray = response.data.questions;
}

const ids = questionsArray.map(q => {
  return q.questionId || q.question?.id || q.id;
}).filter(Boolean);
```

### 2. Updated Service Type Definition
Fixed the `getSectionQuestions` method in `exam.ts` to properly type the return value:

```typescript
// Before: Incorrect return type
async getSectionQuestions(examId: string, sectionId: string): Promise<Question[]>

// After: Correct return type matching API response
async getSectionQuestions(examId: string, sectionId: string): Promise<{
  section: { id: string; name: string; ... };
  questions: Array<{ id: string; questionId: string; question: Question; ... }>;
  statistics: { totalQuestions: number; ... };
}>
```

### 3. Added Backward Compatibility Method
Created a helper method for cases that need just the questions array:

```typescript
async getSectionQuestionsArray(examId: string, sectionId: string): Promise<Question[]> {
  const sectionData = await this.getSectionQuestions(examId, sectionId);
  return sectionData.questions.map(sq => sq.question);
}
```

### 4. Robust ID Extraction
The code now handles different question object structures:
- `q.questionId` - for section question objects
- `q.question?.id` - for nested question objects  
- `q.id` - for direct question objects

## Result
- ✅ No more TypeScript errors
- ✅ Proper handling of API response format
- ✅ Backward compatibility maintained
- ✅ Robust error handling for different response structures
- ✅ Works for both creating and editing exams

The component now correctly identifies which questions are already in a section when editing an exam, preventing duplicate additions and providing accurate filtering.