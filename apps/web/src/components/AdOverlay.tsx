import { QRCodeSVG } from 'qrcode.react';
import { useOverlayStore } from '../store/useOverlayStore';

export default function AdOverlay({ isPreview = false }: { isPreview?: boolean }) {
  const state = useOverlayStore();
  const visible = isPreview || state.isAdVisible;

  if (!visible) return null;

  return (
    <div className="absolute bottom-20 left-20 w-[1000px] h-[240px] animate-ad-loop z-50 pointer-events-none origin-bottom-left">
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

      <style>{`
        @keyframes ad-loop {
          0%, 65% { opacity: 0; transform: translateY(50px) scale(0.95); }
          68%, 95% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(50px) scale(0.95); }
        }
        .animate-ad-loop {
          /* Loop de 30 segundos (Oculto 20s, Visible 10s) */
          animation: ad-loop 30s cubic-bezier(0.34,1.56,0.64,1) infinite;
        }
      `}</style>
    </div>
  );
}
