// app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enforceRateLimit } from '@/lib/api-auth';

export async function POST(request) {
  try {
    const rate = enforceRateLimit(request, 'auth-reset-password', {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
      message: 'มีการพยายามรีเซ็ตรหัสผ่านเกินจำนวนที่กำหนด เพื่อความปลอดภัยกรุณารอ 15 นาที'
    });
    if (rate.response) return rate.response;

    const { citizenId, identifier, email, phone, newPassword } = await request.json();
    const targetCitizenId = citizenId || identifier;

    if (!targetCitizenId || !email || !phone || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'เพื่อความปลอดภัยไซเบอร์ กรุณากรอกเลขประจำตัวประชาชน 13 หลัก อีเมล และเบอร์โทรศัพท์ที่ลงทะเบียนไว้ให้ครบทุกช่อง'
      }, { status: 400 });
    }

    if (String(newPassword).length < 8 || !/[a-zA-Z]/.test(String(newPassword)) || !/\d/.test(String(newPassword))) {
      return NextResponse.json({
        success: false,
        message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข'
      }, { status: 400 });
    }

    await db.ensureReady();
    db.resetPassword(targetCitizenId, newPassword, {
      email,
      phone,
      isAdminOverride: false,
      clientInfo: rate.clientInfo
    });
    await db.flush();

    return NextResponse.json({
      success: true,
      message: 'ยืนยันตัวตนและรีเซ็ตรหัสผ่านสำเร็จ ท่านสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
