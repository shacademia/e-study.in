'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    imageUrl: string;
    fileInfo?: FileInfo;
    uploadedAt?: string;
    testMode?: boolean;
  };
}

export default function ImageUploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear previous upload response
      setUploadResponse(null);
      setUploadedImageUrl('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Using ImageKit upload endpoint
      const response = await fetch('/api/upload/imagekit', {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token') || 'test-mode',
        },
        body: formData,
      });

      const result: UploadResponse = await response.json();
      setUploadResponse(result);

      if (result.success && result.data?.imageUrl) {
        setUploadedImageUrl(result.data.imageUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResponse({
        success: false,
        message: 'Network error occurred'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearTest = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadResponse(null);
    setUploadedImageUrl('');
    // Clear file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Image Upload Test Component</h1>
      
      <div className="space-y-6">
        {/* File Selection */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">1. Select Image File</h2>
          <div className="flex items-center gap-4">
            <Input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
            />
            <Button onClick={clearTest} variant="outline">
              Clear
            </Button>
          </div>
          
          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p><strong>File Name:</strong> {selectedFile.name}</p>
              <p><strong>File Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>File Type:</strong> {selectedFile.type}</p>
            </div>
          )}
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">2. Preview (Before Upload)</h2>
            <div className="flex justify-center">
              <div className="relative max-w-md max-h-64">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="object-contain border rounded h-full w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="text-center">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-8 py-2"
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>

        {/* Upload Response */}
        {uploadResponse && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">3. Upload Response</h2>
            <div className="bg-gray-50 p-4 rounded">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(uploadResponse, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 space-y-2">
              <p><strong>Status:</strong> 
                <span className={uploadResponse.success ? 'text-green-600' : 'text-red-600'}>
                  {uploadResponse.success ? ' Success' : ' Failed'}
                </span>
              </p>
              <p><strong>Message:</strong> {uploadResponse.message}</p>
              {uploadResponse.data?.imageUrl && (
                <div className="space-y-2">
                  <p><strong>Image URL Type:</strong> 
                    <span className="text-blue-600 ml-2">
                      {uploadResponse.data.imageUrl.startsWith('data:') ? 'Base64 Data URL' : 'ImageKit URL'}
                    </span>
                  </p>
                  <p><strong>URL Size:</strong> 
                    <span className="text-orange-600 ml-2">
                      {(uploadResponse.data.imageUrl.length / 1024).toFixed(2)} KB
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <details className="cursor-pointer flex-1">
                      <summary className="font-medium text-sm">View Full URL (Click to expand)</summary>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs break-all max-h-32 overflow-y-auto">
                        {uploadResponse.data.imageUrl}
                      </div>
                    </details>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(uploadResponse.data.imageUrl, '_blank')}
                    >
                      Open Image
                    </Button>
                  </div>
                </div>
              )}
              {uploadResponse.data?.testMode && (
                <p className="text-orange-600"><strong>Note:</strong> Running in test mode</p>
              )}
            </div>
          </div>
        )}

        {/* Uploaded Image Display */}
        {uploadedImageUrl && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">4. Uploaded Image (From Server)</h2>
            <div className="flex justify-center">
              <div className="relative max-w-md max-h-64">
                <Image
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  width={400}
                  height={300}
                  className="object-contain border rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="border rounded-lg p-6 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">📝 Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Select an image file (JPEG, PNG, GIF, WebP supported)</li>
            <li>Maximum file size: 5MB</li>
            <li>Preview will show immediately after selection</li>
            <li>Click &quot;Upload Image&quot; to send to server</li>
            <li>Response will show server status and returned data</li>
            <li>If successful, uploaded image will be displayed</li>
            <li><strong>Note:</strong> This uses a test endpoint that converts the image to base64 for preview</li>
          </ul>
        </div>

        {/* API Testing Info */}
        <div className="border rounded-lg p-6 bg-green-50">
          <h2 className="text-xl font-semibold mb-4">🔧 API Testing Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Test Endpoint:</h3>
              <code className="bg-gray-200 p-1 rounded">POST /api/upload/test-image</code>
            </div>
            <div>
              <h3 className="font-medium mb-2">Response Fields:</h3>
              <ul className="list-disc list-inside">
                <li>success (boolean)</li>
                <li>message (string)</li>
                <li>data.imageUrl (base64)</li>
                <li>data.fileInfo (metadata)</li>
                <li>data.uploadedAt (timestamp)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testing Scenarios */}
        <div className="border rounded-lg p-6 bg-yellow-50">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Valid Tests:</h3>
              <ul className="list-disc list-inside">
                <li>Upload JPG/PNG under 5MB</li>
                <li>Check response format</li>
                <li>Verify image preview</li>
                <li>Test file metadata display</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Error Tests:</h3>
              <ul className="list-disc list-inside">
                <li>Upload unsupported format</li>
                <li>Upload file over 5MB</li>
                <li>Submit without selecting file</li>
                <li>Network error simulation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
