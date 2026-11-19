// lib/line.js
// ระบบแจ้งเตือน Real-time ผ่าน LINE Messaging API (LINE Official Account: กองสิทธิกำลังพล)

const LINE_OAUTH_URL = 'https://api.line.me/v2/oauth/accessToken';
const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';
const LINE_BOT_INFO_URL = 'https://api.line.me/v2/bot/info';
const MAX_LINE_HISTORY = 200;

function sanitizeCredential(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim();
}

function getEnvDefaultConfig() {
  const channelId = sanitizeCredential(process.env.LINE_CHANNEL_ID || '2008072444');
  const channelSecret = sanitizeCredential(process.env.LINE_CHANNEL_SECRET || '544681060829d50b24e740428b35f8fa');
  const userId = sanitizeCredential(process.env.LINE_USER_ID || 'U0c2d860736a215cc3dbd3ecad1f8074b');
  const channelAccessToken = sanitizeCredential(process.env.LINE_CHANNEL_ACCESS_TOKEN || '');
  const enabled = process.env.LINE_ENABLED === 'false' ? false : true;
  return { channelId, channelSecret, userId, channelAccessToken, enabled };
}

function getSharedState() {
  if (!globalThis.__rtaLineState) {
    globalThis.__rtaLineState = {
      config: getEnvDefaultConfig(),
      cachedToken: null,
      tokenExpiresAt: 0,
      history: [],
      onPersist: null
    };
  }
  return globalThis.__rtaLineState;
}

function triggerPersist() {
  const state = getSharedState();
  if (typeof state.onPersist === 'function') {
    try {
      state.onPersist();
    } catch (e) {
      console.error('Failed to persist LINE notification state:', e);
    }
  }
}

export function bindLinePersistence({ onPersist } = {}) {
  const state = getSharedState();
  state.onPersist = onPersist || null;
}

export function hydrateLineState({ config, history } = {}) {
  const state = getSharedState();
  const envDefaults = getEnvDefaultConfig();

  if (config && typeof config === 'object') {
    state.config = {
      channelId: sanitizeCredential(config.channelId) || envDefaults.channelId,
      channelSecret: sanitizeCredential(config.channelSecret) || envDefaults.channelSecret,
      userId: sanitizeCredential(config.userId) || envDefaults.userId,
      channelAccessToken: sanitizeCredential(config.channelAccessToken) || envDefaults.channelAccessToken,
      enabled: config.enabled !== undefined ? Boolean(config.enabled) : envDefaults.enabled
    };
    if (config.cachedToken) {
      state.cachedToken = config.cachedToken;
      state.tokenExpiresAt = Number(config.tokenExpiresAt || 0);
    }
  }

  if (Array.isArray(history)) {
    state.history = history.slice(-MAX_LINE_HISTORY);
  }
}

export function getLineStateForStorage() {
  const state = getSharedState();
  return {
    lineConfig: {
      ...state.config,
      cachedToken: state.cachedToken,
      tokenExpiresAt: state.tokenExpiresAt
    },
    lineHistory: state.history.slice(-50)
  };
}

export function getLineConfig() {
  const state = getSharedState();
  return { ...state.config };
}

export function updateLineConfig(newConfig = {}) {
  const state = getSharedState();
  const prevSecret = state.config.channelSecret;
  const prevId = state.config.channelId;

  state.config = {
    ...state.config,
    ...newConfig
  };

  // หากมีการเปลี่ยน Channel ID หรือ Channel Secret ให้ล้าง Token เดิมเพื่อขอใหม่
  if (newConfig.channelId !== prevId || newConfig.channelSecret !== prevSecret) {
    state.cachedToken = null;
    state.tokenExpiresAt = 0;
  }

  triggerPersist();
  return { ...state.config };
}

/**
 * ขอรับ Channel Access Token ผ่าน LINE OAuth 2.0 Client Credentials
 */
export async function getLineAccessToken(forceRefresh = false) {
  const state = getSharedState();
  const config = state.config;

  // หากมีการระบุ Long-lived Access Token ไว้โดยตรง ให้ใช้ค่านี้
  if (config.channelAccessToken && config.channelAccessToken.length > 30) {
    return config.channelAccessToken;
  }

  // หาก Token เดิมใน Memory ยังไม่หมดอายุ (กันเผื่อไว้ 1 ชั่วโมง)
  const now = Date.now();
  if (!forceRefresh && state.cachedToken && state.tokenExpiresAt > now + 3600 * 1000) {
    return state.cachedToken;
  }

  const channelId = config.channelId || process.env.LINE_CHANNEL_ID;
  const channelSecret = config.channelSecret || process.env.LINE_CHANNEL_SECRET;

  if (!channelId || !channelSecret) {
    throw new Error('ยังไม่ได้กำหนดค่า LINE Channel ID หรือ Channel Secret');
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: channelId,
    client_secret: channelSecret
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(LINE_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      signal: controller.signal
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
      throw new Error(data.error_description || data.error || 'ไม่สามารถขอรับ LINE Access Token ได้');
    }

    state.cachedToken = data.access_token;
    state.tokenExpiresAt = Date.now() + (Number(data.expires_in) || 2592000) * 1000;
    triggerPersist();

    return state.cachedToken;
  } catch (err) {
    console.error('LINE getAccessToken error:', err);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * ดึงข้อมูล LINE Bot Profile
 */
export async function getLineBotInfo() {
  const config = getLineConfig();
  if (!config.channelId || !config.channelSecret) {
    return { ok: false, configured: false, description: 'ยังไม่ได้ตั้งค่า LINE Channel ID / Secret' };
  }

  try {
    const token = await getLineAccessToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(LINE_BOT_INFO_URL, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!res.ok || !data.userId) {
      return { ok: false, configured: true, description: data.message || 'ไม่สามารถอ่านข้อมูล LINE Bot ได้' };
    }

    return {
      ok: true,
      configured: true,
      bot: {
        userId: data.userId,
        basicId: data.basicId,
        displayName: data.displayName,
        pictureUrl: data.pictureUrl,
        chatMode: data.chatMode
      }
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      description: err?.message || 'เกิดข้อผิดพลาดในการตรวจสอบ LINE Bot'
    };
  }
}

/**
 * ส่งข้อความ Push Message ผ่าน LINE Messaging API
 */
export async function sendLinePushMessage({ to, messages, text, flex = null, bypassEnabled = false }) {
  const state = getSharedState();
  const config = state.config;

  if (!bypassEnabled && !config.enabled) {
    return { ok: false, skipped: true, description: 'การแจ้งเตือน LINE ถูกปิดการใช้งานอยู่' };
  }

  const targetUsersRaw = to || config.userId || process.env.LINE_USER_ID;
  if (!targetUsersRaw) {
    return { ok: false, skipped: true, description: 'ยังไม่ได้ระบุ LINE User ID ปลายทาง' };
  }

  // รองรับการระบุหลาย User ID คั่นด้วยจุลภาค
  const targetUsers = String(targetUsersRaw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (targetUsers.length === 0) {
    return { ok: false, skipped: true, description: 'ไม่พบ User ID ที่ถูกต้อง' };
  }

  const token = await getLineAccessToken();

  let resolvedMessages = [];
  if (Array.isArray(messages) && messages.length > 0) {
    resolvedMessages = messages;
  } else if (flex) {
    resolvedMessages = [
      {
        type: 'flex',
        altText: text || 'แจ้งเตือนระบบสินไหมทดแทน ทบ.',
        contents: flex
      }
    ];
  } else if (text) {
    resolvedMessages = [
      {
        type: 'text',
        text: String(text).slice(0, 5000)
      }
    ];
  } else {
    throw new Error('กรุณาระบุข้อความที่ต้องการส่งผ่าน LINE');
  }

  const results = [];
  for (const recipientId of targetUsers) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(LINE_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          to: recipientId,
          messages: resolvedMessages
        }),
        signal: controller.signal
      });

      const resJson = await res.json().catch(() => ({}));
      if (res.ok) {
        results.push({ to: recipientId, ok: true, sentMessages: resJson.sentMessages });
      } else {
        results.push({ to: recipientId, ok: false, message: resJson.message || `HTTP ${res.status}` });
      }
    } catch (err) {
      results.push({ to: recipientId, ok: false, message: err?.message || 'ส่งข้อความล้มเหลว' });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const allSuccess = results.every((r) => r.ok);
  return {
    ok: allSuccess,
    results,
    recipientCount: targetUsers.length
  };
}

/**
 * สร้างข้อความแจ้งเตือนมาตรฐานสำหรับระบบสินไหมทดแทน ทบ.
 */
function buildLineTextMessage({ title, message, trackingCode, claimId, link, by }) {
  const timeStr = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
  const fullLink = link ? (link.startsWith('http') ? link : `${appBaseUrl}${link}`) : `${appBaseUrl}/claims/${claimId || ''}`;

  return [
    `🎖️ แจ้งเตือน: ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน กองทัพบก`,
    `----------------------------------------`,
    `📌 เรื่อง: ${title || 'อัปเดตสถานะคำร้อง'}`,
    trackingCode ? `🏷️ เลขที่คำร้อง: ${trackingCode}` : null,
    message ? `📝 รายละเอียด:\n${message}` : null,
    by ? `👤 ดำเนินการโดย: ${by}` : null,
    `🕒 เวลา: ${timeStr} น.`,
    `----------------------------------------`,
    `🔗 ตรวจสอบรายละเอียดคำร้อง:\n${fullLink}`
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * สร้าง LINE Flex Message Bubble สวยงามตาม Theme กองทัพบก
 */
function buildLineFlexMessage({ title, message, trackingCode, claimId, link, by }) {
  const timeStr = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
  const fullLink = link ? (link.startsWith('http') ? link : `${appBaseUrl}${link}`) : `${appBaseUrl}/claims/${claimId || ''}`;

  return {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#071815',
      paddingTop: '16px',
      paddingBottom: '16px',
      contents: [
        {
          type: 'text',
          text: '🎖️ กองสิทธิกำลังพล กพ.ทบ.',
          color: '#d4af37',
          weight: 'bold',
          size: 'xs'
        },
        {
          type: 'text',
          text: title || 'แจ้งเตือนสินไหมทดแทน ทบ.',
          color: '#ffffff',
          weight: 'bold',
          size: 'md',
          wrap: true,
          margin: 'sm'
        }
      ]
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        trackingCode
          ? {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'เลขที่คำร้อง:', size: 'xs', color: '#64748b', flex: 3 },
                { type: 'text', text: trackingCode, size: 'xs', color: '#0369a1', weight: 'bold', flex: 6 }
              ]
            }
          : null,
        message
          ? {
              type: 'text',
              text: message,
              size: 'xs',
              color: '#334155',
              wrap: true
            }
          : null,
        by
          ? {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'ผู้เสนอ/ตรวจ:', size: 'xxs', color: '#94a3b8', flex: 3 },
                { type: 'text', text: by, size: 'xxs', color: '#475569', flex: 6 }
              ]
            }
          : null,
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            { type: 'text', text: 'วัน-เวลา:', size: 'xxs', color: '#94a3b8', flex: 3 },
            { type: 'text', text: timeStr, size: 'xxs', color: '#475569', flex: 6 }
          ]
        }
      ].filter(Boolean)
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#0d9488',
          height: 'sm',
          action: {
            type: 'uri',
            label: 'เปิดดูคำร้องในระบบ',
            uri: fullLink
          }
        }
      ]
    }
  };
}

/**
 * ฟังก์ชันหลักในการส่งแจ้งเตือน LINE Event จากระบบ
 */
export async function sendLineNotification({
  title,
  message,
  claimId,
  trackingCode,
  type = 'INFO',
  by,
  link,
  to,
  bypassEnabled = false
}) {
  const state = getSharedState();
  const config = state.config;

  if (!bypassEnabled && !config.enabled) {
    return { ok: false, skipped: true, description: 'LINE notification is disabled' };
  }

  const textMsg = buildLineTextMessage({ title, message, trackingCode, claimId, link, by });
  const flexMsg = buildLineFlexMessage({ title, message, trackingCode, claimId, link, by });

  try {
    const res = await sendLinePushMessage({
      to,
      text: textMsg,
      flex: flexMsg,
      bypassEnabled
    });

    const record = {
      id: 'LINE-' + Date.now(),
      title,
      message,
      trackingCode,
      timestamp: new Date().toISOString(),
      ok: res.ok,
      results: res.results
    };

    state.history.push(record);
    if (state.history.length > MAX_LINE_HISTORY) {
      state.history = state.history.slice(-MAX_LINE_HISTORY);
    }
    triggerPersist();

    return res;
  } catch (err) {
    console.error('Error sending LINE notification:', err);
    return { ok: false, error: err?.message };
  }
}

