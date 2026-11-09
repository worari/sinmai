// components/LocationPicker.js
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronRight,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Layers,
  Crosshair
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

  // โหมดแผนที่: 'interactive' (Leaflet ลากได้ ซูมได้ ปักหมุดได้), 'satellite' (ดาวเทียม), 'google' (Google Maps Embed)
  const [mapMode, setMapMode] = useState('interactive');
  const [isExpanded, setIsExpanded] = useState(false);

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
  const mapIframeRef = useRef(null);

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

  // ฟังข้อความ PostMessage จาก Leaflet Map ภายใน iframe เมื่อผู้ใช้ลากหมุดหรือคลิกบนแผนที่
  useEffect(() => {
    function handleWindowMessage(event) {
      if (event.data && event.data.type === 'MAP_COORDS_UPDATE') {
        const { lat, lng } = event.data;
        if (typeof lat === 'number' && typeof lng === 'number') {
          const newCoords = {
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6))
          };
          setCoords(newCoords);
          reverseGeocode(newCoords.lat, newCoords.lng);
        }
      }
    }
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [locationDetails]);

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

  // ส่งพิกัดใหม่ไปยัง Leaflet Map ใน iframe
  const sendCoordsToIframe = (newLat, newLng, zoom = 15) => {
    if (mapIframeRef.current && mapIframeRef.current.contentWindow) {
      mapIframeRef.current.contentWindow.postMessage({
        type: 'SET_MAP_VIEW',
        lat: newLat,
        lng: newLng,
        zoom: zoom
      }, '*');
    }
  };

  // ปุ่มควบคุมการซูมและการเลื่อนแผนที่ (Pan & Zoom Controls)
  const handleZoomIn = () => {
    if (mapIframeRef.current && mapIframeRef.current.contentWindow) {
      mapIframeRef.current.contentWindow.postMessage({ type: 'ZOOM_IN' }, '*');
    }
  };

  const handleZoomOut = () => {
    if (mapIframeRef.current && mapIframeRef.current.contentWindow) {
      mapIframeRef.current.contentWindow.postMessage({ type: 'ZOOM_OUT' }, '*');
    }
  };

  const handlePan = (dx, dy) => {
    if (mapIframeRef.current && mapIframeRef.current.contentWindow) {
      mapIframeRef.current.contentWindow.postMessage({ type: 'PAN_BY', x: dx, y: dy }, '*');
    }
  };

  const handleCenterOnPin = () => {
    sendCoordsToIframe(coords.lat, coords.lng, 15);
  };

  const handleSwitchLayer = (layerType) => {
    setMapMode(layerType);
    if (mapIframeRef.current && mapIframeRef.current.contentWindow) {
      mapIframeRef.current.contentWindow.postMessage({ type: 'SWITCH_LAYER', layer: layerType }, '*');
    }
  };

  // Reverse Geocoding จากพิกัด Lat/Lng (คลิกบนแผนที่หรือลากหมุด)
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
    sendCoordsToIframe(newCoords.lat, newCoords.lng, 16);

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
      sendCoordsToIframe(newCoords.lat, newCoords.lng, 14);
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
    sendCoordsToIframe(newCoords.lat, newCoords.lng, 15);
  };

  const handleManualDetailChange = (field, val) => {
    const updated = { ...locationDetails, [field]: val };
    setLocationDetails(updated);
    triggerChange(coords, updated);
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

  // Interactive Leaflet Map HTML Template (รองรับซูม +/-, ลากหมุด, เลื่อนแผนที่ ซ้าย-ขวา บน-ล่าง)
  const leafletSrcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #070d1e; overflow: hidden; cursor: grab; }
    #map:active { cursor: grabbing; }
    .custom-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: grab;
      user-select: none;
    }
    .custom-pin:active { cursor: grabbing; }
    .pin-label {
      background: #dc2626;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0,0,0,0.6);
      margin-bottom: 2px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      border: 1px solid rgba(255,255,255,0.4);
      pointer-events: none;
    }
    .pin-dot {
      width: 18px;
      height: 18px;
      background: #ef4444;
      border: 2.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.95);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${coords.lat}, ${coords.lng}],
      zoom: 15,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true
    });

    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    var satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri Satellite'
    });

    var pinIcon = L.divIcon({
      className: 'custom-pin',
      html: '<div class="pin-label">📍 จุดเกิดเหตุ (ลากเพื่อปรับพิกัด)</div><div class="pin-dot"></div>',
      iconSize: [150, 44],
      iconAnchor: [75, 40]
    });

    var marker = L.marker([${coords.lat}, ${coords.lng}], {
      draggable: true,
      icon: pinIcon
    }).addTo(map);

    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      window.parent.postMessage({
        type: 'MAP_COORDS_UPDATE',
        lat: pos.lat,
        lng: pos.lng
      }, '*');
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      window.parent.postMessage({
        type: 'MAP_COORDS_UPDATE',
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }, '*');
    });

    window.addEventListener('message', function(e) {
      if (!e.data) return;
      if (e.data.type === 'SET_MAP_VIEW') {
        map.setView([e.data.lat, e.data.lng], e.data.zoom || map.getZoom());
        marker.setLatLng([e.data.lat, e.data.lng]);
      } else if (e.data.type === 'ZOOM_IN') {
        map.zoomIn();
      } else if (e.data.type === 'ZOOM_OUT') {
        map.zoomOut();
      } else if (e.data.type === 'PAN_BY') {
        map.panBy([e.data.x, e.data.y]);
      } else if (e.data.type === 'SWITCH_LAYER') {
        if (e.data.layer === 'satellite') {
          if (map.hasLayer(osmLayer)) map.removeLayer(osmLayer);
          satLayer.addTo(map);
        } else {
          if (map.hasLayer(satLayer)) map.removeLayer(satLayer);
          osmLayer.addTo(map);
        }
      }
    });
  </script>
</body>
</html>`;
  }, []);

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

      {/* Interactive Map Visual Pinning Canvas (สามารถซูม +/-, จับลากเลื่อน ซ้าย/ขวา/บน/ล่าง และจับลากหมุดได้) */}
      <div 
        style={{
          width: '100%',
          height: isExpanded ? '460px' : '330px',
          borderRadius: '10px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'height 0.25s ease'
        }}
      >
        {/* Layer 1: แผนที่ Interactive Leaflet (OpenStreetMap / Satellite) */}
        {mapMode !== 'google' ? (
          <iframe
            ref={mapIframeRef}
            title="Interactive Location Map"
            srcDoc={leafletSrcDoc}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
          />
        ) : (
          /* Layer 2: มุมมอง Google Maps Embed */
          <iframe
            title="Google Map Location Preview"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              filter: 'contrast(1.05) invert(0.9) hue-rotate(180deg)'
            }}
          />
        )}

        {/* 1. ปุ่มควบคุมการซูม (Zoom In / Out +/-) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <button
            type="button"
            onClick={handleZoomIn}
            className="btn btn-secondary btn-sm"
            style={{
              width: '34px',
              height: '34px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(7, 13, 30, 0.9)',
              borderColor: 'var(--gold-primary)',
              color: 'var(--gold-primary)',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
            title="ซูมเข้า (+)"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="btn btn-secondary btn-sm"
            style={{
              width: '34px',
              height: '34px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(7, 13, 30, 0.9)',
              borderColor: 'var(--gold-primary)',
              color: 'var(--gold-primary)',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
            title="ซูมออก (-)"
          >
            <Minus size={18} />
          </button>
        </div>

        {/* 2. ปุ่มเลื่อนทิศทาง 4 ทิศทาง (Pan Controls: บน ล่าง ซ้าย ขวา และ ตรงกลาง) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '54px',
          zIndex: 30,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 26px)',
          gridTemplateRows: 'repeat(3, 26px)',
          gap: '2px',
          background: 'rgba(7, 13, 30, 0.85)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.6)'
        }}>
          <div></div>
          <button
            type="button"
            onClick={() => handlePan(0, -80)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
            title="เลื่อนขึ้น"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowUp size={14} />
          </button>
          <div></div>

          <button
            type="button"
            onClick={() => handlePan(-80, 0)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
            title="เลื่อนซ้าย"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={14} />
          </button>

          <button
            type="button"
            onClick={handleCenterOnPin}
            style={{ background: 'rgba(212, 175, 55, 0.2)', border: 'none', color: 'var(--gold-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
            title="กลับมากึ่งกลางหมุด"
          >
            <Crosshair size={13} />
          </button>

          <button
            type="button"
            onClick={() => handlePan(80, 0)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
            title="เลื่อนขวา"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowRight size={14} />
          </button>

          <div></div>
          <button
            type="button"
            onClick={() => handlePan(0, 80)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
            title="เลื่อนลง"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowDown size={14} />
          </button>
          <div></div>
        </div>

        {/* 3. ปุ่มสลับโหมดแผนที่ และขยายเต็มจอ (Top-Right Tools) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {/* สลับเลเยอร์แผนที่ */}
          <div style={{
            display: 'flex',
            background: 'rgba(7, 13, 30, 0.9)',
            borderRadius: '6px',
            border: '1px solid var(--border-glass)',
            padding: '2px'
          }}>
            <button
              type="button"
              onClick={() => handleSwitchLayer('interactive')}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: mapMode === 'interactive' ? 'var(--gold-primary)' : 'transparent',
                color: mapMode === 'interactive' ? '#000' : '#cbd5e1',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
              title="แผนที่ถนน (Street Map)"
            >
              แผนที่
            </button>
            <button
              type="button"
              onClick={() => handleSwitchLayer('satellite')}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: mapMode === 'satellite' ? 'var(--gold-primary)' : 'transparent',
                color: mapMode === 'satellite' ? '#000' : '#cbd5e1',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
              title="แผนที่ดาวเทียม (Satellite Imagery)"
            >
              ดาวเทียม
            </button>
            <button
              type="button"
              onClick={() => setMapMode('google')}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: mapMode === 'google' ? 'var(--gold-primary)' : 'transparent',
                color: mapMode === 'google' ? '#000' : '#cbd5e1',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
              title="Google Maps Embed"
            >
              Google
            </button>
          </div>

          {/* ยืด/หดความสูงแผนที่ */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '6px 8px',
              fontSize: '11px',
              background: 'rgba(7, 13, 30, 0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={isExpanded ? 'ย่อความสูงแผนที่' : 'ขยายความสูงแผนที่'}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* เปิดบน Google Maps แท็บใหม่ */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11.5px', background: 'rgba(7, 13, 30, 0.9)', padding: '5px 10px' }}
          >
            <ExternalLink size={13} />
            <span>Google Maps</span>
          </a>
        </div>

        {/* 4. แถบแสดงพิกัดและคำแนะนำการใช้งาน (Bottom Info Bar) */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '10px',
          right: '10px',
          zIndex: 30,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(7, 13, 30, 0.9)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11.5px',
            color: 'var(--gold-primary)',
            border: '1px solid var(--border-glass)',
            pointerEvents: 'auto'
          }}>
            📍 พิกัด GPS: Lat {coords.lat.toFixed(6)}, Lng {coords.lng.toFixed(6)}
            {geocoding && <span style={{ marginLeft: '6px', color: '#fff' }}>(กำลังอ่านชื่อตำบล/อำเภอ...)</span>}
          </div>

          <div style={{
            background: 'rgba(7, 13, 30, 0.85)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'var(--text-dim)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            💡 คลิกบนแผนที่หรือลากหมุดสีแดง เพื่อเปลี่ยนพิกัด | หมุนลูกกลิ้งเมาส์เพื่อซูม
          </div>
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
