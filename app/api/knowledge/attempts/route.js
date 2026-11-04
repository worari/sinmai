// app/api/knowledge/attempts/route.js
// API สำหรับทำข้อสอบและดูประวัติการทำข้อสอบ (Exam Attempts)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสผู้ใช้งาน (userId)' }, { status: 400 });
    }
    const attempts = db.getExamAttempts(userId);
    return NextResponse.json({ success: true, attempts });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.userId || !body.examId || !Array.isArray(body.answers)) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ userId, examId และคำตอบ (answers)' }, { status: 400 });
    }
    const attempt = db.createExamAttempt(body);
    return NextResponse.json({
      success: true,
      message: attempt.passed ? 'ทำข้อสอบผ่านเกณฑ์แล้ว' : 'ทำข้อสอบเสร็จ แต่ยังไม่ผ่านเกณฑ์',
      attempt
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
