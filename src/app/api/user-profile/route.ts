import { NextResponse } from 'next/server';
import { generateUserProfile, saveUserProfile, getUserProfile, generatePerformanceMetrics } from '@/lib/user-profiling';
import { debug } from '@/lib/debug';

export async function GET() {
  try {
    // 先尝试从数据库获取现有画像
    let profile = getUserProfile();
    
    // 如果没有画像或画像过期（超过24小时），重新生成
    const shouldRegenerate = !profile || 
      (Date.now() - new Date(profile.last_updated).getTime()) > 24 * 60 * 60 * 1000;
    
    if (shouldRegenerate) {
      const newProfile = await generateUserProfile();
      if (newProfile) {
        saveUserProfile(newProfile);
        profile = newProfile;
      }
    }

    // 生成性能指标
    const metrics = generatePerformanceMetrics(7);
    
    return NextResponse.json({
      success: true,
      data: {
        profile,
        metrics
      }
    });
    
  } catch (error) {
    debug.error('生成用户画像失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '用户画像服务暂时不可用'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // 强制重新生成画像
    const profile = await generateUserProfile();
    
    if (profile) {
      saveUserProfile(profile);
    }

    const metrics = generatePerformanceMetrics(7);
    
    return NextResponse.json({
      success: true,
      data: {
        profile,
        metrics
      }
    });
    
  } catch (error) {
    debug.error('强制重新生成用户画像失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '用户画像生成失败'
    }, { status: 500 });
  }
}