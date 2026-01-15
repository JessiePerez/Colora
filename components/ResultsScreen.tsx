
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalysisResponse, Palette } from '../types';

interface ColorGridCellProps {
  color: string;
  activeHex: string | null;
  setActiveHex: (color: string | null) => void;
  saveColor: (color: string) => void;
  handleSliceClick: (color: string) => void;
  isBase?: boolean;
}

const ColorGridCell: React.FC<ColorGridCellProps> = ({ 
  color, 
  activeHex, 
  setActiveHex, 
  saveColor, 
  handleSliceClick, 
  isBase = false 
}) => {
  const isActive = activeHex === color;
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveColor(color);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1200);
  };

  return (
    <div 
      className={`aspect-square rounded-[28px] relative cursor-pointer active:scale-95 transition-all
        ${isActive ? 'bg-black/10' : 'bg-white/[0.03]'}`}
      onClick={() => setActiveHex(isActive ? null : color)}
    >
      <div className="absolute inset-2 rounded-[22px] shadow-md" style={{ backgroundColor: color }}></div>

      {isBase && (
        <span className="absolute -top-1.5 -left-1 text-[7px] font-bold text-background-dark bg-primary px-1.5 py-0.5 rounded-full uppercase tracking-widest z-20 shadow-sm">BASE</span>
      )}
      
      {isActive && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[8px] rounded-[28px] flex flex-col items-center justify-center gap-2 z-10 animate-in fade-in zoom-in duration-300">
          <span 
            className="text-[10px] font-mono font-bold text-white tracking-tighter drop-shadow-md mb-1"
            onClick={(e) => { e.stopPropagation(); handleSliceClick(color); }}
          >
            {color}
          </span>
          <button 
            onClick={handleSave} 
            style={{ 
              color: isSaved ? '#1A141A' : color, 
              borderColor: isSaved ? '#FFFFFF' : `${color}AA` 
            }}
            className={`size-10 border-2 rounded-2xl flex items-center justify-center transition-all shadow-xl 
            ${isSaved 
              ? 'bg-white scale-110 rotate-[360deg]' 
              : 'bg-black/30 hover:bg-black/50 active:scale-125'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'filled' : ''} transition-transform`}>
              {isSaved ? 'check_circle' : 'bookmark'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

interface ResultsScreenProps {
  analysis: AnalysisResponse;
  onReset: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ analysis, onReset }) => {
  const navigate = useNavigate();
  const [activeHex, setActiveHex] = useState<string | null>(null);
  const [savedPaletteIndices, setSavedPaletteIndices] = useState<Set<number>>(new Set());

  const handleNewCapture = () => {
    onReset();
    navigate('/capture');
  };

  const combinationColors = (Array.from(new Set(
    analysis.palettes?.flatMap(p => p.items.map(i => i.color)) || []
  )) as string[]).slice(0, 8);

  const riskyColors = (Array.isArray(analysis.boldColors) ? analysis.boldColors : []).slice(0, 4);

  const saveColor = (hex: string) => {
    const saved = JSON.parse(localStorage.getItem('colora_saved_colors') || '[]');
    if (!saved.includes(hex)) {
      localStorage.setItem('colora_saved_colors', JSON.stringify([...saved, hex]));
    }
  };

  const savePalette = (palette: Palette, index: number) => {
    const saved = JSON.parse(localStorage.getItem('colora_saved_palettes') || '[]');
    if (!saved.some((p: Palette) => p.title === palette.title)) {
      localStorage.setItem('colora_saved_palettes', JSON.stringify([...saved, palette]));
    }
    setSavedPaletteIndices(prev => new Set(prev).add(index));
    setTimeout(() => {
      setSavedPaletteIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 1500);
  };

  const handleSliceClick = (color: string) => {
    navigator.clipboard.writeText(color);
    alert(`Copiado: ${color}`);
  };

  return (
    <div className="bg-background-dark font-display text-cloud-light min-h-screen flex flex-col antialiased relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none blur-3xl opacity-50"></div>

      <header className="sticky top-0 z-50 bg-background-dark/85 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center justify-between px-8 py-4">
          <button onClick={() => navigate('/capture')} className="flex size-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h1 className="text-[9px] font-bold tracking-[0.4em] uppercase text-tech/50">Harmonía AI</h1>
          <button onClick={() => navigate('/saved')} className="flex size-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-xl">bookmarks</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 flex flex-col gap-12 pb-44">
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold tracking-tight">Color capturado</h2>
          <div className="relative w-full aspect-[2/1] rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute inset-0" style={{backgroundColor: analysis.baseColor.hex}}></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <div>
                <p className="text-white/50 text-[9px] font-bold mb-1 tracking-widest uppercase">{analysis.baseColor.name}</p>
                <h3 className="text-white text-4xl font-bold tracking-tighter leading-none">{analysis.baseColor.hex}</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold tracking-tight">Colores que combinan</h2>
            <p className="text-[10px] text-tech/40 font-normal tracking-wide">Tonos seleccionados por IA para una armonía perfecta.</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <ColorGridCell 
              key={analysis.baseColor.hex} 
              color={analysis.baseColor.hex} 
              activeHex={activeHex}
              setActiveHex={setActiveHex}
              saveColor={saveColor}
              handleSliceClick={handleSliceClick}
              isBase 
            />
            {combinationColors.filter(c => c.toLowerCase() !== analysis.baseColor.hex.toLowerCase()).map((color, idx) => (
              <ColorGridCell 
                key={`comb-${idx}`} 
                color={color} 
                activeHex={activeHex}
                setActiveHex={setActiveHex}
                saveColor={saveColor}
                handleSliceClick={handleSliceClick}
              />
            ))}
          </div>
        </section>

        {riskyColors.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold tracking-tight text-primary">Colores más arriesgados para combinar</h2>
              <p className="text-[10px] text-tech/40 font-normal tracking-wide">Opciones vibrantes para un contraste inesperado.</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {riskyColors.map((color, idx) => (
                <ColorGridCell 
                  key={`risky-${idx}`} 
                  color={color} 
                  activeHex={activeHex}
                  setActiveHex={setActiveHex}
                  saveColor={saveColor}
                  handleSliceClick={handleSliceClick}
                />
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-8">
          <h2 className="text-xl font-bold tracking-tight">Paletas de colores</h2>
          <div className="flex flex-col gap-6">
            {analysis.palettes?.map((palette, idx) => (
              <article key={idx} className="bg-white/[0.02] rounded-[44px] p-7 border border-white/5 flex flex-col gap-6 backdrop-blur-xl group relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <div className="flex-1 pr-4">
                    <h3 className="text-base font-bold text-white tracking-tight mb-1 uppercase">{palette.title}</h3>
                    <p className="text-[10px] text-tech/50 font-normal leading-relaxed">
                      {palette.description}
                    </p>
                  </div>
                  <button 
                    onClick={() => savePalette(palette, idx)}
                    className={`size-10 rounded-2xl border-2 flex items-center justify-center transition-all 
                    ${savedPaletteIndices.has(idx) 
                      ? 'bg-primary border-primary text-background-dark scale-110' 
                      : 'border-white/10 text-white/40 hover:text-white hover:border-white/30 active:scale-90'}`}
                  >
                    <span className="material-symbols-outlined text-[20px] filled">
                      {savedPaletteIndices.has(idx) ? 'check' : 'bookmark_add'}
                    </span>
                  </button>
                </div>

                <div className="flex flex-col gap-4 z-10">
                  <div className="h-32 w-full rounded-[28px] overflow-hidden flex shadow-2xl border border-white/5 bg-black/40">
                    {palette.items.map((item, i) => {
                      const isSmall = item.percentage <= 15;
                      return (
                        <button 
                          key={i} 
                          onClick={() => handleSliceClick(item.color)}
                          className="relative h-full transition-all duration-300 group/item flex items-center justify-center overflow-hidden hover:scale-x-110 hover:z-20 border-none outline-none"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        >
                          <span 
                            className={`font-mono font-bold text-[8px] opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap z-30 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]
                            ${isSmall 
                              ? 'rotate-180 w-full h-full flex items-center justify-center' 
                              : ''}`}
                            style={isSmall ? { writingMode: 'vertical-rl' } : {}}
                          >
                            {item.color}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent pt-12 z-50">
        <div className="max-w-lg mx-auto">
          <button 
            onClick={handleNewCapture}
            className="flex w-full items-center justify-center h-14 rounded-[20px] sunset-gradient text-background-dark font-bold text-sm shadow-2xl active:scale-95 transition-all">
            <span className="material-symbols-outlined text-xl mr-2">replay</span>
            Reiniciar captura
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
