import axios from 'axios';
import { 
  UploadResponse,
  ApiError 
} from '@/constants/types';
import { UPLOAD_ROUTES } from '@/constants/api';
import { authService } from './auth';

class UploadService {
  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<UploadResponse> {
    try {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        throw {
          success: false,
          error: 'Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, WebP).',
        } as ApiError;
      }

      // Validate file size (max 5MB)
      if (!this.isValidFileSize(file, 5 * 1024 * 1024)) {
        throw {
          success: false,
          error: 'File size too large. Maximum size allowed is 5MB.',
        } as ApiError;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');

      const response = await axios.post(
        UPLOAD_ROUTES.PROFILE_IMAGE,
        formData,
        {
          ...authService.getAuthConfig(),
          headers: {
            ...authService.getAuthConfig().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload question image
   */
  async uploadQuestionImage(file: File): Promise<UploadResponse> {
    try {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        throw {
          success: false,
          error: 'Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, WebP).',
        } as ApiError;
      }

      // Validate file size (max 10MB for questions)
      if (!this.isValidFileSize(file, 10 * 1024 * 1024)) {
        throw {
          success: false,
          error: 'File size too large. Maximum size allowed is 10MB.',
        } as ApiError;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'question');

      const response = await axios.post(
        UPLOAD_ROUTES.QUESTION_IMAGE,
        formData,
        {
          ...authService.getAuthConfig(),
          headers: {
            ...authService.getAuthConfig().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[], type: 'profile' | 'question' = 'question'): Promise<UploadResponse[]> {
    try {
      const uploadPromises = files.map(file => {
        if (type === 'profile') {
          return this.uploadProfileImage(file);
        } else {
          return this.uploadQuestionImage(file);
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      
      return results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            data: {
              url: '',
              filename: '',
              size: 0,
              mimeType: ''
            },
            message: result.reason?.message || 'Upload failed'
          };
        }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate image file type
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    return validTypes.includes(file.type);
  }

  /**
   * Validate file size
   */
  private isValidFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create file preview URL
   */
  createFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke file preview URL
   */
  revokeFilePreview(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Compress image before upload
   */
  async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = this.createFilePreview(file);
    });
  }

  /**
   * Validate image dimensions
   */
  async validateImageDimensions(file: File, maxWidth?: number, maxHeight?: number): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = img;
        const widthValid = !maxWidth || width <= maxWidth;
        const heightValid = !maxHeight || height <= maxHeight;
        
        URL.revokeObjectURL(img.src);
        resolve(widthValid && heightValid);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(false);
      };
      
      img.src = this.createFilePreview(file);
    });
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = img;
        URL.revokeObjectURL(img.src);
        resolve({ width, height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      
      img.src = this.createFilePreview(file);
    });
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      
      return {
        success: false,
        error: responseData?.error || responseData?.message || 'Upload failed',
        message: responseData?.message,
        statusCode: error.response?.status,
      };
    }
    
    return {
      success: false,
      error: 'Network error occurred',
      message: 'Please check your internet connection',
    };
  }

  /**
   * Check if current user can upload files
   */
  canUploadFiles(): boolean {
    return authService.isAuthenticated();
  }

  /**
   * Get upload progress (for future implementation)
   */
  uploadWithProgress(
    file: File, 
    type: 'profile' | 'question',
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const uploadUrl = type === 'profile' ? UPLOAD_ROUTES.PROFILE_IMAGE : UPLOAD_ROUTES.QUESTION_IMAGE;

    return axios.post(uploadUrl, formData, {
      ...authService.getAuthConfig(),
      headers: {
        ...authService.getAuthConfig().headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    }).then(response => response.data);
  }
}

// Export singleton instance
export const uploadService = new UploadService();
export default uploadService;
