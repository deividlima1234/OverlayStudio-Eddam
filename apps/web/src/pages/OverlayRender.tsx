import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOverlayStore } from '../store/useOverlayStore';
import Scoreboard from '../components/Scoreboard';
import Lineup from '../components/Lineup';
import ReplayOverlay from '../components/ReplayOverlay';

export default function OverlayRender() {
  const { id } = useParams<{ id: string }>();
  const state = useOverlayStore();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => setScale(window.innerWidth / 1920);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    if (id) {
      state.connectWebSocket('renderer', id);
      state.loadOverlay(id);
    }
    return () => {
      document.body.style.backgroundColor = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Lógica del Cronómetro local (Renderer)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.timerIsRunning) {
      interval = setInterval(() => {
        state.updateState({ timerElapsed: state.timerElapsed + 1 });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.timerIsRunning, state.timerElapsed, state.updateState]);

  return (
    <div className="w-screen h-screen overflow-hidden font-sans">
      <div className="w-[1920px] h-[1080px] origin-top-left relative" style={{ transform: `scale(${scale})` }}>
        {state.isGoalAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative text-center animate-slide-up">
            <h1 
              className="text-9xl font-black italic tracking-tighter uppercase"
              style={{ 
                color: state.goalTeam === 'home' ? state.homeColor : state.awayColor,
                WebkitTextStroke: '3px white',
                textShadow: '0 0 50px rgba(255,255,255,0.5)'
              }}
            >
              ¡GOOOL!
            </h1>
            <h2 className="text-5xl font-bold text-white mt-4 uppercase tracking-widest drop-shadow-xl">
              {state.goalTeam === 'home' ? state.homeName : state.awayName}
            </h2>
          </div>
        </div>
      )}

      {id === 'liga-pro' ? <Lineup /> : <Scoreboard />}
      
      <ReplayOverlay />
      </div>
    </div>
  );
}
