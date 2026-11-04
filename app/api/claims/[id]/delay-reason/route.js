// app/api/claims/[id]/delay-reason/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { userId, reason, fileUrl } = await request.json();

    const user = db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบผู้ใช้งาน' }, { status: 401 });
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกเหตุผลความล่าช้า/เอกสารไม่ครบถ้วน' }, { status: 400 });
    }

    const updatedClaim = db.uploadDelayReason(id, reason, fileUrl, user);
    return NextResponse.json({ 
      success: true, 
      message: 'บันทึกรายงานชี้แจงความล่าช้าเรียบร้อยแล้ว',
      claim: updatedClaim 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
