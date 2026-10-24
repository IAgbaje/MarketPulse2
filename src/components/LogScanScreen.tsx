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
    xPct: 15,
    yPct: 24,
    widthPct: 70,
    heightPct: 10,
  },
  {
    id: 'box-2',
    name: 'Rodo Pepper 4kg',
    price: 1500,
    unit: '4 kg',
    category: 'Produce',
    confidence: 0.95,
    xPct: 15,
    yPct: 37,
    widthPct: 70,
    heightPct: 10,
  },
  {
    id: 'box-3',
    name: 'Palm Oil 5L',
    price: 4200,
    unit: '5 L',
    category: 'Pantry Staples',
    confidence: 0.96,
    xPct: 15,
    yPct: 50,
    widthPct: 70,
    heightPct: 10,
  },
  {
    id: 'box-4',
    name: 'Onions (Dry)',
    price: 2500,
    unit: '1 bag',
    category: 'Produce',
    confidence: 0.89,
    xPct: 15,
    yPct: 63,
    widthPct: 70,
    heightPct: 10,
  },
];

export const LogScanScreen: React.FC = () => {
  const { navigateTo, setStagingItems } = useMarketPulse();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [activeBoxes, setActiveBoxes] = useState<DetectedBoundingBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // Initialize camera
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      setCameraError(null);
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
        setCameraError('Camera API not available on this browser/environment.');
      }
    } catch (err: unknown) {
      console.warn('Camera access denied or failed:', err);
      setCameraError('Unable to access camera. You can still upload a receipt photo.');
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

  // Flip camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from video to canvas
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      processCapturedImage(dataUrl);
    }
  };

  // Upload photo from gallery/filesystem
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          processCapturedImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image with OCR bounding boxes
  const processCapturedImage = (imageSrc: string) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
    setCapturedImage(imageSrc);
    setIsProcessing(true);
    setScanProgress(10);
    setActiveBoxes([]);

    // Animated progress simulation
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
    }, 300);
  };

  // Use demo sample receipt
  const handleUseSample = () => {
    processCapturedImage(
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCo7jzbyfJDFzMufdxgVNZc-4vCajF-sHseRGpGyTJwI_7lgDRrAS8JQ-RTEREr2_ONMVFoelA72Y6nPqr43l1y22IkWHGKNsPvowcRssSf9A6HVgFg0XAOkyCNNiR2PXaImkrcTGEhTnRDMWiPv215k6H_B4kHStWGDkD4PiD-WKOQoZTbrM1qN2JvvFSwT5J1pEHQar6e7n1bwZ3kfY_rA6104G_JCa4tzYUk51PIPwMcqpswdRPX_lD34dFUU7exzbXFgF_QE3FN'
    );
  };

  // Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setIsProcessing(false);
    setActiveBoxes([]);
    startCamera(facingMode);
  };

  // Accept OCR output and push to staging
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
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-16 pb-24 px-4 md:px-6 max-w-md mx-auto w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Viewport Container */}
      <div className="w-full aspect-[3/4] relative rounded-3xl overflow-hidden shadow-md border border-[#c0c7cf]/40 bg-black flex items-center justify-center my-3">
        {/* State A: Live Camera Active */}
        {!capturedImage && cameraActive && (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
            {/* Viewfinder crosshairs */}
            <div className="absolute inset-8 border-2 border-white/60 border-dashed rounded-2xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between items-center text-[11px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs w-fit">
                <span>Hold receipt steady</span>
              </div>
              <div className="text-center text-xs text-white/80 bg-black/40 px-3 py-1 rounded backdrop-blur-xs mx-auto">
                Align paper within the frame
              </div>
            </div>
          </div>
        )}

        {/* State B: Camera Failed or Denied Fallback */}
        {!capturedImage && !cameraActive && (
          <div className="p-6 text-center text-white flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#00567c] flex items-center justify-center text-3xl">
              <span className="material-symbols-outlined text-3xl">photo_camera</span>
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Receipt Scanner Ready</h3>
              <p className="text-xs text-[#c0c7cf] max-w-[240px] leading-relaxed">
                Take a photo of your paper receipt or upload a saved snapshot from your market trip.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-[#00567c] hover:bg-[#2a6f97] text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                <span>Upload Receipt Photo</span>
              </button>
              <button
                onClick={handleUseSample}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl"
              >
                Use Sample Market Receipt
              </button>
            </div>
          </div>
        )}

        {/* State C: Captured Image with Interactive Bounding Boxes */}
        {capturedImage && (
          <div className="relative w-full h-full bg-black">
            <img
              src={capturedImage}
              alt="Receipt capture"
              className="w-full h-full object-cover"
            />

            {/* Scanning Laser Line when processing */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#00567c] border-t-transparent animate-spin mb-3" />
                <p className="text-white font-bold text-sm">Reading Nigerian Grocery Items...</p>
                <p className="text-white/70 text-xs mt-1">Extracting prices and quantities ({scanProgress}%)</p>
              </div>
            )}

            {/* Detected OCR Bounding Boxes */}
            {!isProcessing &&
              activeBoxes.map((box) => (
                <div
                  key={box.id}
                  onClick={() => setSelectedBoxId(box.id)}
                  style={{
                    left: `${box.xPct}%`,
                    top: `${box.yPct}%`,
                    width: `${box.widthPct}%`,
                    height: `${box.heightPct}%`,
                  }}
                  className={`absolute border-2 rounded-lg cursor-pointer transition-all flex items-center justify-between px-2 text-xs font-bold shadow-md ${
                    selectedBoxId === box.id
                      ? 'border-[#68d391] bg-[#68d391]/30 text-white scale-102'
                      : 'border-white/90 bg-black/60 text-white hover:border-[#68d391]'
                  }`}
                >
                  <span className="truncate pr-1">{box.name}</span>
                  <span className="tabular-nums text-[#68d391] whitespace-nowrap">
                    ₦{box.price.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Control Panels */}
      {!capturedImage ? (
        /* Camera Live Controls */
        <div className="flex items-center justify-around py-2 w-full">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-[#40484e] hover:bg-[#eceef1] rounded-full transition-colors active:scale-95 flex flex-col items-center gap-1"
            title="Upload from gallery"
          >
            <span className="material-symbols-outlined text-[24px]">photo_library</span>
            <span className="text-[10px] font-semibold">Gallery</span>
          </button>

          {/* Shutter Button */}
          <button
            id="camera-shutter-btn"
            onClick={cameraActive ? handleCapturePhoto : handleUseSample}
            aria-label="Capture receipt photo"
            className="w-18 h-18 rounded-full border-4 border-[#00567c] p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md bg-white"
          >
            <div className="w-full h-full bg-[#00567c] rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">photo_camera</span>
            </div>
          </button>

          <button
            onClick={handleToggleCamera}
            className="p-3 text-[#40484e] hover:bg-[#eceef1] rounded-full transition-colors active:scale-95 flex flex-col items-center gap-1"
            title="Flip camera"
          >
            <span className="material-symbols-outlined text-[24px]">flip_camera_ios</span>
            <span className="text-[10px] font-semibold">Flip</span>
          </button>
        </div>
      ) : (
        /* Scanned Image Review Controls */
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#c0c7cf]/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                check_circle
              </span>
              <span className="font-semibold text-[#191c1f]">
                {activeBoxes.length} items parsed
              </span>
            </div>
            <button
              onClick={handleRetake}
              className="text-[#00567c] font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">replay</span>
              <span>Retake</span>
            </button>
          </div>

          <button
            id="scan-proceed-review-btn"
            onClick={handleProceedWithDetected}
            className="w-full py-3.5 bg-[#00567c] text-white font-bold text-sm rounded-xl hover:bg-[#2a6f97] active:scale-98 transition-all shadow flex items-center justify-center gap-2"
          >
            <span>Review Parsed Items ({activeBoxes.length})</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Manual Fallback Option */}
      <div className="mt-4 text-center">
        <button
          onClick={() => navigateTo('log-choice')}
          className="text-xs font-semibold text-[#40484e] hover:text-[#00567c] hover:underline"
        >
          Skip photo and enter items manually →
        </button>
      </div>
    </div>
  );
};
