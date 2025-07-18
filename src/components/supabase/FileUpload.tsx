import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Upload, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDragAndDrop } from '@/hooks/useStorage';
import type { UploadProgress } from '@/hooks/useStorage';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  uploadProgress?: UploadProgress;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  uploadProgress,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDragOver, dragHandlers } = useDragAndDrop((files) => {
    if (!disabled) {
      onFileSelect(files);
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileSelect(files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)} data-id="qwfa91xqh" data-path="src/components/supabase/FileUpload.tsx">
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-colors",
          isDragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        {...dragHandlers} data-id="2avsq0pnm" data-path="src/components/supabase/FileUpload.tsx">

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled} data-id="wigv5vqif" data-path="src/components/supabase/FileUpload.tsx" />

        
        <div className="flex flex-col items-center space-y-2" data-id="9cd27nhmh" data-path="src/components/supabase/FileUpload.tsx">
          <Upload className="h-8 w-8 text-muted-foreground" data-id="a9j958amm" data-path="src/components/supabase/FileUpload.tsx" />
          <div data-id="crboo4wwo" data-path="src/components/supabase/FileUpload.tsx">
            <p className="text-sm font-medium" data-id="h6w4c0d8j" data-path="src/components/supabase/FileUpload.tsx">
              Drop files here or{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleButtonClick}
                disabled={disabled} data-id="wghv6fzzx" data-path="src/components/supabase/FileUpload.tsx">

                browse
              </Button>
            </p>
            <p className="text-xs text-muted-foreground" data-id="aqvyvzhep" data-path="src/components/supabase/FileUpload.tsx">
              Max size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </Card>

      {uploadProgress && uploadProgress.uploading &&
      <Card className="p-4" data-id="d3gb4o4ob" data-path="src/components/supabase/FileUpload.tsx">
          <div className="flex items-center space-x-3" data-id="nlrrvlmg0" data-path="src/components/supabase/FileUpload.tsx">
            <File className="h-4 w-4" data-id="rz9nzzvoa" data-path="src/components/supabase/FileUpload.tsx" />
            <div className="flex-1 space-y-1" data-id="pm8m14i04" data-path="src/components/supabase/FileUpload.tsx">
              <p className="text-sm font-medium" data-id="wbv4kjgqj" data-path="src/components/supabase/FileUpload.tsx">Uploading...</p>
              <Progress value={uploadProgress.progress} className="h-2" data-id="s3m9fdful" data-path="src/components/supabase/FileUpload.tsx" />
            </div>
          </div>
        </Card>
      }

      {uploadProgress && uploadProgress.error &&
      <Card className="p-4 border-destructive" data-id="95z9tgh2r" data-path="src/components/supabase/FileUpload.tsx">
          <div className="flex items-center space-x-3" data-id="7wfux9ce6" data-path="src/components/supabase/FileUpload.tsx">
            <X className="h-4 w-4 text-destructive" data-id="p7gbep0lf" data-path="src/components/supabase/FileUpload.tsx" />
            <p className="text-sm text-destructive" data-id="rzjo7vsl8" data-path="src/components/supabase/FileUpload.tsx">{uploadProgress.error}</p>
          </div>
        </Card>
      }

      {uploadProgress && uploadProgress.url && !uploadProgress.uploading &&
      <Card className="p-4 border-green-500" data-id="mba0k3ac9" data-path="src/components/supabase/FileUpload.tsx">
          <div className="flex items-center space-x-3" data-id="nbrr43vd9" data-path="src/components/supabase/FileUpload.tsx">
            <File className="h-4 w-4 text-green-500" data-id="rhh8cciqt" data-path="src/components/supabase/FileUpload.tsx" />
            <p className="text-sm text-green-500" data-id="9n74qhqe1" data-path="src/components/supabase/FileUpload.tsx">Upload completed successfully!</p>
          </div>
        </Card>
      }
    </div>);

};

export default FileUpload;