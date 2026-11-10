// app/api/users/logs/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientInfo } from '@/lib/client-info';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const action = searchParams.get('action') || 'ALL';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const result = db.getActivityLogs({
      searchQuery,
      action,
      limit,
      page
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ลบล้างประวัติ Audit Logs ทั้งหมด (เฉพาะผู้ดูแลระบบ ADMIN)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const adminUser = adminId ? db.findUserById(adminId) : null;

    if (adminUser && adminUser.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถลบล้างประวัติการใช้งานได้'
      }, { status: 403 });
    }

    const clientInfo = extractClientInfo(request);
    db.clearActivityLogs({
      id: adminUser?.id || 'admin',
      name: adminUser?.name || 'ผู้ดูแลระบบ',
      role: adminUser?.role || 'ADMIN',
      ip: clientInfo.ip,
      device: clientInfo.device
    });

    return NextResponse.json({
      success: true,
      message: 'ลบล้างประวัติการใช้งานและ Audit Logs เรียบร้อยแล้ว'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
