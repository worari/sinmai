// app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const { identifier, newPassword } = await request.json();
    if (!identifier || !newPassword) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
    }

    db.resetPassword(identifier, newPassword);
    return NextResponse.json({ success: true, message: 'รีเซ็ตรหัสผ่านสำเร็จ ท่านสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
