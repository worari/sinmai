// components/SampleDocumentViewer.js
// คอมโพเนนต์แสดงเอกสารที่แนบมาแสดง (Attached Document View) และเอกสารตัวอย่างรายละเอียดทางการ กองทัพบก
'use client';

import { useState, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { formatThaiDate, validateAttachmentFile } from '@/lib/thai-utils';

export default function SampleDocumentViewer({ 
  doc, 
  claim = null,
  onDownload = null,
  initialZoom = 100
}) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [viewTab, setViewTab] = useState('attached'); // 'attached' (เอกสารที่แนบมาแสดง) | 'summary' (สรุปรายละเอียดทางการ)
  const [localFileData, setLocalFileData] = useState(doc?.fileData || null);
  const [localFileName, setLocalFileName] = useState(doc?.fileName || '');
  const fileInputRef = useRef(null);

  if (!doc) return null;

  const docTitle = doc.title || doc.name || 'เอกสารราชการ ทบ.';
  const docCategory = doc.category || (doc.index ? `เอกสารหลักฐาน ลำดับที่ ${doc.index}` : 'แบบฟอร์มรายงาน');
  const fileName = localFileName || doc.fileName || (doc.fileUrl ? doc.fileUrl.split('/').pop() : (doc.index ? `doc_${doc.index}_attached.pdf` : 'attached_document.pdf'));
  const docFormat = doc.format || (fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : 'PDF');
  const docSize = doc.size || (doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : '1.4 MB');
  const activeFileData = localFileData || doc.fileData;

  // ตรวจสอบประเภทเอกสาร
  const isKp4 = docTitle.includes('กพ.4') || doc.index === 1;
  const isDeathCert = docTitle.includes('มรณบัตร') || doc.index === 2;
  const isHouseReg = docTitle.includes('ทะเบียนบ้าน') || doc.index === 3;
  const isIdCard = docTitle.includes('บัตรประจำตัวประชาชน') || docTitle.includes('บัตร ปชช') || doc.index === 4;
  const isMilitaryOrder = docTitle.includes('คำสั่งบรรจุ') || docTitle.includes('แต่งตั้งยศ') || docTitle.includes('ราชการสนาม') || doc.index === 5;
  const isMarriageOrBirth = docTitle.includes('สมรส') || docTitle.includes('รับรองบุตร') || doc.index === 6;
  const isDisabledOrder = docTitle.includes('ปลดพ้นราชการ') || docTitle.includes('พิการ') || doc.index === 7;
  const isHeirConsent = docTitle.includes('เจตนาทายาท') || docTitle.includes('มอบอำนาจ') || doc.index === 8;
  const isBankBook = docTitle.includes('สมุดบัญชี') || docTitle.includes('ttb') || doc.index === 9;
  const isPhotoOrScene = docTitle.includes('รูปถ่าย') || docTitle.includes('4x6') || docTitle.includes('สถานที่เกิดเหตุ') || doc.index === 10;
  const isRegulation = docTitle.includes('ระเบียบ') || docTitle.includes('ประกันชีวิต') || docCategory === 'ระเบียบข้อบังคับ';
  const isChecklist = docTitle.includes('Checklist') || docTitle.includes('10 รายการ') || docCategory === 'คู่มือตรวจสอบ';
  const isInvestigation = docTitle.includes('สอบสวน') || docTitle.includes('สำนวน') || docCategory === 'ตัวอย่างเอกสาร';

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

  // จัดการอัปโหลดไฟล์ใหม่เข้าพรีวิวทันที (พร้อมระบบตรวจความปลอดภัยและขนาดไม่เกิน 10MB)
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
            background: 'var(--cyan-accent)',
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
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>เอกสารที่แนบมาแสดง:</span>
              <span style={{ color: 'var(--cyan-accent)', background: 'rgba(20, 184, 166, 0.18)', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>
                {fileName}
              </span>
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
            <span>อัปโหลด/เปลี่ยนไฟล์แนบ</span>
          </button>

          {onDownload && (
            <button
              type="button"
              onClick={() => onDownload(doc)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11.5px', gap: '5px' }}
              title="ดาวน์โหลดไฟล์ที่แนบมานี้"
            >
              <Download size={13} />
              <span>ดาวน์โหลดเอกสารนี้</span>
            </button>
          )}
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
            <span>📎 เอกสารที่แนบมาแสดง (Attached Document View)</span>
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
      {/* มุมมองที่ 1 (DEFAULT): เอกสารที่แนบมาแสดง (Attached Document View) */}
      {/* ========================================================================= */}
      {viewTab === 'attached' && (
        <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '10px 0' }}>
          
          {/* กรณีที่มีไฟล์แนบจริงเป็นรูปภาพ (เช่น JPG, PNG, ภาพสแกน) */}
          {activeFileData && activeFileData.startsWith('data:image/') ? (
            <div style={{
              background: '#020b14',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              textAlign: 'center',
              width: '100%',
              maxWidth: `${Math.round(820 * (zoomLevel / 100))}px`
            }}>
              <div style={{ fontSize: '12px', color: 'var(--emerald-light)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="var(--emerald-success)" />
                <span>แสดงภาพไฟล์แนบต้นฉบับจริงจากระบบ ({fileName})</span>
              </div>
              <img 
                src={activeFileData} 
                alt={docTitle} 
                style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 6px 25px rgba(0,0,0,0.6)' }} 
              />
            </div>
          ) : activeFileData && activeFileData.startsWith('data:application/pdf') ? (
            /* กรณีไฟล์แนบเป็น PDF Base64 */
            <div style={{
              width: '100%',
              maxWidth: `${Math.round(820 * (zoomLevel / 100))}px`,
              background: '#041417',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border-glass)'
            }}>
              <iframe 
                src={activeFileData} 
                title={docTitle}
                style={{ width: '100%', height: '680px', border: 'none', background: '#fff' }}
              />
            </div>
          ) : (
            /* ========================================================================= */
            /* จำลองเอกสารสแกนฉบับจริงที่แนบมา (Authentic Scanned Military Document Sheet) */
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
              
              {/* สัญลักษณ์รูเจาะแฟ้มสารบรรณด้านซ้าย (Punch Holes simulation) */}
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
                  (เอกสารแนบประกอบคำร้อง: {fileName})
                </div>
              </div>

              {/* ========================================================================= */}
              {/* รายละเอียดเนื้อหาเอกสารสแกนแนบ แยกตามประเภทข้อ 1 - 10 */}
              {/* ========================================================================= */}
              
              {/* 1. แบบรายงาน กพ.4 */}
              {isKp4 && (
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
                    <div><strong>เรื่อง</strong> &nbsp; รายงานการสูญเสียกำลังพลในการปฏิบัติหน้าที่และขอรับสิทธิเงินค่าสินไหมทดแทน</div>
                    <div><strong>เรียน</strong> &nbsp; เจ้ากรมกำลังพลทหารบก (ผ่าน กองสิทธิกำลังพล กรมกำลังพลทหารบก)</div>
                    <div><strong>อ้างถึง</strong> &nbsp; ระเบียบกองทัพบก ว่าด้วยการประกันชีวิตกำลังพล พ.ศ. ๒๕๖๒</div>
                    <div><strong>สิ่งที่ส่งมาด้วย</strong> &nbsp; รายการเอกสารหลักฐานประกอบคำร้อง จำนวน ๑๐ ฉบับ</div>
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '12px', lineHeight: 1.65 }}>
                    ๑. ตามที่ กองทัพบก ได้มีคำสั่งแต่งตั้งให้ <strong>{rank} {firstName} {lastName}</strong> เลขประจำตัวประชาชน <strong>{citizenId}</strong> สังกัด <strong>{unit}</strong> ปฏิบัติหน้าที่ราชการสนามในการรักษาความสงบเรียบร้อยและพิทักษ์พื้นที่ความมั่นคงนั้น
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '12px', lineHeight: 1.65 }}>
                    ๒. {unit} ขอรายงานว่า เมื่อวันที่ ๑๐ ตุลาคม ๒๕๖๙ เวลา ๐๙:๔๕ น. ขณะกำลังพลดังกล่าวทำการลาดตระเวนรักษาความปลอดภัยเส้นทาง ได้ถูกกลุ่มผู้ก่อความไม่สงบลอบวางระเบิดแสวงเครื่อง เป็นเหตุให้ {rank} {firstName} {lastName} <strong>{lossType}</strong> จากการปฏิบัติหน้าที่ ณ {fullAddress} โดยมี{claim?.lossType === 'DISABLED' ? 'รายละเอียดการสูญเสียอวัยวะระบุว่า' : 'สาเหตุการเสียชีวิตตามใบมรณบัตรระบุว่า'} &quot;{claim?.lossSpecificCause || (claim?.lossType === 'DISABLED' ? claim?.disabledOrganDetail : claim?.deathCertificateCause) || claim?.deathCertificateCause || (claim?.lossType === 'DISABLED' ? 'สูญเสียขาทั้งสองข้างระดับเหนือเข่า' : 'บาดแผลจากสะเก็ดระเบิดรุนแรงหลายแห่ง เสียเลือดมากในช่องอก')}&quot;
                  </div>

                  <div style={{ fontSize: '13.5px', textIndent: '36px', textAlign: 'justify', marginBottom: '16px', lineHeight: 1.65 }}>
                    ๓. การสูญเสียดังกล่าวเป็นการปฏิบัติหน้าที่สำคัญและเสี่ยงภัย จึงมีสิทธิได้รับเงินค่าสินไหมทดแทนประกันชีวิตกำลังพล วงเงิน <strong>{amount} บาท (สามแสนบาทถ้วน)</strong> ตามข้อบังคับกระทรวงกลาโหม จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและประสานงาน บริษัทประกันภัย ดำเนินการจ่ายเงินสินไหมทดแทนให้แก่ทายาทโดยธรรมต่อไป
                  </div>
                </div>
              )}

              {/* 2. สำเนาใบมรณบัตร */}
              {isDeathCert && (
                <div style={{ border: '2px solid #0369a1', padding: '24px', borderRadius: '4px', background: '#f8fafc', marginBottom: '14px' }}>
                  {claim?.lossType === 'DISABLED' && (
                    <div style={{
                      padding: '10px 14px',
                      marginBottom: '14px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#065f46',
                      fontSize: '12.5px',
                      fontWeight: 600
                    }}>
                      ✓ หมายเหตุ: คำร้องนี้เป็นกรณี &quot;พิการทุพพลภาพ&quot; ได้รับการยกเว้นไม่ต้องแนบใบมรณบัตรตามระเบียบ ทบ. (ไม่ต้องยื่นข้อนี้)
                    </div>
                  )}
                  <div style={{ textAlign: 'center', borderBottom: '1.5px solid #0284c7', paddingBottom: '10px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>ใบมรณบัตร (แบบ ท.ร.๔ ตอนหน้า)</div>
                    <div style={{ fontSize: '12px', color: '#0369a1' }}>สำนักทะเบียนท้องถิ่น • กรมการปกครอง กระทรวงมหาดไทย</div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div>• <strong>เลขประจำตัวประชาชนผู้ตาย:</strong> {citizenId}</div>
                    <div>• <strong>ชื่อ - สกุล ผู้ตาย:</strong> {rank} {firstName} {lastName}</div>
                    <div>• <strong>เพศ:</strong> ชาย &nbsp;&nbsp; <strong>สัญชาติ:</strong> ไทย</div>
                    <div>• <strong>วันเกิด:</strong> {claim?.casualtyBirthDate || '๑๒ เม.ย. ๒๕๓๘'}</div>
                    <div>• <strong>วัน เวลาที่ตาย:</strong> ๑๐ ตุลาคม ๒๕๖๙ เวลา ๐๙:๔๕ น.</div>
                    <div>• <strong>สถานที่ตาย:</strong> {fullAddress}</div>
                    <div style={{ gridColumn: 'span 2' }}>
                      • <strong>สาเหตุการตาย (ตามผลชันสูตร):</strong> {claim?.deathCertificateCause || 'บาดแผลจากสะเก็ดระเบิดรุนแรงหลายแห่ง เสียเลือดมากในช่องอก'}
                    </div>
                    <div>• <strong>ผู้แจ้งการตาย:</strong> ร.อ. สมหมาย กล้าหาญ (ผู้บังคับหน่วย)</div>
                    <div>• <strong>นายทะเบียน:</strong> นายชวลิต เกียรติสกุลชัย (ลงนามสมบูรณ์)</div>
                  </div>
                </div>
              )}

              {/* 3. สำเนาทะเบียนบ้าน */}
              {isHouseReg && (
                <div style={{ border: '2px solid #1e3a8a', padding: '24px', borderRadius: '4px', background: '#eff6ff', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1.5px solid #1d4ed8', paddingBottom: '10px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a' }}>สำเนาทะเบียนบ้าน (แบบ ท.ร.๑๔)</div>
                    <div style={{ fontSize: '12px', color: '#1d4ed8' }}>สำนักทะเบียนราษฎร กรมการปกครอง</div>
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>• <strong>รหัสประจำบ้าน:</strong> ๙๔๑๐-๐๑๒๓๔๕-๖</div>
                    <div>• <strong>ที่อยู่:</strong> หมู่ที่ ๓ ตำบลบาเจาะ อำเภอบันนังสตา จังหวัดยะลา ๙๕๑๓๐</div>
                    <div style={{ borderTop: '1px dashed #93c5fd', paddingTop: '8px' }}>
                      • <strong>รายการบุคคล:</strong> {rank} {firstName} {lastName} (สถานะ: ข้าราชการทหารบก)
                    </div>
                    <div>• <strong>เลขประจำตัวประชาชน:</strong> {citizenId}</div>
                    <div>• <strong>บิดา:</strong> นายสมบูรณ์ มั่นคง &nbsp;&nbsp; <strong>มารดา:</strong> นางสมศรี มั่นคง</div>
                  </div>
                </div>
              )}

              {/* 4. สำเนาบัตรประจำตัวประชาชน */}
              {isIdCard && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                  <div style={{
                    width: '420px',
                    border: '2px solid #0284c7',
                    borderRadius: '12px',
                    padding: '18px 22px',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                    position: 'relative'
                  }}>
                    {/* เส้นขีดคร่อมสีน้ำเงิน ใช้เฉพาะขอรับสินไหม ทบ. */}
                    <div style={{
                      position: 'absolute',
                      top: '40%',
                      left: '-5%',
                      width: '110%',
                      height: '2px',
                      background: '#1d4ed8',
                      transform: 'rotate(-12deg)',
                      zIndex: 2
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '48%',
                      left: '10%',
                      transform: 'rotate(-12deg)',
                      color: '#1d4ed8',
                      fontWeight: 800,
                      fontSize: '13px',
                      background: 'rgba(255,255,255,0.85)',
                      padding: '2px 8px',
                      zIndex: 3
                    }}>
                      สำเนาถูกต้อง ใช้สำหรับขอรับเงินสินไหมทดแทน ทบ. เท่านั้น
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0284c7', paddingBottom: '6px', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#0369a1' }}>บัตรประจำตัวประชาชนไทย</span>
                      <span style={{ fontSize: '10px', color: '#0284c7' }}>THAI NATIONAL ID CARD</span>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '85px', height: '105px', background: '#cbd5e1', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #94a3b8' }}>
                        <div style={{ fontSize: '32px' }}>🎖️</div>
                        <div style={{ fontSize: '10px', fontWeight: 600 }}>ภาพถ่าย ทบ.</div>
                      </div>
                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div><strong>เลขประจำตัว:</strong> {citizenId}</div>
                        <div><strong>ชื่อ-สกุล:</strong> {rank} {firstName} {lastName}</div>
                        <div><strong>เกิดวันที่:</strong> {claim?.casualtyBirthDate || '๑๒ เม.ย. ๒๕๓๘'}</div>
                        <div><strong>ที่อยู่:</strong> {fullAddress}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. คำสั่งบรรจุ/แต่งตั้งยศ/ราชการสนาม */}
              {isMilitaryOrder && (
                <div style={{ border: '1px solid #cbd5e1', padding: '22px', borderRadius: '4px', background: '#f8fafc', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px', marginBottom: '12px' }}>
                    คำสั่งกองทัพบก (เฉพาะ) ที่ ๓๕๑/๒๕๖๖<br />
                    เรื่อง ให้นายทหารประทวนไปปฏิบัติหน้าที่ราชการสนามชายแดนใต้
                  </div>
                  <p style={{ textIndent: '30px', margin: '8px 0', fontSize: '13.5px' }}>
                    อาศัยอำนาจตามคำสั่งกระทรวงกลาโหม ให้ <strong>{rank} {firstName} {lastName}</strong> สังกัด <strong>{unit}</strong> ปฏิบัติหน้าที่ราชการสนามเพื่อรักษาความมั่นคงในพื้นที่จังหวัดชายแดนภาคใต้ ตั้งแต่วันที่ ๑ ตุลาคม ๒๕๖๖ เป็นต้นไป
                  </p>
                  <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '13px' }}>
                    <div>สั่ง ณ วันที่ ๒๕ กันยายน ๒๕๖๖</div>
                    <div style={{ fontWeight: 800, marginTop: '4px' }}>พลเอก ธีรพงศ์ อนันตศักดิ์</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>ผู้บัญชาการทหารบก</div>
                  </div>
                </div>
              )}

              {/* 6. ใบสำคัญการสมรส / รับรองบุตร */}
              {isMarriageOrBirth && (
                <div style={{ border: '2px solid #be123c', padding: '22px', borderRadius: '4px', background: '#fff1f2', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 800, color: '#be123c', fontSize: '15px', marginBottom: '10px' }}>
                    ใบสำคัญการสมรส (แบบ คร.๓) • สำนักทะเบียนราษฎร
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                    <div>• <strong>ฝ่ายชาย:</strong> {rank} {firstName} {lastName}</div>
                    <div>• <strong>ฝ่ายหญิง:</strong> นางสาวกาญจนา มั่นคง (คู่สมรส)</div>
                    <div>• <strong>ทะเบียนเลขที่:</strong> ๙๔๑๐/๕๘/๒๕๖๒</div>
                    <div>• <strong>สิทธิทางกฎหมาย:</strong> ทายาทโดยธรรมตามระเบียบประกันชีวิต ทบ.</div>
                  </div>
                </div>
              )}

              {/* 7. คำสั่งปลดพ้นราชการ */}
              {isDisabledOrder && (
                <div style={{ border: '1px solid #f87171', padding: '22px', borderRadius: '4px', background: '#fef2f2', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 800, color: '#991b1b', fontSize: '15px', marginBottom: '10px' }}>
                    คำสั่งกระทรวงกลาโหม ที่ ๓๑๒/๒๕๖๙<br />
                    เรื่อง ปลดข้าราชการทหารออกจากราชการเนื่องจากพิการทุพพลภาพ
                  </div>
                  <p style={{ textIndent: '30px', margin: '8px 0', fontSize: '13.5px' }}>
                    ปลด <strong>{rank} {firstName} {lastName}</strong> สังกัด {unit} ออกจากราชการเนื่องจากสูญเสียสมรรถภาพทางกายจากการรบ พร้อมอนุมัติสิทธิเงินค่าสินไหมทดแทน ๓๐๐,๐๐๐ บาท
                  </p>
                </div>
              )}

              {/* 8. หนังสือแสดงเจตนาทายาท */}
              {isHeirConsent && (
                <div style={{ border: '1.5px solid #0f172a', padding: '22px', borderRadius: '4px', background: '#f8fafc', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px', marginBottom: '10px' }}>
                    หนังสือแสดงเจตนาทายาทผู้มีสิทธิรับเงินสินไหมทดแทนกำลังพล ทบ.
                  </div>
                  <p style={{ textIndent: '30px', margin: '6px 0', fontSize: '13.5px' }}>
                    ข้าพเจ้า นางสมศรี มั่นคง ความสัมพันธ์เป็น มารดาโดยธรรมของ {rank} {firstName} {lastName} ขอแสดงเจตนายินยอมรับเงินค่าสินไหมทดแทนประกันชีวิตกำลังพล กองทัพบก เข้าบัญชีธนาคาร ttb เลขที่ ๑๔๐-๒-๘๙๔๑๒-๕
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '18px' }}>
                    <div style={{ border: '1px dashed #64748b', padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                      <div style={{ height: '24px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                      <div>(ลงชื่อ) <strong>นางสมศรี มั่นคง</strong> (ทายาทผู้รับเงิน)</div>
                    </div>
                    <div style={{ border: '1px dashed #64748b', padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                      <div style={{ height: '24px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                      <div>(ลงชื่อ) <strong>พ.ท. วีระศักดิ์ ศรีสมุทร</strong> (พยาน)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. สำเนาหน้าสมุดบัญชีเงินฝาก ttb */}
              {isBankBook && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                  <div style={{
                    width: '460px',
                    border: '2px solid #0056b3',
                    borderRadius: '8px',
                    padding: '20px 24px',
                    background: '#f0f7ff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '46%',
                      left: '8%',
                      transform: 'rotate(-10deg)',
                      color: '#0056b3',
                      fontWeight: 800,
                      fontSize: '13px',
                      background: 'rgba(255,255,255,0.9)',
                      padding: '2px 10px',
                      border: '1.5px solid #0056b3',
                      zIndex: 3
                    }}>
                      สำเนาถูกต้อง สำหรับรับโอนสินไหม ทบ.
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0056b3', paddingBottom: '8px', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#0056b3' }}>ttb • ธนาคารทหารไทยธนชาต</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>สมุดคู่ฝากเงินออมทรัพย์</span>
                    </div>

                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div><strong>ชื่อบัญชี:</strong> นางสมศรี มั่นคง (ทายาทผู้มีสิทธิ)</div>
                      <div><strong>เลขที่บัญชี:</strong> ๑๔๐-๒-๘๙๔๑๒-๕</div>
                      <div><strong>สาขา:</strong> สาขากองบัญชาการกองทัพบก</div>
                      <div><strong>สถานะบัญชี:</strong> ปกติ พร้อมรับโอนเงินสินไหม ๓๐๐,๐๐๐ บาท</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. ภาพถ่าย 4x6 นิ้ว และภาพสถานที่เกิดเหตุ */}
              {isPhotoOrScene && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0' }}>
                  <div style={{ border: '2px dashed #64748b', height: '190px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10px' }}>
                    <div style={{ fontSize: '36px' }}>🎖️</div>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '6px' }}>รูปถ่ายหน้าตรงผู้สูญเสีย (๔x๖ นิ้ว)</div>
                    <div style={{ fontSize: '11.5px', color: '#475569' }}>{rank} {firstName} {lastName} ในเครื่องแบบปกติ</div>
                  </div>
                  <div style={{ border: '2px dashed #64748b', height: '190px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10px' }}>
                    <div style={{ fontSize: '36px' }}>📍</div>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '6px' }}>ภาพถ่ายสถานที่เกิดเหตุลาดตระเวน</div>
                    <div style={{ fontSize: '11.5px', color: '#475569' }}>{fullAddress} (พิกัดปักหมุด GPS)</div>
                  </div>
                </div>
              )}

              {/* กรณีคู่มือ/ระเบียบ หรือเอกสารทั่วไป */}
              {!isKp4 && !isDeathCert && !isHouseReg && !isIdCard && !isMilitaryOrder && !isMarriageOrBirth && !isDisabledOrder && !isHeirConsent && !isBankBook && !isPhotoOrScene && (
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
              {/* ลายมือชื่อผู้บังคับหน่วย และ ตราประทับหมึกแดงสัญลักษณ์หน่วย */}
              {/* ========================================================================= */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
                <div style={{ width: '260px', position: 'relative' }}>
                  
                  {/* ตราประทับหน่วยสีแดง (Unit Red Stamp) */}
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
                    <div>★ พล.ร.๙ ★</div>
                    <div>กองทัพบก</div>
                    <div>ทบ.รับรอง</div>
                  </div>

                  <div style={{ fontSize: '13.5px', marginBottom: '4px' }}>ขอแสดงความนับถือ</div>
                  <div style={{ height: '36px', borderBottom: '1px dashed #64748b', marginBottom: '6px' }}></div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>พลตรี สุรเชษฐ์ นิมมานกุล</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>ผู้บัญชาการกองพลทหารราบที่ ๙</div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* ตราประทับหมึกสีน้ำเงิน "สำเนาถูกต้อง" พร้อมลายเซ็นผู้เสนอเรื่อง */}
              {/* ========================================================================= */}
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '42px',
                border: '2px solid #1d4ed8',
                color: '#1d4ed8',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '11px',
                transform: 'rotate(-3deg)',
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                lineHeight: 1.35
              }}>
                <div style={{ fontWeight: 800, fontSize: '12px' }}>✓ สำเนาถูกต้อง</div>
                <div>(ลงชื่อ) <strong>ร.อ. สมหมาย กล้าหาญ</strong></div>
                <div>นายทหารธุรการและกำลังพล พล.ร.๙</div>
                <div>๑๕ ต.ค. ๒๕๖๙</div>
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
                <div>รหัสกำกับเอกสาร: <strong>RTA-ATTACHED-{trackingCode}-DOC{doc.index || '01'}</strong></div>
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
                สรุปข้อกำหนดและแนวทางการตรวจสอบ: {docTitle}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                หมวดหมู่: {docCategory} • กรอบเวลาควบคุม SLA ๓๐ วัน
              </div>
            </div>
            <span className="badge badge-emerald">
              ✓ มีไฟล์แนบในระบบ
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
                <div>• [✓] ตราประทับ "สำเนาถูกต้อง" พร้อมลงนามกำกับ</div>
                <div>• [✓] ข้อมูลชื่อ-สกุล เลขบัตร ปชช. ตรงกับใบมรณบัตร</div>
                <div>• [✓] ตรวจสอบสิทธิโดย กพ.ทบ. (กสพ.ฯ) และ บ.ประกันภัย</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
