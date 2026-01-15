
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePalettes } from '../services/geminiService';
import { AnalysisResponse } from '../types';

interface ExploreScreenProps {
  onAnalysisReady: (res: AnalysisResponse) => void;
  onSetCapturedColor: (color: string) => void;
}

type CategoryType = 
  | "Pasteles" | "Vibrantes" | "Minimal" | "Naturaleza" 
  | "Tierra" | "Océano" | "Atardecer" | "Bosque" 
  | "Cyberpunk" | "Lavanda" | "Monocromo" | "Otoño" 
  | "Primavera" | "Invierno" | "Caramelo" | "Retro" 
  | "Lujo" | "Industrial" | "Zen" | "Cósmico";

const CATEGORY_DATA: Record<CategoryType, string[]> = {
  "Pasteles": ["#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#F3D1F4"],
  "Vibrantes": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
  "Minimal": ["#F5F5F5", "#E0E0E0", "#9E9E9E", "#616161", "#212121", "#BDBDBD"],
  "Naturaleza": ["#2E7D32", "#558B2F", "#F9A825", "#4E342E", "#00695C", "#0277BD"],
  "Tierra": ["#A1887F", "#8D6E63", "#795548", "#6D4C41", "#5D4037", "#4E342E"],
  "Océano": ["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6", "#039BE5"],
  "Atardecer": ["#FF9100", "#FF6D00", "#FF3D00", "#DD2C00", "#FFAB40", "#FFD180"],
  "Bosque": ["#1B5E20", "#2E7D32", "#388E3C", "#43A047", "#4CAF50", "#66BB6A"],
  "Cyberpunk": ["#00F5FF", "#FF00FF", "#FFD700", "#000000", "#39FF14", "#BC13FE"],
  "Lavanda": ["#E1BEE7", "#CE93D8", "#BA68C8", "#AB47BC", "#9C27B0", "#8E24AA"],
  "Monocromo": ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"],
  "Otoño": ["#BF360C", "#D84315", "#E64A19", "#F4511E", "#FF5722", "#FF7043"],
  "Primavera": ["#F0F4C3", "#E6EE9C", "#DCE775", "#D4E157", "#CDDC39", "#C0CA33"],
  "Invierno": ["#E3F2FD", "#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3"],
  "Caramelo": ["#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726", "#FF9800"],
  "Retro": ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3"],
  "Lujo": ["#D4AF37", "#C0C0C0", "#000000", "#FFFFFF", "#FFD700", "#2F2F2F"],
  "Industrial": ["#607D8B", "#546E7A", "#455A64", "#37474F", "#263238", "#78909C"],
  "Zen": ["#DCEDC8", "#C5E1A5", "#AED581", "#9CCC65", "#8BC34A", "#7CB342"],
  "Cósmico": ["#1A237E", "#283593", "#303F9F", "#3949AB", "#3F51B5", "#5C6BC0"]
};

const ExploreScreen: React.FC<ExploreScreenProps> = ({ onAnalysisReady, onSetCapturedColor }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleColorClick = async (hex: string) => {
    setIsLoading(true);
    try {
      const analysis = await generatePalettes(hex);
      onAnalysisReady(analysis);
      onSetCapturedColor(hex);
      navigate('/results');
    } catch (e) {
      alert("Error al cargar combinaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const saveColor = (hex: string) => {
    const saved = JSON.parse(localStorage.getItem('colora_saved_colors') || '[]');
    if (!saved.includes(hex)) {
      localStorage.setItem('colora_saved_colors', JSON.stringify([...saved, hex]));
      alert(`Color ${hex} guardado`);
    }
  };

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-background-dark text-white font-display flex flex-col">
        <header className="p-8 flex items-center gap-6 border-b border-white/5 sticky top-0 bg-background-dark/95 backdrop-blur-md z-50">
          <button onClick={() => setSelectedCategory(null)} className="size-11 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-sm font-black tracking-[0.4em] uppercase text-slate-400">{selectedCategory}</h1>
        </header>
        <main className="p-8 grid grid-cols-2 gap-6 pb-24">
          {CATEGORY_DATA[selectedCategory].map((hex) => (
            <div key={hex} className="relative group">
              <button 
                onClick={() => handleColorClick(hex)}
                disabled={isLoading}
                className="w-full flex flex-col gap-5 p-6 bg-surface-dark-alt/40 rounded-[40px] border border-white/5 hover:border-primary/30 transition-all text-left shadow-xl backdrop-blur-md"
              >
                <div className="w-full aspect-square rounded-[28px] shadow-inner active:scale-95 transition-transform border border-white/5" style={{backgroundColor: hex}}></div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black tracking-tight font-mono">{hex}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Inspiración Base</span>
                </div>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); saveColor(hex); }}
                className="absolute top-4 right-4 size-9 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <span className="material-symbols-outlined text-[18px] text-primary filled">bookmark</span>
              </button>
            </div>
          ))}
        </main>
        {isLoading && (
          <div className="fixed inset-0 bg-background-dark/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center gap-8">
             <div className="size-24 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"></div>
             <p className="text-white font-black text-xl tracking-tighter uppercase tracking-[0.2em] animate-pulse">Analizando Harmonías</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-white font-display flex flex-col relative overflow-x-hidden">
      <header className="p-8 flex items-center justify-between border-b border-white/5 sticky top-0 bg-background-dark/95 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/capture')} className="size-11 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-sm font-black tracking-[0.4em] uppercase text-slate-400">Colecciones</h1>
        </div>
        <button onClick={() => navigate('/saved')} className="size-11 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all">
          <span className="material-symbols-outlined filled">bookmarks</span>
        </button>
      </header>
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-14 text-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-tech mb-4">Inspiración Visual</h2>
          <p className="text-slate-500 text-sm font-medium max-w-[240px] mx-auto leading-relaxed">Explora tendencias seleccionadas por curadores cromáticos.</p>
        </div>

        <div className="grid grid-cols-2 gap-6 pb-16">
          {(Object.keys(CATEGORY_DATA) as CategoryType[]).map((cat, idx) => (
            <button 
              key={idx} 
              onClick={() => setSelectedCategory(cat)}
              className="relative h-48 rounded-[44px] bg-surface-dark-alt/30 border border-white/5 overflow-hidden group active:scale-95 transition-all shadow-2xl flex flex-col items-center justify-center backdrop-blur-sm"
            >
              <div className="z-10 flex flex-col items-center gap-6 w-full px-6">
                 <h3 className="text-sm font-black tracking-[0.2em] text-white group-hover:text-primary transition-colors text-center uppercase">{cat}</h3>
                 <div className="flex flex-wrap justify-center gap-3">
                    {CATEGORY_DATA[cat].slice(0, 4).map((c, i) => (
                      <div 
                        key={i} 
                        className="size-5 rounded-full border border-white/20 shadow-xl transition-all duration-500 group-hover:scale-125" 
                        style={{backgroundColor: c, transitionDelay: `${i * 60}ms`}}
                      ></div>
                    ))}
                 </div>
              </div>
              <div className="absolute inset-0 bg-white/[0.02] transition-colors group-hover:bg-primary/[0.05]"></div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExploreScreen;
