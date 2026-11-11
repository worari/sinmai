// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, clearSessionCookie } from '@/lib/security';
import { extractClientInfo } from '@/lib/client-info';

export async function POST(request) {
  await db.ensureReady();
  const auth = authenticateRequest(request, db);
  if (auth.user) {
    const clientInfo = extractClientInfo(request);
    db.addActivityLog({
      userId: auth.user.id,
      userName: `${auth.user.rank || ''} ${auth.user.firstName} ${auth.user.lastName}`.trim(),
      userRole: auth.user.role,
      action: 'LOGOUT',
      actionBadge: 'slate',
      actionLabel: 'ออกจากระบบ',
      details: 'ผู้ใช้งานออกจากระบบและล้าง Session Cookie เรียบร้อยแล้ว',
      ip: clientInfo.ip,
      device: clientInfo.device
    });
    db.saveToFile(['activityLogs']);
    await db.flush();
  }

  const response = NextResponse.json(
    { success: true, message: 'ออกจากระบบเรียบร้อยแล้ว' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  clearSessionCookie(response, request);
  return response;
}

