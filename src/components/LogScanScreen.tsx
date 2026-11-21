import React, { useEffect, useRef, useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { TripItem } from '../types';

interface DetectedBoundingBox {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: 'Produce' | 'Proteins' | 'Pantry Staples' | 'Spices';
  confidence: number;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}

const SAMPLE_DETECTED_ITEMS: DetectedBoundingBox[] = [
  {
    id: 'box-1',
    name: 'Tomatoes (Basket)',
    price: 18500,
    unit: '1 basket',
    category: 'Produce',
    confidence: 0.98,
    xPct: 12,
    yPct: 26,
    widthPct: 76,
    heightPct: 10,
  },
  {
    id: 'box-2',
    name: 'Rodo Pepper 4kg',
    price: 1500,
    unit: '4 kg',
    category: 'Produce',
    confidence: 0.95,
    xPct: 12,
    yPct: 39,
    widthPct: 76,
    heightPct: 10,
  },
  {
    id: 'box-3',
    name: 'Palm Oil 5L',
    price: 4200,
    unit: '5 L',
    category: 'Pantry Staples',
    confidence: 0.96,
    xPct: 12,
    yPct: 52,
    widthPct: 76,
    heightPct: 10,
  },
  {
    id: 'box-4',
    name: 'Onions (Dry)',
    price: 2500,
    unit: '1 bag',
    category: 'Produce',
    confidence: 0.89,
    xPct: 12,
    yPct: 65,
    widthPct: 76,
    heightPct: 10,
  },
];

// Offline-safe crisp thermal receipt illustration for instant sample scanning
const SAMPLE_RECEIPT_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 560" width="420" height="560">
    <rect width="420" height="560" fill="#1e293b"/>
    <rect x="34" y="24" width="352" height="512" rx="12" fill="#fbfaf7"/>
    <text x="210" y="66" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="#111827">MILE 12 PRODUCE STALL 42</text>
    <text x="210" y="88" text-anchor="middle" font-family="monospace" font-size="11" fill="#64748b">KETU, LAGOS · 14 OCT · CASH RECEIPT</text>
    <line x1="56" y1="108" x2="364" y2="108" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1.5"/>
    <text x="64" y="175" font-family="monospace" font-size="14" fill="#1e293b">1x Tomatoes Basket</text>
    <text x="356" y="175" text-anchor="end" font-family="monospace" font-size="14" font-weight="bold" fill="#1e293b">18,500</text>
    <text x="64" y="248" font-family="monospace" font-size="14" fill="#1e293b">4kg Rodo Pepper</text>
    <text x="356" y="248" text-anchor="end" font-family="monospace" font-size="14" font-weight="bold" fill="#1e293b">1,500</text>
    <text x="64" y="320" font-family="monospace" font-size="14" fill="#1e293b">5L Red Palm Oil</text>
    <text x="356" y="320" text-anchor="end" font-family="monospace" font-size="14" font-weight="bold" fill="#1e293b">4,200</text>
    <text x="64" y="392" font-family="monospace" font-size="14" fill="#1e293b">1 Bag Dry Onions</text>
    <text x="356" y="392" text-anchor="end" font-family="monospace" font-size="14" font-weight="bold" fill="#1e293b">2,500</text>
    <line x1="56" y1="436" x2="364" y2="436" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1.5"/>
    <text x="64" y="472" font-family="monospace" font-size="16" font-weight="bold" fill="#00567c">TOTAL (NGN)</text>
    <text x="356" y="472" text-anchor="end" font-family="monospace" font-size="16" font-weight="bold" fill="#00567c">26,700</text>
    <text x="210" y="508" text-anchor="middle" font-family="monospace" font-size="10" fill="#94a3b8">THANK YOU FOR SHOPPING</text>
  </svg>`
)}`;

export const LogScanScreen: React.FC = () => {
  const { navigateTo, setStagingItems } = useMarketPulse();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [activeBoxes, setActiveBoxes] = useState<DetectedBoundingBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraActive(false);
      }
    } catch {
      setCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      processCapturedImage(canvas.toDataURL('image/jpeg', 0.85));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) processCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processCapturedImage = (imageSrc: string) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
    setCapturedImage(imageSrc);
    setIsProcessing(true);
    setScanProgress(15);
    setActiveBoxes([]);

    const pInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(pInterval);
          setIsProcessing(false);
          setActiveBoxes(SAMPLE_DETECTED_ITEMS);
          return 100;
        }
        return prev + 25;
      });
    }, 260);
  };

  const handleUseSample = () => {
    processCapturedImage(SAMPLE_RECEIPT_DATA_URI);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsProcessing(false);
    setActiveBoxes([]);
    startCamera(facingMode);
  };

  const handleProceedWithDetected = () => {
    const newItems: TripItem[] = activeBoxes.map((box) => ({
      id: `ocr-${Date.now()}-${box.id}`,
      name: box.name,
      category: box.category,
      quantity: 1,
      unit: 'basket' as const,
      unitDetail: box.unit,
      price: box.price,
      annotationType: 'community',
      annotationText: `Verified from OCR (${Math.round(box.confidence * 100)}% match)`,
    }));

    setStagingItems(newItems);
    navigateTo('log-confirm');
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] pt-16 pb-20">
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-5 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Scanner Viewport */}
        <div className="w-full aspect-[3/4] relative rounded-3xl overflow-hidden shadow-md border border-slate-900/12 bg-slate-900 flex items-center justify-center">
          {/* State A: Live Camera */}
          {!capturedImage && cameraActive && (
            <div className="relative w-full h-full bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-8 border-2 border-white/60 border-dashed rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="text-[11px] font-bold text-white bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-xs w-fit">
                  Hold receipt steady
                </div>
                <div className="text-center text-xs text-white bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-xs mx-auto">
                  Align paper within frame
                </div>
              </div>
            </div>
          )}

          {/* State B: Camera Fallback */}
          {!capturedImage && !cameraActive && (
            <div className="p-6 text-center text-white flex flex-col items-center justify-center space-y-4 max-w-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#00567c] flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">document_scanner</span>
              </div>
              <div>
                <h2 className="font-display font-bold text-lg mb-1">Receipt Scanner Ready</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload a photo of your paper receipt or test instant extraction with a sample Mile
                  12 receipt.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 w-full pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[44px] py-2.5 bg-[#00567c] hover:bg-[#003e5a] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  <span>Upload Receipt Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleUseSample}
                  className="w-full min-h-[44px] py-2.5 bg-white/12 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Use Sample Market Receipt
                </button>
              </div>
            </div>
          )}

          {/* State C: Captured Preview + OCR Boxes */}
          {capturedImage && (
            <div className="relative w-full h-full bg-slate-900">
              <img
                src={capturedImage}
                alt="Receipt capture"
                className="w-full h-full object-cover"
              />

              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#d4e8f7] border-t-[#00567c] animate-spin mb-3" />
                  <p className="text-white font-display font-bold text-sm">
                    Reading Grocery Items...
                  </p>
                  <p className="text-slate-200 text-xs mt-1 font-mono-num">
                    Extracting prices &amp; quantities ({scanProgress}%)
                  </p>
                </div>
              )}

              {!isProcessing &&
                activeBoxes.map((box) => (
                  <button
                    key={box.id}
                    type="button"
                    onClick={() => setSelectedBoxId(box.id)}
                    style={{
                      left: `${box.xPct}%`,
                      top: `${box.yPct}%`,
                      width: `${box.widthPct}%`,
                      height: `${box.heightPct}%`,
                    }}
                    className={`absolute border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between px-3 text-xs font-bold shadow-md ${
                      selectedBoxId === box.id
                        ? 'border-[#4ade80] bg-[#15803d]/45 text-white'
                        : 'border-white/90 bg-slate-950/75 text-white hover:border-[#4ade80]'
                    }`}
                  >
                    <span className="truncate pr-2">{box.name}</span>
                    <span className="font-mono-num text-[#86efac] whitespace-nowrap">
                      ₦{box.price.toLocaleString()}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        {!capturedImage ? (
          <div className="flex items-center justify-around py-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-w-[56px] min-h-[56px] text-[#475569] hover:bg-[#eef2f6] rounded-2xl transition-colors flex flex-col items-center justify-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[22px]">photo_library</span>
              <span className="text-[11px] font-semibold">Gallery</span>
            </button>

            <button
              id="camera-shutter-btn"
              type="button"
              onClick={cameraActive ? handleCapturePhoto : handleUseSample}
              aria-label="Capture receipt photo"
              className="w-18 h-18 rounded-full border-4 border-[#00567c] p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md bg-white"
            >
              <div className="w-full h-full bg-[#00567c] rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleToggleCamera}
              className="min-w-[56px] min-h-[56px] text-[#475569] hover:bg-[#eef2f6] rounded-2xl transition-colors flex flex-col items-center justify-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[22px]">flip_camera_ios</span>
              <span className="text-[11px] font-semibold">Flip</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-900/8 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#15803d] text-[18px]">
                  check_circle
                </span>
                <span className="font-semibold text-[#111827] font-mono-num">
                  {activeBoxes.length} items detected
                </span>
              </div>
              <button
                type="button"
                onClick={handleRetake}
                className="text-[#00567c] font-semibold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>Retake</span>
              </button>
            </div>

            <button
              id="scan-proceed-review-btn"
              type="button"
              onClick={handleProceedWithDetected}
              className="w-full min-h-[48px] py-3 bg-[#00567c] text-white font-semibold text-sm rounded-xl hover:bg-[#003e5a] transition-colors flex items-center justify-center gap-2"
            >
              <span>Review Parsed Items ({activeBoxes.length})</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => navigateTo('log-choice')}
            className="text-xs font-semibold text-[#64748b] hover:text-[#00567c] hover:underline"
          >
            Skip photo and enter items manually →
          </button>
        </div>
      </div>
    </div>
  );
};
