// components/SearchableAutocomplete.js
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

/**
 * ช่องกรอกข้อมูลแบบค้นหาและเลือกอัตโนมัติ (Search Autocomplete Combobox)
 * - พิมพ์แล้วกรองคำค้นหาและแสดงรายการให้เลือกทันที
 * - รองรับทั้งโหมดเลือกจากรายการ (allowCustom=false) และโหมดพิมพ์เองพร้อมคำแนะนำ (allowCustom=true)
 * - รองรับคีย์บอร์ด ArrowUp / ArrowDown / Enter / Escape
 */
export default function SearchableAutocomplete({
  options = [],
  value = '',
  onChange,
  placeholder = 'พิมพ์เพื่อค้นหาและเลือก...',
  allowCustom = false,
  disabled = false,
  required = false,
  emptyText = 'ไม่พบรายการที่ตรงกับคำค้นหา',
  maxVisible = 80
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)) || null,
    [options, value]
  );

  // ซิงค์ข้อความที่แสดงเมื่อ value เปลี่ยนจากภายนอก
  useEffect(() => {
    if (!isTyping) {
      if (allowCustom) {
        setQuery(value !== undefined && value !== null ? String(value) : '');
      } else {
        setQuery(selectedOption ? selectedOption.label : '');
      }
    }
  }, [value, selectedOption, allowCustom, isTyping]);

  // ปิด Dropdown เมื่อคลิกนอกกรอบ
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsTyping(false);
        if (!allowCustom) {
          setQuery(selectedOption ? selectedOption.label : '');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [allowCustom, selectedOption]);

  const filteredOptions = useMemo(() => {
    const q = (isTyping ? query : '').trim().toLowerCase();
    if (!q) return options.slice(0, maxVisible);
    return options
      .filter((opt) => {
        const haystack = [
          opt.label || '',
          opt.subLabel || '',
          opt.badge || '',
          opt.keywords || '',
          String(opt.value || '')
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, maxVisible);
  }, [options, query, isTyping, maxVisible]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, isOpen]);

  const handleSelect = (opt) => {
    setIsOpen(false);
    setIsTyping(false);
    setQuery(allowCustom ? String(opt.value) : opt.label);
    if (typeof onChange === 'function') {
      onChange(opt.value, opt);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsTyping(true);
    setIsOpen(true);
    if (allowCustom && typeof onChange === 'function') {
      onChange(val, null);
    }
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    if (!allowCustom && inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setQuery('');
    setIsTyping(true);
    setIsOpen(true);
    if (typeof onChange === 'function') {
      onChange('', null);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, Math.max(0, filteredOptions.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (isOpen && filteredOptions.length > 0 && filteredOptions[highlightIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsTyping(false);
      if (!allowCustom) {
        setQuery(selectedOption ? selectedOption.label : '');
      }
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={14}
          color="var(--text-dim)"
          style={{ position: 'absolute', left: '11px', pointerEvents: 'none', zIndex: 1 }}
        />

        <input
          ref={inputRef}
          type="text"
          className="form-input"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required && (allowCustom || !value)}
          autoComplete="off"
          style={{
            paddingLeft: '32px',
            paddingRight: query && !disabled ? '54px' : '32px',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text'
          }}
        />

        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            title="ล้างคำค้นหา"
            style={{
              position: 'absolute',
              right: '28px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={13} />
          </button>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setIsOpen((prev) => !prev);
            if (!isOpen) inputRef.current?.focus();
          }}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease'
          }}
        >
          <ChevronDown size={15} />
        </button>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '240px',
            overflowY: 'auto',
            background: 'var(--bg-surface, #08252b)',
            border: '1px solid var(--border-focus, rgba(45, 212, 191, 0.55))',
            borderRadius: '8px',
            boxShadow: '0 14px 36px rgba(0, 0, 0, 0.72)',
            zIndex: 150,
            padding: '4px'
          }}
        >
          {filteredOptions.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-dim)', textAlign: 'center' }}>
              {allowCustom && query.trim()
                ? `ใช้ข้อความที่พิมพ์: "${query.trim()}"`
                : emptyText}
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              const isHighlighted = idx === highlightIndex;
              return (
                <div
                  key={`${opt.value}-${idx}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(20, 184, 166, 0.22)'
                      : isHighlighted
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    transition: 'background 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    {opt.icon && <span style={{ fontSize: '14px', flexShrink: 0 }}>{opt.icon}</span>}
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--gold-light)' : '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {opt.label}
                      </div>
                      {opt.subLabel && (
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-dim)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {opt.subLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {opt.badge && (
                      <span style={{
                        fontSize: '10.5px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--gold-light)'
                      }}>
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check size={14} color="var(--gold-primary)" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
