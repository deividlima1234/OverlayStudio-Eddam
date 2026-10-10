import { useOverlayStore } from '../store/useOverlayStore';

export default function Lineup() {
  const state = useOverlayStore();

  const isHome = state.lineupTeamVisible === 'home';
  const playersData = isHome ? state.homePlayers : state.awayPlayers;
  const teamColor = isHome ? (state.homeColor || '#1d4ed8') : (state.awayColor || '#1d4ed8');
  const textColor = isHome ? (state.homeTextColor || '#ffffff') : (state.awayTextColor || '#ffffff');
  const teamName = isHome ? (state.homeName || 'TEAM NAME') : (state.awayName || 'TEAM NAME');
  const teamLogo = isHome ? state.homeLogo : state.awayLogo;

  // Formación 4-4-2 basada en la imagen
  const positions = [
    { top: '78%', left: '50%' }, // 1 GK
    { top: '60%', left: '80%' }, { top: '63%', left: '60%' }, { top: '63%', left: '40%' }, { top: '60%', left: '20%' }, // Defensas
    { top: '42%', left: '80%' }, { top: '45%', left: '60%' }, { top: '45%', left: '40%' }, { top: '42%', left: '20%' }, // Medios
    { top: '25%', left: '60%' }, { top: '25%', left: '40%' } // Delanteros
  ];

  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${state.isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
      
      <div className="w-[1100px] h-[650px] flex gap-8">
        
        {/* LADO IZQUIERDO: CANCHA */}
        <div className="flex-1 flex flex-col items-center relative">
          
          {/* Header Team Name */}
          <div className="flex items-center self-start ml-12 mb-4 z-20">
            <div className="w-12 h-12 bg-white rounded-l-full rounded-r-none border-4 border-white flex items-center justify-center overflow-hidden z-10 relative">
              {teamLogo ? (
                <img src={teamLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gray-200"></div>
              )}
            </div>
            <div 
              className="h-10 pl-4 pr-8 flex items-center justify-center font-black italic tracking-wider text-xl rounded-r-full -ml-4"
              style={{ backgroundColor: teamColor, color: textColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            >
              {teamName}
            </div>
          </div>

          {/* Cancha en Perspectiva */}
          <div className="relative w-full flex-1 flex items-center justify-center -mt-10">
            <div 
              className="w-[550px] h-[650px] bg-[#168a29] border-4 border-white relative shadow-2xl overflow-hidden"
              style={{ transform: 'perspective(800px) rotateX(50deg)', transformOrigin: 'center center', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
            >
              {/* Franjas del césped */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_60px,rgba(255,255,255,0.05)_60px,rgba(255,255,255,0.05)_120px)]"></div>
              
              {/* Líneas de la cancha */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full border-4 border-white"></div>
              
              {/* Áreas superior e inferior */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[130px] border-4 border-t-0 border-white"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] h-[130px] border-4 border-b-0 border-white"></div>
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[45px] border-4 border-t-0 border-white"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120px] h-[45px] border-4 border-b-0 border-white"></div>

              <div className="absolute top-[130px] left-1/2 -translate-x-1/2 w-[100px] h-[40px] border-4 border-t-0 border-white rounded-b-full"></div>
              <div className="absolute bottom-[130px] left-1/2 -translate-x-1/2 w-[100px] h-[40px] border-4 border-b-0 border-white rounded-t-full"></div>

              {/* Jugadores en la Cancha */}
              {playersData.map((player, idx) => {
                const isGK = idx === 0;
                return (
                  <div 
                    key={idx}
                    className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      top: positions[idx]?.top || '50%', 
                      left: positions[idx]?.left || '50%',
                      animation: state.isVisible ? `fadeScaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.1 + 0.3}s both` : 'none',
                    }}
                  >
                    {/* Contenedor que contrarresta la perspectiva para no afectar la animación */}
                    <div style={{ transform: 'rotateX(-50deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* SVG Camiseta */}
                      <div className="relative w-14 h-14 drop-shadow-xl z-10 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md">
                          <path 
                            d="M 25 15 Q 50 30 75 15 L 95 35 L 82 45 L 75 90 L 25 90 L 18 45 L 5 35 Z" 
                            fill={isGK ? '#ffffff' : teamColor}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                        </svg>
                        <span 
                          className="relative z-10 font-black text-xl mt-2" 
                          style={{ color: isGK ? teamColor : textColor, textShadow: isGK ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)' }}
                        >
                          {player.num}
                        </span>
                      </div>
                      {/* Base oscura / sombra debajo de la camiseta */}
                      <div className="w-16 h-5 bg-[#0a1f44] rounded-[10px] mt-1 z-0 shadow-lg border-b-4 border-[#06122a]"></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* MANAGER BANNER */}
          <div 
            className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex items-center z-20 shadow-2xl"
            style={{ animation: state.isVisible ? `slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.5s both` : 'none' }}
          >
             <div className="bg-[#1d4ed8] text-white px-6 py-2 rounded-l-full font-bold text-sm tracking-wider uppercase">MANAGER</div>
             <div className="bg-white text-[#1d4ed8] px-8 py-2 rounded-r-full font-bold text-sm tracking-wider uppercase border border-l-0 border-gray-200">MANAGER NAME</div>
          </div>
        </div>

        {/* LADO DERECHO: LISTA DE JUGADORES */}
        <div className="w-[380px] flex flex-col pt-8">
          <h2 className="text-white text-5xl font-black italic tracking-tighter uppercase mb-6" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>STARTING XI</h2>
          
          <div className="flex flex-col gap-2">
            {playersData.map((player, idx) => (
              <div 
                key={idx} 
                className="flex h-[32px] w-full"
                style={{
                  animation: state.isVisible ? `slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.1}s both` : 'none',
                }}
              >
                {/* Número */}
                <div 
                  className="w-[50px] h-full flex items-center justify-center font-black italic text-lg z-10"
                  style={{ 
                    backgroundColor: teamColor, 
                    color: textColor,
                    clipPath: 'polygon(15% 0, 100% 0%, 85% 100%, 0% 100%)',
                    transform: 'translateX(10px)'
                  }}
                >
                  {player.num}
                </div>
                
                {/* Nombre */}
                <div 
                  className="flex-1 h-full bg-white flex items-center pl-6 pr-4 shadow-lg"
                  style={{
                    color: '#1d4ed8', // Texto azul oscuro como en la imagen
                    clipPath: 'polygon(5% 0, 100% 0%, 95% 100%, 0% 100%)',
                  }}
                >
                  <span className="font-bold italic uppercase tracking-wide text-sm">{player.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      <style>{`
        @keyframes fadeScaleIn {
          0% { opacity: 0; transform: scale(0) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(100px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          0% { opacity: 0; transform: translate(-50%, 30px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
