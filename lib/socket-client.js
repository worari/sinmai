// lib/socket-client.js
// Singleton Socket.IO client สำหรับเชื่อมต่อ Real-time Notification และ Live Updates ทั้งระบบ

'use client';

import { io } from 'socket.io-client';

let socketInstance = null;
let lastRegisteredUserId = undefined;

function readStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('rta_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function registerSocketUser(user = null) {
  if (!socketInstance) return;
  const targetUser = user !== undefined ? user : readStoredUser();
  const nextUid = targetUser?.id || null;

  if (lastRegisteredUserId === undefined) {
    lastRegisteredUserId = nextUid;
  } else if (nextUid !== lastRegisteredUserId) {
    // หากสถานะผู้ใช้เปลี่ยนหลังเชื่อมต่อแล้ว (เช่น เพิ่งเข้าสู่ระบบหรือออกจากระบบ) ให้เชื่อมต่อใหม่เพื่อให้ Cookie ล่าสุดถูกส่งใน Handshake
    lastRegisteredUserId = nextUid;
    if (socketInstance.connected) {
      socketInstance.disconnect();
      socketInstance.connect();
      return;
    }
  }

  if (!socketInstance.connected) return;
  if (nextUid) {
    socketInstance.emit('register_client');
  } else {
    socketInstance.emit('unregister_client');
  }
}

export function getSocketClient() {
  if (typeof window === 'undefined') return null;
  if (!socketInstance) {
    socketInstance = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500
    });

    socketInstance.on('connect', () => {
      registerSocketUser(readStoredUser());
    });
  }
  return socketInstance;
}

export function canViewClientNotification(notif, user) {
  if (!notif || !user) return false;
  if (user.role === 'ADMIN') return true;
  if (Array.isArray(notif.targetRoles) && notif.targetRoles.length > 0) {
    if (!notif.targetRoles.includes(user.role)) return false;
  }
  if (user.role === 'UNIT_OFFICER' && notif.unitId) {
    if (notif.unitId === user.unitId) return true;
    if (Array.isArray(notif.allowedUnitIds) && notif.allowedUnitIds.includes(user.unitId)) return true;
    return false;
  }
  return true;
}

export function isNotificationSoundEnabled() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('rta_notif_sound') !== 'false';
}

export function playNotificationChime() {
  if (typeof window === 'undefined' || !isNotificationSoundEnabled()) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    [660, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.3);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 600);
  } catch (e) {
    // Browser autoplay policy blocked before user interaction
  }
}

