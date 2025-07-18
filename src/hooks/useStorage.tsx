'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  uploadProfilePicture,
  uploadExamAttachment
} from '@/services/supabase/storage';
import { useToast } from '@/hooks/use-toast';

export interface UploadProgress {
  progress: number;
  uploading: boolean;
  error?: string;
  url?: string;
}

// --- Profile Picture Upload Hook ---
export const useProfilePictureUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false
  });
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      setUploadProgress({ progress: 0, uploading: true });
      return await uploadProfilePicture(userId, file);
    },
    onSuccess: (url: string) => {
      setUploadProgress({ progress: 100, uploading: false, url });
      toast({ title: 'Profile picture uploaded successfully' });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      setUploadProgress({
        progress: 0,
        uploading: false,
        error: err.message
      });
      toast({
        title: 'Upload failed',
        description: err.message,
        variant: 'destructive'
      });
    }
  });

  return {
    uploadProgress,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending
  };
};

// --- Exam Attachment Upload Hook ---
export const useExamAttachmentUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false
  });
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async ({ examId, file }: { examId: string; file: File }) => {
      setUploadProgress({ progress: 0, uploading: true });
      return await uploadExamAttachment(examId, file);
    },
    onSuccess: (url: string) => {
      setUploadProgress({ progress: 100, uploading: false, url });
      toast({ title: 'File uploaded successfully' });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      setUploadProgress({
        progress: 0,
        uploading: false,
        error: err.message
      });
      toast({
        title: 'Upload failed',
        description: err.message,
        variant: 'destructive'
      });
    }
  });

  return {
    uploadProgress,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending
  };
};

// --- General Reusable File Upload Hook ---
export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false
  });

  const upload = async (
    file: File,
    uploadFn: (file: File) => Promise<string>
  ): Promise<string> => {
    try {
      setUploadProgress({ progress: 0, uploading: true });
      const url = await uploadFn(file);
      setUploadProgress({ progress: 100, uploading: false, url });
      return url;
    } catch (error) {
      const err = error as Error;
      setUploadProgress({
        progress: 0,
        uploading: false,
        error: err.message
      });
      throw err;
    }
  };

  return { uploadProgress, upload };
};

// --- Drag and Drop Hook ---
export const useDragAndDrop = (onDrop: (files: File[]) => void) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onDrop(files);
  };

  return {
    isDragOver,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    }
  };
};
