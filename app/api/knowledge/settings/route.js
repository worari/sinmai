// app/api/knowledge/settings/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.ensureReady();
    const settings = db.getExamSettings();
    return NextResponse.json(
      { success: true, settings },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const body = await request.json();
    const { isExamPeriodActive } = body;

    if (typeof isExamPeriodActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุสถานะ isExamPeriodActive เป็น boolean (true หรือ false)' },
        { status: 400 }
      );
    }

    const updated = db.updateExamSettings({ isExamPeriodActive }, auth.user);
    await db.flush();

    return NextResponse.json({
      success: true,
      message: isExamPeriodActive
        ? 'เปิดห้วงการทดสอบความรู้เรียบร้อยแล้ว: ผู้ใช้งานทุกคนต้องผ่านแบบทดสอบก่อนใช้งานระบบ'
        : 'ปิดห้วงการทดสอบความรู้เรียบร้อยแล้ว: ผู้ใช้งานทุกคนสามารถเข้าใช้งานระบบได้ตามปกติ',
      settings: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
