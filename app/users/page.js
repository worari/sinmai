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
  EyeOff,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Laptop,
  Smartphone,
  Globe,
  Sparkles
} from 'lucide-react';
import { MILITARY_RANKS, MILITARY_UNITS, validateCitizenId, formatThaiDate, validatePhoneNumber, validateEmail, validateName, formatPhoneNumber } from '@/lib/thai-utils';
import { USER_ROLES, USER_STATUS } from '@/lib/constants';
import { getSocketClient } from '@/lib/socket-client';
import UnitAutocomplete from '@/components/UnitAutocomplete';
import PaginationBar from '@/components/PaginationBar';

const USERS_PER_PAGE = 10;

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
  const [usersPage, setUsersPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Activity Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsQuery, setLogsQuery] = useState('');
  const [logsActionFilter, setLogsActionFilter] = useState('ALL');
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

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
    unitId: '',
    unitName: '',
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

  // Unit autocomplete state (เชื่อมโยงโครงสร้างการจัดหน่วย ทบ. 864 หน่วย)
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState('');

  // Password editing state for Edit Modal
  const [passwordMode, setPasswordMode] = useState('KEEP'); // 'KEEP' | 'NEW'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPasswordNotice, setShowOldPasswordNotice] = useState(false);

  // Password visibility for Add Modal
  const [showAddPassword, setShowAddPassword] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const saved = localStorage.getItem('rta_user');
      if (saved) {
        try { setCurrentUser(JSON.parse(saved)); } catch (e) { setCurrentUser(null); }
      } else {
        setCurrentUser(null);
      }
    };
    checkAuth();
    loadUsers();
    loadUnits();
    loadLogs('', 'ALL', 1);

    window.addEventListener('rta_auth_change', checkAuth);

    const socket = getSocketClient();
    const onUsersUpdated = () => {
      loadUsers();
      loadLogs('', 'ALL', 1);
    };
    if (socket) {
      socket.on('users_updated', onUsersUpdated);
    }

    return () => {
      window.removeEventListener('rta_auth_change', checkAuth);
      if (socket) {
        socket.off('users_updated', onUsersUpdated);
      }
    };
  }, []);

  const loadUnits = async () => {
    setUnitsLoading(true);
    setUnitsError('');
    try {
      const res = await fetch('/api/units');
      const data = await res.json();
      if (data.success && Array.isArray(data.units)) {
        setUnits(data.units);
      } else {
        setUnitsError(data.message || 'ไม่สามารถโหลดข้อมูลหน่วยสังกัดได้');
      }
    } catch (err) {
      setUnitsError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยสังกัด');
    } finally {
      setUnitsLoading(false);
    }
  };

  // Helper: ตรวจสอบความแข็งแกร่งของรหัสผ่าน
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'ยังไม่ได้ระบุ', color: 'var(--text-dim)', percent: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-zA-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, text: 'ระดับต่ำ (ไม่ผ่านเกณฑ์)', color: '#ef4444', percent: 25 };
    if (score === 3) return { score: 2, text: 'ปานกลาง (ผ่านเกณฑ์พื้นฐาน)', color: '#f59e0b', percent: 60 };
    if (score === 4) return { score: 3, text: 'ปลอดภัยดี', color: '#10b981', percent: 85 };
    return { score: 4, text: 'ปลอดภัยสูงสุด', color: '#06b6d4', percent: 100 };
  };

  // Helper: สุ่มรหัสผ่านปลอดภัยตามเงื่อนไข
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let result = '';
    if (typeof window !== 'undefined' && window.crypto) {
      const randomArray = new Uint8Array(10);
      window.crypto.getRandomValues(randomArray);
      for (let i = 0; i < 10; i++) {
        result += chars[randomArray[i] % chars.length];
      }
    } else {
      for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    if (!/[a-zA-Z]/.test(result)) result = 'Army' + result.slice(4);
    if (!/\d/.test(result)) result = result.slice(0, 8) + '99';
    return result;
  };

  // Helper: เปิด Modal แก้ไขข้อมูลผู้ใช้พร้อมตั้งค่าเริ่มต้นรหัสผ่าน
  const handleOpenEditModal = (u) => {
    setEditForm({
      id: u.id,
      citizenId: u.citizenId || '',
      rank: u.rank || 'ร.อ.',
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      position: u.position || '',
      unitId: u.unitId || '',
      unitName: u.unitName || '',
      phone: u.phone || '',
      email: u.email || '',
      role: u.role || 'UNIT_OFFICER',
      status: u.status || 'APPROVED',
      isActive: u.isActive !== false
    });
    setPasswordMode('KEEP');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowOldPasswordNotice(false);
    setShowEditModal(true);
  };

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

  const loadLogs = async (query = logsQuery, action = logsActionFilter, page = logsPage) => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (action !== 'ALL') params.set('action', action);
      params.set('limit', '10');
      params.set('page', String(page));

      const res = await fetch(`/api/users/logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setLogsTotal(data.total || 0);
        setLogsTotalPages(data.totalPages || 1);
        setLogsPage(data.page || 1);
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('ยืนยันการลบล้างประวัติการใช้งานและ Audit Logs ทั้งหมดหรือไม่?\nการกระทำนี้จะล้างประวัติการตรวจสอบทั้งหมดในระบบ และไม่สามารถย้อนกลับได้')) {
      return;
    }
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/users/logs?adminId=${currentUser?.id || ''}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || 'ลบล้างประวัติการใช้งานเรียบร้อยแล้ว');
        loadLogs('', 'ALL', 1);
      } else {
        showNotification(data.message || 'ลบล้างประวัติไม่สำเร็จ', true);
        setLogsLoading(false);
      }
    } catch (e) {
      showNotification('เกิดข้อผิดพลาด: ' + e.message, true);
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

  // รีเซ็ตกลับหน้า 1 เมื่อเปลี่ยน Tab หรือตัวกรองค้นหา
  useEffect(() => {
    setUsersPage(1);
  }, [searchQuery, roleFilter, statusFilter, activeTab]);

  // คำนวณรายการผู้ใช้สำหรับหน้าปัจจุบัน (หน้าละ 10 แถว)
  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safeUsersPage = Math.min(Math.max(1, usersPage), usersTotalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeUsersPage - 1) * USERS_PER_PAGE,
    safeUsersPage * USERS_PER_PAGE
  );

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

    if (!validateName(addForm.firstName) || !validateName(addForm.lastName)) {
      showNotification('ชื่อและนามสกุลต้องมีอย่างน้อย 2 ตัวอักษร และต้องไม่มีตัวเลขหรือสัญลักษณ์พิเศษ', true);
      return;
    }

    if (!addForm.unitId) {
      showNotification('กรุณาค้นหาและเลือกหน่วยสังกัดจากรายการโครงสร้างหน่วย ทบ.', true);
      return;
    }

    if (addForm.phone && !validatePhoneNumber(addForm.phone)) {
      showNotification('เบอร์โทรศัพท์ติดต่อต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0 เช่น 0812345678', true);
      return;
    }

    if (!validateEmail(addForm.email)) {
      showNotification('รูปแบบอีเมลไม่ถูกต้อง ต้องมีเครื่องหมาย @ และชื่อโดเมนที่ถูกต้อง', true);
      return;
    }

    if (addForm.password.length < 8 || !/[a-zA-Z]/.test(addForm.password) || !/\d/.test(addForm.password)) {
      showNotification('รหัสผ่านเริ่มต้นต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข', true);
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
        unitId: '',
        unitName: '',
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

    if (editForm.citizenId && !validateCitizenId(editForm.citizenId)) {
      showNotification('เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักตรวจสอบ (Mod 11)', true);
      return;
    }

    if ((editForm.firstName && !validateName(editForm.firstName)) || (editForm.lastName && !validateName(editForm.lastName))) {
      showNotification('ชื่อและนามสกุลต้องมีอย่างน้อย 2 ตัวอักษร และต้องไม่มีตัวเลขหรือสัญลักษณ์พิเศษ', true);
      return;
    }

    if (!editForm.unitId) {
      showNotification('กรุณาเลือกหน่วยสังกัดจากรายการค้นหาโครงสร้างหน่วย', true);
      return;
    }

    if (editForm.phone && !validatePhoneNumber(editForm.phone)) {
      showNotification('เบอร์โทรศัพท์ติดต่อต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0 เช่น 0812345678', true);
      return;
    }

    if (editForm.email && !validateEmail(editForm.email)) {
      showNotification('รูปแบบอีเมลไม่ถูกต้อง ต้องมีเครื่องหมาย @ และชื่อโดเมนที่ถูกต้อง', true);
      return;
    }

    // ตรวจสอบเงื่อนไขความปลอดภัยรหัสผ่านใหม่ (หากเลือกเปลี่ยนรหัสผ่าน)
    if (passwordMode === 'NEW') {
      const trimmedPwd = (newPassword || '').trim();
      if (!trimmedPwd) {
        showNotification('กรุณาระบุรหัสผ่านใหม่ หรือเลือก "คงรหัสผ่านเดิมไว้"', true);
        return;
      }
      if (trimmedPwd.length < 8 || !/[a-zA-Z]/.test(trimmedPwd) || !/\d/.test(trimmedPwd)) {
        showNotification('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรภาษาอังกฤษและตัวเลขตามนโยบายความปลอดภัย', true);
        return;
      }
      if (confirmPassword && trimmedPwd !== confirmPassword.trim()) {
        showNotification('รหัสผ่านใหม่และช่องยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', true);
        return;
      }
    }

    setSavingAction(true);
    try {
      const payload = {
        userId: editForm.id,
        ...editForm,
        adminUser: currentUser
      };

      if (passwordMode === 'NEW' && newPassword.trim()) {
        payload.password = newPassword.trim();
      } else {
        delete payload.password; // คงรหัสผ่านเดิมไว้ ไม่ส่ง field password ไปอัปเดต
      }

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'บันทึกการแก้ไขไม่สำเร็จ');

      showNotification(data.message);
      setShowEditModal(false);
      setEditForm(null);
      setPasswordMode('KEEP');
      setNewPassword('');
      setConfirmPassword('');
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
      const res = await fetch(`/api/users?userId=${encodeURIComponent(selectedUserForAction.id)}&adminId=${encodeURIComponent(currentUser?.id || '')}`, {
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
                    {paginatedUsers.map((u) => {
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
                                    onClick={() => handleOpenEditModal(u)}
                                    className="btn btn-sm btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                    title="แก้ไขข้อมูลผู้ใช้และจัดการรหัสผ่าน"
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

            {/* Pagination Bar (หน้าละ 10 แถว: หน้าแรก / ย้อนกลับ / เลขหน้า / หน้าถัดไป / หน้าสุดท้าย) */}
            {!loading && filteredUsers.length > 0 && (
              <PaginationBar
                currentPage={safeUsersPage}
                totalItems={filteredUsers.length}
                itemsPerPage={USERS_PER_PAGE}
                onPageChange={setUsersPage}
                firstLabel="หน้าแรก"
                prevLabel="ย้อนกลับ"
                nextLabel="หน้าถัดไป"
                lastLabel="หน้าสุดท้าย"
              />
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

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => loadLogs(logsQuery, logsActionFilter, logsPage)}
                  className="btn btn-secondary"
                  title="รีเฟรชประวัติ Log ล่าสุด"
                >
                  <RefreshCw size={14} />
                  <span>รีเฟรช Log</span>
                </button>

                <button 
                  type="button"
                  onClick={handleClearLogs}
                  className="btn btn-secondary"
                  style={{
                    color: '#f87171',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.1)'
                  }}
                  title="ลบล้างประวัติ Audit Logs ทั้งหมด"
                >
                  <Trash2 size={14} />
                  <span>ลบล้างข้อมูล Log</span>
                </button>
              </div>
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
                      <th style={{ padding: '12px 14px', width: '160px' }}>วันและเวลา (ประทับเวลา)</th>
                      <th style={{ padding: '12px 14px', width: '170px' }}>ผู้ดำเนินการ</th>
                      <th style={{ padding: '12px 14px', width: '135px' }}>กิจกรรม / Action</th>
                      <th style={{ padding: '12px 14px' }}>รายละเอียดการดำเนินการ</th>
                      <th style={{ padding: '12px 14px', width: '180px' }}>อุปกรณ์ / เครื่องมือ</th>
                      <th style={{ padding: '12px 14px', width: '140px', textAlign: 'center' }}>IP Address จริง</th>
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

                      const isMobile = log.device?.toLowerCase().includes('android') || 
                                       log.device?.toLowerCase().includes('iphone') || 
                                       log.device?.toLowerCase().includes('mobile');

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
                          <td style={{ padding: '12px 14px', color: 'var(--text-dim)', fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isMobile ? (
                                <Smartphone size={14} color="var(--cyan-accent)" style={{ flexShrink: 0 }} />
                              ) : (
                                <Laptop size={14} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
                              )}
                              <span style={{ color: '#fff', fontSize: '11.5px' }}>{log.device || 'คอมพิวเตอร์ (Web Browser)'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px', 
                              background: 'rgba(6, 182, 212, 0.08)', 
                              border: '1px solid rgba(6, 182, 212, 0.2)',
                              color: 'var(--cyan-accent)', 
                              padding: '3px 8px', 
                              borderRadius: '4px', 
                              fontFamily: 'monospace', 
                              fontSize: '11.5px' 
                            }}>
                              <Globe size={11} />
                              <span>{log.ip || '127.0.0.1'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls (หน้าละ 10 แถว พร้อมปุ่มหน้าแรก / หน้าสุดท้าย) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '18px',
              marginTop: '16px',
              borderTop: '1px solid var(--border-glass)',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}>
              <div>
                แสดงรายการที่ <strong>{logs.length > 0 ? (logsPage - 1) * 10 + 1 : 0} - {Math.min(logsPage * 10, logsTotal)}</strong> จากทั้งหมด <strong>{logsTotal}</strong> รายการ (10 แถวต่อหน้า)
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* หน้าแรก */}
                <button
                  type="button"
                  onClick={() => loadLogs(logsQuery, logsActionFilter, 1)}
                  disabled={logsPage <= 1 || logsLoading}
                  className="btn btn-secondary btn-sm"
                  style={{ opacity: logsPage <= 1 ? 0.4 : 1, padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="ไปยังหน้าแรก"
                >
                  <ChevronsLeft size={14} />
                  <span>หน้าแรก</span>
                </button>

                {/* หน้าก่อนหน้า */}
                <button
                  type="button"
                  onClick={() => loadLogs(logsQuery, logsActionFilter, logsPage - 1)}
                  disabled={logsPage <= 1 || logsLoading}
                  className="btn btn-secondary btn-sm"
                  style={{ opacity: logsPage <= 1 ? 0.4 : 1, padding: '4px 8px' }}
                  title="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* ตัวเลขหน้า */}
                <div style={{ display: 'flex', gap: '4px', margin: '0 4px' }}>
                  {Array.from({ length: Math.min(5, logsTotalPages) }, (_, i) => {
                    let pageNum;
                    if (logsTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (logsPage <= 3) {
                      pageNum = i + 1;
                    } else if (logsPage >= logsTotalPages - 2) {
                      pageNum = logsTotalPages - 4 + i;
                    } else {
                      pageNum = logsPage - 2 + i;
                    }

                    const isCurrent = pageNum === logsPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => loadLogs(logsQuery, logsActionFilter, pageNum)}
                        disabled={logsLoading}
                        style={{
                          minWidth: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: isCurrent ? '1px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
                          background: isCurrent ? 'rgba(20, 184, 166, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                          color: isCurrent ? '#fff' : 'var(--text-muted)',
                          fontWeight: isCurrent ? 700 : 400,
                          cursor: isCurrent ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12.5px'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* หน้าถัดไป */}
                <button
                  type="button"
                  onClick={() => loadLogs(logsQuery, logsActionFilter, logsPage + 1)}
                  disabled={logsPage >= logsTotalPages || logsLoading}
                  className="btn btn-secondary btn-sm"
                  style={{ opacity: logsPage >= logsTotalPages ? 0.4 : 1, padding: '4px 8px' }}
                  title="หน้าถัดไป"
                >
                  <ChevronRight size={14} />
                </button>

                {/* หน้าสุดท้าย */}
                <button
                  type="button"
                  onClick={() => loadLogs(logsQuery, logsActionFilter, logsTotalPages)}
                  disabled={logsPage >= logsTotalPages || logsLoading}
                  className="btn btn-secondary btn-sm"
                  style={{ opacity: logsPage >= logsTotalPages ? 0.4 : 1, padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="ไปยังหน้าสุดท้าย"
                >
                  <span>หน้าสุดท้าย</span>
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
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

              <div className="form-group">
                <label className="form-label required">ตำแหน่ง</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={addForm.position}
                  onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                  placeholder="เช่น นายทหารกำลังพล, รอง ผบ.ร้อย."
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label required" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={15} color="var(--cyan-accent)" />
                    <span>หน่วยสังกัด (เชื่อมโยงโครงสร้างการจัดหน่วย ทบ.)</span>
                  </label>
                  {addForm.unitName && (
                    <span style={{ fontSize: '11.5px', color: 'var(--cyan-accent)', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                      เลือกแล้ว: {addForm.unitName}
                    </span>
                  )}
                </div>
                <UnitAutocomplete
                  units={units}
                  value={addForm.unitId}
                  onChange={(selectedUnit) => {
                    setAddForm((prev) => ({
                      ...prev,
                      unitId: selectedUnit ? selectedUnit.id : '',
                      unitName: selectedUnit ? (selectedUnit.name || selectedUnit.shortName) : ''
                    }));
                  }}
                  loading={unitsLoading}
                  error={unitsError}
                  onRetry={loadUnits}
                  required
                  placeholder="พิมพ์ค้นหาชื่อหน่วย, ชื่อย่อ (เช่น พล.ร.9, มทบ.11, ร.9 พัน.1), รหัส หรือจังหวัด..."
                />
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  * เชื่อมโยงฐานข้อมูลโครงสร้างการจัดหน่วย ทบ. 864 หน่วย
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">เบอร์โทรศัพท์ (10 หลัก)</label>
                  <input 
                    type="tel" 
                    className="form-input"
                    maxLength={10}
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="08xxxxxxxx (10 หลัก)"
                    required
                  />
                  <div style={{ fontSize: '11px', marginTop: '3px' }}>
                    {addForm.phone.length < 10 ? (
                      <span style={{ color: '#fbbf24' }}>⚠️ {addForm.phone.length}/10 หลัก</span>
                    ) : validatePhoneNumber(addForm.phone) ? (
                      <span style={{ color: 'var(--emerald-success)' }}>✓ เบอร์โทรศัพท์ถูกต้อง ({formatPhoneNumber(addForm.phone)})</span>
                    ) : (
                      <span style={{ color: 'var(--ruby-danger)' }}>✗ ต้องขึ้นต้นด้วย 0</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">อีเมล (ต้องมี @)</label>
                  <input 
                    type="email" 
                    className="form-input"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value.trim().toLowerCase() })}
                    placeholder="officer@army.mil.th"
                    required
                  />
                  <div style={{ fontSize: '11px', marginTop: '3px' }}>
                    {addForm.email && !addForm.email.includes('@') ? (
                      <span style={{ color: '#fbbf24' }}>⚠️ ต้องมีเครื่องหมาย @</span>
                    ) : validateEmail(addForm.email) ? (
                      <span style={{ color: 'var(--emerald-success)' }}>✓ รูปแบบอีเมลถูกต้อง</span>
                    ) : null}
                  </div>
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
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showAddPassword ? 'text' : 'password'} 
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร (มีตัวอักษรและตัวเลข)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={showAddPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  * ความยาวอย่างน้อย 8 ตัวอักษร มีทั้งภาษาอังกฤษและตัวเลข (ค่าเริ่มต้น: password123)
                </div>
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

              <div className="form-group">
                <label className="form-label required">ตำแหน่ง</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={editForm.position || ''}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  placeholder="เช่น นายทหารฝ่ายกำลังพล, ผบ.ร้อย.1"
                  required
                />
              </div>

              {/* หน่วยสังกัด (เชื่อมโยงโครงสร้างการจัดหน่วย ทบ. 864 หน่วย) */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label required" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={15} color="var(--cyan-accent)" />
                    <span>หน่วยสังกัด (เชื่อมโยงโครงสร้างการจัดหน่วย ทบ.)</span>
                  </label>
                  {editForm.unitName && (
                    <span style={{ fontSize: '11.5px', color: 'var(--cyan-accent)', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                      สังกัดเดิม: {editForm.unitName}
                    </span>
                  )}
                </div>
                <UnitAutocomplete
                  units={units}
                  value={editForm.unitId}
                  onChange={(selectedUnit) => {
                    setEditForm((prev) => ({
                      ...prev,
                      unitId: selectedUnit ? selectedUnit.id : '',
                      unitName: selectedUnit ? (selectedUnit.name || selectedUnit.shortName) : ''
                    }));
                  }}
                  loading={unitsLoading}
                  error={unitsError}
                  onRetry={loadUnits}
                  required
                  placeholder="พิมพ์ค้นหาชื่อหน่วย, ชื่อย่อ (เช่น พล.ร.9, มทบ.11, ร.9 พัน.1), รหัส หรือจังหวัด..."
                />
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  * ค้นหาและเลือกหน่วยจากโครงสร้างหน่วย ทบ. 864 หน่วย (แสดงสายการบังคับบัญชา)
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">เบอร์โทรศัพท์ (10 หลัก)</label>
                  <input 
                    type="tel" 
                    className="form-input"
                    maxLength={10}
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="08xxxxxxxx (10 หลัก)"
                    required
                  />
                  <div style={{ fontSize: '11px', marginTop: '3px' }}>
                    {(editForm.phone || '').length < 10 ? (
                      <span style={{ color: '#fbbf24' }}>⚠️ {(editForm.phone || '').length}/10 หลัก</span>
                    ) : validatePhoneNumber(editForm.phone) ? (
                      <span style={{ color: 'var(--emerald-success)' }}>✓ เบอร์โทรศัพท์ถูกต้อง ({formatPhoneNumber(editForm.phone)})</span>
                    ) : (
                      <span style={{ color: 'var(--ruby-danger)' }}>✗ ต้องขึ้นต้นด้วย 0</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">อีเมล (ต้องมี @)</label>
                  <input 
                    type="email" 
                    className="form-input"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value.trim().toLowerCase() })}
                    required
                  />
                  <div style={{ fontSize: '11px', marginTop: '3px' }}>
                    {editForm.email && !editForm.email.includes('@') ? (
                      <span style={{ color: '#fbbf24' }}>⚠️ ต้องมีเครื่องหมาย @</span>
                    ) : validateEmail(editForm.email) ? (
                      <span style={{ color: 'var(--emerald-success)' }}>✓ รูปแบบอีเมลถูกต้อง</span>
                    ) : null}
                  </div>
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

              {/* การจัดการรหัสผ่านผู้ใช้งาน (Password Security & Management) */}
              <div style={{
                marginTop: '20px',
                marginBottom: '20px',
                padding: '16px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Key size={18} color="var(--gold-primary)" />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>
                      ความปลอดภัยและการจัดการรหัสผ่าน
                    </span>
                  </div>

                  {/* สลับโหมด: คงรหัสเดิม vs กำหนดรหัสผ่านใหม่ */}
                  <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.35)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordMode('KEEP');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      style={{
                        padding: '5px 12px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: passwordMode === 'KEEP' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                        color: passwordMode === 'KEEP' ? '#6ee7b7' : 'var(--text-muted)',
                        fontWeight: passwordMode === 'KEEP' ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Lock size={12} />
                      <span>คงรหัสผ่านเดิมไว้</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPasswordMode('NEW')}
                      style={{
                        padding: '5px 12px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: passwordMode === 'NEW' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                        color: passwordMode === 'NEW' ? '#67e8f9' : 'var(--text-muted)',
                        fontWeight: passwordMode === 'NEW' ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Key size={12} />
                      <span>กำหนดรหัสผ่านใหม่</span>
                    </button>
                  </div>
                </div>

                {passwordMode === 'KEEP' ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <ShieldCheck size={20} color="var(--emerald-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#6ee7b7', marginBottom: '2px' }}>
                            บัญชีนี้กำลังใช้งานรหัสผ่านเดิม (คงรหัสเดิมไว้โดยไม่เปลี่ยนแปลง)
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                            รหัสผ่านเดิมของผู้ใช้ถูกจัดเก็บด้วยการเข้ารหัสความปลอดภัยสูง (Salted Scrypt) ทางเดียว หากไม่ต้องการรีเซ็ตรหัสผ่าน ให้เลือกโหมดนี้ไว้ รหัสผ่านเดิมจะยังคงใช้งานได้ตามปกติ
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowOldPasswordNotice((prev) => !prev)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                        title="ตรวจสอบข้อมูลการจัดเก็บรหัสผ่านเดิม"
                      >
                        {showOldPasswordNotice ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{showOldPasswordNotice ? 'ซ่อนข้อมูลรหัสเดิม' : 'ดูข้อมูลรหัสเดิม'}</span>
                      </button>
                    </div>

                    {showOldPasswordNotice && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '6px',
                        border: '1px dashed rgba(245, 158, 11, 0.4)',
                        fontSize: '11.5px',
                        color: '#fcd34d',
                        lineHeight: 1.6
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 600 }}>
                          <AlertCircle size={14} />
                          <span>นโยบายความปลอดภัยไซเบอร์ (Zero-Plaintext Policy):</span>
                        </div>
                        <div>
                          รหัสผ่านเดิมถูกจัดเก็บด้วยการแฮชชั้นสูง (One-way Salted Hash) เพื่อความปลอดภัยสูงสุด จึงไม่มีผู้ใด (รวมถึง Admin) สามารถเรียกดูรหัสเดิมเป็นข้อความธรรมดาได้ หากผู้ใช้ลืมรหัสผ่าน กรุณากดปุ่ม <strong>&quot;กำหนดรหัสผ่านใหม่&quot;</strong> เพื่อตั้งรหัสผ่านใหม่หรือกดรีเซ็ตเป็นรหัสเริ่มต้น
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Quick Preset Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        กำหนดรหัสผ่านใหม่ที่ปลอดภัย (อย่างน้อย 8 ตัวอักษร มีตัวอักษรและตัวเลข):
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPassword('password123');
                            setConfirmPassword('password123');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="ตั้งเป็นรหัสผ่านเริ่มต้นของระบบ"
                        >
                          <span>⚡ รหัสเริ่มต้น (password123)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const gen = generateSecurePassword();
                            setNewPassword(gen);
                            setConfirmPassword(gen);
                            setShowNewPassword(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="สุ่มรหัสผ่านความปลอดภัยสูง"
                        >
                          <Sparkles size={11} color="var(--gold-primary)" />
                          <span>สุ่มรหัสปลอดภัย</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid-cols-2">
                      {/* ช่องรหัสผ่านใหม่ */}
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label required" style={{ fontSize: '12.5px' }}>
                          รหัสผ่านใหม่ (New Password)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showNewPassword ? 'text' : 'password'}
                            className="form-input"
                            style={{ paddingRight: '40px', fontSize: '13px' }}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="ระบุรหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={showNewPassword ? 'ซ่อนรหัสผ่านใหม่' : 'แสดงรหัสผ่านใหม่'}
                          >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* ช่องยืนยันรหัสผ่านใหม่ */}
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label required" style={{ fontSize: '12.5px' }}>
                          ยืนยันรหัสผ่านใหม่ (Confirm Password)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="form-input"
                            style={{ paddingRight: '40px', fontSize: '13px' }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={showConfirmPassword ? 'ซ่อนรหัสยืนยัน' : 'แสดงรหัสยืนยัน'}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ความแข็งแกร่งของรหัสผ่าน */}
                    {newPassword && (
                      <div style={{ marginBottom: '12px' }}>
                        {(() => {
                          const strength = getPasswordStrength(newPassword);
                          return (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>ระดับความปลอดภัยของรหัสผ่าน:</span>
                                <span style={{ color: strength.color, fontWeight: 600 }}>{strength.text}</span>
                              </div>
                              <div style={{ height: '4px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${strength.percent}%`, height: '100%', background: strength.color, transition: 'width 0.25s ease' }} />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Security Checklist เงื่อนไขความปลอดภัย */}
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '11.5px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: newPassword.length >= 8 ? 'var(--emerald-success)' : 'var(--text-dim)' }}>
                        {newPassword.length >= 8 ? <Check size={13} /> : <X size={13} />}
                        <span>ความยาวอย่างน้อย 8 ตัวอักษร ({newPassword.length}/8)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: /[a-zA-Z]/.test(newPassword) ? 'var(--emerald-success)' : 'var(--text-dim)' }}>
                        {/[a-zA-Z]/.test(newPassword) ? <Check size={13} /> : <X size={13} />}
                        <span>มีตัวอักษรภาษาอังกฤษ (A-Z, a-z)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: /\d/.test(newPassword) ? 'var(--emerald-success)' : 'var(--text-dim)' }}>
                        {/\d/.test(newPassword) ? <Check size={13} /> : <X size={13} />}
                        <span>มีตัวเลขอารบิก (0-9)</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: confirmPassword && newPassword === confirmPassword ? 'var(--emerald-success)' : confirmPassword ? 'var(--ruby-danger)' : 'var(--text-dim)'
                      }}>
                        {confirmPassword && newPassword === confirmPassword ? <Check size={13} /> : <X size={13} />}
                        <span>
                          {confirmPassword
                            ? newPassword === confirmPassword
                              ? 'รหัสผ่านทั้งสองช่องตรงกัน'
                              : 'รหัสผ่านสองช่องไม่ตรงกัน'
                            : 'ช่องยืนยันรหัสผ่านตรงกัน'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
