// lib/client-info.js
// ดึงข้อมูล Real IP Address และอุปกรณ์/เบราว์เซอร์ของผู้ใช้งานจริงจาก HTTP Request Headers

export function extractClientInfo(request) {
  if (!request) {
    return {
      ip: '127.0.0.1',
      device: 'คอมพิวเตอร์ (Web Browser)',
      userAgent: ''
    };
  }

  // 1. ดึง Client IP จริงจาก Headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  let ip = cfConnectingIp || realIp;
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  }
  if (!ip) {
    ip = '127.0.0.1';
  }

  // จัดการรูปแบบ IPv6 localhost และ prefix
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  } else if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // 2. วิเคราะห์ข้อมูลอุปกรณ์และระบบปฏิบัติการจาก User-Agent
  const ua = request.headers.get('user-agent') || '';
  let device = 'คอมพิวเตอร์ (Web Browser)';

  if (!ua) {
    device = 'ระบบภายใน (Internal System)';
  } else if (/ipad/i.test(ua)) {
    device = 'iPad (iPadOS / Safari)';
  } else if (/iphone/i.test(ua)) {
    device = 'iPhone (iOS / Mobile)';
  } else if (/android/i.test(ua)) {
    device = 'สมาร์ตโฟน (Android)';
  } else if (/windows/i.test(ua)) {
    if (/edg/i.test(ua)) device = 'Windows PC (Edge)';
    else if (/chrome/i.test(ua)) device = 'Windows PC (Chrome)';
    else if (/firefox/i.test(ua)) device = 'Windows PC (Firefox)';
    else device = 'Windows PC (Desktop)';
  } else if (/macintosh|mac os x/i.test(ua)) {
    if (/chrome/i.test(ua)) device = 'macOS (Google Chrome)';
    else if (/safari/i.test(ua)) device = 'macOS (Apple Safari)';
    else device = 'Apple Mac (macOS)';
  } else if (/linux/i.test(ua)) {
    device = 'Linux OS (Desktop)';
  }

  return { ip, device, userAgent: ua };
}

