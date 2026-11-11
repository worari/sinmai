// app/api/knowledge/questions/import/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseQuestionsFromExcel } from '@/lib/excel';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const formData = await request.formData();
    const file = formData.get('file');
    const examId = formData.get('examId') || null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเลือกไฟล์ Excel (.xlsx) ที่ต้องการนำเข้า' },
        { status: 400 }
      );
    }

    const fileName = file.name || '';
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      return NextResponse.json(
        { success: false, message: 'รองรับเฉพาะไฟล์ Excel นามสกุล .xlsx เท่านั้น' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = parseQuestionsFromExcel(buffer);

    if (!parsed.success) {
      return NextResponse.json(parsed, { status: 400 });
    }

    let created = [];
    if (examId) {
      const questionsToImport = parsed.questions.map((q) => ({ ...q, examId }));
      created = questionsToImport.map((q) => db.createKnowledgeQuestion(q));
    } else {
      const questionsToImport = parsed.questions.map((q) => ({ ...q, examId: null }));
      created = db.importQuestionsToBank(questionsToImport);
    }
    await db.flush();

    return NextResponse.json(
      {
        success: true,
        message: `นำเข้าข้อสอบจาก Excel สำเร็จ ${created.length} ข้อ (${created.some((c) => c.examId) ? 'เข้าแบบทดสอบ' : 'เข้าธนาคารกลาง'})`,
        count: created.length,
        questions: created
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Import Excel questions error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อสอบจาก Excel' },
      { status: 500 }
    );
  }
}
