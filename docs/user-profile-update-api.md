# User Profile Update API Documentation

## Overview

The user profile update endpoint allows authenticated users to modify their profile information including name, email, bio, and password. This endpoint includes comprehensive validation, security checks, and proper error handling.

## Endpoint

**URL:** `PUT /api/users/updateuserprofile`

**Authentication:** Bearer token required

**Content-Type:** `application/json`

## Request Format

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body Schema

```json
{
  "name": "string (required, max 100 chars)",
  "email": "string (optional, valid email format)",
  "bio": "string (optional, max 500 chars)",
  "currentPassword": "string (optional, required if changing password)",
  "newPassword": "string (optional, min 6 chars, requires currentPassword)"
}
```

### Validation Rules

1. **Name**: Required, 1-100 characters
2. **Email**: Optional, must be valid email format, must be unique
3. **Bio**: Optional, maximum 500 characters
4. **Password Change**: If `newPassword` is provided, `currentPassword` is required
5. **Password Strength**: New password must be at least 6 characters

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "Updated Name",
      "bio": "Updated bio text",
      "profileImage": "https://...",
      "role": "USER",
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-20T15:30:00Z",
      "isActive": true,
      "lastLogin": "2025-01-20T14:00:00Z",
      "isEmailVerified": true
    },
    "passwordChanged": false
  }
}
```

### Error Responses

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

**404 Not Found - User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Invalid input data",
  "errors": {
    "name": ["Name is required"],
    "email": ["Invalid email format"],
    "newPassword": ["Password must be at least 6 characters"]
  }
}
```

**400 Bad Request - Email Already Exists:**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

**400 Bad Request - Incorrect Current Password:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Usage Examples

### 1. Update Name and Bio Only

```javascript
const updateProfile = async (name, bio) => {
  const response = await fetch('/api/users/updateuserprofile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      bio
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Profile updated:', result.data.user);
  } else {
    console.error('Update failed:', result.message);
  }
};

// Usage
updateProfile('John Doe', 'Software developer passionate about education');
```

### 2. Update Email

```javascript
const updateEmail = async (name, newEmail) => {
  const response = await fetch('/api/users/updateuserprofile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      email: newEmail
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Email updated successfully');
  } else {
    console.error('Email update failed:', result.message);
  }
};

// Usage
updateEmail('John Doe', 'newemail@example.com');
```

### 3. Change Password

```javascript
const changePassword = async (name, currentPassword, newPassword) => {
  const response = await fetch('/api/users/updateuserprofile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      currentPassword,
      newPassword
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Password changed successfully:', result.data.passwordChanged);
  } else {
    console.error('Password change failed:', result.message);
  }
};

// Usage
changePassword('John Doe', 'oldPassword123', 'newSecurePassword456');
```

### 4. Complete Profile Update

```javascript
const updateCompleteProfile = async (profileData) => {
  const response = await fetch('/api/users/updateuserprofile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });

  const result = await response.json();
  return result;
};

// Usage
const profileData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  bio: 'Experienced educator and technology enthusiast',
  currentPassword: 'currentPass123',
  newPassword: 'newSecurePass456'
};

updateCompleteProfile(profileData)
  .then(result => {
    if (result.success) {
      console.log('Profile updated:', result.data.user);
      console.log('Password changed:', result.data.passwordChanged);
    }
  })
  .catch(error => console.error('Update failed:', error));
```

## Security Features

### 1. Authentication
- Requires valid JWT token in Authorization header
- Token verification with proper error handling
- User existence validation

### 2. Email Uniqueness
- Checks if new email is already in use by another user
- Only validates when email is actually being changed
- Prevents duplicate email addresses in the system

### 3. Password Security
- Current password verification required for password changes
- Password hashing using bcrypt with salt rounds of 12
- Minimum password length enforcement (6 characters)
- Secure password comparison using bcrypt.compare()

### 4. Input Validation
- Comprehensive validation using Zod schema
- Field length limits to prevent abuse
- Email format validation
- Required field enforcement

### 5. Data Privacy
- Password field excluded from response
- Only necessary user fields returned
- Sensitive information protection

## Frontend Integration

### React Hook Example

```javascript
import { useState } from 'react';

const useProfileUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/updateuserprofile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
};

// Usage in component
const ProfileEditForm = () => {
  const { updateProfile, loading, error } = useProfileUpdate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(formData);
      console.log('Profile updated:', result.user);
      // Handle success (e.g., show toast, redirect, update UI)
    } catch (err) {
      console.error('Update failed:', err.message);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### Form Validation Example

```javascript
const validateProfileForm = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }

  if (data.newPassword) {
    if (!data.currentPassword) {
      errors.currentPassword = 'Current password is required when changing password';
    }
    if (data.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

## Performance Considerations

### Database Optimization
- Uses selective field updates only for changed data
- Efficient email uniqueness check with targeted query
- Optimized user selection with specific field projection

### Security Performance
- bcrypt salt rounds balanced for security vs performance (12 rounds)
- Password hashing only when password is actually changing
- Token verification optimized for speed

### Response Optimization
- Returns only necessary user fields
- Excludes sensitive data from responses
- Includes update confirmation flags

## Error Handling Best Practices

### Client-Side Handling
```javascript
const handleProfileUpdate = async (profileData) => {
  try {
    const result = await updateProfile(profileData);
    
    // Success handling
    showSuccessMessage('Profile updated successfully');
    updateUserContext(result.user);
    
    if (result.passwordChanged) {
      showInfoMessage('Password changed successfully. Please log in again for security.');
      // Optionally force re-authentication
    }
    
  } catch (error) {
    // Error handling based on response
    if (error.message === 'Email already in use') {
      setFieldError('email', 'This email is already registered');
    } else if (error.message === 'Current password is incorrect') {
      setFieldError('currentPassword', 'Please check your current password');
    } else if (error.message === 'Invalid token') {
      // Handle authentication error
      redirectToLogin();
    } else {
      showErrorMessage('Failed to update profile. Please try again.');
    }
  }
};
```

## Testing Examples

### Unit Test Example (Jest)
```javascript
describe('Profile Update API', () => {
  test('should update profile successfully', async () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const response = await request(app)
      .put('/api/users/updateuserprofile')
      .set('Authorization', `Bearer ${validToken}`)
      .send(mockUser)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.name).toBe('John Doe');
  });

  test('should reject invalid email', async () => {
    const invalidData = {
      name: 'John Doe',
      email: 'invalid-email'
    };

    const response = await request(app)
      .put('/api/users/updateuserprofile')
      .set('Authorization', `Bearer ${validToken}`)
      .send(invalidData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid input data');
  });
});
```

This updated profile route now provides comprehensive functionality with proper security, validation, and error handling that aligns with modern API best practices!
