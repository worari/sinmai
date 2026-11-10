// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientInfo } from '@/lib/client-info';

export async function POST(request) {
  try {
    const clientInfo = extractClientInfo(request);
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
      // บันทึก Log การพยายามเข้าสู่ระบบไม่สำเร็จ
      if (user) {
        db.addActivityLog({
          userId: user.id,
          userName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim(),
          userRole: user.role || 'GUEST',
          action: 'LOGIN_FAILED',
          actionBadge: 'red',
          actionLabel: 'รหัสผ่านผิด',
          details: `เข้าสู่ระบบไม่สำเร็จ: รหัสผ่านไม่ถูกต้องสำหรับบัญชี ${user.email || user.citizenId}`,
          ip: clientInfo.ip,
          device: clientInfo.device
        });
      }
      return NextResponse.json({ success: false, message: 'เลขประจำตัวประชาชน/อีเมล หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // ตรวจสอบสถานะการอนุมัติและระงับการใช้งาน
    const userStatus = user.status || (user.isActive === false ? 'SUSPENDED' : 'APPROVED');

    if (userStatus === 'PENDING') {
      db.addActivityLog({
        userId: user.id,
        userName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim(),
        userRole: user.role || 'PENDING',
        action: 'LOGIN_PENDING',
        actionBadge: 'amber',
        actionLabel: 'รออนุมัติ',
        details: `พยายามเข้าสู่ระบบขณะสถานะบัญชี "รอการอนุมัติจากผู้ดูแลระบบ"`,
        ip: clientInfo.ip,
        device: clientInfo.device
      });
      return NextResponse.json({ 
        success: false, 
        status: 'PENDING',
        message: 'บัญชีของท่านอยู่ระหว่างรอผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติสิทธิ์ กรุณารอการอนุมัติก่อนเข้าใช้งานระบบ' 
      }, { status: 403 });
    }

    if (userStatus === 'SUSPENDED' || user.isActive === false) {
      db.addActivityLog({
        userId: user.id,
        userName: `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim(),
        userRole: user.role,
        action: 'LOGIN_BLOCKED',
        actionBadge: 'red',
        actionLabel: 'ถูกระงับ',
        details: `พยายามเข้าสู่ระบบขณะบัญชีถูกระงับการใช้งาน`,
        ip: clientInfo.ip,
        device: clientInfo.device
      });
      return NextResponse.json({ 
        success: false, 
        status: 'SUSPENDED',
        message: 'บัญชีของท่านถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบส่วนกลาง' 
      }, { status: 403 });
    }

    if (userStatus === 'REJECTED') {
      return NextResponse.json({ 
        success: false, 
        status: 'REJECTED',
        message: `คำขอลงทะเบียนของท่านไม่ผ่านการอนุมัติ (${user.rejectedReason || 'กรุณาติดต่อผู้ดูแลระบบ'})` 
      }, { status: 403 });
    }

    // บันทึก Activity Log เข้าสู่ระบบสำเร็จ
    const fullName = `${user.rank || ''} ${user.firstName} ${user.lastName}`.trim();
    db.addActivityLog({
      userId: user.id,
      userName: fullName,
      userRole: user.role,
      action: 'LOGIN',
      actionBadge: 'cyan',
      actionLabel: 'เข้าสู่ระบบ',
      details: `${fullName} เข้าสู่ระบบสำเร็จ (สังกัด: ${user.unitName || '-'}, บทบาท: ${user.role})`,
      ip: clientInfo.ip,
      device: clientInfo.device
    });

    const { password: _, ...userWithoutPass } = user;
    return NextResponse.json({ success: true, user: userWithoutPass });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
