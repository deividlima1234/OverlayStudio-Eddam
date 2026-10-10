import { create } from 'zustand';

interface OverlayState {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homeColor: string;
  awayColor: string;
  matchTime: string;
  isGoalAnim: boolean;
  goalTeam: 'home' | 'away' | null;
  updateState: (newState: Partial<OverlayState>) => void;
  connectWebSocket: () => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  homeName: 'RMD',
  awayName: 'FCB',
  homeScore: 0,
  awayScore: 0,
  homeColor: '#ffffff',
  awayColor: '#e11d48',
  matchTime: '45:00',
  isGoalAnim: false,
  goalTeam: null,
  updateState: (newState) => set((state) => ({ ...state, ...newState })),
  connectWebSocket: () => {
    const wsUrl = import.meta.env.VITE_API_URL?.replace('http', 'ws') || 'ws://localhost:3000/ws';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE_OVERLAY') {
          set((state) => ({ ...state, ...data.payload }));
          
          // Manejar animación de gol especial
          if (data.payload.triggerGoal) {
            set({ isGoalAnim: true, goalTeam: data.payload.triggerGoal });
            setTimeout(() => set({ isGoalAnim: false, goalTeam: null }), 5000);
          }
        }
      } catch (e) {
        console.error('Error parseando mensaje WebSocket:', e);
      }
    };
    
    ws.onclose = () => {
      setTimeout(() => set((state) => { state.connectWebSocket(); return state; }), 3000);
    };
  }
}));
