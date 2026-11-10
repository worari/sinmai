// app/submit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  ArrowLeft,
  Calendar,
  Building,
  User,
  HeartCrack,
  Paperclip,
  Info,
  MapPin,
  GitFork,
  Layers,
  ChevronRight,
  ExternalLink,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import SampleDocumentViewer from '@/components/SampleDocumentViewer';
import { 
  MILITARY_RANKS, 
  PERSONNEL_TYPES, 
  MILITARY_UNITS, 
  REQUIRED_DOCUMENTS, 
  validateCitizenId, 
  formatCitizenId,
  formatThaiDate,
  getLevel1Units,
  getLevel2Units,
  getLevel3Units,
  findUnitById,
  getUnitBreadcrumb,
  validateAttachmentFile,
  MAX_FILE_SIZE_MB,
  getPersonnelTypeFromRank,
  getGenderFromRank,
  INCIDENT_TYPES,
  DRIVER_STATUSES,
  ALCOHOL_TEST_RESULTS
} from '@/lib/thai-utils';
import { INITIAL_MILITARY_UNITS } from '@/lib/military-units';
import LocationPicker from '@/components/LocationPicker';
import { triggerStatusPopup } from '@/components/StatusModal';

export default function SubmitClaimPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    unitId: '9th_INF_DIV',
    unitName: 'กองพลทหารราบที่ 9 (พล.ร.9)',
    casualtyRank: 'ส.อ.',
    casualtyFirstName: '',
    casualtyLastName: '',
    casualtyCitizenId: '',
    casualtyBirthDate: '1995-01-01',
    lossDate: new Date().toISOString().split('T')[0],
    claimType: 'HIGH_RISK', // NORMAL (60,000) or HIGH_RISK (300,000)
    lossType: 'DECEASED', // DECEASED or DISABLED
    incidentType: 'ILLNESS', // ILLNESS (ป่วย), ACCIDENT (อุบัติเหตุ), COMBAT (การรบ/ปะทะ), OTHER (อื่นๆ)
    isDriver: 'YES', // YES (เป็นผู้ขับขี่), NO (ไม่ใช่ผู้ขับขี่)
    alcoholTestResult: 'NOT_EXCEEDED', // NOT_EXCEEDED (ไม่เกินที่กฎหมายกำหนด), EXCEEDED (เกิน), PENDING (รอผล), NOT_TESTED (ไม่ได้ตรวจ)
    personnelType: 'นายทหารประทวน',
    casualtyGender: 'ชาย',
    causeOfLoss: '',
    deathCertificateCause: '', // สาเหตุการเสียชีวิต (ตามใบมรณบัตร)
    disabledOrganDetail: '', // อวัยวะที่สูญเสีย (กรณีพิการทุพพลภาพ)
    lossSpecificCause: '', // ข้อมูลสาเหตุการสูญเสียเฉพาะกรณี (มรณบัตร / อวัยวะที่สูญเสีย)
    locationOfLoss: {
      lat: 14.0228,
      lng: 99.5328,
      street: 'ถ.แสงชูโต',
      subdistrict: 'ลาดหญ้า',
      district: 'เมืองกาญจนบุรี',
      province: 'กาญจนบุรี',
      fullAddress: 'ถ.แสงชูโต ต.ลาดหญ้า อ.เมืองกาญจนบุรี จ.กาญจนบุรี'
    }
  });

  // State เก็บรายการเอกสารแนบ 10 รายการ
  const [attachedDocs, setAttachedDocs] = useState(
    REQUIRED_DOCUMENTS.map((doc) => ({
      index: doc.index,
      name: doc.name,
      uploaded: false,
      fileName: '',
      fileUrl: '',
      fileSize: 0,
      note: doc.note || ''
    }))
  );

  // Auto-complete rank filter state
  const [rankInput, setRankInput] = useState('ส.อ.');
  const [filteredRanks, setFilteredRanks] = useState([]);
  const [showRankDropdown, setShowRankDropdown] = useState(false);

  // โครงสร้างหน่วย 3 ระดับ (ระดับ ทบ. -> ระดับ กองพล -> ระดับ กรม/กองพัน)
  const [allUnits, setAllUnits] = useState(INITIAL_MILITARY_UNITS);
  const [level1Id, setLevel1Id] = useState('1st_ARMY');
  const [level2Id, setLevel2Id] = useState('9th_INF_DIV');
  const [level3Id, setLevel3Id] = useState('R9_BN1');
  const [subUnitName, setSubUnitName] = useState('');

  // โหลดรายการหน่วยทั้งหมดจาก API และผูกกับสังกัดผู้ใช้งาน
  useEffect(() => {
    fetch('/api/units')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.units)) {
          setAllUnits(data.units);
        }
      })
      .catch((err) => console.error('Fetch units failed', err));

    const saved = localStorage.getItem('rta_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        resolveInitialUnitHierarchy(u.unitId || '9th_INF_DIV');
      } catch (e) {}
    } else {
      resolveInitialUnitHierarchy('9th_INF_DIV');
    }
  }, []);

  const resolveInitialUnitHierarchy = (targetUnitId) => {
    const unit = findUnitById(targetUnitId, allUnits);
    let l1 = '1st_ARMY';
    let l2 = '';
    let l3 = '';

    if (unit) {
      if (unit.level === 3) {
        l3 = unit.id;
        l2 = unit.parentId || '';
        const parentL2 = findUnitById(l2, allUnits);
        l1 = parentL2 ? parentL2.parentId || '1st_ARMY' : '1st_ARMY';
      } else if (unit.level === 2) {
        l2 = unit.id;
        l1 = unit.parentId || '1st_ARMY';
        const children = getLevel3Units(l2, allUnits);
        l3 = children.length > 0 ? children[0].id : '';
      } else if (unit.level === 1) {
        l1 = unit.id;
        const childrenL2 = getLevel2Units(l1, allUnits);
        l2 = childrenL2.length > 0 ? childrenL2[0].id : '';
        if (l2) {
          const childrenL3 = getLevel3Units(l2, allUnits);
          l3 = childrenL3.length > 0 ? childrenL3[0].id : '';
        }
      }
    }

    setLevel1Id(l1);
    setLevel2Id(l2);
    setLevel3Id(l3);
    updateFormUnit(l1, l2, l3, subUnitName);
  };

  const updateFormUnit = (l1, l2, l3, sub) => {
    const l1Obj = findUnitById(l1, allUnits);
    const l2Obj = findUnitById(l2, allUnits);
    const l3Obj = findUnitById(l3, allUnits);

    const activeObj = l3Obj || l2Obj || l1Obj;
    const finalUnitId = activeObj?.id || l1;
    const finalUnitName = activeObj?.name || 'กองทัพบก';

    const pathParts = [];
    if (l1Obj) pathParts.push(l1Obj.shortName || l1Obj.name);
    if (l2Obj) pathParts.push(l2Obj.shortName || l2Obj.name);
    if (l3Obj) pathParts.push(l3Obj.shortName || l3Obj.name);
    if (sub && sub.trim()) pathParts.push(sub.trim());

    const unitPath = pathParts.join(' ➔ ');

    setFormData((prev) => ({
      ...prev,
      unitId: finalUnitId,
      unitName: finalUnitName,
      unitLevel1Id: l1,
      unitLevel1Name: l1Obj?.name || '',
      unitLevel2Id: l2,
      unitLevel2Name: l2Obj?.name || '',
      unitLevel3Id: l3,
      unitLevel3Name: l3Obj?.name || '',
      subUnitName: sub || '',
      unitPath
    }));
  };

  const handleLevel1Change = (newL1) => {
    setLevel1Id(newL1);
    const availableL2 = getLevel2Units(newL1, allUnits);
    const nextL2 = availableL2.length > 0 ? availableL2[0].id : '';
    setLevel2Id(nextL2);

    let nextL3 = '';
    if (nextL2) {
      const availableL3 = getLevel3Units(nextL2, allUnits);
      nextL3 = availableL3.length > 0 ? availableL3[0].id : '';
    }
    setLevel3Id(nextL3);

    updateFormUnit(newL1, nextL2, nextL3, subUnitName);
  };

  const handleLevel2Change = (newL2) => {
    setLevel2Id(newL2);
    let nextL3 = '';
    if (newL2) {
      const availableL3 = getLevel3Units(newL2, allUnits);
      nextL3 = availableL3.length > 0 ? availableL3[0].id : '';
    }
    setLevel3Id(nextL3);

    updateFormUnit(level1Id, newL2, nextL3, subUnitName);
  };

  const handleLevel3Change = (newL3) => {
    setLevel3Id(newL3);
    updateFormUnit(level1Id, level2Id, newL3, subUnitName);
  };

  const handleSubUnitChange = (sub) => {
    setSubUnitName(sub);
    updateFormUnit(level1Id, level2Id, level3Id, sub);
  };

  const handleCitizenIdChange = async (val) => {
    const clean = val.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, casualtyCitizenId: val }));
    setDuplicateAlert(null);
    setErrorMsg('');

    if (clean.length === 13) {
      if (validateCitizenId(clean)) {
        try {
          const res = await fetch(`/api/claims?checkCitizenId=${clean}`);
          const data = await res.json();
          if (data.isDuplicate) {
            setDuplicateAlert({
              trackingCode: data.trackingCode,
              casualtyName: data.casualtyName,
              unitName: data.unitName
            });
            setErrorMsg(`ห้ามยื่นเรื่องซ้ำ: เลขประจำตัวประชาชน ${val} เคยมีการยื่นเสนอเรื่องแล้ว (${data.trackingCode})`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleRankChange = (val) => {
    setRankInput(val);
    const autoType = getPersonnelTypeFromRank(val);
    const autoGender = getGenderFromRank(val);
    setFormData((prev) => ({ 
      ...prev, 
      casualtyRank: val,
      personnelType: autoType,
      ...(autoGender ? { casualtyGender: autoGender } : {})
    }));
    if (val.trim()) {
      const matched = MILITARY_RANKS.filter((r) => r.toLowerCase().includes(val.toLowerCase()));
      setFilteredRanks(matched);
      setShowRankDropdown(true);
    } else {
      setFilteredRanks(MILITARY_RANKS);
      setShowRankDropdown(false);
    }
  };

  const selectRank = (rank) => {
    setRankInput(rank);
    const autoType = getPersonnelTypeFromRank(rank);
    const autoGender = getGenderFromRank(rank);
    setFormData((prev) => ({ 
      ...prev, 
      casualtyRank: rank,
      personnelType: autoType,
      ...(autoGender ? { casualtyGender: autoGender } : {})
    }));
    setShowRankDropdown(false);
  };

  const handleFileUpload = (docIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ตรวจสอบความปลอดภัยและขนาดไฟล์ (ป้องกันไฟล์สั่งรัน .exe และจำกัดไม่เกิน 10MB)
    const validation = validateAttachmentFile(file);
    if (!validation.valid) {
      triggerStatusPopup({
        type: 'danger',
        title: 'ไม่อนุญาตให้อัปโหลดไฟล์นี้',
        message: validation.error
      });
      setErrorMsg(validation.error);
      e.target.value = '';
      return;
    }

    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target?.result;
      const updatedInfo = {
        uploaded: true,
        fileName: file.name,
        fileUrl: `/uploads/${file.name}`,
        fileData: fileData,
        fileSize: file.size,
        status: 'PENDING'
      };

      setAttachedDocs((prev) =>
        prev.map((d) =>
          d.index === docIndex
            ? {
                ...d,
                ...updatedInfo
              }
            : d
        )
      );

      if (previewDoc && previewDoc.index === docIndex) {
        setPreviewDoc((prev) => ({
          ...prev,
          ...updatedInfo
        }));
      }

      triggerStatusPopup({
        type: 'success',
        title: 'แนบเอกสารสำเร็จ',
        message: `แนบไฟล์ "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) สำหรับเอกสารข้อที่ ${docIndex} เรียบร้อยแล้ว ตรวจสอบผ่านตามเกณฑ์ความปลอดภัย`
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (docIndex) => {
    const docToRemove = attachedDocs.find((d) => d.index === docIndex);
    setAttachedDocs((prev) =>
      prev.map((d) =>
        d.index === docIndex
          ? {
              ...d,
              uploaded: false,
              fileName: '',
              fileUrl: '',
              fileData: null,
              fileSize: 0,
              status: 'PENDING'
            }
          : d
      )
    );

    if (previewDoc && previewDoc.index === docIndex) {
      setPreviewDoc(null);
    }

    triggerStatusPopup({
      type: 'warning',
      title: 'ลบเอกสารแนบเรียบร้อย',
      message: `ลบไฟล์แนบของ "${docToRemove?.name || `เอกสารข้อที่ ${docIndex}`}" เรียบร้อยแล้ว สามารถกดแนบไฟล์ใหม่ได้ทันที`
    });
  };

  const handleOpenPreviewDoc = (doc) => {
    const currentDoc = attachedDocs.find((d) => d.index === doc.index) || doc;
    setPreviewDoc(currentDoc);
  };

  const handleDownloadDoc = (doc) => {
    if (!doc) return;
    if (doc.fileData) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.fileName || `${doc.name || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `เอกสารแนบทางราชการ กองทัพบก\nเอกสาร: ${doc.name || doc.title}\nไฟล์แนบ: ${doc.fileName || 'doc_attached.pdf'}\nผู้เสนอเรื่อง: ${currentUser?.name || formData.unitName}\nกำลังพล: ${formData.casualtyRank} ${formData.casualtyFirstName} ${formData.casualtyLastName}\nสังกัด: ${formData.unitName}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName || `doc_${doc.index || 'attached'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!formData.casualtyFirstName || !formData.casualtyLastName) {
      setErrorMsg('กรุณากรอกชื่อและนามสกุลของผู้สูญเสีย');
      return;
    }

    if (!validateCitizenId(formData.casualtyCitizenId)) {
      setErrorMsg('เลขประจำตัวประชาชนผู้สูญเสีย 13 หลักไม่ถูกต้องตามหลักตรวจสอบทางการ (Mod 11 Checksum)');
      return;
    }

    if (duplicateAlert) {
      setErrorMsg(`ห้ามยื่นเรื่องซ้ำ: กำลังพลเลขประจำตัวประชาชน ${formData.casualtyCitizenId} เคยมีการยื่นเสนอเรื่องแล้ว (${duplicateAlert.trackingCode})`);
      return;
    }

    if (!formData.causeOfLoss) {
      setErrorMsg('กรุณาระบุสาเหตุการสูญเสีย (พฤติการณ์เหตุการณ์ตาม กพ.4)');
      return;
    }

    const specificCause = (formData.lossSpecificCause || (formData.lossType === 'DECEASED' ? formData.deathCertificateCause : formData.disabledOrganDetail) || formData.deathCertificateCause || '').trim();

    if (formData.lossType === 'DECEASED' && !specificCause) {
      setErrorMsg('กรุณาระบุสาเหตุการเสียชีวิต (ตามใบมรณบัตร)');
      return;
    }

    if (formData.lossType === 'DISABLED' && !specificCause) {
      setErrorMsg('กรุณาระบุสาเหตุการสูญเสีย / อวัยวะที่สูญเสีย (กรณีพิการทุพพลภาพ)');
      return;
    }

    // ตรวจสอบเอกสารบังคับ
    const missingDocs = [];
    if (!attachedDocs.find((d) => d.index === 1)?.uploaded) missingDocs.push('1. รายงาน กพ.4');
    if (formData.lossType === 'DECEASED' && !attachedDocs.find((d) => d.index === 2)?.uploaded) {
      missingDocs.push('2. ใบมรณบัตร (กรณีผู้เสียชีวิต)');
    }
    if (formData.lossType === 'DISABLED' && !attachedDocs.find((d) => d.index === 7)?.uploaded) {
      missingDocs.push('7. คำสั่งปลดพ้นหรือปลดออกจากราชการ (กรณีทุพพลภาพ)');
    }
    // กรณีปฏิบัติหน้าที่สำคัญ (รับเงิน 300,000 บาท) ต้องแนบรูปถ่าย 4x6 นิ้ว แต่ถ้ารับเงิน 60,000 บาท ไม่ต้องแนบ
    if (formData.claimType === 'HIGH_RISK' && !attachedDocs.find((d) => d.index === 10)?.uploaded) {
      missingDocs.push('10. รูปถ่ายขนาด 4x6 นิ้ว (จำเป็นสำหรับกรณีปฏิบัติหน้าที่สำคัญ รับเงิน 300,000 บาท)');
    }

    if (missingDocs.length > 0) {
      setErrorMsg(`กรุณาแนบเอกสารสำคัญให้ครบถ้วน: ${missingDocs.join(', ')}`);
      return;
    }

    // ตรวจสอบความปลอดภัยและขนาดไฟล์ของเอกสารที่แนบทั้งหมด (ป้องกันไฟล์สั่งรัน .exe และจำกัดขนาดไม่เกิน 10MB)
    for (const doc of attachedDocs) {
      if (doc.uploaded && doc.fileName) {
        const val = validateAttachmentFile({ name: doc.fileName, size: doc.fileSize });
        if (!val.valid) {
          setErrorMsg(`เอกสารข้อที่ ${doc.index} (${doc.name}): ${val.error}`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        userId: currentUser?.id || 'usr-unit-1',
        claimData: {
          ...formData,
          incidentType: formData.incidentType,
          isDriver: formData.incidentType === 'ACCIDENT' ? formData.isDriver : null,
          alcoholTestResult: formData.incidentType === 'ACCIDENT' ? formData.alcoholTestResult : null,
          lossSpecificCause: specificCause,
          deathCertificateCause: formData.lossType === 'DECEASED' ? specificCause : (formData.deathCertificateCause || ''),
          disabledOrganDetail: formData.lossType === 'DISABLED' ? specificCause : '',
          documents: attachedDocs
        }
      };

      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      setSuccessMsg(`ยื่นเสนอเรื่องสำเร็จ! เลขที่อ้างอิง: ${resData.claim.trackingCode}`);

      // แจ้งเตือน Popup Modal ยืนยันการยื่นเสนอเรื่อง
      triggerStatusPopup({
        type: 'success',
        title: 'ยื่นเสนอขอรับสิทธิเงินค่าสินไหมทดแทนสำเร็จ',
        message: `ระบบได้บันทึกรายงานขอรับสิทธิและออกเลขติดตาม ${resData.claim.trackingCode} เข้าสู่กระบวนการพิจารณาตาม SLA 30 วัน`,
        trackingCode: resData.claim.trackingCode,
        casualtyName: `${resData.claim.casualtyRank} ${resData.claim.casualtyFirstName} ${resData.claim.casualtyLastName}`,
        action: 'ยื่นเสนอขอรับสิทธิสินไหม (สร้างคำร้องใหม่)',
        by: currentUser ? `${currentUser.name} (${currentUser.role})` : 'เจ้าหน้าที่หน่วย',
        ref: resData.claim.trackingCode
      });

      setTimeout(() => {
        router.push(`/claims/${resData.claim.id}`);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      
      {/* Navigation & Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button 
            onClick={() => router.back()} 
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '10px' }}
          >
            <ArrowLeft size={14} />
            <span>ย้อนกลับ</span>
          </button>
          <h1 style={{ fontSize: '24px' }}>แบบรายงานเสนอขอรับสิทธิเงินค่าสินไหมทดแทน</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            สำหรับเจ้าหน้าที่หน่วยต้นสังกัดบันทึกรายงานผู้สูญเสีย (เสียชีวิต หรือ พิการทุพพลภาพ)
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '12px 18px', textAlign: 'right', borderLeft: '3px solid var(--gold-primary)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ผู้เสนอเรื่อง (เข้าสู่ระบบโดย)</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{currentUser?.name || 'ร.อ. สมหมาย กล้าหาญ'}</div>
          <div style={{ fontSize: '12px', color: 'var(--gold-primary)' }}>{formData.unitName}</div>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid var(--ruby-danger)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--emerald-success)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#6ee7b7',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* Section 1: ข้อมูลการเสนอเรื่อง & สังกัด */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)' }}>
              <Building size={18} />
              <span>1. ข้อมูลรายงาน และ หน่วยสังกัด</span>
            </h2>
            <a 
              href="/units" 
              target="_blank"
              style={{ fontSize: '12px', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              <GitFork size={13} />
              <span>ระบบผังโครงสร้างหน่วย ทบ.</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* แถวที่ 1: วันที่รายงาน และ สิทธิที่ขอรับ */}
          <div className="grid-cols-2" style={{ marginBottom: '18px' }}>
            <div className="form-group">
              <label className="form-label required">วันที่รายงาน (พ.ศ.)</label>
              <input 
                type="date" 
                className="form-input"
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                required
              />
              <span style={{ fontSize: '12px', color: 'var(--gold-primary)', marginTop: '4px', display: 'block' }}>
                วันที่ พ.ศ.: {formatThaiDate(formData.reportDate)}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label required">ประเภทสิทธิเงินสินไหมทดแทน</label>
              <select 
                className="form-select"
                value={formData.claimType}
                onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                required
              >
                <option value="HIGH_RISK">หน้าที่สำคัญ หรือ ปฏิบัติหน้าที่สำคัญ (รับเงิน 300,000 บาท)</option>
                <option value="NORMAL">ยามปกติ หรือ ปฏิบัติราชการทั่วไป (รับเงิน 60,000 บาท)</option>
              </select>
              <span style={{ fontSize: '12px', color: formData.claimType === 'HIGH_RISK' ? 'var(--gold-primary)' : 'var(--emerald-success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {formData.claimType === 'HIGH_RISK' ? (
                  <><span>⭐</span> <span>รับเงินสินไหม 300,000 บาท (ต้องแนบเอกสารข้อ 10: รูปถ่ายขนาด 4x6 นิ้ว)</span></>
                ) : (
                  <><span>✓</span> <span>รับเงินสินไหม 60,000 บาท (ไม่ต้องแนบเอกสารข้อ 10: รูปถ่ายขนาด 4x6 นิ้ว)</span></>
                )}
              </span>
            </div>
          </div>

          {/* แถวที่ 2: โครงสร้างสายการบังคับบัญชา 3 ระดับ (Cascading Selectors) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} />
              <span>เลือกโครงสร้างหน่วยสังกัดตามลำดับสายการบังคับบัญชา (3 ระดับ)</span>
            </div>

            <div className="grid-cols-3" style={{ gap: '14px' }}>
              
              {/* ระดับ 1: ระดับ ทบ. */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label required" style={{ fontSize: '12.5px', color: 'var(--gold-light)' }}>
                  1. ระดับ ทบ. / บชร. / กองทัพภาค
                </label>
                <select 
                  className="form-select"
                  value={level1Id}
                  onChange={(e) => handleLevel1Change(e.target.value)}
                  required
                >
                  {getLevel1Units(allUnits).map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.code || u.shortName}] {u.name}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  เช่น ทภ.1 - 4, นสศ., นปอ., ยศ.ทบ., กพ.ทบ.
                </span>
              </div>

              {/* ระดับ 2: ระดับ กองพล / มณฑลทหารบก */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12.5px', color: 'var(--cyan-accent)' }}>
                  2. ระดับ กองพล / มณฑลทหารบก (มทบ.)
                </label>
                {getLevel2Units(level1Id, allUnits).length > 0 ? (
                  <select 
                    className="form-select"
                    value={level2Id}
                    onChange={(e) => handleLevel2Change(e.target.value)}
                  >
                    <option value="">-- ไม่ระบุ / ขึ้นตรง ทบ. --</option>
                    {getLevel2Units(level1Id, allUnits).map((u) => (
                      <option key={u.id} value={u.id}>
                        [{u.code || u.shortName}] {u.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input" 
                    value="หน่วยขึ้นตรงระดับ ทบ. (ไม่มีระดับกองพล)" 
                    disabled 
                    style={{ opacity: 0.6, fontSize: '12.5px' }} 
                  />
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  เช่น พล.1 รอ., พล.ร.2 รอ., พล.ร.3, พล.ร.9, มทบ.
                </span>
              </div>

              {/* ระดับ 3: ระดับ กรม หรือ กองพัน */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12.5px', color: 'var(--emerald-light, #a7f3d0)' }}>
                  3. ระดับ กรม หรือ กองพัน
                </label>
                {getLevel3Units(level2Id || level1Id, allUnits).length > 0 ? (
                  <select 
                    className="form-select"
                    value={level3Id}
                    onChange={(e) => handleLevel3Change(e.target.value)}
                  >
                    <option value="">-- ไม่ระบุ / ขึ้นตรงกองพล --</option>
                    {getLevel3Units(level2Id || level1Id, allUnits).map((u) => (
                      <option key={u.id} value={u.id}>
                        [{u.code || u.shortName}] {u.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input" 
                    value="ขึ้นตรงตามสายบังคับบัญชากองพล" 
                    disabled 
                    style={{ opacity: 0.6, fontSize: '12.5px' }} 
                  />
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  เช่น ร.2 รอ., ร.2 พัน.1 รอ., ร.12 รอ., ร.21 รอ., ร.9 พัน.1
                </span>
              </div>

            </div>

            {/* แถวที่ 3: ระบุหน่วยเฉพาะกิจ / กองร้อย / หมวด เพิ่มเติม */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  หน่วยย่อยเฉพาะกิจ / กองร้อย / ชุดปฏิบัติการ (ถ้ามี)
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="เช่น ร้อย.ร.111, ชคต.บาเจาะ, ฉก.ทพ.41, มว.ปล.ที่ 1"
                  value={subUnitName}
                  onChange={(e) => handleSubUnitChange(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>
            </div>

            {/* แถบสรุปสายการบังคับบัญชาแบบ Breadcrumb Preview */}
            <div style={{
              marginTop: '14px',
              padding: '12px 16px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} />
                  <span>สายการบังคับบัญชาที่รายงาน:</span>
                </span>
                <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                  {formData.unitPath || `${formData.unitName}`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                  {level3Id ? 'ระดับ กรม/กองพัน' : level2Id ? 'ระดับ กองพล' : 'ระดับ ทบ.'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  รหัสหน่วย: {formData.unitId}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: ข้อมูลผู้สูญเสีย */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)' }}>
            <User size={18} />
            <span>2. ข้อมูลกำลังพลผู้สูญเสีย</span>
          </h2>

          <div className="grid-cols-4">
            
            {/* Auto-complete ยศ */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label required">ยศ / คำนำหน้านาม (Auto-complete)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="พิมพ์ค้นหายศ เช่น ร.ต., ส.ต.หญิง, นาย, นาง, น.ส."
                value={rankInput}
                onChange={(e) => handleRankChange(e.target.value)}
                onFocus={() => {
                  setFilteredRanks(MILITARY_RANKS);
                  setShowRankDropdown(true);
                }}
                required
              />

              {showRankDropdown && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  top: '72px',
                  left: 0,
                  width: '100%',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  zIndex: 20,
                  background: 'rgba(12, 22, 48, 0.98)',
                  padding: '4px'
                }}>
                  {filteredRanks.map((r) => (
                    <div 
                      key={r}
                      onClick={() => selectRank(r)}
                      style={{
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        borderRadius: '4px',
                        color: '#fff'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(212, 175, 55, 0.2)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">ชื่อ</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="ชื่อตัว"
                value={formData.casualtyFirstName}
                onChange={(e) => setFormData({ ...formData, casualtyFirstName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">นามสกุล</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="นามสกุล"
                value={formData.casualtyLastName}
                onChange={(e) => setFormData({ ...formData, casualtyLastName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">เลขประจำตัวประชาชน (13 หลัก)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="x-xxxx-xxxxx-xx-x"
                maxLength={17}
                value={formData.casualtyCitizenId}
                onChange={(e) => handleCitizenIdChange(e.target.value)}
                required
              />
              {duplicateAlert ? (
                <div style={{
                  fontSize: '12px',
                  marginTop: '6px',
                  padding: '6px 10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid var(--ruby-danger)',
                  borderRadius: '4px',
                  color: '#f87171'
                }}>
                  ⚠️ <strong>ห้ามยื่นเรื่องซ้ำ:</strong> เลขประจำตัวประชาชนนี้เคยยื่นเสนอเรื่องแล้ว ({duplicateAlert.trackingCode}) โดย {duplicateAlert.unitName}
                </div>
              ) : formData.casualtyCitizenId ? (
                <span style={{
                  fontSize: '11.5px',
                  marginTop: '4px',
                  display: 'block',
                  color: validateCitizenId(formData.casualtyCitizenId) ? 'var(--emerald-success)' : 'var(--ruby-danger)'
                }}>
                  {validateCitizenId(formData.casualtyCitizenId) ? '✓ เลขบัตร ปชช. ถูกต้อง (พร้อมตรวจสอบซ้ำ)' : '✗ เลขบัตร ปชช. ไม่ถูกต้องตามหลัก Mod 11'}
                </span>
              ) : null}
            </div>

          </div>

          <div className="grid-cols-4">
            
            <div className="form-group">
              <label className="form-label required">ประเภทการสูญเสีย</label>
              <select 
                className="form-select"
                value={formData.lossType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData((prev) => ({ 
                    ...prev, 
                    lossType: newType,
                    deathCertificateCause: newType === 'DECEASED' ? (prev.lossSpecificCause || prev.deathCertificateCause) : '',
                    disabledOrganDetail: newType === 'DISABLED' ? (prev.lossSpecificCause || prev.disabledOrganDetail) : ''
                  }));
                }}
                required
              >
                <option value="DECEASED">ผู้เสียชีวิต</option>
                <option value="DISABLED">พิการทุพพลภาพ</option>
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label required" style={{ margin: 0 }}>ประเภทกำลังพล</label>
                <span style={{ fontSize: '11px', color: 'var(--emerald-success)', fontWeight: 500 }}>
                  ✨ อัตโนมัติตามยศ
                </span>
              </div>
              <select 
                className="form-select"
                value={formData.personnelType}
                onChange={(e) => setFormData({ ...formData, personnelType: e.target.value })}
                required
              >
                {PERSONNEL_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                เทียบสัมพันธ์กับยศ {formData.casualtyRank || '...'} (ปรับเปลี่ยนเองได้)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label required">เพศ</label>
              <select 
                className="form-select"
                value={formData.casualtyGender}
                onChange={(e) => setFormData({ ...formData, casualtyGender: e.target.value })}
                required
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">วัน/เดือน/ปีเกิด (พ.ศ.)</label>
              <input 
                type="date" 
                className="form-input"
                value={formData.casualtyBirthDate}
                onChange={(e) => setFormData({ ...formData, casualtyBirthDate: e.target.value })}
                required
              />
              <span style={{ fontSize: '12px', color: 'var(--gold-primary)', marginTop: '4px', display: 'block' }}>
                เกิด พ.ศ.: {formatThaiDate(formData.casualtyBirthDate)} (ใช้ยืนยันสถานะสิทธิ)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label required">วันที่สูญเสีย (พ.ศ.)</label>
              <input 
                type="date" 
                className="form-input"
                value={formData.lossDate}
                onChange={(e) => setFormData({ ...formData, lossDate: e.target.value })}
                required
              />
              <span style={{ fontSize: '12px', color: 'var(--gold-primary)', marginTop: '4px', display: 'block' }}>
                สูญเสีย พ.ศ.: {formatThaiDate(formData.lossDate)}
              </span>
            </div>

          </div>

          {/* ข้อมูลลักษณะการเกิดเหตุ: ป่วย หรือ อุบัติเหตุ */}
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: formData.incidentType === 'ACCIDENT' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            border: formData.incidentType === 'ACCIDENT' ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid var(--border-glass)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: formData.incidentType === 'ACCIDENT' ? '1fr 1fr 1.2fr' : '1fr 2fr', gap: '14px', alignItems: 'flex-start' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label required" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>ลักษณะการเกิดเหตุ</span>
                  <span className="badge badge-gold" style={{ fontSize: '10.5px' }}>ป่วย / อุบัติเหตุ</span>
                </label>
                <select
                  className="form-select"
                  value={formData.incidentType}
                  onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                  required
                >
                  <option value="ILLNESS">ป่วย (โรคประจำตัว / เจ็บป่วยขณะปฏิบัติหน้าที่ / หัวใจวาย)</option>
                  <option value="ACCIDENT">อุบัติเหตุ (อุบัติเหตุจราจร / ยานพาหนะ / การฝึก / อาวุธ)</option>
                  <option value="COMBAT">การปฏิบัติการรบ / ปะทะ / ลอบโจมตี / เสี่ยงภัยความมั่นคง</option>
                  <option value="OTHER">อื่นๆ / ไม่ระบุ</option>
                </select>
                <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  เลือกกรณี ป่วย หรือ อุบัติเหตุ เพื่อระบุข้อมูลประกอบ
                </span>
              </div>

              {/* เงื่อนไขเฉพาะกรณีเลือก "อุบัติเหตุ": เลือกว่าเป็นผู้ขับขี่หรือไม่ใช่ผู้ขับขี่ & ผลการตรวจวัดแอลกอฮอล์ */}
              {formData.incidentType === 'ACCIDENT' ? (
                <>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label required" style={{ color: 'var(--gold-light)' }}>
                      สถานะการขับขี่ (กรณีอุบัติเหตุ)
                    </label>
                    <select
                      className="form-select"
                      value={formData.isDriver}
                      onChange={(e) => setFormData({ ...formData, isDriver: e.target.value })}
                      required
                      style={{ borderColor: 'rgba(234, 179, 8, 0.4)' }}
                    >
                      <option value="YES">🚗 เป็นผู้ขับขี่</option>
                      <option value="NO">🚶/🚌 ไม่ใช่ผู้ขับขี่ (ผู้โดยสาร / เดินเท้า / ผู้ประสบเหตุ)</option>
                    </select>
                    <span style={{ fontSize: '11.5px', color: 'var(--gold-primary)', marginTop: '4px', display: 'block' }}>
                      {formData.isDriver === 'YES' ? '✓ ผู้สูญเสียเป็นผู้ขับขี่หรือควบคุมยานพาหนะ' : '✓ ผู้สูญเสียเป็นผู้โดยสารหรือบุคคลภายนอก'}
                    </span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label required" style={{ color: 'var(--gold-light)' }}>
                      ผลการตรวจวัดแอลกอฮอล์ในเลือด
                    </label>
                    <select
                      className="form-select"
                      value={formData.alcoholTestResult}
                      onChange={(e) => setFormData({ ...formData, alcoholTestResult: e.target.value })}
                      required
                      style={{ borderColor: formData.alcoholTestResult === 'EXCEEDED' ? 'var(--ruby-danger)' : 'rgba(234, 179, 8, 0.4)' }}
                    >
                      <option value="NOT_EXCEEDED">✓ ไม่เกินที่กฎหมายกำหนด (ไม่พบหรือ ≤ 50 mg%)</option>
                      <option value="EXCEEDED">⚠️ เกินที่กฎหมายกำหนด (&gt; 50 mg%)</option>
                      <option value="PENDING">⏳ อยู่ระหว่างรอผลตรวจจากนิติเวช / รพ.</option>
                      <option value="NOT_TESTED">⚪ ไม่ได้ตรวจ / ไม่สามารถตรวจได้</option>
                    </select>
                    <span style={{
                      fontSize: '11.5px',
                      color: formData.alcoholTestResult === 'EXCEEDED' ? 'var(--ruby-danger)' : formData.alcoholTestResult === 'NOT_EXCEEDED' ? 'var(--emerald-success)' : 'var(--text-dim)',
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      {formData.alcoholTestResult === 'EXCEEDED' 
                        ? '⚠️ ผลตรวจเกิน 50 mg% ต้องแนบหลักฐานข้อ 8 ชี้แจง' 
                        : 'ผลตรวจระดับแอลกอฮอล์ตามหลักฐานข้อ 8'}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: 'var(--text-dim)',
                  height: '100%',
                  boxSizing: 'border-box'
                }}>
                  {formData.incidentType === 'ILLNESS'
                    ? '🏥 กรณีป่วย / โรคประจำตัว: ได้รับการยกเว้นไม่ต้องระบุสถานะผู้ขับขี่และผลตรวจแอลกอฮอล์จราจร'
                    : '🛡️ กรณีปฏิบัติการรบ / เสี่ยงภัยความมั่นคง: เป็นไปตามระเบียบเงินสินไหมทดแทน ทบ.'}
                </div>
              )}
            </div>

            {formData.incidentType === 'ACCIDENT' && (
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px dashed rgba(234, 179, 8, 0.35)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#fef08a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={16} color="var(--gold-primary)" />
                <span>
                  <strong>ข้อสังเกตกรณีอุบัติเหตุ:</strong> กรุณาแนบเอกสารข้อที่ 8 (หลักฐานพิสูจน์ระดับแอลกอฮอล์ในเลือด) และเอกสารข้อที่ 9 (ผลการสอบสวนของเจ้าหน้าที่ตำรวจ กรณีอุบัติเหตุทางถนน)
                </span>
              </div>
            )}
          </div>

          {/* ข้อมูลสาเหตุการสูญเสียเฉพาะกรณี (เสียชีวิต: ตามใบมรณบัตร / พิการ: อวัยวะที่สูญเสีย) */}
          <div style={{ marginTop: '16px' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label required" style={{ marginBottom: 0 }}>
                  {formData.lossType === 'DECEASED' ? (
                    <span>สาเหตุการเสียชีวิต (ตามใบมรณบัตร)</span>
                  ) : (
                    <span>สาเหตุการสูญเสีย / อวัยวะที่สูญเสีย (กรณีพิการทุพพลภาพ)</span>
                  )}
                </label>
                <span className="badge" style={{
                  fontSize: '11px',
                  background: formData.lossType === 'DECEASED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: formData.lossType === 'DECEASED' ? '#fca5a5' : 'var(--gold-primary)',
                  border: formData.lossType === 'DECEASED' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)'
                }}>
                  {formData.lossType === 'DECEASED' ? '🏥 บันทึกตามใบมรณบัตร' : '♿ บันทึกอวัยวะที่สูญเสีย / ความพิการ'}
                </span>
              </div>
              <input 
                type="text" 
                className="form-input" 
                placeholder={
                  formData.lossType === 'DECEASED'
                    ? 'เช่น บาดแผลจากสะเก็ดระเบิดหลายแห่ง, เลือดออกในช่องท้องรุนแรง, ภาวะหัวใจหยุดเต้น...'
                    : 'เช่น สูญเสียขาทั้งสองข้างระดับเหนือเข่า, สูญเสียแขนซ้ายและสายตาข้างขวา, ทุพพลภาพอัมพาตท่อนล่าง...'
                }
                value={formData.lossSpecificCause || (formData.lossType === 'DECEASED' ? formData.deathCertificateCause : formData.disabledOrganDetail) || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ 
                    ...prev, 
                    lossSpecificCause: val,
                    deathCertificateCause: prev.lossType === 'DECEASED' ? val : prev.deathCertificateCause,
                    disabledOrganDetail: prev.lossType === 'DISABLED' ? val : prev.disabledOrganDetail
                  }));
                }}
                required
              />
              <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                {formData.lossType === 'DECEASED'
                  ? 'คัดลอกข้อความระบุสาเหตุการตายตามที่ปรากฏในเอกสารใบมรณบัตร (แบบ ท.ร.๔)'
                  : 'ระบุรายละเอียดอวัยวะที่สูญเสีย หรือลักษณะความพิการทุพพลภาพตามใบรับรองแพทย์หรือผลการประเมิน'}
              </span>
            </div>

            {/* สาเหตุการสูญเสีย (รายละเอียดและพฤติการณ์เหตุการณ์ - ตามพฤติกรรมในรายงาน กพ.4) - ขยายช่องกรอกขนาดใหญ่ */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label required" style={{ marginBottom: 0, fontSize: '14.5px', color: 'var(--gold-light)' }}>
                  สาเหตุการสูญเสีย (รายละเอียดและพฤติการณ์เหตุการณ์ - ตามพฤติกรรมในรายงาน กพ.4)
                </label>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {formData.causeOfLoss ? `${formData.causeOfLoss.length} ตัวอักษร` : 'กรอกได้หลายบรรทัด'}
                </span>
              </div>
              <textarea 
                className="form-textarea" 
                rows={5}
                style={{
                  width: '100%',
                  minHeight: '130px',
                  lineHeight: '1.6',
                  fontSize: '14px',
                  resize: 'vertical',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid var(--border-glass)'
                }}
                placeholder="ระบุรายละเอียดและพฤติการณ์เหตุการณ์โดยละเอียดตามที่ระบุในแบบรายงานการสูญเสียกำลังพล (กพ.4) เช่น วัน เวลา เกิดเหตุ ขณะที่หน่วยทำการลาดตระเวนเส้นทาง รปภ.ครู ในพื้นที่... ได้ถูกกลุ่มผู้ก่อเหตุรุนแรงลอบวางระเบิดแสวงเครื่อง... ส่งผลให้กำลังพลได้รับบาดเจ็บบริเวณ... และเสียชีวิตระหว่างนำส่งโรงพยาบาล..."
                value={formData.causeOfLoss}
                onChange={(e) => setFormData({ ...formData, causeOfLoss: e.target.value })}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  💡 ระบุรายละเอียดและพฤติการณ์ตามที่ระบุในแบบรายงานการสูญเสียกำลังพล (กพ.4) สามารถกรอกข้อความยาวและขึ้นบรรทัดใหม่ได้
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11.5px', padding: '3px 10px' }}
                  onClick={() => {
                    if (!formData.causeOfLoss) {
                      setFormData({
                        ...formData,
                        causeOfLoss: `เมื่อวันที่ ${formatThaiDate(formData.lossDate) || '...'} เวลาประมาณ ... น. ขณะที่กำลังพลสังกัด ${formData.unitName || 'หน่วย...'} ได้รับคำสั่งให้ปฏิบัติภารกิจ... ในพื้นที่... ได้เกิดเหตุ... ส่งผลให้ได้รับบาดเจ็บบริเวณ... และเสียชีวิตในเวลาต่อมา ตามที่ปรากฏในแบบรายงาน กพ.4`
                      });
                    }
                  }}
                >
                  📝 ใส่โครงข้อความตัวอย่าง กพ.4
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Section 3: สถานที่เสียชีวิต / ปักหมุด Google Map */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--emerald-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '17px', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--emerald-success)" />
                <span>3. สถานที่เสียชีวิต / เกิดเหตุ (ปักหมุด Google Map)</span>
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>
                คลิกปักหมุดบนแผนที่ หรือเลือกพิกัดด่วน ระบบจะดึงข้อมูล ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด อัตโนมัติ
              </p>
            </div>
          </div>

          <LocationPicker 
            value={formData.locationOfLoss}
            onChange={(loc) => setFormData({ ...formData, locationOfLoss: loc })}
          />
        </div>

        {/* Section 4: รายการเอกสารหลักฐานแนบ 10 รายการ */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)' }}>
                <Paperclip size={18} />
                <span>4. เอกสารหลักฐานประกอบแนบไฟล์ 10 รายการ</span>
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
                {formData.lossType === 'DISABLED' 
                  ? 'กรณีพิการทุพพลภาพ: เอกสารข้อ 2 (ใบมรณบัตร) ได้รับการยกเว้นไม่ต้องแนบ (ต้องแนบข้อ 7 คำสั่งปลดฯ)' 
                  : 'กรณีผู้เสียชีวิต: บังคับแนบเอกสารข้อ 2 (ใบมรณบัตร)'}
                {formData.claimType === 'HIGH_RISK' 
                  ? ' • กรณีหน้าที่สำคัญ (300,000 บาท) บังคับแนบข้อ 10 (รูปถ่าย 4x6 นิ้ว)' 
                  : ' • กรณีรับเงิน 60,000 บาท ยกเว้นข้อ 10 (ไม่ต้องแนบ)'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600 }}>
                🛡️ ไฟล์ขนาดไม่เกิน 10MB ต่อไฟล์ (PDF, JPG, PNG, DOC, DOCX)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ruby-danger)', marginTop: '2px' }}>
                🔒 ระบบมีระบบป้องกันความปลอดภัย ปฏิเสธไฟล์สั่งรัน (.exe, .bat, .cmd, .sh ฯลฯ) อัตโนมัติ
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attachedDocs.map((doc) => {
              const isHighRisk = formData.claimType === 'HIGH_RISK';
              const isDoc10 = doc.index === 10;
              const isDoc2 = doc.index === 2;
              const isDoc7 = doc.index === 7;
              const isDeceased = formData.lossType === 'DECEASED';
              const isDisabled = formData.lossType === 'DISABLED';

              const isMandatory = 
                doc.index === 1 || 
                (isDoc2 && isDeceased) ||
                (isDoc7 && isDisabled) ||
                (isDoc10 && isHighRisk) ||
                doc.index === 3 || doc.index === 4 || doc.index === 5 || doc.index === 6 || doc.index === 8;

              const isExempt = 
                (isDoc10 && !isHighRisk) || 
                (isDoc2 && isDisabled) || 
                (isDoc7 && isDeceased);

              // กำหนดหมายเหตุแสดงผลเฉพาะกรณี
              let displayNote = doc.note;
              if (isDoc10) {
                displayNote = isHighRisk 
                  ? 'บังคับแนบเฉพาะกรณีปฏิบัติหน้าที่สำคัญ (รับเงิน 300,000 บาท)' 
                  : 'กรณีรับเงิน 60,000 บาท ไม่ต้องแนบเอกสารนี้ (ยกเว้น)';
              } else if (isDoc2) {
                displayNote = isDeceased
                  ? 'บังคับแนบเฉพาะกรณีผู้เสียชีวิต'
                  : 'กรณีพิการทุพพลภาพ ไม่ต้องแนบใบมรณบัตร (ได้รับการยกเว้น)';
              } else if (isDoc7) {
                displayNote = isDisabled
                  ? 'บังคับแนบเฉพาะกรณีทุพพลภาพ'
                  : 'กรณีผู้เสียชีวิต ไม่ต้องแนบเอกสารนี้ (ยกเว้น)';
              }

              return (
                <div 
                  key={doc.index}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: doc.uploaded 
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : (isExempt ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.03)'),
                    border: doc.uploaded 
                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                      : (isExempt ? '1px dashed rgba(255, 255, 255, 0.08)' : '1px solid var(--border-glass)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    opacity: (isExempt && !doc.uploaded) ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: doc.uploaded 
                        ? 'var(--emerald-success)' 
                        : (isExempt ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'),
                      color: doc.uploaded ? '#070d1e' : 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}>
                      {doc.index}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: doc.uploaded ? '#fff' : '#cbd5e1', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span>{doc.name}</span>
                        {isMandatory && <span style={{ color: 'var(--ruby-danger)' }}>*</span>}
                        {isDoc2 && isDeceased && (
                          <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            ★ บังคับแนบ (กรณีผู้เสียชีวิต)
                          </span>
                        )}
                        {isDoc2 && isDisabled && (
                          <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-success)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            ✓ ยกเว้นไม่ต้องแนบ (กรณีพิการทุพพลภาพ)
                          </span>
                        )}
                        {isDoc7 && isDisabled && (
                          <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: 'var(--gold-primary)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                            ★ บังคับแนบ (กรณีทุพพลภาพ)
                          </span>
                        )}
                        {isDoc7 && isDeceased && (
                          <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-success)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            ✓ ยกเว้นไม่ต้องแนบ (กรณีผู้เสียชีวิต)
                          </span>
                        )}
                        {isDoc10 && isHighRisk && (
                          <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: 'var(--gold-primary)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                            ★ บังคับแนบ (รับเงิน 300,000 บาท)
                          </span>
                        )}
                        {isDoc10 && !isHighRisk && (
                          <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-success)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            ✓ ยกเว้นไม่ต้องแนบ (รับเงิน 60,000 บาท)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: (isDoc10 && isHighRisk) || (isDoc2 && isDeceased) || (isDoc7 && isDisabled) ? 'var(--gold-primary)' : 'var(--text-dim)' }}>
                        {displayNote ? `(หมายเหตุ: ${displayNote})` : 'เอกสารประกอบตามระเบียบ ทบ.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {doc.uploaded ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
                          <span 
                            style={{ 
                              fontSize: '12px', 
                              color: 'var(--emerald-success)', 
                              fontWeight: 500, 
                              maxWidth: '180px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }} 
                            title={doc.fileName}
                          >
                            📎 {doc.fileName}
                          </span>
                          {doc.fileSize > 0 && (
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                              ({(doc.fileSize / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          )}
                        </div>

                        {/* ปุ่มพรีวิวเอกสารที่แนบ */}
                        <button
                          type="button"
                          onClick={() => handleOpenPreviewDoc(doc)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            gap: '5px',
                            background: 'rgba(20, 184, 166, 0.15)',
                            borderColor: 'var(--cyan-accent)',
                            color: 'var(--cyan-accent)'
                          }}
                          title="กดดูพรีวิวเอกสารที่แนบนี้"
                        >
                          <Eye size={14} />
                          <span>พรีวิวเอกสาร</span>
                        </button>

                        {/* ปุ่มเปลี่ยนไฟล์ */}
                        <label 
                          className="btn btn-secondary btn-sm" 
                          style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '12px', gap: '5px' }}
                          title="เลือกไฟล์ใหม่เพื่อแทนที่เอกสารนี้ (ขนาดไม่เกิน 10MB)"
                        >
                          <Upload size={13} />
                          <span>เปลี่ยนไฟล์</span>
                          <input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              handleFileUpload(doc.index, e);
                              e.target.value = '';
                            }} 
                          />
                        </label>

                        {/* ปุ่มลบเอกสารเพื่อแนบใหม่ */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(doc.index)}
                          className="btn btn-sm"
                          style={{
                            padding: '6px 10px',
                            fontSize: '12px',
                            gap: '5px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#fca5a5',
                            cursor: 'pointer'
                          }}
                          title="ลบเอกสารนี้เพื่อแนบไฟล์ใหม่"
                        >
                          <Trash2 size={13} />
                          <span>ลบเอกสาร</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenPreviewDoc(doc)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 10px', fontSize: '12px', gap: '5px', color: 'var(--text-dim)' }}
                          title="ดูตัวอย่างแบบฟอร์มทางการ"
                        >
                          <Eye size={13} />
                          <span>ดูตัวอย่าง</span>
                        </button>

                        <label 
                          className="btn btn-secondary btn-sm" 
                          style={{ 
                            cursor: 'pointer', 
                            padding: '6px 14px', 
                            fontSize: '12px', 
                            gap: '6px', 
                            borderColor: isExempt ? 'var(--border-glass)' : 'var(--gold-primary)', 
                            color: isExempt ? 'var(--text-dim)' : 'var(--gold-light)' 
                          }}
                          title="กดแนบไฟล์เอกสารนี้ (ขนาดไม่เกิน 10MB)"
                        >
                          <Upload size={14} />
                          <span>{isExempt ? 'แนบไฟล์ (ไม่บังคับ)' : 'แนบไฟล์'}</span>
                          <input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              handleFileUpload(doc.index, e);
                              e.target.value = '';
                            }} 
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
          <button 
            type="button" 
            onClick={() => router.push('/')} 
            className="btn btn-secondary"
            disabled={submitting}
          >
            ยกเลิก
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '15px' }}
            disabled={submitting}
          >
            <FileCheck size={18} />
            <span>{submitting ? 'กำลังบันทึกและส่งเรื่อง...' : 'ยื่นเสนอเรื่องขอรับสิทธิเงินสินไหม'}</span>
          </button>
        </div>

      </form>

      {/* ========================================================================= */}
      {/* MODAL: พรีวิวเอกสารที่แนบในหน้ายื่นเสนอเรื่อง (Attached Document Preview Modal) */}
      {/* ========================================================================= */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 8, 12, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(4, 20, 23, 0.98)',
            border: '1px solid var(--cyan-accent)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(20, 184, 166, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--cyan-accent)',
                  color: '#041417',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  {previewDoc.index}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', color: '#fff', margin: 0 }}>
                    พรีวิวเอกสาร: {previewDoc.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {previewDoc.uploaded 
                      ? `ไฟล์แนบ: ${previewDoc.fileName} • สังกัด: ${formData.unitName}` 
                      : `ตัวอย่างแบบฟอร์มทางการ • สังกัด: ${formData.unitName}`}
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="ปิดหน้าต่างพรีวิว"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: SampleDocumentViewer */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#0b1619' }}>
              <SampleDocumentViewer 
                doc={previewDoc} 
                claim={{
                  ...formData,
                  compensationAmount: formData.claimType === 'HIGH_RISK' ? 300000 : 60000,
                  trackingCode: 'แบบร่างคำร้อง ทบ.'
                }} 
                onDownload={handleDownloadDoc} 
              />
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(3, 16, 19, 0.95)',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {previewDoc.uploaded ? (
                  <span style={{ color: 'var(--emerald-success)' }}>
                    ✓ แนบไฟล์เรียบร้อยแล้ว: <strong>{previewDoc.fileName}</strong>
                  </span>
                ) : (
                  <span>ยังไม่มีการแนบไฟล์สำหรับเอกสารข้อนี้</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* เปลี่ยนไฟล์ใน Modal */}
                <label 
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer', gap: '6px' }}
                >
                  <Upload size={14} />
                  <span>{previewDoc.uploaded ? 'เปลี่ยนไฟล์แนบ' : 'แนบไฟล์นี้'}</span>
                  <input 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      handleFileUpload(previewDoc.index, e);
                      e.target.value = '';
                    }} 
                  />
                </label>

                {/* ลบเอกสารใน Modal */}
                {previewDoc.uploaded && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveFile(previewDoc.index)}
                    className="btn btn-danger btn-sm"
                    style={{ gap: '6px' }}
                    title="ลบไฟล์แนบนี้ออกเพื่อแนบใหม่"
                  >
                    <Trash2 size={14} />
                    <span>ลบเอกสารแนบ</span>
                  </button>
                )}

                <button 
                  type="button"
                  onClick={() => setPreviewDoc(null)} 
                  className="btn btn-secondary btn-sm"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
