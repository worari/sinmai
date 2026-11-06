// app/api/knowledge/questions/import/route.js
// API นำเข้าคำถามแบบทดสอบจากไฟล์ Excel (.xlsx) - สำหรับผู้ดูแลระบบ
// Content-Type: multipart/form-data (ฟิลด์: file, examId)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseQuestionsFromExcel } from '@/lib/excel';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const examId = formData.get('examId') || null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเลือกไฟล์ Excel (.xlsx) ที่ต้องการนำเข้า' },
        { status: 400 }
      );
    }

    // ตรวจสอบนามสกุลไฟล์
    const fileName = file.name || '';
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      return NextResponse.json(
        { success: false, message: 'รองรับเฉพาะไฟล์ Excel นามสกุล .xlsx เท่านั้น' },
        { status: 400 }
      );
    }

    // อ่านไฟล์เป็น Buffer แล้วแปลงด้วย xlsx
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = parseQuestionsFromExcel(buffer);

    if (!parsed.success) {
      return NextResponse.json(parsed, { status: 400 });
    }

    // กำหนดรหัสแบบทดสอบ (examId) ตามการเลือกของผู้ใช้:
    // - ถ้าเลือก examId ในฟอร์ม => นำเข้าเข้าแบบทดสอบนั้น (ผ่าน createKnowledgeQuestion)
    // - ถ้าไม่เลือก examId => นำเข้าเข้าธนาคารคำถามกลาง (ธนาคารกลาง) โดยไม่ผูกกับแบบทดสอบ
    // ระบบจะเลือกเมธอดที่เหมาะสมตามค่า examId
    let created = [];
    if (examId) {
      const questionsToImport = parsed.questions.map((q) => ({
        ...q,
        examId: examId
      }));
      created = questionsToImport.map((q) => db.createKnowledgeQuestion(q));
    } else {
      // นำเข้าเข้าธนาคารคำถามกลาง
      const questionsToImport = parsed.questions.map((q) => ({
        ...q,
        examId: null
      }));
      created = db.importQuestionsToBank(questionsToImport);
    }

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
