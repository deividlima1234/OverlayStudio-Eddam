import { useOverlayStore } from '../store/useOverlayStore';
import { Trophy } from 'lucide-react';

export default function ReplayOverlay() {
  const state = useOverlayStore();

  if (!state.isReplayActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden font-sans">
      
      {/* 1. WATERMARK (Esquina Superior Izquierda) */}
      <div className="absolute top-12 left-12 flex items-center animate-fade-in z-40">
        <div className="bg-[#0f0f11]/90 backdrop-blur-md border border-white/10 p-2 pr-8 rounded-full flex items-center gap-4 shadow-2xl">
          <div className="bg-red-600 text-white font-black italic tracking-widest px-5 py-2 rounded-full animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)] flex items-center gap-3 text-2xl">
            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            REPLAY
          </div>
          <span className="text-white font-bold italic tracking-wider text-2xl text-yellow-500">EDDAMDEV</span>
        </div>
      </div>

      {/* 2. BARRA DE PROGRESO (Base de la pantalla) */}
      <div className="absolute bottom-0 left-0 w-full h-3 bg-black/40 z-40">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 origin-left animate-progress shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
      </div>

      {/* 3. STINGER TRANSITION (El barrido de pantalla inicial) */}
      <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none">
        {/* Fondo diagonal cruzando la pantalla */}
        <div className="absolute w-[150%] h-[150%] top-1/2 -translate-y-1/2 flex items-center justify-center animate-stinger-bg origin-center" style={{ transform: 'translateY(-50%) rotate(-15deg)' }}>
          <div className="w-full h-[600px] bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-y-8 border-white flex items-center justify-center">
            
            <div className="relative z-10 flex items-center gap-10 animate-stinger-content">
              <Trophy className="w-48 h-48 text-black drop-shadow-2xl" strokeWidth={1.5} />
              <div className="flex flex-col text-black">
                <h1 className="text-[120px] font-black italic tracking-tighter uppercase leading-none" style={{ textShadow: '4px 4px 0px white' }}>EDDAMDEV</h1>
                <h2 className="text-6xl font-bold uppercase tracking-widest leading-none mt-2 text-white" style={{ textShadow: '2px 2px 0px black' }}>Instant Replay</h2>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          0%, 10% { opacity: 0; transform: translateX(-40px); }
          15%, 95% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-40px); }
        }
        @keyframes progress {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        @keyframes stinger-bg {
          0% { left: 150%; }
          40%, 60% { left: 50%; transform: translate(-50%, -50%) rotate(-15deg); }
          100% { left: -150%; }
        }
        @keyframes stinger-content {
          0% { opacity: 0; transform: scale(0.5); }
          45%, 55% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        
        .animate-fade-in {
          animation: fade-in 10s ease-in-out forwards;
        }
        .animate-progress {
          animation: progress 10s linear forwards;
        }
        .animate-stinger-bg {
          animation: stinger-bg 1.8s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
        }
        .animate-stinger-content {
          animation: stinger-content 1.8s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
        }
      `}</style>
    </div>
  );
}
