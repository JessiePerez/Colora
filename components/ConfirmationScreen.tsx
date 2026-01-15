
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePalettes } from '../services/geminiService';
import { AnalysisResponse } from '../types';

interface ConfirmationScreenProps {
  color: string;
  onConfirm: (color: string) => void;
  onAnalysisReady: (analysis: AnalysisResponse) => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ color, onConfirm, onAnalysisReady }) => {
  const navigate = useNavigate();
  const [tempValue, setTempValue] = useState(0);
  const [brightValue, setBrightValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const touchStartRef = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const adjustedColor = useMemo(() => {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    const bAmount = Math.floor((brightValue / 50) * 80);
    r = Math.min(255, Math.max(0, r + bAmount));
    g = Math.min(255, Math.max(0, g + bAmount));
    b = Math.min(255, Math.max(0, b + bAmount));

    const tAmount = Math.floor((tempValue / 50) * 35);
    r = Math.min(255, Math.max(0, r + tAmount));
    b = Math.min(255, Math.max(0, b - tAmount));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }, [color, tempValue, brightValue]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const results = await generatePalettes(adjustedColor);
      onAnalysisReady(results);
      onConfirm(adjustedColor);
      navigate('/results');
    } catch (error) {
      alert("Error al analizar el color. Por favor intenta de nuevo.");
      setIsLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null || !sheetRef.current) return;
    const currentTouch = e.touches[0].clientY;
    const diff = currentTouch - touchStartRef.current;
    
    if (diff > 0) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null || !sheetRef.current) return;
    const currentTouch = e.changedTouches[0].clientY;
    const diff = currentTouch - touchStartRef.current;
    
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      if (diff > 160) {
        sheetRef.current.style.transform = 'translateY(100%)';
        setTimeout(() => navigate('/capture'), 300);
      } else {
        sheetRef.current.style.transform = `translateY(0px)`;
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="relative h-screen w-full bg-background-dark overflow-hidden flex flex-col font-display antialiased">
      <style>{`
        @keyframes pulseSphere {
          0%, 100% { transform: scale(0.7); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        .animate-pulse-sphere {
          animation: pulseSphere 1.4s ease-in-out infinite;
        }
        @keyframes colorFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-color-flow {
          background: linear-gradient(-45deg, #F1B2A9, #EECBC7, #D6CCD5, #F6DFD7);
          background-size: 400% 400%;
          animation: colorFlow 3s ease infinite;
        }
      `}</style>

      {/* Contenedor Superior: Ajustado para que el color suba y se vea completo */}
      <div className="absolute top-0 left-0 right-0 h-[40%] z-0 flex flex-col items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/30 to-background-dark/80"></div>
        
        <header className="w-full flex justify-between items-center px-8 pt-8 z-10">
          <button onClick={() => navigate('/capture')} className="p-3 rounded-2xl glass-panel text-cloud-light active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="size-12"></div>
        </header>

        {/* Muestra de Color: Posicionada más arriba y centrada en el tercio superior */}
        <div className="flex-1 flex flex-col items-center justify-center px-10">
          <div className="relative w-36 h-36 rounded-[48px] glass-panel p-3.5 flex items-center justify-center shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)] border border-white/10">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[30px] opacity-60"></div>
            <div 
              className="w-full h-full rounded-[38px] shadow-2xl border-[4px] border-white/10 transition-colors duration-300" 
              style={{backgroundColor: adjustedColor}}
            ></div>
          </div>
        </div>
      </div>

      {/* Panel Inferior: Ajustado para que no suba tanto y permita ver el color de arriba */}
      <div className="absolute bottom-0 left-0 right-0 z-10 w-full flex flex-col justify-end pointer-events-none">
        <div 
          ref={sheetRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full bg-surface-dark rounded-t-[44px] shadow-[0_-25px_60px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto transition-transform duration-75 ease-out border-t border-white/5"
        >
          <div className="flex w-full flex-col items-center pt-5 pb-1 cursor-ns-resize">
            <div className="h-1.5 w-14 rounded-full bg-white/10"></div>
          </div>

          <div className="px-10 pb-12 pt-4 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-cloud-light text-4xl font-bold tracking-tighter font-mono">
                {adjustedColor}
              </h2>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <div className="bg-white/[0.03] rounded-[24px] p-5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-tech uppercase tracking-widest opacity-60">Temperatura</span>
                  <span className="text-[10px] font-mono font-semibold text-primary">{tempValue > 0 ? `+${tempValue}` : tempValue}</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="relative flex-1 h-6 flex items-center">
                    <input 
                      className="relative w-full z-10 opacity-0 h-full cursor-pointer" 
                      max="50" min="-50" type="range" 
                      value={tempValue}
                      onChange={(e) => setTempValue(Number(e.target.value))}
                    />
                    <div className="absolute w-full h-1 rounded-full bg-white/10"></div>
                    <div className="absolute w-5 h-5 bg-cloud-light border-[2px] border-primary rounded-full shadow-lg"
                      style={{ left: `calc(${((tempValue + 50) * 100) / 100}% - 10px)` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-[24px] p-5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-tech uppercase tracking-widest opacity-60">Brillo</span>
                  <span className="text-[10px] font-mono font-semibold text-primary">{brightValue > 0 ? `+${brightValue}` : brightValue}</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="relative flex-1 h-6 flex items-center">
                    <input 
                      className="relative w-full z-10 opacity-0 h-full cursor-pointer" 
                      max="50" min="-50" type="range" 
                      value={brightValue}
                      onChange={(e) => setBrightValue(Number(e.target.value))}
                    />
                    <div className="absolute w-full h-1 rounded-full bg-white/10"></div>
                    <div className="absolute w-5 h-5 bg-cloud-light border-[2px] border-primary rounded-full shadow-lg"
                      style={{ left: `calc(${((brightValue + 50) * 100) / 100}% - 10px)` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleConfirm}
              disabled={isLoading}
              className={`group relative w-full h-16 active:scale-[0.97] transition-all overflow-hidden rounded-[24px] shadow-xl ${isLoading ? 'animate-color-flow' : 'sunset-gradient'}`}>
              <div className="relative w-full h-full flex items-center justify-center gap-3 text-background-dark font-bold text-base">
                {isLoading ? (
                  <>
                    <div className="size-4 bg-background-dark rounded-full animate-pulse-sphere shadow-[0_0_20px_rgba(0,0,0,0.5)]"></div>
                    <span>Armonizando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                    <span>Generar Armonías</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
