// app/api/users/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientInfo } from '@/lib/client-info';
import { requireAuth } from '@/lib/api-auth';
import { validateCitizenId, validatePhoneNumber, validateEmail, validateName } from '@/lib/thai-utils';

function getAdminActor(sessionUser, request) {
  const clientInfo = extractClientInfo(request);
  return {
    id: sessionUser.id,
    name: `${sessionUser.rank || ''} ${sessionUser.firstName} ${sessionUser.lastName}`.trim() || 'ผู้ดูแลระบบ',
    role: sessionUser.role,
    ip: clientInfo.ip,
    device: clientInfo.device
  };
}

// ดึงรายชื่อผู้ใช้งานทั้งหมด พร้อมสถิติสรุป (เฉพาะ ADMIN เท่านั้น)
export async function GET(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const users = db.getAllUsers();
    const summary = db.getUserSummary();
    return NextResponse.json({ success: true, users, summary }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// แอดมินเพิ่มผู้ใช้งานใหม่โดยตรง
export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const currentAdmin = getAdminActor(auth.user, request);
    const data = await request.json();
    const { citizenId, rank, firstName, lastName, position, unitId, unitName, phone, email, password, role, status } = data;

    if (!citizenId || !firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }, { status: 400 });
    }

    if (!validateCitizenId(citizenId)) {
      return NextResponse.json({ success: false, message: 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักตรวจสอบ (Mod 11)' }, { status: 400 });
    }

    if (!validateName(firstName) || !validateName(lastName)) {
      return NextResponse.json({ success: false, message: 'ชื่อและนามสกุลต้องมีอย่างน้อย 2 ตัวอักษร และไม่มีตัวเลข' }, { status: 400 });
    }

    if (phone && !validatePhoneNumber(phone)) {
      return NextResponse.json({ success: false, message: 'เบอร์โทรศัพท์ติดต่อต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง ต้องมีเครื่องหมาย @ และชื่อโดเมน' }, { status: 400 });
    }

    const newUser = db.createUser({
      citizenId,
      rank: rank || 'ร.อ.',
      firstName,
      lastName,
      position: position || 'เจ้าหน้าที่ธุรการ/กำลังพล',
      unitId: unitId || '9th_INF_DIV',
      unitName: unitName || 'กองพลทหารราบที่ 9 (พล.ร.9)',
      phone: phone || '',
      email,
      password,
      role: role || 'UNIT_OFFICER',
      status: status || 'APPROVED',
      isActive: status !== 'SUSPENDED' && status !== 'PENDING',
      ip: currentAdmin.ip,
      device: currentAdmin.device
    }, currentAdmin);
    await db.flush();

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({
      success: true,
      message: `เพิ่มผู้ใช้งาน ${safeUser.rank || ''} ${safeUser.firstName} ${safeUser.lastName} เรียบร้อยแล้ว`,
      user: safeUser
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

// แอดมินแก้ไขข้อมูลผู้ใช้งาน
export async function PUT(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const currentAdmin = getAdminActor(auth.user, request);
    const { userId, adminUser: _ignored, ...updateData } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ userId' }, { status: 400 });
    }

    if (updateData.citizenId && !validateCitizenId(updateData.citizenId)) {
      return NextResponse.json({ success: false, message: 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักตรวจสอบ (Mod 11)' }, { status: 400 });
    }

    if (updateData.firstName && !validateName(updateData.firstName)) {
      return NextResponse.json({ success: false, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร และไม่มีตัวเลข' }, { status: 400 });
    }

    if (updateData.lastName && !validateName(updateData.lastName)) {
      return NextResponse.json({ success: false, message: 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร และไม่มีตัวเลข' }, { status: 400 });
    }

    if (updateData.phone && !validatePhoneNumber(updateData.phone)) {
      return NextResponse.json({ success: false, message: 'เบอร์โทรศัพท์ติดต่อต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0' }, { status: 400 });
    }

    if (updateData.email && !validateEmail(updateData.email)) {
      return NextResponse.json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง ต้องมีเครื่องหมาย @ และชื่อโดเมน' }, { status: 400 });
    }

    // ตรวจสอบเงื่อนไขความปลอดภัยของรหัสผ่านใหม่ (หากมีการเปลี่ยนรหัสผ่าน)
    if (updateData.password !== undefined && updateData.password !== null) {
      const pwd = String(updateData.password).trim();
      if (!pwd) {
        delete updateData.password; // เว้นว่าง = ไม่เปลี่ยนรหัสผ่าน คงรหัสผ่านเดิมของบัญชีไว้
      } else {
        if (pwd.length < 8 || !/[a-zA-Z]/.test(pwd) || !/\d/.test(pwd)) {
          return NextResponse.json({
            success: false,
            message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข'
          }, { status: 400 });
        }
        updateData.password = pwd;
      }
    }

    const updated = db.updateUser(userId, updateData, currentAdmin);
    await db.flush();
    const { password: _, ...safeUser } = updated;
    return NextResponse.json({
      success: true,
      message: `บันทึกการแก้ไขข้อมูล ${safeUser.rank || ''} ${safeUser.firstName} ${safeUser.lastName} เรียบร้อยแล้ว`,
      user: safeUser
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

// ปรับสถานะ / บทบาท / อนุมัติ / ปฏิเสธ ผู้ใช้งาน
export async function PATCH(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const currentAdmin = getAdminActor(auth.user, request);
    const { userId, action, newRole, reason } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ userId' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const user = db.approveUser(userId, { role: newRole, adminUser: currentAdmin });
      await db.flush();
      return NextResponse.json({
        success: true,
        message: `อนุมัติบัญชี ${user.rank || ''} ${user.firstName} ${user.lastName} เรียบร้อยแล้ว (บทบาท: ${user.role})`,
        user
      });
    }

    if (action === 'REJECT') {
      const user = db.rejectUser(userId, { reason, adminUser: currentAdmin });
      await db.flush();
      return NextResponse.json({
        success: true,
        message: `ปฏิเสธคำขอลงทะเบียนของ ${user.rank || ''} ${user.firstName} ${user.lastName} เรียบร้อยแล้ว`,
        user
      });
    }

    if (action === 'CHANGE_ROLE') {
      const user = db.updateUserRole(userId, newRole, currentAdmin);
      await db.flush();
      return NextResponse.json({
        success: true,
        message: `ปรับบทบาท ${user.rank || ''} ${user.firstName} เป็น "${newRole}" เรียบร้อย`,
        user
      });
    }

    if (action === 'TOGGLE_ACTIVE') {
      const user = db.toggleUserActive(userId, currentAdmin);
      await db.flush();
      const statusText = user.isActive ? 'เปิดใช้งาน' : 'ระงับการใช้งาน';
      return NextResponse.json({
        success: true,
        message: `${statusText}บัญชี ${user.rank || ''} ${user.firstName} ${user.lastName} เรียบร้อยแล้ว`,
        user
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// แอดมินลบผู้ใช้งาน
export async function DELETE(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const currentAdmin = getAdminActor(auth.user, request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ userId ที่ต้องการลบ' }, { status: 400 });
    }

    db.deleteUser(userId, currentAdmin);
    await db.flush();
    return NextResponse.json({ success: true, message: 'ลบข้อมูลผู้ใช้งานออกจากระบบเรียบร้อยแล้ว' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
