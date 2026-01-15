
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, AnalysisResponse } from '../types';
import { generatePalettes } from '../services/geminiService';

interface SavedScreenProps {
  onAnalysisReady: (res: AnalysisResponse) => void;
  onSetCapturedColor: (color: string) => void;
}

const SavedScreen: React.FC<SavedScreenProps> = ({ onAnalysisReady, onSetCapturedColor }) => {
  const navigate = useNavigate();
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);
  const [activeTab, setActiveTab] = useState<'colors' | 'palettes'>('colors');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const colors = JSON.parse(localStorage.getItem('colora_saved_colors') || '[]');
    const palettes = JSON.parse(localStorage.getItem('colora_saved_palettes') || '[]');
    setSavedColors(colors);
    setSavedPalettes(palettes);
  }, []);

  const handleItemClick = async (hex: string) => {
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

  const deleteColor = (e: React.MouseEvent, hex: string) => {
    e.stopPropagation();
    const updated = savedColors.filter(c => c !== hex);
    setSavedColors(updated);
    localStorage.setItem('colora_saved_colors', JSON.stringify(updated));
    // Eliminada la redirección automática
  };

  const deletePalette = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = savedPalettes.filter((_, i) => i !== index);
    setSavedPalettes(updated);
    localStorage.setItem('colora_saved_palettes', JSON.stringify(updated));
    // Eliminada la redirección automática
  };

  return (
    <div className="min-h-screen bg-background-dark text-white font-display flex flex-col">
      <header className="p-8 flex items-center gap-6 border-b border-white/5 sticky top-0 bg-background-dark/95 backdrop-blur-md z-50">
        <button onClick={() => navigate(-1)} className="size-11 flex items-center justify-center rounded-2xl glass-panel hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-[11px] font-bold tracking-[0.4em] uppercase text-tech/50">Archivados</h1>
      </header>

      <div className="flex border-b border-white/5 bg-surface-dark-alt/10">
        <button 
          onClick={() => setActiveTab('colors')}
          className={`flex-1 py-5 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'colors' ? 'text-primary' : 'text-slate-500'}`}>
          Colores
          <div className={`mx-auto mt-2 h-0.5 w-6 rounded-full transition-all ${activeTab === 'colors' ? 'bg-primary scale-100' : 'bg-transparent scale-0'}`}></div>
        </button>
        <button 
          onClick={() => setActiveTab('palettes')}
          className={`flex-1 py-5 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'palettes' ? 'text-primary' : 'text-slate-500'}`}>
          Paletas
          <div className={`mx-auto mt-2 h-0.5 w-6 rounded-full transition-all ${activeTab === 'palettes' ? 'bg-primary scale-100' : 'bg-transparent scale-0'}`}></div>
        </button>
      </div>

      <main className="flex-1 p-8 overflow-y-auto pb-16">
        {activeTab === 'colors' ? (
          <div className="grid grid-cols-2 gap-6">
            {savedColors.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-24 opacity-20">
                <span className="material-symbols-outlined text-5xl mb-4">palette</span>
                <p className="text-center font-bold uppercase tracking-widest text-[9px]">Lista vacía</p>
              </div>
            ) : (
              savedColors.map((hex) => (
                <div 
                  key={hex} 
                  onClick={() => handleItemClick(hex)}
                  className="bg-white/[0.02] p-5 rounded-[40px] border border-white/5 flex flex-col gap-4 group relative cursor-pointer active:scale-95 transition-all"
                >
                  <div className="w-full aspect-square rounded-[28px] border border-white/5 shadow-lg" style={{backgroundColor: hex}}></div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono font-bold tracking-tight">{hex}</span>
                    <button onClick={(e) => deleteColor(e, hex)} className="text-slate-600 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {savedPalettes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-20">
                <span className="material-symbols-outlined text-5xl mb-4">layers</span>
                <p className="text-center font-bold uppercase tracking-widest text-[9px]">Lista vacía</p>
              </div>
            ) : (
              savedPalettes.map((p, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleItemClick(p.items[0].color)}
                  className="bg-white/[0.02] p-7 rounded-[48px] border border-white/5 flex flex-col gap-6 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-primary">{p.title}</h3>
                    <button onClick={(e) => deletePalette(e, idx)} className="text-slate-600 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                  <div className="h-16 flex rounded-[20px] overflow-hidden shadow-lg border border-white/5">
                    {p.items.map((item, j) => (
                      <div key={j} className="flex-1" style={{ backgroundColor: item.color }}></div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-background-dark/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center gap-6">
           <div className="size-16 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"></div>
           <p className="text-cloud-light font-semibold tracking-tight">Analizando...</p>
        </div>
      )}
    </div>
  );
};

// Add missing default export
export default SavedScreen;
