// app/api/knowledge/attempts/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const all = searchParams.get('all') === 'true';

    if (all && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่ดูผลสอบของทุกคนได้' },
        { status: 403 }
      );
    }

    const attempts = all ? db.getAllExamAttempts(examId) : db.getExamAttempts(auth.user.id);
    return NextResponse.json({ success: true, attempts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;

    const body = await request.json();
    if (!body.examId || !Array.isArray(body.answers)) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ examId และคำตอบ (answers)' }, { status: 400 });
    }

    // ผูกผลสอบกับรหัสผู้ใช้ใน Signed Session เสมอ ป้องกันการสอบแทนบุคคลอื่น
    const attempt = db.createExamAttempt({
      ...body,
      userId: auth.user.id
    });
    await db.flush();

    let statusInfo = null;
    try {
      statusInfo = db.getUserKnowledgeStatus(auth.user.id);
    } catch (e) {}

    return NextResponse.json(
      {
        success: true,
        canAccess: Boolean(attempt.passed || statusInfo?.canUseSystem || statusInfo?.isExempt),
        message: attempt.passed ? 'ทำข้อสอบผ่านเกณฑ์แล้ว สามารถเข้าใช้งานระบบได้ทันที' : 'ทำข้อสอบเสร็จ แต่ยังไม่ผ่านเกณฑ์',
        attempt
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
