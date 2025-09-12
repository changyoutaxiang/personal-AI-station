import { NextRequest, NextResponse } from 'next/server';
import { trackEvent as serverTrackEvent } from '@/lib/behavior-tracker';
import { debug } from '@/lib/debug';

export async function GET() {
  return NextResponse.json({ message: 'Tracking API - use POST method' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    // 根据追踪类型调用相应的服务器端方法
    switch (type) {
      case 'page_view':
        await serverTrackEvent.pageView(data.url);
        break;
        
      case 'ai_interaction':
        await serverTrackEvent.aiInteraction(data.action, {
          original_length: data.original_length,
          success: data.success,
          content_length: data.content_length,
          result_count: data.result_count
        });
        break;
        
      case 'content_create':
        await serverTrackEvent.contentCreate(data.contentLength, data.projectTag);
        break;
        
      case 'content_edit':
        await serverTrackEvent.contentEdit(data.entryId, data.changes);
        break;
        
      case 'tag_usage':
        await serverTrackEvent.tagUsage(data.tagType, data.tagValue);
        break;
        
      case 'search':
        await serverTrackEvent.search(data.query, data.resultCount);
        break;
        
      default:
        debug.warn('未知的追踪类型:', type);
        return NextResponse.json({ success: false, error: '未知的追踪类型' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    debug.error('追踪API错误:', error);
    return NextResponse.json({ success: false, error: '追踪失败' }, { status: 500 });
  }
}