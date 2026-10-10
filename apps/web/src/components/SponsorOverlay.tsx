import { useOverlayStore } from '../store/useOverlayStore';

export default function SponsorOverlay({ isPreview = false }: { isPreview?: boolean }) {
  const state = useOverlayStore();
  
  // En Preview siempre debe mostrarse. En Live depende del Master Switch y su propio Switch.
  const visible = isPreview || (state.isVisible && state.isSponsorVisible);
  
  // Si no hay logo o no está visible, no renderizamos.
  if (!state.sponsorLogo || !visible) return null;

  return (
    <div 
      className="absolute top-0 right-0 z-50 pointer-events-none"
      style={{ transform: `translate(${state.sponsorOffsetX}px, ${state.sponsorOffsetY}px) scale(${state.sponsorScale})`, transformOrigin: 'top right' }}
    >
      <div className="w-[300px] h-[300px] origin-top-right animate-fade-in flex items-center justify-center relative overflow-visible">
        <img 
          src={state.sponsorLogo} 
          alt="Auspiciador" 
          className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10"
        />
      </div>
    </div>
  );
}
