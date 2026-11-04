// app/api/claims/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateCitizenId } from '@/lib/thai-utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkCitizenId = searchParams.get('checkCitizenId');
    if (checkCitizenId) {
      const checkResult = db.checkDuplicateCasualty(checkCitizenId);
      return NextResponse.json({ success: true, ...checkResult });
    }

    const userId = searchParams.get('userId');
    const user = userId ? db.findUserById(userId) : null;

    const claims = db.getClaims(user);
    return NextResponse.json({ success: true, claims });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, claimData } = body;

    const user = db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }, { status: 401 });
    }

    if (user.role !== 'UNIT_OFFICER' && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'เฉพาะเจ้าหน้าที่หน่วยเสนอเรื่องเท่านั้นที่สามารถสร้างรายงานได้' }, { status: 403 });
    }

    // ตรวจสอบเลข ปชช. ผู้สูญเสีย
    if (claimData.casualtyCitizenId && !validateCitizenId(claimData.casualtyCitizenId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'เลขประจำตัวประชาชนของผู้สูญเสียไม่ถูกต้องตามรูปแบบทางการ (Checksum Error)' 
      }, { status: 400 });
    }

    // กำหนดยอดเงินตามประเภทสินไหม
    // ยามปกติ 60,000 หรือ หน้าที่สำคัญ/เสี่ยงภัย 300,000
    const compensationAmount = claimData.claimType === 'HIGH_RISK' ? 300000 : 60000;

    const newClaim = db.createClaim({
      ...claimData,
      compensationAmount
    }, user);

    return NextResponse.json({ 
      success: true, 
      message: 'ยื่นเสนอเรื่องขอรับสิทธิเงินค่าสินไหมทดแทนเรียบร้อยแล้ว',
      claim: newClaim 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
