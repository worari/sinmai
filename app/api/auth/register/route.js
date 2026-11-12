// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateCitizenId } from '@/lib/thai-utils';
import { extractClientInfo } from '@/lib/client-info';
import { enforceRateLimit } from '@/lib/api-auth';

const ALLOWED_SELF_REGISTER_ROLES = new Set([
  'UNIT_OFFICER',
  'KSP_OFFICER',
  'COMMANDER',
  'INSURANCE_REP',
  'SK_OFFICER'
]);

export async function POST(request) {
  try {
    const rate = enforceRateLimit(request, 'auth-register', {
      maxRequests: 8,
      windowMs: 15 * 60 * 1000,
      message: 'มีการส่งคำขอลงทะเบียนถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'
    });
    if (rate.response) return rate.response;

    const clientInfo = rate.clientInfo || extractClientInfo(request);
    const data = await request.json();
    const { citizenId, rank, firstName, lastName, position, unitId, unitName, phone, email, password, requestedRole, pdpaAccepted } = data;

    if (!citizenId || !rank || !firstName || !lastName || !position || !unitId || !phone || !email || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' }, { status: 400 });
    }

    if (pdpaAccepted !== true) {
      return NextResponse.json({
        success: false,
        message: 'กรุณายอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) และการบันทึกประวัติการใช้งานก่อนลงทะเบียน'
      }, { status: 400 });
    }

    if (String(password).length < 8 || !/[a-zA-Z]/.test(String(password)) || !/\d/.test(String(password))) {
      return NextResponse.json({
        success: false,
        message: 'เพื่อความปลอดภัยไซเบอร์ รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข'
      }, { status: 400 });
    }

    if (!validateCitizenId(citizenId)) {
      return NextResponse.json({
        success: false,
        message: 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามรูปแบบทางการ (Checksum Error)'
      }, { status: 400 });
    }

    await db.ensureReady();
    const allUnits = db.getAllUnits();
    const matchedUnit = allUnits.find((u) => u.id === unitId);
    if (!matchedUnit) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบหน่วยสังกัดที่เลือกในโครงสร้างหน่วย กรุณาพิมพ์ค้นหาและเลือกหน่วยจากรายการ'
      }, { status: 400 });
    }
    if (matchedUnit.status === 'INACTIVE') {
      return NextResponse.json({
        success: false,
        message: 'หน่วยสังกัดที่เลือกถูกระงับการใช้งานชั่วคราว กรุณาเลือกหน่วยอื่นหรือติดต่อผู้ดูแลระบบ'
      }, { status: 400 });
    }

    const cleanId = citizenId.replace(/\D/g, '');
    if (db.findUserByCitizenId(cleanId)) {
      return NextResponse.json({
        success: false,
        message: `เลขประจำตัวประชาชน ${citizenId} นี้เคยลงทะเบียนไว้ในระบบแล้ว ไม่สามารถสมัครซ้ำได้`
      }, { status: 409 });
    }

    if (db.findUserByEmail(email)) {
      return NextResponse.json({
        success: false,
        message: `อีเมล ${email} นี้เคยลงทะเบียนไว้แล้ว`
      }, { status: 409 });
    }

    // ป้องกัน Privilege Escalation: ห้ามขอสิทธิ์ ADMIN ผ่านหน้าลงทะเบียนสาธารณะเด็ดขาด
    const safeRequestedRole = ALLOWED_SELF_REGISTER_ROLES.has(requestedRole) ? requestedRole : 'UNIT_OFFICER';

    const newUser = db.createUser({
      citizenId: cleanId,
      rank,
      firstName,
      lastName,
      position,
      unitId: matchedUnit.id,
      unitName: matchedUnit.name || unitName || matchedUnit.id,
      phone,
      email,
      password,
      status: 'PENDING',
      isActive: false,
      requestedRole: safeRequestedRole,
      role: safeRequestedRole,
      pdpaConsent: {
        accepted: true,
        version: '1.0',
        acceptedAt: new Date().toISOString()
      },
      ip: clientInfo.ip,
      device: clientInfo.device
    });
    await db.flush();

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
