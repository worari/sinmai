// app/users/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  UserCheck,
  UserX,
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Building, 
  Phone, 
  Mail,
  AlertCircle,
  Clock,
  History,
  Trash2,
  Edit3,
  RefreshCw,
  Check,
  X,
  Key,
  Eye,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { MILITARY_RANKS, MILITARY_UNITS, validateCitizenId, formatThaiDate } from '@/lib/thai-utils';
import { USER_ROLES, USER_STATUS } from '@/lib/constants';

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'pending' | 'logs'
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, approved: 0, pending: 0, suspended: 0, rejected: 0 });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Activity Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsQuery, setLogsQuery] = useState('');
  const [logsActionFilter, setLogsActionFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({
    citizenId: '',
    rank: 'ร.อ.',
    firstName: '',
    lastName: '',
    position: 'นายทหารฝ่ายกำลังพล',
    unitId: '9th_INF_DIV',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    phone: '',
    email: '',
    password: 'password123',
    role: 'UNIT_OFFICER',
    status: 'APPROVED'
  });

  const [editForm, setEditForm] = useState(null);
  const [selectedUserForAction, setSelectedUserForAction] = useState(null);
  const [actionRole, setActionRole] = useState('UNIT_OFFICER');
  const [rejectReason, setRejectReason] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)); } catch (e) {}
    }
    loadUsers();
    loadLogs();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (query = logsQuery, action = logsActionFilter) => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (action !== 'ALL') params.set('action', action);
      params.set('limit', '100');

      const res = await fetch(`/api/users/logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setLogsTotal(data.total || 0);
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLogsLoading(false);
    }
  };

  // Filter users based on tab, search query, role filter, and status filter
  useEffect(() => {
    let result = [...users];

    // Tab-level filter
    if (activeTab === 'pending') {
      result = result.filter((u) => u.status === 'PENDING');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          (u.firstName && u.firstName.toLowerCase().includes(q)) ||
          (u.lastName && u.lastName.toLowerCase().includes(q)) ||
          (u.citizenId && u.citizenId.includes(q)) ||
          (u.unitName && u.unitName.toLowerCase().includes(q)) ||
          (u.position && u.position.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL' && activeTab !== 'pending') {
      result = result.filter((u) => u.status === statusFilter);
    }

    setFilteredUsers(result);
  }, [searchQuery, roleFilter, statusFilter, users, activeTab]);

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setMessage('');
    } else {
      setMessage(msg);
      setError('');
    }
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 4500);
  };

  // 1. เพิ่มผู้ใช้งานใหม่
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateCitizenId(addForm.citizenId)) {
      showNotification('เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักตรวจสอบ (Mod 11)', true);
      return;
    }

    setSavingAction(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          adminUser: currentUser
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'เพิ่มผู้ใช้งานไม่สำเร็จ');

      showNotification(data.message);
      setShowAddModal(false);
      setAddForm({
        citizenId: '',
        rank: 'ร.อ.',
        firstName: '',
        lastName: '',
        position: 'นายทหารฝ่ายกำลังพล',
        unitId: '9th_INF_DIV',
        unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
        phone: '',
        email: '',
        password: 'password123',
        role: 'UNIT_OFFICER',
        status: 'APPROVED'
      });
      loadUsers();
      loadLogs();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSavingAction(false);
    }
  };

  // 2. บันทึกการแก้ไขข้อมูลผู้ใช้งาน
  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editForm) return;

    setSavingAction(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editForm.id,
          ...editForm,
          adminUser: currentUser
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'บันทึกการแก้ไขไม่สำเร็จ');

      showNotification(data.message);
      setShowEditModal(false);
      setEditForm(null);
      loadUsers();
      loadLogs();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSavingAction(false);
    }
  };

  // 3. อนุมัติผู้ใช้งาน
  const handleApprove = async () => {
    if (!selectedUserForAction) return;
    setSavingAction(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForAction.id,
          action: 'APPROVE',
          newRole: actionRole,
          adminUser: currentUser
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'อนุมัติไม่สำเร็จ');

      showNotification(data.message);
      setShowApproveModal(false);
      setSelectedUserForAction(null);
      loadUsers();
      loadLogs();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSavingAction(false);
    }
  };

  // 4. ปฏิเสธคำขอลงทะเบียน
  const handleReject = async () => {
    if (!selectedUserForAction) return;
    setSavingAction(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForAction.id,
          action: 'REJECT',
          reason: rejectReason || 'ข้อมูลไม่ถูกต้องหรือไม่ผ่านเกณฑ์การตรวจสอบ',
          adminUser: currentUser
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ปฏิเสธคำขอไม่สำเร็จ');

      showNotification(data.message);
      setShowRejectModal(false);
      setSelectedUserForAction(null);
      setRejectReason('');
      loadUsers();
      loadLogs();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSavingAction(false);
    }
  };

  // 5. ระงับ / ปลดระงับการใช้งาน
  const handleToggleActive = async (user) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'TOGGLE_ACTIVE',
          adminUser: currentUser
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'เปลี่ยนสถานะไม่สำเร็จ');

      showNotification(data.message);
      loadUsers();
      loadLogs();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // 6. ลบผู้ใช้งาน
  const handleDeleteUser = async () => {
    if (!selectedUserForAction) return;
    setSavingAction(true);
    try {
      const res = await fetch(`/api/users?userId=${encodeURIComponent(selectedUserForAction.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ลบผู้ใช้งานไม่สำเร็จ');

      showNotification(data.message);
      setShowDeleteModal(false);
      setSelectedUserForAction(null);
      loadUsers();
      loadLogs();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setSavingAction(false);
    }
  };

  // 7. เปลี่ยนบทบาทด่วนในตาราง
  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'CHANGE_ROLE',
          newRole,
          adminUser: currentUser
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'เปลี่ยนบทบาทไม่สำเร็จ');

      showNotification(data.message);
      loadUsers();
      loadLogs();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const getStatusBadge = (status, isActive) => {
    if (status === 'PENDING') {
      return <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> รออนุมัติ</span>;
    }
    if (status === 'SUSPENDED' || isActive === false) {
      return <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> ระงับ</span>;
    }
    if (status === 'REJECTED') {
      return <span className="badge badge-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><X size={12} /> ไม่อนุมัติ</span>;
    }
    return <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> ใช้งานปกติ</span>;
  };

  const getRoleBadgeStyle = (role) => {
    const r = USER_ROLES[role];
    if (!r) return { label: role, badgeClass: 'badge-dark' };
    const badgeClass = 
      r.badge === 'red' ? 'badge-red' :
      r.badge === 'amber' ? 'badge-amber' :
      r.badge === 'purple' ? 'badge-purple' :
      r.badge === 'cyan' ? 'badge-cyan' :
      r.badge === 'emerald' ? 'badge-emerald' : 'badge-blue';
    return { label: r.label, shortLabel: r.shortLabel, badgeClass };
  };

  const getActionBadgeColor = (badge) => {
    switch (badge) {
      case 'emerald': return { bg: 'rgba(16, 185, 129, 0.18)', border: '1px solid var(--emerald-success)', color: '#6ee7b7' };
      case 'amber': return { bg: 'rgba(245, 158, 11, 0.18)', border: '1px solid var(--amber-warning)', color: '#fcd34d' };
      case 'red': return { bg: 'rgba(239, 68, 68, 0.18)', border: '1px solid var(--ruby-danger)', color: '#fca5a5' };
      case 'purple': return { bg: 'rgba(168, 85, 247, 0.18)', border: '1px solid #a855f7', color: '#d8b4fe' };
      case 'cyan': return { bg: 'rgba(6, 182, 212, 0.18)', border: '1px solid var(--cyan-accent)', color: '#67e8f9' };
      default: return { bg: 'rgba(59, 130, 246, 0.18)', border: '1px solid #3b82f6', color: '#93c5fd' };
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px', maxWidth: '1240px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} color="var(--cyan-accent)" />
            <span>ระบบจัดการผู้ใช้งานและกำหนดสิทธิ (User & Role Management)</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            กำหนดบทบาทหน้าที่ (RBAC) • ตรวจสอบและอนุมัติการลงทะเบียน • เพิ่ม/ลบ/ระงับ/แก้ไข • ติดตามประวัติการใช้งาน (Audit Logs)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => {
              loadUsers();
              loadLogs();
            }}
            className="btn btn-secondary"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={15} />
            <span>รีเฟรช</span>
          </button>

          <button 
            type="button"
            onClick={() => setShowAddModal(true)} 
            className="btn btn-primary"
          >
            <UserPlus size={16} />
            <span>+ เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-success)', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(20, 184, 166, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-accent)' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ผู้ใช้งานทั้งหมด</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>{summary.total}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-success)' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>อนุมัติแล้ว (ใช้งานได้)</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--emerald-success)' }}>{summary.approved}</div>
          </div>
        </div>

        <div 
          className="glass-panel" 
          onClick={() => setActiveTab('pending')}
          style={{ 
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            cursor: 'pointer',
            border: summary.pending > 0 ? '1px solid var(--amber-warning)' : '1px solid var(--border-subtle)',
            background: summary.pending > 0 ? 'rgba(245, 158, 11, 0.08)' : undefined
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-warning)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>รอการอนุมัติ (ลงทะเบียนใหม่)</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--amber-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{summary.pending}</span>
              {summary.pending > 0 && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--amber-warning)', color: '#070d1e', fontWeight: 700 }}>ต้องตรวจสอบ</span>}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ruby-danger)' }}>
            <UserX size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ถูกระงับการใช้งาน</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ruby-danger)' }}>{summary.suspended}</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--cyan-accent)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--cyan-accent)' : 'var(--text-dim)',
            fontWeight: activeTab === 'users' ? 700 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={16} />
          <span>ผู้ใช้งานทั้งหมด ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid var(--amber-warning)' : '3px solid transparent',
            color: activeTab === 'pending' ? 'var(--amber-warning)' : 'var(--text-dim)',
            fontWeight: activeTab === 'pending' ? 700 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={16} />
          <span>รอการอนุมัติ</span>
          {summary.pending > 0 && (
            <span style={{
              background: 'var(--amber-warning)',
              color: '#070d1e',
              borderRadius: '12px',
              padding: '1px 8px',
              fontSize: '11px',
              fontWeight: 800
            }}>
              {summary.pending}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('logs');
            loadLogs();
          }}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'logs' ? '3px solid var(--purple-accent)' : '3px solid transparent',
            color: activeTab === 'logs' ? 'var(--purple-accent)' : 'var(--text-dim)',
            fontWeight: activeTab === 'logs' ? 700 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <History size={16} />
          <span>ประวัติการใช้งาน (Audit Logs) ({logsTotal})</span>
        </button>
      </div>

      {/* Tab 1 & 2: Users and Pending Lists */}
      {(activeTab === 'users' || activeTab === 'pending') && (
        <>
          {/* Search & Filters */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                <input 
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="ค้นหา: ยศ, ชื่อ-สกุล, เลข ปชช., อีเมล, ตำแหน่ง, หน่วยสังกัด..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ minWidth: '220px' }}>
                <select 
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="ALL">ทุกบทบาทหน้าที่ (All Roles)</option>
                  <option value="UNIT_OFFICER">1. เจ้าหน้าที่หน่วย (ผู้เสนอเรื่อง)</option>
                  <option value="KSP_OFFICER">2. กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)</option>
                  <option value="COMMANDER">3. ผู้บังคับบัญชา (จก.กพ.ทบ.)</option>
                  <option value="INSURANCE_REP">4. บริษัทประกันภัย</option>
                  <option value="SK_OFFICER">5. สก.ทบ. (รับทราบยอด)</option>
                  <option value="ADMIN">ผู้ดูแลระบบสูงสุด (Admin)</option>
                </select>
              </div>

              {activeTab === 'users' && (
                <div style={{ minWidth: '180px' }}>
                  <select 
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">ทุกสถานะบัญชี</option>
                    <option value="APPROVED">อนุมัติแล้ว (ใช้งานปกติ)</option>
                    <option value="PENDING">รอการอนุมัติ</option>
                    <option value="SUSPENDED">ถูกระงับการใช้งาน</option>
                    <option value="REJECTED">ไม่อนุมัติ/ปฏิเสธ</option>
                  </select>
                </div>
              )}

            </div>
          </div>

          {/* Users Table */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>กำลังโหลดรายชื่อผู้ใช้...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-dim)' }}>
                {activeTab === 'pending' ? 'ไม่มีผู้ใช้งานที่รอการอนุมัติในขณะนี้' : 'ไม่พบข้อมูลผู้ใช้งานตามเงื่อนไขที่ค้นหา'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px' }}>ยศ - ชื่อ - สกุล</th>
                      <th style={{ padding: '12px 14px' }}>เลข ปชช. (13 หลัก)</th>
                      <th style={{ padding: '12px 14px' }}>ตำแหน่ง / หน่วยสังกัด</th>
                      <th style={{ padding: '12px 14px' }}>ช่องทางติดต่อ</th>
                      <th style={{ padding: '12px 14px' }}>บทบาทในระบบ (Role)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>สถานะ</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const roleBadge = getRoleBadgeStyle(u.role);
                      const isPending = u.status === 'PENDING';
                      const isSuspended = u.status === 'SUSPENDED' || u.isActive === false;
                      const isMasterAdmin = u.id === 'usr-admin-1';

                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-glass)', background: isPending ? 'rgba(245, 158, 11, 0.04)' : undefined }}>
                          <td style={{ padding: '14px', fontWeight: 600, color: '#fff' }}>
                            <div>{u.rank} {u.firstName} {u.lastName}</div>
                            {u.createdAt && (
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 400 }}>
                                สมัครเมื่อ: {new Date(u.createdAt).toLocaleDateString('th-TH')}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px', color: 'var(--gold-primary)', fontFamily: 'monospace', fontSize: '13px' }}>
                            {u.citizenId}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: 500 }}>{u.position || '-'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--cyan-accent)' }}>{u.unitName}</div>
                          </td>
                          <td style={{ padding: '14px', fontSize: '12px' }}>
                            <div>📞 {u.phone || '-'}</div>
                            <div style={{ color: 'var(--text-muted)' }}>✉️ {u.email}</div>
                          </td>
                          <td style={{ padding: '14px' }}>
                            {/* Role Select dropdown */}
                            <select 
                              className="form-select"
                              style={{ padding: '5px 8px', fontSize: '12px', width: 'auto', minWidth: '150px' }}
                              value={u.role}
                              disabled={isMasterAdmin && currentUser?.id !== 'usr-admin-1'}
                              onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            >
                              <option value="UNIT_OFFICER">1. จนท.หน่วย</option>
                              <option value="KSP_OFFICER">2. กสพ.กพ.ทบ.</option>
                              <option value="COMMANDER">3. จก.กพ.ทบ.</option>
                              <option value="INSURANCE_REP">4. บ.ประกันภัย</option>
                              <option value="SK_OFFICER">5. สก.ทบ.</option>
                              <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
                            </select>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            {getStatusBadge(u.status, u.isActive)}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              
                              {/* กรณีรออนุมัติ: แสดงปุ่มอนุมัติ และ ปฏิเสธ */}
                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedUserForAction(u);
                                      setActionRole(u.requestedRole || u.role || 'UNIT_OFFICER');
                                      setShowApproveModal(true);
                                    }}
                                    className="btn btn-sm btn-success"
                                    style={{ padding: '4px 10px', fontSize: '12px' }}
                                    title="อนุมัติคำขอลงทะเบียน"
                                  >
                                    <Check size={14} />
                                    <span>อนุมัติ</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedUserForAction(u);
                                      setShowRejectModal(true);
                                    }}
                                    className="btn btn-sm btn-danger"
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                    title="ปฏิเสธคำขอลงทะเบียน"
                                  >
                                    <X size={14} />
                                    <span>ปฏิเสธ</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* แก้ไขข้อมูล */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditForm({ ...u, password: '' });
                                      setShowEditModal(true);
                                    }}
                                    className="btn btn-sm btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                    title="แก้ไขข้อมูลผู้ใช้"
                                  >
                                    <Edit3 size={14} />
                                  </button>

                                  {/* ระงับ / ปลดระงับ */}
                                  {!isMasterAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleActive(u)}
                                      className={`btn btn-sm ${isSuspended ? 'btn-success' : 'btn-secondary'}`}
                                      style={{ 
                                        padding: '4px 8px', 
                                        fontSize: '11.5px',
                                        color: isSuspended ? '#6ee7b7' : '#fca5a5',
                                        borderColor: isSuspended ? 'var(--emerald-success)' : 'rgba(239, 68, 68, 0.4)'
                                      }}
                                      title={isSuspended ? 'ปลดระงับการใช้งาน' : 'ระงับการใช้งานชั่วคราว'}
                                    >
                                      {isSuspended ? 'ปลดระงับ' : 'ระงับ'}
                                    </button>
                                  )}

                                  {/* ลบผู้ใช้งาน */}
                                  {!isMasterAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedUserForAction(u);
                                        setShowDeleteModal(true);
                                      }}
                                      className="btn btn-sm btn-secondary"
                                      style={{ padding: '4px 8px', color: '#fca5a5' }}
                                      title="ลบผู้ใช้งาน"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </>
                              )}

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab 3: Activity & Audit Logs */}
      {activeTab === 'logs' && (
        <div>
          {/* Logs Filter Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', flex: '1 1 300px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 240px', position: 'relative' }}>
                  <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                  <input 
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="ค้นหาใน Audit Logs: ผู้ดำเนินการ, รายละเอียด, ประเภท..."
                    value={logsQuery}
                    onChange={(e) => setLogsQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadLogs(logsQuery, logsActionFilter)}
                  />
                </div>

                <div style={{ minWidth: '220px' }}>
                  <select 
                    className="form-select"
                    value={logsActionFilter}
                    onChange={(e) => {
                      setLogsActionFilter(e.target.value);
                      loadLogs(logsQuery, e.target.value);
                    }}
                  >
                    <option value="ALL">ทุกประเภทกิจกรรม (All Actions)</option>
                    <option value="LOGIN">เข้าสู่ระบบ (LOGIN)</option>
                    <option value="REGISTER">ลงทะเบียนใหม่ (REGISTER)</option>
                    <option value="APPROVE_USER">อนุมัติผู้ใช้งาน (APPROVE)</option>
                    <option value="REJECT_USER">ไม่อนุมัติ/ปฏิเสธ (REJECT)</option>
                    <option value="UPDATE_ROLE">เปลี่ยนสิทธิ์/บทบาท (ROLE)</option>
                    <option value="UPDATE_USER">แก้ไขข้อมูลผู้ใช้ (UPDATE)</option>
                    <option value="SUSPEND_USER">ระงับการใช้งาน (SUSPEND)</option>
                    <option value="ACTIVATE_USER">ปลดระงับผู้ใช้ (ACTIVATE)</option>
                    <option value="DELETE_USER">ลบผู้ใช้งาน (DELETE)</option>
                    <option value="CREATE_USER">เพิ่มผู้ใช้งานใหม่ (CREATE)</option>
                  </select>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => loadLogs(logsQuery, logsActionFilter)}
                className="btn btn-secondary"
              >
                <RefreshCw size={14} />
                <span>รีเฟรช Log</span>
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            {logsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>กำลังโหลดประวัติการใช้งาน...</div>
            ) : logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-dim)' }}>ไม่พบบันทึกประวัติกิจกรรมตามเงื่อนไขที่ค้นหา</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px', width: '170px' }}>วันและเวลา (ประทับเวลา)</th>
                      <th style={{ padding: '12px 14px', width: '180px' }}>ผู้ดำเนินการ</th>
                      <th style={{ padding: '12px 14px', width: '140px' }}>กิจกรรม / Action</th>
                      <th style={{ padding: '12px 14px' }}>รายละเอียดการดำเนินการ</th>
                      <th style={{ padding: '12px 14px', width: '110px', textAlign: 'center' }}>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const badgeStyle = getActionBadgeColor(log.actionBadge);
                      const timeStr = new Date(log.createdAt).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });

                      return (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '12px 14px', color: 'var(--text-dim)', fontFamily: 'monospace', fontSize: '12px' }}>
                            {timeStr}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{log.userName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--gold-primary)' }}>{log.userRole}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              ...badgeStyle
                            }}>
                              {log.actionLabel || log.action}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                            {log.details}
                            {log.targetName && (
                              <div style={{ fontSize: '11px', color: 'var(--cyan-accent)', marginTop: '2px' }}>
                                เป้าหมาย: {log.targetName}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'monospace', fontSize: '11px' }}>
                            {log.ip || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Modal: เพิ่มผู้ใช้งานใหม่ (Add User Modal) */}
      {/* ============================================================ */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'rgba(5, 22, 26, 0.98)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="var(--cyan-accent)" />
                <span>เพิ่มผู้ใช้งานใหม่โดยตรง</span>
              </h2>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              
              <div className="form-group">
                <label className="form-label required">เลขประจำตัวประชาชน 13 หลัก</label>
                <input 
                  type="text" 
                  className="form-input"
                  maxLength={13}
                  value={addForm.citizenId}
                  onChange={(e) => setAddForm({ ...addForm, citizenId: e.target.value.replace(/\D/g, '') })}
                  placeholder="1100500123456"
                  required
                />
              </div>

              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label required">ยศ / คำนำหน้านาม</label>
                  <select 
                    className="form-select"
                    value={addForm.rank}
                    onChange={(e) => setAddForm({ ...addForm, rank: e.target.value })}
                    required
                  >
                    {MILITARY_RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">ชื่อ</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    placeholder="ชื่อจริง"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">นามสกุล</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    placeholder="นามสกุล"
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">ตำแหน่ง</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={addForm.position}
                    onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                    placeholder="เช่น นายทหารกำลังพล"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">หน่วยสังกัด</label>
                  <select 
                    className="form-select"
                    value={addForm.unitId}
                    onChange={(e) => {
                      const u = MILITARY_UNITS.find((unit) => unit.id === e.target.value);
                      setAddForm({ ...addForm, unitId: e.target.value, unitName: u ? u.name : e.target.value });
                    }}
                    required
                  >
                    {MILITARY_UNITS.map((u) => <option key={u.id} value={u.id}>[{u.level}] {u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">เบอร์โทรศัพท์</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="08x-xxx-xxxx"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">อีเมล</label>
                  <input 
                    type="email" 
                    className="form-input"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="officer@army.mil.th"
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">กำหนดบทบาทในระบบ (Role)</label>
                  <select 
                    className="form-select"
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    required
                  >
                    <option value="UNIT_OFFICER">1. เจ้าหน้าที่หน่วย (ผู้เสนอเรื่อง)</option>
                    <option value="KSP_OFFICER">2. กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)</option>
                    <option value="COMMANDER">3. ผู้บังคับบัญชา (จก.กพ.ทบ.)</option>
                    <option value="INSURANCE_REP">4. บริษัทประกันภัย</option>
                    <option value="SK_OFFICER">5. สก.ทบ. (รับทราบยอดจ่าย)</option>
                    <option value="ADMIN">ผู้ดูแลระบบสูงสุด (Admin)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">สถานะแรกเริ่ม</label>
                  <select 
                    className="form-select"
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    required
                  >
                    <option value="APPROVED">อนุมัติแล้ว (ใช้งานได้ทันที)</option>
                    <option value="PENDING">รออนุมัติ</option>
                    <option value="SUSPENDED">ระงับการใช้งาน</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">รหัสผ่านเริ่มต้น</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  ยกเลิก
                </button>
                <button type="submit" disabled={savingAction} className="btn btn-primary">
                  {savingAction ? 'กำลังบันทึก...' : 'บันทึกเพิ่มผู้ใช้งาน'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Modal: แก้ไขข้อมูลผู้ใช้งาน (Edit User Modal) */}
      {/* ============================================================ */}
      {showEditModal && editForm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'rgba(5, 22, 26, 0.98)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="var(--cyan-accent)" />
                <span>แก้ไขข้อมูลผู้ใช้งาน: {editForm.firstName} {editForm.lastName}</span>
              </h2>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditUser}>
              
              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label required">ยศ / คำนำหน้านาม</label>
                  <select 
                    className="form-select"
                    value={editForm.rank}
                    onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                    required
                  >
                    {MILITARY_RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">ชื่อ</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">นามสกุล</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">ตำแหน่ง</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editForm.position || ''}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">หน่วยสังกัด</label>
                  <select 
                    className="form-select"
                    value={editForm.unitId}
                    onChange={(e) => {
                      const u = MILITARY_UNITS.find((unit) => unit.id === e.target.value);
                      setEditForm({ ...editForm, unitId: e.target.value, unitName: u ? u.name : e.target.value });
                    }}
                    required
                  >
                    {MILITARY_UNITS.map((u) => <option key={u.id} value={u.id}>[{u.level}] {u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">เบอร์โทรศัพท์</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">อีเมล</label>
                  <input 
                    type="email" 
                    className="form-input"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">บทบาทในระบบ (Role)</label>
                  <select 
                    className="form-select"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required
                  >
                    <option value="UNIT_OFFICER">1. เจ้าหน้าที่หน่วย (ผู้เสนอเรื่อง)</option>
                    <option value="KSP_OFFICER">2. กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)</option>
                    <option value="COMMANDER">3. ผู้บังคับบัญชา (จก.กพ.ทบ.)</option>
                    <option value="INSURANCE_REP">4. บริษัทประกันภัย</option>
                    <option value="SK_OFFICER">5. สก.ทบ. (รับทราบยอดจ่าย)</option>
                    <option value="ADMIN">ผู้ดูแลระบบสูงสุด (Admin)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">สถานะบัญชี</label>
                  <select 
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    required
                  >
                    <option value="APPROVED">อนุมัติแล้ว (ใช้งานได้)</option>
                    <option value="PENDING">รอการอนุมัติ</option>
                    <option value="SUSPENDED">ระงับการใช้งาน</option>
                    <option value="REJECTED">ไม่อนุมัติ/ปฏิเสธ</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">เปลี่ยนรหัสผ่านใหม่ (ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="กรอกรหัสผ่านใหม่เพื่อรีเซ็ต"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  ยกเลิก
                </button>
                <button type="submit" disabled={savingAction} className="btn btn-primary">
                  {savingAction ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Modal: ยืนยันการอนุมัติผู้ใช้งาน (Approve Modal) */}
      {/* ============================================================ */}
      {showApproveModal && selectedUserForAction && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: 'rgba(5, 22, 26, 0.98)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-success)' }}>
                <UserCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>อนุมัติสิทธิ์เข้าใช้งานระบบ</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ผู้ดูแลระบบทำการอนุมัติสิทธิ์แก่ผู้ลงทะเบียน</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '14px', marginBottom: '18px', fontSize: '13px', lineHeight: 1.6 }}>
              <div><strong>ผู้ขอใช้งาน:</strong> {selectedUserForAction.rank} {selectedUserForAction.firstName} {selectedUserForAction.lastName}</div>
              <div><strong>สังกัด:</strong> {selectedUserForAction.unitName} ({selectedUserForAction.position})</div>
              <div><strong>เลข ปชช.:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)' }}>{selectedUserForAction.citizenId}</span></div>
              <div><strong>อีเมล:</strong> {selectedUserForAction.email}</div>
            </div>

            <div className="form-group">
              <label className="form-label required">กำหนดบทบาทหน้าที่ที่อนุมัติ (Assigned Role)</label>
              <select 
                className="form-select"
                value={actionRole}
                onChange={(e) => setActionRole(e.target.value)}
              >
                <option value="UNIT_OFFICER">1. เจ้าหน้าที่หน่วย (ผู้เสนอเรื่อง กพ.4)</option>
                <option value="KSP_OFFICER">2. กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)</option>
                <option value="COMMANDER">3. ผู้บังคับบัญชา (จก.กพ.ทบ.)</option>
                <option value="INSURANCE_REP">4. บริษัทประกันภัย (โอนเงินสินไหม)</option>
                <option value="SK_OFFICER">5. สก.ทบ. (รับทราบยอดจ่าย)</option>
                <option value="ADMIN">ผู้ดูแลระบบสูงสุด (Admin)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button type="button" onClick={() => setShowApproveModal(false)} className="btn btn-secondary">
                ยกเลิก
              </button>
              <button 
                type="button" 
                onClick={handleApprove} 
                disabled={savingAction} 
                className="btn btn-success"
              >
                {savingAction ? 'กำลังอนุมัติ...' : '✓ ยืนยันอนุมัติสิทธิ์'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Modal: ปฏิเสธคำขอลงทะเบียน (Reject Modal) */}
      {/* ============================================================ */}
      {showRejectModal && selectedUserForAction && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: 'rgba(5, 22, 26, 0.98)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ruby-danger)' }}>
                <XCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>ปฏิเสธคำขอลงทะเบียน</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ระบุเหตุผลเพื่อบันทึกประวัติการไม่อนุมัติ</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '14px', marginBottom: '18px', fontSize: '13px' }}>
              <div><strong>ผู้ขอใช้งาน:</strong> {selectedUserForAction.rank} {selectedUserForAction.firstName} {selectedUserForAction.lastName}</div>
              <div><strong>สังกัด:</strong> {selectedUserForAction.unitName}</div>
            </div>

            <div className="form-group">
              <label className="form-label required">เหตุผลที่ปฏิเสธ</label>
              <textarea 
                className="form-input"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="เช่น ข้อมูลตำแหน่งไม่ตรงกับระเบียบ ทบ., เลขบัตรประจำตัวประชาชนไม่ถูกต้อง หรือไม่ใช่เจ้าหน้าที่ผู้รับผิดชอบ"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button type="button" onClick={() => setShowRejectModal(false)} className="btn btn-secondary">
                ยกเลิก
              </button>
              <button 
                type="button" 
                onClick={handleReject} 
                disabled={savingAction} 
                className="btn btn-danger"
              >
                {savingAction ? 'กำลังบันทึก...' : 'ยืนยันปฏิเสธคำขอ'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Modal: ยืนยันการลบผู้ใช้งาน (Delete Modal) */}
      {/* ============================================================ */}
      {showDeleteModal && selectedUserForAction && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '28px', background: 'rgba(5, 22, 26, 0.98)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ruby-danger)' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fca5a5' }}>ยืนยันการลบผู้ใช้งาน</h3>
                <div style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>การดำเนินการนี้ไม่สามารถเรียกคืนได้</div>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '18px' }}>
              ท่านแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้งาน <strong>{selectedUserForAction.rank} {selectedUserForAction.firstName} {selectedUserForAction.lastName}</strong> ({selectedUserForAction.unitName}) ออกจากระบบอย่างถาวร?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                ยกเลิก
              </button>
              <button 
                type="button" 
                onClick={handleDeleteUser} 
                disabled={savingAction} 
                className="btn btn-danger"
              >
                {savingAction ? 'กำลังลบ...' : 'ยืนยันลบผู้ใช้งาน'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
