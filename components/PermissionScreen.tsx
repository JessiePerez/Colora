
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PermissionScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleRequestAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      navigate('/capture');
    } catch (err) {
      alert("Necesitamos acceso a la cámara para detectar colores.");
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark text-white font-display antialiased">
      <div className="absolute top-[-5%] left-[-10%] w-[250px] h-[250px] bg-primary/20 rounded-full blur-[80px]"></div>

      <div className="h-12 w-full"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-10 pb-6 pt-2">
        <div className="relative w-full aspect-square max-w-[300px] mb-12">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl transform scale-75 animate-pulse"></div>
          <div className="relative w-full h-full rounded-[48px] overflow-hidden bg-surface-dark shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 flex items-center justify-center">
             <img 
               src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=600" 
               alt="Abstract Flow" 
               className="w-full h-full object-cover opacity-60" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
             <div className="absolute size-24 border border-white/10 rounded-full backdrop-blur-md bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl font-light">camera</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight leading-none">
            Visión <br/>
            <span className="text-primary italic font-serif">Aumentada</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed font-normal opacity-70 max-w-[240px]">
            Captura la esencia cromática de tu mundo. Requiere acceso a la cámara.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-10 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-10">
        <button 
          onClick={handleRequestAccess}
          className="flex w-full items-center justify-center gap-4 rounded-[24px] sunset-gradient h-16 px-8 text-background-dark font-bold text-base tracking-tight transition-all active:scale-[0.98] shadow-xl">
          <span className="material-symbols-outlined text-[20px]">sensors</span>
          <span>Conectar Cámara</span>
        </button>
        <button 
          onClick={() => navigate('/')}
          className="flex w-full items-center justify-center rounded-2xl h-10 text-slate-500 text-[10px] font-semibold uppercase tracking-widest">
          Ignorar
        </button>
      </div>
    </div>
  );
};

// Add missing default export
export default PermissionScreen;
