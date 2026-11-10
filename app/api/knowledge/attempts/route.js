// app/api/knowledge/attempts/route.js
// API สำหรับทำข้อสอบและดูประวัติการทำข้อสอบ (Exam Attempts)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const examId = searchParams.get('examId');
    const all = searchParams.get('all') === 'true';

    let attempts;
    if (all || !userId) {
      attempts = db.getAllExamAttempts(examId);
    } else {
      attempts = db.getExamAttempts(userId);
    }

    return NextResponse.json(
      { success: true, attempts },
      { headers: { 'Cache-Control': 'no-store' } }
    );
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
    let statusInfo = null;
    try {
      statusInfo = db.getUserKnowledgeStatus(body.userId);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      canAccess: Boolean(attempt.passed || statusInfo?.canUseSystem || statusInfo?.isExempt),
      message: attempt.passed ? 'ทำข้อสอบผ่านเกณฑ์แล้ว สามารถเข้าใช้งานระบบได้ทันที' : 'ทำข้อสอบเสร็จ แต่ยังไม่ผ่านเกณฑ์',
      attempt
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
