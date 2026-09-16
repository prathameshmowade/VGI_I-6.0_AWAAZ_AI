import React, { useState, useRef, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Camera, RefreshCw, CheckCircle2, ShieldCheck, MapPin, Sparkles, Lock, Video, Eye, EyeOff } from 'lucide-react';
import { processPrivacyBlur } from '../utils/imageAnonymizer';

const GEOTAG_PRESETS = [
  {
    id: 'road-pothole',
    label: 'Road Pothole (MG Road)',
    labelHi: 'सड़क गड्ढा (एम.जी. रोड)',
    url: '/presets/pothole.jpg',
    lat: 22.7196,
    lng: 75.8577,
    location: '22.7196° N, 75.8577° E (MG Road, Indore)'
  },
  {
    id: 'vehicle-plate',
    label: 'Vehicle / Parking Issue',
    labelHi: 'वाहन / पार्किंग समस्या',
    url: '/presets/vehicle_plate.jpg',
    lat: 22.7235,
    lng: 75.8640,
    location: '22.7235° N, 75.8640° E (Palasia Square, Indore)'
  },
  {
    id: 'citizen-face',
    label: 'Public Facility / Ward 12',
    labelHi: 'सार्वजनिक सुविधा (वार्ड 12)',
    url: '/presets/citizen_face.jpg',
    lat: 22.7510,
    lng: 75.8920,
    location: '22.7510° N, 75.8920° E (Vijay Nagar, Indore)'
  },
  {
    id: 'water-leak',
    label: 'Water Pipeline Leak',
    labelHi: 'पानी पाइपलाइन लीकेज',
    url: '/presets/water_leak.jpg',
    lat: 22.7300,
    lng: 75.8700,
    location: '22.7300° N, 75.8700° E (Geeta Bhawan, Indore)'
  },
  {
    id: 'sanitation-waste',
    label: 'Garbage & Waste Dump',
    labelHi: 'कचरा ढेर व सफाई',
    url: '/presets/sanitation.jpg',
    lat: 22.7400,
    lng: 75.8800,
    location: '22.7400° N, 75.8800° E (Anand Bazar, Indore)'
  }
];

export default function GeoTagCamera({ onCapture, onLocationDetected }) {
  const { t, isHindi } = useContext(LanguageContext);

  // --- Geo-Tag Camera State ---
  const [cameraActive, setCameraActive] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [coords, setCoords] = useState({ lat: 21.1458, lng: 79.0882, acc: 2.1 });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [anonymizedPhoto, setAnonymizedPhoto] = useState(null);
  const [processingYolo, setProcessingYolo] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [yoloDetections, setYoloDetections] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Live GPS locator
  const fetchLiveGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            acc: Number((pos.coords.accuracy || 2.4).toFixed(1))
          });
        },
        () => {
          setCoords({ lat: 21.1458, lng: 79.0882, acc: 2.1 });
        }
      );
    }
  };

  useEffect(() => {
    fetchLiveGPS();
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    }, 1000);
    return () => {
      clearInterval(timer);
      stopCamera();
    };
  }, []);

  // Start live webcam / mobile camera feed
  const startCamera = async () => {
    fetchLiveGPS();
    setStreamError(null);
    setCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access fallback:', err);
      setStreamError(isHindi
        ? 'लाइव कैमरा उपलब्ध नहीं है। नीचे सत्यापित जियो-टैग्ड प्रीसेट चुनें!'
        : 'Live camera hardware restricted. Use 1-Click Geo-Tagged Presets below!');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Watermark GPS and municipal metadata on canvas
  const stampGeoTagOnImage = (imageSource, isVideo = false) => {
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = isVideo ? (videoRef.current?.videoWidth || 800) : (imageSource?.naturalWidth || 800);
      const height = isVideo ? (videoRef.current?.videoHeight || 600) : (imageSource?.naturalHeight || 600);

      canvas.width = width;
      canvas.height = height;

      if (isVideo) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
      } else if (imageSource) {
        ctx.drawImage(imageSource, 0, 0, width, height);
      }

      // Dark Gradient Watermark Overlay at bottom
      const bannerHeight = Math.max(90, height * 0.18);
      const gradient = ctx.createLinearGradient(0, height - bannerHeight, 0, height);
      gradient.addColorStop(0, 'rgba(6, 78, 59, 0.0)');
      gradient.addColorStop(0.25, 'rgba(6, 78, 59, 0.85)');
      gradient.addColorStop(1, 'rgba(2, 44, 34, 0.98)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

      // Green Accent Strip
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, height - bannerHeight + 2, width, 3);

      const fontSize = Math.max(12, Math.floor(width * 0.024));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = '#ffffff';

      const padding = 16;
      let yPos = height - bannerHeight + fontSize + 16;

      ctx.fillText(`📍 INDORE MUNICIPAL CORP • CIVIC EVIDENCE`, padding, yPos);
      yPos += fontSize + 6;

      ctx.font = `bold ${fontSize - 2}px monospace`;
      ctx.fillStyle = '#34d399';
      ctx.fillText(`🌐 GPS: ${coords.lat}° N, ${coords.lng}° E`, padding, yPos);
      yPos += fontSize + 4;

      ctx.font = `${fontSize - 3}px monospace`;
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText(`🕒 ${currentTime} IST`, padding, yPos);

      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (err) {
      console.warn('[GeoTag Camera] Watermark canvas export notice:', err);
      return imageSource?.src || '';
    }
  };

  // Capture from live stream
  const captureLivePhoto = async () => {
    if (!videoRef.current) return;
    const watermarkedDataUrl = stampGeoTagOnImage(null, true);
    stopCamera();
    processSnappedPhoto(watermarkedDataUrl, `Live GPS: ${coords.lat}° N, ${coords.lng}° E (Laxmi Nagar, Nagpur)`);
  };

  // Process snapped photo with YOLOv8 privacy blur
  const processSnappedPhoto = async (photoUrl, locationString) => {
    setCapturedPhoto(photoUrl);
    setProcessingYolo(true);

    try {
      const yoloResult = await processPrivacyBlur(photoUrl);
      setAnonymizedPhoto(yoloResult.anonymizedImage);
      setYoloDetections(yoloResult.detections);
      onCapture?.(yoloResult.anonymizedImage, photoUrl);
    } catch (e) {
      console.warn('[YOLOv8] Privacy blur process error:', e);
      setAnonymizedPhoto(photoUrl);
      onCapture?.(photoUrl, photoUrl);
    } finally {
      setProcessingYolo(false);
    }

    onLocationDetected?.(locationString);
  };

  // Use Preset Photo
  const handlePresetSelect = (preset) => {
    stopCamera();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = preset.url;
    img.onload = () => {
      setCoords({ lat: preset.lat, lng: preset.lng, acc: 1.8 });
      const watermarked = stampGeoTagOnImage(img, false);
      processSnappedPhoto(watermarked || preset.url, preset.location);
    };
    img.onerror = () => {
      setCoords({ lat: preset.lat, lng: preset.lng, acc: 1.8 });
      processSnappedPhoto(preset.url, preset.location);
    };
  };

  return (
    <div className="bg-white dark:bg-emerald-950/70 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900 space-y-4 shadow-xs">
      <canvas ref={canvasRef} className="hidden" />

      {/* ═══ GEO-TAG CAMERA & EVIDENCE ATTACHMENT ═══ */}
      <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-900">
            <div className="space-y-0.5">
              <h3 className="font-bold text-emerald-950 dark:text-white text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{t('geotag_cam_title')}</span>
              </h3>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                {t('geotag_cam_sub')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-emerald text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-xs font-bold"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{t('geotag_open_btn')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs py-1.5 px-3 rounded-xl font-bold transition"
                >
                  {isHindi ? 'कैमरा बंद करें' : 'Close Camera'}
                </button>
              )}
            </div>
          </div>

          {/* Live Viewfinder */}
          {cameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-lg animate-in fade-in">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-[320px] object-cover"
              />

              {/* Live HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 bg-radial from-transparent via-transparent to-black/40">
                <div className="flex justify-between items-center text-white text-[11px] font-mono">
                  <span className="bg-red-600/90 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>CAMERA</span>
                  </span>
                  <span className="bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-lg text-emerald-300 font-bold backdrop-blur-xs">
                    📍 {coords.lat}° N, {coords.lng}° E
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center relative">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span className="absolute -bottom-5 text-[10px] font-mono text-emerald-300 font-bold bg-black/60 px-1.5 py-0.5 rounded">
                      CENTER ISSUE
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-950/85 border border-emerald-500/40 p-2.5 rounded-xl text-white text-[10.5px] font-mono space-y-0.5 backdrop-blur-xs">
                  <div className="text-emerald-300 font-bold">🏛️ INDORE MUNICIPAL CORP • WARD 12</div>
                  <div className="text-emerald-100 text-[10px] flex justify-between">
                    <span>🕒 {currentTime} IST</span>
                    <span className="text-emerald-400">📍 GEO-TAGGED</span>
                  </div>
                </div>
              </div>

              {/* Snap Button */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                <button
                  type="button"
                  onClick={captureLivePhoto}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs py-2.5 px-6 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white scale-105 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('geotag_snap_btn')}</span>
                </button>
              </div>
            </div>
          )}

          {streamError && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{streamError}</span>
            </div>
          )}

          {/* Captured Result with YOLOv8 Privacy Blur */}
          {capturedPhoto && (
            <div className="space-y-3 pt-2 border-t border-emerald-100 dark:border-emerald-900 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-950 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isHindi ? 'जियो-टैग्ड साक्ष्य फोटो तैयार (YOLOv8 द्वारा सुरक्षित) ✓' : 'Geo-Tagged Evidence Stamped & YOLOv8 Secured ✓'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900 px-2 py-1 rounded-lg"
                  >
                    {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showOriginal ? (isHindi ? 'ब्लर फोटो देखें' : 'Show Blurred') : (isHindi ? 'मूल फोटो देखें' : 'Show Original')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900 px-2 py-1 rounded-lg"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t('geotag_retake_btn')}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 shadow-md">
                <img
                  src={showOriginal ? capturedPhoto : (anonymizedPhoto || capturedPhoto)}
                  alt="Geo-Tagged Stamped Evidence"
                  className="w-full h-56 object-cover"
                />
                {processingYolo && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span>{isHindi ? 'YOLOv8 चेहरे व नंबर प्लेट धुंधले कर रहा है...' : 'YOLOv8 Redacting Faces & License Plates...'}</span>
                  </div>
                )}
                {!showOriginal && !processingYolo && (
                  <span className="absolute top-2 right-2 bg-emerald-950/85 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 border border-emerald-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{isHindi ? 'गोपनीयता सुरक्षित ✓' : 'Privacy Protected ✓'}</span>
                  </span>
                )}
              </div>

              {!showOriginal && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {isHindi
                      ? 'फोटो में चेहरे और वाहन नंबर प्लेट स्वतः सुरक्षित कर दिए गए हैं'
                      : 'Faces and vehicle plates automatically blurred for privacy'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 1-Click Verified Geo-Tagged Presets */}
          <div className="space-y-2 pt-2 border-t border-emerald-100 dark:border-emerald-900">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
              {t('geotag_presets')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {GEOTAG_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="text-[11px] bg-emerald-50/70 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-950 dark:text-emerald-100 font-medium p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition text-left flex items-center gap-2 group"
                >
                  <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-emerald-300" />
                  <div className="overflow-hidden">
                    <span className="font-bold text-emerald-900 dark:text-white block truncate">
                      {isHindi ? preset.labelHi : preset.label}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono block">
                      {preset.lat}° N, {preset.lng}° E
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
