# Search API Documentation

This document describes the comprehensive search functionality for the e-study platform, including advanced filtering and pagination capabilities.

## Overview

The search system provides two main endpoints:
1. **Question Search** - Advanced search across questions with multiple filters
2. **Exam Search** - Search through exams with visibility controls and filtering

## API Endpoints

### 1. Question Search

**Endpoint:** `GET /api/search/questions`

**Authentication:** Bearer token required

**Query Parameters:**
- `q` (string, optional) - Search term for content, subject, and topic
- `subject` (string, optional) - Filter by exact subject
- `difficulty` (enum, optional) - Filter by difficulty: `EASY`, `MEDIUM`, `HARD`
- `topic` (string, optional) - Filter by topic (partial match)
- `tags` (string, optional) - Comma-separated list of tags to search for
- `authorId` (string, optional) - Filter by question author UUID
- `page` (number, optional, default: 1) - Page number for pagination
- `limit` (number, optional, default: 20) - Number of results per page
- `sortBy` (enum, optional, default: 'createdAt') - Sort field: `createdAt`, `updatedAt`, `difficulty`, `subject`
- `sortOrder` (enum, optional, default: 'desc') - Sort order: `asc`, `desc`

**Response:**
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
        "topic": "European Capitals",
        "tags": ["europe", "capitals", "france"],
        "createdAt": "2025-01-20T10:00:00Z",
        "updatedAt": "2025-01-20T10:00:00Z",
        "author": {
          "id": "user-uuid",
          "name": "Teacher Name",
          "email": "teacher@example.com"
        },
        "_count": {
          "exams": 5,
          "examSections": 3
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalCount": 200,
      "limit": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "statistics": {
      "difficulty": {
        "EASY": 50,
        "MEDIUM": 80,
        "HARD": 70
      },
      "subject": {
        "Mathematics": 60,
        "Physics": 45,
        "Chemistry": 35
      }
    },
    "suggestions": {
      "subjects": ["Mathematics", "Physics", "Chemistry"],
      "topics": ["Algebra", "Mechanics", "Organic Chemistry"]
    },
    "filters": {
      "query": "capital",
      "subject": null,
      "difficulty": null,
      "topic": null,
      "tags": null,
      "authorId": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

**Example Usage:**
```javascript
// Search for easy mathematics questions
const response = await fetch('/api/search/questions?q=algebra&subject=Mathematics&difficulty=EASY&page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Search by tags
const response = await fetch('/api/search/questions?tags=geometry,trigonometry&sortBy=difficulty&sortOrder=asc', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. Exam Search

**Endpoint:** `GET /api/search/exams`

**Authentication:** Bearer token required

**Visibility Rules:**
- **ADMIN users**: Can see all exams (published and draft)
- **Regular users**: Can only see published exams and their own exams

**Query Parameters:**
- `q` (string, optional) - Search term for exam name and description
- `isPublished` (boolean, optional) - Filter by publication status
- `creatorId` (string, optional) - Filter by exam creator UUID
- `hasPassword` (boolean, optional) - Filter by password protection status
- `minTimeLimit` (number, optional) - Minimum time limit in minutes
- `maxTimeLimit` (number, optional) - Maximum time limit in minutes
- `page` (number, optional, default: 1) - Page number for pagination
- `limit` (number, optional, default: 20) - Number of results per page
- `sortBy` (enum, optional, default: 'createdAt') - Sort field: `createdAt`, `updatedAt`, `name`, `timeLimit`
- `sortOrder` (enum, optional, default: 'desc') - Sort order: `asc`, `desc`

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "exam-uuid",
        "name": "Final Mathematics Exam",
        "description": "Comprehensive mathematics assessment covering algebra and geometry",
        "isPublished": true,
        "isDraft": false,
        "timeLimit": 120,
        "totalMarks": 100,
        "password": null,
        "isPasswordProtected": false,
        "instructions": "Read all questions carefully before answering",
        "createdAt": "2025-01-20T10:00:00Z",
        "updatedAt": "2025-01-20T10:00:00Z",
        "createdBy": {
          "id": "user-uuid",
          "name": "Teacher Name",
          "email": "teacher@example.com"
        },
        "sections": [
          {
            "id": "section-uuid",
            "name": "Algebra",
            "timeLimit": 60,
            "marks": 50,
            "_count": {
              "questions": 10
            }
          }
        ],
        "_count": {
          "submissions": 25,
          "questions": 20
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "limit": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "statistics": {
      "published": {
        "published": 75,
        "draft": 25
      },
      "averageTimeLimit": 90
    },
    "suggestions": {
      "names": ["Mathematics Midterm", "Physics Final", "Chemistry Quiz"],
      "creators": [
        {
          "id": "user-uuid",
          "name": "Teacher Name",
          "email": "teacher@example.com"
        }
      ]
    },
    "filters": {
      "query": "mathematics",
      "isPublished": true,
      "creatorId": null,
      "hasPassword": false,
      "minTimeLimit": null,
      "maxTimeLimit": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

**Example Usage:**
```javascript
// Search for published mathematics exams
const response = await fetch('/api/search/exams?q=mathematics&isPublished=true&sortBy=name&sortOrder=asc', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Search for exams with time limits between 60-120 minutes
const response = await fetch('/api/search/exams?minTimeLimit=60&maxTimeLimit=120&hasPassword=false', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Admin searching for all exams by a specific creator
const response = await fetch('/api/search/exams?creatorId=user-uuid&page=1&limit=50', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Search Features

### 1. Text Search
- **Questions**: Searches across content, subject, and topic fields
- **Exams**: Searches across name and description fields
- Case-insensitive partial matching
- Supports multiple search terms

### 2. Advanced Filtering

#### Question Filters:
- **Subject**: Exact match filtering
- **Difficulty**: Enum-based filtering (EASY, MEDIUM, HARD)
- **Topic**: Partial match filtering
- **Tags**: Array-based filtering with comma-separated values
- **Author**: Filter by question creator

#### Exam Filters:
- **Publication Status**: Published vs draft exams
- **Creator**: Filter by exam creator
- **Password Protection**: Filter by password protection status
- **Time Limits**: Range filtering by minimum and maximum time limits

### 3. Sorting Options
- **Fields**: createdAt, updatedAt, name/content, difficulty/timeLimit, subject
- **Order**: Ascending or descending
- **Default**: Most recent first (createdAt desc)

### 4. Pagination
- Configurable page size (default: 20, max recommended: 100)
- Complete pagination metadata
- Navigation helpers (hasNextPage, hasPreviousPage)

### 5. Statistics and Analytics
- **Questions**: Breakdown by difficulty and subject
- **Exams**: Publication status distribution, average time limits
- Real-time statistics based on search results

### 6. Smart Suggestions
- **Questions**: Subject and topic suggestions based on search context
- **Exams**: Name suggestions and creator suggestions (admin only)
- Helps users discover related content and refine searches

## Security and Authorization

### Authentication
- All search endpoints require valid JWT authentication
- Token must be provided in Authorization header: `Bearer <token>`

### Visibility Controls
- **Questions**: All authenticated users can search all questions
- **Exams**: 
  - Regular users see only published exams and their own exams
  - Admin users can see all exams regardless of status
  - Creator suggestions only available to admin users

### Data Privacy
- Personal information limited in responses
- Only necessary user fields included (id, name, email for creators)
- Sensitive data (passwords, private notes) excluded from responses

## Performance Considerations

### Database Optimization
- Indexed search fields for fast text search
- Efficient pagination with skip/take
- Aggregated statistics using database grouping
- Parallel queries for independent data

### Caching Strategies
- Consider implementing Redis caching for:
  - Popular search queries
  - Subject/topic suggestions
  - User-specific exam visibility
- Cache invalidation on content updates

### Rate Limiting
- Implement rate limiting for search endpoints
- Consider user-based limits for heavy search usage
- Monitor search query performance

## Error Handling

### Common Errors

**400 Bad Request - Invalid Parameters:**
```json
{
  "success": false,
  "message": "Invalid search parameters",
  "errors": {
    "difficulty": "Invalid enum value",
    "page": "Must be a positive integer"
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Frontend Integration Examples

### React Hook for Question Search
```javascript
import { useState, useEffect } from 'react';

const useQuestionSearch = (filters) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchQuestions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/search/questions?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Search failed');
      } finally {
        setLoading(false);
      }
    };

    searchQuestions();
  }, [filters]);

  return { results, loading, error };
};

// Usage
const QuestionSearchPage = () => {
  const [filters, setFilters] = useState({
    q: '',
    difficulty: '',
    subject: '',
    page: 1
  });

  const { results, loading, error } = useQuestionSearch(filters);

  return (
    <div>
      {/* Search form */}
      {/* Results display */}
      {/* Pagination controls */}
    </div>
  );
};
```

### Search URL Builder Utility
```javascript
class SearchBuilder {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.params = new URLSearchParams();
  }

  query(text) {
    if (text) this.params.set('q', text);
    return this;
  }

  difficulty(level) {
    if (level) this.params.set('difficulty', level);
    return this;
  }

  subject(subject) {
    if (subject) this.params.set('subject', subject);
    return this;
  }

  tags(tagArray) {
    if (tagArray?.length) this.params.set('tags', tagArray.join(','));
    return this;
  }

  page(pageNum) {
    this.params.set('page', pageNum.toString());
    return this;
  }

  limit(limitNum) {
    this.params.set('limit', limitNum.toString());
    return this;
  }

  sort(field, order = 'desc') {
    this.params.set('sortBy', field);
    this.params.set('sortOrder', order);
    return this;
  }

  build() {
    return `${this.baseUrl}?${this.params.toString()}`;
  }
}

// Usage
const url = new SearchBuilder('/api/search/questions')
  .query('algebra')
  .difficulty('EASY')
  .subject('Mathematics')
  .tags(['equations', 'solving'])
  .page(1)
  .limit(20)
  .sort('createdAt', 'desc')
  .build();
```

## Future Enhancements

### Planned Features
1. **Full-text Search**: Implement advanced full-text search with relevance scoring
2. **Search Analytics**: Track popular searches and user behavior
3. **Saved Searches**: Allow users to save and reuse search configurations
4. **Search History**: Maintain user search history with quick access
5. **Advanced Operators**: Support for AND/OR/NOT search operators
6. **Faceted Search**: Interactive filter panels with counts
7. **Search Suggestions**: Auto-complete and search-as-you-type functionality
8. **Export Results**: Allow users to export search results to various formats

### Performance Improvements
1. **Elasticsearch Integration**: For advanced search capabilities
2. **Search Result Caching**: Redis-based caching for popular queries
3. **Lazy Loading**: Progressive loading of search results
4. **Search Optimization**: Query optimization and indexing strategies
