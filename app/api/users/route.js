// app/api/users/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ดึงรายชื่อผู้ใช้งานทั้งหมด พร้อมสถิติสรุป
export async function GET(request) {
  try {
    const users = db.getAllUsers();
    const summary = db.getUserSummary();
    return NextResponse.json({ success: true, users, summary });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// แอดมินเพิ่มผู้ใช้งานใหม่โดยตรง
export async function POST(request) {
  try {
    const data = await request.json();
    const { citizenId, rank, firstName, lastName, position, unitId, unitName, phone, email, password, role, status, adminUser } = data;

    if (!citizenId || !firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }, { status: 400 });
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
      isActive: status !== 'SUSPENDED' && status !== 'PENDING'
    }, adminUser || { id: 'usr-admin-1', name: 'ผู้ดูแลระบบ', role: 'ADMIN' });

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
    const { userId, adminUser, ...updateData } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ userId' }, { status: 400 });
    }

    const updated = db.updateUser(userId, updateData, adminUser);
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
    const { userId, action, newRole, reason, adminUser } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ userId' }, { status: 400 });
    }

    // 1. อนุมัติผู้ใช้งาน
    if (action === 'APPROVE') {
      const user = db.approveUser(userId, { role: newRole, adminUser });
      return NextResponse.json({ 
        success: true, 
        message: `อนุมัติบัญชี ${user.rank || ''} ${user.firstName} ${user.lastName} เรียบร้อยแล้ว (บทบาท: ${user.role})`, 
        user 
      });
    }

    // 2. ปฏิเสธคำขอลงทะเบียน
    if (action === 'REJECT') {
      const user = db.rejectUser(userId, { reason, adminUser });
      return NextResponse.json({ 
        success: true, 
        message: `ปฏิเสธคำขอลงทะเบียนของ ${user.rank || ''} ${user.firstName} ${user.lastName} เรียบร้อยแล้ว`, 
        user 
      });
    }

    // 3. เปลี่ยนแปลงบทบาท (Role)
    if (action === 'CHANGE_ROLE') {
      const user = db.updateUserRole(userId, newRole, adminUser);
      return NextResponse.json({ 
        success: true, 
        message: `ปรับบทบาท ${user.rank || ''} ${user.firstName} เป็น "${newRole}" เรียบร้อย`, 
        user 
      });
    }

    // 4. สลับสถานะ ระงับ / เปิดใช้งาน (Toggle Active/Suspend)
    if (action === 'TOGGLE_ACTIVE') {
      const user = db.toggleUserActive(userId, adminUser);
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ userId ที่ต้องการลบ' }, { status: 400 });
    }

    db.deleteUser(userId);
    return NextResponse.json({ success: true, message: 'ลบข้อมูลผู้ใช้งานออกจากระบบเรียบร้อยแล้ว' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
