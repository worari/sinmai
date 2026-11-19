// components/SampleDocumentViewer.js
// คอมโพเนนต์แสดงเอกสารที่แนบมาแสดง (Attached Document View) และเอกสารตัวอย่างรายละเอียดทางการ กองทัพบก
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  Paperclip, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  Award, 
  Upload, 
  Calendar, 
  Building, 
  User, 
  Shield, 
  Clock, 
  Sparkles,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Check
} from 'lucide-react';
import { formatThaiDate, validateAttachmentFile } from '@/lib/thai-utils';

function dataURItoBlob(dataURI) {
  try {
    const split = dataURI.split(',');
    const byteString = atob(split[1]);
    const mimeMatch = split[0].match(/:(.*?);/);
    const mimeString = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.error('Error converting dataURI to Blob:', e);
    return null;
  }
}

export default function SampleDocumentViewer({ 
  doc, 
  claim = null,
  onDownload = null,
  initialZoom = 100
}) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [viewTab, setViewTab] = useState('attached'); // 'attached' | 'summary'
  const [localFileData, setLocalFileData] = useState(doc?.fileData || null);
  const [localFileName, setLocalFileName] = useState(doc?.fileName || '');
  const [blobUrl, setBlobUrl] = useState(null);
  const fileInputRef = useRef(null);

  // ซิงค์ข้อมูลเมื่อ doc prop เปลี่ยน
  useEffect(() => {
    setLocalFileData(doc?.fileData || null);
    setLocalFileName(doc?.fileName || '');
  }, [doc]);

  // แปลง base64 เป็น Blob URL เพื่อให้เบราว์เซอร์สามารถแสดงผล PDF ขนาดใหญ่ได้อย่างราบรื่น
  useEffect(() => {
    let currentBlobUrl = null;
    const activeData = localFileData || doc?.fileData;

    if (activeData && typeof activeData === 'string') {
      if (activeData.startsWith('data:application/pdf')) {
        const blob = dataURItoBlob(activeData);
        if (blob) {
          currentBlobUrl = URL.createObjectURL(blob);
          setBlobUrl(currentBlobUrl);
        } else {
          setBlobUrl(activeData);
        }
      } else if (activeData.startsWith('data:image/')) {
        setBlobUrl(activeData);
      } else {
        setBlobUrl(activeData);
      }
    } else if (doc?.fileUrl) {
      setBlobUrl(doc.fileUrl);
    } else {
      setBlobUrl(null);
    }

    return () => {
      if (currentBlobUrl && currentBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [localFileData, doc?.fileData, doc?.fileUrl]);

  if (!doc) return null;

  const docTitle = doc.title || doc.name || 'เอกสารราชการ ทบ.';
  const docCategory = doc.category || (doc.index ? `เอกสารหลักฐาน ลำดับที่ ${doc.index}` : 'แบบฟอร์มรายงาน');
  const fileName = localFileName || doc.fileName || (doc.fileUrl ? doc.fileUrl.split('/').pop() : (doc.index ? `doc_${doc.index}_attached.pdf` : 'attached_document.pdf'));
  const docFormat = doc.format || (fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : 'PDF');
  const docSize = doc.size || (doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : '1.4 MB');
  const activeFileData = localFileData || doc.fileData;
  const isRealFileAttached = Boolean(activeFileData || (doc.fileUrl && !doc.fileUrl.includes('sample_')));

  // ตรวจสอบประเภทเอกสารทั้ง 12 รายการ
  const idx = Number(doc.index);
  const isUnitLetter = idx === 1 || docTitle.includes('หนังสือราชการของหน่วย');
  const isLossReport = idx === 2 || docTitle.includes('กพ.4') || docTitle.includes('กพ.3') || docTitle.includes('รายงานการสูญเสีย');
  const isInvestigation = idx === 3 || docTitle.includes('สอบสวน');
  const isDeceasedDocs = idx === 4 || docTitle.includes('มรณบัตร') || docTitle.includes('เอกสารผู้เสียชีวิต') || docTitle.includes('ทะเบียนบ้านประทับตรา');
  const isBeneficiaryIntent = idx === 5 || docTitle.includes('เจตนา') || docTitle.includes('ผู้รับประโยชน์') || docTitle.includes('ป.ค.14') || docTitle.includes('ปค.14');
  const isPayeeDocs = idx === 6 || docTitle.includes('ผู้รับเงินสินไหม') || docTitle.includes('ยินยอมเปิดเผยข้อมูล') || docTitle.includes('PDPA');
  const isClaimLetterPch11 = idx === 7 || docTitle.includes('ปช.11') || docTitle.includes('เรียกร้องค่าสินไหมมรณกรรม');
  const isToxicology = idx === 8 || docTitle.includes('สารเสพติด') || docTitle.includes('แอลกอฮอล์');
  const isPoliceReport = idx === 9 || docTitle.includes('ประจำวัน ตร') || docTitle.includes('ตำรวจ');
  const isPhoto4x6 = idx === 10 || docTitle.includes('4x6') || docTitle.includes('รูปถ่าย');
  const isBankPassbook = idx === 11 || docTitle.includes('สมุดบัญชี') || docTitle.includes('บัญชีเงินฝาก') || docTitle.includes('ttb');
  const isDelayReport = idx === 12 || docTitle.includes('ความล่าช้า') || docTitle.includes('เกิน 30 วัน') || docTitle.includes('ชี้แจง');
  const isApprovalOrder = doc.isApprovalOrder || doc.index === 'อนุมัติ' || docCategory?.includes('อนุมัติ');

  // ข้อมูลกำลังพลประกอบ
  const rank = claim?.casualtyRank || 'ส.อ.';
  const firstName = claim?.casualtyFirstName || 'ประวิทย์';
  const lastName = claim?.casualtyLastName || 'มั่นคง';
  const citizenId = claim?.casualtyCitizenId || '3-1005-00112-23-3';
  const unit = claim?.unitName || 'กองพลทหารราบที่ 9 (พล.ร.9)';
  const lossType = claim?.lossType === 'DECEASED' ? 'เสียชีวิต' : 'พิการทุพพลภาพ';
  const claimType = claim?.claimType === 'HIGH_RISK' ? 'ปฏิบัติหน้าที่สำคัญ/เสี่ยงภัย (๓๐๐,๐๐๐ บาท)' : 'ปฏิบัติหน้าที่ยามปกติ (๖๐,๐๐๐ บาท)';
  const amount = claim?.compensationAmount ? claim.compensationAmount.toLocaleString('th-TH') : '300,000';
  const incidentCause = claim?.causeOfLoss || 'ถูกซุ่มโจมตีด้วยระเบิดแสวงเครื่องขณะลาดตระเวนรักษาความปลอดภัยเส้นทาง';
  const fullAddress = claim?.locationOfLoss?.fullAddress || 'ต.บาเจาะ อ.บันนังสตา จ.ยะลา';
  const trackingCode = claim?.trackingCode || 'ทบ-กพ-๖๙/๐๑๒';

  // ข้อมูลทายาทและบัญชีเงินฝาก
  const heirName = claim?.heirName || 'นางสมศรี มั่นคง';
  const heirPhone = claim?.heirPhone || claim?.phone || '081-234-5678';
  const heirEmail = claim?.heirEmail || claim?.email || 'heir.rta@gmail.com';
  const heirAddress = claim?.heirAddress || fullAddress || 'หมู่ที่ 3 ต.บาเจาะ อ.บันนังสตา จ.ยะลา 95130';
  const heirBank = claim?.heirBank || claim?.transferDetails?.bank || 'ธนาคารทหารไทยธนชาต (ttb)';
  const heirBankAccount = claim?.heirBankAccount || claim?.transferDetails?.bankAccount || '140-2-89412-5';

  // จัดการอัปโหลดไฟล์ใหม่เข้าพรีวิวทันที
  const handleLocalFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateAttachmentFile(file);
    if (!validation.valid) {
      alert(validation.error);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLocalFileData(event.target?.result);
      setLocalFileName(file.name);
      setViewTab('attached');
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadFile = () => {
    if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || `${docTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (onDownload) {
      onDownload(doc);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      
      {/* ========================================================================= */}
      {/* กล่องแถบแจ้งสถานะเอกสารที่แนบมา (Attached Document Banner) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '12px 18px',
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(4, 20, 23, 0.95) 100%)',
        border: '1px solid rgba(20, 184, 166, 0.4)',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: isRealFileAttached ? 'var(--emerald-success)' : 'var(--cyan-accent)',
            color: '#041417',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '15px',
            boxShadow: '0 0 15px rgba(20, 184, 166, 0.5)'
          }}>
            <Paperclip size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>เอกสารข้อที่ {doc.index || '-'}:</span>
              <span style={{ color: 'var(--cyan-accent)' }}>{docTitle}</span>
              {isRealFileAttached && (
                <span style={{ color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.18)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> แนบไฟล์แล้ว ({fileName})
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
              ประเภท: <strong>{docFormat}</strong> • ขนาดไฟล์: <strong>{docSize}</strong> • หน่วยเสนอเรื่อง: <strong>{unit}</strong>
            </div>
          </div>
        </div>

        {/* ปุ่มเครื่องมือสำหรับไฟล์แนบ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLocalFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11.5px', gap: '5px', borderColor: 'var(--cyan-accent)', color: 'var(--cyan-accent)' }}
            title="อัปโหลดไฟล์จริงเพื่อแทนที่ไฟล์แนบนี้"
          >
            <Upload size={13} />
            <span>อัปโหลด/เปลี่ยนไฟล์</span>
          </button>

          {blobUrl && (
            <button
              type="button"
              onClick={() => window.open(blobUrl, '_blank')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', gap: '5px', color: '#67e8f9', borderColor: '#06b6d4' }}
              title="เปิดดูไฟล์ต้นฉบับในแท็บใหม่"
            >
              <ExternalLink size={13} />
              <span>เปิดดูแท็บใหม่</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadFile}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '11.5px', gap: '5px' }}
            title="ดาวน์โหลดไฟล์เอกสารนี้"
          >
            <Download size={13} />
            <span>ดาวน์โหลด</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* แถบควบคุมมุมมองและเครื่องมือ (Toolbar) */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid var(--border-glass)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* แท็บสลับมุมมอง */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setViewTab('attached')}
            className={`btn btn-sm ${viewTab === 'attached' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12.5px', gap: '6px', fontWeight: viewTab === 'attached' ? 700 : 500 }}
          >
            <Paperclip size={14} />
            <span>📎 {isRealFileAttached ? 'ไฟล์แนบต้นฉบับ (Attached File View)' : 'ตัวอย่างเอกสารจำลอง (Scanned View)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('summary')}
            className={`btn btn-sm ${viewTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12.5px', gap: '6px', fontWeight: viewTab === 'summary' ? 700 : 500 }}
          >
            <FileText size={14} />
            <span>📄 สรุปรายละเอียดและข้อกำหนดทางการ</span>
          </button>
        </div>

        {/* ปุ่มควบคุมการซูมและพิมพ์ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '12px', gap: '5px' }}
            title="สั่งพิมพ์เอกสารนี้"
          >
            <Printer size={13} />
            <span>พิมพ์</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* มุมมองที่ 1 (DEFAULT): แสดงไฟล์แนบจริง หรือเอกสารจำลองราชการ */}
      {/* ========================================================================= */}
      {viewTab === 'attached' && (
        <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '10px 0' }}>
          
          {/* กรณีที่มีไฟล์แนบจริงเป็นรูปภาพ */}
          {activeFileData && activeFileData.startsWith('data:image/') ? (
            <div style={{
              background: '#020b14',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              textAlign: 'center',
              width: '100%',
              maxWidth: `${Math.round(840 * (zoomLevel / 100))}px`
            }}>
              <div style={{ fontSize: '12px', color: 'var(--emerald-light)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="var(--emerald-success)" />
                <span>แสดงภาพไฟล์แนบต้นฉบับจริงจากระบบ ({fileName})</span>
              </div>
              <img 
                src={activeFileData} 
                alt={docTitle} 
                style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 6px 25px rgba(0,0,0,0.6)' }} 
              />
            </div>
          ) : (activeFileData && activeFileData.startsWith('data:application/pdf')) || (blobUrl && blobUrl.startsWith('blob:')) ? (
            /* กรณีไฟล์แนบเป็น PDF (แสดงผ่าน Blob URL ที่แปลงแล้ว ทำให้ Chrome PDF Viewer แสดงผลได้ราบรื่น 100%) */
            <div style={{
              width: '100%',
              maxWidth: `${Math.round(860 * (zoomLevel / 100))}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '12.5px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="var(--emerald-success)" />
                  <span>แสดงผลไฟล์แนบต้นฉบับ PDF: <strong>{fileName}</strong></span>
                </div>
                {blobUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(blobUrl, '_blank')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11.5px', padding: '3px 10px', gap: '5px', borderColor: 'var(--cyan-accent)', color: 'var(--cyan-accent)' }}
                  >
                    <ExternalLink size={13} />
                    <span>เปิดดูเต็มจอในหน้าต่างใหม่</span>
                  </button>
                )}
              </div>

              <div style={{
                width: '100%',
                height: '740px',
                background: '#041417',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
              }}>
                <iframe 
                  src={blobUrl || activeFileData} 
                  title={docTitle}
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                />
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* จำลองเอกสารสแกนฉบับจริงที่แนบมา (Authentic Scanned Military Document Sheet) */
            /* รองรับครบทั้ง 12 รายการตามระเบียบ ทบ. */
            /* ========================================================================= */
            <div style={{
              width: '100%',
              maxWidth: `${Math.round(800 * (zoomLevel / 100))}px`,
              background: '#fcfbfa',
              color: '#1a202c',
              padding: '40px 48px',
              borderRadius: '4px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
              fontFamily: '"TH Sarabun New", "Sarabun", "Cordia New", serif',
              position: 'relative',
              lineHeight: 1.6,
              transition: 'max-width 0.2s ease',
              fontSize: `${Math.round(14 * (zoomLevel / 100))}px`,
              border: '1px solid #d1d5db'
            }}>
              
              {/* สัญลักษณ์รูเจาะแฟ้มสารบรรณด้านซ้าย */}
              <div style={{ position: 'absolute', top: '120px', left: '14px', width: '14px', height: '14px', borderRadius: '50%', background: '#e2e8f0', border: '1px solid #cbd5e1' }} />
              <div style={{ position: 'absolute', bottom: '120px', left: '14px', width: '14px', height: '14px', borderRadius: '50%', background: '#e2e8f0', border: '1px solid #cbd5e1' }} />

              {/* ป้ายประทับด่วนที่สุด (สีแดง) */}
              <div style={{
                position: 'absolute',
                top: '24px',
                left: '42px',
                border: '2px solid #dc2626',
                color: '#dc2626',
                padding: '2px 10px',
                fontWeight: 800,
                fontSize: '13px',
                borderRadius: '3px',
                letterSpacing: '1px',
                transform: 'rotate(-2deg)'
              }}>
                ด่วนที่สุด
              </div>

              {/* ตราประทับลงรับของ กสพ.กพ.ทบ. (บนขวา) */}
              <div style={{
                position: 'absolute',
                top: '24px',
                right: '42px',
                border: '1.5px solid #0369a1',
                color: '#0369a1',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                lineHeight: 1.3,
                textAlign: 'center',
                background: 'rgba(240, 249, 255, 0.85)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontWeight: 800, borderBottom: '1px solid #bae6fd', paddingBottom: '2px', marginBottom: '2px' }}>
                  กสพ.กพ.ทบ. (รับเรื่อง)
                </div>
                <div>เลขรับ: <strong>๖๙/๐๑๒</strong></div>
                <div>วันที่: <strong>๑๕ ต.ค. ๒๕๖๙</strong></div>
                <div>เวลา: <strong>๑๐:๓๐ น.</strong></div>
              </div>

              {/* ส่วนหัวหนังสือราชการ: ตราครุฑพ่าห์กลาง */}
              <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '18px' }}>
                <div style={{ fontSize: '42px', lineHeight: 1 }}>🎖️</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>
                  (เอกสารแนบประกอบคำร้อง ลำดับที่ {doc.index || '-'}: {docTitle})
                </div>
              </div>

              {/* ========================================================================= */}
              {/* รายละเอียดเนื้อหาเอกสารสแกนแนบ แยกตามประเภทข้อ 1 - 12 */}
              {/* ========================================================================= */}
              
              {/* 1. หนังสือราชการของหน่วย ขอรับเงินค่าสินไหมทดแทนในการประกันชีวิต */}
              {isUnitLetter && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13.5px' }}>
                    <div>ที่ กห ๐๔๐๑ / ๑๐๕</div>
                    <div style={{ textAlign: 'right' }}>
                      {unit}<br />
                      ค่ายสุรสีห์ ต.ลาดหญ้า อ.เมือง จ.กาญจนบุรี ๗๑๑๙๐
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: '14px', fontSize: '13.5px' }}>
                    ๑๕ ตุลาคม ๒๕๖๙
                  </div>

                  <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div><strong>เรื่อง</strong> &nbsp; ขอรับเงินค่าสินไหมทดแทนในการประกันชีวิตกำลังพลกองทัพบก</div>
                    <div><strong>เรียน</strong> &nbsp; เจ้ากรมกำลังพลทหารบก (ผ่าน กองสิทธิกำลังพล กรมกำลังพลทหารบก)</div>
                    <div><strong>อ้างถึง</strong> &nbsp; ระเบียบกองทัพบก ว่าด้วยการประกันชีวิตกำลังพล พ.ศ. ๒๕๖๒</div>
                    <div><strong>สิ่งที่ส่งมาด้วย</strong> &nbsp; เอกสารหลักฐานประกอบคำร้องเสนอขอรับสิทธิเงินสินไหมทดแทน จำนวน ๑๒ รายการ</div>
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '12px', lineHeight: 1.65 }}>
                    ๑. ตามที่ กองทัพบก ได้มีคำสั่งให้ <strong>{rank} {firstName} {lastName}</strong> เลขประจำตัวประชาชน <strong>{citizenId}</strong> สังกัด <strong>{unit}</strong> ปฏิบัติหน้าที่ราชการสนามเพื่อรักษาความสงบเรียบร้อยและความมั่นคงของประเทศนั้น
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '12px', lineHeight: 1.65 }}>
                    ๒. {unit} ขอรายงานว่า กำลังพลดังกล่าวได้ประสบเหตุ {incidentCause} เป็นเหตุให้ {lossType} จากการปฏิบัติหน้าที่ราชการ ณ {fullAddress} โดยมีสาเหตุระบุว่า &quot;{claim?.lossSpecificCause || claim?.deathCertificateCause || 'บาดเจ็บรุนแรงจากการปฏิบัติหน้าที่'}&quot;
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '16px', lineHeight: 1.65 }}>
                    ๓. หน่วยได้ทำการตรวจสอบเอกสารหลักฐานประกอบครบถ้วนทั้ง ๑๒ รายการแล้ว จึงขอเสนอเรื่องเพื่อโปรดพิจารณาอนุมัติจ่ายเงินค่าสินไหมทดแทน วงเงิน <strong>{amount} บาท ({claimType})</strong> ให้แก่ทายาทผู้มีสิทธิตามกฎหมายต่อไป
                  </div>
                </div>
              )}

              {/* 2. รายงานการสูญเสีย (กพ.3 หรือ กพ.4) */}
              {isLossReport && (
                <div>
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0369a1', paddingBottom: '10px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0369a1' }}>
                      แบบรายงานการสูญเสียกำลังพลในการปฏิบัติหน้าที่ ({claim?.lossType === 'DISABLED' ? 'แบบ กพ.๓' : 'แบบ กพ.๔'})
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>สายงานกำลังพล กองทัพบก • กรมกำลังพลทหารบก</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginBottom: '14px' }}>
                    <div>• <strong>ยศ-ชื่อ-สกุล:</strong> {rank} {firstName} {lastName}</div>
                    <div>• <strong>เลขประจำตัวประชาชน:</strong> {citizenId}</div>
                    <div>• <strong>หน่วยต้นสังกัด:</strong> {unit}</div>
                    <div>• <strong>ตำแหน่ง:</strong> {claim?.casualtyPosition || 'พลยิง/พลลาดตระเวน'}</div>
                    <div>• <strong>วัน เวลาที่เกิดเหตุ:</strong> {claim?.lossDate ? formatThaiDate(claim.lossDate) : '๑๐ ต.ค. ๒๕๖๙'}</div>
                    <div>• <strong>ประเภทการสูญเสีย:</strong> {lossType}</div>
                    <div style={{ gridColumn: 'span 2' }}>
                      • <strong>สถานที่เกิดเหตุ:</strong> {fullAddress}
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      • <strong>พฤติการณ์แห่งการสูญเสีย:</strong> {incidentCause}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. รายงานหรือบันทึกการสอบสวนเกี่ยวกับสาเหตุแห่งการเสียชีวิตของหน่วย */}
              {isInvestigation && (
                <div style={{ border: '2px solid #0284c7', padding: '24px 28px', borderRadius: '6px', background: '#f8fafc', marginBottom: '16px', lineHeight: 1.65 }}>
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0284c7', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '16.5px', fontWeight: 800, color: '#0369a1' }}>
                      บันทึกรายงานผลการสอบสวนข้อเท็จจริงของคณะกรรมการสอบสวนของหน่วย
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                      เรื่อง การสอบสวนกรณี {rank} {firstName} {lastName} {lossType} ขณะปฏิบัติหน้าที่ราชการ
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      หน่วย {unit} • คำสั่งแต่งตั้งคณะกรรมการสอบสวน ที่ ๔๕/๒๕๖๙
                    </div>
                  </div>

                  <div style={{ fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'justify' }}>
                    <p style={{ textIndent: '36px', margin: 0 }}>
                      ๑. <strong>วัน เวลา และสถานที่เกิดเหตุ:</strong> เกิดเหตุเมื่อวันที่ {claim?.lossDate ? formatThaiDate(claim.lossDate) : '๑๐ ตุลาคม ๒๕๖๙'} เวลาประมาณ ๐๙:๔๕ น. บริเวณ {fullAddress}
                    </p>

                    <p style={{ textIndent: '36px', margin: 0 }}>
                      ๒. <strong>พฤติการณ์และข้อเท็จจริง:</strong> ขณะที่ {rank} {firstName} {lastName} เลขประจำตัวประชาชน {citizenId} ตำแหน่ง {claim?.casualtyPosition || 'พลยิง/พลลาดตระเวน'} สังกัด {unit} กำลังปฏิบัติหน้าที่ราชการสนามตามคำสั่งยุทธการ ได้เกิดเหตุ {incidentCause} ส่งผลให้กำลังพลได้รับบาดเจ็บสาหัสและ{lossType} โดยมีสาเหตุการสูญเสียระบุว่า &quot;{claim?.lossSpecificCause || claim?.deathCertificateCause || 'บาดเจ็บรุนแรงจากการปฏิบัติหน้าที่'}&quot;
                    </p>

                    <p style={{ textIndent: '36px', margin: 0 }}>
                      ๓. <strong>การสอบสวนพยานหลักฐาน:</strong> คณะกรรมการได้สอบปากคำพยานบุคคลผู้เห็นเหตุการณ์จำนวน ๓ ปาก และตรวจสอบพยานเอกสาร ตลอดจนภาพถ่ายสถานที่เกิดเหตุและรายงานแพทย์ ผลการสอบสวนยืนยันชัดเจนว่า กำลังพลได้ปฏิบัติหน้าที่ราชการด้วยความซื่อสัตย์สุจริต และเหตุการณ์ดังกล่าว <strong>มิได้เกิดจากความประมาทเลินเล่ออย่างร้ายแรง หรือการกระทำผิดวินัย/กฎหมาย</strong> ของผู้สูญเสียแต่ประการใด
                    </p>

                    <p style={{ textIndent: '36px', margin: 0 }}>
                      ๔. <strong>ข้อสรุปและความเห็นของคณะกรรมการ:</strong> การสูญเสียของ {rank} {firstName} {lastName} เป็นการสูญเสียอันเนื่องมาจากการปฏิบัติหน้าที่ราชการสนาม{claim?.claimType === 'HIGH_RISK' ? 'ในการรักษาความมั่นคงและพิทักษ์พื้นที่เสี่ยงภัย' : 'ตามภารกิจที่ได้รับมอบหมาย'} สมควรได้รับสิทธิเงินค่าสินไหมทดแทนการประกันชีวิตกำลังพลกองทัพบก วงเงิน <strong>{amount} บาท</strong> ให้แก่ทายาทผู้มีสิทธิตามระเบียบ ทบ.
                    </p>
                  </div>

                  {/* รายนามคณะกรรมการ 3 ท่าน */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '22px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px', textAlign: 'center', fontSize: '12px' }}>
                    <div>
                      <div style={{ height: '24px', borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto 4px' }}></div>
                      <div>(พ.ท. อนุชา มิ่งมงคล)</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>ประธานกรรมการสอบสวน</div>
                    </div>
                    <div>
                      <div style={{ height: '24px', borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto 4px' }}></div>
                      <div>(พ.ต. ณัฐพงษ์ วิเศษกุล)</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>กรรมการ</div>
                    </div>
                    <div>
                      <div style={{ height: '24px', borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto 4px' }}></div>
                      <div>(ร.อ. ชัยวัฒน์ เกียรติสมบัติ)</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>กรรมการและเลขานุการ</div>
                    </div>
                  </div>

                  {/* ความเห็นและคำสั่งของ ผบ.หน่วย */}
                  <div style={{ marginTop: '18px', padding: '12px 16px', background: '#e0f2fe', borderRadius: '6px', border: '1px solid #bae6fd', fontSize: '12.5px' }}>
                    <strong>✓ ความเห็นชอบของผู้บังคับบัญชาต้นสังกัด (ผบ.หน่วย):</strong>
                    <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#0369a1' }}>
                      &quot;เห็นชอบตามผลการสอบสวนของคณะกรรมการทุกประการ ให้ฝ่ายกำลังพลดำเนินการรวบรวมเอกสารหลักฐานประกอบคำร้องเสนอเรื่องต่อ กรมกำลังพลทหารบก (กสพ.กพ.ทบ.) เพื่อขอรับเงินค่าสินไหมทดแทนให้แก่ทายาทโดยเร็ว&quot;
                    </div>
                  </div>
                </div>
              )}

              {/* 4. เอกสารผู้เสียชีวิต (4.1 ใบมรณบัตร และ 4.2 ทะเบียนบ้านประทับตรา "ตาย") */}
              {isDeceasedDocs && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                  {/* 4.1 ใบมรณบัตร */}
                  <div style={{ border: '2px solid #0369a1', padding: '18px 22px', borderRadius: '6px', background: '#f8fafc' }}>
                    <div style={{ textAlign: 'center', borderBottom: '1.5px solid #0284c7', paddingBottom: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>๔.๑ ใบมรณบัตร (แบบ ท.ร.๔ ตอนหน้า)</div>
                      <div style={{ fontSize: '11.5px', color: '#0369a1' }}>สำนักทะเบียนท้องถิ่น • กรมการปกครอง กระทรวงมหาดไทย</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px' }}>
                      <div>• <strong>เลข ปชช. ผู้ตาย:</strong> {citizenId}</div>
                      <div>• <strong>ชื่อผู้ตาย:</strong> {rank} {firstName} {lastName}</div>
                      <div>• <strong>วัน เวลาที่ตาย:</strong> ๑๐ ต.ค. ๒๕๖๙ เวลา ๐๙:๔๕ น.</div>
                      <div>• <strong>สถานที่ตาย:</strong> {fullAddress}</div>
                      <div style={{ gridColumn: 'span 2' }}>
                        • <strong>สาเหตุการตาย:</strong> {claim?.deathCertificateCause || claim?.lossSpecificCause || 'บาดเจ็บรุนแรง เสียเลือดมากในช่องอก'}
                      </div>
                    </div>
                  </div>

                  {/* 4.2 ทะเบียนบ้านประทับตรา "ตาย" */}
                  <div style={{ border: '2px solid #1e3a8a', padding: '18px 22px', borderRadius: '6px', background: '#eff6ff', position: 'relative' }}>
                    {/* ตราประทับคำว่า ตาย หมึกแดง */}
                    <div style={{
                      position: 'absolute',
                      top: '18px',
                      right: '24px',
                      border: '2.5px solid #dc2626',
                      color: '#dc2626',
                      padding: '4px 16px',
                      fontWeight: 900,
                      fontSize: '18px',
                      letterSpacing: '3px',
                      transform: 'rotate(-8deg)',
                      background: 'rgba(255,255,255,0.85)'
                    }}>
                      ตาย
                    </div>
                    <div style={{ textAlign: 'center', borderBottom: '1.5px solid #1d4ed8', paddingBottom: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e3a8a' }}>๔.๒ สำเนาทะเบียนบ้าน (แบบ ท.ร.๑๔) ประทับตรา &quot;ตาย&quot;</div>
                      <div style={{ fontSize: '11.5px', color: '#1d4ed8' }}>สำนักทะเบียนราษฎร กรมการปกครอง</div>
                    </div>
                    <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>• <strong>ที่อยู่ตามทะเบียนบ้าน:</strong> {heirAddress}</div>
                      <div>• <strong>ชื่อบุคคล:</strong> {rank} {firstName} {lastName} (จำหน่าย &quot;ตาย&quot; เมื่อ ๑๐ ต.ค. ๒๕๖๙)</div>
                      <div>• <strong>นายทะเบียนผู้จำหน่าย:</strong> นายชวลิต เกียรติสกุลชัย (ลงนามประทับตราสมบูรณ์)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. หนังสือแสดงเจตนาระบุผู้รับประโยชน์ หรือคำสั่ง หรือ ป.ค.14 */}
              {isBeneficiaryIntent && (
                <div style={{ border: '1.5px solid #0f172a', padding: '22px', borderRadius: '4px', background: '#f8fafc', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '15.5px', marginBottom: '10px' }}>
                    หนังสือแสดงเจตนาระบุผู้รับประโยชน์ / หนังสือรับรองทายาท (แบบ ป.ค.๑๔)
                  </div>
                  <p style={{ textIndent: '30px', margin: '8px 0', fontSize: '13.5px' }}>
                    ข้าพเจ้า <strong>{rank} {firstName} {lastName}</strong> สังกัด {unit} ขอแสดงเจตนาระบุให้ <strong>{heirName}</strong> (ความสัมพันธ์: มารดา/ทายาทโดยธรรม) เป็นผู้รับประโยชน์ในเงินค่าสินไหมทดแทนประกันชีวิตกำลังพลกองทัพบก หากข้าพเจ้าถึงแก่ความตายจากการปฏิบัติหน้าที่ราชการ
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '18px' }}>
                    <div style={{ border: '1px dashed #64748b', padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                      <div style={{ height: '24px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                      <div>(ลงชื่อ) <strong>{rank} {firstName} {lastName}</strong> (ผู้แสดงเจตนา)</div>
                    </div>
                    <div style={{ border: '1px dashed #64748b', padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                      <div style={{ height: '24px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                      <div>(ลงชื่อ) <strong>พ.ท. วีระศักดิ์ ศรีสมุทร</strong> (พยานรับรอง)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. เอกสารผู้รับเงินสินไหม (บัตร ปปช. + ทะเบียนบ้าน + หนังสือยินยอม PDPA) */}
              {isPayeeDocs && (
                <div style={{ border: '2px solid #059669', padding: '22px', borderRadius: '6px', background: '#f0fdf4', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1.5px solid #10b981', paddingBottom: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#065f46' }}>
                      เอกสารประจำตัวผู้รับเงินสินไหม และหนังสือยินยอมเปิดเผยข้อมูลส่วนบุคคล (PDPA)
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857' }}>สำเนาบัตร ปชช. (๖.๑) • สำเนาทะเบียนบ้าน (๖.๒) • หนังสือยินยอม PDPA (๖.๓)</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div>• <strong>ชื่อ-สกุล ทายาทผู้รับเงิน:</strong> {heirName}</div>
                    <div>• <strong>เลขประจำตัวประชาชน:</strong> ๓-๙๔๑๐-๐๐๑๒๔-๕๖-๗</div>
                    <div>• <strong>เบอร์โทรศัพท์ติดต่อ:</strong> {heirPhone}</div>
                    <div>• <strong>อีเมล์:</strong> {heirEmail}</div>
                    <div style={{ gridColumn: 'span 2' }}>
                      • <strong>ที่อยู่ปัจจุบัน:</strong> {heirAddress}
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: '#dcfce7', borderRadius: '4px', fontSize: '12px', color: '#166534' }}>
                    <strong>✓ หนังสือยินยอม PDPA:</strong> ข้าพเจ้ายินยอมให้ กรมกำลังพลทหารบก และ บริษัทประกันภัย เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลเพื่อการดำเนินการจ่ายเงินสินไหมทดแทน
                  </div>
                </div>
              )}

              {/* 7. หนังสือเรียกร้องค่าสินไหมมรณกรรม ของบริษัทประกันชีวิต (ปช.11) */}
              {isClaimLetterPch11 && (
                <div style={{ border: '2px solid #4338ca', padding: '22px', borderRadius: '6px', background: '#eef2ff', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1.5px solid #6366f1', paddingBottom: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#3730a3' }}>
                      หนังสือเรียกร้องค่าสินไหมมรณกรรม บริษัทประกันชีวิต (แบบ ปช.๑๑)
                    </div>
                    <div style={{ fontSize: '12px', color: '#4f46e5' }}>กรมธรรม์ประกันชีวิตกำลังพล กองทัพบก</div>
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>• <strong>บริษัทประกันภัย:</strong> บริษัท ทิพยประกันภัย จำกัด (มหาชน)</div>
                    <div>• <strong>เลขที่กรมธรรม์:</strong> RTA-LIFE-2569-GROUP</div>
                    <div>• <strong>ผู้เอาประกันภัย:</strong> {rank} {firstName} {lastName} สังกัด {unit}</div>
                    <div>• <strong>จำนวนเงินที่เรียกร้อง:</strong> {amount} บาท ({claimType})</div>
                    <div>• <strong>ผู้รับประโยชน์:</strong> {heirName} (เข้าบัญชีธนาคาร {heirBank} เลขที่ {heirBankAccount})</div>
                  </div>
                </div>
              )}

              {/* 8. หลักฐานพิสูจน์ระดับสารเสพติดและแอลกอฮอล์ในเลือด */}
              {isToxicology && (
                <div style={{ border: '2px solid #0891b2', padding: '22px', borderRadius: '6px', background: '#ecfeff', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1.5px solid #06b6d4', paddingBottom: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#0e7490' }}>
                      ใบรายงานผลการตรวจชันสูตรสารเสพติดและระดับแอลกอฮอล์ในเลือด
                    </div>
                    <div style={{ fontSize: '12px', color: '#0891b2' }}>กลุ่มงานนิติเวชศาสตร์และพิษวิทยา • สถาบันนิติเวชวิทยา</div>
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>• <strong>ตรวจจากสิ่งส่งตรวจ:</strong> เลือดผู้สูญเสีย ({rank} {firstName} {lastName})</div>
                    <div>• <strong>ผลการตรวจระดับแอลกอฮอล์:</strong> <strong style={{ color: '#047857' }}>๐.๐๐ มิลลิกรัมเปอร์เซ็นต์ (ไม่พบแอลกอฮอล์ในกระแสเลือด)</strong></div>
                    <div>• <strong>ผลการตรวจหาสารเสพติด (Amphetamine / Opiates / Cannabis):</strong> <strong style={{ color: '#047857' }}>Negative (ตรวจไม่พบสารเสพติดทุกชนิด)</strong></div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      * ผลการตรวจถูกต้องตามเกณฑ์มาตรฐานความปลอดภัย ไม่ขัดต่อข้อยกเว้นของกรมธรรม์ประกันภัย
                    </div>
                  </div>
                </div>
              )}

              {/* 9. เอกสารสอบสวนหรือบันทึกประจำวัน ตร. */}
              {isPoliceReport && (
                <div style={{ border: '2px solid #334155', padding: '22px', borderRadius: '6px', background: '#f8fafc', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1.5px solid #475569', paddingBottom: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#1e293b' }}>
                      สำเนาบันทึกประจำวันเกี่ยวกับคดี • สำนักงานตำรวจแห่งชาติ
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>สถานีตำรวจภูธรบันนังสตา จังหวัดยะลา</div>
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>• <strong>คดีชันสูตรพลิกศพที่:</strong> ๑๔๒/๒๕๖๙</div>
                    <div>• <strong>พนักงานสอบสวน:</strong> พ.ต.ท. ประสิทธิ์ ยิ่งยง (สารวัตรสอบสวน)</div>
                    <div>• <strong>ข้อเท็จจริงแห่งคดี:</strong> เจ้าหน้าที่ตำรวจร่วมกับแพทย์ชันสูตรศพ {rank} {firstName} {lastName} ซึ่งเสียชีวิตจากเหตุการณ์ {incidentCause} ขณะปฏิบัติหน้าที่รักษาความสงบเรียบร้อย</div>
                    <div>• <strong>สรุปสำนวน:</strong> เสียชีวิตเนื่องจากการปฏิบัติหน้าที่ทางราชการคดีความมั่นคง</div>
                  </div>
                </div>
              )}

              {/* 10. รูปถ่ายขนาด 4x6 นิ้ว */}
              {isPhoto4x6 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0' }}>
                  <div style={{ border: '2px dashed #64748b', height: '200px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '12px' }}>
                    <div style={{ fontSize: '40px' }}>🎖️</div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', marginTop: '6px' }}>รูปถ่ายหน้าตรงผู้สูญเสีย (๔x๖ นิ้ว)</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{rank} {firstName} {lastName} ในเครื่องแบบปกติ</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>วงเงินขอรับ: {amount} บาท (เกิน 100,000 บ.)</div>
                  </div>
                  <div style={{ border: '2px dashed #64748b', height: '200px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '12px' }}>
                    <div style={{ fontSize: '40px' }}>📍</div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', marginTop: '6px' }}>ภาพถ่ายสถานที่เกิดเหตุและสภาพความสูญเสีย</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{fullAddress}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>ภาพถ่ายบันทึกประกอบสำนวนการสอบสวน</div>
                  </div>
                </div>
              )}

              {/* 11. สำเนาสมุดบัญชีเงินฝาก (ไม่ระบุธนาคาร) ของทายาท พร้อมที่อยู่ เบอร์โทร อีเมล์ */}
              {isBankPassbook && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                  <div style={{
                    width: '520px',
                    border: '2px solid #0284c7',
                    borderRadius: '8px',
                    padding: '22px 26px',
                    background: '#f0f9ff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '46%',
                      left: '8%',
                      transform: 'rotate(-8deg)',
                      color: '#0369a1',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      background: 'rgba(255,255,255,0.92)',
                      padding: '2px 10px',
                      border: '1.5px solid #0284c7',
                      zIndex: 3
                    }}>
                      สำเนาถูกต้อง สำหรับรับโอนสินไหม ทบ.
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0284c7', paddingBottom: '8px', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15.5px', color: '#0369a1' }}>
                        🏦 {heirBank}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>สมุดคู่ฝากเงินออมทรัพย์</span>
                    </div>

                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>• <strong>ชื่อบัญชีผู้รับเงิน:</strong> {heirName}</div>
                      <div>• <strong>เลขที่บัญชี:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', color: '#0284c7' }}>{heirBankAccount}</span></div>
                      
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #7dd3fc', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', color: '#0369a1' }}>
                        <div><strong>📍 ที่อยู่ปัจจุบันของทายาท:</strong> {heirAddress}</div>
                        <div><strong>📞 เบอร์โทรศัพท์ติดต่อ:</strong> {heirPhone}</div>
                        <div><strong>✉️ อีเมล์:</strong> {heirEmail}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 12. รายงานสาเหตุความล่าช้า (กรณีเกินกว่า 30 วันหลังจากกำลังพลเสียชีวิต) */}
              {isDelayReport && (
                <div style={{ border: '2px solid #ea580c', padding: '22px', borderRadius: '6px', background: '#fff7ed', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1.5px solid #f97316', paddingBottom: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#c2410c' }}>
                      รายงานชี้แจงสาเหตุความล่าช้าในการเสนอเรื่องขอรับสิทธิเงินสินไหมทดแทน
                    </div>
                    <div style={{ fontSize: '12px', color: '#ea580c' }}>
                      (กรณีที่เสนอเรื่องถึง กพ.ทบ. เกินกว่า ๓๐ วันหลังจากกำลังพลเสียชีวิต)
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'justify' }}>
                    <p style={{ textIndent: '30px', margin: 0 }}>
                      ตามที่ {unit} ได้เสนอเรื่องขอรับสิทธิเงินค่าสินไหมทดแทนของ <strong>{rank} {firstName} {lastName}</strong> ซึ่งเกินกว่ากำหนดกรอบเวลา ๓๐ วันหลังจากวันสูญเสียนั้น หน่วยขอเรียนชี้แจงสาเหตุความล่าช้าดังนี้:
                    </p>
                    <div style={{ padding: '10px 14px', background: '#ffedd5', borderRadius: '6px', border: '1px solid #fed7aa', color: '#9a3412', fontWeight: 500 }}>
                      &quot;{claim?.delayReason || 'อยู่ระหว่างการรอผลการสอบสวนทายาทตามแบบ ป.ค.๑๔ จากสำนักงานทะเบียนอำเภอท้องที่ และรอผลการตรวจชันสูตรทางนิติวิทยาศาสตร์ เพื่อให้เอกสารหลักฐานถูกต้องสมบูรณ์ตามระเบียบ ทบ.'}&quot;
                    </div>
                    <p style={{ textIndent: '30px', margin: 0 }}>
                      ทั้งนี้ หน่วยได้เร่งรัดและประสานงานจนได้เอกสารครบถ้วนสมบูรณ์แล้ว จึงกราบเรียนมาเพื่อโปรดพิจารณาผ่อนผันและอนุมัติสิทธิตามระเบียบต่อไป
                    </p>
                  </div>
                </div>
              )}

              {/* กรณีคำสั่งอนุมัติของ จก.กพ.ทบ. */}
              {isApprovalOrder && (
                <div style={{ border: '2px solid #059669', padding: '22px', borderRadius: '6px', background: '#f0fdf4', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13.5px' }}>
                    <div><strong>ที่</strong> {doc.docNumber || claim?.approvalDocument?.docNumber || 'กห ๐๔๐๑/อนุมัติ-๑๔๒๙'}</div>
                    <div style={{ textAlign: 'right' }}>
                      กรมกำลังพลทหารบก<br />
                      ถนนราชดำเนินนอก เขตพระนคร กทม. ๑๐๒๐๐
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: '14px', fontSize: '13.5px' }}>
                    {formatThaiDate(doc.approvedDate || claim?.approvalDocument?.approvedDate || new Date())}
                  </div>

                  <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div><strong>เรื่อง</strong> &nbsp; การอนุมัติการขอรับสิทธิเงินค่าสินไหมทดแทนประกันชีวิตกำลังพลกองทัพบก</div>
                    <div><strong>เรียน</strong> &nbsp; กรรมการผู้จัดการ บริษัท ทิพยประกันภัย จำกัด (มหาชน)</div>
                    <div><strong>อ้างถึง</strong> &nbsp; รายงานขอรับสิทธิเงินสินไหมทดแทน เลขที่ {trackingCode}</div>
                    <div><strong>สิ่งที่ส่งมาด้วย</strong> &nbsp; เอกสารตัวเรื่องและหลักฐานประกอบการขอรับสิทธิเงินสินไหมทดแทน จำนวน ๑๒ รายการ</div>
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '12px', lineHeight: 1.7, color: '#0f172a' }}>
                    ๑. กรมกำลังพลทหารบก (กสพ.กพ.ทบ.) ได้รับรายงานและตรวจสอบเอกสารหลักฐานทั้ง ๑๒ รายการ ขอรับสิทธิเงินค่าสินไหมทดแทนประกันชีวิตกำลังพลของ <strong>{rank} {firstName} {lastName}</strong> สังกัด <strong>{unit}</strong> ถูกต้องครบถ้วนตามระเบียบ
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '12px', lineHeight: 1.7, color: '#0f172a' }}>
                    ๒. ผู้บังคับบัญชา <strong>(เจ้ากรมกำลังพลทหารบก)</strong> มีคำสั่งอนุมัติให้จ่ายเงินค่าสินไหมทดแทน จำนวน <strong>{amount} บาท ({claimType})</strong> ให้แก่ทายาทผู้มีสิทธิตามกฎหมาย คือ <strong>{heirName}</strong>
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '16px', lineHeight: 1.7, color: '#0f172a' }}>
                    ๓. จึงส่งตัวเรื่องและคำสั่งอนุมัติฉบับนี้มายัง บริษัท ทิพยประกันภัย จำกัด (มหาชน) เพื่อโปรดดำเนินการโอนเงินสินไหมทดแทนเข้าบัญชี {heirBank} เลขที่ {heirBankAccount} และส่งหลักฐานการโอนเงิน (e-Slip) ให้กองทัพบกทราบต่อไป
                  </div>
                </div>
              )}

              {/* กรณีเอกสารทั่วไป */}
              {!isUnitLetter && !isLossReport && !isInvestigation && !isDeceasedDocs && !isBeneficiaryIntent && !isPayeeDocs && !isClaimLetterPch11 && !isToxicology && !isPoliceReport && !isPhoto4x6 && !isBankPassbook && !isDelayReport && !isApprovalOrder && (
                <div style={{ padding: '18px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14.5px', marginBottom: '8px', color: '#0f172a' }}>
                    {docTitle}
                  </div>
                  <p style={{ margin: 0, textIndent: '24px', fontSize: '13.5px', lineHeight: 1.65 }}>
                    {doc.desc || 'เอกสารทางการฉบับแนบประกอบการขอรับสิทธิเงินค่าสินไหมทดแทนประกันชีวิตกำลังพลกองทัพบก ผ่านการรับรองความถูกต้องของสายการบังคับบัญชา'}
                  </p>
                </div>
              )}

              {/* ========================================================================= */}
              {/* ลายมือชื่อผู้บังคับบัญชา และ ตราประทับหมึกแดง */}
              {/* ========================================================================= */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
                <div style={{ width: '260px', position: 'relative' }}>
                  
                  {/* ตราประทับหน่วยสีแดง */}
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '15px',
                    width: '78px',
                    height: '78px',
                    borderRadius: '50%',
                    border: '2px dashed #dc2626',
                    color: '#dc2626',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    transform: 'rotate(-8deg)',
                    pointerEvents: 'none',
                    opacity: 0.85
                  }}>
                    {isApprovalOrder ? (
                      <>
                        <div>★ กพ.ทบ. ★</div>
                        <div>อนุมัติแล้ว</div>
                        <div>ทบ.จ่ายเงิน</div>
                      </>
                    ) : (
                      <>
                        <div>★ พล.ร.๙ ★</div>
                        <div>กองทัพบก</div>
                        <div>ทบ.รับรอง</div>
                      </>
                    )}
                  </div>

                  <div style={{ fontSize: '13.5px', marginBottom: '4px' }}>
                    {isApprovalOrder ? 'สั่ง ณ วันที่อนุมัติ' : 'ขอแสดงความนับถือ'}
                  </div>
                  <div style={{ height: '36px', borderBottom: '1px dashed #64748b', marginBottom: '6px' }}></div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>
                    {isApprovalOrder 
                      ? (doc.approverName || claim?.approvalDocument?.approverName || 'พลโท ชัยพฤกษ์ ด้วงประภัสสร')
                      : 'พลตรี สุรเชษฐ์ นิมมานกุล'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {isApprovalOrder 
                      ? (doc.approverTitle || claim?.approvalDocument?.approverTitle || 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)')
                      : 'ผู้บัญชาการกองพลทหารราบที่ ๙'}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* ตราประทับหมึกสีน้ำเงิน "สำเนาถูกต้อง" พร้อมลายเซ็นผู้เสนอเรื่อง */}
              {/* ========================================================================= */}
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '42px',
                border: isApprovalOrder ? '2px solid #059669' : '2px solid #1d4ed8',
                color: isApprovalOrder ? '#059669' : '#1d4ed8',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '11px',
                transform: 'rotate(-3deg)',
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                lineHeight: 1.35
              }}>
                <div style={{ fontWeight: 800, fontSize: '12px' }}>
                  {isApprovalOrder ? '✓ อนุมัติส่ง บ.ประกันภัย' : '✓ สำเนาถูกต้อง'}
                </div>
                <div>(ลงชื่อ) <strong>{isApprovalOrder ? (doc.approverName || claim?.approvalDocument?.approverName || 'พล.ท. ชัยพฤกษ์ ด้วงประภัสสร') : 'ร.อ. สมหมาย กล้าหาญ'}</strong></div>
                <div>{isApprovalOrder ? 'เจ้ากรมกำลังพลทหารบก' : 'นายทหารธุรการและกำลังพล พล.ร.๙'}</div>
                <div>{formatThaiDate(doc.approvedDate || claim?.approvalDocument?.approvedDate || new Date())}</div>
              </div>

              {/* บาร์โค้ดกำกับเอกสารสารบรรณ ทบ. ด้านล่าง */}
              <div style={{
                marginTop: '36px',
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: '#64748b'
              }}>
                <div>รหัสกำกับเอกสาร: <strong>RTA-ATTACHED-{trackingCode}-DOC{String(doc.index || '01').padStart(2, '0')}</strong></div>
                <div style={{ letterSpacing: '2px', fontFamily: 'monospace', fontWeight: 700 }}>||| | |||| | ||| ||||| | |||</div>
                <div>ระบบสินไหม ทบ. (กสพ.กพ.ทบ.)</div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* มุมมองที่ 2: สรุปรายละเอียดและข้อกำหนดทางการ (Summary & Guidelines View) */}
      {/* ========================================================================= */}
      {viewTab === 'summary' && (
        <div style={{
          background: 'rgba(4, 20, 23, 0.85)',
          padding: '24px',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', color: 'var(--cyan-accent)', margin: 0 }}>
                ข้อกำหนดและแนวทางการตรวจสอบ: ข้อที่ {doc.index || '-'} {docTitle}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                หมวดหมู่: {docCategory} • กรอบเวลาควบคุม SLA ๓๐ วัน
              </div>
            </div>
            <span className={`badge ${isRealFileAttached ? 'badge-emerald' : 'badge-amber'}`}>
              {isRealFileAttached ? '✓ มีไฟล์แนบในระบบ' : '⏳ รอแนบเอกสาร'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '13px', marginBottom: '6px' }}>
                ข้อมูลกำลังพลและคำร้องอ้างอิง:
              </div>
              <div style={{ fontSize: '12.5px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>• กำลังพล: <strong>{rank} {firstName} {lastName}</strong></div>
                <div>• เลขบัตร ปชช.: <strong>{citizenId}</strong></div>
                <div>• สังกัด: <strong>{unit}</strong></div>
                <div>• สิทธิรับเงินสินไหม: <strong>{claimType} ({amount} บาท)</strong></div>
                <div>• เลขที่ติดตาม: <strong>{trackingCode}</strong></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontWeight: 700, color: 'var(--cyan-accent)', fontSize: '13px', marginBottom: '6px' }}>
                เกณฑ์การตรวจความสมบูรณ์ (Checklist):
              </div>
              <div style={{ fontSize: '12.5px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>• [✓] ตราประทับและลายมือชื่อผู้บังคับหน่วยครบถ้วน</div>
                <div>• [✓] ตราประทับ &quot;สำเนาถูกต้อง&quot; พร้อมลงนามกำกับ</div>
                <div>• [✓] ข้อมูลชื่อ-สกุล เลขบัตร ปชช. ตรงกับใบมรณบัตรและคำร้อง</div>
                <div>• [✓] ตรวจสอบสิทธิโดย กพ.ทบ. (กสพ.ฯ) และ บ.ประกันภัย</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}