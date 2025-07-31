'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface FileInfo {
  id: string;
  imageUrl: string;
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface ImageUploadComponentProps {
  onImageUpload: (imageUrl: string, fileInfo?: FileInfo) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  folder?: string;
  tags?: string;
  label?: string;
  placeholder?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
  required?: boolean;
}

export default function ImageUploadComponent({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
  folder = 'questions',
  tags = 'question',
  label = 'Upload Image',
  placeholder = 'Choose an image file...',
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  disabled = false,
  required = false,
}: ImageUploadComponentProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError('');

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size: ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadToImageKit(file);
  };

  const uploadToImageKit = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('tags', tags);

      // Get auth token from localStorage (optional)
      const token = localStorage.getItem('token');

      const response = await fetch('/api/upload/imagekit', {
        method: 'POST',
        headers: token ? {
          'x-auth-token': token,
        } : {},
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.success) {
        console.log('✅ Image uploaded successfully:', result.data);
        console.log('🖼️ Image URL:', result.data.imageUrl);
        onImageUpload(result.data.imageUrl, result.data);
        setPreviewUrl('');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current && !disabled && !isUploading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={`file-upload-${folder}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : currentImageUrl || previewUrl
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          id={`file-upload-${folder}`}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
          aria-label={label}
        />

        {/* Current Image */}
        {currentImageUrl && !previewUrl && !isUploading && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="relative group">
                <Image
                  src={currentImageUrl}
                  alt="Current image"
                  width={300}
                  height={200}
                  className="object-contain border rounded bg-white"
                  style={{ minHeight: '200px', maxHeight: '200px' }}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', currentImageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', currentImageUrl);
                  }}
                />
                <div className="absolute inset-0 group-hover:bg-opacity-20 transition-opacity rounded flex items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Badge variant="secondary">Current Image</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Click to replace or drag new image here
              </p>
              <p className="text-xs text-gray-400 mt-1 break-all">
                URL: {currentImageUrl.substring(0, 50)}...
              </p>
            </div>
          </div>
        )}

        {/* Preview Image */}
        {previewUrl && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="object-contain border rounded bg-white"
                  style={{ minHeight: '200px', maxHeight: '200px' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-center">
              <Badge variant="secondary">Preview</Badge>
            </div>
          </div>
        )}

        {/* Upload State */}
        {isUploading && (
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-sm text-muted-foreground">Uploading to ImageKit...</p>
          </div>
        )}

        {/* Empty State */}
        {!currentImageUrl && !previewUrl && !isUploading && (
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{placeholder}</p>
              <p className="text-xs text-muted-foreground">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max {maxSize}MB • {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      {(currentImageUrl || previewUrl) && !isUploading && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change Image
          </Button>
          {onImageRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeImage}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
