# Upload API Documentation

This document describes the image upload functionality for the e-study platform using Supabase storage.

## Overview

The upload system provides two main endpoints for image uploading:
1. **Profile Image Upload** - For user profile pictures
2. **Question Image Upload** - For images used in question content

## Environment Setup

### Required Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# JWT Secret (already configured)
JWT_SECRET="your-super-secret-jwt-key-here"
```

### Supabase Storage Buckets

The following storage buckets are configured:
- `profile-pictures` - User profile images
- `question-images` - Images for question content
- `exam-resources` - Exam-related files
- `submission-attachments` - Student submission files

## API Endpoints

### 1. Profile Image Upload

**Endpoint:** `POST /api/upload/profile-image`

**Authentication:** Bearer token required

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**File Restrictions:**
- Allowed types: JPEG, PNG, GIF, WebP
- Maximum size: 5MB
- Automatically resizes/optimizes for profile display

**Response:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "imageUrl": "https://your-supabase-url/storage/v1/object/public/profile-pictures/user-id/avatar.jpg",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "profileImage": "https://...",
      "role": "USER"
    }
  }
}
```

**Example Usage (JavaScript):**
```javascript
const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload/profile-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

### 2. Question Image Upload

**Endpoint:** `POST /api/upload/question-image`

**Authentication:** Bearer token required (ADMIN or TEACHER role)

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field and optional `questionId` field

**File Restrictions:**
- Allowed types: JPEG, PNG, GIF, WebP, SVG
- Maximum size: 5MB
- SVG support for mathematical diagrams and illustrations

**Response:**
```json
{
  "success": true,
  "message": "Question image uploaded successfully",
  "data": {
    "imageUrl": "https://your-supabase-url/storage/v1/object/public/question-images/question-id/image.jpg",
    "uploadId": "question-id-or-temp-id"
  }
}
```

**Example Usage (JavaScript):**
```javascript
const uploadQuestionImage = async (file, questionId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (questionId) {
    formData.append('questionId', questionId);
  }

  const response = await fetch('/api/upload/question-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

## Security Features

### Authentication
- All endpoints require valid JWT tokens
- Question image upload restricted to ADMIN and TEACHER roles
- Users can only upload images for their own questions (unless admin)

### File Validation
- File type validation using MIME types
- File size limits enforced
- Malicious file detection

### Storage Security
- Files stored in organized bucket structure
- Public URLs for easy access
- Automatic file naming to prevent conflicts

## Storage Structure

```
Supabase Storage Buckets:
├── profile-pictures/
│   └── {userId}/
│       └── avatar.{ext}
├── question-images/
│   └── {questionId}/
│       └── {timestamp}.{ext}
├── exam-resources/
│   └── {examId}/
│       └── {timestamp}.{ext}
└── submission-attachments/
    └── {submissionId}/
        └── {timestamp}.{ext}
```

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to upload image"
}
```

## Frontend Integration

### Using the FileUpload Component

The platform includes a reusable `FileUpload` component at `src/components/supabase/FileUpload.tsx`:

```tsx
import { FileUpload } from '@/components/supabase/FileUpload';

const ProfilePage = () => {
  const handleUpload = async (file: File) => {
    // Upload logic here
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
      multiple={false}
    />
  );
};
```

### Drag and Drop Support

The FileUpload component supports:
- Drag and drop functionality
- Progress tracking
- File validation
- Preview capabilities
- Multiple file selection (configurable)

## Performance Considerations

### Image Optimization
- Consider implementing client-side image compression
- Use appropriate image formats (WebP for modern browsers)
- Implement progressive loading for large images

### Caching
- Supabase provides automatic CDN caching
- Set appropriate cache headers
- Consider implementing client-side caching

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured
   - Restart development server after adding environment variables

2. **File Upload Fails**
   - Check file size limits
   - Verify file type is supported
   - Ensure user has proper permissions

3. **Images Not Displaying**
   - Verify bucket permissions in Supabase dashboard
   - Check if bucket exists and is publicly accessible
   - Ensure correct URL format

### Debug Steps

1. Check browser network tab for request/response details
2. Verify JWT token is valid and includes required claims
3. Check Supabase storage dashboard for uploaded files
4. Review server logs for detailed error messages

## Future Enhancements

### Planned Features
- Image resizing and optimization
- Bulk upload support
- Image gallery management
- Advanced file type support (PDF, documents)
- CDN integration for improved performance

### Database Integration
- Question content can reference uploaded images via URLs
- User profiles automatically updated with new profile images
- Audit trail for file uploads and modifications
