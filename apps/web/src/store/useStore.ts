import { create } from 'zustand';

interface StudioState {
  activeOverlayId: string | null;
  setActiveOverlay: (id: string | null) => void;
  // TODO: Expandir con el estado visual del overlay (colores, textos, etc)
}

export const useStore = create<StudioState>((set) => ({
  activeOverlayId: null,
  setActiveOverlay: (id) => set({ activeOverlayId: id }),
}));
