// app/api/knowledge/can-access/route.js
// API ตรวจสอบว่าผู้ใช้งานมีสิทธิใช้งานระบบหรือไม่ (ต้องผ่านแบบทดสอบความรู้)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, canAccess: false, message: 'กรุณาระบุรหัสผู้ใช้งาน (userId)' }, { status: 400 });
    }
    const status = db.getUserKnowledgeStatus(userId);
    return NextResponse.json({
      success: true,
      canAccess: status.canUseSystem || status.isExempt || status.role === 'ADMIN',
      passed: status.passed,
      isExempt: Boolean(status.isExempt || status.role === 'ADMIN'),
      role: status.role,
      score: status.score,
      message: status.message,
      windowOpen: status.windowOpen
    });
  } catch (error) {
    return NextResponse.json({ success: false, canAccess: false, message: error.message }, { status: 500 });
  }
}
