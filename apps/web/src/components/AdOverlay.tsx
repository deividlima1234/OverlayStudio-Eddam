import { QRCodeSVG } from 'qrcode.react';
import { useOverlayStore } from '../store/useOverlayStore';

export default function AdOverlay({ isPreview = false }: { isPreview?: boolean }) {
  const state = useOverlayStore();
  // Para que el Master Switch funcione, si isVisible es false (oculto maestro), no mostramos nada, a menos que sea en Preview.
  const isMasterVisible = isPreview || state.isVisible;
  const visible = isMasterVisible && state.isAdVisible;

  if (!visible) return null;

  const totalTime = state.adDurationVisible + state.adDurationHidden;
  const hiddenPct = (state.adDurationHidden / totalTime) * 100;
  const inEndPct = Math.min(hiddenPct + 3, 99);
  const outStartPct = 97;

  return (
    <div className={`absolute bottom-20 left-20 w-[1000px] h-[240px] z-50 pointer-events-none origin-bottom-left ${state.adMode === 'loop' ? 'animate-ad-loop' : 'animate-slide-up'}`}>
      <div className="w-full h-full bg-[#0f0f11]/90 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] flex overflow-hidden">
        
        {/* Decoración lateral brillante */}
        <div className="w-3 h-full bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-pulse"></div>
        
        {/* Contenido Textual */}
        <div className="flex-1 p-8 flex flex-col justify-center gap-2">
          <h2 className="text-5xl font-black italic text-white uppercase tracking-wider leading-none drop-shadow-md">
            {state.adTitle}
          </h2>
          <h3 className="text-4xl font-bold text-blue-400 uppercase tracking-widest leading-none drop-shadow-md">
            {state.adSubtitle}
          </h3>
          <p className="text-gray-300 font-medium mt-2 text-xl tracking-wide">
            {state.adText}
          </p>
        </div>
        
        {/* Separador */}
        <div className="w-px h-[80%] my-auto bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"></div>

        {/* QR Code */}
        <div className="w-[240px] h-full flex flex-col items-center justify-center p-4 relative bg-blue-950/30">
          <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-blue-500/50">
            <QRCodeSVG 
              value={`https://wa.me/${state.adPhone.replace(/[^0-9]/g, '')}`}
              size={160} 
              level="H" 
              includeMargin={false}
              fgColor="#0f0f11"
            />
          </div>
          <span className="text-sm font-bold text-blue-300 mt-3 tracking-widest uppercase">Escanéame</span>
        </div>
      </div>

      {state.adMode === 'loop' && (
        <style>{`
          @keyframes ad-loop {
            0%, ${hiddenPct}% { opacity: 0; transform: translateY(50px) scale(0.95); }
            ${inEndPct}%, ${outStartPct}% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(50px) scale(0.95); }
          }
          .animate-ad-loop {
            animation: ad-loop ${totalTime}s cubic-bezier(0.34,1.56,0.64,1) infinite;
          }
        `}</style>
      )}
    </div>
  );
}
