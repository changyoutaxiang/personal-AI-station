import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Tracking API - use POST method',
    methods: ['GET', 'POST']
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Tracking event:', body);
    
    // 简单记录日志，不依赖任何数据库
    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to track event' 
    }, { status: 500 });
  }
}