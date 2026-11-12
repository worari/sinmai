// lib/telegram.js
// ระบบแจ้งเตือน Real-time ผ่าน Socket.IO & Telegram Bot API

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org/bot';
const MAX_NOTIFICATION_HISTORY = 200;

function sanitizeTelegramCredential(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim();
}

function getEnvDefaultConfig() {
  const botToken = sanitizeTelegramCredential(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = sanitizeTelegramCredential(process.env.TELEGRAM_CHAT_ID);
  const enabled =
    process.env.TELEGRAM_ENABLED === 'true' ||
    (Boolean(botToken) && process.env.TELEGRAM_ENABLED !== 'false');
  return { botToken, chatId, enabled };
}

function getSharedState() {
  if (!globalThis.__rtaTelegramState) {
    globalThis.__rtaTelegramState = {
      config: getEnvDefaultConfig(),
      history: [],
      onPersist: null,
      inFlightRecords: new Map()
    };
  }
  if (!(globalThis.__rtaTelegramState.inFlightRecords instanceof Map)) {
    globalThis.__rtaTelegramState.inFlightRecords = new Map();
  }
  return globalThis.__rtaTelegramState;
}

function triggerPersist() {
  const state = getSharedState();
  if (typeof state.onPersist === 'function') {
    try {
      state.onPersist();
    } catch (e) {
      console.error('Failed to persist notification state:', e);
    }
  }
}

export function bindTelegramPersistence({ onPersist } = {}) {
  const state = getSharedState();
  state.onPersist = onPersist || null;
}

export function hydrateTelegramState({ config, history } = {}) {
  const state = getSharedState();
  const envDefaults = getEnvDefaultConfig();

  if (config && typeof config === 'object') {
    const storedToken = sanitizeTelegramCredential(config.botToken);
    const storedChatId = sanitizeTelegramCredential(config.chatId);
    state.config = {
      botToken: storedToken || envDefaults.botToken,
      chatId: storedChatId || envDefaults.chatId,
      enabled:
        storedToken
          ? Boolean(config.enabled)
          : envDefaults.botToken
            ? envDefaults.enabled
            : Boolean(config.enabled)
    };
  }

  if (Array.isArray(history)) {
    const hydrated = history.slice(-MAX_NOTIFICATION_HISTORY).map((item) => ({
      ...item,
      readBy: Array.isArray(item.readBy) ? item.readBy : []
    }));

    // ป้องกันการรีเฟรชข้อมูลจาก PostgreSQL เขียนทับสถานะการส่งที่กำลังค้างอยู่ในหน่วยความจำ (SENDING -> SENT/FAILED)
    if (state.inFlightRecords && state.inFlightRecords.size > 0) {
      for (const [id, entry] of state.inFlightRecords.entries()) {
        if (!entry?.record) continue;
        const idx = hydrated.findIndex((item) => item.id === id);
        if (idx >= 0) {
          hydrated[idx] = entry.record;
        } else {
          hydrated.push(entry.record);
        }
      }
    }

    state.history = hydrated.slice(-MAX_NOTIFICATION_HISTORY);
  }
}

export function getTelegramStateForStorage() {
  const state = getSharedState();
  return {
    telegramConfig: { ...state.config },
    notifications: [...state.history].slice(-MAX_NOTIFICATION_HISTORY)
  };
}

export function getTelegramConfig() {
  const state = getSharedState();
  return { ...state.config };
}

export function updateTelegramConfig(newConfig = {}) {
  const state = getSharedState();
  state.config = {
    ...state.config,
    ...(newConfig.botToken !== undefined ? { botToken: sanitizeTelegramCredential(newConfig.botToken) } : {}),
    ...(newConfig.chatId !== undefined ? { chatId: sanitizeTelegramCredential(newConfig.chatId) } : {}),
    ...(newConfig.enabled !== undefined ? { enabled: Boolean(newConfig.enabled) } : {})
  };
  triggerPersist();
  return { ...state.config };
}

export function getNotificationHistory(user = null) {
  const state = getSharedState();
  const reversed = [...state.history].reverse();
  if (!user) return reversed.slice(0, MAX_NOTIFICATION_HISTORY);
  return reversed.filter((n) => canUserAccessNotification(n, user)).slice(0, MAX_NOTIFICATION_HISTORY);
}

export function getUnreadCount(userId, notificationsList = null) {
  if (!userId) return 0;
  const list = Array.isArray(notificationsList) ? notificationsList : getSharedState().history;
  return list.filter((n) => !Array.isArray(n.readBy) || !n.readBy.includes(userId)).length;
}

export function canUserAccessNotification(notif, user) {
  if (!notif) return false;
  if (!user) return true;
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

export function escapeTelegramHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function emitSocketEvent(event, payload, room = 'authenticated') {
  const io = global.io || globalThis.io;
  if (!io || !event) return false;
  if (room) {
    io.to(room).emit(event, payload);
  } else {
    io.to('authenticated').emit(event, payload);
  }
  return true;
}

export function emitNotificationViaSocket(event, alertRecord) {
  const io = global.io || globalThis.io;
  if (!io || !alertRecord) return false;

  const isRestricted =
    (Array.isArray(alertRecord.targetRoles) && alertRecord.targetRoles.length > 0) ||
    Boolean(alertRecord.unitId);

  if (!isRestricted) {
    io.to('authenticated').emit(event, alertRecord);
    return true;
  }

  const rooms = new Set(['role_ADMIN']);
  const roles = Array.isArray(alertRecord.targetRoles)
    ? alertRecord.targetRoles
    : ['KSP_OFFICER', 'COMMANDER', 'INSURANCE_REP', 'SK_OFFICER', 'UNIT_OFFICER'];

  for (const r of roles) {
    if (r === 'UNIT_OFFICER') {
      if (alertRecord.unitId) rooms.add(`unit_${alertRecord.unitId}`);
      if (Array.isArray(alertRecord.allowedUnitIds)) {
        alertRecord.allowedUnitIds.forEach((uid) => rooms.add(`unit_${uid}`));
      }
      if (!alertRecord.unitId) {
        rooms.add('role_UNIT_OFFICER');
      }
    } else {
      rooms.add(`role_${r}`);
    }
  }

  io.to(Array.from(rooms)).emit(event, alertRecord);
  return true;
}

/**
 * ส่งข้อความไปยัง Telegram Bot API โดยตรง
 * ใช้ TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID และ https://api.telegram.org/bot
 */
export async function SendToTelegram(message, options = {}) {
  const config = getTelegramConfig();
  const overrideToken = sanitizeTelegramCredential(options.botToken);
  const TELEGRAM_BOT_TOKEN = sanitizeTelegramCredential(
    (overrideToken && !overrideToken.includes('...') ? overrideToken : '') ||
    config.botToken ||
    process.env.TELEGRAM_BOT_TOKEN
  );
  const overrideChatId = sanitizeTelegramCredential(options.chatId);
  const TELEGRAM_CHAT_ID = sanitizeTelegramCredential(
    overrideChatId ||
    config.chatId ||
    process.env.TELEGRAM_CHAT_ID
  );
  const url = TELEGRAM_API_BASE_URL;
  const isEnabled = options.bypassEnabled ? true : Boolean(config.enabled);

  if (!isEnabled) {
    return {
      ok: false,
      skipped: true,
      status: 'LOCAL_ONLY',
      description: 'Telegram Bot ปิดใช้งานอยู่ (ส่งเฉพาะ Socket.IO ภายในระบบ)'
    };
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return {
      ok: false,
      skipped: true,
      status: 'LOCAL_ONLY',
      description: 'ยังไม่ได้กำหนด TELEGRAM_BOT_TOKEN หรือ TELEGRAM_CHAT_ID'
    };
  }

  const timeoutMs = options.timeoutMs || 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: String(message || ''),
        parse_mode: options.parseMode || 'HTML',
        disable_web_page_preview: true
      })
    });

    const resData = await response.json().catch(() => ({
      ok: false,
      description: `Telegram API HTTP ${response.status}`
    }));

    if (!response.ok || !resData.ok) {
      return {
        ok: false,
        status: 'FAILED',
        description: resData.description || `Telegram API HTTP ${response.status}`,
        result: resData
      };
    }

    return {
      ok: true,
      status: 'SENT',
      messageId: resData.result?.message_id || null,
      result: resData.result
    };
  } catch (err) {
    return {
      ok: false,
      status: 'ERROR',
      description:
        err?.name === 'AbortError'
          ? `เชื่อมต่อ Telegram API เกินเวลาที่กำหนด (Timeout ${Math.round(timeoutMs / 1000)}s)`
          : err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Telegram API'
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * ตรวจสอบสถานะการเชื่อมต่อ Telegram Bot (getMe & getChat)
 */
export async function getTelegramBotInfo(overrides = {}) {
  const config = getTelegramConfig();
  const overrideToken = sanitizeTelegramCredential(overrides?.botToken);
  const overrideChatId = sanitizeTelegramCredential(overrides?.chatId);
  const TELEGRAM_BOT_TOKEN = sanitizeTelegramCredential(
    (overrideToken && !overrideToken.includes('...') ? overrideToken : '') ||
    config.botToken ||
    process.env.TELEGRAM_BOT_TOKEN
  );
  const TELEGRAM_CHAT_ID = sanitizeTelegramCredential(
    overrideChatId ||
    config.chatId ||
    process.env.TELEGRAM_CHAT_ID
  );
  const url = TELEGRAM_API_BASE_URL;

  if (!TELEGRAM_BOT_TOKEN) {
    return { ok: false, configured: false, description: 'ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const meRes = await fetch(`${url}${TELEGRAM_BOT_TOKEN}/getMe`, { signal: controller.signal });
    const meJson = await meRes.json().catch(() => ({ ok: false }));
    if (!meRes.ok || !meJson.ok) {
      return {
        ok: false,
        configured: true,
        description: meJson.description || 'ไม่สามารถยืนยันตัวตน Bot Token ได้'
      };
    }

    let chatInfo = null;
    let chatError = null;
    if (TELEGRAM_CHAT_ID) {
      const chatRes = await fetch(
        `${url}${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${encodeURIComponent(TELEGRAM_CHAT_ID)}`,
        { signal: controller.signal }
      );
      const chatJson = await chatRes.json().catch(() => ({ ok: false }));
      if (chatRes.ok && chatJson.ok) {
        chatInfo = {
          id: chatJson.result.id,
          title: chatJson.result.title || chatJson.result.username || chatJson.result.first_name || TELEGRAM_CHAT_ID,
          type: chatJson.result.type
        };
      } else {
        chatError = chatJson.description || 'ไม่สามารถอ่านข้อมูล Chat/Group ID ได้';
      }
    }

    return {
      ok: true,
      configured: true,
      bot: {
        id: meJson.result.id,
        firstName: meJson.result.first_name,
        username: meJson.result.username
      },
      chat: chatInfo,
      chatError
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      description: err?.name === 'AbortError' ? 'เชื่อมต่อ Telegram API หมดเวลา' : err?.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildTelegramHtml({ title, message, trackingCode, claimId, link, by }) {
  const safeTitle = escapeTelegramHtml(title || 'การแจ้งเตือนระบบสินไหมทดแทน ทบ.');
  const safeCode = escapeTelegramHtml(trackingCode || '-');
  const safeMsg = escapeTelegramHtml(message || '-');
  const safeTime = escapeTelegramHtml(new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }));
  const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
  const resolvedPath = link || (claimId ? `/claims/${claimId}` : '');

  const lines = [
    '🎖️ <b>ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ.</b>',
    '',
    `📢 <b>${safeTitle}</b>`,
    `📋 เลขที่อ้างอิง: <code>${safeCode}</code>`,
    `💬 รายละเอียด: ${safeMsg}`
  ];

  if (by) {
    lines.push(`👤 ผู้ดำเนินการ: ${escapeTelegramHtml(by)}`);
  }
  lines.push(`⏰ เวลา: ${safeTime}`);

  if (appUrl && resolvedPath) {
    lines.push(`🔗 <a href="${escapeTelegramHtml(appUrl + resolvedPath)}">เปิดดูรายละเอียดในระบบ</a>`);
  }

  return lines.join('\n');
}

/**
 * ส่งการแจ้งเตือนแบบครบวงจร:
 * 1) บันทึก Notification History + emit Socket.IO ทันทีแบบ Real-time
 * 2) ส่งข้อความผ่าน Telegram Bot (SendToTelegram) และอัปเดตสถานะการส่ง
 */
export async function sendTelegramNotification({
  title,
  message,
  claimId = null,
  trackingCode = null,
  type = 'INFO',
  unitId = null,
  allowedUnitIds = null,
  targetRoles = null,
  by = null,
  link = null,
  sendTelegram = true,
  bypassEnabled = false,
  rawTelegramText = null
}) {
  const state = getSharedState();
  const config = state.config;
  const timestamp = new Date().toISOString();
  const resolvedLink =
    link ||
    (claimId ? `/claims/${claimId}` : type === 'USER_REGISTER_PENDING' ? '/users' : null);

  const shouldAttemptTelegram =
    sendTelegram &&
    (bypassEnabled || config.enabled) &&
    Boolean((config.botToken || process.env.TELEGRAM_BOT_TOKEN || '').trim()) &&
    Boolean(String(config.chatId || process.env.TELEGRAM_CHAT_ID || '').trim());

  const alertRecord = {
    id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title,
    message,
    claimId,
    trackingCode,
    type,
    unitId,
    allowedUnitIds: Array.isArray(allowedUnitIds) ? allowedUnitIds : null,
    targetRoles: Array.isArray(targetRoles) ? targetRoles : null,
    by,
    link: resolvedLink,
    timestamp,
    status: shouldAttemptTelegram ? 'SENDING' : 'LOCAL_ONLY',
    telegramSent: false,
    socketEmitted: false,
    error: null,
    readBy: []
  };

  state.history.push(alertRecord);
  if (state.history.length > MAX_NOTIFICATION_HISTORY) {
    state.history = state.history.slice(-MAX_NOTIFICATION_HISTORY);
  }

  // ส่ง Real-time Notification ผ่าน Socket.IO ทันที
  alertRecord.socketEmitted = emitNotificationViaSocket('new_notification', alertRecord);
  triggerPersist();

  // ส่งข้อความไปยัง Telegram Bot API และติดตามสถานะจนกว่าจะบันทึกเสร็จ
  if (shouldAttemptTelegram) {
    const telegramText =
      rawTelegramText ||
      buildTelegramHtml({ title, message, trackingCode, claimId, link: resolvedLink, by });

    const deliveryPromise = (async () => {
      try {
        const result = await SendToTelegram(telegramText, {
          bypassEnabled,
          parseMode: 'HTML'
        });

        alertRecord.status = result.status || (result.ok ? 'SENT' : 'FAILED');
        alertRecord.telegramSent = Boolean(result.ok);
        if (result.messageId) alertRecord.telegramMessageId = result.messageId;
        if (!result.ok && result.description) alertRecord.error = result.description;

        const existingIndex = state.history.findIndex((item) => item.id === alertRecord.id);
        if (existingIndex >= 0) {
          state.history[existingIndex] = alertRecord;
        } else {
          state.history.push(alertRecord);
          if (state.history.length > MAX_NOTIFICATION_HISTORY) {
            state.history = state.history.slice(-MAX_NOTIFICATION_HISTORY);
          }
        }

        emitNotificationViaSocket('notification_updated', alertRecord);
        triggerPersist();
      } catch (err) {
        alertRecord.status = 'ERROR';
        alertRecord.telegramSent = false;
        alertRecord.error = err?.message || 'เกิดข้อผิดพลาดระหว่างส่งข้อความ Telegram';
        emitNotificationViaSocket('notification_updated', alertRecord);
        triggerPersist();
      } finally {
        state.inFlightRecords.delete(alertRecord.id);
      }
    })();

    state.inFlightRecords.set(alertRecord.id, {
      record: alertRecord,
      promise: deliveryPromise
    });

    await deliveryPromise;
  }

  return alertRecord;
}

export async function awaitPendingTelegramNotifications({ timeoutMs = 8000 } = {}) {
  const state = getSharedState();
  if (!state.inFlightRecords || state.inFlightRecords.size === 0) return;

  const pendingPromises = Array.from(state.inFlightRecords.values())
    .map((entry) => entry?.promise)
    .filter(Boolean);

  if (pendingPromises.length === 0) return;

  let timerId;
  try {
    await Promise.race([
      Promise.allSettled(pendingPromises),
      new Promise((resolve) => {
        timerId = setTimeout(resolve, timeoutMs);
      })
    ]);
  } finally {
    if (timerId) clearTimeout(timerId);
  }
}

export function markNotificationsRead({ notificationId = null, userId, markAll = false } = {}) {
  if (!userId) return 0;
  const state = getSharedState();
  let updatedCount = 0;

  state.history.forEach((item) => {
    if (!Array.isArray(item.readBy)) item.readBy = [];
    const matchTarget = markAll || (notificationId && item.id === notificationId);
    if (matchTarget && !item.readBy.includes(userId)) {
      item.readBy.push(userId);
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    triggerPersist();
    emitSocketEvent('notifications_read', { userId, notificationId, markAll });
  }
  return updatedCount;
}

export function clearNotificationHistory() {
  const state = getSharedState();
  state.history = [];
  triggerPersist();
  emitSocketEvent('notifications_cleared', { timestamp: new Date().toISOString() });
  return true;
}
