import { useOverlayStore } from '../store/useOverlayStore';

export default function SponsorOverlay({ isPreview = false }: { isPreview?: boolean }) {
  const state = useOverlayStore();
  
  // The global 'isVisible' acts as a Master switch for EVERYTHING.
  const isMasterVisible = isPreview || state.isVisible;
  
  // If no sponsor logo is set, don't render.
  if (!state.sponsorLogo) return null;
  
  // Si está oculto o el master está apagado, no lo renderizamos.
  if (!isMasterVisible || !state.isSponsorVisible) return null;

  return (
    <div className="absolute top-12 right-12 z-50 pointer-events-none origin-top-right animate-fade-in">
      <div className="w-[300px] h-[300px] bg-black/40 backdrop-blur-md rounded-3xl p-6 border-2 border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden">
        {/* Efecto de brillo detrás del logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
        <img 
          src={state.sponsorLogo} 
          alt="Auspiciador" 
          className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10"
        />
      </div>
    </div>
  );
}
