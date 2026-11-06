// app/api/knowledge/questions/route.js
// API จัดการข้อสอบ (Knowledge Questions) - สำหรับผู้ดูแลระบบ
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ฟิส셔-เยตส์ สุ่มสลับตำแหน่งในอาร์เรย์ (ใช้กับทั้งข้อสอบและตัวเลือก)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const random = searchParams.get('random') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const shuffleOptions = searchParams.get('shuffleOptions') === 'true';
    const hideAnswers = searchParams.get('hideAnswers') !== 'false'; // default ซ่อนคำตอบถูก

    if (!examId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบ (examId)' }, { status: 400 });
    }

    let questions = db.getKnowledgeQuestions(examId);

    // สุ่มลำดับข้อสอบจากฐานคำถาม (ถ้าขอ random และระบุ limit)
    if (random && limit > 0 && questions.length > limit) {
      questions = shuffleArray(questions).slice(0, limit);
    }

    // สุ่มตำแหน่งตัวเลือกในแต่ละข้อ (ถ้าขอ shuffleOptions)
    if (shuffleOptions) {
      questions = questions.map((q) => ({
        ...q,
        options: shuffleArray(q.options)
      }));
    }

    // ซ่อนแฟล็ก isCorrect ออกจากตัวเลือกก่อนส่งไปฝั่ง client (ค่าเริ่มต้นซ่อน)
    if (hideAnswers) {
      questions = questions.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ id: o.id, text: o.text }))
      }));
    }

    // เรียงตาม orderIndex อีกครั้งเพื่อให้ลำดับคำถามคงที่ (กรณีไม่สุ่ม หรือสุ่มแล้วอยากเรียงกลับ)
    if (!random) {
      questions.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.examId || !body.questionText) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบและข้อความคำถาม' }, { status: 400 });
    }
    const question = db.createKnowledgeQuestion(body);
    return NextResponse.json({ success: true, message: 'เพิ่มข้อสอบสำเร็จ', question }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสข้อสอบที่ต้องการแก้ไข' }, { status: 400 });
    }
    const question = db.updateKnowledgeQuestion(id, updateData);
    return NextResponse.json({ success: true, message: 'แก้ไขข้อสอบสำเร็จ', question });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสข้อสอบที่ต้องการลบ' }, { status: 400 });
    }
    db.deleteKnowledgeQuestion(id);
    return NextResponse.json({ success: true, message: 'ลบข้อสอบสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
