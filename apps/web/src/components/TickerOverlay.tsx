import { useOverlayStore } from '../store/useOverlayStore';

export default function TickerOverlay({ isPreview = false }: { isPreview?: boolean }) {
  const state = useOverlayStore();
  
  // En Preview siempre debe mostrarse. En Live depende del Master Switch y su propio Switch.
  const visible = isPreview || (state.isVisible && state.isTickerVisible);
  
  if (!state.tickerText || !visible) return null;

  return (
    <div 
      className="absolute bottom-0 left-0 w-full z-40 pointer-events-none"
      style={{ transform: `translate(${state.tickerOffsetX}px, ${state.tickerOffsetY}px) scale(${state.tickerScale})`, transformOrigin: 'bottom center' }}
    >
      <div className="w-full bg-[#0a0a0c]/95 border-t border-blue-500/30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] flex items-center overflow-hidden animate-slide-up" style={{ height: '50px' }}>
        
        {/* Etiqueta fija izquierda */}
        <div className="bg-blue-600 h-full flex items-center px-6 relative z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
          <span className="text-white font-black uppercase tracking-widest text-sm whitespace-nowrap">ÚLTIMO MINUTO</span>
          {/* Triángulo de decoración */}
          <div className="absolute -right-4 top-0 w-0 h-0 border-t-[25px] border-t-transparent border-l-[16px] border-l-blue-600 border-b-[25px] border-b-transparent"></div>
        </div>

        {/* Cinta en movimiento */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center mask-image-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-ticker whitespace-nowrap">
            <span className="text-gray-200 font-medium tracking-wider text-xl uppercase px-10">
              {state.tickerText}
            </span>
            <span className="text-gray-200 font-medium tracking-wider text-xl uppercase px-10">
              {state.tickerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
