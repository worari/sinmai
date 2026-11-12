// components/UnitAutocomplete.js
'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Loader2, RefreshCw, Search, AlertTriangle, X } from 'lucide-react';

const LEVEL_META = {
  1: { label: 'ระดับ 1 ทบ./ภาค', bg: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
  2: { label: 'ระดับ 2 กองพล/มทบ.', bg: 'rgba(56, 189, 248, 0.14)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.35)' },
  3: { label: 'ระดับ 3 กรม/กองพัน', bg: 'rgba(20, 184, 166, 0.16)', color: '#2dd4bf', border: 'rgba(20, 184, 166, 0.35)' }
};

function getLevelMeta(level) {
  return LEVEL_META[Number(level)] || {
    label: 'หน่วยสังกัด',
    bg: 'rgba(148, 163, 184, 0.16)',
    color: '#cbd5e1',
    border: 'rgba(148, 163, 184, 0.3)'
  };
}

function buildHierarchyChain(unit, unitMap) {
  const chain = [];
  const visited = new Set([unit.id]);
  let parentId = unit.parentId;

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = unitMap.get(parentId);
    if (!parent) break;
    chain.unshift(parent.shortName || parent.name);
    parentId = parent.parentId;
  }

  return chain;
}

function computeMatchScore(item, normalizedQuery) {
  const { unit } = item;
  const name = (unit.name || '').toLowerCase();
  const shortName = (unit.shortName || '').toLowerCase();
  const code = (unit.code || '').toLowerCase();

  if (shortName === normalizedQuery || code === normalizedQuery || name === normalizedQuery) return 0;
  if (shortName.startsWith(normalizedQuery) || code.startsWith(normalizedQuery) || name.startsWith(normalizedQuery)) return 1;
  if (name.includes(normalizedQuery) || shortName.includes(normalizedQuery) || code.includes(normalizedQuery)) return 2;
  return 3;
}

function enrichUnitItem(u, unitMap) {
  const ancestorLabels = buildHierarchyChain(u, unitMap);
  const parentChain = ancestorLabels.join(' ➔ ');
  const selfShort = u.shortName || u.name;
  const fullBreadcrumb = ancestorLabels.length > 0 ? `${parentChain} ➔ ${selfShort}` : selfShort;
  const provinceText = u.province && u.province !== 'ไม่ระบุ' ? u.province : '';
  const effectiveLevel = Number(u.level) || Math.min(ancestorLabels.length + 1, 3);
  const searchBlob = [
    u.name,
    u.shortName,
    u.code,
    u.id,
    provinceText,
    u.locationName,
    parentChain
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return {
    unit: u,
    effectiveLevel,
    parentChain,
    fullBreadcrumb,
    provinceText,
    levelMeta: getLevelMeta(effectiveLevel),
    searchBlob
  };
}

export default function UnitAutocomplete({
  units = [],
  value = '',
  onChange,
  loading = false,
  error = '',
  onRetry,
  placeholder = 'พิมพ์ค้นหาชื่อหน่วย, ชื่อย่อ (เช่น พล.ร.9, ร.9 พัน.1), รหัสหน่วย หรือจังหวัด...',
  required = false,
  includeInactive = false
}) {
  const listboxId = useId();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const { unitMap, enrichedUnits } = useMemo(() => {
    const map = new Map();
    for (const u of units) {
      if (u && u.id) map.set(u.id, u);
    }

    const items = [];
    for (const u of units) {
      if (!u || !u.id) continue;
      if (!includeInactive && u.status === 'INACTIVE') continue;
      items.push(enrichUnitItem(u, map));
    }

    return { unitMap: map, enrichedUnits: items };
  }, [units, includeInactive]);

  const selectedItem = useMemo(() => {
    if (!value) return null;
    const found = enrichedUnits.find((item) => item.unit.id === value);
    if (found) return found;
    const raw = unitMap.get(value);
    if (!raw) return null;
    return enrichUnitItem(raw, unitMap);
  }, [value, enrichedUnits, unitMap]);

  const prevValueRef = useRef(value);
  useEffect(() => {
    if (selectedItem && !isFiltering) {
      setInputText(selectedItem.unit.name);
    } else if (prevValueRef.current && !value && !isFiltering) {
      setInputText('');
    }
    prevValueRef.current = value;
  }, [value, selectedItem, isFiltering]);

  useEffect(() => {
    const handleOutsideMouseDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFiltering(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideMouseDown);
    return () => document.removeEventListener('mousedown', handleOutsideMouseDown);
  }, []);

  const filteredItems = useMemo(() => {
    const trimmed = inputText.trim().toLowerCase();
    if (!isFiltering || !trimmed) {
      return enrichedUnits;
    }

    const terms = trimmed.split(/\s+/).filter(Boolean);
    const matched = enrichedUnits.filter((item) =>
      terms.every((term) => item.searchBlob.includes(term))
    );

    return matched.sort((a, b) => {
      const scoreDiff = computeMatchScore(a, trimmed) - computeMatchScore(b, trimmed);
      if (scoreDiff !== 0) return scoreDiff;
      const levelDiff = (a.effectiveLevel || 9) - (b.effectiveLevel || 9);
      if (levelDiff !== 0) return levelDiff;
      return (a.unit.name || '').localeCompare(b.unit.name || '', 'th');
    });
  }, [enrichedUnits, inputText, isFiltering]);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedItem && (!isFiltering || !inputText.trim())) {
      const selectedIdx = filteredItems.findIndex((item) => item.unit.id === selectedItem.unit.id);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    } else {
      setHighlightedIndex(0);
    }
  }, [isOpen, filteredItems, selectedItem, isFiltering, inputText]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-option-index="${highlightedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelectItem = (item) => {
    setInputText(item.unit.name);
    setIsFiltering(false);
    setIsOpen(false);
    onChange?.(item.unit);
  };

  const handleClear = () => {
    setInputText('');
    setIsFiltering(true);
    setIsOpen(true);
    setHighlightedIndex(0);
    onChange?.(null);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    setInputText(nextValue);
    setIsFiltering(true);
    setIsOpen(true);
    setHighlightedIndex(0);

    if (selectedItem && nextValue !== selectedItem.unit.name) {
      onChange?.(null);
    } else if (!nextValue && value) {
      onChange?.(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (filteredItems.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % filteredItems.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (filteredItems.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
      return;
    }

    if (e.key === 'Enter' && isOpen) {
      if (filteredItems[highlightedIndex]) {
        e.preventDefault();
        handleSelectItem(filteredItems[highlightedIndex]);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      setIsFiltering(false);
    }
  };

  const hasUnmatchedTypedText = Boolean(inputText.trim() && !value);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '13px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: selectedItem ? 'var(--emerald-success)' : 'var(--text-dim)',
            pointerEvents: 'none'
          }}
        />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-required={required}
          className="form-input"
          placeholder={loading ? 'กำลังโหลดข้อมูลโครงสร้างหน่วยจากฐานข้อมูล...' : placeholder}
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            setIsFiltering(false);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          style={{
            paddingLeft: '38px',
            paddingRight: inputText || value ? '72px' : '42px',
            borderColor: selectedItem
              ? 'rgba(16, 185, 129, 0.55)'
              : hasUnmatchedTypedText
                ? 'rgba(245, 158, 11, 0.65)'
                : undefined
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {loading ? (
            <Loader2 size={16} style={{ color: 'var(--cyan-accent)', marginRight: '6px' }} />
          ) : (
            <>
              {(inputText || value) && (
                <button
                  type="button"
                  onClick={handleClear}
                  title="ล้างค่าเพื่อค้นหาใหม่"
                  aria-label="ล้างค่าหน่วยสังกัด"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(148, 163, 184, 0.14)',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsOpen((prev) => !prev);
                  setIsFiltering(false);
                  inputRef.current?.focus();
                }}
                title="แสดง/ซ่อนรายการโครงสร้างหน่วย"
                aria-label="แสดงรายการหน่วยสังกัด"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.18s ease'
                }}
              >
                <ChevronDown size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dropdown Listbox */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 80,
            background: 'rgba(10, 18, 36, 0.98)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(20, 184, 166, 0.4)',
            borderRadius: '10px',
            boxShadow: '0 18px 42px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(20, 184, 166, 0.08)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}
          >
            <span>
              {loading
                ? 'กำลังโหลดโครงสร้างหน่วยจากฐานข้อมูล...'
                : `แสดง ${filteredItems.length} จาก ${enrichedUnits.length} หน่วย (เชื่อมโยงเมนูจัดการโครงสร้างหน่วย)`}
            </span>
            {onRetry && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onRetry}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cyan-accent)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                <RefreshCw size={12} />
                <span>รีเฟรช</span>
              </button>
            )}
          </div>

          <div ref={listRef} style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px' }}>
            {loading && enrichedUnits.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                กำลังดึงข้อมูลโครงสร้างหน่วยจาก PostgreSQL...
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: '18px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                ไม่พบหน่วยสังกัดที่ตรงกับ &quot;{inputText.trim()}&quot;
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  ลองค้นหาด้วยชื่อย่อ (เช่น ทภ.1, พล.ร.9, ร.21), รหัสหน่วย หรือจังหวัด — หรือติดต่อ Admin เพิ่มหน่วยในเมนูจัดการโครงสร้างหน่วย
                </div>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = item.unit.id === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={item.unit.id}
                    data-option-index={idx}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectItem(item);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: '9px 11px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected
                        ? 'rgba(16, 185, 129, 0.16)'
                        : isHighlighted
                          ? 'rgba(20, 184, 166, 0.14)'
                          : 'transparent',
                      border: isSelected
                        ? '1px solid rgba(16, 185, 129, 0.45)'
                        : isHighlighted
                          ? '1px solid rgba(20, 184, 166, 0.3)'
                          : '1px solid transparent',
                      marginBottom: '3px',
                      transition: 'background 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '999px',
                            background: item.levelMeta.bg,
                            color: item.levelMeta.color,
                            border: `1px solid ${item.levelMeta.border}`,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.levelMeta.label}
                        </span>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.unit.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {item.provinceText && (
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            จ.{item.provinceText}
                          </span>
                        )}
                        {isSelected && <Check size={15} style={{ color: 'var(--emerald-success)' }} />}
                      </div>
                    </div>

                    {item.parentChain && (
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '2px' }}>
                        สายบังคับบัญชา: {item.fullBreadcrumb}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected unit badge or validation hint */}
      {selectedItem ? (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#a7f3d0', flexWrap: 'wrap' }}>
            <Building2 size={14} style={{ color: 'var(--emerald-success)', flexShrink: 0 }} />
            <span>
              ผูกสิทธิ์กับ: <strong>{selectedItem.unit.name}</strong>
              {selectedItem.parentChain ? ` (${selectedItem.fullBreadcrumb})` : ''}
            </span>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
            ID: {selectedItem.unit.id}
          </span>
        </div>
      ) : hasUnmatchedTypedText && !isOpen ? (
        <div
          style={{
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--amber-warning)'
          }}
        >
          <AlertTriangle size={14} />
          <span>กรุณาคลิกเลือกหน่วยสังกัดจากรายการค้นหาเพื่อยืนยันการผูกสิทธิ์</span>
        </div>
      ) : unitsErrorMessage(error, onRetry)}
    </div>
  );
}

function unitsErrorMessage(error, onRetry) {
  if (!error) return null;
  return (
    <div
      style={{
        marginTop: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        fontSize: '12px',
        color: '#fca5a5'
      }}
    >
      <span>ไม่สามารถโหลดรายการหน่วยจากฐานข้อมูลได้: {error}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fecaca',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '11.5px',
            cursor: 'pointer'
          }}
        >
          ลองใหม่
        </button>
      )}
    </div>
  );
}
