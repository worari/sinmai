// app/api/claims/[id]/delay-reason/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(request, db, { roles: ['UNIT_OFFICER', 'KSP_OFFICER', 'ADMIN'] });
    if (auth.response) return auth.response;
    const user = auth.user;

    const { id } = params;
    const { reason, fileUrl } = await request.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกเหตุผลความล่าช้า/เอกสารไม่ครบถ้วน' }, { status: 400 });
    }

    const updatedClaim = db.uploadDelayReason(id, reason, fileUrl, user);
    await db.flush();
    return NextResponse.json({ 
      success: true, 
      message: 'บันทึกรายงานชี้แจงความล่าช้าเรียบร้อยแล้ว',
      claim: updatedClaim 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
