// app/api/users/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = db.getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { userId, action, newRole } = await request.json();

    if (action === 'CHANGE_ROLE') {
      const user = db.updateUserRole(userId, newRole);
      return NextResponse.json({ success: true, message: 'ปรับปรุงสิทธิ์เรียบร้อย', user });
    }

    if (action === 'TOGGLE_ACTIVE') {
      const user = db.toggleUserActive(userId);
      return NextResponse.json({ success: true, message: 'เปลี่ยนสถานะผู้ใช้งานสำเร็จ', user });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
