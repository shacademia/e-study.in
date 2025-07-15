import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  uploadProfilePicture,
  uploadExamAttachment,
  uploadSubmissionAttachment,
  deleteFile,
  getFileDownloadURL } from
'@/services/supabase/storage.ts';
import { useToast } from '@/hooks/use-toast';

export interface UploadProgress {
  progress: number;
  uploading: boolean;
  error?: string;
  url?: string;
}

export const useProfilePictureUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false
  });
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: ({ userId, file }: {userId: string;file: File;}) => {
      setUploadProgress({ progress: 0, uploading: true });
      return uploadProfilePicture(userId, file);
    },
    onSuccess: (url) => {
      setUploadProgress({ progress: 100, uploading: false, url });
      toast({
        title: "Profile picture uploaded successfully"
      });
    },
    onError: (error: any) => {
      setUploadProgress({ progress: 0, uploading: false, error: error.message });
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    uploadProgress,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending
  };
};

export const useExamAttachmentUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false
  });
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: ({ examId, file }: {examId: string;file: File;}) => {
      setUploadProgress({ progress: 0, uploading: true });
      return uploadExamAttachment(examId, file);
    },
    onSuccess: (url) => {
      setUploadProgress({ progress: 100, uploading: false, url });
      toast({
        title: "File uploaded successfully"
      });
    },
    onError: (error: any) => {
      setUploadProgress({ progress: 0, uploading: false, error: error.message });
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    uploadProgress,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending
  };
};

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false
  });

  const upload = async (file: File, uploadFn: (file: File) => Promise<string>) => {
    try {
      setUploadProgress({ progress: 0, uploading: true });
      const url = await uploadFn(file);
      setUploadProgress({ progress: 100, uploading: false, url });
      return url;
    } catch (error: any) {
      setUploadProgress({ progress: 0, uploading: false, error: error.message });
      throw error;
    }
  };

  return { uploadProgress, upload };
};

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