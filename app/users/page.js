// app/users/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Building, 
  Phone, 
  Mail,
  AlertCircle
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const ROLE_LABELS = {
    UNIT_OFFICER: { label: '1. เจ้าหน้าที่หน่วย (เสนอเรื่อง)', badge: 'badge-blue' },
    KSP_OFFICER: { label: '2. กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)', badge: 'badge-amber' },
    COMMANDER: { label: '3. ผู้บังคับบัญชา (จก.กพ.ทบ. อนุมัติ)', badge: 'badge-purple' },
    INSURANCE_REP: { label: '4. บริษัทประกันภัย (โอนเงิน)', badge: 'badge-cyan' },
    SK_OFFICER: { label: '5. สก.ทบ. (รับทราบยอดจ่าย)', badge: 'badge-emerald' },
    ADMIN: { label: 'ผู้ดูแลระบบ (Admin)', badge: 'badge-red' }
  };

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)); } catch (e) {}
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...users];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.citizenId.includes(q) ||
          u.unitName?.toLowerCase().includes(q) ||
          u.position?.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchQuery, roleFilter, users]);

  const handleChangeRole = async (userId, newRole) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'CHANGE_ROLE', newRole })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('ปรับเปลี่ยนบทบาทสำเร็จ');
        loadUsers();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (userId) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'TOGGLE_ACTIVE' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        loadUsers();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="var(--gold-primary)" />
            <span>ระบบจัดการผู้ใช้งานและกำหนดสิทธิ (User Management)</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            บริหารจัดการบัญชีเจ้าหน้าที่หน่วย, กสพ.กพ.ทบ., ผู้บังคับบัญชา, บริษัทประกันภัย และ สก.ทบ.
          </p>
        </div>

        <Link href="/register" className="btn btn-primary">
          <UserPlus size={16} />
          <span>+ เพิ่ม/ลงทะเบียนผู้ใช้ใหม่</span>
        </Link>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-success)', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-panel" style={{ padding: '18px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="ค้นหา: ชื่อ-สกุล, เลข ปชช., ตำแหน่ง, หน่วย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '240px' }}>
            <select 
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">ทุกบทบาทหน้าที่ (Roles)</option>
              <option value="UNIT_OFFICER">เจ้าหน้าที่หน่วย (เสนอเรื่อง)</option>
              <option value="KSP_OFFICER">กพ.ทบ. (กสพ.ฯ ตรวจเอกสาร)</option>
              <option value="COMMANDER">ผู้บังคับบัญชา (จก.กพ.ทบ.)</option>
              <option value="INSURANCE_REP">บริษัทประกันภัย</option>
              <option value="SK_OFFICER">สก.ทบ. (รับทราบยอด)</option>
              <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>กำลังโหลดรายชื่อผู้ใช้...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>ไม่พบข้อมูลผู้ใช้งาน</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>ยศ - ชื่อ - สกุล</th>
                  <th style={{ padding: '12px 14px' }}>เลข ปชช. (13 หลัก)</th>
                  <th style={{ padding: '12px 14px' }}>ตำแหน่ง / หน่วยสังกัด</th>
                  <th style={{ padding: '12px 14px' }}>ช่องทางติดต่อ</th>
                  <th style={{ padding: '12px 14px' }}>สิทธิ / บทบาทในระบบ</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const roleCfg = ROLE_LABELS[u.role] || { label: u.role, badge: 'badge-dark' };

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: '#fff' }}>
                        {u.rank} {u.firstName} {u.lastName}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--gold-primary)', fontFamily: 'monospace', fontSize: '13px' }}>
                        {u.citizenId}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div>{u.position}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{u.unitName}</div>
                      </td>
                      <td style={{ padding: '14px', fontSize: '12.5px' }}>
                        <div>📞 {u.phone}</div>
                        <div style={{ color: 'var(--text-muted)' }}>✉️ {u.email}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <select 
                          className="form-select"
                          style={{ padding: '5px 8px', fontSize: '12px', width: 'auto' }}
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        >
                          <option value="UNIT_OFFICER">1. เจ้าหน้าที่หน่วย</option>
                          <option value="KSP_OFFICER">2. กสพ.กพ.ทบ.</option>
                          <option value="COMMANDER">3. จก.กพ.ทบ.</option>
                          <option value="INSURANCE_REP">4. บ.ประกันภัย</option>
                          <option value="SK_OFFICER">5. สก.ทบ.</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          className={`btn btn-sm ${u.isActive !== false ? 'btn-success' : 'btn-danger'}`}
                          style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px' }}
                        >
                          {u.isActive !== false ? '✓ ใช้งานอยู่' : '✗ ระงับ'}
                        </button>
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
  );
}
