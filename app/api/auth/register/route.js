// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateCitizenId } from '@/lib/thai-utils';

export async function POST(request) {
  try {
    const data = await request.json();
    const { citizenId, rank, firstName, lastName, position, unitId, unitName, phone, email, password, requestedRole } = data;

    // ตรวจสอบความครบถ้วนของข้อมูล
    if (!citizenId || !rank || !firstName || !lastName || !position || !unitId || !phone || !email || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' }, { status: 400 });
    }

    // ตรวจสอบความถูกต้องของเลขประจำตัวประชาชน 13 หลัก
    if (!validateCitizenId(citizenId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามรูปแบบทางการ (Checksum Error)' 
      }, { status: 400 });
    }

    // ตรวจสอบการสมัครซ้ำ
    const cleanId = citizenId.replace(/\D/g, '');
    const existingCitizen = db.findUserByCitizenId(cleanId);
    if (existingCitizen) {
      return NextResponse.json({ 
        success: false, 
        message: `เลขประจำตัวประชาชน ${citizenId} นี้เคยลงทะเบียนไว้ในระบบแล้ว ไม่สามารถสมัครซ้ำได้` 
      }, { status: 409 });
    }

    const existingEmail = db.findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ 
        success: false, 
        message: `อีเมล ${email} นี้เคยลงทะเบียนไว้แล้ว` 
      }, { status: 409 });
    }

    // สร้าง User ใหม่ (สถานะเริ่มต้น: PENDING รอการอนุมัติจากแอดมิน)
    const newUser = db.createUser({
      citizenId: cleanId,
      rank,
      firstName,
      lastName,
      position,
      unitId,
      unitName: unitName || unitId,
      phone,
      email,
      password,
      status: 'PENDING',
      isActive: false,
      requestedRole: requestedRole || 'UNIT_OFFICER',
      role: requestedRole || 'UNIT_OFFICER'
    });

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ 
      success: true, 
      pendingApproval: true,
      message: 'ลงทะเบียนขอเข้าใช้งานระบบเรียบร้อยแล้ว บัญชีของท่านอยู่ระหว่างรอผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติสิทธิ์การใช้งาน',
      user: safeUser 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
