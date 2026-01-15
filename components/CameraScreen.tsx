
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface CameraScreenProps {
  onCapture: (color: string) => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onCapture }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentColor, setCurrentColor] = useState('#6366F1');
  const [isFlashOn, setIsFlashOn] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  }, []);

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  };

  useEffect(() => {
    startCamera();
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const centerX = Math.floor(canvas.width / 2);
          const centerY = Math.floor(canvas.height / 2);
          const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
          setCurrentColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const toggleFlash = async () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    const track = stream?.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const capabilities = (track as any).getCapabilities?.() || {};
        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashOn } as any]
          });
          setIsFlashOn(!isFlashOn);
        } else {
          setIsFlashOn(!isFlashOn);
        }
      } catch (e) {
        setIsFlashOn(!isFlashOn);
      }
    } else {
      setIsFlashOn(!isFlashOn);
    }
  };

  const handleCapture = () => {
    onCapture(currentColor);
    navigate('/confirmation');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pixel = ctx.getImageData(Math.floor(img.width / 2), Math.floor(img.height / 2), 1, 1).data;
            onCapture(rgbToHex(pixel[0], pixel[1], pixel[2]));
            navigate('/confirmation');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-background-dark font-display text-white overflow-hidden h-screen w-full relative">
      <div className="absolute inset-0 w-full h-full z-0">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover opacity-80"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className={`absolute inset-0 bg-white/10 transition-opacity duration-300 pointer-events-none ${isFlashOn ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/60 via-transparent to-background-dark/80 pointer-events-none"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between pb-12">
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-8 pt-12">
            <button onClick={() => navigate('/')} className="flex size-11 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <span className="text-xs font-black tracking-[0.5em] text-white/70 uppercase">Escáner Vivo</span>
            <button 
              onClick={toggleFlash}
              className={`flex size-11 items-center justify-center rounded-full glass-panel transition-all ${isFlashOn ? 'text-primary scale-110' : 'text-white'}`}>
              <span className="material-symbols-outlined text-2xl">{isFlashOn ? 'flash_on' : 'flash_off'}</span>
            </button>
          </div>
          
          {/* Mensaje de sugerencia movido a la parte superior */}
          <div className="flex justify-center px-8">
            <div className="flex items-center gap-3 px-5 py-2.5 glass-panel rounded-[24px] shadow-lg border border-white/5 max-w-xs backdrop-blur-md">
              <span className="material-symbols-outlined text-primary text-lg animate-pulse">lightbulb</span>
              <p className="text-slate-200 text-[8px] font-bold uppercase tracking-widest leading-tight">
                Usa luz natural para precisión AI.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-10 w-full px-8 pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="w-32 h-32 rounded-[40px] border-[1px] border-white/30 relative backdrop-blur-[2px]">
              <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-tech rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
              <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-6 bg-tech rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
              <div className="absolute left-[-2px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1 bg-tech rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
              <div className="absolute right-[-2px] top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-1 bg-tech rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
            </div>
            <div className="absolute w-8 h-8 rounded-full border-2 border-primary bg-primary/20 animate-scan"></div>
            <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]"></div>
          </div>
          
          <div className="flex items-center gap-5 px-7 py-4 rounded-[32px] glass-panel shadow-2xl transition-all duration-300">
            <div 
              className="size-10 rounded-2xl border-2 border-white/20 shadow-inner" 
              style={{backgroundColor: currentColor}}
            ></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-white/50 font-black uppercase tracking-[0.3em]">Muestreo</span>
              <p className="text-white text-xl font-black leading-none font-mono tracking-tighter">{currentColor}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 w-full">
          <div className="flex items-center justify-around px-10 pb-6">
            <div className="relative">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
              <button onClick={() => fileInputRef.current?.click()} className="group">
                <div className="size-16 rounded-[24px] glass-panel flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 border border-white/10">
                  <span className="material-symbols-outlined text-white text-[28px]">photo_library</span>
                </div>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="size-28 rounded-full border-[2px] border-white/20 flex items-center justify-center p-2 backdrop-blur-sm shadow-2xl">
                <button 
                  onClick={handleCapture}
                  className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-accent hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] active:scale-90 transition-all flex items-center justify-center text-white shadow-xl">
                  <span className="material-symbols-outlined text-4xl filled">colorize</span>
                </button>
              </div>
            </div>

            <button onClick={() => navigate('/explore')} className="group">
              <div className="size-16 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 border border-white/10">
                <span className="material-symbols-outlined text-white text-[28px]">explore</span>
              </div>
            </button>
          </div>

          <div className="flex justify-center gap-10 text-[9px] font-black tracking-[0.6em] uppercase text-primary/60 pb-2">
            <span>Analizar Entorno</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;
