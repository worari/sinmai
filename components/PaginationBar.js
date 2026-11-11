// components/PaginationBar.js
'use client';

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';

/**
 * แถบควบคุมการแบ่งหน้าแบบใช้ร่วมกัน (หน้าแรก / ก่อนหน้า / เลขหน้า / หน้าถัดไป / หน้าสุดท้าย)
 */
export default function PaginationBar({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  firstLabel = 'หน้าแรก',
  nextLabel = 'หน้าถัดไป',
  lastLabel = 'หน้าสุดท้าย'
}) {
  if (!totalItems || totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = (safePage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  const visibleCount = Math.min(5, totalPages);
  const pageNumbers = Array.from({ length: visibleCount }, (_, i) => {
    if (totalPages <= 5 || safePage <= 3) return i + 1;
    if (safePage >= totalPages - 2) return totalPages - 4 + i;
    return safePage - 2 + i;
  });

  const goTo = (page) => {
    if (typeof onPageChange !== 'function') return;
    const clamped = Math.min(Math.max(1, page), totalPages);
    if (clamped !== safePage) onPageChange(clamped);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      paddingTop: '18px',
      marginTop: '16px',
      borderTop: '1px solid var(--border-glass)',
      fontSize: '13px',
      color: 'var(--text-muted)'
    }}>
      <div>
        แสดงรายการที่ <strong>{startItem} - {endItem}</strong> จากทั้งหมด <strong>{totalItems}</strong> รายการ (หน้า {safePage}/{totalPages} • {itemsPerPage} แถวต่อหน้า)
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => goTo(1)}
          disabled={safePage <= 1}
          className="btn btn-secondary btn-sm"
          style={{
            opacity: safePage <= 1 ? 0.4 : 1,
            padding: '5px 10px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="ไปยังหน้าแรก"
        >
          <ChevronsLeft size={14} />
          <span>{firstLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => goTo(safePage - 1)}
          disabled={safePage <= 1}
          className="btn btn-secondary btn-sm"
          style={{ opacity: safePage <= 1 ? 0.4 : 1, padding: '5px 8px' }}
          title="หน้าก่อนหน้า"
        >
          <ChevronLeft size={14} />
        </button>

        <div style={{ display: 'flex', gap: '4px', margin: '0 2px' }}>
          {pageNumbers.map((pageNum) => {
            const isCurrent = pageNum === safePage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => goTo(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: isCurrent ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                  background: isCurrent ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  color: isCurrent ? '#fff' : 'var(--text-muted)',
                  fontWeight: isCurrent ? 700 : 400,
                  cursor: isCurrent ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12.5px'
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goTo(safePage + 1)}
          disabled={safePage >= totalPages}
          className="btn btn-secondary btn-sm"
          style={{
            opacity: safePage >= totalPages ? 0.4 : 1,
            padding: '5px 10px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title={`ไปยัง${nextLabel}`}
        >
          <span>{nextLabel}</span>
          <ChevronRight size={14} />
        </button>

        <button
          type="button"
          onClick={() => goTo(totalPages)}
          disabled={safePage >= totalPages}
          className="btn btn-secondary btn-sm"
          style={{
            opacity: safePage >= totalPages ? 0.4 : 1,
            padding: '5px 10px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="ไปยังหน้าสุดท้าย"
        >
          <span>{lastLabel}</span>
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}

