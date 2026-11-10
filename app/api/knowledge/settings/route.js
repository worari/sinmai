// app/api/knowledge/settings/route.js
// จัดการการตั้งค่าห้วงการทดสอบความรู้ (เปิด/ปิดห้วงบังคับสอบ)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = db.getExamSettings();
    return NextResponse.json({
      success: true,
      settings
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { isExamPeriodActive, userId } = body;

    let adminUser = null;
    if (userId) {
      adminUser = db.findUserById(userId);
      if (adminUser && adminUser.role !== 'ADMIN') {
        return NextResponse.json({
          success: false,
          message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถเปลี่ยนการตั้งค่าห้วงการทดสอบได้'
        }, { status: 403 });
      }
    }

    if (typeof isExamPeriodActive !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: 'กรุณาระบุสถานะ isExamPeriodActive เป็น boolean (true หรือ false)'
      }, { status: 400 });
    }

    const updated = db.updateExamSettings({ isExamPeriodActive }, adminUser);

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

