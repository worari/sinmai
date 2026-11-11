// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientInfo } from '@/lib/client-info';
import { attachSessionCookie, resetRateLimit } from '@/lib/security';
import { enforceRateLimit } from '@/lib/api-auth';

export async function POST(request) {
  try {
    const rate = enforceRateLimit(request, 'auth-login', {
      maxRequests: 12,
      windowMs: 5 * 60 * 1000,
      message: 'พยายามเข้าสู่ระบบเกินจำนวนครั้งที่กำหนด กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'
    });
    if (rate.response) return rate.response;

    const clientInfo = rate.clientInfo || extractClientInfo(request);
    const { identifier, password } = await request.json();
    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    await db.ensureReady();
    const { user, foundUser } = db.authenticateUser(identifier, password);

    if (!user) {
      if (foundUser) {
        db.addActivityLog({
          userId: foundUser.id,
          userName: `${foundUser.rank || ''} ${foundUser.firstName} ${foundUser.lastName}`.trim(),
          userRole: foundUser.role || 'GUEST',
          action: 'LOGIN_FAILED',
          actionBadge: 'red',
          actionLabel: 'รหัสผ่านผิด',
          details: `เข้าสู่ระบบไม่สำเร็จ: รหัสผ่านไม่ถูกต้องสำหรับบัญชี ${foundUser.email || foundUser.citizenId}`,
          ip: clientInfo.ip,
          device: clientInfo.device
        });
        db.saveToFile(['activityLogs']);
        await db.flush();
      }
      return NextResponse.json({ success: false, message: 'เลขประจำตัวประชาชน/อีเมล หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

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
      db.saveToFile(['activityLogs']);
      await db.flush();
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
      db.saveToFile(['activityLogs']);
      await db.flush();
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

    resetRateLimit(rate.key);

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
    db.saveToFile(['activityLogs']);
    await db.flush();

    const { password: _, ...userWithoutPass } = user;
    const response = NextResponse.json(
      { success: true, user: userWithoutPass },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    attachSessionCookie(response, request, userWithoutPass);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
