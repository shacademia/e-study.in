import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  // Detect platform
  const platform = process.env.VERCEL ? 'Vercel' : 
                  process.env.NETLIFY ? 'Netlify' : 
                  process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 
                  process.env.RENDER ? 'Render' :
                  'Localhost/Unknown';
  
  // Get memory usage
  const memoryUsage = process.memoryUsage();
  
  // Test timeout by running a long operation
  let timeoutTest = 'Not tested';
  try {
    // Simulate database operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    timeoutTest = 'Passed (2s operation completed)';
  } catch (error) {
    timeoutTest = `Failed: ${error}`;
  }
  
  const endTime = Date.now();
  
  return NextResponse.json({
    platform,
    environment: process.env.NODE_ENV,
    processingTime: `${endTime - startTime}ms`,
    memoryUsage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    },
    timeoutTest,
    limits: {
      vercel: platform === 'Vercel' ? {
        timeout: process.env.VERCEL_ENV === 'production' ? '10s (Hobby) / 15s (Pro)' : '10s',
        memory: '1GB',
        bodySize: '4.5MB'
      } : null,
      netlify: platform === 'Netlify' ? {
        timeout: '10s',
        memory: '1GB', 
        bodySize: '6MB'
      } : null
    }
  });
}

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const bodySize = JSON.stringify(body).length;
    
    // Simulate processing time based on data size
    const processingTime = Math.min(bodySize / 1000, 5000); // Max 5s simulation
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    const endTime = Date.now();
    
    return NextResponse.json({
      success: true,
      bodySize: `${Math.round(bodySize / 1024)}KB`,
      simulatedProcessingTime: `${processingTime}ms`,
      actualProcessingTime: `${endTime - startTime}ms`,
      message: 'Large payload test completed successfully'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Large payload test failed'
    }, { status: 500 });
  }
}