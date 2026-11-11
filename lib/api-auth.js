// lib/api-auth.js
// ตัวช่วยตรวจสอบ Session Cookie (HMAC-SHA256 HttpOnly), RBAC และ Rate Limiting สำหรับ Next.js API Routes

import { NextResponse } from 'next/server';
import { authenticateRequest, checkRateLimit } from './security.js';
import { extractClientInfo } from './client-info.js';

export async function requireAuth(request, db, { roles = null } = {}) {
  await db.ensureReady();
  const auth = authenticateRequest(request, db, { roles });
  if (!auth.user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: auth.errorMessage },
        {
          status: auth.errorStatus,
          headers: { 'Cache-Control': 'no-store' }
        }
      )
    };
  }
  return { user: auth.user, response: null };
}

export function enforceRateLimit(request, scope, { maxRequests = 10, windowMs = 5 * 60 * 1000, message } = {}) {
  const clientInfo = extractClientInfo(request);
  const key = `${scope}:${clientInfo.ip}`;
  const result = checkRateLimit(key, { maxRequests, windowMs });
  if (!result.allowed) {
    return {
      clientInfo,
      key,
      response: NextResponse.json(
        {
          success: false,
          message:
            message ||
            `มีการทำรายการถี่เกินไป เพื่อความปลอดภัยไซเบอร์ กรุณารอ ${result.retryAfterSeconds} วินาทีแล้วลองใหม่อีกครั้ง`
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfterSeconds),
            'Cache-Control': 'no-store'
          }
        }
      )
    };
  }
  return { clientInfo, key, response: null };
}

