// app/claims/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  Shield, 
  Building, 
  Calendar, 
  AlertCircle,
  FolderOpen,
  Edit3,
  Trash2,
  Upload,
  Download,
  Eye,
  X,
  FileCheck2,
  Save,
  Check,
  Plus,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { formatThaiDate, REQUIRED_DOCUMENTS, validateAttachmentFile, MILITARY_RANKS, getPersonnelTypeFromRank, getGenderFromRank, validateCitizenId } from '@/lib/thai-utils';
import { CLAIM_STATUS } from '@/lib/constants';
import { triggerStatusPopup } from '@/components/StatusModal';
import SampleDocumentViewer from '@/components/SampleDocumentViewer';

export default function ClaimsListPage() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');

  // CRUD Modals State
  // 1. Manage Documents Modal
  const [selectedClaimForDocs, setSelectedClaimForDocs] = useState(null);
  const [previewDocInModal, setPreviewDocInModal] = useState(null);
  const [uploadingDocIndex, setUploadingDocIndex] = useState(null);

  // 2. Quick Edit Modal
  const [selectedClaimForEdit, setSelectedClaimForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // 3. Delete Confirmation Modal
  const [selectedClaimForDelete, setSelectedClaimForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handleAuth = () => {
      const saved = localStorage.getItem('rta_user');
      let user = null;
      if (saved) {
        try {
          user = JSON.parse(saved);
          setCurrentUser(user);
        } catch (e) {}
      } else {
        setCurrentUser(null);
      }
      loadClaims(user);
    };

    handleAuth();
    window.addEventListener('rta_auth_change', handleAuth);
    return () => window.removeEventListener('rta_auth_change', handleAuth);
  }, []);

  const loadClaims = async (user) => {
    setLoading(true);
    try {
      const url = user?.id ? `/api/claims?userId=${user.id}` : '/api/claims';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setClaims(data.claims);
        setFilteredClaims(data.claims);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...claims];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.trackingCode.toLowerCase().includes(q) ||
          c.casualtyFirstName.toLowerCase().includes(q) ||
          c.casualtyLastName.toLowerCase().includes(q) ||
          (c.casualtyCitizenId || '').includes(q) ||
          (c.unitName || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // SLA filter
    if (slaFilter !== 'ALL') {
      const now = new Date();
      result = result.filter((c) => {
        const created = new Date(c.createdAt);
        const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const remaining = 30 - days;

        if (slaFilter === 'OVERDUE') return remaining <= 0 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID';
        if (slaFilter === 'WARNING') return remaining > 0 && remaining <= 7 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID';
        if (slaFilter === 'NORMAL') return remaining > 7 || c.status === 'PAID' || c.status === 'SK_NOTIFIED';
        return true;
      });
    }

    setFilteredClaims(result);
  }, [searchQuery, statusFilter, slaFilter, claims]);

  // Quick Counter Aggregation
  const totalCount = claims.length;
  const draftCount = claims.filter((c) => c.status === 'DRAFT').length;
  const inProgressCount = claims.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'PENDING_APPROVAL').length;
  const approvedCount = claims.filter((c) => c.status === 'APPROVED' || c.status === 'INSURANCE_PROCESSING').length;
  const paidCount = claims.filter((c) => c.status === 'PAID' || c.status === 'SK_NOTIFIED').length;

  // ==========================================
  // CRUD Handlers
  // ==========================================

  // 1. Open Manage Documents Modal
  const handleOpenDocsModal = (claim) => {
    setSelectedClaimForDocs(claim);
    setPreviewDocInModal(null);
  };

  // Upload/Replace doc in Modal
  const handleModalDocUpload = async (docIndex, e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClaimForDocs) return;

    const val = validateAttachmentFile(file);
    if (!val.valid) {
      triggerStatusPopup({
        type: 'danger',
        title: 'ไม่อนุญาตให้อัปโหลดไฟล์นี้',
        message: val.error
      });
      e.target.value = '';
      return;
    }

    setUploadingDocIndex(docIndex);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileData = event.target?.result;
        const res = await fetch(`/api/claims/${selectedClaimForDocs.id}/document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser?.id,
            docIndex,
            fileName: file.name,
            fileUrl: `/uploads/${file.name}`,
            fileData,
            fileSize: file.size
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'แนบเอกสารไม่สำเร็จ');
        }

        // อัปเดตใน state ทันที
        setSelectedClaimForDocs(data.claim);
        setClaims((prev) => prev.map((c) => (c.id === data.claim.id ? data.claim : c)));

        triggerStatusPopup({
          type: 'success',
          title: 'แนบเอกสารสำเร็จ',
          message: `แนบไฟล์ "${file.name}" สำหรับเอกสารข้อที่ ${docIndex} เรียบร้อยแล้ว`,
          trackingCode: data.claim.trackingCode
        });
      } catch (err) {
        triggerStatusPopup({
          type: 'danger',
          title: 'ข้อผิดพลาด',
          message: err.message
        });
      } finally {
        setUploadingDocIndex(null);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove attached doc file in Modal
  const handleModalDocRemove = async (docIndex) => {
    if (!selectedClaimForDocs) return;
    if (!confirm(`ยืนยันการลบไฟล์แนบของเอกสารข้อที่ ${docIndex} หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/claims/${selectedClaimForDocs.id}/document?userId=${currentUser?.id}&docIndex=${docIndex}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ลบไฟล์ไม่สำเร็จ');
      }

      setSelectedClaimForDocs(data.claim);
      setClaims((prev) => prev.map((c) => (c.id === data.claim.id ? data.claim : c)));

      triggerStatusPopup({
        type: 'warning',
        title: 'ลบไฟล์แนบเรียบร้อย',
        message: `ลบไฟล์แนบของเอกสารข้อที่ ${docIndex} เรียบร้อยแล้ว สามารถแนบไฟล์ใหม่ได้ตลอดเวลา`,
        trackingCode: data.claim.trackingCode
      });
    } catch (err) {
      triggerStatusPopup({
        type: 'danger',
        title: 'ข้อผิดพลาด',
        message: err.message
      });
    }
  };

  // 2. Open Quick Edit Modal
  const handleOpenEditModal = (claim) => {
    setSelectedClaimForEdit(claim);
    setEditError('');
    setEditFormData({
      casualtyRank: claim.casualtyRank || 'ส.อ.',
      casualtyFirstName: claim.casualtyFirstName || '',
      casualtyLastName: claim.casualtyLastName || '',
      casualtyCitizenId: claim.casualtyCitizenId || '',
      casualtyBirthDate: claim.casualtyBirthDate || '1995-01-01',
      casualtyGender: claim.casualtyGender || 'ชาย',
      personnelType: claim.personnelType || 'นายทหารประทวน',
      claimType: claim.claimType || 'HIGH_RISK',
      lossType: claim.lossType || 'DECEASED',
      incidentType: claim.incidentType || 'ILLNESS',
      causeOfLoss: claim.causeOfLoss || '',
      lossSpecificCause: claim.lossSpecificCause || claim.deathCertificateCause || claim.disabledOrganDetail || ''
    });
  };

  const handleRankChange = (rank) => {
    const autoType = getPersonnelTypeFromRank(rank);
    const autoGender = getGenderFromRank(rank);
    setEditFormData((prev) => ({
      ...prev,
      casualtyRank: rank,
      personnelType: autoType,
      ...(autoGender ? { casualtyGender: autoGender } : {})
    }));
  };

  // Submit Quick Edit
  const handleSaveQuickEdit = async (e) => {
    e.preventDefault();
    if (!selectedClaimForEdit) return;
    setEditError('');

    if (!editFormData.casualtyFirstName || !editFormData.casualtyLastName) {
      setEditError('กรุณากรอกชื่อและนามสกุลกำลังพล');
      return;
    }

    if (editFormData.casualtyCitizenId && !validateCitizenId(editFormData.casualtyCitizenId)) {
      setEditError('เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักการตรวจสอบ');
      return;
    }

    setSavingEdit(true);
    try {
      const compensationAmount = editFormData.claimType === 'HIGH_RISK' ? 300000 : 60000;
      const res = await fetch(`/api/claims/${selectedClaimForEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          claimData: {
            ...selectedClaimForEdit,
            ...editFormData,
            compensationAmount,
            deathCertificateCause: editFormData.lossType === 'DECEASED' ? editFormData.lossSpecificCause : '',
            disabledOrganDetail: editFormData.lossType === 'DISABLED' ? editFormData.lossSpecificCause : ''
          },
          submitNow: false
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      setClaims((prev) => prev.map((c) => (c.id === data.claim.id ? data.claim : c)));
      setSelectedClaimForEdit(null);

      triggerStatusPopup({
        type: 'success',
        title: 'แก้ไขข้อมูลคำร้องสำเร็จ',
        message: `ปรับปรุงข้อมูลคำร้อง ${data.claim.trackingCode} เรียบร้อยแล้ว`,
        trackingCode: data.claim.trackingCode,
        casualtyName: `${data.claim.casualtyRank} ${data.claim.casualtyFirstName} ${data.claim.casualtyLastName}`,
        action: 'แก้ไขข้อมูลคำร้อง (CRUD Update)',
        by: currentUser ? `${currentUser.name} (${currentUser.role})` : 'เจ้าหน้าที่'
      });
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // 3. Delete Claim
  const handleOpenDeleteModal = (claim) => {
    setSelectedClaimForDelete(claim);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClaimForDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/claims/${selectedClaimForDelete.id}?userId=${currentUser?.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ลบคำร้องไม่สำเร็จ');
      }

      // นำคำร้องออกจากรายการทันที
      setClaims((prev) => prev.filter((c) => c.id !== selectedClaimForDelete.id));
      const deletedTracking = selectedClaimForDelete.trackingCode;
      const deletedName = `${selectedClaimForDelete.casualtyRank} ${selectedClaimForDelete.casualtyFirstName} ${selectedClaimForDelete.casualtyLastName}`;
      setSelectedClaimForDelete(null);

      triggerStatusPopup({
        type: 'danger',
        title: 'ลบคำร้องออกจากระบบสำเร็จ',
        message: `ลบคำร้อง ${deletedTracking} (${deletedName}) เรียบร้อยแล้ว ระบบได้บันทึกประวัติไว้ใน Audit Log`,
        trackingCode: deletedTracking,
        action: 'ลบคำร้อง (CRUD Delete)',
        by: currentUser ? `${currentUser.name} (${currentUser.role})` : 'เจ้าหน้าที่'
      });
    } catch (err) {
      triggerStatusPopup({
        type: 'danger',
        title: 'ไม่สามารถลบคำร้องได้',
        message: err.message
      });
    } finally {
      setDeleting(false);
    }
  };

  // ตรวจสอบสิทธิ์การลบคำร้อง
  const canDeleteClaim = (claim) => {
    if (currentUser?.role === 'ADMIN') return true;
    if (currentUser?.role === 'UNIT_OFFICER') {
      return claim.status === 'DRAFT' || claim.status === 'SUBMITTED' || claim.status === 'REJECTED_BY_KSP';
    }
    return false;
  };

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      
      {/* Header & Scoping Notice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>รายการคำร้องเสนอขอรับสิทธิเงินค่าสินไหมทดแทน</span>
            {currentUser?.role === 'UNIT_OFFICER' ? (
              <span className="badge badge-amber" style={{ fontSize: '12px' }}>
                เฉพาะสังกัด: {currentUser.unitName}
              </span>
            ) : (
              <span className="badge badge-blue" style={{ fontSize: '12px' }}>
                มุมมองส่วนกลาง (ทุกหน่วยทั่วประเทศ)
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            จัดการข้อมูลคำร้องครบวงจร (CRUD) • จัดการไฟล์เอกสารแนบ 10 รายการ • ตรวจสอบสถานะและติดตามกรอบเวลา SLA 30 วัน
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => loadClaims(currentUser)} 
            className="btn btn-secondary btn-sm"
            title="รีเฟรชข้อมูลคำร้องล่าสุด"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={14} />
            <span>รีเฟรช</span>
          </button>
          <Link href="/submit" className="btn btn-primary" style={{ gap: '6px' }}>
            <Plus size={16} />
            <span>+ ยื่นเสนอเรื่องใหม่</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Pills (Clickable Quick Filters) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div 
          onClick={() => setStatusFilter('ALL')}
          style={{
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: '10px',
            background: statusFilter === 'ALL' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${statusFilter === 'ALL' ? '#3b82f6' : 'var(--border-glass)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>คำร้องทั้งหมด</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{totalCount} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span></div>
          </div>
          <FileText size={22} color="#60a5fa" />
        </div>

        <div 
          onClick={() => setStatusFilter('DRAFT')}
          style={{
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: '10px',
            background: statusFilter === 'DRAFT' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${statusFilter === 'DRAFT' ? '#f59e0b' : 'var(--border-glass)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#fbbf24' }}>📝 แบบร่าง (รอเอกสาร)</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>{draftCount} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span></div>
          </div>
          <Edit3 size={22} color="#fbbf24" />
        </div>

        <div 
          onClick={() => setStatusFilter('UNDER_REVIEW')}
          style={{
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: '10px',
            background: statusFilter === 'UNDER_REVIEW' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${statusFilter === 'UNDER_REVIEW' ? '#a855f7' : 'var(--border-glass)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#c084fc' }}>⏳ กำลังดำเนินการ</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#c084fc' }}>{inProgressCount} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span></div>
          </div>
          <Clock size={22} color="#c084fc" />
        </div>

        <div 
          onClick={() => setStatusFilter('APPROVED')}
          style={{
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: '10px',
            background: statusFilter === 'APPROVED' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${statusFilter === 'APPROVED' ? '#06b6d4' : 'var(--border-glass)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#22d3ee' }}>🎖️ อนุมัติ จก.กพ.ทบ.</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#22d3ee' }}>{approvedCount} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span></div>
          </div>
          <Shield size={22} color="#22d3ee" />
        </div>

        <div 
          onClick={() => setStatusFilter('PAID')}
          style={{
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: '10px',
            background: statusFilter === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${statusFilter === 'PAID' ? '#10b981' : 'var(--border-glass)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#34d399' }}>💳 จ่ายโอนเงินแล้ว</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399' }}>{paidCount} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span></div>
          </div>
          <CheckCircle2 size={22} color="#34d399" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="ค้นหา: เลขที่เรื่อง, ชื่อผู้สูญเสีย, เลข ปชช., หน่วย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Workflow Status Filter */}
          <div style={{ minWidth: '220px' }}>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="DRAFT">📝 ร่างคำร้อง (รอแนบเอกสาร)</option>
              <option value="SUBMITTED">1. เสนอเรื่องใหม่</option>
              <option value="UNDER_REVIEW">2. กสพ. กำลังตรวจเอกสาร</option>
              <option value="REJECTED_BY_KSP">ตีกลับให้หน่วยแก้ไข</option>
              <option value="PENDING_APPROVAL">3. รอ จก.กพ.ทบ. อนุมัติ</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="INSURANCE_PROCESSING">4. บ.ประกันภัย กำลังตรวจ</option>
              <option value="PAID">โอนเงินสินไหมแล้ว</option>
              <option value="SK_NOTIFIED">5. สก.ทบ. รับทราบยอด (ปิดเรื่อง)</option>
            </select>
          </div>

          {/* SLA Filter */}
          <div style={{ minWidth: '180px' }}>
            <select 
              className="form-select"
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
            >
              <option value="ALL">กรอบเวลา SLA ทั้งหมด</option>
              <option value="OVERDUE">⚠️ เกิน 30 วัน (Overdue)</option>
              <option value="WARNING">⏳ ใกล้ครบกำหนด (เหลือ &lt; 7 วัน)</option>
              <option value="NORMAL">✓ ปกติ / เสร็จสิ้น</option>
            </select>
          </div>

        </div>
      </div>

      {/* Claims List Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>กำลังโหลดรายการคำร้อง...</div>
        ) : filteredClaims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
            <FileText size={42} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div>ไม่พบข้อมูลคำร้องตามเงื่อนไขที่ค้นหา</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>เลขที่คำร้อง</th>
                  <th style={{ padding: '12px 14px' }}>วันที่เสนอ</th>
                  <th style={{ padding: '12px 14px' }}>หน่วยสังกัด</th>
                  <th style={{ padding: '12px 14px' }}>ผู้สูญเสีย</th>
                  <th style={{ padding: '12px 14px' }}>ประเภทสินไหม</th>
                  <th style={{ padding: '12px 14px' }}>เอกสารแนบ</th>
                  <th style={{ padding: '12px 14px' }}>ขั้นตอน Workflow</th>
                  <th style={{ padding: '12px 14px' }}>กรอบเวลา SLA</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', minWidth: '220px' }}>การจัดการคำร้อง (CRUD)</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => {
                  const daysDiff = Math.floor((new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24));
                  const remaining = 30 - daysDiff;
                  const isOverdue = remaining <= 0;
                  const isWarning = remaining > 0 && remaining <= 7;
                  
                  const uploadedDocsCount = (claim.documents || []).filter((d) => d.uploaded).length;
                  const verifiedDocsCount = (claim.documents || []).filter((d) => d.status === 'VERIFIED').length;

                  return (
                    <tr key={claim.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      
                      {/* Tracking Code */}
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--gold-primary)' }}>
                        <Link href={`/claims/${claim.id}`} style={{ color: 'var(--gold-primary)', textDecoration: 'none' }} title="คลิกเพื่อดูรายละเอียดคำร้อง">
                          {claim.trackingCode}
                        </Link>
                      </td>

                      {/* Report Date */}
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {formatThaiDate(claim.createdAt, true)}
                      </td>

                      {/* Unit */}
                      <td style={{ padding: '14px', color: 'var(--text-main)' }}>
                        <div style={{ fontWeight: 500 }}>{claim.unitName}</div>
                        {claim.unitPath && claim.unitPath !== claim.unitName && (
                          <div style={{ fontSize: '11px', color: 'var(--gold-light)', marginTop: '2px' }}>
                            {claim.unitPath}
                          </div>
                        )}
                        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>ผู้เสนอ: {claim.reporterName}</div>
                      </td>

                      {/* Casualty */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600 }}>{claim.casualtyRank} {claim.casualtyFirstName} {claim.casualtyLastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                          ปชช. {claim.casualtyCitizenId || '-'} • {claim.lossType === 'DECEASED' ? 'เสียชีวิต' : 'พิการทุพพลภาพ'}
                        </div>
                      </td>

                      {/* Compensation Type */}
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${claim.claimType === 'HIGH_RISK' ? 'badge-amber' : 'badge-blue'}`}>
                          {claim.claimType === 'HIGH_RISK' ? 'เสี่ยงภัย 300,000 บ.' : 'ยามปกติ 60,000 บ.'}
                        </span>
                      </td>

                      {/* Documents Status Column & Quick Button */}
                      <td style={{ padding: '14px' }}>
                        <button
                          onClick={() => handleOpenDocsModal(claim)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            gap: '6px',
                            background: uploadedDocsCount >= 10 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: uploadedDocsCount >= 10 ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-glass)',
                            color: uploadedDocsCount >= 10 ? '#34d399' : 'var(--text-main)'
                          }}
                          title="กดเพื่อเปิดหน้าต่างจัดการเอกสาร 10 รายการ แนบไฟล์/พรีวิว/ดาวน์โหลด"
                        >
                          <FolderOpen size={14} color={uploadedDocsCount >= 10 ? '#34d399' : '#fbbf24'} />
                          <span>{uploadedDocsCount}/10 เอกสาร</span>
                        </button>
                        {verifiedDocsCount > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--emerald-success)', marginTop: '2px' }}>
                            ✓ ตรวจผ่าน {verifiedDocsCount} ข้อ
                          </div>
                        )}
                      </td>

                      {/* Workflow Status */}
                      <td style={{ padding: '14px' }}>
                        {claim.status === 'DRAFT' ? (
                          <span className="badge badge-slate" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                            📝 ร่างคำร้อง (รอเอกสาร)
                          </span>
                        ) : (
                          <span className="badge badge-emerald">
                            {CLAIM_STATUS[claim.status]?.label || claim.status}
                          </span>
                        )}
                        {claim.status === 'REJECTED_BY_KSP' && (
                          <div style={{ fontSize: '11px', color: 'var(--ruby-danger)', marginTop: '4px' }}>
                            * กสพ. แจ้งให้แก้ไขเอกสาร
                          </div>
                        )}
                      </td>

                      {/* SLA */}
                      <td style={{ padding: '14px' }}>
                        {claim.status === 'DRAFT' ? (
                          <span className="badge badge-slate" style={{ fontSize: '11px' }}>
                            ⏳ รอแนบเอกสารเพื่อส่งเรื่อง
                          </span>
                        ) : claim.status === 'PAID' || claim.status === 'SK_NOTIFIED' ? (
                          <span className="sla-pill sla-normal">
                            <CheckCircle2 size={12} /> เสร็จสิ้น
                          </span>
                        ) : isOverdue ? (
                          <div>
                            <span className="sla-pill sla-overdue">
                              <AlertTriangle size={12} /> เกิน SLA {Math.abs(remaining)} วัน
                            </span>
                            {claim.delayReason ? (
                              <div style={{ fontSize: '11px', color: 'var(--emerald-success)', marginTop: '3px' }}>
                                ✓ ชี้แจงเหตุผลแล้ว
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: 'var(--ruby-danger)', marginTop: '3px' }}>
                                ⚠️ รอแนบเหตุผลล่าช้า
                              </div>
                            )}
                          </div>
                        ) : isWarning ? (
                          <span className="sla-pill sla-warning">
                            <Clock size={12} /> เหลือ {remaining} วัน (ใกล้ครบ)
                          </span>
                        ) : (
                          <span className="sla-pill sla-normal">
                            <Clock size={12} /> เหลือ {remaining} วัน
                          </span>
                        )}
                      </td>

                      {/* CRUD Actions */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          
                          {/* 1. View Detail */}
                          <Link 
                            href={`/claims/${claim.id}`} 
                            className="btn btn-secondary btn-sm"
                            title="ดูรายละเอียดคำร้องและไทม์ไลน์"
                            style={{ padding: '5px 9px' }}
                          >
                            <Eye size={14} />
                          </Link>

                          {/* 2. Manage Documents */}
                          <button 
                            type="button"
                            onClick={() => handleOpenDocsModal(claim)}
                            className="btn btn-secondary btn-sm"
                            title="จัดการเอกสาร 10 รายการ (แนบ/แทนที่/ลบ)"
                            style={{ padding: '5px 9px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                          >
                            <FolderOpen size={14} />
                          </button>

                          {/* 3. Edit Claim */}
                          {claim.status === 'DRAFT' ? (
                            <Link 
                              href={`/submit?draftId=${claim.id}`}
                              className="btn btn-warning btn-sm"
                              title="แก้ไขแบบร่างและส่งเรื่อง"
                              style={{ padding: '5px 10px', gap: '4px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <Edit3 size={13} />
                              <span>แก้ไขร่าง</span>
                            </Link>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => handleOpenEditModal(claim)}
                              className="btn btn-secondary btn-sm"
                              title="แก้ไขข้อมูลคำร้อง (CRUD Edit)"
                              style={{ padding: '5px 9px', color: '#fbbf24' }}
                            >
                              <Edit3 size={14} />
                            </button>
                          )}

                          {/* 4. Delete Claim */}
                          {canDeleteClaim(claim) && (
                            <button 
                              type="button"
                              onClick={() => handleOpenDeleteModal(claim)}
                              className="btn btn-danger btn-sm"
                              title="ลบคำร้อง (CRUD Delete)"
                              style={{ padding: '5px 9px' }}
                            >
                              <Trash2 size={14} />
                            </button>
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

      {/* ========================================================================= */}
      {/* MODAL 1: จัดการเอกสารคำร้อง 10 รายการ (Manage Documents Modal) */}
      {/* ========================================================================= */}
      {selectedClaimForDocs && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '920px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(3, 16, 19, 0.95)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FolderOpen size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', color: '#fff', margin: 0 }}>
                    จัดการเอกสารหลักฐาน 10 รายการ: {selectedClaimForDocs.trackingCode}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    กำลังพล: <strong>{selectedClaimForDocs.casualtyRank} {selectedClaimForDocs.casualtyFirstName} {selectedClaimForDocs.casualtyLastName}</strong> • {selectedClaimForDocs.unitName}
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setSelectedClaimForDocs(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                title="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#081215' }}>
              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                  แนบแล้ว <strong>{(selectedClaimForDocs.documents || []).filter(d => d.uploaded).length}</strong> จากทั้งหมด 10 รายการ (จำกัดไฟล์ละไม่เกิน 10MB • ป้องกันไฟล์ไม่ปลอดภัย)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gold-primary)' }}>
                  * เจ้าหน้าที่สามารถกดแนบไฟล์ใหม่, เปลี่ยนไฟล์ หรือลบไฟล์แนบได้โดยตรง
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {REQUIRED_DOCUMENTS.map((docDef) => {
                  const currentDoc = (selectedClaimForDocs.documents || []).find((d) => d.index === docDef.index) || docDef;
                  const isUploaded = !!currentDoc.uploaded;
                  const isUploading = uploadingDocIndex === docDef.index;

                  return (
                    <div 
                      key={docDef.index}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: isUploaded ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isUploaded ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-glass)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 360px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: isUploaded ? 'var(--emerald-success)' : 'rgba(255, 255, 255, 0.08)',
                          color: isUploaded ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {docDef.index}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                            {docDef.name}
                          </div>
                          <div style={{ fontSize: '12px', marginTop: '2px' }}>
                            {isUploaded ? (
                              <span style={{ color: 'var(--emerald-success)' }}>
                                ✓ แนบแล้ว: <strong>{currentDoc.fileName}</strong> {currentDoc.fileSize ? `(${(currentDoc.fileSize / (1024 * 1024)).toFixed(2)} MB)` : ''}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)' }}>
                                ⚠️ ยังไม่มีการแนบไฟล์ {docDef.note ? `• ${docDef.note}` : ''}
                              </span>
                            )}
                          </div>
                          {currentDoc.comment && (
                            <div style={{ fontSize: '11.5px', color: '#fca5a5', marginTop: '3px' }}>
                              ความเห็นผู้ตรวจ: {currentDoc.comment}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions for this doc */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        
                        {/* 1. Preview Doc */}
                        <button
                          type="button"
                          onClick={() => setPreviewDocInModal(currentDoc)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 10px', fontSize: '12px', gap: '4px' }}
                          title="พรีวิวตัวอย่างหรือไฟล์แนบจริง"
                        >
                          <Eye size={13} />
                          <span>{isUploaded ? 'พรีวิวไฟล์' : 'ดูตัวอย่าง'}</span>
                        </button>

                        {/* 2. Upload / Replace File */}
                        <label 
                          className={`btn btn-sm ${isUploaded ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '6px 12px', fontSize: '12px', gap: '4px', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                          title={isUploaded ? 'เปลี่ยนไฟล์เอกสารนี้' : 'แนบไฟล์เอกสาร'}
                        >
                          <Upload size={13} />
                          <span>{isUploading ? 'กำลังแนบ...' : isUploaded ? 'เปลี่ยนไฟล์' : 'แนบไฟล์'}</span>
                          <input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg" 
                            style={{ display: 'none' }}
                            disabled={isUploading}
                            onChange={(e) => handleModalDocUpload(docDef.index, e)}
                          />
                        </label>

                        {/* 3. Delete File */}
                        {isUploaded && (
                          <button
                            type="button"
                            onClick={() => handleModalDocRemove(docDef.index)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '6px 8px' }}
                            title="ลบไฟล์แนบนี้ออก"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sub-Modal: Preview Doc inside Modal */}
              {previewDocInModal && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#041014',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                      พรีวิว: {previewDocInModal.name}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setPreviewDocInModal(null)} 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                    >
                      ปิดพรีวิว
                    </button>
                  </div>
                  <SampleDocumentViewer 
                    doc={previewDocInModal} 
                    claim={selectedClaimForDocs} 
                    onDownload={() => {}}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              justifyContent: 'flex-end',
              background: 'rgba(3, 16, 19, 0.95)'
            }}>
              <button 
                type="button"
                onClick={() => setSelectedClaimForDocs(null)}
                className="btn btn-secondary"
              >
                ปิดหน้าต่างจัดการเอกสาร
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: แก้ไขข้อมูลคำร้อง (Quick Edit Modal) */}
      {/* ========================================================================= */}
      {selectedClaimForEdit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border-glass)'
          }}>
            
            {/* Edit Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(3, 16, 19, 0.95)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit3 size={18} color="var(--gold-primary)" />
                <h3 style={{ fontSize: '17px', color: '#fff', margin: 0 }}>
                  แก้ไขข้อมูลคำร้อง: {selectedClaimForEdit.trackingCode}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedClaimForEdit(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Edit Body */}
            <form onSubmit={handleSaveQuickEdit} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              
              {editError && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', color: '#fca5a5', marginBottom: '16px', fontSize: '13px' }}>
                  ⚠️ {editError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px' }}>ยศกำลังพล</label>
                  <select 
                    className="form-select"
                    value={editFormData.casualtyRank}
                    onChange={(e) => handleRankChange(e.target.value)}
                  >
                    {MILITARY_RANKS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px' }}>ประเภทกำลังพล</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editFormData.personnelType || ''}
                    readOnly
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--gold-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px' }}>ชื่อผู้สูญเสีย *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editFormData.casualtyFirstName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, casualtyFirstName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px' }}>นามสกุล *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editFormData.casualtyLastName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, casualtyLastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px' }}>เลขประจำตัวประชาชน 13 หลัก</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    maxLength={17}
                    value={editFormData.casualtyCitizenId || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, casualtyCitizenId: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px' }}>เพศ</label>
                  <select 
                    className="form-select"
                    value={editFormData.casualtyGender || 'ชาย'}
                    onChange={(e) => setEditFormData({ ...editFormData, casualtyGender: e.target.value })}
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px' }}>ประเภทสิทธิสินไหม</label>
                  <select 
                    className="form-select"
                    value={editFormData.claimType}
                    onChange={(e) => setEditFormData({ ...editFormData, claimType: e.target.value })}
                  >
                    <option value="NORMAL">ยามปกติ (60,000 บาท)</option>
                    <option value="HIGH_RISK">หน้าที่สำคัญ / เสี่ยงภัย (300,000 บาท)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px' }}>ประเภทการสูญเสีย</label>
                  <select 
                    className="form-select"
                    value={editFormData.lossType}
                    onChange={(e) => setEditFormData({ ...editFormData, lossType: e.target.value })}
                  >
                    <option value="DECEASED">ผู้เสียชีวิต</option>
                    <option value="DISABLED">พิการทุพพลภาพ</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '12.5px' }}>
                  {editFormData.lossType === 'DECEASED' ? 'สาเหตุการเสียชีวิต (ตามใบมรณบัตร)' : 'สาเหตุการสูญเสีย / อวัยวะที่สูญเสีย'}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editFormData.lossSpecificCause || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, lossSpecificCause: e.target.value })}
                  placeholder="ระบุสาเหตุตามเอกสารราชการ..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '12.5px' }}>พฤติการณ์เหตุการณ์ (ตามรายงาน กพ.4)</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  value={editFormData.causeOfLoss || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, causeOfLoss: e.target.value })}
                  placeholder="รายละเอียดพฤติการณ์เหตุการณ์..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedClaimForEdit(null)} 
                  className="btn btn-secondary"
                  disabled={savingEdit}
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={savingEdit}
                  style={{ gap: '6px' }}
                >
                  <Save size={16} />
                  <span>{savingEdit ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ยืนยันการลบคำร้อง (Delete Confirmation Modal) */}
      {/* ========================================================================= */}
      {selectedClaimForDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            border: '1px solid var(--ruby-danger)',
            boxShadow: '0 20px 50px rgba(239, 68, 68, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', color: '#f87171', margin: 0 }}>
                  ยืนยันการลบคำร้องนี้?
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  การกระทำนี้จะลบข้อมูลคำร้องและไฟล์แนบทั้งหมดออกจากระบบ
                </div>
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-glass)',
              marginBottom: '20px',
              fontSize: '13.5px'
            }}>
              <div><strong>เลขที่คำร้อง:</strong> <span style={{ color: 'var(--gold-primary)' }}>{selectedClaimForDelete.trackingCode}</span></div>
              <div style={{ marginTop: '4px' }}><strong>ผู้สูญเสีย:</strong> {selectedClaimForDelete.casualtyRank} {selectedClaimForDelete.casualtyFirstName} {selectedClaimForDelete.casualtyLastName}</div>
              <div style={{ marginTop: '4px' }}><strong>สังกัด:</strong> {selectedClaimForDelete.unitName}</div>
              <div style={{ marginTop: '4px' }}><strong>สถานะ:</strong> {CLAIM_STATUS[selectedClaimForDelete.status]?.label || selectedClaimForDelete.status}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setSelectedClaimForDelete(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                ยกเลิก
              </button>
              <button 
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-danger"
                disabled={deleting}
                style={{ gap: '6px' }}
              >
                <Trash2 size={16} />
                <span>{deleting ? 'กำลังลบคำร้อง...' : 'ยืนยันการลบคำร้อง'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
