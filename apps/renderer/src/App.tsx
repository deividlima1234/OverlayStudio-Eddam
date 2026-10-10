import { useEffect } from 'react';
import { useOverlayStore } from './store/useOverlayStore';

function App() {
  const { homeName, awayName, homeScore, awayScore, homeColor, awayColor, matchTime, isGoalAnim, goalTeam, connectWebSocket } = useOverlayStore();

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      
      {/* Animación gigante de GOAL cuando hay un gol */}
      {isGoalAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative text-center animate-slide-up">
            <h1 
              className="text-9xl font-black italic tracking-tighter uppercase"
              style={{ 
                color: goalTeam === 'home' ? homeColor : awayColor,
                WebkitTextStroke: '3px white',
                textShadow: '0 0 50px rgba(255,255,255,0.5)'
              }}
            >
              ¡GOOOL!
            </h1>
            <h2 className="text-5xl font-bold text-white mt-4 uppercase tracking-widest drop-shadow-xl">
              {goalTeam === 'home' ? homeName : awayName}
            </h2>
          </div>
        </div>
      )}

      {/* Marcador Principal - Top Left */}
      <div className="absolute top-[8%] left-[5%] flex items-start font-sans select-none drop-shadow-2xl animate-fade-in">
        <div className="flex rounded-lg overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.6)] border border-white/10 backdrop-blur-md bg-black/50">
          
          {/* Home */}
          <div className="flex items-center">
            <div className="w-2 h-full" style={{ backgroundColor: homeColor }}></div>
            <div className="px-5 py-2 font-black text-2xl text-white tracking-wider min-w-[90px] text-center">{homeName}</div>
            <div className="px-5 py-2 bg-black/80 font-black text-3xl text-white min-w-[50px] text-center relative overflow-hidden">
              <span className={`relative z-10 transition-transform ${isGoalAnim && goalTeam === 'home' ? 'scale-150 inline-block text-green-400' : ''}`}>
                {homeScore}
              </span>
            </div>
          </div>
          
          {/* Away */}
          <div className="flex items-center">
            <div className="px-5 py-2 bg-black/80 font-black text-3xl text-white min-w-[50px] text-center border-l border-white/10 relative overflow-hidden">
              <span className={`relative z-10 transition-transform ${isGoalAnim && goalTeam === 'away' ? 'scale-150 inline-block text-green-400' : ''}`}>
                {awayScore}
              </span>
            </div>
            <div className="px-5 py-2 font-black text-2xl text-white tracking-wider min-w-[90px] text-center">{awayName}</div>
            <div className="w-2 h-full" style={{ backgroundColor: awayColor }}></div>
          </div>
        </div>

        {/* Clock */}
        <div className="ml-4 flex items-center justify-center px-4 py-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg shadow-xl">
          <span className="font-mono text-xl font-bold text-white tracking-widest">{matchTime}</span>
        </div>
      </div>

    </div>
  );
}

export default App;
