// app/claims/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Send, 
  Building, 
  User, 
  ShieldCheck, 
  CreditCard, 
  Download, 
  Upload,
  MessageSquare,
  AlertCircle,
  Eye,
  Calendar,
  Check,
  CheckCheck,
  FileCheck,
  Image as ImageIcon,
  ExternalLink,
  X,
  Shield,
  FileSpreadsheet,
  Building2,
  RefreshCw
} from 'lucide-react';
import { formatThaiDate, calculateSlaStatus, validateAttachmentFile } from '@/lib/thai-utils';
import { CLAIM_STATUS } from '@/lib/constants';
import { triggerStatusPopup } from '@/components/StatusModal';
import SampleDocumentViewer from '@/components/SampleDocumentViewer';

export default function ClaimDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  
  const [claim, setClaim] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Workflow Dialog / Form States
  const [workflowRemark, setWorkflowRemark] = useState('');
  
  // Delay Reason Form State (เมื่อเกิน 30 วัน)
  const [delayReasonInput, setDelayReasonInput] = useState('');
  const [delayFileInput, setDelayFileInput] = useState('');

  // Document Review States (สำหรับ กสพ. และ บ.ประกันภัย)
  const [selectedDocIndex, setSelectedDocIndex] = useState(null);
  const [docReviewStatus, setDocReviewStatus] = useState('VERIFIED');
  const [docReviewComment, setDocReviewComment] = useState('');

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewDocStatus, setPreviewDocStatus] = useState('VERIFIED');
  const [previewDocComment, setPreviewDocComment] = useState('');

  const handleOpenPreviewDoc = (doc) => {
    setPreviewDoc(doc);
    setPreviewDocStatus(doc.status === 'REJECTED' ? 'REJECTED' : 'VERIFIED');
    setPreviewDocComment(doc.comment || '');
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
      const content = `เอกสารแนบทางราชการ กองทัพบก\nเอกสาร: ${doc.name || doc.title}\nไฟล์แนบ: ${doc.fileName || 'doc_attached.pdf'}\nเลขที่อ้างอิง: ${claim?.trackingCode || 'ทบ-กพ-๖๙/๐๑๒'}\nกำลังพล: ${claim?.casualtyRank} ${claim?.casualtyFirstName} ${claim?.casualtyLastName}\nสังกัด: ${claim?.unitName}\nตรวจรับรองโดย: กสพ.กพ.ทบ.`;
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

  // Insurance Payment / Transfer Modal States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [transferTime, setTransferTime] = useState('10:30');
  const [transferAmount, setTransferAmount] = useState(300000);
  const [transferBank, setTransferBank] = useState('ธนาคารทหารไทยธนชาต (ttb)');
  const [transferAccount, setTransferAccount] = useState('140-2-89412-5');
  const [recipientName, setRecipientName] = useState('');
  const [transferRef, setTransferRef] = useState(() => 'TXN-RTA-' + Date.now().toString().slice(-6));
  const [transferSlipPreview, setTransferSlipPreview] = useState('/images/sample_transfer_slip.png');
  const [transferSlipName, setTransferSlipName] = useState('ttb_eslip_official.jpg');
  const [transferNotes, setTransferNotes] = useState('โอนเงินสินไหมทดแทนเข้าบัญชีทายาทตามคำสั่งอนุมัติของ ทบ. เรียบร้อยแล้ว');
  
  // Full Slip Modal State
  const [showSlipFullModal, setShowSlipFullModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rta_user');
    let user = null;
    if (saved) {
      try {
        user = JSON.parse(saved);
        setCurrentUser(user);
      } catch (e) {}
    }
    loadClaim(user);
  }, [id]);

  const loadClaim = async (user) => {
    setLoading(true);
    try {
      const url = user?.id ? `/api/claims/${id}?userId=${user.id}` : `/api/claims/${id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setClaim(data.claim);
        if (data.claim.delayReason) {
          setDelayReasonInput(data.claim.delayReason);
        }
        if (data.claim.compensationAmount) {
          setTransferAmount(data.claim.compensationAmount);
        }
        if (data.claim.heirName) {
          setRecipientName(data.claim.heirName);
        } else {
          setRecipientName(`ทายาทของ ${data.claim.casualtyRank} ${data.claim.casualtyFirstName} ${data.claim.casualtyLastName}`);
        }
      } else {
        setErrorMsg(data.message || 'ไม่สามารถเข้าถึงข้อมูลคำร้องนี้ได้');
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowAction = async (newStatus, defaultRemark = '', extraData = {}) => {
    setActionLoading(true);
    setErrorMsg('');
    setNoticeMsg('');

    try {
      const remarkToSubmit = workflowRemark.trim() || defaultRemark;
      const res = await fetch(`/api/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          newStatus,
          remark: remarkToSubmit,
          extraData
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }

      setClaim(data.claim);
      setWorkflowRemark('');
      setShowTransferModal(false);
      const statusTitle = CLAIM_STATUS[newStatus]?.label || newStatus;
      setNoticeMsg(`อัปเดตสถานะสำเร็จ: ${statusTitle}`);

      // แจ้งเตือน Popup Modal ยืนยันสถานะการกระทำ
      const isRejection = newStatus === 'REJECTED';
      const isPayment = newStatus === 'PAID';
      
      triggerStatusPopup({
        type: isRejection ? 'warning' : 'success',
        title: isPayment ? 'บันทึกการจ่ายเงินสินไหมสำเร็จ' : isRejection ? 'ส่งกลับแก้ไขคำร้องแล้ว' : 'อัปเดตสถานะคำร้องสำเร็จ',
        message: isPayment 
          ? `ระบบได้บันทึกการโอนเงินสินไหมทดแทนให้แก่ ${data.claim.casualtyRank} ${data.claim.casualtyFirstName} ${data.claim.casualtyLastName} เรียบร้อยแล้ว`
          : `คำร้องรหัส ${data.claim.trackingCode} ได้รับการเปลี่ยนสถานะเป็น "${statusTitle}" เรียบร้อยแล้ว`,
        trackingCode: data.claim.trackingCode,
        casualtyName: `${data.claim.casualtyRank} ${data.claim.casualtyFirstName} ${data.claim.casualtyLastName}`,
        action: `เปลี่ยนสถานะเป็น: ${statusTitle}`,
        by: currentUser?.name ? `${currentUser.name} (${currentUser.role || ''})` : (currentUser?.role || 'เจ้าหน้าที่ผู้ปฏิบัติงาน'),
        comment: remarkToSubmit || undefined,
        amount: extraData?.compensationAmount ? `฿${Number(extraData.compensationAmount).toLocaleString('th-TH')}` : undefined,
        ref: extraData?.paymentDetails?.transferRef || undefined
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ตรวจสอบเอกสาร (ทั้ง กสพ. และ บ.ประกันภัย)
  const handleDocInspection = async (docIndex, statusToUse = docReviewStatus, commentToUse = docReviewComment) => {
    try {
      const res = await fetch(`/api/claims/${id}/document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          docIndex,
          status: statusToUse,
          comment: commentToUse
        })
      });

      const data = await res.json();
      if (data.success) {
        setClaim(data.claim);
        setSelectedDocIndex(null);
        setDocReviewComment('');
        
        // อัปเดต previewDoc หากเปิดดูอยู่
        if (previewDoc && previewDoc.index === docIndex) {
          const updatedDoc = data.claim.documents?.find(d => d.index === docIndex);
          if (updatedDoc) setPreviewDoc(updatedDoc);
        }

        const reviewerText = currentUser?.role === 'INSURANCE_REP' ? 'บริษัทประกันภัย' : 'กพ.ทบ.(กสพ.ฯ)';
        setNoticeMsg(`บันทึกผลการตรวจสอบเอกสารลำดับที่ ${docIndex} สำเร็จ (${reviewerText})`);

        // แจ้งเตือน Popup Modal รับทราบผลตรวจเอกสาร
        const docObj = data.claim.documents?.find(d => d.index === docIndex);
        const docName = docObj?.name || `เอกสารลำดับที่ ${docIndex}`;
        const isVerified = statusToUse === 'VERIFIED';

        triggerStatusPopup({
          type: isVerified ? 'success' : 'warning',
          title: isVerified ? 'บันทึกผลผ่านการตรวจเอกสาร' : 'แจ้งข้อบกพร่อง/ส่งกลับแก้ไขเอกสาร',
          message: isVerified 
            ? `ผลการตรวจสอบ "${docName}" ถูกต้องครบถ้วนตามหลักเกณฑ์ระเบียบ ทบ.` 
            : `แจ้งข้อบกพร่องเอกสาร "${docName}" เพื่อให้หน่วยต้นสังกัดรับทราบและแนบใหม่`,
          trackingCode: data.claim.trackingCode,
          casualtyName: `${data.claim.casualtyRank} ${data.claim.casualtyFirstName} ${data.claim.casualtyLastName}`,
          action: `ตรวจเอกสาร: ${docName} (${isVerified ? '✓ ผ่านการตรวจ' : '✗ ไม่ผ่าน/ต้องแก้ไข'})`,
          by: currentUser?.name ? `${currentUser.name} (${reviewerText})` : reviewerText,
          comment: commentToUse || undefined
        });
      } else {
        throw new Error(data.message || 'บันทึกผลตรวจไม่สำเร็จ');
      }
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  // ตรวจสอบเอกสารครบทุกข้อ (Batch Verify for Insurance / KSP)
  const handleVerifyAllDocs = async () => {
    if (!confirm('ยืนยันการบันทึกว่าตรวจสอบเอกสารหลักฐานทั้ง 10 รายการ ถูกต้องครบถ้วนสมบูรณ์แล้ว?')) return;
    setActionLoading(true);
    try {
      for (const doc of (claim.documents || [])) {
        if (doc.status !== 'VERIFIED') {
          await fetch(`/api/claims/${id}/document`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser?.id,
              docIndex: doc.index,
              status: 'VERIFIED',
              comment: 'เอกสารผ่านการตรวจสอบความถูกต้องเรียบร้อยแล้ว'
            })
          });
        }
      }
      await loadClaim(currentUser);
      setNoticeMsg('บันทึกผลการตรวจสอบเอกสารทุกรายการครบถ้วนเรียบร้อยแล้ว');

      // แจ้งเตือน Popup Modal รับทราบตรวจครบ 10 รายการ
      triggerStatusPopup({
        type: 'success',
        title: 'ตรวจสอบเอกสารหลักฐานครบ 10 รายการเรียบร้อย',
        message: 'เอกสารประกอบคำขอรับสิทธิเงินค่าสินไหมทดแทนทั้ง 10 รายการได้รับการตรวจสอบยืนยันความถูกต้องสมบูรณ์',
        trackingCode: claim.trackingCode,
        casualtyName: `${claim.casualtyRank} ${claim.casualtyFirstName} ${claim.casualtyLastName}`,
        action: 'รับรองเอกสารครบ 10 รายการ (Batch Inspection Verified)',
        by: currentUser?.name ? `${currentUser.name} (${currentUser.role === 'INSURANCE_REP' ? 'บ.ประกันภัย' : 'กพ.ทบ.'})` : (currentUser?.role === 'INSURANCE_REP' ? 'บ.ประกันภัย' : 'กพ.ทบ.(กสพ.ฯ)'),
      });
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // จัดการอัปโหลดไฟล์สลิปหลักฐานการโอนเงิน (พร้อมตรวจความปลอดภัยและขนาดไม่เกิน 10MB)
  const handleSlipFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const val = validateAttachmentFile(file);
      if (!val.valid) {
        alert(val.error);
        e.target.value = '';
        return;
      }
      setTransferSlipName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setTransferSlipPreview(uploadEvent.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // บันทึกการโอนเงิน (Insurance Payment Execution)
  const handleConfirmTransfer = async (e) => {
    e.preventDefault();
    if (!transferDate) {
      setErrorMsg('กรุณาระบุวันที่ทำการโอนเงิน');
      return;
    }

    const paymentDetails = {
      transferDate,
      transferTime,
      transferAmount: Number(transferAmount),
      transferBank,
      transferAccount,
      recipientName: recipientName || `${claim.casualtyFirstName} ${claim.casualtyLastName} (ทายาท)`,
      transferRef: transferRef || ('TXN-' + Date.now()),
      slipUrl: transferSlipPreview || '/images/sample_transfer_slip.png',
      slipName: transferSlipName,
      transferredBy: `${currentUser?.name} (${currentUser?.badge || 'บ.ประกันภัย'})`,
      transferredAt: new Date().toISOString(),
      notes: transferNotes
    };

    const remark = `บ.ประกันภัย โอนเงินสินไหม ${Number(transferAmount).toLocaleString('th-TH')} บาท เข้าบัญชี ${paymentDetails.recipientName} ธนาคาร ${transferBank} เลขที่ ${transferAccount} วันที่ ${formatThaiDate(transferDate)} เรียบร้อยแล้ว (เลขอ้างอิง: ${paymentDetails.transferRef})`;

    await handleWorkflowAction('PAID', remark, {
      paidAt: new Date(`${transferDate}T${transferTime || '10:00'}:00`).toISOString(),
      compensationAmount: Number(transferAmount),
      paymentDetails
    });
  };

  // ตรวจสอบรายงานชี้แจงความล่าช้า
  const handleDelayReasonSubmit = async (e) => {
    e.preventDefault();
    if (!delayReasonInput.trim()) {
      setErrorMsg('กรุณากรอกเหตุผลความล่าช้า/เอกสารไม่ครบถ้วน');
      return;
    }

    try {
      const res = await fetch(`/api/claims/${id}/delay-reason`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          reason: delayReasonInput,
          fileUrl: delayFileInput || '/uploads/delay_justification.pdf'
        })
      });

      const data = await res.json();
      if (data.success) {
        setClaim(data.claim);
        setNoticeMsg('บันทึกรายงานชี้แจงความล่าช้าเรียบร้อยแล้ว');

        // แจ้งเตือน Popup Modal บันทึกชี้แจงความล่าช้า
        triggerStatusPopup({
          type: 'info',
          title: 'บันทึกรายงานชี้แจงความล่าช้าสำเร็จ',
          message: 'ระบบได้บันทึกรายงานเหตุผลความจำเป็นและเอกสารชี้แจงเพื่อส่งให้ กสพ.กพ.ทบ. พิจารณาตามขั้นตอนแล้ว',
          trackingCode: data.claim.trackingCode,
          casualtyName: `${data.claim.casualtyRank} ${data.claim.casualtyFirstName} ${data.claim.casualtyLastName}`,
          action: 'บันทึกเหตุผลชี้แจงความล่าช้า SLA (> 30 วัน)',
          by: currentUser?.name ? `${currentUser.name} (${currentUser.role || 'หน่วย'})` : 'หน่วยต้นสังกัด (ผู้เสนอเรื่อง)',
          comment: delayReasonInput
        });
      }
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>กำลังโหลดข้อมูลคำร้อง...</div>;
  }

  if (errorMsg && !claim) {
    return (
      <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <div style={{ color: 'var(--ruby-danger)', fontSize: '18px', marginBottom: '16px' }}>{errorMsg}</div>
        <button onClick={() => router.push('/claims')} className="btn btn-secondary">
          <ArrowLeft size={16} /> กลับสู่หน้ารายการ
        </button>
      </div>
    );
  }

  const sla = calculateSlaStatus(claim.createdAt, claim.slaTargetDays || 30);
  const isOverdue = sla.status === 'OVERDUE' && claim.status !== 'PAID' && claim.status !== 'SK_NOTIFIED';
  
  // สิทธิ์ในการตรวจและพรีวิวเอกสาร
  const canReviewDocs = currentUser?.role === 'KSP_OFFICER' || currentUser?.role === 'INSURANCE_REP' || currentUser?.role === 'ADMIN';
  const isInsuranceRep = currentUser?.role === 'INSURANCE_REP' || currentUser?.role === 'ADMIN';

  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={() => router.push('/claims')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> ย้อนกลับไปรายการ
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>สิทธิผู้ใช้ปัจจุบัน:</span>
          <span className="badge badge-amber">{currentUser?.name} ({currentUser?.role})</span>
        </div>
      </div>

      {noticeMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-success)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#6ee7b7' }}>
          ✓ {noticeMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-danger)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Claim Header & SLA Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '24px', borderLeft: '4px solid var(--gold-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px' }}>คำร้องเลขที่: {claim.trackingCode}</h1>
              <span className={`badge ${claim.claimType === 'HIGH_RISK' ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: '13px' }}>
                {claim.claimType === 'HIGH_RISK' ? 'หน้าที่สำคัญ/เสี่ยงภัย (300,000 บ.)' : 'ยามปกติ (60,000 บ.)'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
              หน่วยเสนอเรื่อง: <strong style={{ color: '#fff' }}>{claim.unitName}</strong> • ยื่นเมื่อ: {formatThaiDate(claim.createdAt)}
            </p>
            {claim.unitPath && (
              <div style={{ fontSize: '12px', color: 'var(--gold-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏛️ สายการบังคับบัญชา:</span>
                <span style={{ color: '#e0f2fe' }}>{claim.unitPath}</span>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>สถานะ Workflow ปัจจุบัน</div>
            <div style={{ marginTop: '4px' }}>
              <span className={`badge ${claim.status === 'PAID' ? 'badge-emerald' : claim.status === 'APPROVED' ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
                {CLAIM_STATUS[claim.status]?.label || claim.status}
              </span>
            </div>
          </div>
        </div>

        {/* SLA Timeline Tracking Bar */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color={sla.color} />
              <strong>การติดตามกรอบเวลา (SLA 30 วัน):</strong>
            </span>
            <span style={{ color: sla.color, fontWeight: 700 }}>
              {claim.status === 'PAID' || claim.status === 'SK_NOTIFIED' ? '✓ สำเร็จเรียบร้อย' : sla.label}
            </span>
          </div>

          <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, Math.round((sla.daysElapsed / 30) * 100))}%`,
              height: '100%',
              background: sla.color,
              transition: 'width 0.4s ease'
            }}></div>
          </div>
        </div>
      </div>

      {/* Warning Box: กรณีเกิน 30 วัน */}
      {isOverdue && (
        <div className="glass-panel" style={{
          padding: '20px',
          marginBottom: '24px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--ruby-danger)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', marginBottom: '10px' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '16px', color: '#f87171' }}>คำเตือน: ดำเนินเรื่องเกินกรอบเวลา SLA 30 วัน (Overdue)</h3>
          </div>
          <p style={{ fontSize: '13.5px', color: '#cbd5e1', marginBottom: '14px' }}>
            ระเบียบกำหนดให้หน่วยต้นสังกัดต้องรายงานผลการดำเนินงานล่าช้า พร้อมแนบเอกสารชี้แจงเหตุผลความล่าช้า/เอกสารไม่ครบถ้วน
          </p>

          {claim.delayReason ? (
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
              <div style={{ fontWeight: 600, color: 'var(--emerald-success)' }}>✓ หน่วยชี้แจงเหตุผลความล่าช้าแล้ว:</div>
              <div style={{ color: '#fff', marginTop: '4px' }}>&quot;{claim.delayReason}&quot;</div>
              {claim.delayAttachmentUrl && (
                <div style={{ marginTop: '6px' }}>
                  <a href={claim.delayAttachmentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--gold-primary)', textDecoration: 'underline' }}>
                    📎 ดูเอกสารชี้แจงแนบ
                  </a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleDelayReasonSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea 
                className="form-textarea" 
                rows={2}
                placeholder="ระบุเหตุผลความล่าช้า เช่น อยู่ระหว่างรอหนังสือคำสั่งปลด, รอเอกสารผลชันสูตรพลิกศพของ ตร. ฯลฯ"
                value={delayReasonInput}
                onChange={(e) => setDelayReasonInput(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>เจ้าหน้าที่หน่วยบันทึกรายงานเหตุผล</span>
                <button type="submit" className="btn btn-danger btn-sm">
                  <Send size={14} /> บันทึกรายงานเหตุผลความล่าช้า
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Grid: ข้อมูลผู้สูญเสีย & รายละเอียดสิทธิ / การโอนเงิน */}
      <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
        
        {/* Casualty Details */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} />
            <span>ข้อมูลกำลังพลผู้สูญเสีย</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '14px' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', display: 'block' }}>ยศ - ชื่อ - สกุล:</span>
              <strong style={{ fontSize: '15px' }}>{claim.casualtyRank} {claim.casualtyFirstName} {claim.casualtyLastName}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', display: 'block' }}>เลขประจำตัวประชาชน (13 หลัก):</span>
              <strong>{claim.casualtyCitizenId}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', display: 'block' }}>ประเภทการสูญเสีย:</span>
              <span className={`badge ${claim.lossType === 'DECEASED' ? 'badge-red' : 'badge-amber'}`}>
                {claim.lossType === 'DECEASED' ? 'ผู้เสียชีวิต' : 'พิการทุพพลภาพ'}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', display: 'block' }}>ประเภทกำลังพล:</span>
              <span>{claim.personnelType}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', display: 'block' }}>เพศ:</span>
              <span>{claim.casualtyGender || 'ชาย'}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', display: 'block' }}>วันที่สูญเสีย (พ.ศ.):</span>
              <span>{formatThaiDate(claim.lossDate)}</span>
            </div>
          </div>

          {claim.deathCertificateCause && (
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', display: 'block' }}>สาเหตุการเสียชีวิต (ตามใบมรณบัตร):</span>
              <p style={{ marginTop: '2px', fontSize: '14px', color: '#fca5a5', fontWeight: 500 }}>{claim.deathCertificateCause}</p>
            </div>
          )}

          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '12px', display: 'block' }}>สาเหตุการสูญเสีย (พฤติการณ์เหตุการณ์):</span>
            <p style={{ marginTop: '2px', fontSize: '14px', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{claim.causeOfLoss}</p>
          </div>

          {/* ข้อมูลสถานที่เสียชีวิต & พิกัด Google Maps */}
          {claim.locationOfLoss && (
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>สถานที่เสียชีวิต / เกิดเหตุ:</span>
                {claim.locationOfLoss.lat && (
                  <a
                    href={`https://www.google.com/maps?q=${claim.locationOfLoss.lat},${claim.locationOfLoss.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '11.5px', color: 'var(--gold-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    📍 เปิดบน Google Maps
                  </a>
                )}
              </div>
              <div style={{ fontSize: '13.5px', color: '#fff', fontWeight: 500 }}>
                {claim.locationOfLoss.street ? `ถนน${claim.locationOfLoss.street} ` : ''}
                {claim.locationOfLoss.subdistrict ? `ต.${claim.locationOfLoss.subdistrict} ` : ''}
                {claim.locationOfLoss.district ? `อ.${claim.locationOfLoss.district} ` : ''}
                {claim.locationOfLoss.province ? `จ.${claim.locationOfLoss.province}` : ''}
              </div>
              {claim.locationOfLoss.lat && (
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  พิกัด: {claim.locationOfLoss.lat.toFixed(6)}, {claim.locationOfLoss.lng.toFixed(6)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Claim & Payment Details + Transfer Proof Box */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} />
            <span>สิทธิเงินสินไหมทดแทน & การโอนเงิน</span>
          </h2>

          <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ยอดเงินค่าสินไหมตามสิทธิ:</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gold-primary)', marginTop: '4px' }}>
              {claim.compensationAmount?.toLocaleString('th-TH') || '60,000'} <span style={{ fontSize: '16px', color: '#fff' }}>บาท</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              {claim.claimType === 'HIGH_RISK' ? 'กรณีปฏิบัติหน้าที่สำคัญ หรือ หน้าที่เสี่ยงภัย' : 'กรณีการเสียชีวิต/ทุพพลภาพยามปกติ'}
            </div>
          </div>

          {/* ข้อมูลการโอนเงินจริง (ถ้าบันทึกแล้ว) พร้อมพรีวิวหลักฐานการโอน */}
          {claim.status === 'PAID' || claim.paidAt ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid var(--emerald-success)'
            }}>
              <div style={{ color: 'var(--emerald-success)', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 size={18} /> โอนเงินสินไหมเข้าบัญชีทายาทเรียบร้อยแล้ว
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px', marginTop: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11.5px', display: 'block' }}>วันที่ทำการโอนเงิน:</span>
                  <strong style={{ color: '#fff' }}>
                    {formatThaiDate(claim.paymentDetails?.transferDate || claim.paidAt)}
                  </strong>
                  {claim.paymentDetails?.transferTime && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      เวลา {claim.paymentDetails.transferTime} น.
                    </span>
                  )}
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11.5px', display: 'block' }}>ยอดเงินที่โอนสำเร็จ:</span>
                  <strong style={{ color: 'var(--emerald-success)', fontSize: '14px' }}>
                    {(claim.paymentDetails?.transferAmount || claim.compensationAmount)?.toLocaleString('th-TH')} บาท
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11.5px', display: 'block' }}>ธนาคาร & เลขที่บัญชี:</span>
                  <span style={{ color: '#e0f2fe' }}>
                    {claim.paymentDetails?.transferBank || 'ธนาคารทหารไทยธนชาต'} ({claim.paymentDetails?.transferAccount || '140-2-89412-5'})
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11.5px', display: 'block' }}>ชื่อบัญชีผู้รับโอน (ทายาท):</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>
                    {claim.paymentDetails?.recipientName || `${claim.casualtyFirstName} (ทายาท)`}
                  </span>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11.5px', display: 'block' }}>เลขที่อ้างอิงธุรกรรม (Tx Ref):</span>
                  <span style={{ color: 'var(--gold-primary)', fontFamily: 'monospace' }}>
                    {claim.paymentDetails?.transferRef || 'TXN-RTA-981240'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '10px' }}>
                    (บันทึกโดย: {claim.paymentDetails?.transferredBy || 'ตัวแทน บ.ประกันภัย'})
                  </span>
                </div>
              </div>

              {/* สลิปหลักฐานการโอนเงิน (Transfer Slip Preview Card) */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--emerald-success)'
                  }}>
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                      {claim.paymentDetails?.slipName || 'หลักฐานสลิปการโอนเงิน (e-Slip)'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--emerald-success)' }}>
                      ✓ ตรวจสอบหลักฐานแล้ว
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowSlipFullModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: 'var(--emerald-success)', color: '#6ee7b7', fontSize: '12px' }}
                >
                  <Eye size={14} />
                  <span>พรีวิวสลิปขนาดเต็ม</span>
                </button>
              </div>

            </div>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
              <Clock size={28} color="var(--amber-warning)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                รอการตรวจสอบและบันทึกการโอนเงินจาก บ.ประกันภัย
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                เมื่อผู้บังคับบัญชาอนุมัติแล้ว ตัวแทนบริษัทประกันภัยจะทำหน้าที่ตรวจเอกสารและกดบันทึกการโอนเงินพร้อมแนบสลิป
              </div>

              {/* ปุ่มเปิดฟอร์มบันทึกการโอนเงินสำหรับ บ.ประกันภัย */}
              {isInsuranceRep && (
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="btn btn-primary"
                  style={{ marginTop: '14px', padding: '10px 20px', width: '100%' }}
                >
                  <CreditCard size={16} />
                  <span>เปิดฟอร์มบันทึกการโอนเงิน (พร้อมเลือกวันที่และแนบสลิป)</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Section: เอกสารหลักฐานประกอบ 10 รายการ พร้อมปุ่มพรีวิวและปุ่มตรวจเอกสารสำหรับ กสพ.กพ.ทบ. และ บ.ประกันภัย */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '17px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} color="var(--gold-primary)" />
              <span>รายการเอกสารหลักฐานประกอบ 10 รายการ</span>
              {currentUser?.role === 'KSP_OFFICER' && (
                <span className="badge badge-blue" style={{ fontSize: '11.5px' }}>
                  กพ.ทบ. (กสพ.ฯ) ตรวจสอบเอกสาร
                </span>
              )}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>
              {currentUser?.role === 'KSP_OFFICER'
                ? 'เจ้าหน้าที่ กพ.ทบ. (กสพ.ฯ) กดตรวจสอบและพรีวิวเอกสารที่หน่วยยื่นเสนอเข้ามา พร้อมบันทึกผลการตรวจหรือตีกลับรายข้อ'
                : 'เจ้าหน้าที่ กพ.ทบ.(กสพ.ฯ) และ ตัวแทนบริษัทประกันภัย มีสิทธิ์กดพรีวิวและตรวจสอบเอกสารความถูกต้อง'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--gold-primary)' }}>
              ครบถ้วน {claim.documents?.filter(d => d.uploaded).length || 0} / 10 รายการ
            </span>

            {/* ปุ่มลัด: ตรวจสอบเอกสารครบทุกข้อสำหรับ บ.ประกันภัย และ กสพ. */}
            {canReviewDocs && (
              <button 
                onClick={handleVerifyAllDocs}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '12px', borderColor: 'var(--emerald-success)', color: '#6ee7b7' }}
                disabled={actionLoading}
              >
                <CheckCheck size={14} />
                <span>
                  {currentUser?.role === 'KSP_OFFICER' ? '✓ กพ.ทบ. ตรวจสอบผ่านทั้งหมด (10 รายการ)' : '✓ ตรวจสอบผ่านทั้งหมด'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {claim.documents?.map((doc) => (
            <div 
              key={doc.index}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: doc.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: doc.status === 'REJECTED' ? '1px solid var(--ruby-danger)' : '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: doc.uploaded ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: doc.uploaded ? 'var(--gold-primary)' : 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12.5px'
                }}>
                  {doc.index}
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{doc.name}</span>
                    {doc.fileName && (
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 400 }}>
                        ({doc.fileName})
                      </span>
                    )}
                  </div>
                  
                  {/* แสดงข้อมูลผู้ตรวจสอบ (กสพ. หรือ บ.ประกันภัย) */}
                  {doc.verifiedBy && (
                    <div style={{ fontSize: '11.5px', color: 'var(--cyan-accent)', marginTop: '2px' }}>
                      ✓ ตรวจสอบแล้วโดย: <strong>{doc.verifiedBy}</strong> ({doc.verifiedRole === 'INSURANCE_REP' ? 'บ.ประกันภัย' : 'กพ.ทบ.'})
                    </div>
                  )}

                  {doc.comment && (
                    <div style={{ fontSize: '12px', color: doc.status === 'REJECTED' ? '#f87171' : 'var(--emerald-success)', marginTop: '2px' }}>
                      💬 ข้อคิดเห็น: {doc.comment}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {doc.uploaded ? (
                  <span className={`badge ${doc.status === 'VERIFIED' ? 'badge-emerald' : doc.status === 'REJECTED' ? 'badge-red' : 'badge-amber'}`}>
                    {doc.status === 'VERIFIED' ? '✓ ตรวจสอบผ่าน' : doc.status === 'REJECTED' ? '✗ ให้แก้ไข' : 'รอตรวจ'}
                  </span>
                ) : doc.index === 10 && claim.claimType === 'NORMAL' ? (
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-success)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '11px' }}>
                    ✓ ยกเว้นไม่ต้องแนบ (กรณี 60,000 บ.)
                  </span>
                ) : (
                  <span className="badge badge-dark">ยังไม่แนบ</span>
                )}

                {/* ปุ่มพรีวิวเอกสารที่แนบ (สำหรับ กพ.ทบ. และ บ.ประกันภัย) */}
                <button
                  onClick={() => handleOpenPreviewDoc(doc)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="กดดูพรีวิวเอกสารที่หน่วยยื่นเสนอเข้ามา"
                >
                  <Eye size={14} />
                  <span>พรีวิวเอกสาร</span>
                </button>

                {/* ปุ่มตรวจเอกสารสำหรับ กสพ.กพ.ทบ. และ บ.ประกันภัย */}
                {canReviewDocs && (
                  <button 
                    onClick={() => {
                      setSelectedDocIndex(doc.index);
                      setDocReviewComment(doc.comment || '');
                      setDocReviewStatus(doc.status === 'REJECTED' ? 'REJECTED' : 'VERIFIED');
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {currentUser?.role === 'KSP_OFFICER' ? 'กพ.ทบ. ตรวจเอกสาร' : 'ตรวจ / บันทึกผล'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal / Panel ตรวจสอบเอกสารรายข้อ */}
        {selectedDocIndex !== null && (
          <div className="glass-panel" style={{ marginTop: '18px', padding: '18px', background: 'rgba(4, 20, 23, 0.98)', border: '1px solid var(--cyan-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontWeight: 700, color: 'var(--cyan-accent)', fontSize: '14.5px' }}>
                บันทึกผลการตรวจสอบเอกสารข้อ {selectedDocIndex}: {claim.documents?.find(d => d.index === selectedDocIndex)?.name}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--gold-primary)' }}>
                ผู้ตรวจ: {currentUser?.name} ({currentUser?.role === 'INSURANCE_REP' ? 'บ.ประกันภัย' : 'กพ.ทบ.'})
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="doc_status" 
                  value="VERIFIED" 
                  checked={docReviewStatus === 'VERIFIED'} 
                  onChange={() => setDocReviewStatus('VERIFIED')} 
                />
                <span style={{ color: 'var(--emerald-success)', fontWeight: 600 }}>✓ ถูกต้องครบถ้วน (ผ่านการตรวจ)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="doc_status" 
                  value="REJECTED" 
                  checked={docReviewStatus === 'REJECTED'} 
                  onChange={() => setDocReviewStatus('REJECTED')} 
                />
                <span style={{ color: 'var(--ruby-danger)', fontWeight: 600 }}>✗ ตีกลับให้แก้ไข / ขอเอกสารเพิ่มเติม</span>
              </label>
            </div>

            <input 
              type="text" 
              className="form-input" 
              placeholder="ระบุข้อคิดเห็น/สิ่งที่ต้องแก้ไข เช่น ขาดตราประทับแพทย์, หนังสือมอบอำนาจไม่ลงนามพยาน, สำเนาบัตรชัดเจน..."
              value={docReviewComment}
              onChange={(e) => setDocReviewComment(e.target.value)}
              style={{ marginBottom: '12px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setSelectedDocIndex(null)} className="btn btn-secondary btn-sm">ยกเลิก</button>
              <button onClick={() => handleDocInspection(selectedDocIndex)} className="btn btn-primary btn-sm">
                บันทึกผลการตรวจเอกสาร
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role-Based Workflow Execution Action Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderTop: '3px solid var(--gold-primary)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--gold-primary)" />
          <span>การสั่งการและดำเนินกระบวนการ Workflow ตามสิทธิ์ ({currentUser?.role})</span>
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">หมายเหตุ / ความเห็นการสั่งการ (จะถูกส่งแจ้งเตือนในระบบและ Telegram):</label>
          <input 
            type="text"
            className="form-input"
            placeholder="พิมพ์ความคิดเห็นประกอบการสั่งการ..."
            value={workflowRemark}
            onChange={(e) => setWorkflowRemark(e.target.value)}
          />
        </div>

        {/* Action Buttons ตามสิทธิ์ของผู้ใช้ */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* 1. สิทธิเจ้าหน้าที่หน่วย (UNIT_OFFICER) */}
          {currentUser?.role === 'UNIT_OFFICER' && claim.status === 'REJECTED_BY_KSP' && (
            <button 
              onClick={() => handleWorkflowAction('SUBMITTED', 'หน่วยได้ดำเนินการแก้ไขเอกสารตามข้อคิดเห็นและส่งตรวจใหม่เรียบร้อย')}
              className="btn btn-primary"
              disabled={actionLoading}
            >
              <Send size={16} /> ส่งเรื่องที่แก้ไขแล้วให้ กสพ. ตรวจสอบใหม่
            </button>
          )}

          {/* 2. สิทธิ กพ.ทบ. (กสพ.ฯ) (KSP_OFFICER) */}
          {(currentUser?.role === 'KSP_OFFICER' || currentUser?.role === 'ADMIN') && (
            <>
              {claim.status === 'SUBMITTED' && (
                <button 
                  onClick={() => handleWorkflowAction('UNDER_REVIEW', 'กสพ. รับเรื่องเข้าสู่กระบวนการตรวจเอกสารหลักฐาน')}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  <FileText size={16} /> กสพ. รับเรื่องตรวจเอกสาร
                </button>
              )}

              <button 
                onClick={() => handleWorkflowAction('REJECTED_BY_KSP', 'กสพ. ตีกลับเอกสารให้หน่วยแก้ไขตามคอมเมนต์')}
                className="btn btn-danger"
                disabled={actionLoading}
              >
                <XCircle size={16} /> ตีกลับให้หน่วยแก้ไข (พร้อมคอมเมนต์)
              </button>

              <button 
                onClick={() => handleWorkflowAction('PENDING_APPROVAL', 'เอกสารถูกต้องครบถ้วน เสนอผู้บังคับบัญชา (จก.กพ.ทบ.) อนุมัติ')}
                className="btn btn-primary"
                disabled={actionLoading}
              >
                <CheckCircle2 size={16} /> ผ่านการตรวจ เสนอ จก.กพ.ทบ. อนุมัติ
              </button>
            </>
          )}

          {/* 3. สิทธิ จก.กพ.ทบ. (COMMANDER) */}
          {(currentUser?.role === 'COMMANDER' || currentUser?.role === 'ADMIN') && (
            <>
              <button 
                onClick={() => handleWorkflowAction('APPROVED', 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.) อนุมัติการจ่ายเงินสินไหมทดแทน')}
                className="btn btn-success"
                disabled={actionLoading}
              >
                <CheckCircle2 size={16} /> อนุมัติการขอรับสิทธิเงินสินไหม (จก.กพ.ทบ.)
              </button>

              <button 
                onClick={() => handleWorkflowAction('REJECTED_BY_KSP', 'ผู้บังคับบัญชาส่งเรื่องกลับให้ทบทวนความถูกต้อง')}
                className="btn btn-secondary"
                disabled={actionLoading}
              >
                ส่งกลับทบทวน
              </button>
            </>
          )}

          {/* 4. สิทธิ บริษัทประกันภัย (INSURANCE_REP) */}
          {(currentUser?.role === 'INSURANCE_REP' || currentUser?.role === 'ADMIN') && (
            <>
              {/* ปุ่มเปิดฟอร์มบันทึกการโอนเงิน (พร้อมเลือกวันที่และแนบสลิป) */}
              <button 
                onClick={() => setShowTransferModal(true)}
                className="btn btn-success"
                style={{ padding: '10px 20px', fontWeight: 700 }}
                disabled={actionLoading}
              >
                <CreditCard size={18} />
                <span>💳 บันทึกการโอนเงินสินไหม ({claim.compensationAmount?.toLocaleString('th-TH')} บ.)</span>
              </button>

              {/* ปุ่มตรวจเอกสารทั้งหมดผ่าน */}
              <button 
                onClick={handleVerifyAllDocs}
                className="btn btn-secondary"
                disabled={actionLoading}
              >
                <CheckCheck size={16} /> ตรวจสอบเอกสารครบถ้วน
              </button>

              <button 
                onClick={() => handleWorkflowAction('DOC_REQUESTED', 'บริษัทประกันภัยขอเอกสารประกอบเพิ่มเติม')}
                className="btn btn-secondary"
                disabled={actionLoading}
              >
                ขอเอกสารเพิ่มเติม
              </button>
            </>
          )}

          {/* 5. สิทธิ สก.ทบ. (SK_OFFICER) */}
          {(currentUser?.role === 'SK_OFFICER' || currentUser?.role === 'ADMIN') && (
            <button 
              onClick={() => handleWorkflowAction('SK_NOTIFIED', 'กรมสวัสดิการทหารบก (สก.ทบ.) รับทราบยอดจ่ายเงินช่วยเหลือเรียบร้อย ปิดเรื่อง')}
              className="btn btn-primary"
              disabled={actionLoading}
            >
              <CheckCircle2 size={16} /> สก.ทบ. รับทราบยอดจ่ายเงินช่วยเหลือ (ปิดเรื่องสมบูรณ์)
            </button>
          )}

        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '17px', marginBottom: '16px' }}>ประวัติการดำเนินเรื่อง (Audit Trail Timeline)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {claim.timeline?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--gold-primary)',
                marginTop: '6px',
                flexShrink: 0
              }}></div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: '14px' }}>{item.action}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {new Date(item.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--gold-light)', marginTop: '2px' }}>โดย: {item.by}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.remark}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: พรีวิวเอกสารที่หน่วยยื่นเสนอเข้ามา (Document Preview Modal) */}
      {/* ========================================================================= */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 8, 12, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '820px',
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
                    ไฟล์แนบ: {previewDoc.fileName || `doc_${previewDoc.index}.pdf`} • หน่วยเสนอเรื่อง: {claim.unitName}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Document Preview Canvas */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              
              {/* เอกสารที่แนบมาแสดง (Attached Document View) / สลับดูสรุปรายละเอียดทางการ */}
              <SampleDocumentViewer doc={previewDoc} claim={claim} onDownload={handleDownloadDoc} />

              {/* ส่วนควบคุมการตรวจเอกสารภายใน Modal (สำหรับ กพ.ทบ. กสพ.ฯ และ บ.ประกันภัย) */}
              {canReviewDocs && (
                <div style={{ marginTop: '20px', padding: '16px 20px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cyan-accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} />
                      <span>
                        {currentUser?.role === 'KSP_OFFICER' 
                          ? 'กพ.ทบ. (กสพ.ฯ) ตรวจสอบและบันทึกผลเอกสารข้อนี้:' 
                          : currentUser?.role === 'INSURANCE_REP'
                          ? 'บ.ประกันภัย ตรวจสอบและบันทึกผลเอกสารข้อนี้:'
                          : 'บันทึกการตรวจสอบเอกสาร:'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--gold-primary)' }}>
                      {currentUser?.name} ({currentUser?.badge || currentUser?.role})
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="preview_review_status" 
                        value="VERIFIED" 
                        checked={previewDocStatus === 'VERIFIED'} 
                        onChange={() => setPreviewDocStatus('VERIFIED')} 
                      />
                      <span style={{ color: 'var(--emerald-success)', fontWeight: 600 }}>
                        ✓ เอกสารถูกต้องครบถ้วน ({currentUser?.role === 'KSP_OFFICER' ? 'กพ.ทบ. ตรวจผ่าน' : 'ผ่านการตรวจ'})
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="preview_review_status" 
                        value="REJECTED" 
                        checked={previewDocStatus === 'REJECTED'} 
                        onChange={() => setPreviewDocStatus('REJECTED')} 
                      />
                      <span style={{ color: 'var(--ruby-danger)', fontWeight: 600 }}>
                        ✗ ตีกลับให้หน่วยแก้ไข / ขอเอกสารเพิ่มเติม
                      </span>
                    </label>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={currentUser?.role === 'KSP_OFFICER' ? 'ระบุข้อคิดเห็น กพ.ทบ. เช่น เอกสารสมบูรณ์, ขาดตราประทับแพทย์, แนบสำเนาไม่ชัดเจน...' : 'ระบุข้อคิดเห็น...'}
                      value={previewDocComment}
                      onChange={(e) => setPreviewDocComment(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ข้อความด่วน:</span>
                      <button type="button" onClick={() => setPreviewDocComment('เอกสารถูกต้องครบถ้วนตามระเบียบ ทบ.')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: '#cbd5e1', cursor: 'pointer' }}>
                        ✓ เอกสารครบถ้วนตามระเบียบ
                      </button>
                      <button type="button" onClick={() => setPreviewDocComment('ยังไม่ระบุตราประทับหรือลายมือชื่อแพทย์ ให้ส่งฉบับจริง')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: '#fca5a5', cursor: 'pointer' }}>
                        ✗ ขาดตราประทับแพทย์
                      </button>
                      <button type="button" onClick={() => setPreviewDocComment('หนังสือแสดงเจตนาทายาทยังไม่ลงนามพยานครบ 2 ท่าน')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: '#fca5a5', cursor: 'pointer' }}>
                        ✗ พยานยังไม่ลงนาม
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      onClick={() => handleDocInspection(
                        previewDoc.index, 
                        previewDocStatus, 
                        previewDocComment || (previewDocStatus === 'VERIFIED' ? (currentUser?.role === 'KSP_OFFICER' ? 'กพ.ทบ.(กสพ.ฯ) ตรวจสอบเอกสารถูกต้องครบถ้วน' : 'ตรวจสอบเอกสารแล้วถูกต้องสมบูรณ์') : 'ขอเอกสารเพิ่มเติม/ให้แก้ไข')
                      )}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '8px 18px', fontWeight: 700 }}
                    >
                      <CheckCircle2 size={16} />
                      <span>บันทึกผลการตรวจสอบ ({currentUser?.role === 'KSP_OFFICER' ? 'กพ.ทบ. กสพ.ฯ' : 'ผู้ตรวจ'})</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                สถานะเอกสารปัจจุบัน: <strong>{previewDoc.status === 'VERIFIED' ? '✓ ตรวจสอบผ่าน' : previewDoc.status === 'REJECTED' ? '✗ ให้แก้ไข' : 'รอตรวจ'}</strong>
              </span>

              <button onClick={() => setPreviewDoc(null)} className="btn btn-secondary btn-sm">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: บันทึกการโอนเงินสินไหมทดแทน (Insurance Payment / Transfer Modal) */}
      {/* ========================================================================= */}
      {showTransferModal && (
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
          zIndex: 110,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(4, 20, 23, 0.98)',
            border: '2px solid var(--emerald-success)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(4, 20, 23, 0.9) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--emerald-success)',
                  color: '#041417',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', color: '#fff', margin: 0 }}>
                    บันทึกการโอนเงินสินไหมทดแทน (บ.ประกันภัย)
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--emerald-success)', marginTop: '2px' }}>
                    คำร้อง: {claim.trackingCode} • {claim.casualtyRank} {claim.casualtyFirstName} {claim.casualtyLastName}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowTransferModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleConfirmTransfer} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* ยอดเงินและประเภทสินไหม */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ประเภทสิทธิสินไหม:</span>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                    {claim.claimType === 'HIGH_RISK' ? 'หน้าที่สำคัญ/เสี่ยงภัย' : 'ยามปกติ'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ยอดเงินสินไหมที่ต้องโอน:</span>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--emerald-success)' }}>
                    {Number(transferAmount).toLocaleString('th-TH')} บาท
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns: วันที่โอน และ เวลาที่โอน */}
              <div className="grid-cols-2" style={{ gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--cyan-accent)" />
                    <span>วันที่ทำการโอนเงิน (Transfer Date)</span>
                  </label>
                  <input 
                    type="date"
                    className="form-input"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--cyan-accent)" />
                    <span>เวลาที่โอนเงิน (Transfer Time)</span>
                  </label>
                  <input 
                    type="time"
                    className="form-input"
                    value={transferTime}
                    onChange={(e) => setTransferTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* ธนาคารและเลขบัญชีปลายทาง */}
              <div className="grid-cols-2" style={{ gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">ธนาคารปลายทาง (ผู้รับโอน)</label>
                  <select 
                    className="form-input"
                    value={transferBank}
                    onChange={(e) => setTransferBank(e.target.value)}
                    required
                  >
                    <option value="ธนาคารทหารไทยธนชาต (ttb)">ธนาคารทหารไทยธนชาต (ttb)</option>
                    <option value="ธนาคารกรุงไทย (KTB)">ธนาคารกรุงไทย (KTB)</option>
                    <option value="ธนาคารกสิกรไทย (KBANK)">ธนาคารกสิกรไทย (KBANK)</option>
                    <option value="ธนาคารไทยพาณิชย์ (SCB)">ธนาคารไทยพาณิชย์ (SCB)</option>
                    <option value="ธนาคารกรุงเทพ (BBL)">ธนาคารกรุงเทพ (BBL)</option>
                    <option value="ธนาคารออมสิน (GSB)">ธนาคารออมสิน (GSB)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">เลขที่บัญชีธนาคารปลายทาง</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="เช่น 140-2-89412-5"
                    value={transferAccount}
                    onChange={(e) => setTransferAccount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* ชื่อทายาท / ผู้รับโอน และเลขอ้างอิง */}
              <div className="grid-cols-2" style={{ gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">ชื่อบัญชีผู้รับเงิน (ทายาทผู้มีสิทธิ)</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="เช่น นางสมศรี มั่นคง (มารดา)"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">เลขที่อ้างอิงธุรกรรมธนาคาร (Ref ID)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text"
                      className="form-input"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setTransferRef('TXN-RTA-' + Date.now().toString().slice(-6))}
                      className="btn btn-secondary btn-sm"
                      title="สุ่มเลขใหม่"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ส่วนแนบหลักฐานการโอนเงิน (Attach Transfer Slip) พร้อมพรีวิว */}
              <div style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label className="form-label required" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} color="var(--emerald-success)" />
                    <span>แนบหลักฐานการโอนเงิน (สลิปโอนเงิน / e-Slip)</span>
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>รองรับ JPG, PNG, PDF</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} />
                    <span>เลือกไฟล์สลิปจากเครื่อง</span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleSlipFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {transferSlipName}
                  </span>
                </div>

                {/* กล่องพรีวิวสลิปโอนเงิน (Live Transfer Slip Preview) */}
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #091e24 0%, #031417 100%)',
                  border: '1px solid var(--emerald-success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  {/* ภาพตัวอย่างสลิป e-Slip */}
                  <div style={{
                    width: '120px',
                    height: '150px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: '#0f172a',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontSize: '9px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    border: '1px solid #cbd5e1'
                  }}>
                    <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                      <div style={{ fontWeight: 800, color: '#0d9488' }}>{transferBank.split(' ')[0]}</div>
                      <div style={{ color: '#059669', fontWeight: 700 }}>✓ โอนเงินสำเร็จ</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b' }}>วันที่: {transferDate}</div>
                      <div style={{ color: '#64748b' }}>เวลา: {transferTime} น.</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {Number(transferAmount).toLocaleString()} ฿
                      </div>
                      <div style={{ color: '#0369a1', fontSize: '8px', marginTop: '2px' }}>
                        ถึง: {recipientName || 'ทายาท'}
                      </div>
                    </div>
                    <div style={{ fontSize: '7.5px', color: '#94a3b8', textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '2px' }}>
                      {transferRef}
                    </div>
                  </div>

                  {/* สรุปรายละเอียดสลิปที่แนบ */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} />
                      <span>พรีวิวหลักฐานการโอนพร้อมแนบในระบบ</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
                      เมื่อกดยืนยัน ระบบจะแนบสลิปนี้เข้าสู่คำร้อง พร้อมส่งแจ้งเตือน Real-time บนระบบและ Telegram ให้หน่วยต้นสังกัดและ กพ.ทบ. รับทราบยอด
                    </p>
                    <div style={{ fontSize: '11px', color: 'var(--gold-primary)', marginTop: '6px' }}>
                      ผู้ทำรายการ: <strong>{currentUser?.name}</strong> ({currentUser?.badge || 'บ.ประกันภัย'})
                    </div>
                  </div>
                </div>

              </div>

              {/* หมายเหตุเพิ่มเติม */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">หมายเหตุการโอนเงิน (Optional)</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)' }}>
                <button 
                  type="button" 
                  onClick={() => setShowTransferModal(false)} 
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  ยกเลิก
                </button>

                <button 
                  type="submit" 
                  className="btn btn-success"
                  style={{ padding: '10px 24px', fontWeight: 700 }}
                  disabled={actionLoading}
                >
                  <CheckCircle2 size={16} />
                  <span>{actionLoading ? 'กำลังบันทึก...' : 'ยืนยันและบันทึกการโอนเงิน'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ดูสลิปหลักฐานการโอนเงินขนาดเต็ม (Full Size Transfer Slip Modal) */}
      {/* ========================================================================= */}
      {showSlipFullModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 8, 12, 0.92)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '420px',
            width: '100%',
            background: '#ffffff',
            color: '#0f172a',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowSlipFullModal(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Slip Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Check size={28} strokeWidth={3} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                โอนเงินสำเร็จ / Transfer Successful
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {claim.paymentDetails?.transferBank || 'ธนาคารทหารไทยธนชาต (ttb)'}
              </div>
            </div>

            {/* Slip Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>วันที่โอน:</span>
                <strong>{formatThaiDate(claim.paymentDetails?.transferDate || claim.paidAt)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>เวลาที่โอน:</span>
                <strong>{claim.paymentDetails?.transferTime || '10:30'} น.</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>เลขที่อ้างอิง:</span>
                <strong style={{ fontFamily: 'monospace', color: '#0284c7' }}>{claim.paymentDetails?.transferRef || 'TXN-RTA-981240'}</strong>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>จาก:</span>
                <div style={{ fontWeight: 600 }}>บริษัท ทิพยประกันภัย จำกัด (มหาชน)</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>บัญชีสินไหมทดแทนประกันชีวิตกำลังพล ทบ.</div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>ถึง:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {claim.paymentDetails?.recipientName || `${claim.casualtyFirstName} (ทายาท)`}
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  {claim.paymentDetails?.transferBank} • {claim.paymentDetails?.transferAccount}
                </div>
              </div>

              <div style={{ borderTop: '2px solid #0f172a', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>จำนวนเงิน:</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
                  {(claim.paymentDetails?.transferAmount || claim.compensationAmount)?.toLocaleString('th-TH')} บาท
                </span>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                onClick={() => setShowSlipFullModal(false)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
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
