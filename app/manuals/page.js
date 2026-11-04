// app/manuals/page.js - หน้าจัดการคู่มือการใช้งานระบบ ไฟล์คู่มือ และคลิปวิดีโอ
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Video, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  PlayCircle, 
  ExternalLink,
  FileText,
  Clock,
  Layers,
  Save,
  X,
  Eye,
  Paperclip,
  UploadCloud
} from 'lucide-react';
import { triggerStatusPopup } from '@/components/StatusModal';
import SampleDocumentViewer from '@/components/SampleDocumentViewer';

const DEFAULT_MANUALS = [
  {
    id: 'man-1',
    title: 'แบบรายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)',
    format: 'PDF',
    size: '1.2 MB',
    desc: 'แบบฟอร์มมาตรฐานสำหรับผู้บังคับหน่วยรายงานการสูญเสียกำลังพล',
    fileUrl: '/downloads/form_kp4.pdf',
    category: 'แบบฟอร์มรายงาน',
    updatedAt: '2026-10-01'
  },
  {
    id: 'man-2',
    title: 'หนังสือแสดงเจตนาทายาทผู้มีสิทธิรับเงินสินไหมทดแทน',
    format: 'PDF',
    size: '850 KB',
    desc: 'หนังสือมอบอำนาจและการแสดงเจตนายินยอมรับเงินของทายาทตามกฎหมาย',
    fileUrl: '/downloads/form_heir_designation.pdf',
    category: 'เอกสารทายาท',
    updatedAt: '2026-10-01'
  },
  {
    id: 'man-3',
    title: 'คู่มือระเบียบ กห. และ ทบ. ว่าด้วยการประกันชีวิตกำลังพล',
    format: 'PDF',
    size: '3.4 MB',
    desc: 'ระเบียบหลักเกณฑ์การจ่ายเงินสินไหมทดแทน 60,000 บาท และ 300,000 บาท',
    fileUrl: '/downloads/rta_life_insurance_regulation.pdf',
    category: 'ระเบียบข้อบังคับ',
    updatedAt: '2026-10-01'
  },
  {
    id: 'man-4',
    title: 'แบบตรวจสอบเอกสารหลักฐานประกอบ 10 รายการ (Checklist)',
    format: 'PDF',
    size: '620 KB',
    desc: 'รายการตรวจสอบความครบถ้วนก่อนส่งเรื่องมายัง กสพ.กพ.ทบ.',
    fileUrl: '/downloads/rta_claim_checklist.pdf',
    category: 'คู่มือตรวจสอบ',
    updatedAt: '2026-10-01'
  }
];

const DEFAULT_VIDEOS = [
  {
    id: 'vid-1',
    title: 'ขั้นตอนที่ 1: การลงทะเบียนและยื่นเสนอเรื่องผู้สูญเสียพร้อมแนบ 10 เอกสาร',
    role: 'สำหรับเจ้าหน้าที่หน่วยต้นสังกัด (ผู้เสนอเรื่อง)',
    duration: '4:20 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: 'คู่มือการกรอกข้อมูลผู้สูญเสีย ปักหมุดสถานที่ตามใบมรณบัตร และการแนบเอกสาร กพ.4',
    steps: ['เข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่หน่วย', 'กรอกข้อมูลผู้สูญเสีย ตรวจสอบเลข ปชช. ไม่ให้ซ้ำซ้อน', 'ปักหมุดพิกัดสถานที่เกิดเหตุตามใบมรณบัตร', 'อัปโหลดเอกสารประกอบ 10 รายการ'],
    updatedAt: '2026-10-01'
  },
  {
    id: 'vid-2',
    title: 'ขั้นตอนที่ 2: การตรวจเอกสารหลักฐาน และการตีกลับพร้อมคอมเมนต์',
    role: 'สำหรับ กสพ.กพ.ทบ. (เจ้าหน้าที่ตรวจสอบ)',
    duration: '3:45 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: 'การตรวจสอบเอกสาร 10 รายการ การบันทึกผลผ่าน/ตีกลับให้แก้ไข และการเสนอ จก.กพ.ทบ.',
    steps: ['เปิดรายการคำร้องที่หน่วยเสนอเรื่อง', 'ตรวจความสมบูรณ์ของเอกสารแต่ละรายการ', 'บันทึกข้อคิดเห็นกรณีให้แก้ไข', 'ส่งต่อเรื่องให้ผู้บังคับบัญชาอนุมัติ'],
    updatedAt: '2026-10-01'
  },
  {
    id: 'vid-3',
    title: 'ขั้นตอนที่ 3 & 4: การอนุมัติของผู้บังคับบัญชา และการโอนเงินของบริษัทประกันภัย',
    role: 'สำหรับ จก.กพ.ทบ. และ บริษัทประกันภัย',
    duration: '3:10 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: 'การลงนามอนุมัติในระบบ และการตรวจสอบจ่ายเงินสินไหม 60,000 หรือ 300,000 บาท',
    steps: ['จก.กพ.ทบ. พิจารณาลงนามอนุมัติ', 'ส่งเรื่องอัตโนมัติไปยัง บ.ประกันภัย', 'บ.ประกันภัย โอนเงินเข้าบัญชีทายาทพร้อมแนบสลิป', 'แจ้งเตือนสถานะทันทีบน Telegram'],
    updatedAt: '2026-10-01'
  },
  {
    id: 'vid-4',
    title: 'ขั้นตอนที่ 5: การติดตาม SLA 30 วัน และการรายงานชี้แจงความล่าช้า',
    role: 'สำหรับทุกหน่วยงาน และ สก.ทบ. รับทราบยอด',
    duration: '2:50 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: 'การควบคุมกรอบเวลา SLA 30 วัน เตือนล่วงหน้า 7 วัน และการแนบหนังสือชี้แจงเหตุผล',
    steps: ['ระบบตรวจนับจำนวนวันอัตโนมัติ', 'แจ้งเตือนสีส้มเมื่อเหลือ 7 วัน', 'ล็อคเตือนสีแดงเมื่อเกิน 30 วัน บังคับให้หน่วยชี้แจง', 'สก.ทบ. รับทราบยอดปิดเคส'],
    updatedAt: '2026-10-01'
  }
];

export default function ManualsManagementPage() {
  const [activeTab, setActiveTab] = useState('manuals'); // 'manuals' | 'videos'
  const [manuals, setManuals] = useState(DEFAULT_MANUALS);
  const [videos, setVideos] = useState(DEFAULT_VIDEOS);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form State for Manual
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editingManual, setEditingManual] = useState(null);
  const [previewManual, setPreviewManual] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    format: 'PDF',
    size: '1.0 MB',
    desc: '',
    fileUrl: '/downloads/manual.pdf',
    fileName: '',
    fileData: null,
    category: 'แบบฟอร์มรายงาน'
  });

  // Form State for Video
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    role: 'สำหรับเจ้าหน้าที่หน่วย (ผู้เสนอเรื่อง)',
    duration: '3:30 นาที',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    description: '',
    stepsText: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resMan, resVid] = await Promise.all([
        fetch('/api/content/manuals').then((r) => r.json()).catch(() => null),
        fetch('/api/content/videos').then((r) => r.json()).catch(() => null)
      ]);
      if (resMan && resMan.success && resMan.manuals && resMan.manuals.length > 0) {
        setManuals(resMan.manuals);
      }
      if (resVid && resVid.success && resVid.videos && resVid.videos.length > 0) {
        setVideos(resVid.videos);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- File Upload Handler ---
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
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

      setManualForm((prev) => ({
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
        by: 'ผู้ดูแลระบบคู่มือ (Admin)'
      });
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการแนบไฟล์: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownload = (m) => {
    if (m.fileData) {
      const a = document.createElement('a');
      a.href = m.fileData;
      a.download = m.fileName || `${m.title}.${(m.format || 'pdf').toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (m.fileUrl) {
      const a = document.createElement('a');
      a.href = m.fileUrl;
      a.download = m.fileName || `${m.title}.${(m.format || 'pdf').toLowerCase()}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    triggerStatusPopup({
      type: 'success',
      title: 'ดาวน์โหลดคู่มือสำเร็จ',
      message: `ดาวน์โหลดไฟล์ "${m.title}" (${m.fileName || (m.format || 'PDF') + ' ขนาด ' + (m.size || '1.0 MB')}) เรียบร้อยแล้ว`,
      action: 'ดาวน์โหลดเอกสารคู่มือ',
      by: 'ผู้ใช้งานระบบ'
    });
  };

  // --- Manual Handlers ---
  const handleOpenManualModal = (manual = null) => {
    if (manual) {
      setEditingManual(manual);
      setManualForm({
        title: manual.title,
        format: manual.format,
        size: manual.size,
        desc: manual.desc,
        fileUrl: manual.fileUrl,
        fileName: manual.fileName || '',
        fileData: manual.fileData || null,
        category: manual.category
      });
    } else {
      setEditingManual(null);
      setManualForm({
        title: '',
        format: 'PDF',
        size: '1.2 MB',
        desc: '',
        fileUrl: '/downloads/form_document.pdf',
        fileName: '',
        fileData: null,
        category: 'แบบฟอร์มรายงาน'
      });
    }
    setManualModalOpen(true);
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const isEdit = !!editingManual;
      const url = '/api/content/manuals';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit 
        ? { id: editingManual.id, ...manualForm, hasAttachment: !!(manualForm.fileName || manualForm.fileData) } 
        : { ...manualForm, hasAttachment: !!(manualForm.fileName || manualForm.fileData) };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'บันทึกคู่มือไม่สำเร็จ');

      setMessage(data.message);
      setManualModalOpen(false);
      loadData();

      // แจ้งเตือน Popup Modal บันทึกคู่มือ
      triggerStatusPopup({
        type: 'success',
        title: isEdit ? 'แก้ไขไฟล์คู่มือสำเร็จ' : 'เพิ่มไฟล์คู่มือใหม่สำเร็จ',
        message: `ระบบบันทึกเอกสาร "${payload.title}" (${payload.fileName ? 'มีไฟล์แนบ: ' + payload.fileName : payload.format}) เรียบร้อยแล้ว`,
        casualtyName: payload.title,
        action: isEdit ? 'ปรับปรุงไฟล์คู่มือ' : 'อัปโหลดคู่มือใหม่',
        by: 'ผู้ดูแลระบบคู่มือ (Admin)',
        ref: payload.format
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteManual = async (id, title) => {
    if (!confirm(`ยืนยันการลบคู่มือ "${title}" หรือไม่?`)) return;
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/content/manuals?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ลบคู่มือไม่สำเร็จ');
      setMessage(data.message);
      loadData();

      // แจ้งเตือน Popup Modal ลบคู่มือ
      triggerStatusPopup({
        type: 'warning',
        title: 'ลบไฟล์คู่มือเรียบร้อย',
        message: `ไฟล์คู่มือ "${title}" ถูกลบออกจากระบบแล้ว`,
        casualtyName: title,
        action: 'ลบไฟล์คู่มือ',
        by: 'ผู้ดูแลระบบ (Admin)'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Video Handlers ---
  const handleOpenVideoModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setVideoForm({
        title: video.title,
        role: video.role,
        duration: video.duration,
        videoUrl: video.videoUrl,
        description: video.description,
        stepsText: Array.isArray(video.steps) ? video.steps.join('\n') : ''
      });
    } else {
      setEditingVideo(null);
      setVideoForm({
        title: '',
        role: 'สำหรับเจ้าหน้าที่หน่วยต้นสังกัด',
        duration: '3:00 นาที',
        videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        description: '',
        stepsText: '1. เข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่\n2. กรอกข้อมูลตามแบบฟอร์ม\n3. แนบเอกสารหลักฐาน'
      });
    }
    setVideoModalOpen(true);
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const isEdit = !!editingVideo;
      const url = '/api/content/videos';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit 
        ? { id: editingVideo.id, ...videoForm, steps: videoForm.stepsText.split('\n').filter(Boolean) }
        : { ...videoForm, steps: videoForm.stepsText.split('\n').filter(Boolean) };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'บันทึกวิดีโอไม่สำเร็จ');

      setMessage(data.message);
      setVideoModalOpen(false);
      loadData();

      // แจ้งเตือน Popup Modal บันทึกคลิปวิดีโอ
      triggerStatusPopup({
        type: 'success',
        title: isEdit ? 'แก้ไขคลิปวิดีโอสำเร็จ' : 'เพิ่มคลิปวิดีโอสอนการใช้งานสำเร็จ',
        message: `ระบบบันทึกสื่อการสอน "${payload.title}" (${payload.duration}) เรียบร้อยแล้ว`,
        casualtyName: payload.title,
        action: isEdit ? 'ปรับปรุงคลิปวิดีโอ' : 'เพิ่มคลิปวิดีโอใหม่',
        by: 'ผู้ดูแลระบบสื่อการสอน (Admin)',
        ref: payload.duration
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVideo = async (id, title) => {
    if (!confirm(`ยืนยันการลบคลิปวิดีโอ "${title}" หรือไม่?`)) return;
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/content/videos?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ลบวิดีโอไม่สำเร็จ');
      setMessage(data.message);
      loadData();

      // แจ้งเตือน Popup Modal ลบคลิปวิดีโอ
      triggerStatusPopup({
        type: 'warning',
        title: 'ลบคลิปวิดีโอเรียบร้อย',
        message: `คลิปวิดีโอสอนใช้งาน "${title}" ถูกลบออกจากระบบแล้ว`,
        casualtyName: title,
        action: 'ลบคลิปวิดีโอสื่อการสอน',
        by: 'ผู้ดูแลระบบ (Admin)'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      
      {/* Page Title & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="var(--gold-primary)" />
            <span>จัดการคู่มือการใช้งานระบบและคลิปวิดีโอสอนการใช้งาน</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            เพิ่ม ลบ แก้ไขไฟล์คู่มือเอกสารประกอบดาวน์โหลด และคลิปวิดีโอสอนการใช้งานที่จะแสดงบนหน้าหลักพอร์ทัล
          </p>
        </div>

        <Link href="/" className="btn btn-secondary btn-sm">
          <span>ดูการแสดงผลบนพอร์ทัล</span>
          <ExternalLink size={14} />
        </Link>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-success)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('manuals')}
          className={`btn ${activeTab === 'manuals' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '8px' }}
        >
          <FileText size={16} />
          <span>1. จัดการไฟล์คู่มือและเอกสารดาวน์โหลด ({manuals.length} รายการ)</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '8px' }}
        >
          <Video size={16} />
          <span>2. จัดการคลิปวิดีโอสอนการใช้งาน ({videos.length} ตอน)</span>
        </button>
      </div>

      {/* Tab 1: จัดการคู่มือและไฟล์เอกสาร */}
      {activeTab === 'manuals' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff' }}>รายการไฟล์คู่มือเอกสารประกอบดาวน์โหลด</h2>
            <button onClick={() => handleOpenManualModal()} className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              <span>+ เพิ่มไฟล์คู่มือใหม่</span>
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</div>
            ) : manuals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>ยังไม่มีข้อมูลคู่มือ</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {manuals.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: 'var(--cyan-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}>
                        {m.format}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>{m.title}</span>
                          <span className="badge badge-blue" style={{ fontSize: '11px' }}>{m.category}</span>
                          {(m.fileName || m.hasAttachment) && (
                            <span style={{
                              fontSize: '11px',
                              color: 'var(--emerald-success)',
                              background: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Paperclip size={10} />
                              <span>{m.fileName || 'มีไฟล์แนบ'}</span>
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                          ขนาด: {m.size} • ลิงก์/ไฟล์: {m.fileName || m.fileUrl} • อัปเดต: {m.updatedAt}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        type="button"
                        onClick={() => setPreviewManual(m)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '12px', gap: '4px' }}
                        title="พรีวิวเอกสารคู่มือ"
                      >
                        <Eye size={13} />
                        <span>พรีวิว</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleDownload(m)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px', gap: '4px' }}
                        title="ดาวน์โหลดไฟล์คู่มือ"
                      >
                        <Download size={13} />
                        <span>ดาวน์โหลด</span>
                      </button>

                      <button
                        onClick={() => handleOpenManualModal(m)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        <Edit3 size={13} />
                        <span>แก้ไข</span>
                      </button>

                      <button
                        onClick={() => handleDeleteManual(m.id, m.title)}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        <Trash2 size={13} />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: จัดการคลิปวิดีโอ */}
      {activeTab === 'videos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '18px', color: '#fff' }}>รายการคลิปวิดีโอสอนการใช้งานระบบ</h2>
            <button onClick={() => handleOpenVideoModal()} className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              <span>+ เพิ่มคลิปวิดีโอใหม่</span>
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</div>
            ) : videos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>ยังไม่มีข้อมูลวิดีโอ</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {videos.map((v, idx) => (
                  <div
                    key={v.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        background: 'rgba(212, 175, 55, 0.2)',
                        color: 'var(--gold-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <PlayCircle size={26} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>{v.title}</span>
                          <span className="badge badge-amber" style={{ fontSize: '11px' }}>{v.duration}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--gold-light)', marginTop: '2px' }}>{v.role}</div>
                        {v.description && (
                          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{v.description}</div>
                        )}

                        {/* Steps Preview */}
                        {v.steps && v.steps.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {v.steps.map((st, i) => (
                              <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle2 size={12} color="var(--emerald-success)" />
                                <span>{st}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                          URL วิดีโอ: {v.videoUrl}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenVideoModal(v)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        <Edit3 size={13} />
                        <span>แก้ไข</span>
                      </button>

                      <button
                        onClick={() => handleDeleteVideo(v.id, v.title)}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        <Trash2 size={13} />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: เพิ่ม/แก้ไข คู่มือเอกสาร */}
      {manualModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '28px', background: 'rgba(12, 22, 48, 0.98)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--gold-light)' }}>
                {editingManual ? 'แก้ไขข้อมูลไฟล์คู่มือ' : 'เพิ่มไฟล์คู่มือ/เอกสารดาวน์โหลดใหม่'}
              </h3>
              <button onClick={() => setManualModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManual}>
              {/* ส่วนแนบไฟล์คู่มือ/เอกสารดาวน์โหลด */}
              <div style={{
                background: 'rgba(20, 184, 166, 0.08)',
                border: '1px dashed rgba(20, 184, 166, 0.45)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ color: 'var(--cyan-accent)', fontWeight: 600, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Paperclip size={16} />
                  <span>แนบไฟล์คู่มือใช้งานและเอกสารประกอบดาวน์โหลด</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <label 
                      htmlFor="manual-file-input"
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
                      <span>{uploadingFile ? 'กำลังอัปโหลด...' : 'เลือกไฟล์จากอุปกรณ์'}</span>
                    </label>
                    <input 
                      id="manual-file-input"
                      type="file" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingFile}
                    />

                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      รองรับ PDF, DOCX, XLSX, ZIP, รูปภาพ (ไม่เกิน 50MB)
                    </span>
                  </div>

                  {/* กล่องแสดงสถานะไฟล์แนบ */}
                  {manualForm.fileName ? (
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
                            {manualForm.fileName}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--emerald-light)' }}>
                            {manualForm.format} • {manualForm.size} • พร้อมแนบในระบบ
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setManualForm((prev) => ({ ...prev, fileName: '', fileData: null }))}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11.5px' }}
                        title="ยกเลิกไฟล์แนบ"
                      >
                        <Trash2 size={13} />
                        <span>ยกเลิกไฟล์แนบ</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      * ยังไม่ได้แนบไฟล์ สามารถเลือกแนบไฟล์จากเครื่อง หรือระบุเป็นลิงก์ URL ในช่องด้านล่าง
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">ชื่อคู่มือ / แบบฟอร์มเอกสาร</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="เช่น แบบรายงาน กพ.4 หรือ หนังสือมอบอำนาจทายาท"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">ประเภทเอกสาร (Category)</label>
                  <select 
                    className="form-select"
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                    required
                  >
                    <option value="แบบฟอร์มรายงาน">แบบฟอร์มรายงาน</option>
                    <option value="เอกสารทายาท">เอกสารทายาท</option>
                    <option value="ระเบียบข้อบังคับ">ระเบียบข้อบังคับ</option>
                    <option value="คู่มือตรวจสอบ">คู่มือตรวจสอบ</option>
                    <option value="ตัวอย่างเอกสาร">ตัวอย่างเอกสาร</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">ชนิดไฟล์ (Format)</label>
                  <select 
                    className="form-select"
                    value={manualForm.format}
                    onChange={(e) => setManualForm({ ...manualForm, format: e.target.value })}
                    required
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

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">ขนาดไฟล์ (File Size)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="เช่น 1.2 MB หรือ 850 KB"
                    value={manualForm.size}
                    onChange={(e) => setManualForm({ ...manualForm, size: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">ลิงก์ดาวน์โหลด (URL / Path)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="/downloads/document.pdf"
                    value={manualForm.fileUrl}
                    onChange={(e) => setManualForm({ ...manualForm, fileUrl: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">คำอธิบายรายละเอียดเอกสาร</label>
                <textarea 
                  className="form-textarea"
                  rows={2}
                  placeholder="ระบุวัตถุประสงค์และการใช้งานเอกสารฉบับนี้..."
                  value={manualForm.desc}
                  onChange={(e) => setManualForm({ ...manualForm, desc: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setManualModalOpen(false)} className="btn btn-secondary">
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={15} />
                  <span>บันทึกข้อมูลคู่มือ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: เพิ่ม/แก้ไข คลิปวิดีโอ */}
      {videoModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '28px', background: 'rgba(12, 22, 48, 0.98)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--gold-light)' }}>
                {editingVideo ? 'แก้ไขข้อมูลคลิปวิดีโอ' : 'เพิ่มคลิปวิดีโอสอนการใช้งานใหม่'}
              </h3>
              <button onClick={() => setVideoModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVideo}>
              <div className="form-group">
                <label className="form-label required">ชื่อหัวข้อคลิปวิดีโอ</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="เช่น ขั้นตอนที่ 1: การลงทะเบียนและยื่นเสนอเรื่อง..."
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">กลุ่มเป้าหมาย (Role / Audience)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="เช่น สำหรับเจ้าหน้าที่หน่วย หรือ กสพ.กพ.ทบ."
                    value={videoForm.role}
                    onChange={(e) => setVideoForm({ ...videoForm, role: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">ความยาวคลิป (Duration)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="เช่น 4:20 นาที"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">URL คลิปวิดีโอ (YouTube Embed URL หรือ MP4)</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="https://www.youtube.com/embed/..."
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">คำอธิบายภาพรวม</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="คำอธิบายสั้นๆ ของเนื้อหาในคลิป"
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">หัวข้อสาระสำคัญในวิดีโอ (พิมพ์แยกบรรทัดละ 1 ข้อ)</label>
                <textarea 
                  className="form-textarea"
                  rows={4}
                  placeholder={"1. เข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่\n2. กรอกข้อมูลและปักหมุดสถานที่\n3. แนบไฟล์เอกสาร 10 รายการ"}
                  value={videoForm.stepsText}
                  onChange={(e) => setVideoForm({ ...videoForm, stepsText: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setVideoModalOpen(false)} className="btn btn-secondary">
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={15} />
                  <span>บันทึกข้อมูลวิดีโอ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: พรีวิวเอกสารคู่มือ */}
      {previewManual && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', background: 'rgba(12, 22, 48, 0.98)', border: '2px solid var(--cyan-accent)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--cyan-accent)', color: '#041417', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                  {previewManual.format || 'PDF'}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', color: '#fff', margin: 0 }}>{previewManual.title}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    หมวดหมู่: {previewManual.category} • ขนาด: {previewManual.size}
                  </div>
                </div>
              </div>

              <button onClick={() => setPreviewManual(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* รายละเอียดเอกสารตัวอย่างทางการ กองทัพบก / สลับไฟล์แนบ */}
              <SampleDocumentViewer doc={previewManual} onDownload={handleDownload} />
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleDownload(previewManual)}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Download size={14} />
                <span>ดาวน์โหลด ({previewManual.size})</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewManual(null)}
                className="btn btn-secondary btn-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
