// app/api/knowledge/status/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const requestedId = searchParams.get('userId');
    const targetUserId = auth.user.role === 'ADMIN' && requestedId ? requestedId : auth.user.id;

    const status = db.getUserKnowledgeStatus(targetUserId);
    return NextResponse.json(
      { success: true, ...status },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
