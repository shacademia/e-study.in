'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => Promise<void>;
}

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Questions</DialogTitle>
          <DialogDescription>
            Upload questions from CSV or Excel file
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drop your file here or click to browse</p>
            <p className="text-sm text-gray-500">Supports CSV and Excel files</p>
            <Button variant="outline" className="mt-4 cursor-pointer">
              Choose File
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">File Format Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Column 1: Question</li>
              <li>• Column 2-5: Options A, B, C, D</li>
              <li>• Column 6: Correct Answer (0-3)</li>
              <li>• Column 7: Subject</li>
              <li>• Column 8: Topic</li>
              <li>• Column 9: Difficulty (easy/medium/hard)</li>
              <li>• Column 10: Tags (comma separated)</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" className="cursor-pointer" onClick={onClose}>
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={onUpload}>
              Upload Questions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
