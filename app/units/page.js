// app/units/page.js
'use client';

import { useState, useEffect, Fragment } from 'react';
import { 
  Building2, 
  GitFork, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Layers, 
  MapPin, 
  ChevronRight, 
  ChevronDown, 
  Shield, 
  FolderTree, 
  List, 
  ExternalLink, 
  Info,
  PhoneCall,
  Phone,
  Navigation,
  Compass,
  Check,
  Map,
  FileSpreadsheet,
  Download,
  Upload,
  FileUp,
  X,
  HelpCircle,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  Table,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { ARMY_LEVELS } from '@/lib/military-units';
import { triggerStatusPopup } from '@/components/StatusModal';

// พิกัดค่ายทหารหลักของกองทัพบก สำหรับกดเลือกปักหมุดด่วน
const RTA_CAMP_PRESETS = [
  { name: 'บก.ทบ. (พระนคร, กทม.)', province: 'กรุงเทพมหานคร', locationName: 'บก.ทบ. ถ.ราชดำเนินนอก', lat: 13.7651, lng: 100.5085, rtaPhone: '91001' },
  { name: 'ค่ายพรหมโยธี (พล.ร.2 รอ. ปราจีนบุรี)', province: 'ปราจีนบุรี', locationName: 'ค่ายพรหมโยธี ต.บ้านพระ', lat: 14.0509, lng: 101.3718, rtaPhone: '54001' },
  { name: 'ค่ายสุรสีห์ (พล.ร.9 กาญจนบุรี)', province: 'กาญจนบุรี', locationName: 'ค่ายสุรสีห์ ต.ลาดหญ้า', lat: 14.0228, lng: 99.5328, rtaPhone: '59001' },
  { name: 'ค่ายสุรนารี (ทภ.2 นครราชสีมา)', province: 'นครราชสีมา', locationName: 'ค่ายสุรนารี ต.หนองไผ่ล้อม', lat: 14.9738, lng: 102.0837, rtaPhone: '92001' },
  { name: 'ค่ายสมเด็จพระนเรศวรมหาราช (ทภ.3 พิษณุโลก)', province: 'พิษณุโลก', locationName: 'ค่ายสมเด็จพระนเรศวรมหาราช', lat: 16.8211, lng: 100.2659, rtaPhone: '93001' },
  { name: 'ค่ายกาวิละ (มทบ.33 เชียงใหม่)', province: 'เชียงใหม่', locationName: 'ค่ายกาวิละ ต.วัดเกต', lat: 18.7883, lng: 99.0061, rtaPhone: '73001' },
  { name: 'ค่ายวชิราวุธ (ทภ.4 นครศรีธรรมราช)', province: 'นครศรีธรรมราช', locationName: 'ค่ายวชิราวุธ ต.ปากพูน', lat: 8.4304, lng: 99.9631, rtaPhone: '94001' },
  { name: 'ค่ายอิงคยุทธบริหาร (ปัตตานี)', province: 'ปัตตานี', locationName: 'ค่ายอิงคยุทธบริหาร ต.บ่อทอง', lat: 6.7533, lng: 101.1764, rtaPhone: '54201' },
  { name: 'ค่ายสิรินธร (ยะลา)', province: 'ยะลา', locationName: 'ค่ายสิรินธร ต.เขาตูม', lat: 6.6833, lng: 101.3167, rtaPhone: '54301' },
  { name: 'ค่ายกัลยาณิวัฒนา (นราธิวาส)', province: 'นราธิวาส', locationName: 'ค่ายกัลยาณิวัฒนา ต.กะลุวอ', lat: 6.4255, lng: 101.8253, rtaPhone: '54401' },
  { name: 'ค่ายสมเด็จพระนารายณ์มหาราช (นสศ. ลพบุรี)', province: 'ลพบุรี', locationName: 'ค่ายสมเด็จพระนารายณ์มหาราช', lat: 14.7995, lng: 100.6534, rtaPhone: '95001' },
  { name: 'บก.นปอ. (ดอนเมือง, กทม.)', province: 'กรุงเทพมหานคร', locationName: 'บก.นปอ. แขวงสีกัน ดอนเมือง', lat: 13.8821, lng: 100.5902, rtaPhone: '96001' }
];

export default function MilitaryUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, 1, 2, 3, TREE
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [modalForm, setModalForm] = useState({
    id: '',
    level: 2,
    parentId: '',
    code: '',
    shortName: '',
    name: '',
    province: 'กรุงเทพมหานคร',
    locationName: '',
    lat: 13.7651,
    lng: 100.5085,
    address: '',
    rtaPhone: '', // โทร.ทบ. 5 หลัก
    phone: '',    // เบอร์โทรศัพท์ทั่วไป
    type: 'REGULAR',
    status: 'ACTIVE'
  });
  const [saving, setSaving] = useState(false);

  // Excel Import / Export State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importSaving, setImportSaving] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [exporting, setExporting] = useState(false);

  // View Mode & Pagination State (Default to Data Table)
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' (default) or 'CARDS'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState('level'); // 'level', 'code', 'name', 'province', 'rtaPhone'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // Expanded nodes for Tree View
  const [expandedNodes, setExpandedNodes] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkUserAndLoad = () => {
      const saved = localStorage.getItem('rta_user');
      let u = null;
      if (saved) {
        try {
          u = JSON.parse(saved);
        } catch (e) {}
      }
      setCurrentUser(u);
      setAuthChecked(true);

      if (u && u.role === 'ADMIN') {
        loadUnits();
      } else {
        setLoading(false);
      }
    };

    checkUserAndLoad();
    window.addEventListener('rta_auth_change', checkUserAndLoad);
    return () => window.removeEventListener('rta_auth_change', checkUserAndLoad);
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/units');
      const data = await res.json();
      if (data.success && Array.isArray(data.units)) {
        setUnits(data.units);
      }
    } catch (e) {
      setErrorMsg('เกิดข้อผิดพลาดในการโหลดข้อมูลโครงสร้างหน่วย: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (defaultLevel = 2, defaultParentId = '') => {
    setEditingUnit(null);
    setShowMapPicker(false);
    setModalForm({
      id: '',
      level: defaultLevel,
      parentId: defaultParentId || (defaultLevel === 2 ? '1st_ARMY' : defaultLevel === 3 ? '2nd_INF_DIV' : ''),
      code: '',
      shortName: '',
      name: '',
      province: 'กรุงเทพมหานคร',
      locationName: 'บก.ทบ. ถ.ราชดำเนินนอก',
      lat: 13.7651,
      lng: 100.5085,
      address: '',
      rtaPhone: '97000',
      phone: '',
      type: 'REGULAR',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleOpenEditModal = (unit) => {
    setEditingUnit(unit);
    setShowMapPicker(false);
    setModalForm({
      id: unit.id,
      level: unit.level,
      parentId: unit.parentId || '',
      code: unit.code || unit.shortName || '',
      shortName: unit.shortName || '',
      name: unit.name || '',
      province: unit.province || 'กรุงเทพมหานคร',
      locationName: unit.locationName || '',
      lat: unit.lat || 13.7651,
      lng: unit.lng || 100.5085,
      address: unit.address || '',
      rtaPhone: unit.rtaPhone || '',
      phone: unit.phone || '',
      type: unit.type || 'REGULAR',
      status: unit.status || 'ACTIVE'
    });
    setIsModalOpen(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSelectPresetCamp = (preset) => {
    setModalForm((prev) => ({
      ...prev,
      province: preset.province,
      locationName: preset.locationName,
      lat: preset.lat,
      lng: preset.lng,
      address: `${preset.locationName} จ.${preset.province}`,
      rtaPhone: prev.rtaPhone || preset.rtaPhone
    }));
  };

  const handleReverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'th,en' }
      });
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const prov = addr.province || addr.state || addr.city || '';
        const cleanProv = prov.replace('จังหวัด', '').trim();
        const district = addr.county || addr.district || '';
        const subdistrict = addr.subdistrict || addr.suburb || addr.town || addr.village || '';

        setModalForm((prev) => ({
          ...prev,
          province: cleanProv || prev.province,
          address: data.display_name || prev.address,
          locationName: prev.locationName || `บริเวณ ${subdistrict} ${district}`.trim()
        }));
      }
    } catch (e) {
      console.log('Reverse geocode fallback', e);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // ตรวจสอบเบอร์โทร.ทบ. 5 หลัก (ถ้ากรอก)
    if (modalForm.rtaPhone && modalForm.rtaPhone.length !== 5) {
      setErrorMsg('เบอร์ติดต่อหน่วย โทร.ทบ. ต้องเป็นตัวเลข 5 หลัก พอดี (เช่น 97123 หรือ 54001)');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...modalForm,
        level: parseInt(modalForm.level, 10),
        code: modalForm.code || modalForm.shortName,
        shortName: modalForm.shortName || modalForm.code,
        rtaPhone: modalForm.rtaPhone ? String(modalForm.rtaPhone).replace(/\D/g, '').slice(0, 5) : '',
        lat: modalForm.lat ? parseFloat(modalForm.lat) : null,
        lng: modalForm.lng ? parseFloat(modalForm.lng) : null,
        userId: currentUser?.id
      };

      const url = '/api/units';
      const method = editingUnit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      setSuccessMsg(resData.message || 'บันทึกโครงสร้างหน่วยสำเร็จ');
      setIsModalOpen(false);
      loadUnits();

      // แจ้งเตือน Popup Modal ยืนยันการบันทึกหน่วย
      triggerStatusPopup({
        type: 'success',
        title: editingUnit ? 'แก้ไขข้อมูลหน่วยสำเร็จ' : 'เพิ่มหน่วยใหม่ในโครงสร้างสำเร็จ',
        message: `ระบบได้บันทึก "${payload.name}" (${payload.shortName}) ระดับ ${ARMY_LEVELS[payload.level]?.label || 'หน่วย'} ในสายการบังคับบัญชาเรียบร้อยแล้ว`,
        casualtyName: payload.name,
        action: editingUnit ? 'ปรับปรุงข้อมูลหน่วย' : 'เพิ่มหน่วยใหม่ในสายการบังคับบัญชา',
        by: 'ผู้ดูแลระบบโครงสร้างหน่วย (Admin)',
        ref: payload.rtaPhone ? `โทร.ทบ. ${payload.rtaPhone}` : undefined,
        comment: payload.locationName ? `ที่ตั้ง: ${payload.locationName} (${payload.province})` : undefined
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUnit = async (unit) => {
    if (!confirm(`ยืนยันการลบหน่วย "${unit.name}" (${unit.shortName}) ออกจากโครงสร้าง?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/units?id=${unit.id}&userId=${currentUser?.id || ''}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ลบหน่วยไม่สำเร็จ');
      }
      setSuccessMsg(data.message || 'ลบหน่วยเรียบร้อยแล้ว');
      loadUnits();

      // แจ้งเตือน Popup Modal การลบหน่วย
      triggerStatusPopup({
        type: 'warning',
        title: 'ลบหน่วยออกจากระบบเรียบร้อย',
        message: `หน่วย "${unit.name}" (${unit.shortName}) ถูกลบออกจากโครงสร้างสายการบังคับบัญชาแล้ว`,
        casualtyName: unit.name,
        action: 'ลบหน่วยออกจากสายการบังคับบัญชา',
        by: 'ผู้ดูแลระบบ (Admin)'
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('ยืนยันการรีเซ็ตโครงสร้างหน่วยทั้งหมดเป็นโครงสร้างมาตรฐานกองทัพบก? ข้อมูลที่เพิ่มเองอาจถูกล้าง')) {
      return;
    }

    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_DEFAULT', userId: currentUser?.id })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setSuccessMsg(data.message);
      loadUnits();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ดาวน์โหลดไฟล์แบบฟอร์มตัวอย่าง Excel
  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/api/units/template';
    link.download = 'rta_units_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ส่งออกข้อมูลโครงสร้างหน่วยเป็นไฟล์ Excel
  const handleExportExcel = async () => {
    setExporting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/units/export');
      if (!res.ok) {
        throw new Error('ไม่สามารถส่งออกข้อมูล Excel ได้ (HTTP ' + res.status + ')');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.download = `rta_military_units_${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`ส่งออกข้อมูลโครงสร้างหน่วย (${units.length} หน่วย) เป็นไฟล์ Excel เรียบร้อยแล้ว`);
    } catch (e) {
      setErrorMsg('เกิดข้อผิดพลาดในการส่งออก Excel: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  // เปิดหน้าต่างนำเข้า Excel
  const handleOpenImportModal = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportError('');
    setOverwriteExisting(true);
    setIsImportModalOpen(true);
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
    setImportPreview(null);
    setImportError('');
  };

  // ตรวจสอบและแสดงตัวอย่างข้อมูลจากไฟล์ Excel
  const handlePreviewExcel = async (e) => {
    if (e) e.preventDefault();
    if (!importFile) {
      setImportError('กรุณาเลือกไฟล์ Excel (.xlsx) ก่อน');
      return;
    }

    setImportLoading(true);
    setImportError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('preview', 'true');
      formData.append('overwriteExisting', String(overwriteExisting));

      const res = await fetch('/api/units/import', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่สามารถอ่านและตรวจสอบไฟล์ Excel ได้');
      }
      setImportPreview(data);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // ยืนยันการนำเข้าข้อมูลโครงสร้างหน่วย
  const handleConfirmImport = async () => {
    if (!importPreview || !importPreview.units || importPreview.units.length === 0) {
      setImportError('ไม่พบข้อมูลหน่วยที่ถูกต้องสำหรับนำเข้า');
      return;
    }

    setImportSaving(true);
    setImportError('');
    try {
      const res = await fetch('/api/units/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          units: importPreview.units,
          overwriteExisting
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'บันทึกการนำเข้าข้อมูลไม่สำเร็จ');
      }

      setIsImportModalOpen(false);
      setImportFile(null);
      setImportPreview(null);
      setSuccessMsg(data.message || 'นำเข้าโครงสร้างหน่วยสำเร็จ');
      loadUnits();

      triggerStatusPopup({
        type: 'success',
        title: 'นำเข้าโครงสร้างหน่วยสำเร็จ',
        message: `บันทึกข้อมูลโครงสร้างหน่วยจากไฟล์ Excel เรียบร้อยแล้ว (เพิ่มใหม่ ${data.addedCount} หน่วย, ปรับปรุง ${data.updatedCount} หน่วย, ข้าม ${data.skippedCount} หน่วย)`,
        casualtyName: `รวมทั้งหมด ${data.totalProcessed} รายการ`,
        action: 'นำเข้าข้อมูลโครงสร้างหน่วย (Excel Import)',
        by: 'ผู้ดูแลระบบโครงสร้างหน่วย (Admin)'
      });
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportSaving(false);
    }
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Filtered Units
  const filteredUnits = units.filter((u) => {
    const matchTab = activeTab === 'ALL' || activeTab === 'TREE' || u.level === parseInt(activeTab, 10);
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.shortName && u.shortName.toLowerCase().includes(q)) ||
      (u.code && u.code.toLowerCase().includes(q)) ||
      (u.province && u.province.toLowerCase().includes(q)) ||
      (u.rtaPhone && u.rtaPhone.includes(q)) ||
      (u.locationName && u.locationName.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  // รีเซ็ตหน้ากลับเป็นหน้า 1 เสมอเมื่อเปลี่ยนแท็บ ตัวกรองค้นหา หรือจำนวนรายการต่อหน้า
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, pageSize, sortField, sortDirection]);

  // สลับการเรียงลำดับคอลัมน์ใน Data Table
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // จัดกลุ่มและเรียงลำดับหน่วย (ค่าเริ่มต้น: จัดกลุ่มตามระดับ 1 -> 2 -> 3)
  const sortedUnits = [...filteredUnits].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'level') {
      // 1) เรียงตามระดับโครงสร้าง 1 -> 2 -> 3
      if (a.level !== b.level) {
        return (a.level - b.level) * dir;
      }
      // 2) ถ้าอยู่ในระดับเดียวกัน เรียงตามหน่วยต้นสังกัด (parentId)
      if (a.parentId !== b.parentId) {
        return String(a.parentId || '').localeCompare(String(b.parentId || '')) * dir;
      }
      // 3) เรียงตามรหัสหรือชื่อย่อ
      const codeA = a.code || a.shortName || a.name || '';
      const codeB = b.code || b.shortName || b.name || '';
      return codeA.localeCompare(codeB, 'th') * dir;
    }
    if (sortField === 'code') {
      const codeA = a.code || a.shortName || '';
      const codeB = b.code || b.shortName || '';
      return codeA.localeCompare(codeB, 'th') * dir;
    }
    if (sortField === 'name') {
      return (a.name || '').localeCompare(b.name || '', 'th') * dir;
    }
    if (sortField === 'province') {
      return (a.province || '').localeCompare(b.province || '', 'th') * dir;
    }
    if (sortField === 'rtaPhone') {
      return (a.rtaPhone || '').localeCompare(b.rtaPhone || '') * dir;
    }
    return 0;
  });

  // ฟังก์ชันแสดง Header ที่คลิกเรียงลำดับได้
  const renderSortHeader = (label, field, width, align = 'left') => {
    const isSorted = sortField === field;
    return (
      <th
        style={{ width, cursor: 'pointer', userSelect: 'none', textAlign: align }}
        onClick={() => handleSort(field)}
        title={`คลิกเพื่อเรียงลำดับตาม${label} (${isSorted && sortDirection === 'asc' ? 'มากไปน้อย' : 'น้อยไปมาก'})`}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
          <span>{label}</span>
          {isSorted ? (
            sortDirection === 'asc' ? <ArrowUp size={12} color="var(--gold-primary)" /> : <ArrowDown size={12} color="var(--gold-primary)" />
          ) : (
            <ArrowUpDown size={11} color="var(--text-dim)" style={{ opacity: 0.4 }} />
          )}
        </div>
      </th>
    );
  };

  // การคำนวณ Pagination
  const totalUnits = sortedUnits.length;
  const totalPages = Math.max(1, Math.ceil(totalUnits / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalUnits);
  const paginatedUnits = sortedUnits.slice(startIndex, endIndex);

  // ส่วนแสดงผล Pagination (หน้าแรก, ย้อนกลับ, เลขหน้า, หน้าถัดไป, หน้าสุดท้าย)
  const renderPagination = (position = 'top') => {
    if (activeTab === 'TREE' || totalUnits === 0) return null;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: position === 'top' ? '12px 16px' : '16px 20px',
        background: position === 'top' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
        border: position === 'top' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        borderTop: position === 'bottom' ? '1px solid rgba(255, 255, 255, 0.08)' : undefined,
        borderRadius: position === 'top' ? '10px' : '0',
        marginBottom: position === 'top' ? '18px' : '0',
        marginTop: position === 'bottom' ? '18px' : '0',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        {/* ข้อมูลแสดงผล & จำนวนต่อหน้า */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            แสดงหน่วยที่ <strong style={{ color: '#fff' }}>{totalUnits > 0 ? startIndex + 1 : 0} - {endIndex}</strong> จากทั้งหมด <strong style={{ color: 'var(--gold-primary)' }}>{totalUnits}</strong> หน่วย (หน้า <strong style={{ color: '#fff' }}>{safeCurrentPage}</strong> จาก {totalPages} หน้า)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>แสดงหน้าละ:</span>
            <select
              className="form-select form-select-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: '90px', height: '30px', fontSize: '12px', padding: '2px 8px' }}
            >
              <option value={15}>15 หน่วย</option>
              <option value={25}>25 หน่วย</option>
              <option value={50}>50 หน่วย</option>
              <option value={100}>100 หน่วย</option>
              <option value={totalUnits || 1000}>ทั้งหมด</option>
            </select>
          </div>
        </div>

        {/* ปุ่มควบคุม Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {/* หน้าแรก */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage <= 1}
            className="btn btn-secondary btn-sm"
            style={{
              opacity: safeCurrentPage <= 1 ? 0.35 : 1,
              padding: '5px 10px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
            title="ไปยังหน้าแรก"
          >
            <ChevronsLeft size={14} />
            <span>หน้าแรก</span>
          </button>

          {/* ย้อนกลับ */}
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safeCurrentPage <= 1}
            className="btn btn-secondary btn-sm"
            style={{
              opacity: safeCurrentPage <= 1 ? 0.35 : 1,
              padding: '5px 10px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
            title="ย้อนกลับไปหน้าก่อนหน้า"
          >
            <ChevronLeft size={14} />
            <span>ย้อนกลับ</span>
          </button>

          {/* เลขหน้า (Page Numbers) */}
          <div style={{ display: 'flex', gap: '3px', margin: '0 4px' }}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (safeCurrentPage <= 3) {
                pageNum = i + 1;
              } else if (safeCurrentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = safeCurrentPage - 2 + i;
              }

              const isCurrent = pageNum === safeCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: isCurrent ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isCurrent ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                    color: isCurrent ? 'var(--gold-light)' : 'var(--text-muted)',
                    fontWeight: isCurrent ? 700 : 400,
                    cursor: isCurrent ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    transition: 'all 0.15s ease'
                  }}
                  title={`หน้าที่ ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* หน้าถัดไป */}
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="btn btn-secondary btn-sm"
            style={{
              opacity: safeCurrentPage >= totalPages ? 0.35 : 1,
              padding: '5px 10px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
            title="ไปยังหน้าถัดไป"
          >
            <span>หน้าถัดไป</span>
            <ChevronRight size={14} />
          </button>

          {/* หน้าสุดท้าย */}
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage >= totalPages}
            className="btn btn-secondary btn-sm"
            style={{
              opacity: safeCurrentPage >= totalPages ? 0.35 : 1,
              padding: '5px 10px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
            title="ไปยังหน้าสุดท้าย"
          >
            <span>หน้าสุดท้าย</span>
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  const level1Count = units.filter((u) => u.level === 1).length;
  const level2Count = units.filter((u) => u.level === 2).length;
  const level3Count = units.filter((u) => u.level === 3).length;

  // Build hierarchy tree
  const l1Units = units.filter((u) => u.level === 1);
  const getL2Units = (parentId) => units.filter((u) => u.level === 2 && u.parentId === parentId);
  const getL3Units = (parentId) => units.filter((u) => u.level === 3 && u.parentId === parentId);

  // ตรวจสอบสิทธิ์การเข้าถึง: สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น
  if (authChecked && currentUser?.role !== 'ADMIN') {
    return (
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '44px 32px', border: '1px solid rgba(239, 68, 68, 0.35)', boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#ef4444'
          }}>
            <Shield size={38} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
            จำกัดสิทธิ์เฉพาะผู้ดูแลระบบ (ADMIN Only)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '28px' }}>
            เมนู <strong>"จัดการโครงสร้างหน่วยงาน"</strong> สงวนสิทธิ์สำหรับผู้ดูแลระบบ (ADMIN) ของ ทบ. เท่านั้น<br />
            กำลังพลและเจ้าหน้าที่หน่วยสังกัดไม่มีสิทธิ์เข้าถึงหรือปรับแก้โครงสร้างสายการบังคับบัญชา
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.location.href = '/dashboard'} className="btn btn-primary" style={{ minWidth: '160px' }}>
              กลับสู่หน้า Dashboard
            </button>
            <button onClick={() => window.location.href = '/claims'} className="btn btn-secondary" style={{ minWidth: '160px' }}>
              ดูรายการคำร้อง
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      
      {/* Header & Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Building2 size={26} color="var(--gold-primary)" />
            <span>ระบบจัดการโครงสร้างหน่วย กองทัพบก (RTA Unit Organization)</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '6px' }}>
            จัดการสายการบังคับบัญชา 3 ระดับ พร้อมพิกัดปักหมุด Google Map ที่ตั้งค่ายทหาร และเบอร์โทรศัพท์ภายใน ทบ. (5 หลัก)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={handleDownloadTemplate}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="ดาวน์โหลดไฟล์แบบฟอร์มตัวอย่าง Excel สำหรับนำเข้าโครงสร้างหน่วย"
          >
            <Download size={14} color="var(--gold-primary)" />
            <span>แบบฟอร์มตัวอย่าง (.xlsx)</span>
          </button>

          <button 
            type="button"
            onClick={handleOpenImportModal}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="นำเข้าข้อมูลโครงสร้างหน่วยจากไฟล์ Excel (.xlsx)"
          >
            <Upload size={14} color="var(--cyan-accent)" />
            <span>นำเข้า Excel</span>
          </button>

          <button 
            type="button"
            onClick={handleExportExcel}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            disabled={exporting}
            title="ส่งออกข้อมูลโครงสร้างหน่วยทั้งหมดเป็นไฟล์ Excel (.xlsx)"
          >
            <FileSpreadsheet size={14} color="var(--emerald-success)" />
            <span>{exporting ? 'กำลังส่งออก...' : 'ส่งออก Excel'}</span>
          </button>

          <button 
            type="button"
            onClick={handleResetToDefault}
            className="btn btn-secondary btn-sm"
            title="รีเซ็ตเป็นโครงสร้างมาตรฐาน ทบ."
          >
            <RotateCcw size={14} />
            <span>รีเซ็ตค่ามาตรฐาน</span>
          </button>

          <button 
            type="button"
            onClick={() => handleOpenAddModal(2)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>+ เพิ่มหน่วยใหม่</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-success)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 Summary Stat KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        
        <div className="glass-panel" style={{ padding: '18px', borderLeft: '3px solid var(--gold-primary)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>หน่วยทหารในระบบทั้งหมด</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
            {units.length} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--gold-primary)' }}>หน่วย</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            พร้อมพิกัดค่าย & เบอร์โทร.ทบ.
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderLeft: '3px solid var(--gold-light)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>1. ระดับ ทบ. / บชร. / กองทัพภาค</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--gold-light)', marginTop: '4px' }}>
            {level1Count} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>หน่วย</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ทภ.1 - 4, นสศ., นปอ., ยศ.ทบ. และส่วนกลาง
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderLeft: '3px solid var(--cyan-accent)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>2. ระดับ กองพล / มณฑลทหารบก</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--cyan-accent)', marginTop: '4px' }}>
            {level2Count} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>หน่วย</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            พล.1 รอ., พล.ร.2 รอ., พล.ร.3 - 15, พล.ม., มทบ.
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderLeft: '3px solid var(--emerald-success)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>3. ระดับ กรม หรือ กองพัน</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--emerald-light, #a7f3d0)', marginTop: '4px' }}>
            {level3Count} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>หน่วย</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ร.2 รอ., ร.2 พัน.1 รอ., ร.12 รอ., ร.21 รอ., ร.9, ทพ.
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('ALL')}
              className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <List size={14} />
              <span>รายการทั้งหมด ({units.length})</span>
            </button>

            <button 
              onClick={() => setActiveTab('1')}
              className={`btn btn-sm ${activeTab === '1' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <span>1. ระดับ ทบ. ({level1Count})</span>
            </button>

            <button 
              onClick={() => setActiveTab('2')}
              className={`btn btn-sm ${activeTab === '2' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <span>2. ระดับ กองพล / มทบ. ({level2Count})</span>
            </button>

            <button 
              onClick={() => setActiveTab('3')}
              className={`btn btn-sm ${activeTab === '3' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <span>3. ระดับ กรม/กองพัน ({level3Count})</span>
            </button>

            <button 
              onClick={() => setActiveTab('TREE')}
              className={`btn btn-sm ${activeTab === 'TREE' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FolderTree size={14} />
              <span>ผังสายการบังคับบัญชา (Tree View)</span>
            </button>
          </div>

          {/* Search Box & View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="ค้นหาชื่อหน่วย, ตัวย่อ, เบอร์โทร.ทบ., จังหวัด..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
              />
            </div>

            {activeTab !== 'TREE' && (
              <div style={{ display: 'flex', gap: '3px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('TABLE')}
                  className={`btn btn-sm ${viewMode === 'TABLE' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '12px' }}
                  title="แสดงผลแบบตารางข้อมูล (Data Table)"
                >
                  <Table size={13} />
                  <span>ตารางข้อมูล (Data Table)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('CARDS')}
                  className={`btn btn-sm ${viewMode === 'CARDS' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '12px' }}
                  title="แสดงผลแบบการ์ดจัดกลุ่มตามระดับโครงสร้าง"
                >
                  <LayoutGrid size={13} />
                  <span>การ์ดหน่วย</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ color: 'var(--gold-primary)', fontSize: '16px' }}>กำลังโหลดโครงสร้างหน่วยกองทัพบก...</div>
        </div>
      ) : activeTab === 'TREE' ? (
        
        /* -------------------------------------------
           TREE VIEW (ผังสายการบังคับบัญชาตามลำดับชั้น)
           ------------------------------------------- */
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderTree size={18} />
              <span>ผังลำดับสายการบังคับบัญชากองทัพบก (1. ระดับ ทบ. ➔ 2. ระดับ กองพล ➔ 3. ระดับ กรม/กองพัน)</span>
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              คลิกที่แต่ละหน่วยเพื่อย่อหรือขยายหน่วยสังกัดรอง
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {l1Units.map((l1) => {
              const childrenL2 = getL2Units(l1.id);
              const isL1Expanded = expandedNodes[l1.id] !== false;

              return (
                <div key={l1.id} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  {/* Level 1 Header */}
                  <div 
                    onClick={() => toggleNode(l1.id)}
                    style={{
                      padding: '12px 18px',
                      background: 'rgba(212, 175, 55, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      flexWrap: 'wrap',
                      gap: '10px',
                      borderBottom: isL1Expanded && childrenL2.length > 0 ? '1px solid rgba(212, 175, 55, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {childrenL2.length > 0 ? (
                        isL1Expanded ? <ChevronDown size={16} color="var(--gold-primary)" /> : <ChevronRight size={16} color="var(--gold-primary)" />
                      ) : (
                        <div style={{ width: '16px' }} />
                      )}
                      <span className="badge badge-gold" style={{ fontSize: '11px' }}>ระดับ ทบ.</span>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '14.5px' }}>{l1.name}</span>
                      
                      {/* เบอร์โทร.ทบ. */}
                      {l1.rtaPhone && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '11.5px',
                          color: 'var(--gold-primary)',
                          fontFamily: 'monospace',
                          fontWeight: 600
                        }}>
                          <PhoneCall size={11} /> โทร.ทบ. {l1.rtaPhone}
                        </span>
                      )}

                      {/* จังหวัด / พิกัด */}
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} color="var(--cyan-accent)" />
                        <span>{l1.province}</span>
                        {l1.lat && l1.lng && (
                          <a 
                            href={`https://www.google.com/maps?q=${l1.lat},${l1.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: 'var(--cyan-accent)', textDecoration: 'underline', marginLeft: '3px', fontSize: '11px' }}
                          >
                            [แผนที่]
                          </a>
                        )}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--gold-light)' }}>
                        {childrenL2.length} กองพล/มทบ.
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenAddModal(2, l1.id); }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        + เพิ่มกองพล
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(l1); }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 7px' }}
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Level 2 Children */}
                  {isL1Expanded && childrenL2.length > 0 && (
                    <div style={{ padding: '10px 14px 10px 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {childrenL2.map((l2) => {
                        const childrenL3 = getL3Units(l2.id);
                        const isL2Expanded = expandedNodes[l2.id] !== false;

                        return (
                          <div key={l2.id} style={{
                            background: 'rgba(6, 182, 212, 0.03)',
                            border: '1px solid rgba(6, 182, 212, 0.2)',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            {/* Level 2 Header */}
                            <div 
                              onClick={() => toggleNode(l2.id)}
                              style={{
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                background: 'rgba(6, 182, 212, 0.05)',
                                flexWrap: 'wrap',
                                gap: '8px',
                                borderBottom: isL2Expanded && childrenL3.length > 0 ? '1px solid rgba(6, 182, 212, 0.12)' : 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {childrenL3.length > 0 ? (
                                  isL2Expanded ? <ChevronDown size={14} color="var(--cyan-accent)" /> : <ChevronRight size={14} color="var(--cyan-accent)" />
                                ) : (
                                  <div style={{ width: '14px' }} />
                                )}
                                <span className="badge badge-cyan" style={{ fontSize: '10.5px' }}>ระดับ กองพล</span>
                                <span style={{ fontWeight: 600, color: '#e0f2fe', fontSize: '13.5px' }}>{l2.name}</span>
                                
                                {l2.rtaPhone && (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    background: 'rgba(6, 182, 212, 0.15)',
                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                    borderRadius: '4px',
                                    padding: '1px 6px',
                                    fontSize: '11px',
                                    color: 'var(--cyan-accent)',
                                    fontFamily: 'monospace',
                                    fontWeight: 600
                                  }}>
                                    <PhoneCall size={10} /> โทร.ทบ. {l2.rtaPhone}
                                  </span>
                                )}

                                <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <MapPin size={11} color="var(--gold-primary)" />
                                  <span>{l2.province}</span>
                                  {l2.locationName ? ` (${l2.locationName})` : ''}
                                  {l2.lat && l2.lng && (
                                    <a 
                                      href={`https://www.google.com/maps?q=${l2.lat},${l2.lng}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{ color: 'var(--cyan-accent)', textDecoration: 'underline', marginLeft: '3px', fontSize: '11px' }}
                                    >
                                      [แผนที่]
                                    </a>
                                  )}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                  {childrenL3.length} กรม/พัน
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenAddModal(3, l2.id); }}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '2px 7px', fontSize: '10.5px' }}
                                >
                                  + เพิ่มกรม/พัน
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(l2); }}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '2px 6px' }}
                                >
                                  <Edit size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Level 3 Children */}
                            {isL2Expanded && childrenL3.length > 0 && (
                              <div style={{ padding: '8px 12px 8px 28px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {childrenL3.map((l3) => (
                                  <div key={l3.id} style={{
                                    padding: '7px 12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '6px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span className="badge badge-emerald" style={{ fontSize: '10px' }}>ระดับ กรม/พัน</span>
                                      <span style={{ fontWeight: 500, color: '#fff', fontSize: '13px' }}>{l3.name}</span>
                                      <span style={{ fontSize: '11px', color: 'var(--gold-primary)' }}>({l3.shortName})</span>
                                      
                                      {l3.rtaPhone && (
                                        <span style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px',
                                          background: 'rgba(16, 185, 129, 0.15)',
                                          border: '1px solid rgba(16, 185, 129, 0.3)',
                                          borderRadius: '4px',
                                          padding: '1px 6px',
                                          fontSize: '11px',
                                          color: 'var(--emerald-light, #a7f3d0)',
                                          fontFamily: 'monospace',
                                          fontWeight: 600
                                        }}>
                                          <PhoneCall size={10} /> โทร.ทบ. {l3.rtaPhone}
                                        </span>
                                      )}

                                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                        <MapPin size={11} color="var(--gold-primary)" />
                                        <span>{l3.province}</span>
                                        {l3.lat && l3.lng && (
                                          <a 
                                            href={`https://www.google.com/maps?q=${l3.lat},${l3.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'var(--cyan-accent)', textDecoration: 'underline', marginLeft: '3px', fontSize: '10.5px' }}
                                          >
                                            [แผนที่]
                                          </a>
                                        )}
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <button 
                                        onClick={() => handleOpenEditModal(l3)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '2px 6px' }}
                                        title="แก้ไขหน่วย"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteUnit(l3)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '2px 6px', color: '#fca5a5' }}
                                        title="ลบหน่วย"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      ) : (

        /* -------------------------------------------
           MAIN VIEW: CARDS (การ์ด) หรือ TABLE (ตาราง)
           พร้อม Pagination นำหน้า และจัดกลุ่มตามระดับโครงสร้าง
           ------------------------------------------- */
        <div>
          {/* 1) การแสดงผล Pagination นำหน้า (ตามคำขอ) */}
          {renderPagination('top')}

          {viewMode === 'CARDS' ? (
            /* ========================================================
               CARDS VIEW (แสดงผลแบบการ์ดจัดกลุ่มตามระดับโครงสร้าง)
               ======================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
              {paginatedUnits.length === 0 ? (
                <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <Building2 size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <div style={{ fontSize: '15px' }}>ไม่พบข้อมูลโครงสร้างหน่วยที่ตรงกับเงื่อนไขการค้นหา</div>
                </div>
              ) : (
                (() => {
                  // จัดกลุ่มหน่วยที่อยู่ในหน้าปัจจุบันตามระดับโครงสร้าง
                  const groupedByLevel = {};
                  paginatedUnits.forEach((u) => {
                    const lvl = u.level || 3;
                    if (!groupedByLevel[lvl]) groupedByLevel[lvl] = [];
                    groupedByLevel[lvl].push(u);
                  });

                  return [1, 2, 3].map((lvl) => {
                    const unitsInLevel = groupedByLevel[lvl];
                    if (!unitsInLevel || unitsInLevel.length === 0) return null;

                    const lvlLabel = lvl === 1 ? '1. ระดับ ทบ. / บชร. / กองทัพภาค' : lvl === 2 ? '2. ระดับ กองพล / มณฑลทหารบก (มทบ.)' : '3. ระดับ กรม หรือ กองพัน';
                    const lvlBadgeClass = lvl === 1 ? 'badge-gold' : lvl === 2 ? 'badge-cyan' : 'badge-emerald';
                    const lvlIcon = lvl === 1 ? '🎖️' : lvl === 2 ? '🏢' : '⚔️';
                    const lvlColor = lvl === 1 ? 'var(--gold-primary)' : lvl === 2 ? 'var(--cyan-accent)' : 'var(--emerald-success)';

                    return (
                      <div key={lvl}>
                        {/* Section Header สำหรับแต่ละระดับโครงสร้าง */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '14px',
                          paddingBottom: '8px',
                          borderBottom: `2px solid ${lvlColor}`,
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>{lvlIcon}</span>
                            <h3 style={{ fontSize: '15.5px', fontWeight: 700, margin: 0, color: '#fff' }}>
                              {lvlLabel}
                            </h3>
                            <span className={`badge ${lvlBadgeClass}`} style={{ fontSize: '11px', marginLeft: '4px' }}>
                              {unitsInLevel.length} หน่วยในหน้านี้
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                            {lvl === 1 ? 'ทภ.1 - 4, นสศ., นปอ., ยศ.ทบ. และส่วนกลาง' : lvl === 2 ? 'กองพลทหารราบ, กองพลทหารม้า, มทบ.' : 'กรมทหารราบ, กองพันทหารราบ, ทหารปืนใหญ่, ทหารช่าง'}
                          </div>
                        </div>

                        {/* Cards Grid สำหรับระดับนี้ */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                          gap: '16px'
                        }}>
                          {unitsInLevel.map((u) => {
                            const parent = units.find((p) => p.id === u.parentId);

                            return (
                              <div
                                key={u.id}
                                className="glass-panel"
                                style={{
                                  padding: '16px 18px',
                                  borderRadius: '12px',
                                  borderLeft: `4px solid ${lvlColor}`,
                                  background: 'rgba(255, 255, 255, 0.025)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                }}
                              >
                                <div>
                                  {/* Top Badges */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                                    <span className={`badge ${lvlBadgeClass}`} style={{ fontSize: '10.5px' }}>
                                      {lvl === 1 ? 'ระดับ ทบ.' : lvl === 2 ? 'ระดับ กองพล' : 'ระดับ กรม/พัน'}
                                    </span>

                                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-emerald' : 'badge-ruby'}`} style={{ fontSize: '10px' }}>
                                      {u.status === 'ACTIVE' ? 'พร้อมใช้งาน' : 'ระงับ'}
                                    </span>
                                  </div>

                                  {/* Code & Full Name */}
                                  <div style={{ fontSize: '15px', fontWeight: 700, color: lvlColor, marginBottom: '2px' }}>
                                    {u.shortName || u.code}
                                  </div>
                                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#fff', lineHeight: '1.4', marginBottom: '6px' }}>
                                    {u.name}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace', marginBottom: '10px' }}>
                                    ID: {u.id}
                                  </div>

                                  {/* Details: Parent, Location, Phone */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                    {/* หน่วยต้นสังกัด */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                      <GitFork size={13} color="var(--text-dim)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                      {parent ? (
                                        <div style={{ color: 'var(--text-muted)' }}>
                                          สังกัด: <strong style={{ color: 'var(--cyan-accent)' }}>{parent.shortName || parent.code}</strong>
                                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>{parent.name}</span>
                                        </div>
                                      ) : (
                                        <span style={{ color: 'var(--text-dim)' }}>หน่วยขึ้นตรง ทบ. (นขต.ทบ.)</span>
                                      )}
                                    </div>

                                    {/* จังหวัด และสถานที่ตั้ง/ค่าย */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                      <MapPin size={13} color="var(--gold-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                      <div style={{ color: 'var(--text-muted)' }}>
                                        <span>จ.{u.province || 'ไม่ระบุ'}</span>
                                        {u.locationName && <span style={{ color: 'var(--text-dim)' }}> • {u.locationName}</span>}
                                        {u.lat && u.lng && (
                                          <a
                                            href={`https://www.google.com/maps?q=${u.lat},${u.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'var(--cyan-accent)', textDecoration: 'none', marginLeft: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                                          >
                                            <span>[แผนที่]</span>
                                            <ExternalLink size={9} />
                                          </a>
                                        )}
                                      </div>
                                    </div>

                                    {/* เบอร์โทรศัพท์ & โทร.ทบ. */}
                                    {(u.rtaPhone || u.phone) && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                        {u.rtaPhone && (
                                          <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: 'rgba(212, 175, 55, 0.15)',
                                            border: '1px solid rgba(212, 175, 55, 0.3)',
                                            borderRadius: '4px',
                                            padding: '1px 7px',
                                            fontSize: '11px',
                                            color: 'var(--gold-primary)',
                                            fontFamily: 'monospace',
                                            fontWeight: 700
                                          }}>
                                            <PhoneCall size={10} /> โทร.ทบ. {u.rtaPhone}
                                          </span>
                                        )}
                                        {u.phone && (
                                          <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                                            โทรนอก: {u.phone}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                  paddingTop: '10px',
                                  marginTop: '4px'
                                }}>
                                  <div>
                                    {lvl === 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAddModal(2, u.id)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '11px', padding: '2px 7px' }}
                                        title="เพิ่มหน่วยระดับกองพลสังกัดหน่วยนี้"
                                      >
                                        + กองพล
                                      </button>
                                    )}
                                    {lvl === 2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAddModal(3, u.id)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '11px', padding: '2px 7px' }}
                                        title="เพิ่มหน่วยระดับกรม/พันสังกัดหน่วยนี้"
                                      >
                                        + กรม/พัน
                                      </button>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(u)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '3px 8px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      title="แก้ไขข้อมูลหน่วย"
                                    >
                                      <Edit size={12} />
                                      <span>แก้ไข</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUnit(u)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '3px 8px', fontSize: '11.5px', color: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      title="ลบหน่วยนี้"
                                    >
                                      <Trash2 size={12} />
                                      <span>ลบ</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          ) : (
            /* ========================================================
               TABLE VIEW (แสดงรายการแบบตารางข้อมูล Data Table)
               ======================================================== */
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  แสดงผล <strong style={{ color: '#fff' }}>{paginatedUnits.length}</strong> จากทั้งหมด <strong style={{ color: 'var(--gold-primary)' }}>{totalUnits}</strong> หน่วย
                  {sortField && (
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                      (เรียงตาม{sortField === 'level' ? 'ระดับโครงสร้าง' : sortField === 'code' ? 'รหัส/ตัวย่อ' : sortField === 'name' ? 'ชื่อเต็ม' : sortField === 'province' ? 'จังหวัด' : 'เบอร์โทร.ทบ.'} {sortDirection === 'asc' ? 'น้อยไปมาก ▲' : 'มากไปน้อย ▼'})
                    </span>
                  )}
                </div>
                <a 
                  href="/submit" 
                  style={{ fontSize: '12px', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  <span>ทดสอบเลือกในแบบฟอร์มขอรับสิทธิ</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      {renderSortHeader('ระดับโครงสร้าง', 'level', '135px')}
                      {renderSortHeader('รหัส / ตัวย่อ', 'code', '135px')}
                      {renderSortHeader('ชื่อเต็มหน่วยทหาร', 'name', 'auto')}
                      <th style={{ width: '180px' }}>หน่วยแม่ / สังกัด</th>
                      {renderSortHeader('เบอร์ติดต่อ (โทร.ทบ.)', 'rtaPhone', '165px')}
                      {renderSortHeader('จังหวัด / ที่ตั้ง & แผนที่', 'province', '185px')}
                      <th style={{ width: '85px', textAlign: 'center' }}>สถานะ</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUnits.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                          <Building2 size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                          <div>ไม่พบข้อมูลโครงสร้างหน่วยที่ตรงกับเงื่อนไขการค้นหา</div>
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        let lastLevel = null;
                        return paginatedUnits.map((u) => {
                          const parent = units.find((p) => p.id === u.parentId);
                          const lvl = u.level || 3;
                          const isNewLevel = sortField === 'level' && lvl !== lastLevel;
                          if (isNewLevel) {
                            lastLevel = lvl;
                          }

                          const lvlLabel = lvl === 1 ? '1. ระดับ ทบ. / บชร. / กองทัพภาค' : lvl === 2 ? '2. ระดับ กองพล / มณฑลทหารบก (มทบ.)' : '3. ระดับ กรม หรือ กองพัน';
                          const lvlBadgeClass = lvl === 1 ? 'badge-gold' : lvl === 2 ? 'badge-cyan' : 'badge-emerald';
                          const lvlIcon = lvl === 1 ? '🎖️' : lvl === 2 ? '🏢' : '⚔️';
                          const lvlColor = lvl === 1 ? 'var(--gold-primary)' : lvl === 2 ? 'var(--cyan-accent)' : 'var(--emerald-success)';
                          const lvlBg = lvl === 1 ? 'rgba(212, 175, 55, 0.12)' : lvl === 2 ? 'rgba(6, 182, 212, 0.10)' : 'rgba(16, 185, 129, 0.10)';

                          return (
                            <Fragment key={u.id}>
                              {isNewLevel && (
                                <tr style={{ background: lvlBg, borderTop: `2px solid ${lvlColor}`, borderBottom: `1px solid ${lvlColor}` }}>
                                  <td colSpan={8} style={{ padding: '8px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>{lvlIcon}</span>
                                        <strong style={{ color: '#fff', fontSize: '13.5px' }}>{lvlLabel}</strong>
                                        <span className={`badge ${lvlBadgeClass}`} style={{ fontSize: '11px' }}>
                                          ระดับ {lvl}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                                        {lvl === 1 ? 'ทภ.1 - 4, นสศ., นปอ., ยศ.ทบ. และส่วนกลาง' : lvl === 2 ? 'กองพลทหารราบ, กองพลทหารม้า, มทบ.' : 'กรมทหารราบ, กองพันทหารราบ, ทหารปืนใหญ่, ทหารช่าง'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              )}

                              <tr style={{ transition: 'background-color 0.15s ease' }}>
                                <td>
                                  <span className={`badge ${
                                    u.level === 1 ? 'badge-gold' : u.level === 2 ? 'badge-cyan' : 'badge-emerald'
                                  }`} style={{ fontSize: '11px' }}>
                                    {u.level === 1 ? '1. ระดับ ทบ.' : u.level === 2 ? '2. ระดับ กองพล' : '3. ระดับ กรม/พัน'}
                                  </span>
                                </td>

                                <td>
                                  <span style={{ fontWeight: 600, color: 'var(--gold-primary)', fontSize: '13px' }}>
                                    {u.shortName || u.code}
                                  </span>
                                </td>

                                <td>
                                  <div style={{ fontWeight: 500, color: '#fff', fontSize: '13.5px' }}>{u.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>รหัส ID: {u.id}</div>
                                </td>

                                <td>
                                  {parent ? (
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                                      <span style={{ color: 'var(--cyan-accent)', fontWeight: 500 }}>{parent.shortName || parent.code}</span>
                                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>{parent.name}</span>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>หน่วยขึ้นตรง ทบ.</span>
                                  )}
                                </td>

                                {/* เบอร์โทร.ทบ. 5 หลัก */}
                                <td>
                                  {u.rtaPhone ? (
                                    <div>
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: 'rgba(212, 175, 55, 0.15)',
                                        border: '1px solid rgba(212, 175, 55, 0.3)',
                                        borderRadius: '4px',
                                        padding: '2px 8px',
                                        fontSize: '12px',
                                        color: 'var(--gold-primary)',
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        letterSpacing: '0.5px'
                                      }}>
                                        <PhoneCall size={12} /> {u.rtaPhone}
                                      </span>
                                      {u.phone && (
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                          โทรนอก: {u.phone}
                                        </div>
                                      )}
                                    </div>
                                  ) : u.phone ? (
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.phone}</div>
                                  ) : (
                                    <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>-</span>
                                  )}
                                </td>

                                {/* จังหวัด / ที่ตั้ง & ลิงก์ Google Maps */}
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#fff' }}>
                                    <MapPin size={13} color="var(--gold-primary)" />
                                    <span>{u.province || '-'}</span>
                                  </div>
                                  {u.locationName && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                      {u.locationName}
                                    </div>
                                  )}
                                  {u.lat && u.lng ? (
                                    <a 
                                      href={`https://www.google.com/maps?q=${u.lat},${u.lng}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        fontSize: '11px',
                                        color: 'var(--cyan-accent)',
                                        marginTop: '3px',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <ExternalLink size={10} />
                                      <span>ดูพิกัด Google Map</span>
                                    </a>
                                  ) : null}
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-emerald' : 'badge-ruby'}`} style={{ fontSize: '10.5px' }}>
                                    {u.status === 'ACTIVE' ? 'ใช้งาน' : 'ระงับ'}
                                  </span>
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
                                    {u.level === 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAddModal(2, u.id)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '10.5px', padding: '3px 6px', color: 'var(--cyan-accent)' }}
                                        title="เพิ่มหน่วยระดับกองพลสังกัดหน่วยนี้"
                                      >
                                        + กองพล
                                      </button>
                                    )}
                                    {u.level === 2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAddModal(3, u.id)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '10.5px', padding: '3px 6px', color: 'var(--emerald-light, #a7f3d0)' }}
                                        title="เพิ่มหน่วยระดับกรม/พันสังกัดหน่วยนี้"
                                      >
                                        + กรม/พัน
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleOpenEditModal(u)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '3px 7px' }}
                                      title="แก้ไขข้อมูลหน่วย"
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteUnit(u)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '3px 7px', color: '#fca5a5' }}
                                      title="ลบหน่วยนี้"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </Fragment>
                          );
                        });
                      })()
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* 2) การแสดงผล Pagination ท้ายหน้าเพื่อความสะดวกเมื่อเลื่อนดูรายการ */}
          {renderPagination('bottom')}
        </div>

      )}

      {/* Modal เพิ่ม / แก้ไขหน่วย พร้อมปักหมุด Google Map และ เบอร์โทร.ทบ. 5 หลัก */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '28px',
            borderTop: '4px solid var(--gold-primary)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)' }}>
                <Building2 size={20} />
                <span>{editingUnit ? 'แก้ไขข้อมูลโครงสร้างหน่วย' : 'เพิ่มหน่วยใหม่ในสายการบังคับบัญชา'}</span>
              </h2>
              <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                {modalForm.level === 1 ? '1. ระดับ ทบ.' : modalForm.level === 2 ? '2. ระดับ กองพล' : '3. ระดับ กรม/พัน'}
              </span>
            </div>

            <form onSubmit={handleSaveUnit}>
              
              <div className="grid-cols-2">
                
                {/* เลือกระดับ */}
                <div className="form-group">
                  <label className="form-label required">ระดับโครงสร้างหน่วย</label>
                  <select 
                    className="form-select"
                    value={modalForm.level}
                    onChange={(e) => {
                      const newLvl = parseInt(e.target.value, 10);
                      setModalForm({
                        ...modalForm,
                        level: newLvl,
                        parentId: newLvl === 2 ? '1st_ARMY' : newLvl === 3 ? '2nd_INF_DIV' : ''
                      });
                    }}
                    required
                  >
                    <option value={1}>1. ระดับ ทบ. / บชร. / กองทัพภาค</option>
                    <option value={2}>2. ระดับ กองพล / มณฑลทหารบก (มทบ.)</option>
                    <option value={3}>3. ระดับ กรม หรือ กองพัน</option>
                  </select>
                </div>

                {/* เลือกสังกัดแม่ */}
                <div className="form-group">
                  <label className="form-label">
                    หน่วยต้นสังกัด (Parent Unit)
                  </label>
                  {modalForm.level === 1 ? (
                    <input type="text" className="form-input" value="กองทัพบก (ขึ้นตรงส่วนกลาง)" disabled style={{ opacity: 0.6 }} />
                  ) : modalForm.level === 2 ? (
                    <select 
                      className="form-select"
                      value={modalForm.parentId}
                      onChange={(e) => setModalForm({ ...modalForm, parentId: e.target.value })}
                      required
                    >
                      <option value="">-- เลือกหน่วยระดับ ทบ. --</option>
                      {units.filter((u) => u.level === 1).map((u) => (
                        <option key={u.id} value={u.id}>[{u.code || u.shortName}] {u.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      className="form-select"
                      value={modalForm.parentId}
                      onChange={(e) => setModalForm({ ...modalForm, parentId: e.target.value })}
                      required
                    >
                      <option value="">-- เลือกกองพล / มทบ. ต้นสังกัด --</option>
                      {units.filter((u) => u.level === 2).map((u) => (
                        <option key={u.id} value={u.id}>[{u.code || u.shortName}] {u.name}</option>
                      ))}
                    </select>
                  )}
                </div>

              </div>

              {/* ชื่อย่อ และ ชื่อเต็ม */}
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">ชื่อย่อหน่วย / รหัสย่อ</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="เช่น ร.2 พัน.1 รอ. หรือ พล.ร.2 รอ."
                    value={modalForm.shortName}
                    onChange={(e) => setModalForm({ ...modalForm, shortName: e.target.value, code: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">ชื่อเต็มหน่วยทหาร</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="เช่น กองพันทหารราบที่ 1 กรมทหารราบที่ 2 รักษาพระองค์"
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* ช่องเบอร์ติดต่อหน่วย โทร.ทบ. (ตัวเลข 5 ตัว) */}
              {/* ---------------------------------------------------- */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneCall size={16} />
                  <span>เบอร์ติดต่อหน่วยงานทางทหาร (โทร.ทบ. 5 หลัก & เบอร์ทั่วไป)</span>
                </div>

                <div className="grid-cols-2" style={{ gap: '14px' }}>
                  
                  {/* โทร.ทบ. 5 หลัก */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label required" style={{ color: 'var(--gold-light)' }}>
                      เบอร์ติดต่อหน่วย โทร.ทบ. (ตัวเลข 5 ตัว)
                    </label>
                    <input 
                      type="text" 
                      maxLength={5}
                      className="form-input"
                      placeholder="เช่น 97123 หรือ 54001"
                      value={modalForm.rtaPhone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setModalForm({ ...modalForm, rtaPhone: digits });
                      }}
                      required
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '15px',
                        letterSpacing: '2.5px',
                        fontWeight: 700,
                        color: 'var(--gold-primary)'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        โทรศัพท์ภายใน ทบ. 5 ตัว สำหรับประสานราชการ
                      </span>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 600,
                        color: modalForm.rtaPhone.length === 5 ? 'var(--emerald-light, #a7f3d0)' : 'var(--amber-warning)' 
                      }}>
                        {modalForm.rtaPhone.length}/5 หลัก {modalForm.rtaPhone.length === 5 ? '✓ ครบถ้วน' : ''}
                      </span>
                    </div>
                  </div>

                  {/* เบอร์โทรศัพท์ภายนอก */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: 'var(--text-muted)' }}>
                      เบอร์โทรศัพท์ทั่วไป / ภายนอก (ถ้ามี)
                    </label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="เช่น 02-297-7000 หรือ 037-211-111"
                      value={modalForm.phone}
                      onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      เบอร์โทรศัพท์พื้นฐานสำหรับการติดต่อจากภายนอก
                    </span>
                  </div>

                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* ช่อง จังหวัด / ที่ตั้งหน่วย พร้อมปักหมุด Google Map */}
              {/* ---------------------------------------------------- */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.03)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cyan-accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} />
                    <span>จังหวัด / ที่ตั้งหน่วย (ปักหมุดแผนที่ Google Map)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: showMapPicker ? 'var(--gold-primary)' : 'var(--cyan-accent)',
                      borderColor: showMapPicker ? 'var(--gold-primary)' : 'rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    <Compass size={14} />
                    <span>{showMapPicker ? '▲ ปิดกล่องแผนที่' : '📍 ปักหมุดเลือกจากแผนที่ Google Map'}</span>
                  </button>
                </div>

                {/* Input Fields สำหรับ จังหวัด และ ชื่อค่าย/ที่ตั้ง */}
                <div className="grid-cols-2" style={{ gap: '14px', marginBottom: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label required">จังหวัดที่ตั้งหน่วย</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="เช่น ปราจีนบุรี, นครราชสีมา, กรุงเทพมหานคร"
                      value={modalForm.province}
                      onChange={(e) => setModalForm({ ...modalForm, province: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">ชื่อค่ายทหาร / ที่ตั้งหน่วย</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="เช่น ค่ายพรหมโยธี, ค่ายสุรสีห์, บก.ทบ."
                      value={modalForm.locationName}
                      onChange={(e) => setModalForm({ ...modalForm, locationName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Interactive Google Map Pinning & Preset Military Camps */}
                {showMapPicker && (
                  <div style={{
                    marginTop: '12px',
                    padding: '14px',
                    background: 'rgba(9, 17, 38, 0.95)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Navigation size={13} />
                      <span>เลือกปักหมุดด่วน: ค่ายทหารหลักของกองทัพบก</span>
                    </div>

                    {/* Preset buttons */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {RTA_CAMP_PRESETS.map((camp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPresetCamp(camp)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            background: modalForm.locationName === camp.locationName ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.04)',
                            borderColor: modalForm.locationName === camp.locationName ? 'var(--gold-primary)' : 'rgba(255,255,255,0.1)'
                          }}
                        >
                          <MapPin size={11} color="var(--gold-primary)" />
                          <span>{camp.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Coordinate inputs & Google Maps Link */}
                    <div className="grid-cols-2" style={{ gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                          ละติจูด (Latitude)
                        </label>
                        <input 
                          type="number"
                          step="0.0001"
                          className="form-input"
                          value={modalForm.lat || ''}
                          onChange={(e) => setModalForm({ ...modalForm, lat: parseFloat(e.target.value) || '' })}
                          style={{ fontSize: '12px', height: '34px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                          ลองจิจูด (Longitude)
                        </label>
                        <input 
                          type="number"
                          step="0.0001"
                          className="form-input"
                          value={modalForm.lng || ''}
                          onChange={(e) => setModalForm({ ...modalForm, lng: parseFloat(e.target.value) || '' })}
                          style={{ fontSize: '12px', height: '34px' }}
                        />
                      </div>
                    </div>

                    {/* Reverse Geocode & Google Map Link Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleReverseGeocode(modalForm.lat, modalForm.lng)}
                        className="btn btn-secondary btn-sm"
                        disabled={geocoding}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        {geocoding ? 'กำลังค้นหาชื่อตำบล/อำเภอ...' : 'ดึงชื่อตำบล/จังหวัดจากพิกัด'}
                      </button>

                      {modalForm.lat && modalForm.lng && (
                        <a
                          href={`https://www.google.com/maps?q=${modalForm.lat},${modalForm.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            color: 'var(--cyan-accent)',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>เปิดดูพิกัดบน Google Maps (จริง)</span>
                        </a>
                      )}
                    </div>

                    {/* Current pinned preview */}
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      background: 'rgba(212, 175, 55, 0.08)',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      color: 'var(--gold-light)'
                    }}>
                      📌 ปักหมุดปัจจุบัน: <strong>{modalForm.province}</strong> {modalForm.locationName ? `(${modalForm.locationName})` : ''} • พิกัด: {modalForm.lat}, {modalForm.lng}
                    </div>

                  </div>
                )}

              </div>

              {/* ประเภทหน่วย และ สถานะ */}
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">ประเภทหน่วย</label>
                  <select 
                    className="form-select"
                    value={modalForm.type}
                    onChange={(e) => setModalForm({ ...modalForm, type: e.target.value })}
                  >
                    <option value="REGULAR">หน่วยรบ / รบหลัก</option>
                    <option value="SUPPORT">หน่วยสนับสนุนการรบ</option>
                    <option value="SERVICE">หน่วยช่วยรบ / ยุทธบริการ</option>
                    <option value="SPECIAL">หน่วยรบพิเศษ / เฉพาะกิจ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">สถานะการใช้งาน</label>
                  <select 
                    className="form-select"
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">พร้อมใช้งาน (ACTIVE)</option>
                    <option value="INACTIVE">ระงับการใช้งาน (INACTIVE)</option>
                  </select>
                </div>
              </div>

              {/* ปุ่มบันทึกและยกเลิก */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={16} />
                  <span>{saving ? 'กำลังบันทึก...' : editingUnit ? 'บันทึกการแก้ไข' : 'เพิ่มหน่วยลงโครงสร้าง'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal: นำเข้าโครงสร้างหน่วยจากไฟล์ Excel (.xlsx)                           */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '1050px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '28px',
            borderRadius: '14px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
          }}>

            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: '#fff' }}>
                  <FileSpreadsheet size={22} color="var(--gold-primary)" />
                  <span>นำเข้าข้อมูลโครงสร้างหน่วยจากไฟล์ Excel (.xlsx)</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  เพิ่มหรือปรับปรุงข้อมูลโครงสร้างสายการบังคับบัญชา พิกัดค่าย และเบอร์โทร.ทบ. พร้อมกันเป็นชุด
                </p>
              </div>

              <button 
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </div>

            {/* Banner แนะนำแบบฟอร์มตัวอย่าง */}
            <div style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
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
                  <strong>ยังไม่มีแบบฟอร์มตัวอย่าง?</strong> สามารถดาวน์โหลดไฟล์ต้นแบบที่มีคอลัมน์มาตรฐานและตัวอย่างข้อมูล 6 หน่วยไปกรอกได้ทันที
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
              >
                <Download size={14} color="var(--gold-primary)" />
                <span>ดาวน์โหลดแบบฟอร์มตัวอย่าง (.xlsx)</span>
              </button>
            </div>

            {/* Form เลือกไฟล์ & ตัวเลือก Overwrite */}
            {!importPreview ? (
              <form onSubmit={handlePreviewExcel}>
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.18)',
                  borderRadius: '12px',
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  marginBottom: '20px'
                }}>
                  <FileUp size={44} color="var(--cyan-accent)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                    เลือกไฟล์ Excel (.xlsx หรือ .xls)
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    รองรับไฟล์ตารางที่มีคอลัมน์: รหัสหน่วย, ระดับ, รหัส/ชื่อย่อ, ชื่อเต็มหน่วย, รหัสหน่วยต้นสังกัด, จังหวัด, ชื่อค่าย, โทร.ทบ.
                  </div>

                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={handleImportFileChange}
                    style={{ display: 'none' }}
                    id="excel-file-upload-input"
                  />
                  
                  <label 
                    htmlFor="excel-file-upload-input"
                    className="btn btn-secondary"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 22px' }}
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
                      checked={overwriteExisting}
                      onChange={(e) => setOverwriteExisting(e.target.checked)}
                      style={{ width: '17px', height: '17px', accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
                    />
                    <span>
                      <strong>อัปเดตข้อมูลหากมีรหัสหน่วย (ID) หรือชื่อย่อหน่วยเดิมในระบบแล้ว (Overwrite/Update existing)</strong>
                      <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        หากมีหน่วยเดิมอยู่แล้ว ระบบจะอัปเดตชื่อ ค่าย เบอร์โทร และพิกัดให้เป็นข้อมูลล่าสุด
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
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '160px', justifyContent: 'center' }}
                  >
                    {importLoading ? 'กำลังอ่านและตรวจสอบไฟล์...' : 'ตรวจสอบและดูตัวอย่าง (Preview)'}
                  </button>
                </div>
              </form>
            ) : (
              /* Preview Mode */
              <div>
                {/* 3 KPI Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div className="glass-panel" style={{ padding: '12px 16px', borderLeft: '3px solid var(--cyan-accent)' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>แถวทั้งหมดในไฟล์</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                      {importPreview.totalRows || importPreview.units?.length || 0} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>แถว</span>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '12px 16px', borderLeft: '3px solid var(--emerald-success)' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>พร้อมนำเข้า (ผ่านเกณฑ์)</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#6ee7b7', marginTop: '2px' }}>
                      {importPreview.validCount || importPreview.units?.length || 0} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>หน่วย</span>
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
                      {importPreview.errors.map((err, idx) => (
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
                        <li style={{ marginTop: '4px', fontStyle: 'italic' }}>
                          ...และคำเตือนอื่นๆ อีก {importPreview.warnings.length - 5} รายการ
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Preview Table Container */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>ตารางตัวอย่างข้อมูลที่กำลังจะนำเข้า ({importPreview.units?.length || 0} หน่วย):</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เลื่อนเพื่อดูคอลัมน์เพิ่มเติม →</span>
                  </div>

                  <div style={{ maxHeight: '340px', overflowY: 'auto', overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                    <table className="data-table" style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#0a1d24', zIndex: 2 }}>
                        <tr>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px' }}>#</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '85px' }}>ระดับ</th>
                          <th style={{ padding: '8px 10px' }}>รหัสหน่วย (ID)</th>
                          <th style={{ padding: '8px 10px' }}>ชื่อย่อ</th>
                          <th style={{ padding: '8px 10px' }}>ชื่อเต็มหน่วย</th>
                          <th style={{ padding: '8px 10px' }}>หน่วยต้นสังกัด</th>
                          <th style={{ padding: '8px 10px' }}>จังหวัด</th>
                          <th style={{ padding: '8px 10px' }}>ค่าย/ที่ตั้ง</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>โทร.ทบ.</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(importPreview.units || []).map((u, i) => (
                          <tr key={u.id || i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-dim)' }}>{i + 1}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                background: u.level === 1 ? 'rgba(212, 175, 55, 0.2)' : u.level === 2 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: u.level === 1 ? 'var(--gold-primary)' : u.level === 2 ? 'var(--cyan-accent)' : 'var(--emerald-light, #6ee7b7)'
                              }}>
                                {u.level === 1 ? '1. ทบ.' : u.level === 2 ? '2. กองพล' : '3. กรม/พัน'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{u.id}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 600 }}>{u.shortName || u.code}</td>
                            <td style={{ padding: '8px 10px', color: '#fff' }}>{u.name}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{u.parentId || '-'}</td>
                            <td style={{ padding: '8px 10px' }}>{u.province || '-'}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>{u.locationName || '-'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--gold-light)' }}>
                              {u.rtaPhone ? `☎ ${u.rtaPhone}` : '-'}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: u.status === 'ACTIVE' ? '#6ee7b7' : '#fca5a5'
                              }}>
                                {u.status || 'ACTIVE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Error message if confirm fails */}
                {importError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Footer buttons for Preview */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                  <button 
                    type="button"
                    onClick={() => setImportPreview(null)}
                    className="btn btn-secondary"
                    disabled={importSaving}
                  >
                    ← เลือกไฟล์ใหม่
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      className="btn btn-secondary"
                      disabled={importSaving}
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="button"
                      onClick={handleConfirmImport}
                      className="btn btn-primary"
                      disabled={importSaving || !importPreview.units || importPreview.units.length === 0}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '180px', justifyContent: 'center' }}
                    >
                      <Check size={16} />
                      <span>{importSaving ? 'กำลังบันทึกลงระบบ...' : `ยืนยันนำเข้าข้อมูล (${importPreview.validCount || importPreview.units?.length || 0} หน่วย)`}</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
