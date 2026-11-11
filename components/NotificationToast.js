// components/NotificationToast.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  ArrowRight,
  Clock
} from 'lucide-react';
import {
  getSocketClient,
  canViewClientNotification,
  playNotificationChime
} from '@/lib/socket-client';

function getToastAppearance(type) {
  if (type === 'DELAY_REPORT' || type === 'DOC_REJECTED' || type === 'CLAIM_DELETED') {
    return { color: 'var(--ruby-danger)', Icon: AlertTriangle, label: 'แจ้งเตือนด่วน' };
  }
  if (type === 'SLA_ALERT') {
    return { color: 'var(--amber-warning)', Icon: Clock, label: 'เฝ้าระวัง SLA' };
  }
  if (type === 'APPROVED' || type === 'PAYMENT_PAID') {
    return { color: 'var(--emerald-success)', Icon: CheckCircle2, label: 'อนุมัติ / จ่ายเงิน' };
  }
  if (type === 'TELEGRAM_DIRECT' || type === 'TEST') {
    return { color: 'var(--gold-primary)', Icon: Send, label: 'Bot & ประกาศ' };
  }
  return { color: 'var(--cyan-accent)', Icon: Bell, label: 'แจ้งเตือนระบบ' };
}

export default function NotificationToast({ currentUser }) {
  const router = useRouter();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) {
      setToasts([]);
      return;
    }

    const socket = getSocketClient();
    if (!socket) return;

    const handleNewNotif = (notif) => {
      if (!canViewClientNotification(notif, currentUser)) return;
      playNotificationChime();

      setToasts((prev) => {
        const deduped = prev.filter((item) => item.id !== notif.id);
        return [notif, ...deduped].slice(0, 3);
      });

      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== notif.id));
      }, 7500);
    };

    const handleUpdatedNotif = (notif) => {
      setToasts((prev) => prev.map((item) => (item.id === notif.id ? notif : item)));
    };

    socket.on('new_notification', handleNewNotif);
    socket.on('notification_updated', handleUpdatedNotif);

    return () => {
      socket.off('new_notification', handleNewNotif);
      socket.off('notification_updated', handleUpdatedNotif);
    };
  }, [currentUser]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenToast = async (notif) => {
    dismissToast(notif.id);
    if (currentUser?.id) {
      fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_READ', notificationId: notif.id, userId: currentUser.id })
      }).catch(() => {});
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  if (!currentUser || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '22px',
      right: '22px',
      zIndex: 180,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '370px',
      width: 'calc(100vw - 44px)',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => {
        const { color, Icon, label } = getToastAppearance(toast.type);
        return (
          <div
            key={toast.id}
            className="glass-panel"
            style={{
              pointerEvents: 'auto',
              padding: '13px 14px',
              background: 'rgba(4, 20, 23, 0.96)',
              border: `1px solid ${color}`,
              borderLeft: `4px solid ${color}`,
              boxShadow: '0 14px 32px rgba(0, 0, 0, 0.65)',
              borderRadius: '10px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Icon size={16} color={color} />
                <span style={{ fontSize: '11px', fontWeight: 700, color }}>
                  {label}
                </span>
                {toast.trackingCode && (
                  <span style={{
                    fontSize: '10.5px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    color: 'var(--gold-light)'
                  }}>
                    {toast.trackingCode}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '2px',
                  lineHeight: 1
                }}
                title="ปิดการแจ้งเตือน"
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', marginTop: '5px' }}>
              {toast.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
              {String(toast.message || '').slice(0, 140)}{String(toast.message || '').length > 140 ? '...' : ''}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '10.5px', color: toast.telegramSent ? '#6ee7b7' : 'var(--text-dim)' }}>
                {toast.status === 'SENT'
                  ? '✓ Socket.IO + Telegram'
                  : toast.status === 'SENDING'
                    ? '⚡ Socket.IO • กำลังส่ง Telegram...'
                    : '⚡ Socket.IO Live'}
              </span>

              {toast.link && (
                <button
                  type="button"
                  onClick={() => handleOpenToast(toast)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--cyan-accent)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>เปิดดู</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

