// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, attachSessionCookie, clearSessionCookie } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  await db.ensureReady();
  const auth = authenticateRequest(request, db);
  if (!auth.user) {
    const response = NextResponse.json(
      { success: true, authenticated: false, user: null },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    clearSessionCookie(response, request);
    return response;
  }

  const user = auth.user;
  if (!user.name) {
    user.name = `${user.rank || ''} ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'เจ้าหน้าที่ ทบ.';
  }

  const response = NextResponse.json(
    { success: true, authenticated: true, user },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  // ต่ออายุ / ซ่อมแซม Signed HttpOnly Session Cookie อัตโนมัติ
  attachSessionCookie(response, request, user);
  return response;
}

