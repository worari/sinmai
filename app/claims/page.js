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
  FileSpreadsheet,
  FileUp,
  HelpCircle,
  Info,
  RotateCcw
} from 'lucide-react';
import { 
  formatThaiDate, 
  formatCitizenId, 
  REQUIRED_DOCUMENTS, 
  validateAttachmentFile, 
  MILITARY_RANKS, 
  getPersonnelTypeFromRank, 
  getGenderFromRank, 
  validateCitizenId, 
  validateName 
} from '@/lib/thai-utils';
import { CLAIM_STATUS } from '@/lib/constants';
import { triggerStatusPopup } from '@/components/StatusModal';
import SampleDocumentViewer from '@/components/SampleDocumentViewer';
import PaginationBar from '@/components/PaginationBar';
import { getSocketClient } from '@/lib/socket-client';

const CLAIMS_PER_PAGE = 10;

const getClaimDateKey = (claim) => {
  if (!claim) return '';
  const raw = claim.reportDate || claim.createdAt || '';
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const matchesStatusFilter = (claim, filterValue) => {
  if (!claim) return false;
  if (!filterValue || filterValue === 'ALL') return true;
  if (filterValue === 'GROUP_IN_PROGRESS') {
    return ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(claim.status);
  }
  if (filterValue === 'GROUP_APPROVED') {
    return ['APPROVED', 'INSURANCE_PROCESSING', 'DOC_REQUESTED'].includes(claim.status);
  }
  if (filterValue === 'GROUP_PAID') {
    return claim.status === 'PAID' || claim.status === 'SK_NOTIFIED';
  }
  return claim.status === filterValue;
};

const toLocalYMD = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function ClaimsListPage() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  // 4. Import & Export Excel State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [overwriteExistingClaims, setOverwriteExistingClaims] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const readUser = () => {
      const saved = localStorage.getItem('rta_user');
      if (!saved) return null;
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    };

    const handleAuth = () => {
      const user = readUser();
      setCurrentUser(user);
      loadClaims(user);
    };

    handleAuth();
    window.addEventListener('rta_auth_change', handleAuth);

    const socket = getSocketClient();
    const syncLive = () => {
      const u = readUser();
      if (u?.id) loadClaims(u);
    };

    if (socket) {
      socket.on('claim_created', syncLive);
      socket.on('claim_updated', syncLive);
      socket.on('claim_deleted', syncLive);
    }

    return () => {
      window.removeEventListener('rta_auth_change', handleAuth);
      if (socket) {
        socket.off('claim_created', syncLive);
        socket.off('claim_updated', syncLive);
        socket.off('claim_deleted', syncLive);
      }
    };
  }, []);

  const loadClaims = async (user) => {
    setLoading(true);
    setAuthError(false);
    try {
      const u = user || (typeof window !== 'undefined' ? (() => {
        try { return JSON.parse(localStorage.getItem('rta_user')); } catch { return null; }
      })() : null);

      const url = u?.id ? `/api/claims?userId=${encodeURIComponent(u.id)}` : '/api/claims';
      const headers = u?.id ? { 'x-user-id': u.id } : {};
      const res = await fetch(url, { headers });

      if (res.status === 401 || res.status === 403) {
        setAuthError(true);
        setClaims([]);
        setFilteredClaims([]);
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.claims)) {
        setClaims(data.claims);
        setFilteredClaims(data.claims);
      } else {
        setClaims([]);
        setFilteredClaims([]);
      }
    } catch (e) {
      console.error('Error loading claims:', e);
      setClaims([]);
      setFilteredClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = Array.isArray(claims) ? [...claims] : [];

    // Custom Date Range filter (ช่วงวันที่เริ่มต้น - สิ้นสุด แบบ inclusive)
    if (startDate) {
      result = result.filter((c) => {
        if (!c) return false;
        const key = getClaimDateKey(c);
        return key && key >= startDate;
      });
    }
    if (endDate) {
      result = result.filter((c) => {
        if (!c) return false;
        const key = getClaimDateKey(c);
        return key && key <= endDate;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((c) => {
        if (!c) return false;
        const fullName = `${c.casualtyRank || ''} ${c.casualtyFirstName || ''} ${c.casualtyLastName || ''}`.toLowerCase();
        const cause = `${c.causeOfLoss || ''} ${c.lossSpecificCause || ''}`.toLowerCase();
        return (
          (c.trackingCode || '').toLowerCase().includes(q) ||
          (c.casualtyFirstName || '').toLowerCase().includes(q) ||
          (c.casualtyLastName || '').toLowerCase().includes(q) ||
          fullName.includes(q) ||
          (c.casualtyCitizenId || '').includes(q) ||
          (c.unitName || '').toLowerCase().includes(q) ||
          cause.includes(q)
        );
      });
    }

    // Status filter (รองรับทั้งกลุ่มสถานะจากการ์ดสรุปและสถานะรายขั้น)
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => matchesStatusFilter(c, statusFilter));
    }

    // SLA filter
    if (slaFilter !== 'ALL') {
      const now = new Date();
      result = result.filter((c) => {
        if (!c) return false;
        const created = new Date(c.reportDate || c.createdAt);
        const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const remaining = 30 - days;

        if (slaFilter === 'OVERDUE') return remaining <= 0 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID';
        if (slaFilter === 'WARNING') return remaining > 0 && remaining <= 7 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID';
        if (slaFilter === 'NORMAL') return remaining > 7 || c.status === 'PAID' || c.status === 'SK_NOTIFIED';
        return true;
      });
    }

    setFilteredClaims(result);
  }, [searchQuery, statusFilter, slaFilter, startDate, endDate, claims]);

  // รีเซ็ตกลับหน้า 1 เมื่อมีการเปลี่ยนคำค้นหา ช่วงวันที่ หรือตัวกรอง
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, slaFilter, startDate, endDate]);

  const applyDatePreset = (preset) => {
    const today = new Date();
    if (preset === 'CLEAR') {
      setStartDate('');
      setEndDate('');
      return;
    }
    if (preset === 'TODAY') {
      const ymd = toLocalYMD(today);
      setStartDate(ymd);
      setEndDate(ymd);
      return;
    }
    if (preset === 'LAST_7') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      setStartDate(toLocalYMD(start));
      setEndDate(toLocalYMD(today));
      return;
    }
    if (preset === 'LAST_30') {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      setStartDate(toLocalYMD(start));
      setEndDate(toLocalYMD(today));
      return;
    }
    if (preset === 'THIS_MONTH') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(toLocalYMD(start));
      setEndDate(toLocalYMD(today));
      return;
    }
    if (preset === 'THIS_YEAR') {
      const start = new Date(today.getFullYear(), 0, 1);
      setStartDate(toLocalYMD(start));
      setEndDate(toLocalYMD(today));
    }
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSlaFilter('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || statusFilter !== 'ALL' || slaFilter !== 'ALL' || startDate || endDate
  );

  const safeClaims = Array.isArray(claims) ? claims : [];
  const safeFilteredClaims = Array.isArray(filteredClaims) ? filteredClaims : [];
  const totalClaimsCount = safeFilteredClaims.length;
  const filteredCompensationTotal = safeFilteredClaims.reduce(
    (sum, c) => sum + Number(c?.compensationAmount || (c?.claimType === 'HIGH_RISK' ? 300000 : 60000) || 0),
    0
  );
  const totalPages = Math.max(1, Math.ceil(totalClaimsCount / CLAIMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedClaims = safeFilteredClaims.slice(
    (safeCurrentPage - 1) * CLAIMS_PER_PAGE,
    safeCurrentPage * CLAIMS_PER_PAGE
  );

  // Quick Counter Aggregation (อ้างอิงตามช่วงวันที่ที่เลือก เพื่อให้ยอดบนการ์ดตรงกับตาราง 100%)
  const dateScopedClaims = safeClaims.filter((c) => {
    if (!c) return false;
    const key = getClaimDateKey(c);
    if (startDate && (!key || key < startDate)) return false;
    if (endDate && (!key || key > endDate)) return false;
    return true;
  });
  const totalCount = dateScopedClaims.length;
  const draftCount = dateScopedClaims.filter((c) => c && c.status === 'DRAFT').length;
  const inProgressCount = dateScopedClaims.filter((c) => c && matchesStatusFilter(c, 'GROUP_IN_PROGRESS')).length;
  const approvedCount = dateScopedClaims.filter((c) => c && matchesStatusFilter(c, 'GROUP_APPROVED')).length;
  const paidCount = dateScopedClaims.filter((c) => c && matchesStatusFilter(c, 'GROUP_PAID')).length;

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

    if (!validateName(editFormData.casualtyFirstName)) {
      setEditError('ชื่อกำลังพลต้องมีอย่างน้อย 2 ตัวอักษร และต้องไม่มีตัวเลขหรือสัญลักษณ์พิเศษ');
      return;
    }

    if (!validateName(editFormData.casualtyLastName)) {
      setEditError('นามสกุลกำลังพลต้องมีอย่างน้อย 2 ตัวอักษร และต้องไม่มีตัวเลขหรือสัญลักษณ์พิเศษ');
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

  // ==========================================
  // Excel Import & Export Handlers
  // ==========================================

  // ดาวน์โหลดแบบฟอร์มแม่แบบตัวอย่างการนำเข้าข้อมูลคำร้อง
  const handleDownloadTemplate = () => {
    window.open('/api/claims/template', '_blank');
  };

  // เลือกไฟล์นำเข้า
  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setImportError('กรุณาเลือกไฟล์ Excel นามสกุล .xlsx, .xls หรือ .csv เท่านั้น');
      setImportFile(null);
      return;
    }
    setImportFile(file);
    setImportError('');
    setImportPreview(null);
  };

  // อ่านและตรวจสอบข้อมูลคำร้องก่อนบันทึกจริง (Preview)
  const handlePreviewExcel = async (e) => {
    if (e) e.preventDefault();
    if (!importFile) {
      setImportError('กรุณาเลือกไฟล์ Excel ที่ต้องการนำเข้าก่อน');
      return;
    }

    setImportLoading(true);
    setImportError('');

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('preview', 'true');
      formData.append('overwriteExisting', String(overwriteExistingClaims));

      const res = await fetch('/api/claims/import', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่สามารถอ่านไฟล์หรือตรวจสอบข้อมูลคำร้องได้');
      }

      setImportPreview(data);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // ยืนยันบันทึกข้อมูลคำร้องที่นำเข้าลงฐานข้อมูลจริง
  const handleConfirmImport = async () => {
    if (!importPreview?.claims || importPreview.claims.length === 0) return;

    setImportLoading(true);
    setImportError('');

    try {
      const res = await fetch('/api/claims/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claims: importPreview.claims,
          overwriteExisting: overwriteExistingClaims
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลคำร้อง');
      }

      triggerStatusPopup({
        type: 'success',
        title: 'นำเข้าข้อมูลคำร้องสินไหมสำเร็จ',
        message: `ระบบได้นำเข้าข้อมูลคำร้องประวัติเดิมเรียบร้อยแล้ว เพิ่มใหม่ ${data.addedCount} เรื่อง, ปรับปรุง ${data.updatedCount} เรื่อง, ข้าม ${data.skippedCount} เรื่อง (ข้อมูลจะปรากฏในรายงาน Dashboard, สถิติย้อนหลัง และการค้นหาติดตามสิทธิทันที)`
      });

      setIsImportModalOpen(false);
      setImportFile(null);
      setImportPreview(null);
      loadClaims(currentUser);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // ส่งออกรายการคำร้องเป็นไฟล์ Excel (.xlsx) ตามตัวกรองปัจจุบัน (รวมช่วงวันที่และกลุ่มสถานะ)
  const handleExportExcel = () => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (slaFilter !== 'ALL') params.set('sla', slaFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      window.open(`/api/claims/export?${params.toString()}`, '_blank');
      setTimeout(() => setExportLoading(false), 1500);
    } catch (err) {
      setExportLoading(false);
    }
  };

  const isInProgressSelected =
    statusFilter === 'GROUP_IN_PROGRESS' ||
    ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(statusFilter);
  const isApprovedSelected =
    statusFilter === 'GROUP_APPROVED' ||
    ['APPROVED', 'INSURANCE_PROCESSING', 'DOC_REQUESTED'].includes(statusFilter);
  const isPaidSelected =
    statusFilter === 'GROUP_PAID' ||
    ['PAID', 'SK_NOTIFIED'].includes(statusFilter);

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      
      {/* Header & Scoping Notice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span>รายการคำร้องเสนอขอรับสิทธิเงินค่าสินไหมทดแทน</span>
            {currentUser?.role === 'UNIT_OFFICER' ? (
              <span className="badge badge-amber" style={{ fontSize: '12px' }}>
                เฉพาะสังกัด: {currentUser?.unitName || 'หน่วยสังกัด'}
              </span>
            ) : (
              <span className="badge badge-blue" style={{ fontSize: '12px' }}>
                มุมมองส่วนกลาง (ทุกหน่วยทั่วประเทศ)
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            จัดการข้อมูลคำร้องครบวงจร (CRUD) • จัดการไฟล์เอกสารแนบ 12 รายการ • นำเข้า/ส่งออก Excel สำหรับ Dashboard และรายงานย้อนหลัง
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => loadClaims(currentUser)} 
            className="btn btn-secondary btn-sm"
            title="รีเฟรชข้อมูลคำร้องล่าสุด"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={14} />
            <span>รีเฟรช</span>
          </button>

          <button
            onClick={() => {
              setIsImportModalOpen(true);
              setImportPreview(null);
              setImportFile(null);
              setImportError('');
            }}
            className="btn btn-secondary btn-sm"
            title="นำเข้าข้อมูลคำร้องประวัติเดิมจากไฟล์ Excel เพื่อใช้ในรายงาน Dashboard สถิติ และการติดตามสิทธิ"
            style={{ gap: '6px', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#38bdf8' }}
          >
            <Upload size={14} color="#38bdf8" />
            <span>นำเข้า Excel (Import)</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exportLoading}
            className="btn btn-secondary btn-sm"
            title="ส่งออกรายการคำร้องเป็นไฟล์ Excel (.xlsx) ตามตัวกรองปัจจุบัน"
            style={{ gap: '6px', borderColor: 'rgba(212, 175, 55, 0.4)', color: 'var(--gold-light)' }}
          >
            <FileSpreadsheet size={14} color="var(--gold-primary)" />
            <span>{exportLoading ? 'กำลังส่งออก...' : 'ส่งออก Excel (Export)'}</span>
          </button>

          <Link href="/submit" className="btn btn-primary btn-sm" style={{ gap: '6px', padding: '7px 16px' }}>
            <Plus size={15} />
            <span>+ ยื่นเสนอเรื่องใหม่</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Pills (Clickable Quick Filters - ซิงค์กับช่วงวันที่และแสดงครบตามยอดจำนวน) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            padding: '12px 16px',
            borderRadius: '10px',
            background: statusFilter === 'ALL' ? 'rgba(59, 130, 246, 0.22)' : 'rgba(255, 255, 255, 0.03)',
            border: `${statusFilter === 'ALL' ? '1.5px' : '1px'} solid ${statusFilter === 'ALL' ? '#60a5fa' : 'var(--border-glass)'}`,
            boxShadow: statusFilter === 'ALL' ? '0 0 0 1px rgba(59, 130, 246, 0.35)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', color: statusFilter === 'ALL' ? '#bfdbfe' : 'var(--text-dim)', fontWeight: 600 }}>คำร้องทั้งหมด</div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: '#fff' }}>
              {totalCount.toLocaleString('th-TH')} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-dim)' }}>เรื่อง</span>
            </div>
          </div>
          <FileText size={22} color="#60a5fa" />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'DRAFT' ? 'ALL' : 'DRAFT')}
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            padding: '12px 16px',
            borderRadius: '10px',
            background: statusFilter === 'DRAFT' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255, 255, 255, 0.03)',
            border: `${statusFilter === 'DRAFT' ? '1.5px' : '1px'} solid ${statusFilter === 'DRAFT' ? '#fbbf24' : 'var(--border-glass)'}`,
            boxShadow: statusFilter === 'DRAFT' ? '0 0 0 1px rgba(245, 158, 11, 0.35)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', color: '#fbbf24', fontWeight: 600 }}>📝 แบบร่าง (รอเอกสาร)</div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: '#fbbf24' }}>
              {draftCount.toLocaleString('th-TH')} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span>
            </div>
          </div>
          <Edit3 size={22} color="#fbbf24" />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'GROUP_IN_PROGRESS' ? 'ALL' : 'GROUP_IN_PROGRESS')}
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            padding: '12px 16px',
            borderRadius: '10px',
            background: isInProgressSelected ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255, 255, 255, 0.03)',
            border: `${isInProgressSelected ? '1.5px' : '1px'} solid ${isInProgressSelected ? '#c084fc' : 'var(--border-glass)'}`,
            boxShadow: isInProgressSelected ? '0 0 0 1px rgba(168, 85, 247, 0.35)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', color: '#c084fc', fontWeight: 600 }}>⏳ กำลังดำเนินการ</div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: '#c084fc' }}>
              {inProgressCount.toLocaleString('th-TH')} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span>
            </div>
          </div>
          <Clock size={22} color="#c084fc" />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'GROUP_APPROVED' ? 'ALL' : 'GROUP_APPROVED')}
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            padding: '12px 16px',
            borderRadius: '10px',
            background: isApprovedSelected ? 'rgba(6, 182, 212, 0.22)' : 'rgba(255, 255, 255, 0.03)',
            border: `${isApprovedSelected ? '1.5px' : '1px'} solid ${isApprovedSelected ? '#22d3ee' : 'var(--border-glass)'}`,
            boxShadow: isApprovedSelected ? '0 0 0 1px rgba(6, 182, 212, 0.35)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', color: '#22d3ee', fontWeight: 600 }}>🎖️ อนุมัติ จก.กพ.ทบ.</div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: '#22d3ee' }}>
              {approvedCount.toLocaleString('th-TH')} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span>
            </div>
          </div>
          <Shield size={22} color="#22d3ee" />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'GROUP_PAID' ? 'ALL' : 'GROUP_PAID')}
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            padding: '12px 16px',
            borderRadius: '10px',
            background: isPaidSelected ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.03)',
            border: `${isPaidSelected ? '1.5px' : '1px'} solid ${isPaidSelected ? '#34d399' : 'var(--border-glass)'}`,
            boxShadow: isPaidSelected ? '0 0 0 1px rgba(16, 185, 129, 0.35)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', color: '#34d399', fontWeight: 600 }}>💳 จ่ายโอนเงินแล้ว</div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: '#34d399' }}>
              {paidCount.toLocaleString('th-TH')} <span style={{ fontSize: '12px', fontWeight: 400 }}>เรื่อง</span>
            </div>
          </div>
          <CheckCircle2 size={22} color="#34d399" />
        </button>
      </div>

      {/* Filter, Custom Date Range and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Row 1: Search, Status, SLA */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', paddingRight: searchQuery ? '34px' : '12px' }}
              placeholder="ค้นหา: เลขที่เรื่อง, ชื่อผู้สูญเสีย, เลข ปชช., หน่วย, สาเหตุ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title="ล้างคำค้นหา"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Workflow Status Filter */}
          <div style={{ minWidth: '240px', flex: '0 1 280px' }}>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <optgroup label="กลุ่มสถานะหลัก (ตามการ์ดสรุป)">
                <option value="GROUP_IN_PROGRESS">⏳ กำลังดำเนินการทั้งหมด ({inProgressCount.toLocaleString('th-TH')} เรื่อง)</option>
                <option value="GROUP_APPROVED">🎖️ อนุมัติ จก.กพ.ทบ. ทั้งหมด ({approvedCount.toLocaleString('th-TH')} เรื่อง)</option>
                <option value="GROUP_PAID">💳 จ่ายโอนเงินแล้วทั้งหมด ({paidCount.toLocaleString('th-TH')} เรื่อง)</option>
              </optgroup>
              <optgroup label="แยกตามขั้นตอนรายสถานะ">
                <option value="DRAFT">📝 ร่างคำร้อง (รอแนบเอกสาร)</option>
                <option value="SUBMITTED">1. เสนอเรื่องใหม่</option>
                <option value="UNDER_REVIEW">2. กสพ. กำลังตรวจเอกสาร</option>
                <option value="REJECTED_BY_KSP">ตีกลับให้หน่วยแก้ไข</option>
                <option value="PENDING_APPROVAL">3. รอ จก.กพ.ทบ. อนุมัติ</option>
                <option value="APPROVED">อนุมัติแล้ว</option>
                <option value="INSURANCE_PROCESSING">4. บ.ประกันภัย กำลังตรวจ</option>
                <option value="DOC_REQUESTED">บ.ประกันภัย ขอเอกสารเพิ่ม</option>
                <option value="PAID">โอนเงินสินไหมแล้ว</option>
                <option value="SK_NOTIFIED">5. สก.ทบ. รับทราบยอด (ปิดเรื่อง)</option>
              </optgroup>
            </select>
          </div>

          {/* SLA Filter */}
          <div style={{ minWidth: '185px' }}>
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

        {/* Row 2: Custom Date Range Selector (เลือกช่วงวันที่เริ่มต้น - วันที่สิ้นสุด ตามห้วงกำหนดเอง) */}
        <div style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px', flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-light)', fontSize: '13px', fontWeight: 600, paddingBottom: '10px' }}>
              <Calendar size={16} color="var(--gold-primary)" />
              <span>เลือกช่วงวันที่ดูข้อมูล:</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '165px' }}>
              <label htmlFor="claims-start-date" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                วันที่เริ่มต้น {startDate && <strong style={{ color: 'var(--gold-light)' }}>({formatThaiDate(startDate, true)})</strong>}
              </label>
              <input
                id="claims-start-date"
                type="date"
                className="form-input"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '7px 10px', fontSize: '13px', colorScheme: 'dark' }}
              />
            </div>

            <div style={{ color: 'var(--text-dim)', fontSize: '13px', paddingBottom: '10px', fontWeight: 600 }}>ถึง</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '165px' }}>
              <label htmlFor="claims-end-date" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                วันที่สิ้นสุด {endDate && <strong style={{ color: 'var(--gold-light)' }}>({formatThaiDate(endDate, true)})</strong>}
              </label>
              <input
                id="claims-end-date"
                type="date"
                className="form-input"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '7px 10px', fontSize: '13px', colorScheme: 'dark' }}
              />
            </div>

            {/* Quick Date Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingBottom: '2px' }}>
              {[
                { key: 'TODAY', label: 'วันนี้' },
                { key: 'LAST_7', label: '7 วันล่าสุด' },
                { key: 'LAST_30', label: '30 วันล่าสุด' },
                { key: 'THIS_MONTH', label: 'เดือนนี้' },
                { key: 'THIS_YEAR', label: 'ปีนี้' }
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyDatePreset(preset.key)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '5px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                >
                  {preset.label}
                </button>
              ))}
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => applyDatePreset('CLEAR')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '5px 10px', fontSize: '11.5px', borderRadius: '6px', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.35)' }}
                >
                  <X size={12} /> ล้างวันที่
                </button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="btn btn-secondary btn-sm"
              style={{ gap: '5px', fontSize: '12px', color: 'var(--gold-light)', borderColor: 'rgba(212, 175, 55, 0.4)' }}
            >
              <RotateCcw size={13} />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>

        {/* Active Filter Summary Banner */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.025)',
          border: '1px solid var(--border-glass)',
          fontSize: '12.5px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <span>
              แสดงผล <strong style={{ color: '#fff' }}>{totalClaimsCount.toLocaleString('th-TH')}</strong> เรื่อง
              {hasActiveFilters && <> (จากข้อมูลทั้งหมด {claims.length.toLocaleString('th-TH')} เรื่อง)</>}
            </span>
            <span>•</span>
            <span>
              วงเงินรวมที่แสดง: <strong style={{ color: 'var(--gold-light)' }}>{filteredCompensationTotal.toLocaleString('th-TH')} บาท</strong>
            </span>
          </div>
          {(startDate || endDate) && (
            <span className="badge badge-amber" style={{ fontSize: '11.5px' }}>
              ห้วงวันที่: {startDate ? formatThaiDate(startDate, true) : 'เริ่มต้น'} – {endDate ? formatThaiDate(endDate, true) : 'ปัจจุบัน'}
            </span>
          )}
        </div>
      </div>

      {/* Claims List Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>กำลังโหลดรายการคำร้อง...</div>
        ) : authError ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '520px', margin: '0 auto' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--ruby-danger)'
            }}>
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
              เซสชันหมดอายุหรือไม่พบสิทธิ์เข้าถึง (401 Unauthorized)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '22px' }}>
              กรุณาเข้าสู่ระบบใหม่เพื่อยืนยันตัวตนเจ้าหน้าที่ ทบ. และเข้าถึงข้อมูลคำร้องสินไหมตามบทบาทหน้าที่
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => loadClaims(currentUser)} 
                className="btn btn-secondary"
                style={{ gap: '6px' }}
              >
                <RefreshCw size={14} />
                <span>ลองใหม่อีกครั้ง</span>
              </button>
              <Link href="/login?redirect=/claims" className="btn btn-primary" style={{ gap: '6px' }}>
                <Shield size={15} />
                <span>เข้าสู่ระบบสำหรับเจ้าหน้าที่ ทบ.</span>
              </Link>
            </div>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
            <FileText size={42} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div>ไม่พบข้อมูลคำร้องตามเงื่อนไขที่ค้นหา</div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '12px', gap: '6px' }}
              >
                <RotateCcw size={13} />
                <span>ล้างตัวกรองเพื่อดูข้อมูลทั้งหมด</span>
              </button>
            )}
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
                {paginatedClaims.map((claim) => {
                  if (!claim) return null;
                  const createdTime = new Date(claim.reportDate || claim.createdAt).getTime();
                  const daysDiff = !isNaN(createdTime) ? Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24)) : 0;
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
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatThaiDate(claim.reportDate || claim.createdAt, true)}
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
                            background: uploadedDocsCount >= 12 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: uploadedDocsCount >= 12 ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-glass)',
                            color: uploadedDocsCount >= 12 ? '#34d399' : 'var(--text-main)'
                          }}
                          title="กดเพื่อเปิดหน้าต่างจัดการเอกสาร 12 รายการ แนบไฟล์/พรีวิว/ดาวน์โหลด"
                        >
                          <FolderOpen size={14} color={uploadedDocsCount >= 12 ? '#34d399' : '#fbbf24'} />
                          <span>{uploadedDocsCount}/12 เอกสาร</span>
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
                            title="จัดการเอกสาร 12 รายการ (แนบ/แทนที่/ลบ)"
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

        {/* Pagination Controls (หน้าแรก / ก่อนหน้า / เลขหน้า / หน้าถัดไป / หน้าสุดท้าย • 10 แถวต่อหน้า) */}
        {!loading && totalClaimsCount > 0 && (
          <PaginationBar
            currentPage={safeCurrentPage}
            totalItems={totalClaimsCount}
            itemsPerPage={CLAIMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: จัดการเอกสารคำร้อง 12 รายการ (Manage Documents Modal) */}
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
                    จัดการเอกสารหลักฐาน 12 รายการ: {selectedClaimForDocs.trackingCode}
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
                  แนบแล้ว <strong>{(selectedClaimForDocs.documents || []).filter(d => d.uploaded).length}</strong> จากทั้งหมด 12 รายการ (จำกัดไฟล์ละไม่เกิน 10MB • ป้องกันไฟล์ไม่ปลอดภัย)
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

      {/* ========================================================================= */}
      {/* 4. Modal นำเข้าข้อมูลคำร้องสินไหมจากไฟล์ Excel (Import Excel / Legacy DB) */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
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
            border: '1px solid var(--border-glass)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--cyan-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Upload size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>
                    นำเข้าข้อมูลคำร้องสินไหม (Import Excel / Legacy Database)
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    นำเข้าข้อมูลประวัติคำร้องเดิมเพื่อใช้ใน Dashboard สถิติ/รายงานย้อนหลัง และการติดตามสิทธิ
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setImportPreview(null);
                  setImportError('');
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              
              {/* Banner แนะนำและปุ่มดาวน์โหลด Template */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={20} color="var(--gold-primary)" />
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    <strong>ต้องการแบบฟอร์มตัวอย่าง?</strong> สามารถดาวน์โหลดไฟล์ Excel แม่แบบที่มีคอลัมน์มาตรฐานครบ 24 คอลัมน์ พร้อมตัวอย่างข้อมูลย้อนหลัง 5 เรื่อง
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', borderColor: 'var(--gold-primary)', color: 'var(--gold-light)' }}
                >
                  <Download size={14} color="var(--gold-primary)" />
                  <span>ดาวน์โหลดแบบฟอร์มตัวอย่าง (.xlsx)</span>
                </button>
              </div>

              {/* Form เลือกไฟล์ & ตัวเลือก Overwrite */}
              {!importPreview ? (
                <form onSubmit={handlePreviewExcel}>
                  <div style={{
                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    marginBottom: '20px'
                  }}>
                    <FileUp size={44} color="var(--cyan-accent)" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                      เลือกไฟล์ Excel หรือ CSV (.xlsx, .xls, .csv)
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      รองรับคอลัมน์: เลขที่คำร้อง, วันที่รายงาน, วันที่สูญเสีย, เลข ปชช. 13 หลัก, ยศ, ชื่อ, นามสกุล, สังกัด, ประเภทสินไหม, ยอดเงิน, สถานะ
                    </div>

                    <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv"
                      onChange={handleImportFileChange}
                      style={{ display: 'none' }}
                      id="claims-excel-file-upload-input"
                    />
                    
                    <label 
                      htmlFor="claims-excel-file-upload-input"
                      className="btn btn-secondary"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 24px' }}
                    >
                      <Upload size={16} />
                      <span>{importFile ? 'เปลี่ยนไฟล์ที่เลือก' : 'คลิกเพื่อเลือกไฟล์จากเครื่อง'}</span>
                    </label>

                    {importFile && (
                      <div style={{ marginTop: '14px', fontSize: '13px', color: '#6ee7b7' }}>
                        ✓ เลือกไฟล์: <strong>{importFile.name}</strong> ({(importFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>

                  {/* ตัวเลือก Overwrite */}
                  <div style={{ marginBottom: '22px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13.5px' }}>
                      <input 
                        type="checkbox"
                        checked={overwriteExistingClaims}
                        onChange={(e) => setOverwriteExistingClaims(e.target.checked)}
                        style={{ width: '17px', height: '17px', accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
                      />
                      <span>
                        <strong>อัปเดตข้อมูลหากมีเลขที่คำร้อง (Tracking Code) หรือเลขประจำตัวประชาชนเดิมในระบบแล้ว (Overwrite/Update existing)</strong>
                        <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          หากพบเลขที่คำร้องเดิม ระบบจะอัปเดตรายละเอียด สถานะ และยอดเงินสินไหมให้เป็นข้อมูลล่าสุด
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* Error message */}
                  {importError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={18} />
                      <span>{importError}</span>
                    </div>
                  )}

                  {/* ปุ่มล่าง */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      className="btn btn-secondary"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                      disabled={importLoading || !importFile}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '170px', justifyContent: 'center' }}
                    >
                      {importLoading ? 'กำลังอ่านและตรวจสอบไฟล์...' : 'ตรวจสอบและดูตัวอย่าง (Preview)'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Preview Mode */
                <div>
                  {/* KPI Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <div className="glass-panel" style={{ padding: '12px 16px', borderLeft: '3px solid var(--cyan-accent)' }}>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>แถวทั้งหมดในไฟล์</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {importPreview.totalRows || importPreview.claims?.length || 0} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>แถว</span>
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '12px 16px', borderLeft: '3px solid var(--emerald-success)' }}>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>พร้อมนำเข้า (ผ่านเกณฑ์)</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#6ee7b7', marginTop: '2px' }}>
                        {importPreview.validCount || importPreview.claims?.length || 0} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>เรื่อง</span>
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '12px 16px', borderLeft: `3px solid ${(importPreview.errors?.length || 0) > 0 ? 'var(--ruby-danger)' : 'var(--gold-primary)'}` }}>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>ข้อผิดพลาด / คำเตือน</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: (importPreview.errors?.length || 0) > 0 ? '#fca5a5' : 'var(--gold-light)', marginTop: '2px' }}>
                        {importPreview.errors?.length || 0} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>ผิดพลาด / {importPreview.warnings?.length || 0} คำเตือน</span>
                      </div>
                    </div>
                  </div>

                  {/* Errors List */}
                  {importPreview.errors && importPreview.errors.length > 0 && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.14)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#fca5a5', fontSize: '12.5px' }}>
                      <div style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={16} />
                        <span>พบข้อผิดพลาดที่ไม่สามารถนำเข้าได้ ({importPreview.errors.length} รายการ):</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {importPreview.errors.slice(0, 8).map((err, idx) => (
                          <li key={idx} style={{ marginTop: '2px' }}>
                            แถวที่ {err.row}: {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings List */}
                  {importPreview.warnings && importPreview.warnings.length > 0 && (
                    <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: 'var(--gold-light)', fontSize: '12.5px' }}>
                      <div style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Info size={16} />
                        <span>คำแนะนำและข้อสังเกต ({importPreview.warnings.length} รายการ):</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {importPreview.warnings.slice(0, 5).map((w, idx) => (
                          <li key={idx} style={{ marginTop: '2px' }}>
                            แถวที่ {w.row}: {w.message}
                          </li>
                        ))}
                        {importPreview.warnings.length > 5 && (
                          <li style={{ marginTop: '2px', color: 'var(--text-dim)' }}>
                            ...และอีก {importPreview.warnings.length - 5} รายการ
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>ตัวอย่างข้อมูลคำร้อง ({Math.min(importPreview.claims?.length || 0, 15)} รายการแรก)</span>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>ไฟล์: {importPreview.fileName}</span>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px', maxHeight: '320px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-glass)' }}>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>ลำดับ</th>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>เลขที่คำร้อง</th>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>วันที่รายงาน</th>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>ผู้สูญเสีย</th>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>เลข ปชช.</th>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>สังกัด</th>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>ประเภทสินไหม</th>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>ยอดเงิน (บ.)</th>
                            <th style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.claims?.slice(0, 15).map((c, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                              <td style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>{idx + 1}</td>
                              <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--gold-primary)' }}>{c.trackingCode}</td>
                              <td style={{ padding: '8px 10px' }}>{c.reportDate || '-'}</td>
                              <td style={{ padding: '8px 10px', color: '#fff', fontWeight: 500 }}>{c.casualtyRank} {c.casualtyFirstName} {c.casualtyLastName}</td>
                              <td style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>{c.casualtyCitizenId ? formatCitizenId(c.casualtyCitizenId) : '-'}</td>
                              <td style={{ padding: '8px 10px' }}>{c.unitName}</td>
                              <td style={{ padding: '8px 10px' }}>
                                <span className={`badge ${c.claimType === 'HIGH_RISK' ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: '10px' }}>
                                  {c.claimType === 'HIGH_RISK' ? 'เสี่ยงภัย' : 'ยามปกติ'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', fontWeight: 600, color: '#38bdf8' }}>
                                {Number(c.compensationAmount || 0).toLocaleString()}
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                <span className={`badge ${c.status === 'PAID' ? 'badge-emerald' : c.status === 'APPROVED' ? 'badge-amber' : 'badge-slate'}`} style={{ fontSize: '10px' }}>
                                  {CLAIM_STATUS[c.status]?.label || c.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setImportPreview(null);
                        setImportError('');
                      }}
                      className="btn btn-secondary"
                      disabled={importLoading}
                    >
                      ← เลือกไฟล์อื่น / ย้อนกลับ
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(false)}
                        className="btn btn-secondary"
                        disabled={importLoading}
                      >
                        ยกเลิก
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        className="btn btn-primary"
                        disabled={importLoading || !importPreview.claims || importPreview.claims.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '180px', justifyContent: 'center' }}
                      >
                        <Check size={16} />
                        <span>{importLoading ? 'กำลังบันทึกลงฐานข้อมูล...' : `ยืนยันนำเข้า (${importPreview.claims?.length || 0} เรื่อง)`}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
