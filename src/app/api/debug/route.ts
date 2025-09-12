import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      database_type: process.env.DATABASE_TYPE || 'not_set',
      vercel_env: process.env.VERCEL_ENV || 'not_vercel',
      timestamp: new Date().toISOString(),
      message: 'Debug API working correctly'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'POST method works'
  });
}