// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, clearSessionCookie } from '@/lib/security';

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

  return NextResponse.json(
    { success: true, authenticated: true, user: auth.user },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

