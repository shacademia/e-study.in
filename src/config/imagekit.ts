import ImageKit from 'imagekit';

// Log environment variables for debugging
console.log('ImageKit Config Debug:', {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.substring(0, 10) + '...',
  hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

// ImageKit configuration
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/shacademia/',
});

// Validate configuration
if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
  console.error('❌ NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY is not set');
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  console.error('❌ IMAGEKIT_PRIVATE_KEY is not set');
}
if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  console.error('❌ NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is not set');
}

// ImageKit configuration for client-side
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/shacademia/',
};

// Upload options
export interface ImageKitUploadOptions {
  fileName: string;
  folder?: string;
  tags?: string[];
  isPrivateFile?: boolean;
  useUniqueFileName?: boolean;
  responseFields?: string[];
}

// Default upload options for questions
export const questionImageUploadOptions: Partial<ImageKitUploadOptions> = {
  folder: '/questions',
  useUniqueFileName: true,
  tags: ['question'],
  responseFields: ['fileId', 'name', 'size', 'filePath', 'url', 'fileType'],
};

// Default upload options for question options
export const optionImageUploadOptions: Partial<ImageKitUploadOptions> = {
  folder: '/questions/options',
  useUniqueFileName: true,
  tags: ['question', 'option'],
  responseFields: ['fileId', 'name', 'size', 'filePath', 'url', 'fileType'],
};

// Default upload options for profile images
export const profileImageUploadOptions: Partial<ImageKitUploadOptions> = {
  folder: '/profiles',
  useUniqueFileName: true,
  tags: ['profile', 'user'],
  responseFields: ['fileId', 'name', 'size', 'filePath', 'url', 'fileType'],
};
