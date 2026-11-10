// app/units/page.js
'use client';

import { useState, useEffect } from 'react';
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
  Map
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={handleResetToDefault}
            className="btn btn-secondary btn-sm"
            title="รีเซ็ตเป็นโครงสร้างมาตรฐาน ทบ."
          >
            <RotateCcw size={14} />
            <span>รีเซ็ตค่ามาตรฐาน ทบ.</span>
          </button>

          <button 
            onClick={() => handleOpenAddModal(2)}
            className="btn btn-primary"
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

          {/* Search Box */}
          <div style={{ position: 'relative', width: '320px' }}>
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
           TABLE VIEW (แสดงรายการแบบตาราง)
           ------------------------------------------- */
        <div className="glass-panel" style={{ padding: '20px' }}>
          
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              แสดงผล <strong style={{ color: '#fff' }}>{filteredUnits.length}</strong> หน่วย
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
                  <th style={{ width: '130px' }}>ระดับโครงสร้าง</th>
                  <th style={{ width: '140px' }}>รหัส / ตัวย่อ</th>
                  <th>ชื่อเต็มหน่วยทหาร</th>
                  <th>หน่วยแม่ / สังกัด</th>
                  <th style={{ width: '160px' }}>เบอร์ติดต่อ (โทร.ทบ.)</th>
                  <th style={{ width: '180px' }}>จังหวัด / ที่ตั้ง & แผนที่</th>
                  <th style={{ width: '85px' }}>สถานะ</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((u) => {
                  const parent = units.find((p) => p.id === u.parentId);

                  return (
                    <tr key={u.id}>
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

                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'badge-emerald' : 'badge-ruby'}`} style={{ fontSize: '10.5px' }}>
                          {u.status === 'ACTIVE' ? 'ใช้งาน' : 'ระงับ'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleOpenEditModal(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="แก้ไขข้อมูลหน่วย"
                          >
                            <Edit size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUnit(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', color: '#fca5a5' }}
                            title="ลบหน่วยนี้"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUnits.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                      ไม่พบข้อมูลโครงสร้างหน่วยที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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

    </div>
  );
}
