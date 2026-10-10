import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Minus, Trophy, Link as LinkIcon, Settings, Play, Square, RotateCcw, ChevronDown, ChevronUp, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { useOverlayStore } from '../store/useOverlayStore';
import Scoreboard from '../components/Scoreboard';
import Lineup from '../components/Lineup';
import ReplayOverlay from '../components/ReplayOverlay';
import AdOverlay from '../components/AdOverlay';
import SponsorOverlay from '../components/SponsorOverlay';
import TickerOverlay from '../components/TickerOverlay';
import PopupOverlay from '../components/PopupOverlay';

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const state = useOverlayStore();
  const [activeTab, setActiveTab] = useState<'controles' | 'personalizar' | 'jugadores'>('controles');
  
  const [openSection, setOpenSection] = useState<'home' | 'away' | null>('home');

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Obtenemos el ancho del contenedor padre y lo dividimos por 1920 para que el lienzo encaje siempre perfecto
        const width = containerRef.current.clientWidth;
        // Restamos un poco de padding (32px por lado = 64px)
        setScale(Math.min((width - 64) / 1920, 1)); 
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (id) {
      state.connectWebSocket('studio', id);
      state.loadOverlay(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.timerIsRunning) {
      interval = setInterval(() => {
        state.updateState({ timerElapsed: state.timerElapsed + 1 });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.timerIsRunning, state.timerElapsed, state.updateState]);

  const updateField = (field: string, value: any) => {
    state.updateState({ [field]: value });
    state.broadcast({ [field]: value });
  };

  const triggerGoal = (team: 'home' | 'away') => {
    const newScore = team === 'home' ? state.homeScore + 1 : state.awayScore + 1;
    updateField(team === 'home' ? 'homeScore' : 'awayScore', newScore);
    state.broadcast({ triggerGoal: team });
  };

  const triggerReplay = () => {
    state.updateState({ isReplayActive: true });
    state.broadcast({ triggerReplay: true });
    setTimeout(() => {
      state.updateState({ isReplayActive: false });
    }, 10000);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, team: 'home' | 'away') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField(team === 'home' ? 'homeLogo' : 'awayLogo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const overlayId = id || 'default';
      
      const response = await fetch(`${baseUrl}/api/overlays/${overlayId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            isVisible: state.isVisible,
            homeName: state.homeName,
            awayName: state.awayName,
            homeScore: state.homeScore,
            awayScore: state.awayScore,
            homeColor: state.homeColor,
            awayColor: state.awayColor,
            homeTextColor: state.homeTextColor,
            awayTextColor: state.awayTextColor,
            homeLogo: state.homeLogo,
            awayLogo: state.awayLogo,
            lineupTeamVisible: state.lineupTeamVisible,
            gameMode: state.gameMode,
            homeFormation: state.homeFormation,
            awayFormation: state.awayFormation,
            homePlayers: state.homePlayers,
            awayPlayers: state.awayPlayers,
            
            // Publicidad
            adTitle: state.adTitle,
            adSubtitle: state.adSubtitle,
            adText: state.adText,
            adPhone: state.adPhone,
            isAdVisible: state.isAdVisible,
            adMode: state.adMode,
            adDurationVisible: state.adDurationVisible,
            adDurationHidden: state.adDurationHidden,

            sponsorLogo: state.sponsorLogo,
            isSponsorVisible: state.isSponsorVisible,

            adOffsetX: state.adOffsetX,
            adOffsetY: state.adOffsetY,
            adScale: state.adScale,
            sponsorOffsetX: state.sponsorOffsetX,
            sponsorOffsetY: state.sponsorOffsetY,
            sponsorScale: state.sponsorScale,

            tickerText: state.tickerText,
            isTickerVisible: state.isTickerVisible,
            tickerOffsetX: state.tickerOffsetX,
            tickerOffsetY: state.tickerOffsetY,
            tickerScale: state.tickerScale,

            popupImage: state.popupImage,
            popupText: state.popupText,
            isPopupVisible: state.isPopupVisible,
            popupOffsetX: state.popupOffsetX,
            popupOffsetY: state.popupOffsetY,
            popupScale: state.popupScale,
          }
        })
      });

      if (!response.ok) throw new Error('Error al guardar');
      alert('¡Overlay guardado correctamente en la Base de Datos!');
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background font-sans">
      <aside className="w-full lg:w-[450px] h-[45vh] lg:h-full border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col shrink-0 animate-slide-up z-10 shadow-2xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-surfaceHover rounded-lg transition-colors text-textMuted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm">Panel de Control</span>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`btn-primary px-3 py-1.5 text-sm flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        <div className="flex border-b border-border">
          <button 
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'controles' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}
            onClick={() => setActiveTab('controles')}
          >
            Controles
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'personalizar' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}
            onClick={() => setActiveTab('personalizar')}
          >
            <Settings className="w-4 h-4" /> Personalizar
          </button>
          {id === 'liga-pro' && (
            <button 
              className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'jugadores' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}
              onClick={() => setActiveTab('jugadores')}
            >
              Jugadores
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'controles' ? (
            <>
              {/* Visibilidad Global */}
              <section className="card p-5 bg-surfaceHover border-white/5 shadow-md flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-1">
                    {id?.startsWith('ad-') ? 'Estado de la Publicidad' : 'Estado del Marcador'}
                  </h3>
                  <p className="text-xs text-textMuted/70">
                    {id?.startsWith('ad-') ? 'Oculta la publicidad en vivo.' : 'Oculta para cambiar equipos sin que se vea en vivo.'}
                  </p>
                </div>
                <button 
                  onClick={() => updateField('isVisible', !state.isVisible)}
                  className={`py-2 px-6 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 ${
                    state.isVisible
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50' 
                      : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/50'
                  }`}
                >
                  {state.isVisible ? <><EyeOff className="w-5 h-5"/> Ocultar MASTER</> : <><Eye className="w-5 h-5"/> Mostrar MASTER</>}
                </button>
              </section>

              {/* CONTROLES DE PUBLICIDAD */}
              {id?.startsWith('ad-') && (
                <section className="space-y-4">
                  {/* SELLO DEL AUSPICIADOR */}
                  <div className="card p-5 bg-surfaceHover border-blue-500/20 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Sello Superior (Auspiciador)
                      </h3>
                      <button 
                        onClick={() => updateField('isSponsorVisible', !state.isSponsorVisible)}
                        className={`text-[10px] px-2 py-1 rounded font-bold ${state.isSponsorVisible ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                      >
                        {state.isSponsorVisible ? <><Eye className="w-3 h-3 inline mr-1" /> Visible</> : <><EyeOff className="w-3 h-3 inline mr-1" /> Oculto</>}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {state.sponsorLogo ? (
                        <img src={state.sponsorLogo} alt="Sponsor" className="w-16 h-16 object-contain bg-black/50 p-1 rounded-lg border border-white/10" />
                      ) : (
                        <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                          <ImageIcon className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="sponsorLogoInput" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateField('sponsorLogo', reader.result);
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                      <label htmlFor="sponsorLogoInput" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors text-white">
                        Subir Imagen
                      </label>
                    </div>

                    {/* Mandos de Posición */}
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Posición Horizontal (X)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{state.sponsorOffsetX}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" value={state.sponsorOffsetX} onChange={(e) => updateField('sponsorOffsetX', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Posición Vertical (Y)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{state.sponsorOffsetY}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" value={state.sponsorOffsetY} onChange={(e) => updateField('sponsorOffsetY', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Tamaño (Escala)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{Math.round(state.sponsorScale * 100)}%</span>
                        </div>
                        <input type="range" min="0.1" max="3" step="0.05" value={state.sponsorScale} onChange={(e) => updateField('sponsorScale', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-5 bg-surfaceHover border-blue-500/20 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Banner Inferior
                      </h3>
                      <button 
                        onClick={() => updateField('isAdVisible', !state.isAdVisible)}
                        className={`text-[10px] px-2 py-1 rounded font-bold ${state.isAdVisible ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                      >
                        {state.isAdVisible ? <><Eye className="w-3 h-3 inline mr-1" /> Visible</> : <><EyeOff className="w-3 h-3 inline mr-1" /> Oculto</>}
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Título Principal</label>
                        <input type="text" value={state.adTitle} onChange={(e) => updateField('adTitle', e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Subtítulo (Resaltado)</label>
                        <input type="text" value={state.adSubtitle} onChange={(e) => updateField('adSubtitle', e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Descripción</label>
                        <input type="text" value={state.adText} onChange={(e) => updateField('adText', e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-textMuted mb-1 block">WhatsApp (Solo números con código de país)</label>
                        <input type="text" value={state.adPhone} onChange={(e) => updateField('adPhone', e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-white" placeholder="51983032706" />
                      </div>
                    </div>

                    {/* Mandos de Posición */}
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Posición Horizontal (X)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{state.adOffsetX}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" value={state.adOffsetX} onChange={(e) => updateField('adOffsetX', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Posición Vertical (Y)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{state.adOffsetY}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" value={state.adOffsetY} onChange={(e) => updateField('adOffsetY', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Tamaño (Escala)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{Math.round(state.adScale * 100)}%</span>
                        </div>
                        <input type="range" min="0.1" max="3" step="0.05" value={state.adScale} onChange={(e) => updateField('adScale', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* CINTA INFERIOR (TICKER) */}
                  <div className="card p-5 bg-surfaceHover border-blue-500/20 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Cinta Inferior (Ticker)
                      </h3>
                      <button 
                        onClick={() => updateField('isTickerVisible', !state.isTickerVisible)}
                        className={`text-[10px] px-2 py-1 rounded font-bold ${state.isTickerVisible ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                      >
                        {state.isTickerVisible ? <><Eye className="w-3 h-3 inline mr-1" /> Visible</> : <><EyeOff className="w-3 h-3 inline mr-1" /> Oculto</>}
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Texto de Noticias/Agradecimientos</label>
                        <input type="text" value={state.tickerText} onChange={(e) => updateField('tickerText', e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-white" />
                      </div>
                    </div>
                    {/* Mandos de Posición */}
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Posición Horizontal (X)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{state.tickerOffsetX}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" value={state.tickerOffsetX} onChange={(e) => updateField('tickerOffsetX', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Posición Vertical (Y)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{state.tickerOffsetY}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" value={state.tickerOffsetY} onChange={(e) => updateField('tickerOffsetY', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Tamaño (Escala)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{Math.round(state.tickerScale * 100)}%</span>
                        </div>
                        <input type="range" min="0.1" max="3" step="0.05" value={state.tickerScale} onChange={(e) => updateField('tickerScale', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* POP-UP LATERAL */}
                  <div className="card p-5 bg-surfaceHover border-blue-500/20 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Pop-up Lateral (Promo)
                      </h3>
                      <button 
                        onClick={() => updateField('isPopupVisible', !state.isPopupVisible)}
                        className={`text-[10px] px-2 py-1 rounded font-bold ${state.isPopupVisible ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                      >
                        {state.isPopupVisible ? <><Eye className="w-3 h-3 inline mr-1" /> Visible</> : <><EyeOff className="w-3 h-3 inline mr-1" /> Oculto</>}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      {state.popupImage ? (
                        <img src={state.popupImage} alt="Popup" className="w-16 h-16 object-cover bg-black/50 p-1 rounded-lg border border-white/10" />
                      ) : (
                        <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                          <ImageIcon className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="popupImageInput" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateField('popupImage', reader.result);
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                      <label htmlFor="popupImageInput" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors text-white">
                        Subir Imagen
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Texto de la Promoción</label>
                        <input type="text" value={state.popupText} onChange={(e) => updateField('popupText', e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-white" />
                      </div>
                    </div>

                    {/* Mandos de Posición */}
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Posición Horizontal (X)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{state.popupOffsetX}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" value={state.popupOffsetX} onChange={(e) => updateField('popupOffsetX', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Posición Vertical (Y)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{state.popupOffsetY}px</span>
                        </div>
                        <input type="range" min="-1000" max="1000" value={state.popupOffsetY} onChange={(e) => updateField('popupOffsetY', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-textMuted">
                          <span>Tamaño (Escala)</span>
                          <span className="font-mono bg-black/50 px-1 rounded">{Math.round(state.popupScale * 100)}%</span>
                        </div>
                        <input type="range" min="0.1" max="3" step="0.05" value={state.popupScale} onChange={(e) => updateField('popupScale', Number(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {!id?.startsWith('ad-') && (
                <>

              {id !== 'liga-pro' && (
                <section className="card p-5 bg-surfaceHover border-white/5 shadow-md">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-4">Reloj de Juego</h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-5xl font-mono font-black text-white bg-black/50 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                      {formatTime(state.timerElapsed)}
                    </div>
                    <div className="flex w-full gap-2">
                      {!state.timerIsRunning ? (
                        <button onClick={() => updateField('timerIsRunning', true)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <Play className="w-4 h-4" /> Jugar
                        </button>
                      ) : (
                        <button onClick={() => updateField('timerIsRunning', false)} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <Square className="w-4 h-4" /> Pausar
                        </button>
                      )}
                      <button onClick={() => updateField('timerElapsed', 0)} className="bg-surface border border-border hover:bg-surfaceHover text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Reset
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {id === 'liga-pro' ? (
                <section className="card p-5 bg-surfaceHover border-white/5 shadow-md">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-4">Equipo a Mostrar en Pantalla</h3>
                  <div className="flex gap-2">
                    <button onClick={() => updateField('lineupTeamVisible', 'home')} className={`flex-1 py-2 rounded font-bold ${state.lineupTeamVisible === 'home' ? 'bg-primary text-white' : 'bg-white/10 text-textMuted hover:bg-white/20'}`}>Local ({state.homeName})</button>
                    <button onClick={() => updateField('lineupTeamVisible', 'away')} className={`flex-1 py-2 rounded font-bold ${state.lineupTeamVisible === 'away' ? 'bg-primary text-white' : 'bg-white/10 text-textMuted hover:bg-white/20'}`}>Visitante ({state.awayName})</button>
                  </div>
                </section>
              ) : (
                <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted flex items-center gap-2">
                    <Trophy className="w-4 h-4"/> Marcador
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 space-y-3 bg-surfaceHover border-primary/20 shadow-md">
                      <div className="text-xs text-textMuted font-bold text-center">LOCAL ({state.homeName})</div>
                      <div className="flex items-center justify-between bg-background rounded-lg p-1 border border-border">
                        <button onClick={() => updateField('homeScore', Math.max(0, state.homeScore - 1))} className="p-3 hover:text-primary transition-colors"><Minus className="w-5 h-5"/></button>
                        <span className="font-bold text-3xl">{state.homeScore}</span>
                        <button onClick={() => updateField('homeScore', state.homeScore + 1)} className="p-3 hover:text-primary transition-colors"><Plus className="w-5 h-5"/></button>
                      </div>
                      <button onClick={() => triggerGoal('home')} className="w-full btn-primary bg-green-600 hover:bg-green-500 py-2 text-sm font-bold shadow-lg shadow-green-900/50">¡GOL LOCAL!</button>
                    </div>

                    <div className="card p-4 space-y-3 bg-surfaceHover border-red-500/20 shadow-md">
                      <div className="text-xs text-textMuted font-bold text-center">VISITANTE ({state.awayName})</div>
                      <div className="flex items-center justify-between bg-background rounded-lg p-1 border border-border">
                        <button onClick={() => updateField('awayScore', Math.max(0, state.awayScore - 1))} className="p-3 hover:text-red-500 transition-colors"><Minus className="w-5 h-5"/></button>
                        <span className="font-bold text-3xl">{state.awayScore}</span>
                        <button onClick={() => updateField('awayScore', state.awayScore + 1)} className="p-3 hover:text-red-500 transition-colors"><Plus className="w-5 h-5"/></button>
                      </div>
                      <button onClick={() => triggerGoal('away')} className="w-full btn-primary bg-red-600 hover:bg-red-500 py-2 text-sm font-bold shadow-lg shadow-red-900/50">¡GOL VISITANTE!</button>
                    </div>
                  </div>
                  
                  {/* Botón Especial: Replay / Destacado */}
                  <div className="card p-4 bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border-yellow-500/30 shadow-lg">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-500 mb-3 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Efecto Destacado
                    </h3>
                    <button 
                      onClick={triggerReplay}
                      disabled={state.isReplayActive}
                      className={`w-full py-3 rounded-lg font-bold italic tracking-widest text-lg uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${state.isReplayActive ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:to-yellow-500 text-black border-2 border-yellow-400 hover:scale-[1.02]'}`}
                    >
                      <Trophy className="w-5 h-5" />
                      {state.isReplayActive ? 'Reproduciendo...' : 'Lanzar Replay'}
                    </button>
                  </div>
                </section>
              )}
              </>
            )}
            </>
          ) : activeTab === 'personalizar' ? (
            id?.startsWith('ad-') ? (
              <div className="space-y-4">
                <div className="card p-5 bg-surfaceHover border-white/5 shadow-md">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Comportamiento de Animación
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-textMuted mb-2 block">Modo de Publicidad</label>
                      <div className="flex gap-2">
                        <button onClick={() => updateField('adMode', 'loop')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors ${state.adMode === 'loop' ? 'bg-primary text-white' : 'bg-background border border-border text-textMuted hover:text-white'}`}>Loop Automático</button>
                        <button onClick={() => updateField('adMode', 'static')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors ${state.adMode === 'static' ? 'bg-primary text-white' : 'bg-background border border-border text-textMuted hover:text-white'}`}>Estático (Siempre visible)</button>
                      </div>
                    </div>
                    
                    {state.adMode === 'loop' && (
                      <>
                        <div>
                          <label className="text-xs text-textMuted mb-1 block">Tiempo Oculto (segundos)</label>
                          <input type="number" min="5" value={state.adDurationHidden} onChange={(e) => updateField('adDurationHidden', Number(e.target.value) || 20)} className="w-full bg-background border border-border rounded-lg p-2 text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-textMuted mb-1 block">Tiempo Visible en Pantalla (segundos)</label>
                          <input type="number" min="5" value={state.adDurationVisible} onChange={(e) => updateField('adDurationVisible', Number(e.target.value) || 10)} className="w-full bg-background border border-border rounded-lg p-2 text-white" />
                        </div>
                        <p className="text-[10px] text-textMuted/60 leading-tight">Nota: Los tiempos aplican un ciclo. Ejemplo: Oculto 20s, Visible 10s = Ciclo total de 30 segundos.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="card overflow-hidden bg-surfaceHover border border-white/10 shadow-lg">
                <button 
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  onClick={() => setOpenSection(openSection === 'home' ? null : 'home')}
                >
                  <span className="font-semibold text-sm">Equipo 1 (Local)</span>
                  {openSection === 'home' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {openSection === 'home' && (
                  <div className="p-4 pt-0 space-y-4 border-t border-white/5 mt-2 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-textMuted w-1/3">Nombre</label>
                      <input type="text" className="input-field w-2/3 uppercase font-bold" value={state.homeName} onChange={(e) => updateField('homeName', e.target.value.toUpperCase())} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-textMuted w-1/3">Logotipo</label>
                      <div className="w-2/3 flex gap-2">
                        {state.homeLogo ? (
                          <img src={state.homeLogo} alt="Logo" className="w-10 h-10 object-contain bg-white rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white/50" /></div>
                        )}
                        <input type="file" accept="image/*" id="homeLogoInput" className="hidden" onChange={(e) => handleLogoUpload(e, 'home')} />
                        <label htmlFor="homeLogoInput" className="btn-secondary flex-1 flex items-center justify-center cursor-pointer text-xs">Subir Logo</label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-textMuted w-1/3">Color del texto</label>
                      <div className="w-2/3 flex gap-2">
                        <input type="color" className="w-10 h-10 rounded cursor-pointer border-0 p-0" value={state.homeTextColor} onChange={(e) => updateField('homeTextColor', e.target.value)} />
                        <input type="text" className="input-field flex-1 font-mono text-xs uppercase" value={state.homeTextColor} onChange={(e) => updateField('homeTextColor', e.target.value)} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-textMuted w-1/3">Color de fondo</label>
                      <div className="w-2/3 flex gap-2">
                        <input type="color" className="w-10 h-10 rounded cursor-pointer border-0 p-0" value={state.homeColor} onChange={(e) => updateField('homeColor', e.target.value)} />
                        <input type="text" className="input-field flex-1 font-mono text-xs uppercase" value={state.homeColor} onChange={(e) => updateField('homeColor', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card overflow-hidden bg-surfaceHover border border-white/10 shadow-lg">
                <button 
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  onClick={() => setOpenSection(openSection === 'away' ? null : 'away')}
                >
                  <span className="font-semibold text-sm">Equipo 2 (Visitante)</span>
                  {openSection === 'away' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {openSection === 'away' && (
                  <div className="p-4 pt-0 space-y-4 border-t border-white/5 mt-2 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-textMuted w-1/3">Nombre</label>
                      <input type="text" className="input-field w-2/3 uppercase font-bold" value={state.awayName} onChange={(e) => updateField('awayName', e.target.value.toUpperCase())} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-textMuted w-1/3">Logotipo</label>
                      <div className="w-2/3 flex gap-2">
                        {state.awayLogo ? (
                          <img src={state.awayLogo} alt="Logo" className="w-10 h-10 object-contain bg-white rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white/50" /></div>
                        )}
                        <input type="file" accept="image/*" id="awayLogoInput" className="hidden" onChange={(e) => handleLogoUpload(e, 'away')} />
                        <label htmlFor="awayLogoInput" className="btn-secondary flex-1 flex items-center justify-center cursor-pointer text-xs">Subir Logo</label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-textMuted w-1/3">Color del texto</label>
                      <div className="w-2/3 flex gap-2">
                        <input type="color" className="w-10 h-10 rounded cursor-pointer border-0 p-0" value={state.awayTextColor} onChange={(e) => updateField('awayTextColor', e.target.value)} />
                        <input type="text" className="input-field flex-1 font-mono text-xs uppercase" value={state.awayTextColor} onChange={(e) => updateField('awayTextColor', e.target.value)} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-textMuted w-1/3">Color de fondo</label>
                      <div className="w-2/3 flex gap-2">
                        <input type="color" className="w-10 h-10 rounded cursor-pointer border-0 p-0" value={state.awayColor} onChange={(e) => updateField('awayColor', e.target.value)} />
                        <input type="text" className="input-field flex-1 font-mono text-xs uppercase" value={state.awayColor} onChange={(e) => updateField('awayColor', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
            )
          ) : activeTab === 'jugadores' ? (
            <div className="space-y-4">
              
              <div className="card p-4 bg-surfaceHover border border-white/5 space-y-3 shadow-md">
                <label className="text-xs text-textMuted block font-bold uppercase tracking-wider">Modalidad de Juego (Ambos Equipos)</label>
                <select 
                  className="input-field w-full text-sm font-bold bg-background border-border"
                  value={state.gameMode}
                  onChange={(e) => updateField('gameMode', e.target.value as any)}
                >
                  <option value="11">Fútbol 11 (11 Jugadores)</option>
                  <option value="9">Fútbol 9 (9 Jugadores)</option>
                  <option value="7">Fútbol 7 (7 Jugadores)</option>
                  <option value="5">Fútbol 5 / Futsal (5 Jugadores)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-surfaceHover p-1 rounded-lg">
                <button 
                  onClick={() => updateField('lineupTeamVisible', 'home')} 
                  className={`flex-1 py-2 rounded font-bold text-xs uppercase transition-colors ${state.lineupTeamVisible === 'home' ? 'bg-primary text-white shadow-lg' : 'text-textMuted hover:text-white'}`}
                >
                  Local ({state.homeName})
                </button>
                <button 
                  onClick={() => updateField('lineupTeamVisible', 'away')} 
                  className={`flex-1 py-2 rounded font-bold text-xs uppercase transition-colors ${state.lineupTeamVisible === 'away' ? 'bg-primary text-white shadow-lg' : 'text-textMuted hover:text-white'}`}
                >
                  Visitante ({state.awayName})
                </button>
              </div>

              <div className="card p-4 bg-surfaceHover border border-white/5 space-y-3 shadow-md">
                <label className="text-xs text-textMuted block font-bold uppercase tracking-wider">Formación Táctica ({state.lineupTeamVisible === 'home' ? 'Local' : 'Visitante'})</label>
                <select
                  className="input-field w-full text-sm font-bold bg-background border-border"
                  value={state.lineupTeamVisible === 'home' ? state.homeFormation : state.awayFormation}
                  onChange={(e) => updateField(state.lineupTeamVisible === 'home' ? 'homeFormation' : 'awayFormation', e.target.value)}
                >
                  {state.gameMode === '11' && (
                    <>
                      <option value="4-3-3">4-3-3 (Ofensiva)</option>
                      <option value="4-4-2">4-4-2 (Clásica)</option>
                      <option value="3-5-2">3-5-2 (Carrileros)</option>
                      <option value="4-2-3-1">4-2-3-1 (Equilibrada)</option>
                    </>
                  )}
                  {state.gameMode === '9' && (
                    <>
                      <option value="3-3-2">3-3-2 (Ofensiva)</option>
                      <option value="3-2-3">3-2-3 (Ataque total)</option>
                      <option value="4-3-1">4-3-1 (Defensiva)</option>
                    </>
                  )}
                  {state.gameMode === '7' && (
                    <>
                      <option value="3-2-1">3-2-1 (Clásica)</option>
                      <option value="2-3-1">2-3-1 (Ofensiva)</option>
                      <option value="2-2-2">2-2-2 (Cuadrado Mágico)</option>
                    </>
                  )}
                  {state.gameMode === '5' && (
                    <>
                      <option value="2-2">2-2 (Cuadrado)</option>
                      <option value="1-2-1">1-2-1 (Rombo)</option>
                      <option value="2-1-1">2-1-1 (Y)</option>
                      <option value="1-1-2">1-1-2 (Embudo)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex font-bold text-[10px] text-textMuted uppercase tracking-wider px-2">
                  <div className="w-12">#</div>
                  <div className="flex-1">Nombre del Jugador</div>
                </div>
                {(state.lineupTeamVisible === 'home' ? state.homePlayers : state.awayPlayers).map((player, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-surfaceHover border border-white/5 p-2 rounded-lg">
                    <input 
                      type="text" 
                      className="input-field w-12 text-center font-black" 
                      value={player.num} 
                      onChange={(e) => {
                        const newPlayers = [...(state.lineupTeamVisible === 'home' ? state.homePlayers : state.awayPlayers)];
                        newPlayers[idx].num = e.target.value;
                        updateField(state.lineupTeamVisible === 'home' ? 'homePlayers' : 'awayPlayers', newPlayers);
                      }} 
                    />
                    <input 
                      type="text" 
                      className="input-field flex-1 font-bold text-sm uppercase" 
                      value={player.name}
                      onChange={(e) => {
                        const newPlayers = [...(state.lineupTeamVisible === 'home' ? state.homePlayers : state.awayPlayers)];
                        newPlayers[idx].name = e.target.value.toUpperCase();
                        updateField(state.lineupTeamVisible === 'home' ? 'homePlayers' : 'awayPlayers', newPlayers);
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#0f0f11] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] overflow-y-auto">
        
        <div className="absolute top-6 right-6 flex gap-3 z-20">
          <button 
            onClick={(e) => {
              const url = `${window.location.origin}/render/${id || 'default'}`;
              navigator.clipboard.writeText(url);
              const btn = e.currentTarget;
              const originalText = btn.innerHTML;
              btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-green-500"><path d="M20 6 9 17l-5-5"/></svg> ¡Copiado!';
              setTimeout(() => { btn.innerHTML = originalText; }, 2000);
            }}
            className="btn-secondary flex items-center gap-2 text-sm bg-surface/80 backdrop-blur-md hover:bg-primary/20 hover:border-primary/50 transition-all shadow-lg"
          >
            <LinkIcon className="w-4 h-4" />
            Copiar URL para OBS
          </button>
        </div>

        <div ref={containerRef} className="flex-1 flex flex-col gap-6 items-center justify-start p-4 lg:p-8 w-full min-h-full pb-32">
          
          {/* MODO ESTUDIO (PREVIEW) */}
          <div 
            className="w-full aspect-video border-2 border-dashed border-white/20 rounded-2xl relative overflow-hidden bg-black/40 shadow-2xl flex-shrink-0"
            style={{ height: `${1080 * scale}px` }}
          >
            <span className="absolute top-4 left-4 text-[10px] font-bold px-2 py-1 rounded bg-yellow-500 text-black z-30 uppercase tracking-widest shadow-lg">Preview (Estudio)</span>
            <div className="w-[1920px] h-[1080px] origin-top-left relative" style={{ transform: `scale(${scale})` }}>
                {id?.startsWith('ad-') ? (
                  <>
                    <AdOverlay isPreview />
                    <SponsorOverlay isPreview />
                    <TickerOverlay isPreview />
                    <PopupOverlay isPreview />
                  </>
                ) : (
                  <>
                    {id === 'liga-pro' ? <Lineup isPreview /> : <Scoreboard isPreview />}
                    <ReplayOverlay />
                  </>
                )}
            </div>
          </div>

          {/* MODO LIVE (PROGRAM) */}
          <div 
            className="w-full aspect-video border-2 border-solid border-red-500/50 rounded-2xl relative overflow-hidden bg-black/40 shadow-2xl shadow-red-500/10 flex-shrink-0"
            style={{ height: `${1080 * scale}px` }}
          >
            <span className="absolute top-4 left-4 text-[10px] font-bold px-2 py-1 rounded bg-red-600 text-white z-30 uppercase tracking-widest shadow-lg animate-pulse">Live (Programa)</span>
            <div className="w-[1920px] h-[1080px] origin-top-left relative" style={{ transform: `scale(${scale})` }}>
                {id?.startsWith('ad-') ? (
                  <>
                    <AdOverlay />
                    <SponsorOverlay />
                    <TickerOverlay />
                    <PopupOverlay />
                  </>
                ) : (
                  <>
                    {id === 'liga-pro' ? <Lineup /> : <Scoreboard />}
                    <ReplayOverlay />
                  </>
                )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
