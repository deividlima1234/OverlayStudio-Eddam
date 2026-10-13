import { create } from 'zustand';

interface OverlayState {
  // Datos
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homeColor: string;
  awayColor: string;
  homeTextColor: string;
  awayTextColor: string;
  homeLogo: string;
  awayLogo: string;
  
  // Visibilidad global
  isVisible: boolean;
  
  // Alineaciones
  lineupTeamVisible: 'home' | 'away';
  gameMode: '11' | '9' | '7' | '5';
  homeFormation: string;
  awayFormation: string;
  homePlayers: { num: string; name: string }[];
  awayPlayers: { num: string; name: string }[];
  
  // Publicidad
  adTitle: string;
  adSubtitle: string;
  adText: string;
  adPhone: string;
  isAdVisible: boolean;
  adMode: 'loop' | 'static';
  adDurationVisible: number;
  adDurationHidden: number;
  
  // Sello Auspiciador (Superior Derecho)
  sponsorLogo: string;
  isSponsorVisible: boolean;
  
  // Posicionamiento
  adOffsetX: number;
  adOffsetY: number;
  adScale: number;
  sponsorOffsetX: number;
  sponsorOffsetY: number;
  sponsorScale: number;
  
  // Zona 3: Ticker (Cinta Inferior)
  tickerText: string;
  isTickerVisible: boolean;
  tickerOffsetX: number;
  tickerOffsetY: number;
  tickerScale: number;

  // Zona 4: Pop-up Lateral
  popupImage: string;
  popupText: string;
  isPopupVisible: boolean;
  popupOffsetX: number;
  popupOffsetY: number;
  popupScale: number;
  
  // Tiempo
  timerIsRunning: boolean;
  timerElapsed: number; // en segundos
  
  // Animaciones
  isGoalAnim: boolean;
  goalTeam: 'home' | 'away' | null;
  isReplayActive: boolean;
  
  // WS
  ws: WebSocket | null;
  
  // Overlays con Código Personalizado / IA
  customCode: string;
  customTemplate: string;
  customVariables: Record<string, string>;
  overlayType?: string;

  // Acciones
  updateState: (newState: Partial<OverlayState>) => void;
  connectWebSocket: (role: 'studio' | 'renderer', overlayId?: string) => void;
  loadOverlay: (overlayId?: string) => Promise<void>;
  broadcast: (payload: any) => void;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  customCode: '',
  customTemplate: 'reportaje',
  customVariables: {},
  overlayType: 'scoreboard',

  homeName: 'RMD',
  awayName: 'FCB',
  homeScore: 0,
  awayScore: 0,
  homeColor: '#ffffff',
  awayColor: '#e11d48',
  homeTextColor: '#000000',
  awayTextColor: '#ffffff',
  homeLogo: '',
  awayLogo: '',
  
  isVisible: false,
  isReplayActive: false,
  
  lineupTeamVisible: 'home',
  gameMode: '11',
  homeFormation: '4-3-3',
  awayFormation: '4-3-3',
  homePlayers: [
    { num: '1', name: 'PORTERO' },
    { num: '2', name: 'LAT. DER' }, { num: '3', name: 'CEN. DER' }, { num: '4', name: 'CEN. IZQ' }, { num: '5', name: 'LAT. IZQ' },
    { num: '6', name: 'MED. DEF' }, { num: '8', name: 'MED. DER' }, { num: '10', name: 'MED. IZQ' },
    { num: '7', name: 'EXT. DER' }, { num: '11', name: 'EXT. IZQ' }, { num: '9', name: 'DELANTERO' },
    { num: '12', name: 'SUPLENTE' }, { num: '13', name: 'SUPLENTE' }
  ],
  awayPlayers: [
    { num: '1', name: 'PORTERO' },
    { num: '2', name: 'LAT. DER' }, { num: '3', name: 'CEN. DER' }, { num: '4', name: 'CEN. IZQ' }, { num: '5', name: 'LAT. IZQ' },
    { num: '6', name: 'MED. DEF' }, { num: '8', name: 'MED. DER' }, { num: '10', name: 'MED. IZQ' },
    { num: '7', name: 'EXT. DER' }, { num: '11', name: 'EXT. IZQ' }, { num: '9', name: 'DELANTERO' },
    { num: '12', name: 'SUPLENTE' }, { num: '13', name: 'SUPLENTE' }
  ],
  
  adTitle: 'Servicio de Transmisión',
  adSubtitle: 'Profesional',
  adText: 'Contrata la mejor calidad para tu evento',
  adPhone: '51983032706',
  isAdVisible: true,
  adMode: 'loop',
  adDurationVisible: 10,
  adDurationHidden: 20,

  sponsorLogo: '',
  isSponsorVisible: true,

  adOffsetX: 0,
  adOffsetY: 0,
  adScale: 1,
  sponsorOffsetX: 0,
  sponsorOffsetY: 0,
  sponsorScale: 1,

  tickerText: 'GRACIAS POR ACOMPAÑARNOS EN ESTA TRANSMISIÓN EN VIVO • SÍGUENOS EN NUESTRAS REDES SOCIALES',
  isTickerVisible: true,
  tickerOffsetX: 0,
  tickerOffsetY: 0,
  tickerScale: 1,

  popupImage: '',
  popupText: '¡Promoción Especial!',
  isPopupVisible: true,
  popupOffsetX: 0,
  popupOffsetY: 0,
  popupScale: 1,

  timerIsRunning: false,
  timerElapsed: 0,
  
  isGoalAnim: false,
  goalTeam: null,
  ws: null,

  updateState: (newState) => set((state) => ({ ...state, ...newState })),
  
  loadOverlay: async (overlayId = 'default') => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/overlays/${overlayId}`);
      if (res.ok) {
        const data = await res.json();
        const detectedType = data.type || (overlayId.startsWith('ad-') ? 'publicidad' : overlayId === 'liga-pro' ? 'lineup' : (data.settings?.customCode ? 'custom' : 'scoreboard'));
        set((state) => ({ 
          ...state, 
          overlayType: detectedType,
          ...(data.settings || {}) 
        }));
      }
    } catch (e) {
      console.error('Error al cargar overlay:', e);
    }
  },

  broadcast: (payload) => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'UPDATE_OVERLAY', payload }));
    }
  },

  connectWebSocket: (role, overlayId = 'default') => {
    const currentWs = get().ws;
    if (currentWs) {
      if (currentWs.url.endsWith(`/ws/${overlayId}`)) return;
      currentWs.onclose = null; // Evitar que el viejo intente reconectarse
      currentWs.close();
    }

    const baseUrl = import.meta.env.VITE_API_URL?.replace('http', 'ws') || 'ws://localhost:3000';
    const wsUrl = `${baseUrl}/ws/${overlayId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log(`[${role}] Conectado al WebSocket sala: ${overlayId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE_OVERLAY') {
          set((state) => ({ ...state, ...data.payload }));
          
          if (data.payload.triggerGoal && role === 'renderer') {
            set({ isGoalAnim: true, goalTeam: data.payload.triggerGoal });
            setTimeout(() => set({ isGoalAnim: false, goalTeam: null }), 5000);
          }
          if (data.payload.triggerReplay) {
            set({ isReplayActive: true });
            setTimeout(() => set({ isReplayActive: false }), 10000);
          }
        }
      } catch (e) {
        console.error('Error parseando ws:', e);
      }
    };

    ws.onclose = () => {
      console.log(`[${role}] Desconectado de sala ${overlayId}, reconectando...`);
      set({ ws: null });
      setTimeout(() => get().connectWebSocket(role, overlayId), 2000);
    };

    set({ ws });
  }
}));
