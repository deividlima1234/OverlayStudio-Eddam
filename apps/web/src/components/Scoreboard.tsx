import { useOverlayStore } from '../store/useOverlayStore';

export default function Scoreboard() {
  const state = useOverlayStore();
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center font-sans select-none drop-shadow-2xl text-white w-full max-w-[700px] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-top ${state.isVisible ? 'top-12 scale-100 opacity-100' : '-top-20 scale-95 opacity-0 pointer-events-none'}`}>
      
      {/* LIVE Tab */}
      <div className="bg-[#cc0000] text-white text-[11px] font-bold px-8 py-1 rounded-t-lg tracking-widest uppercase shadow-md z-0 -mb-1">
        LIVE
      </div>

      {/* Main Bar */}
      <div className="flex items-stretch h-[60px] shadow-2xl relative z-10 w-full justify-center">
        
        {/* Left Wing (Team 1) */}
        <div 
          className="flex items-center justify-between px-2 w-[220px] rounded-l-full relative"
          style={{ backgroundColor: state.homeColor, color: state.homeTextColor }}
        >
          {/* Logo */}
          <div className="h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-inner shrink-0">
            {state.homeLogo ? (
              <img src={state.homeLogo} alt="Home" className="w-full h-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            )}
          </div>
          
          {/* Name */}
          <span className="font-bold text-2xl uppercase tracking-wider pr-4 truncate flex-1 text-right">
            {state.homeName}
          </span>
        </div>

        {/* Center Score */}
        <div className="bg-[#1f2022] flex items-center justify-center px-6 min-w-[140px] relative z-20 border-x-4 border-black/40 shadow-2xl" style={{ transform: 'skew(-12deg)' }}>
          <div className="flex items-center justify-center gap-3 text-5xl font-black tracking-tighter" style={{ transform: 'skew(12deg)' }}>
             <span className={`w-[45px] text-center ${state.isGoalAnim && state.goalTeam === 'home' ? 'text-green-400 scale-125 transition-transform' : ''}`}>
               {state.homeScore}
             </span>
             <span className="text-gray-400 text-3xl pb-2">-</span>
             <span className={`w-[45px] text-center ${state.isGoalAnim && state.goalTeam === 'away' ? 'text-green-400 scale-125 transition-transform' : ''}`}>
               {state.awayScore}
             </span>
          </div>
        </div>

        {/* Right Wing (Team 2) */}
        <div 
          className="flex items-center justify-between px-2 w-[220px] rounded-r-full relative"
          style={{ backgroundColor: state.awayColor, color: state.awayTextColor }}
        >
          {/* Name */}
          <span className="font-bold text-2xl uppercase tracking-wider pl-4 truncate flex-1 text-left">
            {state.awayName}
          </span>

          {/* Logo */}
          <div className="h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-inner shrink-0">
            {state.awayLogo ? (
              <img src={state.awayLogo} alt="Away" className="w-full h-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            )}
          </div>
        </div>
      </div>

      {/* TIME Tab */}
      <div className="bg-[#cc0000] text-white text-xl font-bold px-12 py-1.5 rounded-b-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-0 -mt-1 relative">
        {formatTime(state.timerElapsed)}
      </div>
    </div>
  );
}
