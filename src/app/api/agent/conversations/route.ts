import { NextRequest, NextResponse } from 'next/server';
import { 
  listConversations, 
  createConversation
} from '@/lib/db';
import { debug } from '@/lib/debug';

// 创建会话请求接口
interface CreateConversationRequest {
  title?: string;
  model_name?: string;
  system_prompt?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const keyword = searchParams.get('keyword') || undefined;
    const folderIdParam = searchParams.get('folderId'); // 文件夹过滤参数
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    // 处理folderId参数：'null'字符串表示显示未分组的对话
    let folderId: number | null | undefined;
    if (folderIdParam === 'null') {
      folderId = null; // 显示未分组的对话
    } else if (folderIdParam) {
      folderId = parseInt(folderIdParam, 10);
    } else {
      folderId = undefined; // 不进行文件夹过滤
    }
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;


    
    // 校验folderId参数（跳过'null'字符串的情况）
    if (folderIdParam && folderIdParam !== 'null' && (isNaN(folderId as number) || (folderId as number) < 0)) {
      return NextResponse.json({
        success: false,
        error: 'folderId 必须是非负整数或null'
      }, { status: 400 });
    }

    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      return NextResponse.json({
        success: false,
        error: 'limit 必须是 1-100 之间的数字'
      }, { status: 400 });
    }

    if (offset && (isNaN(offset) || offset < 0)) {
      return NextResponse.json({
        success: false,
        error: 'offset 必须是非负数'
      }, { status: 400 });
    }

    // 查询会话列表
    const conversations = listConversations({
      keyword,
      folderId, // 添加文件夹过滤
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      conversations,
      pagination: {
        limit,
        offset,
        count: conversations.length
      }
    });

  } catch (error) {
    debug.error('获取会话列表错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取会话列表失败'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateConversationRequest = await request.json();
    
    // 参数校验
    const title = body.title || '新对话';
    const modelName = body.model_name || 'moonshotai/kimi-k2';
    const systemPrompt = body.system_prompt || undefined;


    // 校验标题长度
    if (title.length > 100) {
      return NextResponse.json({
        success: false,
        error: '会话标题不能超过 100 字符'
      }, { status: 400 });
    }

    // 校验系统提示长度
    if (systemPrompt && systemPrompt.length > 2000) {
      return NextResponse.json({
        success: false,
        error: '系统提示不能超过 2000 字符'
      }, { status: 400 });
    }



    // 创建会话
    const conversation = createConversation({
      title,
      model_name: modelName,
      system_prompt: systemPrompt
    });



    return NextResponse.json({
      success: true,
      conversation
    }, { status: 201 });

  } catch (error) {
    debug.error('创建会话错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建会话失败'
    }, { status: 500 });
  }
}
