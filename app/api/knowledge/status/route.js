// app/api/knowledge/status/route.js
// API ดูสถานะความรู้ของผู้ใช้งาน (ผ่าน/ไม่ผ่าน, คะแนน, สิทธิใช้งานระบบ)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสผู้ใช้งาน (userId)' }, { status: 400 });
    }
    const status = db.getUserKnowledgeStatus(userId);
    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
