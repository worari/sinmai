// lib/security.js
// โมดูลความปลอดภัยไซเบอร์: Password Hashing (scrypt), Signed HttpOnly Session, RBAC Guard, Rate Limiter และ PDPA Privacy Helpers

import crypto from 'crypto';
import path from 'path';

export const SESSION_COOKIE_NAME = 'rta_session';
export const PDPA_COOKIE_NAME = 'rta_pdpa_consent';
export const VISITOR_COOKIE_NAME = 'rta_vid';
export const PDPA_POLICY_VERSION = '1.0';
export const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 ชั่วโมง

const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'mp4'
]);
const BLOCKED_MIME_KEYWORDS = ['html', 'svg', 'javascript', 'ecmascript', 'x-msdownload', 'x-sh', 'executable'];
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

function getSessionSecret() {
  const envSecret = (process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || '').trim();
  if (envSecret) return envSecret;

  if (!globalThis.__rtaEphemeralSecret) {
    globalThis.__rtaEphemeralSecret = crypto.randomBytes(32).toString('hex');
  }
  return globalThis.__rtaEphemeralSecret;
}

// ============================================================
// 1. Password Hashing (Salted scrypt + Constant-Time Compare)
// ============================================================
export function isPasswordHashed(stored) {
  return typeof stored === 'string' && stored.startsWith('scrypt$') && stored.split('$').length === 3;
}

export function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(plainPassword), salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(plainPassword, storedPassword) {
  if (!plainPassword || !storedPassword) return false;

  if (isPasswordHashed(storedPassword)) {
    const [, salt, hashHex] = storedPassword.split('$');
    if (!salt || !hashHex) return false;
    const derived = crypto.scryptSync(String(plainPassword), salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  }

  // Fallback for legacy unmigrated plaintext records (constant-time comparison)
  const a = Buffer.from(String(plainPassword), 'utf8');
  const b = Buffer.from(String(storedPassword), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ============================================================
// 2. Signed Session Token & HttpOnly Cookie Utilities
// ============================================================
function signTokenData(dataBase64) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(dataBase64)
    .digest('base64url');
}

export function createSessionToken(user, ttlSeconds = SESSION_TTL_SECONDS) {
  if (!user?.id) throw new Error('Cannot create session without user id');
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    uid: user.id,
    role: user.role,
    unitId: user.unitId || '',
    iat: nowSec,
    exp: nowSec + ttlSeconds
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = signTokenData(encoded);
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  const expectedSig = signTokenData(encoded);
  const providedBuf = Buffer.from(providedSig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload?.uid || typeof payload.exp !== 'number' || payload.exp <= nowSec) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

export function parseCookieHeader(cookieHeader = '') {
  const map = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return map;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const key = pair.slice(0, eqIdx).trim();
    const val = pair.slice(eqIdx + 1).trim();
    if (!key) continue;
    try {
      map[key] = decodeURIComponent(val);
    } catch (e) {
      map[key] = val;
    }
  }
  return map;
}

export function isHttpsRequest(request) {
  if (!request) return false;
  const xfProto = request.headers?.get?.('x-forwarded-proto') || '';
  if (xfProto.toLowerCase().includes('https')) return true;
  if (typeof request.url === 'string' && request.url.startsWith('https://')) return true;
  return false;
}

export function attachSessionCookie(response, request, user) {
  const token = createSessionToken(user);
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    secure: isHttpsRequest(request)
  });
  return response;
}

export function clearSessionCookie(response, request) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: isHttpsRequest(request)
  });
  return response;
}

export function getSessionPayloadFromCookieHeader(cookieHeader) {
  const cookies = parseCookieHeader(cookieHeader);
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}

export function getSessionPayloadFromRequest(request) {
  const directCookie = request.cookies?.get?.(SESSION_COOKIE_NAME)?.value;
  if (directCookie) {
    return verifySessionToken(directCookie);
  }
  const cookieHeader = request.headers?.get?.('cookie') || '';
  return getSessionPayloadFromCookieHeader(cookieHeader);
}

/**
 * ตรวจสอบสิทธิ์ผู้ใช้งานจาก Signed Session Cookie เท่านั้น (ป้องกัน IDOR/Impersonation)
 */
export function authenticateRequest(request, db, { roles = null } = {}) {
  const payload = getSessionPayloadFromRequest(request);
  if (!payload) {
    return {
      user: null,
      errorStatus: 401,
      errorMessage: 'กรุณาเข้าสู่ระบบเพื่อยืนยันตัวตนก่อนใช้งาน (Session ไม่ถูกต้องหรือหมดอายุ)'
    };
  }

  const user = db.findUserById(payload.uid);
  if (!user) {
    return {
      user: null,
      errorStatus: 401,
      errorMessage: 'ไม่พบข้อมูลบัญชีผู้ใช้งานในระบบ (Unauthorized)'
    };
  }

  const userStatus = user.status || (user.isActive === false ? 'SUSPENDED' : 'APPROVED');
  if (userStatus !== 'APPROVED' || user.isActive === false) {
    return {
      user: null,
      errorStatus: 403,
      errorMessage: 'บัญชีผู้ใช้งานไม่ได้รับอนุมัติหรือถูกระงับการใช้งาน'
    };
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user.role)) {
    return {
      user: null,
      errorStatus: 403,
      errorMessage: 'ท่านไม่มีสิทธิเข้าถึงหรือดำเนินการในส่วนนี้ (Forbidden)'
    };
  }

  const { password: _, ...safeUser } = user;
  return { user: safeUser, payload };
}

// ============================================================
// 3. In-Memory Sliding-Window Rate Limiter (Brute-Force Shield)
// ============================================================
function getRateLimitStore() {
  if (!globalThis.__rtaRateLimits) {
    globalThis.__rtaRateLimits = new Map();
  }
  return globalThis.__rtaRateLimits;
}

export function checkRateLimit(key, { maxRequests = 10, windowMs = 5 * 60 * 1000 } = {}) {
  const store = getRateLimitStore();
  const now = Date.now();
  const cutoff = now - windowMs;

  if (store.size > 2000) {
    for (const [k, timestamps] of store.entries()) {
      const fresh = timestamps.filter((ts) => ts > cutoff);
      if (fresh.length === 0) store.delete(k);
      else store.set(k, fresh);
    }
  }

  const entries = (store.get(key) || []).filter((ts) => ts > cutoff);
  if (entries.length >= maxRequests) {
    const oldest = entries[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, entries);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entries.push(now);
  store.set(key, entries);
  return { allowed: true, remaining: Math.max(0, maxRequests - entries.length), retryAfterSeconds: 0 };
}

export function resetRateLimit(key) {
  const store = getRateLimitStore();
  store.delete(key);
}

// ============================================================
// 4. Upload Security & Input Sanitization
// ============================================================
export function validateContentUpload({ fileName = '', mimeType = '', size = 0 } = {}) {
  const ext = path.extname(String(fileName)).replace('.', '').toLowerCase();
  if (!ext || !ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `ไม่อนุญาตให้อัปโหลดไฟล์นามสกุล .${ext || 'unknown'} (อนุญาตเฉพาะ .pdf, .jpg, .png, .doc, .docx, .xls, .xlsx, .mp4 เพื่อป้องกัน XSS/Malware)`
    };
  }

  const lowerMime = String(mimeType || '').toLowerCase();
  if (lowerMime && BLOCKED_MIME_KEYWORDS.some((kw) => lowerMime.includes(kw))) {
    return {
      valid: false,
      error: `ประเภทไฟล์ ${mimeType} ถูกปฏิเสธตามนโยบายความปลอดภัยไซเบอร์`
    };
  }

  if (Number(size) > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: 'ขนาดไฟล์เกินขีดจำกัดสูงสุด 15 MB'
    };
  }

  return { valid: true, ext };
}

export function sanitizeSafeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (trimmed.startsWith('/')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}

// ============================================================
// 5. PDPA & Privacy Masking Helpers
// ============================================================
export function maskIpAddress(ip = '') {
  const raw = String(ip || '').trim();
  if (!raw || raw === '::1' || raw === '127.0.0.1') return 'localhost';
  if (raw.includes('.')) {
    const parts = raw.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  if (raw.includes(':')) {
    const segs = raw.split(':');
    return `${segs.slice(0, 3).join(':')}:xxxx`;
  }
  return 'masked';
}

export function parsePdpaConsentCookie(request) {
  const raw =
    request.cookies?.get?.(PDPA_COOKIE_NAME)?.value ||
    parseCookieHeader(request.headers?.get?.('cookie') || '')[PDPA_COOKIE_NAME];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      necessary: true,
      securityLog: true,
      analytics: Boolean(parsed.analytics),
      preferences: Boolean(parsed.preferences),
      version: parsed.version || PDPA_POLICY_VERSION,
      consentedAt: parsed.consentedAt || null
    };
  } catch (e) {
    return null;
  }
}

