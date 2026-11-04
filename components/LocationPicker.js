// components/LocationPicker.js
'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Check, ExternalLink, Compass } from 'lucide-react';

// ตัวอย่างพิกัดพื้นที่ปฏิบัติภารกิจหลักของ ทบ.
const PRESET_LOCATIONS = [
  { name: 'กรุงเทพฯ (บก.ทบ. / พระนคร)', lat: 13.7651, lng: 100.5085, street: 'ถ.ราชดำเนินนอก', subdistrict: 'บางขุนพรหม', district: 'พระนคร', province: 'กรุงเทพมหานคร' },
  { name: 'กาญจนบุรี (ค่ายสุรสีห์ พล.ร.9)', lat: 14.0228, lng: 99.5328, street: 'ถ.แสงชูโต', subdistrict: 'ลาดหญ้า', district: 'เมืองกาญจนบุรี', province: 'กาญจนบุรี' },
  { name: 'ยะลา (ฉก.ยะลา / เมืองยะลา)', lat: 6.5411, lng: 101.2804, street: 'ถ.สิโรรส', subdistrict: 'สะเตง', district: 'เมืองยะลา', province: 'ยะลา' },
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

  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Reverse geocode ด้วย OpenStreetMap Nominatim API ฟรี หรือ fallback
  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        
        const newDetails = {
          street: addr.road || addr.street || locationDetails.street || '',
          subdistrict: addr.suburb || addr.neighbourhood || addr.village || addr.quarter || locationDetails.subdistrict || '',
          district: addr.city_district || addr.district || addr.county || addr.town || addr.city || locationDetails.district || '',
          province: addr.province || addr.state || locationDetails.province || '',
          landmark: data.display_name?.split(',')[0] || ''
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

  const handleSelectPreset = (p) => {
    const newCoords = { lat: p.lat, lng: p.lng };
    const newDetails = {
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
    // คำนวณพิกัดจำลองเมื่อคลิกบน Interactive Area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // แปลงอัตราส่วน offset ไปยังช่วงพิกัดประเทศไทย (Lat 5.5 - 20.5, Lng 97.3 - 105.7)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Quick Location Presets */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={15} color="var(--gold-primary)" />
          <span>เลือกปักหมุดด่วนตามพื้นที่ปฏิบัติการหลัก ทบ. หรือคลิกบนแผนที่:</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_LOCATIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '12px',
                padding: '4px 10px',
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
        {/* Background stylized Thailand contour indication */}
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

      {/* Auto-extracted & Editable Address Fields (สถานที่ตามใบมรณบัตร) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* แถวที่ 1: ชื่อสถานที่ตามใบมรณบัตร */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label required">
            ชื่อสถานที่เสียชีวิต / เกิดเหตุ (สถานที่ตามใบมรณบัตร)
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

        {/* แถวที่ 3: ตำบล/แขวง, อำเภอ/เขต, จังหวัด, สรุปที่อยู่ */}
        <div className="grid-cols-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">ตำบล / แขวง</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เช่น ต.สะเตง หรือ ต.ลาดหญ้า"
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
              placeholder="เช่น อ.เมืองยะลา หรือ อ.หนองจิก"
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
              placeholder="เช่น ยะลา, ปัตตานี, กาญจนบุรี"
              value={locationDetails.province}
              onChange={(e) => handleManualDetailChange('province', e.target.value)}
              required
            />
          </div>
        </div>

      </div>

    </div>
  );
}
