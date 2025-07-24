# Image Upload Integration with ImageKit - Setup Guide

## 🖼️ Complete Implementation Summary

I've successfully integrated ImageKit for image uploads in your question creation system. Here's what has been implemented:

## ✅ What's Been Done

### 1. **Database Schema Updates**
- ✅ Added `questionImage String?` to Question model
- ✅ Added `optionImages String[] @default([])` to Question model
- ✅ Migration completed

### 2. **ImageKit Configuration**
- ✅ Installed `imagekit` SDK
- ✅ Created `/src/config/imagekit.ts` with configuration
- ✅ Created upload API endpoint at `/api/upload/imagekit`

### 3. **Reusable Components**
- ✅ Created `ImageUploadComponent` at `/src/components/ui/image-upload.tsx`
- ✅ Drag & drop support
- ✅ Preview functionality
- ✅ File validation (type, size)
- ✅ Error handling

### 4. **Question Form Enhancement**
- ✅ Updated `EnhancedQuestionBank.tsx` with image upload fields
- ✅ Question image upload
- ✅ Individual option image uploads
- ✅ Updated API routes to handle images

### 5. **Type Updates**
- ✅ Updated `CreateQuestionRequest` and `UpdateQuestionRequest` interfaces
- ✅ Added image fields to API schemas

## 🔧 Required Configuration

### 1. **ImageKit Credentials**
You need to set up these environment variables in `.env.local`:

```env
# ImageKit Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/shacademia/
```

**How to get these:**
1. Go to [ImageKit.io](https://imagekit.io/)
2. Create account or login
3. Go to Developer → API Keys
4. Copy Public Key, Private Key, and URL Endpoint

### 2. **Folder Structure in ImageKit**
The system will automatically create these folders:
- `/questions/` - For question images
- `/questions/options/` - For option images

## 📋 Complete Flow

### Question Creation Flow:
1. **User opens question creation form**
2. **Fills question content**
3. **Optionally uploads question image** → ImageKit → URL saved
4. **Fills each option text**
5. **Optionally uploads images for each option** → ImageKit → URLs saved
6. **Submits form** → Database saves all URLs

### Image Upload Process:
```
File Selected → Validation → ImageKit Upload → URL Generated → Database Save
```

## 🎯 Usage Examples

### In Question Creation Form:
```tsx
// Question image upload
<ImageUploadComponent
  label="Question Image (Optional)"
  folder="questions"
  tags="question"
  onImageUpload={(imageUrl) => setQuestionImage(imageUrl)}
/>

// Option image upload
<ImageUploadComponent
  label="Option A Image (Optional)"
  folder="questions/options"
  tags="question,option,option-0"
  onImageUpload={(imageUrl) => setOptionImage(0, imageUrl)}
/>
```

## 🧪 Testing

1. **Update Test Page** (`/test`) - Already updated to use ImageKit
2. **Test with Question Creation** - Go to Admin → Question Bank → Add Question

## 📁 File Structure Created

```
src/
├── config/
│   └── imagekit.ts                    # ImageKit configuration
├── components/ui/
│   └── image-upload.tsx              # Reusable upload component
├── app/api/upload/
│   └── imagekit/route.ts             # Upload API endpoint
└── app/admin/questionbank/
    └── EnhancedQuestionBank.tsx      # Updated with image uploads
```

## 🚀 Next Steps

1. **Set up ImageKit credentials** in `.env.local`
2. **Test the upload functionality**
3. **Customize styling** if needed
4. **Add image display** in question viewing components

## 💡 Features Included

- ✅ **Drag & Drop** file upload
- ✅ **Image Preview** before upload
- ✅ **File Validation** (type, size)
- ✅ **Progress Indicators**
- ✅ **Error Handling**
- ✅ **Authentication** required
- ✅ **Database Integration**
- ✅ **Organized Folder Structure**

## 🔍 Troubleshooting

### Common Issues:
1. **"Authentication required"** → Check if token is in localStorage
2. **"Invalid file type"** → Only JPEG, PNG, GIF, WebP allowed
3. **"File too large"** → Max 5MB limit
4. **"Upload failed"** → Check ImageKit credentials

The system is now ready for image uploads! Just add your ImageKit credentials and start testing. 🎉
