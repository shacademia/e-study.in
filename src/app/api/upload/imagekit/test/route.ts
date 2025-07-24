import { NextResponse } from 'next/server';
import { imagekit } from '@/config/imagekit';

export async function GET() {
  try {
    console.log('Testing ImageKit configuration...');
    console.log('Public Key:', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.substring(0, 10) + '...');
    console.log('Private Key:', process.env.IMAGEKIT_PRIVATE_KEY ? 'Set' : 'Not set');
    console.log('URL Endpoint:', process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT);

    // Test authentication by trying to get upload token
    const authParams = imagekit.getAuthenticationParameters();
    
    return NextResponse.json({
      success: true,
      message: 'ImageKit authentication successful',
      config: {
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.substring(0, 10) + '...',
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
        hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
      },
      authParams: {
        hasToken: !!authParams.token,
        hasExpire: !!authParams.expire,
        hasSignature: !!authParams.signature,
      }
    });

  } catch (error) {
    console.error('ImageKit test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'ImageKit configuration test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.substring(0, 10) + '...',
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
        hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
      }
    }, { status: 500 });
  }
}
