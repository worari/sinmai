// app/api/users/logs/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientInfo } from '@/lib/client-info';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

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

    return NextResponse.json({ success: true, ...result }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ลบล้างประวัติ Audit Logs ทั้งหมด (เฉพาะผู้ดูแลระบบ ADMIN)
export async function DELETE(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;
    const adminUser = auth.user;

    const clientInfo = extractClientInfo(request);
    db.clearActivityLogs({
      id: adminUser.id,
      name: `${adminUser.rank || ''} ${adminUser.firstName} ${adminUser.lastName}`.trim() || 'ผู้ดูแลระบบ',
      role: adminUser.role,
      ip: clientInfo.ip,
      device: clientInfo.device
    });
    await db.flush();

    return NextResponse.json({
      success: true,
      message: 'ลบล้างประวัติการใช้งานและ Audit Logs เรียบร้อยแล้ว'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
