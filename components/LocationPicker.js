// components/LocationPicker.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  ExternalLink, 
  Compass, 
  X, 
  Loader2, 
  Sparkles, 
  Building2, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  THAI_PROVINCES, 
  MILITARY_AND_HOSPITAL_LOCATIONS, 
  searchLocations, 
  searchAddressOnly 
} from '@/lib/thai-address-data.js';

// ตัวอย่างพิกัดพื้นที่ปฏิบัติภารกิจหลักของ ทบ.
const PRESET_LOCATIONS = [
  { name: 'กรุงเทพฯ (บก.ทบ. / พระนคร)', lat: 13.7651, lng: 100.5085, street: 'ถ.ราชดำเนินนอก', subdistrict: 'บางขุนพรหม', district: 'พระนคร', province: 'กรุงเทพมหานคร' },
  { name: 'กาญจนบุรี (ค่ายสุรสีห์ พล.ร.9)', lat: 14.0228, lng: 99.5328, street: 'ถ.แสงชูโต', subdistrict: 'ลาดหญ้า', district: 'เมืองกาญจนบุรี', province: 'กาญจนบุรี' },
  { name: 'ยะลา (ฉก.ยะลา / รพ.ศูนย์ยะลา)', lat: 6.5411, lng: 101.2804, street: 'ถ.สิโรรส', subdistrict: 'สะเตง', district: 'เมืองยะลา', province: 'ยะลา' },
  { name: 'ปัตตานี (ค่ายอิงคยุทธบริหาร)', lat: 6.7533, lng: 101.1764, street: 'ถ.เพชรเกษม', subdistrict: 'บ่อทอง', district: 'หนองจิก', province: 'ปัตตานี' },
  { name: 'นราธิวาส (ค่ายกัลยาณิวัฒนา)', lat: 6.4255, lng: 101.8253, street: 'ถ.ระแงะมรรคา', subdistrict: 'กะลุวอ', district: 'เมืองนราธิวาส', province: 'นราธิวาส' },
  { name: 'ปราจีนบุรี (ค่ายพรหมโยธี พล.ร.2 รอ.)', lat: 14.0509, lng: 101.3718, street: 'ถ.สุวรรณศร', subdistrict: 'บ้านพระ', district: 'เมืองปราจีนบุรี', province: 'ปราจีนบุรี' },
  { name: 'เชียงใหม่ (ค่ายกาวิละ มทบ.33)', lat: 18.7883, lng: 99.0061, street: 'ถ.เชียงใหม่-ลำพูน', subdistrict: 'วัดเกต', district: 'เมืองเชียงใหม่', province: 'เชียงใหม่' },
  { name: 'นครราชสีมา (ค่ายสุรนารี ทภ.2)', lat: 14.9738, lng: 102.0837, street: 'ถ.มิตรภาพ', subdistrict: 'หนองไผ่ล้อม', district: 'เมืองนครราชสีมา', province: 'นครราชสีมา' }
];

export default function LocationPicker({ value, onChange }) {
  const [coords, setCoords] = useState({
    lat: value?.lat || 13.7651,
    lng: value?.lng || 100.5085
  });

  const [locationDetails, setLocationDetails] = useState({
    locationName: value?.locationName || '',
    houseNumber: value?.houseNumber || '',
    village: value?.village || '',
    soi: value?.soi || '',
    street: value?.street || '',
    subdistrict: value?.subdistrict || '',
    district: value?.district || '',
    province: value?.province || '',
    landmark: value?.landmark || ''
  });

  // State สำหรับการค้นหาสถานที่ (Search สถานที่เสียชีวิต/เกิดเหตุ)
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placeSearchResults, setPlaceSearchResults] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);

  // State สำหรับการค้นหาตำบล/อำเภอ/จังหวัด (Address Auto-complete)
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const [geocoding, setGeocoding] = useState(false);

  const placeSearchRef = useRef(null);
  const addressSearchRef = useRef(null);

  useEffect(() => {
    if (value) {
      if (value.lat && value.lng) setCoords({ lat: value.lat, lng: value.lng });
      setLocationDetails({
        locationName: value.locationName || '',
        houseNumber: value.houseNumber || '',
        village: value.village || '',
        soi: value.soi || '',
        street: value.street || '',
        subdistrict: value.subdistrict || '',
        district: value.district || '',
        province: value.province || '',
        landmark: value.landmark || ''
      });
    }
  }, []);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event) {
      if (placeSearchRef.current && !placeSearchRef.current.contains(event.target)) {
        setShowPlaceDropdown(false);
      }
      if (addressSearchRef.current && !addressSearchRef.current.contains(event.target)) {
        setShowAddressDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerChange = (newCoords, newDetails) => {
    const full = [
      newDetails.locationName ? `[${newDetails.locationName}]` : '',
      newDetails.houseNumber ? `เลขที่ ${newDetails.houseNumber}` : '',
      newDetails.village ? `หมู่ ${newDetails.village}` : '',
      newDetails.soi ? `ซอย${newDetails.soi}` : '',
      newDetails.street ? `ถนน${newDetails.street}` : '',
      newDetails.subdistrict ? `ต.${newDetails.subdistrict}` : '',
      newDetails.district ? `อ.${newDetails.district}` : '',
      newDetails.province ? `จ.${newDetails.province}` : ''
    ].filter(Boolean).join(' ');

    onChange({
      ...newDetails,
      lat: newCoords.lat,
      lng: newCoords.lng,
      fullAddress: full
    });
  };

  // Reverse Geocoding จากพิกัด Lat/Lng (คลิกบนแผนที่)
  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        
        const newDetails = {
          ...locationDetails,
          street: addr.road || addr.street || locationDetails.street || '',
          subdistrict: addr.suburb || addr.neighbourhood || addr.village || addr.quarter || locationDetails.subdistrict || '',
          district: addr.city_district || addr.district || addr.county || addr.town || addr.city || locationDetails.district || '',
          province: addr.province || addr.state || locationDetails.province || '',
          landmark: data.display_name?.split(',')[0] || locationDetails.landmark || ''
        };

        setLocationDetails(newDetails);
        triggerChange({ lat, lng }, newDetails);
      }
    } catch (e) {
      console.log('Reverse geocode error, keep manual fields');
    } finally {
      setGeocoding(false);
    }
  };

  // 1. จัดการค้นหาสถานที่เสียชีวิต / เกิดเหตุ (สถานที่ตามใบมรณบัตร)
  useEffect(() => {
    if (!placeSearchQuery || placeSearchQuery.trim().length < 1) {
      setPlaceSearchResults([]);
      setShowPlaceDropdown(false);
      return;
    }

    // ก. ค้นหาในฐานข้อมูลสถานที่ท้องถิ่นทันที (Instant Local Search)
    const localMatches = searchLocations(placeSearchQuery, 6);
    setPlaceSearchResults(localMatches);
    setShowPlaceDropdown(true);

    // ข. ค้นหาออนไลน์ผ่าน OpenStreetMap Nominatim เมื่อพิมพ์ 3 ตัวอักษรขึ้นไป
    const timer = setTimeout(async () => {
      if (placeSearchQuery.trim().length >= 3) {
        setIsSearchingPlaces(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeSearchQuery)}&countrycodes=th&addressdetails=1&limit=6&accept-language=th`
          );
          if (res.ok) {
            const data = await res.json();
            const osmResults = data.map(item => {
              const addr = item.address || {};
              const title = item.display_name?.split(',')[0] || placeSearchQuery;
              const subdistrict = addr.suburb || addr.neighbourhood || addr.village || addr.quarter || '';
              const district = addr.city_district || addr.district || addr.county || addr.town || addr.city || '';
              const province = addr.province || addr.state || '';
              const street = addr.road || addr.street || '';

              return {
                name: title,
                title: title,
                subtitle: `${street ? street + ' ' : ''}${subdistrict ? 'ต.' + subdistrict + ' ' : ''}${district ? 'อ.' + district + ' ' : ''}${province ? 'จ.' + province : ''}`,
                street: street,
                subdistrict: subdistrict,
                district: district,
                province: province,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                badge: 'แผนที่ดาวเทียม'
              };
            });

            // รวมผลลัพธ์โดยไม่ให้ซ้ำ
            const combined = [...localMatches];
            for (const r of osmResults) {
              if (!combined.some(c => Math.abs(c.lat - r.lat) < 0.001 && Math.abs(c.lng - r.lng) < 0.001)) {
                combined.push(r);
              }
            }
            setPlaceSearchResults(combined.slice(0, 8));
          }
        } catch (e) {
          console.log('Online place search unavailable, using local cache');
        } finally {
          setIsSearchingPlaces(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [placeSearchQuery]);

  // เมื่อเลือกสถานที่จากผลการค้นหา
  const handleSelectPlaceResult = (place) => {
    const newCoords = {
      lat: Number(place.lat) || coords.lat,
      lng: Number(place.lng) || coords.lng
    };

    const newDetails = {
      ...locationDetails,
      locationName: place.name || place.title || locationDetails.locationName,
      street: place.street || locationDetails.street,
      subdistrict: place.subdistrict || locationDetails.subdistrict,
      district: place.district || locationDetails.district,
      province: place.province || locationDetails.province,
      landmark: place.subtitle || ''
    };

    setCoords(newCoords);
    setLocationDetails(newDetails);
    triggerChange(newCoords, newDetails);

    setPlaceSearchQuery(place.name || place.title);
    setShowPlaceDropdown(false);
  };

  // 2. จัดการค้นหา ตำบล อำเภอ จังหวัด (Address Auto-complete)
  useEffect(() => {
    if (!addressSearchQuery || addressSearchQuery.trim().length < 1) {
      setAddressSearchResults([]);
      setShowAddressDropdown(false);
      return;
    }

    const matches = searchAddressOnly(addressSearchQuery, 8);
    setAddressSearchResults(matches);
    setShowAddressDropdown(matches.length > 0);
  }, [addressSearchQuery]);

  // เมื่อเลือกตำบล/อำเภอ/จังหวัดจาก Auto-complete
  const handleSelectAddressResult = (item) => {
    const newCoords = {
      lat: item.lat || coords.lat,
      lng: item.lng || coords.lng
    };

    const newDetails = {
      ...locationDetails,
      subdistrict: item.subdistrict,
      district: item.district,
      province: item.province
    };

    if (item.lat && item.lng) {
      setCoords(newCoords);
    }
    setLocationDetails(newDetails);
    triggerChange(newCoords, newDetails);

    setAddressSearchQuery(`ต.${item.subdistrict} อ.${item.district} จ.${item.province}`);
    setShowAddressDropdown(false);
  };

  const handleSelectPreset = (p) => {
    const newCoords = { lat: p.lat, lng: p.lng };
    const newDetails = {
      ...locationDetails,
      locationName: p.name,
      street: p.street,
      subdistrict: p.subdistrict,
      district: p.district,
      province: p.province,
      landmark: p.name
    };
    setCoords(newCoords);
    setLocationDetails(newDetails);
    triggerChange(newCoords, newDetails);
  };

  const handleManualDetailChange = (field, val) => {
    const updated = { ...locationDetails, [field]: val };
    setLocationDetails(updated);
    triggerChange(coords, updated);
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const latSpan = 20.5 - 5.5;
    const lngSpan = 105.7 - 97.3;
    
    const newLat = Number((20.5 - (y / rect.height) * latSpan).toFixed(6));
    const newLng = Number((97.3 + (x / rect.width) * lngSpan).toFixed(6));
    
    const newCoords = { lat: newLat, lng: newLng };
    setCoords(newCoords);
    reverseGeocode(newLat, newLng);
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* 1. ค้นหาสถานที่เสียชีวิต / เกิดเหตุ (สถานที่ตามใบมรณบัตร) */}
      <div ref={placeSearchRef} style={{ position: 'relative' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-light)', fontWeight: 600 }}>
            <Search size={16} color="var(--gold-primary)" />
            <span>ค้นหาสถานที่เสียชีวิต / เกิดเหตุ (ตามใบมรณบัตร หรือชื่อสถานที่)</span>
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            พิมพ์ชื่อโรงพยาบาล, ค่ายทหาร, ฐานปฏิบัติการ, จุดตรวจ หรือตำบล/อำเภอ
          </span>
        </label>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            {isSearchingPlaces ? (
              <Loader2 size={18} color="var(--gold-primary)" className="spin-animation" />
            ) : (
              <MapPin size={18} color="var(--gold-primary)" />
            )}
          </div>

          <input 
            type="text"
            className="form-input"
            style={{ 
              paddingLeft: '38px', 
              paddingRight: placeSearchQuery ? '36px' : '14px',
              height: '44px',
              fontSize: '14.5px',
              background: 'rgba(15, 23, 42, 0.85)',
              borderColor: showPlaceDropdown ? 'var(--gold-primary)' : 'var(--border-glass)',
              boxShadow: showPlaceDropdown ? '0 0 15px rgba(212, 175, 55, 0.25)' : 'none'
            }}
            placeholder="พิมพ์ค้นหาสถานที่ เช่น รพ.ค่ายสุรสีห์, สะเตง, บันนังสตา, รพ.ปัตตานี, ฐานปฏิบัติการ ร้อย.ทพ.4101..."
            value={placeSearchQuery}
            onChange={(e) => setPlaceSearchQuery(e.target.value)}
            onFocus={() => {
              if (placeSearchResults.length > 0) setShowPlaceDropdown(true);
            }}
          />

          {placeSearchQuery && (
            <button
              type="button"
              onClick={() => {
                setPlaceSearchQuery('');
                setPlaceSearchResults([]);
                setShowPlaceDropdown(false);
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="ล้างข้อความค้นหา"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown ผลลัพธ์การค้นหาสถานที่ */}
        {showPlaceDropdown && placeSearchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'rgba(10, 18, 38, 0.98)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--gold-primary)',
            borderRadius: '10px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.85)',
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '6px'
          }}>
            <div style={{ 
              padding: '6px 10px', 
              fontSize: '11.5px', 
              color: 'var(--text-dim)', 
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>📍 คลิกเลือกสถานที่เพื่อกรอกข้อมูลและปักหมุดอัตโนมัติ:</span>
              <span>พบ {placeSearchResults.length} รายการ</span>
            </div>

            {placeSearchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectPlaceResult(item)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  borderBottom: idx < placeSearchResults.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ marginTop: '2px', color: 'var(--gold-primary)' }}>
                    {item.type === 'PLACE' ? <Building2 size={16} /> : <MapPin size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-blue" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {item.badge}
                  </span>
                  <ChevronRight size={14} color="var(--text-dim)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Location Presets (ปุ่มลัดค่ายทหารและพื้นที่ ทบ.) */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', marginBottom: '6px' }}>
          <Compass size={14} color="var(--gold-primary)" />
          <span>หรือเลือกปักหมุดด่วนตามพื้นที่ปฏิบัติการหลัก ทบ.:</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {PRESET_LOCATIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '11.5px',
                padding: '4px 9px',
                background: coords.lat === preset.lat ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: coords.lat === preset.lat ? 'var(--gold-primary)' : 'var(--border-glass)'
              }}
            >
              <MapPin size={12} color={coords.lat === preset.lat ? 'var(--gold-primary)' : 'var(--text-dim)'} />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Visual Pinning Canvas */}
      <div 
        onClick={handleMapClick}
        style={{
          width: '100%',
          height: '240px',
          borderRadius: '10px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'crosshair',
          border: '1px solid var(--border-subtle)',
          background: `
            radial-gradient(circle at 50% 50%, rgba(14, 28, 58, 0.6) 0%, rgba(7, 13, 30, 0.95) 100%),
            linear-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 24px 24px, 24px 24px'
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.15,
          pointerEvents: 'none',
          fontSize: '72px',
          fontWeight: 900,
          color: 'var(--gold-primary)'
        }}>
          MAP PINNING
        </div>

        {/* Dynamic Embedded Google Map Preview Iframe */}
        <iframe
          title="Google Map Location Preview"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.85,
            filter: 'contrast(1.05) invert(0.9) hue-rotate(180deg)',
            pointerEvents: 'none'
          }}
        />

        {/* Pin marker overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            background: 'var(--ruby-danger)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            marginBottom: '2px',
            whiteSpace: 'nowrap'
          }}>
            📍 {locationDetails.subdistrict ? `ต.${locationDetails.subdistrict} จ.${locationDetails.province}` : 'จุดเกิดเหตุ/สถานที่เสียชีวิต'}
          </div>
          <div style={{
            width: '16px',
            height: '16px',
            background: 'var(--ruby-danger)',
            borderRadius: '50%',
            border: '2px solid #ffffff',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
          }}></div>
        </div>

        {/* Top-Right Tools */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 15,
          display: 'flex',
          gap: '8px'
        }}>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11.5px', background: 'rgba(7, 13, 30, 0.9)', padding: '5px 10px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} />
            <span>เปิดบน Google Maps</span>
          </a>
        </div>

        {/* Bottom coordinate indicator */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '10px',
          zIndex: 15,
          background: 'rgba(7, 13, 30, 0.85)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11.5px',
          color: 'var(--gold-primary)',
          border: '1px solid var(--border-glass)'
        }}>
          พิกัด GPS: Lat {coords.lat.toFixed(6)}, Lng {coords.lng.toFixed(6)}
          {geocoding && <span style={{ marginLeft: '8px', color: '#fff' }}>(กำลังดึงชื่อตำบล/อำเภอ...)</span>}
        </div>
      </div>

      {/* 2. ช่องค้นหา ตำบล - อำเภอ - จังหวัด แบบ Auto-complete ด่วน */}
      <div 
        ref={addressSearchRef}
        style={{
          background: 'rgba(212, 175, 55, 0.06)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '10px',
          padding: '14px 16px',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-primary)', fontWeight: 600 }}>
            <Sparkles size={15} />
            <span>ค้นหา ตำบล - อำเภอ - จังหวัด (Search Auto-complete ด่วน)</span>
          </label>
          <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
            พิมพ์ชื่อแล้วกดเลือกเพื่อกรอก 3 ช่องอัตโนมัติ
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <input 
            type="text"
            className="form-input"
            style={{ 
              background: 'rgba(10, 18, 38, 0.85)',
              borderColor: showAddressDropdown ? 'var(--gold-primary)' : 'var(--border-glass)',
              fontSize: '13.5px',
              paddingRight: addressSearchQuery ? '36px' : '12px'
            }}
            placeholder="พิมพ์ชื่อตำบล อำเภอ หรือจังหวัด เช่น สะเตง, บันนังสตา, ลาดหญ้า, เมืองยะลา, เมืองกาญจนบุรี..."
            value={addressSearchQuery}
            onChange={(e) => setAddressSearchQuery(e.target.value)}
            onFocus={() => {
              if (addressSearchResults.length > 0) setShowAddressDropdown(true);
            }}
          />

          {addressSearchQuery && (
            <button
              type="button"
              onClick={() => {
                setAddressSearchQuery('');
                setAddressSearchResults([]);
                setShowAddressDropdown(false);
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={15} />
            </button>
          )}

          {/* Dropdown ผลลัพธ์ ตำบล / อำเภอ / จังหวัด */}
          {showAddressDropdown && addressSearchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 110,
              background: 'rgba(10, 18, 38, 0.98)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--gold-primary)',
              borderRadius: '8px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.85)',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '6px'
            }}>
              <div style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-glass)' }}>
                ผลการค้นหา ตำบล - อำเภอ - จังหวัด (คลิกเพื่อเติมข้อมูลทันที):
              </div>
              {addressSearchResults.map((addr, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectAddressResult(addr)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    borderBottom: idx < addressSearchResults.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.18)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="var(--gold-primary)" />
                    <span style={{ color: '#fff', fontWeight: 600 }}>ต.{addr.subdistrict}</span>
                    <span style={{ color: 'var(--text-dim)' }}>อ.{addr.district}</span>
                    <span className="badge badge-amber" style={{ fontSize: '11px' }}>จ.{addr.province}</span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--emerald-success)' }}>เลือก ↵</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. รายละเอียดที่อยู่ (สถานที่ตามใบมรณบัตร) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* แถวที่ 1: ชื่อสถานที่ตามใบมรณบัตร */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label required" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ชื่อสถานที่เสียชีวิต / เกิดเหตุ (สถานที่ตามใบมรณบัตร)</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 'normal' }}>
              ดึงอัตโนมัติจากการค้นหา หรือระบุเองตามเอกสาร
            </span>
          </label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="เช่น โรงพยาบาลค่ายสุรสีห์, ฐานปฏิบัติการ ร้อย.ทพ.4101, บ้านพักข้าราชการ, จุดตรวจความมั่นคง..."
            value={locationDetails.locationName}
            onChange={(e) => handleManualDetailChange('locationName', e.target.value)}
            required
          />
        </div>

        {/* แถวที่ 2: เลขที่, หมู่ที่, ซอย, ถนน */}
        <div className="grid-cols-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">เลขที่</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เช่น 123/4"
              value={locationDetails.houseNumber}
              onChange={(e) => handleManualDetailChange('houseNumber', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">หมู่ที่</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เช่น 5 หรือ หมู่บ้าน..."
              value={locationDetails.village}
              onChange={(e) => handleManualDetailChange('village', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">ซอย</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เช่น ซอยสุขเกษม"
              value={locationDetails.soi}
              onChange={(e) => handleManualDetailChange('soi', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">ถนน / สายทาง</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เช่น ถ.เพชรเกษม, ทล.410"
              value={locationDetails.street}
              onChange={(e) => handleManualDetailChange('street', e.target.value)}
              required
            />
          </div>
        </div>

        {/* แถวที่ 3: ตำบล/แขวง, อำเภอ/เขต, จังหวัด (พร้อม Datalist Auto-complete) */}
        <div className="grid-cols-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">ตำบล / แขวง</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เช่น สะเตง, ลาดหญ้า, บ้านพระ"
              value={locationDetails.subdistrict}
              onChange={(e) => handleManualDetailChange('subdistrict', e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">อำเภอ / เขต</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เช่น เมืองยะลา, เมืองกาญจนบุรี"
              value={locationDetails.district}
              onChange={(e) => handleManualDetailChange('district', e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">จังหวัด</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เลือกหรือพิมพ์ชื่อจังหวัด"
              list="thai-provinces-list"
              value={locationDetails.province}
              onChange={(e) => handleManualDetailChange('province', e.target.value)}
              required
            />
            {/* Datalist รายชื่อ 77 จังหวัดทั่วไทย */}
            <datalist id="thai-provinces-list">
              {THAI_PROVINCES.map((p, idx) => (
                <option key={idx} value={p} />
              ))}
            </datalist>
          </div>
        </div>

        {/* แถวที่ 4: สรุปที่อยู่เต็ม Live Preview */}
        {(locationDetails.locationName || locationDetails.province) && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            padding: '10px 14px',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px'
          }}>
            <CheckCircle2 size={16} color="var(--emerald-success)" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--text-dim)', marginRight: '6px' }}>สรุปที่อยู่สำหรับรายงาน:</span>
              <strong style={{ color: '#fff' }}>
                {locationDetails.locationName ? `[${locationDetails.locationName}] ` : ''}
                {locationDetails.houseNumber ? `เลขที่ ${locationDetails.houseNumber} ` : ''}
                {locationDetails.village ? `หมู่ ${locationDetails.village} ` : ''}
                {locationDetails.soi ? `ซอย${locationDetails.soi} ` : ''}
                {locationDetails.street ? `ถนน${locationDetails.street} ` : ''}
                {locationDetails.subdistrict ? `ต.${locationDetails.subdistrict} ` : ''}
                {locationDetails.district ? `อ.${locationDetails.district} ` : ''}
                {locationDetails.province ? `จ.${locationDetails.province}` : ''}
              </strong>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
