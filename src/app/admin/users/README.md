# Admin Users - Parallel and Intercepting Routes

This directory implements Next.js 13+ App Router's parallel and intercepting routes to create a modal user profile view.

## File Structure

```
src/app/admin/users/
├── layout.tsx                           # Layout with parallel route slot
├── page.tsx                            # Main users list page
├── @modal/                             # Parallel route slot
│   ├── default.tsx                     # Default empty modal
│   └── (.)profile/[userId]/page.tsx    # Intercepting route for modal
└── profile/[userId]/page.tsx           # Actual profile page
```

## How It Works

### 1. Parallel Routes (`@modal`)
- The `@modal` folder creates a parallel route slot
- The layout.tsx file renders both `children` and `modal` slots
- By default, the modal slot renders nothing (`default.tsx`)

### 2. Intercepting Routes (`(.)profile`)
- The `(.)` syntax intercepts the `/admin/users/profile/[userId]` route
- When navigating from the users list, it shows the modal instead of the full page
- Direct navigation to the URL still shows the full page

### 3. User Experience
- **From users list**: Click "View" → Opens modal overlay
- **Direct URL access**: Navigate to `/admin/users/profile/[userId]` → Shows full page
- **Modal close**: Returns to users list
- **Browser back/forward**: Works correctly with both modal and full page

## Features

### Modal View
- Beautiful dialog overlay with backdrop blur
- User profile information with cards
- Contact details and account information
- Action buttons (Close, Send Message, Manage Account)
- Responsive design

### Full Page View
- Same content as modal but in full page layout
- Back button to return to users list
- Better for direct links and bookmarking
- Consistent styling with the rest of the admin interface

## Usage

```tsx
// In the users list, clicking View button navigates to:
router.push(`/admin/users/profile/${user.id}`)

// This triggers the intercepting route and shows the modal
// Direct navigation to the same URL shows the full page
```

## Benefits

1. **Better UX**: Quick modal view without losing context
2. **SEO Friendly**: Direct URLs work for full page views
3. **Shareable**: Users can share direct links to profiles
4. **Accessible**: Proper modal behavior with focus management
5. **Performance**: Modal reuses existing data, full page fetches fresh data