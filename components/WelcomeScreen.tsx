
import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background-dark font-display relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[5%] right-[-5%] w-[350px] h-[350px] bg-tech/10 rounded-full blur-[100px]"></div>

      {/* Header Minimalista */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4 w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 sunset-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-background-dark text-[18px] font-bold">palette</span>
          </div>
          <h2 className="text-cloud-light text-lg font-medium tracking-tight">Colora</h2>
        </div>
        <button 
          onClick={() => navigate('/saved')}
          className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] text-cloud-light backdrop-blur-md">
          <span className="material-symbols-outlined">bookmarks</span>
        </button>
      </div>

      {/* Contenido Principal - Usamos flex-1 y overflow-hidden para asegurar que quepa */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 min-h-0">
        <div className="relative w-full aspect-[4/5] max-h-[320px] mb-6 rounded-[48px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)] border border-white/[0.05] group animate-float">
          <img 
            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800" 
            alt="Minimalist Abstract Color" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="size-14 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl font-light">blur_on</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-cloud-light tracking-tight text-3xl font-bold leading-tight">
            Armonía <br/>
            <span className="text-primary italic font-serif">Inspirada.</span>
          </h1>
          <p className="text-tech/60 text-sm font-normal leading-relaxed max-w-[220px] mx-auto">
            Descubre la esencia cromática del mundo con inteligencia artificial.
          </p>
        </div>
      </div>

      {/* Footer / Botón de Inicio - Posicionado para ser visible siempre */}
      <div className="relative z-10 w-full px-8 pb-10 pt-4 shrink-0 mt-auto">
        <button 
          onClick={() => navigate('/permissions')}
          className="group relative w-full h-16 active:scale-[0.98] transition-all">
          <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
          <div className="relative w-full h-full sunset-gradient rounded-[24px] flex items-center justify-center gap-4 text-background-dark shadow-xl">
            <span className="font-semibold text-base">Comenzar Análisis</span>
            <div className="size-8 bg-background-dark/5 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-background-dark text-lg font-bold">arrow_forward</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

// Add missing default export
export default WelcomeScreen;
