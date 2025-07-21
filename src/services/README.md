# E-Study.in Frontend API Implementation

## Overview
Complete implementation of all API endpoints from the E-Study.in backend documentation, providing type-safe, axios-based services for the frontend application.

## 🏗️ Architecture

### Services Created
1. **Authentication Service** (`auth.ts`) - Login, signup, logout, token management
2. **User Service** (`user.ts`) - User management, profile updates, role management
3. **Question Service** (`question.ts`) - Question CRUD operations, subjects, topics
4. **Exam Service** (`exam.ts`) - Exam management, sections, publishing
5. **Submission Service** (`submission.ts`) - Exam submissions, draft handling
6. **Ranking Service** (`ranking.ts`) - Global, exam, and student rankings
7. **Admin Service** (`admin.ts`) - Dashboard stats, analytics, admin operations
8. **Search Service** (`search.ts`) - Search functionality for exams and questions
9. **Upload Service** (`upload.ts`) - File upload handling with progress tracking

### Core Features
- ✅ Complete TypeScript type safety
- ✅ Centralized error handling
- ✅ Automatic token management
- ✅ Request/response interceptors
- ✅ File upload with progress tracking
- ✅ Search functionality with history
- ✅ Pagination support
- ✅ React hooks for easy integration

## 📁 File Structure

```
src/
├── services/
│   ├── auth.ts           # Authentication service
│   ├── user.ts           # User management
│   ├── question.ts       # Question operations
│   ├── exam.ts           # Exam management
│   ├── submission.ts     # Submission handling
│   ├── ranking.ts        # Rankings and leaderboards
│   ├── admin.ts          # Admin dashboard operations
│   ├── search.ts         # Search functionality
│   ├── upload.ts         # File upload service
│   └── index.ts          # Service exports
├── hooks/
│   └── useApiServices.tsx # React hooks for services
├── lib/
│   └── api.ts            # API helper utilities
├── constants/
│   ├── api.ts            # API route constants
│   ├── constants.ts      # General constants
│   ├── types.ts          # TypeScript interfaces
│   ├── config.ts         # Configuration
│   ├── message.ts        # Message constants
│   └── roles.ts          # Role definitions
```

## 🚀 Usage Examples

### Basic Service Usage

```typescript
import { authService, userService, examService } from '@/services';

// Authentication
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const currentUser = await userService.getCurrentUser();

// Get all exams
const exams = await examService.getAllExams({
  page: 1,
  limit: 20,
  published: true
});
```

### Using React Hooks

```typescript
import { useAuth, useExams, useQuestions } from '@/hooks/useApiServices';

function MyComponent() {
  const { login, loading: authLoading, error: authError } = useAuth();
  const { getAllExams, data: exams, loading: examsLoading } = useExams();
  
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Handle successful login
    } catch (error) {
      // Handle login error
    }
  };

  useEffect(() => {
    getAllExams({ published: true });
  }, [getAllExams]);

  if (examsLoading) return <div>Loading...</div>;
  if (authError) return <div>Error: {authError.message}</div>;

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

### Error Handling

```typescript
try {
  const result = await examService.createExam({
    name: 'My Exam',
    description: 'Test exam',
    timeLimit: 60
  });
  console.log('Exam created:', result.data);
} catch (error) {
  const apiError = error as ApiError;
  console.error('Error:', apiError.error);
  console.error('Status:', apiError.statusCode);
}
```

### File Upload with Progress

```typescript
import { useUpload } from '@/hooks/useApiServices';

function FileUploadComponent() {
  const { uploadProfileImage, progress, loading } = useUpload();

  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadProfileImage(file);
      console.log('Upload successful:', result.data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />
      {loading && <div>Upload progress: {progress}%</div>}
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables
The services expect these environment variables:
- `NEXT_PUBLIC_API_URL` - Base API URL (optional, defaults to empty string)
- `JWT_SECRET` - JWT secret key (for backend)

### API Base URL
Set in `constants/api.ts`:
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
```

## 🔒 Authentication

The services automatically handle authentication tokens:
- Tokens are stored in localStorage
- Automatically added to request headers
- Auto-redirect to login on 401 errors
- Token refresh handling (can be extended)

## 🎯 Type Safety

All services are fully typed with TypeScript interfaces:
- Request/response types
- Error types
- Filter types
- Pagination types

## 📊 Pagination Support

All list endpoints support pagination:
```typescript
const result = await userService.getAllUsers({
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

console.log(result.data.users);
console.log(result.data.pagination);
```

## 🔍 Search Functionality

Advanced search capabilities:
```typescript
// Quick search across multiple entities
const results = await searchService.quickSearch('mathematics');

// Advanced search with filters
const examResults = await searchService.searchExams({
  q: 'math',
  isPublished: true,
  minTimeLimit: 30,
  sortBy: 'createdAt'
});
```

## 🛠️ Admin Operations

Complete admin dashboard support:
```typescript
// Get dashboard statistics
const stats = await adminService.getDashboardStats({
  timeframe: '30d',
  includeRecentData: true
});

// Get detailed analytics
const analytics = await adminService.getAnalytics({
  timeframe: '7d',
  metric: 'all'
});
```

## 📈 Rankings and Leaderboards

Full ranking system implementation:
```typescript
// Global rankings
const globalRankings = await rankingService.getGlobalRankings({
  page: 1,
  limit: 50,
  timeframe: '30d'
});

// Exam-specific rankings
const examRankings = await rankingService.getExamRankings('exam-id', {
  includeUserDetails: true
});

// Student's personal ranking
const studentRanking = await rankingService.getStudentRanking();
```

## 🎨 Integration with UI Components

The services are designed to work seamlessly with your existing UI components and state management solutions. They return standardized `ApiResponse<T>` objects that can be easily consumed by React components.

## 🔄 Future Enhancements

Potential improvements that can be added:
- Caching layer (React Query integration)
- Offline support
- Real-time updates (WebSocket integration)
- Optimistic updates
- Request deduplication
- Background sync

## 📝 Notes

- All services are singleton instances for consistency
- Error handling is centralized and consistent
- File uploads support progress tracking
- Search history is maintained in localStorage
- All endpoints from the API documentation are implemented
- Services follow the same patterns for consistency
