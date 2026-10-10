import { useOverlayStore } from '../store/useOverlayStore';

export default function PopupOverlay({ isPreview = false }: { isPreview?: boolean }) {
  const state = useOverlayStore();
  
  // En Preview siempre debe mostrarse. En Live depende del Master Switch y su propio Switch.
  const visible = isPreview || (state.isVisible && state.isPopupVisible);
  
  if (!visible) return null;

  return (
    <div 
      className="absolute top-1/2 right-0 -translate-y-1/2 z-40 pointer-events-none"
      style={{ transform: `translate(calc(0px + ${state.popupOffsetX}px), calc(-50% + ${state.popupOffsetY}px)) scale(${state.popupScale})`, transformOrigin: 'right center' }}
    >
      <div className="bg-[#0f0f11]/90 backdrop-blur-xl border border-blue-500/40 rounded-l-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex items-center p-4 gap-4 animate-slide-left border-r-0">
        
        {/* Decoración lateral brillante (ahora a la derecha para contrastar) */}
        <div className="absolute right-0 top-0 w-2 h-full bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-pulse"></div>
        
        {/* Imagen del Popup */}
        {state.popupImage && (
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg bg-black/50 p-1">
            <img src={state.popupImage} alt="Popup" className="w-full h-full object-cover rounded-lg" />
          </div>
        )}

        {/* Contenido Textual */}
        <div className="flex flex-col justify-center max-w-[250px] mr-2">
          {state.popupText && (
            <p className="text-white font-bold text-lg leading-tight drop-shadow-md">
              {state.popupText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
