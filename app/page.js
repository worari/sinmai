// app/page.js - Portal Hub ประชาสัมพันธ์ คู่มือใช้งาน วิดีโอ และระบบติดตามสิทธิ
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Search, 
  BookOpen, 
  Video, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CreditCard, 
  FileText, 
  ArrowRight, 
  ExternalLink,
  Users,
  HeartHandshake,
  PlayCircle,
  HelpCircle,
  Award,
  LogIn,
  Eye,
  X,
  Printer,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  FileCheck,
  Check,
  Edit3,
  Sparkles,
  Paperclip,
  UploadCloud,
  PlusCircle,
} from 'lucide-react';
import { formatThaiDate } from '@/lib/thai-utils';
import { triggerStatusPopup } from '@/components/StatusModal';
import SampleDocumentViewer from '@/components/SampleDocumentViewer';

export default function PortalHomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Track Form State in Portal
  const [trackCitizenId, setTrackCitizenId] = useState('');
  const [trackBirthDate, setTrackBirthDate] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Active Video Tab
  const [activeVideo, setActiveVideo] = useState(1);
  const [videos, setVideos] = useState([]);
  const [manuals, setManuals] = useState([]);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Admin Card Editing States (เฉพาะผู้ดูแลระบบ Admin เท่านั้น)
  const [editingCardDoc, setEditingCardDoc] = useState(null);
  const [cardDocForm, setCardDocForm] = useState({
    title: '',
    desc: '',
    format: 'PDF',
    size: '1.0 MB',
    category: 'แบบฟอร์มรายงาน',
    fileUrl: '/downloads/document.pdf',
    fileName: '',
    fileData: null
  });
  const [uploadingDocFile, setUploadingDocFile] = useState(false);

  const [editingBenefits, setEditingBenefits] = useState(false);
  const [benefitsData, setBenefitsData] = useState({
    normalTitle: '1. กรณีการสูญเสียยามปกติ',
    normalAmount: 60000,
    normalRule: 'ตามระเบียบ ทบ.',
    normalDesc: 'เงินช่วยเหลือค่าสินไหมทดแทนกรณีเสียชีวิตหรือพิการทุพพลภาพจากการปฏิบัติหน้าที่ยามปกติ, การฝึกประจำปี, โรคเจ็บป่วยระหว่างประจำการ ครอบคลุมกำลังพลทุกชั้นยศ (สัญญาบัตร, ประทวน, พลทหาร, อส.ทพ., พนักงานราชการ, ลูกจ้าง)',
    riskTitle: '2. ปฏิบัติหน้าที่สำคัญ หรือ หน้าที่เสี่ยงภัย',
    riskAmount: 300000,
    riskRule: 'เงินสินไหมพิเศษ',
    riskDesc: 'เงินช่วยเหลือสงเคราะห์สินไหมทดแทนกรณีเสียชีวิตหรือพิการทุพพลภาพจากการสู้รบ, การปะทะ, ถูกลอบวางระเบิด, ปฏิบัติการรักษาความมั่นคงภายใน และภารกิจพิทักษ์พื้นที่ชายแดน (บังคับแนบรูปถ่าย 4x6 นิ้ว ตามเกณฑ์)'
  });

  const [editingVideoCard, setEditingVideoCard] = useState(null);
  const [videoCardForm, setVideoCardForm] = useState({
    title: '',
    role: '',
    duration: '',
    videoUrl: '',
    stepsText: ''
  });

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleOpenDocPreview = (doc) => {
    setPreviewDoc(doc);
    setZoomLevel(100);
  };

  const handleDownloadDoc = (doc) => {
    if (doc.fileData) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.fileName || `${doc.title}.${(doc.format || 'pdf').toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (doc.fileUrl) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.fileName || `${doc.title}.${(doc.format || 'pdf').toLowerCase()}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    triggerStatusPopup({
      type: 'success',
      title: 'ดาวน์โหลดเอกสารสำเร็จ',
      message: `ระบบได้ทำการดาวน์โหลดไฟล์ "${doc.title}" (${doc.fileName || (doc.format || 'PDF') + ' ขนาด ' + (doc.size || '1.2 MB')}) เรียบร้อยแล้ว`,
      action: 'ดาวน์โหลดเอกสารประกอบคำร้อง',
      by: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'ผู้ใช้งานพอร์ทัล'
    });
  };

  // จัดการอัปโหลดไฟล์แนบคู่มือ/แบบฟอร์ม
  const handleDocFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'อัปโหลดไฟล์ไม่สำเร็จ');
      }

      setCardDocForm((prev) => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        format: data.format || prev.format,
        size: data.size || prev.size,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileData: data.fileData
      }));

      triggerStatusPopup({
        type: 'info',
        title: 'แนบไฟล์สำเร็จ',
        message: `แนบไฟล์ "${data.fileName}" (${data.format} ขนาด ${data.size}) เรียบร้อยแล้ว`,
        action: 'แนบไฟล์เอกสารประกอบ',
        by: currentUser?.name ? `${currentUser.name} (Admin)` : 'ผู้ดูแลระบบ'
      });
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการแนบไฟล์: ' + err.message);
    } finally {
      setUploadingDocFile(false);
    }
  };

  // --- Admin Card Handlers ---
  const handleOpenEditCardDoc = (doc = null) => {
    if (doc) {
      setEditingCardDoc(doc);
      setCardDocForm({
        title: doc.title || '',
        desc: doc.desc || '',
        format: doc.format || 'PDF',
        size: doc.size || '1.0 MB',
        category: doc.category || 'แบบฟอร์มรายงาน',
        fileUrl: doc.fileUrl || '/downloads/document.pdf',
        fileName: doc.fileName || '',
        fileData: doc.fileData || null
      });
    } else {
      setEditingCardDoc({ isNew: true });
      setCardDocForm({
        title: '',
        desc: '',
        format: 'PDF',
        size: '1.2 MB',
        category: 'แบบฟอร์มรายงาน',
        fileUrl: '/downloads/document.pdf',
        fileName: '',
        fileData: null
      });
    }
  };

  const handleSaveCardDoc = async (e) => {
    e.preventDefault();
    if (!editingCardDoc) return;

    try {
      const isNew = !!editingCardDoc.isNew;
      const payload = {
        id: isNew ? `man-${Date.now()}` : (editingCardDoc.id || `man-${Date.now()}`),
        ...cardDocForm,
        hasAttachment: !!(cardDocForm.fileName || cardDocForm.fileData)
      };

      const res = await fetch('/api/content/manuals', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'บันทึกการแก้ไขไม่สำเร็จ');
      }

      setEditingCardDoc(null);
      await fetchContent();

      triggerStatusPopup({
        type: 'success',
        title: isNew ? 'เพิ่มไฟล์คู่มือ/เอกสารสำเร็จ (Admin)' : 'แก้ไขข้อมูลการ์ดเอกสารสำเร็จ (Admin)',
        message: `ระบบได้บันทึก${isNew ? 'เอกสารใหม่' : 'การปรับปรุง'} "${payload.title}" (${payload.fileName ? 'มีไฟล์แนบ: ' + payload.fileName : payload.format}) เรียบร้อยแล้ว`,
        casualtyName: payload.title,
        action: isNew ? 'เพิ่มไฟล์คู่มือ/เอกสารดาวน์โหลด' : 'ปรับปรุงข้อมูลการ์ดเอกสาร',
        by: currentUser ? `${currentUser.name} (${currentUser.badge || 'Admin'})` : 'ผู้ดูแลระบบ (Admin)'
      });
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  const handleSaveBenefits = (e) => {
    e.preventDefault();
    localStorage.setItem('rta_benefits_info', JSON.stringify(benefitsData));
    setEditingBenefits(false);

    triggerStatusPopup({
      type: 'success',
      title: 'แก้ไขข้อความสิทธิประโยชน์สำเร็จ (Admin)',
      message: 'ระบบได้อัปเดตข้อมูลข้อความและยอดเงินสิทธิประโยชน์บนหน้าแรกพอร์ทัลเรียบร้อยแล้ว',
      action: 'ปรับปรุงข้อมูลการ์ดสิทธิประโยชน์',
      by: currentUser ? `${currentUser.name} (${currentUser.badge || 'Admin'})` : 'ผู้ดูแลระบบ (Admin)'
    });
  };

  const handleOpenEditVideoCard = (vid) => {
    setEditingVideoCard(vid);
    setVideoCardForm({
      title: vid.title || '',
      role: vid.role || '',
      duration: vid.duration || '',
      videoUrl: vid.videoUrl || '',
      stepsText: Array.isArray(vid.steps) ? vid.steps.join('\n') : ''
    });
  };

  const handleSaveVideoCard = async (e) => {
    e.preventDefault();
    if (!editingVideoCard) return;

    try {
      const payload = {
        id: editingVideoCard.id,
        title: videoCardForm.title,
        role: videoCardForm.role,
        duration: videoCardForm.duration,
        videoUrl: videoCardForm.videoUrl,
        steps: videoCardForm.stepsText.split('\n').filter(Boolean)
      };

      const res = await fetch('/api/content/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'บันทึกการแก้ไขวิดีโอไม่สำเร็จ');
      }

      setEditingVideoCard(null);
      await fetchContent();

      triggerStatusPopup({
        type: 'success',
        title: 'แก้ไขข้อมูลวิดีโอสำเร็จ (Admin)',
        message: `ระบบได้บันทึกการแก้ไขข้อมูลข้อความคลิปวิดีโอ "${payload.title}" เรียบร้อยแล้ว`,
        casualtyName: payload.title,
        action: 'ปรับปรุงข้อมูลวิดีโอสื่อการสอน',
        by: currentUser ? `${currentUser.name} (${currentUser.badge || 'Admin'})` : 'ผู้ดูแลระบบ (Admin)'
      });
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  useEffect(() => {
    const checkUser = () => {
      const saved = localStorage.getItem('rta_user');
      if (saved) {
        try { setCurrentUser(JSON.parse(saved)); } catch (e) { setCurrentUser(null); }
      } else {
        setCurrentUser(null);
      }
    };
    checkUser();

    // โหลดข้อมูลข้อความสิทธิประโยชน์ที่แอดมินเคยแก้ไข (ถ้ามี)
    const savedBenefits = localStorage.getItem('rta_benefits_info');
    if (savedBenefits) {
      try { setBenefitsData(JSON.parse(savedBenefits)); } catch (e) {}
    }

    window.addEventListener('rta_auth_change', checkUser);
    window.addEventListener('storage', checkUser);

    // โหลดข้อมูลคู่มือและวิดีโอจาก Content API
    fetchContent();

    return () => {
      window.removeEventListener('rta_auth_change', checkUser);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const fetchContent = async () => {
    try {
      const [resMan, resVid] = await Promise.all([
        fetch('/api/content/manuals').then(r => r.json()).catch(() => ({})),
        fetch('/api/content/videos').then(r => r.json()).catch(() => ({}))
      ]);
      if (resMan && resMan.success && resMan.manuals && resMan.manuals.length > 0) {
        setManuals(resMan.manuals);
      } else {
        setManuals(DOWNLOAD_DOCS);
      }
      if (resVid && resVid.success && resVid.videos && resVid.videos.length > 0) {
        setVideos(resVid.videos);
        setActiveVideo(resVid.videos[0].id);
      } else {
        setVideos(TUTORIAL_VIDEOS);
      }
    } catch (e) {
      setManuals(DOWNLOAD_DOCS);
      setVideos(TUTORIAL_VIDEOS);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackResult(null);

    const cleanId = trackCitizenId.replace(/\D/g, '');
    if (cleanId.length !== 13) {
      setTrackError('กรุณากรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก');
      return;
    }
    if (!trackBirthDate) {
      setTrackError('กรุณาระบุวัน/เดือน/ปีเกิด');
      return;
    }

    setTrackLoading(true);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenId: cleanId, birthDate: trackBirthDate })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่พบข้อมูลคำร้องที่ตรงกับเลข ปชช. และวันเกิดนี้');
      }
      setTrackResult(data.claim);
    } catch (err) {
      setTrackError(err.message);
    } finally {
      setTrackLoading(false);
    }
  };

  const TUTORIAL_VIDEOS = [
    {
      id: 1,
      title: 'ขั้นตอนที่ 1: การลงทะเบียนและยื่นเสนอเรื่องผู้สูญเสียพร้อมแนบ 10 เอกสาร',
      role: 'สำหรับเจ้าหน้าที่หน่วยต้นสังกัด (ผู้เสนอเรื่อง)',
      duration: '4:20 นาที',
      thumbnail: '🎥 คู่มือการกรอกข้อมูลผู้สูญเสีย ปักหมุดสถานที่ตามใบมรณบัตร และการแนบเอกสาร กพ.4',
      steps: ['เข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่หน่วย', 'กรอกข้อมูลผู้สูญเสีย ตรวจสอบเลข ปชช. ไม่ให้ซ้ำซ้อน', 'ปักหมุดพิกัดสถานที่เกิดเหตุตามใบมรณบัตร', 'อัปโหลดเอกสารประกอบ 10 รายการ']
    },
    {
      id: 2,
      title: 'ขั้นตอนที่ 2: การตรวจเอกสารหลักฐาน และการตีกลับพร้อมคอมเมนต์',
      role: 'สำหรับ กสพ.กพ.ทบ. (เจ้าหน้าที่ตรวจสอบ)',
      duration: '3:45 นาที',
      thumbnail: '🎥 การตรวจสอบเอกสาร 10 รายการ การบันทึกผลผ่าน/ตีกลับให้แก้ไข และการเสนอ จก.กพ.ทบ.',
      steps: ['เปิดรายการคำร้องที่หน่วยเสนอเรื่อง', 'ตรวจความสมบูรณ์ของเอกสารแต่ละรายการ', 'บันทึกข้อคิดเห็นกรณีให้แก้ไข', 'ส่งต่อเรื่องให้ผู้บังคับบัญชาอนุมัติ']
    },
    {
      id: 3,
      title: 'ขั้นตอนที่ 3 & 4: การอนุมัติของผู้บังคับบัญชา และการโอนเงินของบริษัทประกันภัย',
      role: 'สำหรับ จก.กพ.ทบ. และ บริษัทประกันภัย',
      duration: '3:10 นาที',
      thumbnail: '🎥 การลงนามอนุมัติในระบบ และการตรวจสอบจ่ายเงินสินไหม 60,000 หรือ 300,000 บาท',
      steps: ['จก.กพ.ทบ. พิจารณาลงนามอนุมัติ', 'ส่งเรื่องอัตโนมัติไปยัง บ.ประกันภัย', 'บ.ประกันภัย โอนเงินเข้าบัญชีทายาทพร้อมแนบสลิป', 'แจ้งเตือนสถานะทันทีบน Telegram']
    },
    {
      id: 4,
      title: 'ขั้นตอนที่ 5: การติดตาม SLA 30 วัน และการรายงานชี้แจงความล่าช้า',
      role: 'สำหรับทุกหน่วยงาน และ สก.ทบ. รับทราบยอด',
      duration: '2:50 นาที',
      thumbnail: '🎥 การควบคุมกรอบเวลา SLA 30 วัน เตือนล่วงหน้า 7 วัน และการแนบหนังสือชี้แจงเหตุผล',
      steps: ['ระบบตรวจนับจำนวนวันอัตโนมัติ', 'แจ้งเตือนสีส้มเมื่อเหลือ 7 วัน', 'ล็อคเตือนสีแดงเมื่อเกิน 30 วัน บังคับให้หน่วยชี้แจง', 'สก.ทบ. รับทราบยอดปิดเคส']
    }
  ];

  const DOWNLOAD_DOCS = [
    { title: 'แบบรายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)', format: 'PDF', size: '1.2 MB', desc: 'แบบฟอร์มมาตรฐานสำหรับผู้บังคับหน่วยรายงานการสูญเสียกำลังพล' },
    { title: 'หนังสือแสดงเจตนาทายาทผู้มีสิทธิรับเงินสินไหมทดแทน', format: 'PDF', size: '850 KB', desc: 'หนังสือมอบอำนาจและการแสดงเจตนายินยอมรับเงินของทายาทตามกฎหมาย' },
    { title: 'คู่มือระเบียบ กห. และ ทบ. ว่าด้วยการประกันชีวิตกำลังพล', format: 'PDF', size: '3.4 MB', desc: 'ระเบียบหลักเกณฑ์การจ่ายเงินสินไหมทดแทน 60,000 บาท และ 300,000 บาท' },
    { title: 'แบบตรวจสอบเอกสารหลักฐานประกอบ 10 รายการ (Checklist)', format: 'PDF', size: '620 KB', desc: 'รายการตรวจสอบความครบถ้วนก่อนส่งเรื่องมายัง กสพ.กพ.ทบ.' }
  ];

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      
      {/* Hero Banner: สิทธิประโยชน์ประกันชีวิตและสินไหมทดแทน ทบ. */}
      <div className="glass-panel" style={{
        padding: '36px 32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '5px solid var(--gold-primary)',
        background: 'linear-gradient(135deg, rgba(16, 28, 58, 0.85) 0%, rgba(9, 17, 38, 0.95) 100%)'
      }}>
        <div style={{ maxWidth: '820px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
            <Award size={15} color="var(--gold-primary)" />
            <span style={{ fontSize: '12.5px', color: 'var(--gold-light)', fontWeight: 600 }}>พอร์ทัลบริการสิทธิประโยชน์กำลังพล กองทัพบก</span>
          </div>

          <h1 style={{ fontSize: '28px', lineHeight: 1.3, marginBottom: '12px' }}>
            ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน <br />
            <span className="gold-gradient-text">กรมกำลังพลทหารบก (กพ.ทบ.) ร่วมกับ กรมสวัสดิการทหารบก (สก.ทบ.)</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '22px' }}>
            ดูแลสิทธิสวัสดิการและเงินสินไหมทดแทนประกันชีวิตแก่กำลังพลที่เสียชีวิตหรือพิการทุพพลภาพจากการปฏิบัติหน้าที่ราชการ ดำเนินเรื่องรวดเร็ว โปร่งใส ควบคุมตามกรอบเวลา SLA 30 วัน พร้อมการแจ้งเตือนสดทาง Socket.io และ Telegram
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <a href="#tracking-section" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Search size={16} />
              <span>ติดตามสถานะสิทธิ (เลข ปชช. + วันเกิด)</span>
            </a>

            {currentUser ? (
              <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '12px 24px' }}>
                <Shield size={16} />
                <span>เข้าสู่แดชบอร์ดเจ้าหน้าที่</span>
              </Link>
            ) : (
              <Link href="/login" className="btn btn-secondary" style={{ padding: '12px 24px' }}>
                <LogIn size={16} />
                <span>เข้าสู่ระบบ (สำหรับเจ้าหน้าที่)</span>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative Badge */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>
      </div>

      {/* สรุปสิทธิประโยชน์เงินประกันชีวิต 2 ระดับ */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--gold-primary)" />
            <span>อัตราเงินสินไหมทดแทนและสิทธิประโยชน์กำลังพล ทบ.</span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setEditingBenefits(true)}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: 'rgba(212, 175, 55, 0.45)',
                color: 'var(--gold-primary)',
                background: 'rgba(212, 175, 55, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              title="เฉพาะผู้ดูแลระบบ Admin เท่านั้น"
            >
              <Edit3 size={13} />
              <span>✏️ แก้ไขข้อมูลข้อความสิทธิประโยชน์ (Admin)</span>
            </button>
          )}
        </div>

        <div className="grid-cols-2">
          {/* สิทธิยามปกติ */}
          <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid var(--cyan-accent)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-blue">{benefitsData.normalTitle}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{benefitsData.normalRule}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--cyan-accent)' }}>
              {Number(benefitsData.normalAmount).toLocaleString('th-TH')} <span style={{ fontSize: '18px', color: '#fff', fontWeight: 400 }}>บาท</span>
            </div>
            <div style={{ fontSize: '13.5px', color: '#cbd5e1', marginTop: '10px', lineHeight: 1.6 }}>
              {benefitsData.normalDesc}
            </div>
          </div>

          {/* สิทธิปฏิบัติหน้าที่สำคัญ/เสี่ยงภัย */}
          <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid var(--gold-primary)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-amber">{benefitsData.riskTitle}</span>
              <span style={{ fontSize: '12px', color: 'var(--gold-primary)' }}>{benefitsData.riskRule}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gold-primary)' }}>
              {Number(benefitsData.riskAmount).toLocaleString('th-TH')} <span style={{ fontSize: '18px', color: '#fff', fontWeight: 400 }}>บาท</span>
            </div>
            <div style={{ fontSize: '13.5px', color: '#cbd5e1', marginTop: '10px', lineHeight: 1.6 }}>
              {benefitsData.riskDesc}
            </div>
          </div>
        </div>
      </div>

      {/* Section: ระบบตามสถานะสิทธิ (เลข ปชช. + วันเกิด) */}
      <div id="tracking-section" className="glass-panel" style={{ padding: '30px', marginBottom: '36px', borderLeft: '4px solid var(--emerald-success)' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={22} color="var(--emerald-success)" />
            <span>ระบบติดตามสถานะสิทธิเงินสินไหมทดแทน (สำหรับกำลังพลและครอบครัว)</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            กรอกข้อมูลเลขประจำตัวประชาชน 13 หลักของผู้สูญเสีย และวัน/เดือน/ปีเกิด เพื่อตรวจสอบขั้นตอนดำเนินเรื่อง กรอบเวลา SLA และผลการโอนเงิน
          </p>
        </div>

        <form onSubmit={handleTrackSubmit}>
          <div className="grid-cols-2" style={{ gap: '18px' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label required">เลขประจำตัวประชาชนผู้สูญเสีย (13 หลัก)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="x-xxxx-xxxxx-xx-x"
                maxLength={17}
                value={trackCitizenId}
                onChange={(e) => setTrackCitizenId(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label required">วัน/เดือน/ปีเกิด (ของผู้สูญเสีย)</label>
              <input 
                type="date" 
                className="form-input"
                value={trackBirthDate}
                onChange={(e) => setTrackBirthDate(e.target.value)}
                required
              />
            </div>

          </div>

          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              * ข้อมูลตรงกับฐานข้อมูล กพ.ทบ. จึงจะสามารถแสดงผลได้ เพื่อความปลอดภัยของข้อมูลส่วนบุคคล
            </span>

            <button type="submit" className="btn btn-primary" disabled={trackLoading}>
              <Search size={16} />
              <span>{trackLoading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ'}</span>
            </button>
          </div>
        </form>

        {trackError && (
          <div style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', color: '#fca5a5', fontSize: '13.5px' }}>
            ⚠️ {trackError}
          </div>
        )}

        {trackResult && (
          <div style={{ marginTop: '22px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '20px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: '13px' }}>
                  ขั้นตอนที่ {trackResult.currentStep} จาก 5: {trackResult.statusLabel}
                </span>
                <h3 style={{ fontSize: '18px', color: '#fff', marginTop: '6px' }}>{trackResult.casualtyName}</h3>
                <div style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>เลขที่เรื่อง: {trackResult.trackingCode} • สังกัด: {trackResult.unitName}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold-primary)' }}>
                  {trackResult.compensationAmount?.toLocaleString('th-TH')} บาท
                </div>
                <div style={{ fontSize: '12px', color: 'var(--emerald-success)' }}>
                  {trackResult.paidAt ? '✓ โอนเงินแล้ว' : trackResult.slaLabel}
                </div>
              </div>
            </div>

            <Link href="/track" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              ดูรายละเอียดไทม์ไลน์และประวัติทั้งหมด <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Section: คลิปวิดีโอสอนการใช้งานระบบ */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Video size={22} color="var(--gold-primary)" />
              <span>คลิปวิดีโอแนะนำและสอนการใช้งานระบบ</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
              สื่อการเรียนรู้วิธีการยื่นเสนอเรื่อง การตรวจเอกสาร และการบริหารจัดการกระบวนการตามระเบียบ ทบ.
            </p>
          </div>
          <Link href="/manuals" className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(212, 175, 55, 0.4)' }}>
            <Video size={15} color="var(--gold-primary)" />
            <span>⚙️ จัดการคลิปวิดีโอ & คู่มือ</span>
          </Link>
        </div>

        {/* Video Tabs Selector */}
        {(() => {
          const displayedVideos = (videos && videos.length > 0) ? videos : TUTORIAL_VIDEOS;
          const currentVid = displayedVideos.find((v) => v.id === activeVideo) || displayedVideos[0];

          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(displayedVideos.length, 4)}, 1fr)`, gap: '10px', marginBottom: '20px' }}>
                {displayedVideos.map((v, idx) => (
                  <button
                    key={v.id || idx}
                    onClick={() => setActiveVideo(v.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: activeVideo === v.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: activeVideo === v.id ? '1px solid var(--gold-primary)' : '1px solid var(--border-glass)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#fff',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: activeVideo === v.id ? 'var(--gold-primary)' : 'var(--text-dim)', fontWeight: 600 }}>
                      ตอนที่ {idx + 1} • {v.duration}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px', lineHeight: 1.4 }}>
                      {v.title ? v.title.split(':')[0] : `วิดีโอที่ ${idx + 1}`}
                    </div>
                  </button>
                ))}
              </div>

              {/* Video Player Display Card */}
              {currentVid && (
                <div style={{
                  background: 'rgba(7, 13, 30, 0.85)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr'
                }}>
                  {/* Simulated Video Canvas */}
                  <div style={{
                    minHeight: '320px',
                    background: 'radial-gradient(circle at center, #162447 0%, #070d1e 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRight: '1px solid var(--border-glass)',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(212, 175, 55, 0.3)',
                      border: '2px solid var(--gold-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 0 25px rgba(212, 175, 55, 0.4)',
                      marginBottom: '16px'
                    }}>
                      <PlayCircle size={38} color="var(--gold-primary)" />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', maxWidth: '90%' }}>
                      {currentVid.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gold-light)', marginTop: '6px' }}>
                      ความยาว: {currentVid.duration} • กรมกำลังพลทหารบก (กสพ.กพ.ทบ.)
                    </div>
                    {currentVid.videoUrl && (
                      <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--cyan-accent)' }}>
                        🔗 ลิงก์สื่อ: {currentVid.videoUrl}
                      </div>
                    )}
                  </div>

                  {/* Video Step Guide */}
                  <div style={{ padding: '24px' }}>
                    <span className="badge badge-amber" style={{ fontSize: '11px', marginBottom: '8px' }}>
                      {currentVid.role}
                    </span>
                    <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '12px' }}>
                      หัวข้อสาระสำคัญในวิดีโอ:
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(currentVid.steps || []).map((st, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                          <CheckCircle2 size={15} color="var(--emerald-success)" style={{ flexShrink: 0 }} />
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Link href="/submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        ไปยังหน้ายื่นเรื่องตามขั้นตอน <ArrowRight size={14} />
                      </Link>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditVideoCard(currentVid)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            borderColor: 'rgba(212, 175, 55, 0.45)',
                            color: 'var(--gold-primary)',
                            background: 'rgba(212, 175, 55, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="แก้ไขข้อมูลการ์ดวิดีโอนี้ (Admin)"
                        >
                          <Edit3 size={13} />
                          <span>✏️ แก้ไขวิดีโอ (Admin)</span>
                        </button>
                      )}

                      <Link href="/manuals" className="btn btn-secondary btn-sm" title="จัดการสื่อทั้งหมด">
                        จัดการสื่อ
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Section: คู่มือใช้งานเอกสารประกอบ (Downloadable Resources) */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={22} color="var(--cyan-accent)" />
              <span>คู่มือใช้งานและเอกสารประกอบดาวน์โหลด</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
              แบบฟอร์มเอกสารมาตรฐาน และคู่มือระเบียบปฏิบัติสำหรับหน่วยเสนอเรื่องและทายาท
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleOpenEditCardDoc(null)}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#059669',
                  color: '#fff',
                  fontWeight: 600
                }}
                title="เพิ่มไฟล์คู่มือหรือแบบฟอร์มเอกสารใหม่พร้อมแนบไฟล์"
              >
                <PlusCircle size={15} />
                <span>+ เพิ่มคู่มือ/เอกสารใหม่ (Admin)</span>
              </button>
            )}
            <Link href="/manuals" className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(6, 182, 212, 0.4)' }}>
              <BookOpen size={15} color="var(--cyan-accent)" />
              <span>⚙️ จัดการไฟล์คู่มือ</span>
            </Link>
          </div>
        </div>

        <div className="grid-cols-2" style={{ gap: '16px' }}>
          {((manuals && manuals.length > 0) ? manuals : DOWNLOAD_DOCS).map((doc, idx) => (
            <div 
              key={doc.id || idx}
              style={{
                padding: '16px 20px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: (doc.fileName || doc.hasAttachment) ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: (doc.fileName || doc.hasAttachment) ? 'rgba(16, 185, 129, 0.18)' : 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: (doc.fileName || doc.hasAttachment) ? 'var(--emerald-success)' : 'var(--cyan-accent)',
                  fontWeight: 700,
                  fontSize: '13px'
                }}>
                  {doc.format || 'PDF'}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{doc.title}</span>
                    {(doc.fileName || doc.hasAttachment) && (
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--emerald-success)',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '4px',
                        padding: '1px 6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Paperclip size={10} />
                        <span>มีไฟล์แนบ</span>
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {doc.desc}
                    {doc.size && <span style={{ marginLeft: '6px', color: 'var(--text-muted)' }}>• {doc.size}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                {/* ปุ่มแก้ไขข้อมูลการ์ด (เฉพาะผู้ดูแลระบบ Admin เท่านั้น) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleOpenEditCardDoc(doc)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      borderColor: 'rgba(212, 175, 55, 0.45)',
                      color: 'var(--gold-primary)',
                      background: 'rgba(212, 175, 55, 0.12)'
                    }}
                    title={`แก้ไขข้อมูลการ์ด ${doc.title} (Admin)`}
                  >
                    <Edit3 size={13} />
                    <span>แก้ไขการ์ด</span>
                  </button>
                )}

                <button 
                  type="button"
                  onClick={() => handleOpenDocPreview(doc)}
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title={`กดพรีวิวเอกสาร ${doc.title}`}
                >
                  <Eye size={14} />
                  <span>พรีวิวเอกสาร</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleDownloadDoc(doc)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title={`ดาวน์โหลด ${doc.title}`}
                >
                  <Download size={14} />
                  <span>ดาวน์โหลด</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: พรีวิวเอกสารคู่มือและแบบฟอร์มทางการ (Document Preview Modal) */}
      {/* ========================================================================= */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 8, 12, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '860px',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(4, 20, 23, 0.98)',
            border: '2px solid rgba(20, 184, 166, 0.5)',
            boxShadow: '0 25px 65px rgba(0,0,0,0.85)',
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
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(4, 20, 23, 0.95) 100%)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--cyan-accent)',
                  color: '#041417',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '13px'
                }}>
                  {previewDoc.format || 'PDF'}
                </div>
                <div>
                  <h3 style={{ fontSize: '16.5px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>พรีวิวเอกสาร: {previewDoc.title}</span>
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    หมวดหมู่: <strong style={{ color: 'var(--cyan-accent)' }}>{previewDoc.category || 'แบบฟอร์มรายงาน'}</strong> • ขนาดไฟล์: {previewDoc.size || '1.2 MB'} • สถานะ: <span style={{ color: 'var(--emerald-success)' }}>✓ เอกสารพร้อมใช้งาน</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Zoom Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', padding: '2px 6px' }}>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 6px', height: '26px' }}
                    title="ย่อขนาด"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span style={{ fontSize: '11px', color: '#cbd5e1', minWidth: '38px', textAlign: 'center' }}>
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 6px', height: '26px' }}
                    title="ขยายขนาด"
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                  title="ดาวน์โหลดไฟล์"
                >
                  <Download size={14} />
                  <span>ดาวน์โหลด</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                  title="สั่งพิมพ์แบบฟอร์ม"
                >
                  <Printer size={14} />
                  <span>พิมพ์</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                  title="ปิดหน้าต่างพรีวิว"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Document Preview Sheet Canvas with SampleDocumentViewer */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#0b1619' }}>
              <SampleDocumentViewer
                doc={previewDoc}
                onDownload={handleDownloadDoc}
                initialZoom={zoomLevel}
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
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                กดปุ่ม <strong>"ดาวน์โหลด"</strong> เพื่อรับไฟล์ต้นฉบับ ({previewDoc.format || 'PDF'}) สำหรับนำไปพิมพ์หรือกรอกข้อมูล
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px', padding: '7px 16px' }}
                >
                  <Download size={15} />
                  <span>ดาวน์โหลดไฟล์ ({previewDoc.size || '1.2 MB'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '7px 16px' }}
                >
                  ✕ ปิดหน้าต่าง
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADMIN 1: แก้ไขข้อมูลการ์ดเอกสาร (Edit Document Card Modal) */}
      {/* ========================================================================= */}
      {editingCardDoc && (
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
          zIndex: 130,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '620px',
            background: 'rgba(4, 20, 23, 0.98)',
            border: '2px solid var(--gold-primary)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(4, 20, 23, 0.95) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--gold-primary)',
                  color: '#041417',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16.5px', color: '#fff', margin: 0 }}>
                    {editingCardDoc.isNew ? 'เพิ่มคู่มือ/เอกสารใหม่ (Admin Only)' : 'แก้ไขข้อมูลการ์ดเอกสาร (Admin Only)'}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--gold-primary)', marginTop: '2px' }}>
                    แนบไฟล์เอกสารต้นฉบับ ปรับปรุงข้อความ รายละเอียด และลิงก์ดาวน์โหลด
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingCardDoc(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCardDoc} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '78vh', overflowY: 'auto' }}>
              
              {/* แนบไฟล์คู่มือใช้งานและเอกสารประกอบดาวน์โหลด */}
              <div style={{
                background: 'rgba(20, 184, 166, 0.08)',
                border: '1px dashed rgba(20, 184, 166, 0.45)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '4px'
              }}>
                <div style={{ color: 'var(--cyan-accent)', fontWeight: 600, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Paperclip size={16} />
                  <span>แนบไฟล์คู่มือใช้งานและเอกสารประกอบดาวน์โหลด</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <label 
                      htmlFor="portal-doc-file-input"
                      className="btn btn-secondary btn-sm"
                      style={{
                        cursor: 'pointer',
                        borderColor: 'var(--cyan-accent)',
                        color: 'var(--cyan-accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        fontWeight: 600
                      }}
                    >
                      <UploadCloud size={16} />
                      <span>{uploadingDocFile ? 'กำลังอัปโหลด...' : 'เลือกไฟล์จากอุปกรณ์'}</span>
                    </label>
                    <input 
                      id="portal-doc-file-input"
                      type="file" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png"
                      onChange={handleDocFileUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingDocFile}
                    />

                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      รองรับ PDF, DOCX, XLSX, ZIP, JPG, PNG (ไม่เกิน 50MB)
                    </span>
                  </div>

                  {/* กล่องแสดงสถานะไฟล์แนบ */}
                  {cardDocForm.fileName ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <FileText size={20} color="var(--emerald-success)" />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cardDocForm.fileName}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--emerald-light)' }}>
                            {cardDocForm.format} • {cardDocForm.size} • พร้อมดาวน์โหลด
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCardDocForm((prev) => ({ ...prev, fileName: '', fileData: null }))}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11.5px' }}
                        title="ลบไฟล์แนบนี้"
                      >
                        <Trash2 size={13} />
                        <span>ยกเลิกไฟล์แนบ</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      * ยังไม่ได้แนบไฟล์ ระบบจะใช้ลิงก์ดาวน์โหลดตามที่ระบุในช่องด้านล่าง
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label required">ชื่อหัวข้อเอกสาร (Title)</label>
                <input
                  type="text"
                  className="form-input"
                  value={cardDocForm.title}
                  onChange={(e) => setCardDocForm({ ...cardDocForm, title: e.target.value })}
                  placeholder="เช่น แบบรายงาน กพ.4 หรือ คู่มือปฏิบัติงาน"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label required">คำอธิบายรายละเอียด (Description)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={cardDocForm.desc}
                  onChange={(e) => setCardDocForm({ ...cardDocForm, desc: e.target.value })}
                  placeholder="คำอธิบายสั้นๆ ของเอกสาร..."
                  required
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">หมวดหมู่เอกสาร</label>
                  <select
                    className="form-select"
                    value={cardDocForm.category}
                    onChange={(e) => setCardDocForm({ ...cardDocForm, category: e.target.value })}
                  >
                    <option value="แบบฟอร์มรายงาน">แบบฟอร์มรายงาน</option>
                    <option value="เอกสารทายาท">เอกสารทายาท</option>
                    <option value="ระเบียบข้อบังคับ">ระเบียบข้อบังคับ</option>
                    <option value="คู่มือตรวจสอบ">คู่มือตรวจสอบ</option>
                    <option value="ตัวอย่างเอกสาร">ตัวอย่างเอกสาร</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">รูปแบบไฟล์ (Format)</label>
                  <select
                    className="form-select"
                    value={cardDocForm.format}
                    onChange={(e) => setCardDocForm({ ...cardDocForm, format: e.target.value })}
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="ZIP">ZIP</option>
                    <option value="PNG">PNG</option>
                    <option value="JPG">JPG</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">ขนาดไฟล์</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardDocForm.size}
                    onChange={(e) => setCardDocForm({ ...cardDocForm, size: e.target.value })}
                    placeholder="เช่น 1.2 MB"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">URL ดาวน์โหลด / ไฟล์แนบ</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardDocForm.fileUrl}
                    onChange={(e) => setCardDocForm({ ...cardDocForm, fileUrl: e.target.value })}
                    placeholder="/downloads/form.pdf"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={() => setEditingCardDoc(null)}
                  className="btn btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Check size={16} />
                  <span>บันทึกการปรับปรุง (Admin)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADMIN 2: แก้ไขข้อความสิทธิประโยชน์ (Edit Benefits Cards Modal) */}
      {/* ========================================================================= */}
      {editingBenefits && (
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
          zIndex: 130,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '680px',
            background: 'rgba(4, 20, 23, 0.98)',
            border: '2px solid var(--gold-primary)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(4, 20, 23, 0.95) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--gold-primary)',
                  color: '#041417',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16.5px', color: '#fff', margin: 0 }}>
                    แก้ไขข้อมูลการ์ดสิทธิประโยชน์ (Admin Only)
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--gold-primary)', marginTop: '2px' }}>
                    ปรับปรุงยอดเงิน ข้อความ และเงื่อนไขการให้สิทธิ 2 ระดับ
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingBenefits(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBenefits} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '78vh', overflowY: 'auto' }}>
              {/* ระดับ 1: ปกติ */}
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--cyan-accent)', marginBottom: '10px' }}>
                  การ์ด 1: กรณีการสูญเสียยามปกติ
                </div>
                <div className="grid-cols-2" style={{ gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label className="form-label">ป้ายกำกับหัวข้อ</label>
                    <input
                      type="text"
                      className="form-input"
                      value={benefitsData.normalTitle}
                      onChange={(e) => setBenefitsData({ ...benefitsData, normalTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">ยอดเงินช่วยเหลือ (บาท)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={benefitsData.normalAmount}
                      onChange={(e) => setBenefitsData({ ...benefitsData, normalAmount: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">ข้อความคำอธิบายรายละเอียด</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={benefitsData.normalDesc}
                    onChange={(e) => setBenefitsData({ ...benefitsData, normalDesc: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* ระดับ 2: หน้าที่สำคัญ/เสี่ยงภัย */}
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '10px' }}>
                  การ์ด 2: ปฏิบัติหน้าที่สำคัญ หรือ หน้าที่เสี่ยงภัย
                </div>
                <div className="grid-cols-2" style={{ gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label className="form-label">ป้ายกำกับหัวข้อ</label>
                    <input
                      type="text"
                      className="form-input"
                      value={benefitsData.riskTitle}
                      onChange={(e) => setBenefitsData({ ...benefitsData, riskTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">ยอดเงินช่วยเหลือ (บาท)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={benefitsData.riskAmount}
                      onChange={(e) => setBenefitsData({ ...benefitsData, riskAmount: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">ข้อความคำอธิบายรายละเอียด</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={benefitsData.riskDesc}
                    onChange={(e) => setBenefitsData({ ...benefitsData, riskDesc: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={() => setEditingBenefits(false)}
                  className="btn btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Check size={16} />
                  <span>บันทึกการปรับปรุง (Admin)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADMIN 3: แก้ไขข้อมูลวิดีโอ (Edit Video Card Modal) */}
      {/* ========================================================================= */}
      {editingVideoCard && (
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
          zIndex: 130,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '640px',
            background: 'rgba(4, 20, 23, 0.98)',
            border: '2px solid var(--gold-primary)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(4, 20, 23, 0.95) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--gold-primary)',
                  color: '#041417',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  <Video size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16.5px', color: '#fff', margin: 0 }}>
                    แก้ไขข้อมูลการ์ดวิดีโอ (Admin Only)
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--gold-primary)', marginTop: '2px' }}>
                    ปรับปรุงชื่อคลิป บทบาทผู้ใช้งาน ความยาว และหัวข้อขั้นตอน
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingVideoCard(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVideoCard} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '78vh', overflowY: 'auto' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label required">ชื่อหัวข้อวิดีโอ (Title)</label>
                <input
                  type="text"
                  className="form-input"
                  value={videoCardForm.title}
                  onChange={(e) => setVideoCardForm({ ...videoCardForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">บทบาทผู้ใช้งาน (Role Badge)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={videoCardForm.role}
                    onChange={(e) => setVideoCardForm({ ...videoCardForm, role: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">ความยาวคลิป (Duration)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={videoCardForm.duration}
                    onChange={(e) => setVideoCardForm({ ...videoCardForm, duration: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">URL ลิงก์คลิปวิดีโอ (YouTube / Embed)</label>
                <input
                  type="text"
                  className="form-input"
                  value={videoCardForm.videoUrl}
                  onChange={(e) => setVideoCardForm({ ...videoCardForm, videoUrl: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">หัวข้อสาระสำคัญในวิดีโอ (แยกบรรทัดละ 1 ข้อ)</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={videoCardForm.stepsText}
                  onChange={(e) => setVideoCardForm({ ...videoCardForm, stepsText: e.target.value })}
                  placeholder="เข้าสู่ระบบ...&#10;ตรวจเอกสาร...&#10;บันทึกผล..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={() => setEditingVideoCard(null)}
                  className="btn btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Check size={16} />
                  <span>บันทึกการปรับปรุง (Admin)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
