// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();
    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    // ค้นหาจาก Email หรือ เลขประจำตัวประชาชน
    let user = db.findUserByEmail(identifier);
    if (!user) {
      user = db.findUserByCitizenId(identifier);
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: 'เลขประจำตัวประชาชน/อีเมล หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const { password: _, ...userWithoutPass } = user;
    return NextResponse.json({ success: true, user: userWithoutPass });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
