import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Minus, 
  Trophy, 
  Link as LinkIcon, 
  Settings, 
  Play, 
  Square, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon, 
  Eye, 
  EyeOff,
  Code2,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { useOverlayStore } from '../store/useOverlayStore';
import Scoreboard from '../components/Scoreboard';
import Lineup from '../components/Lineup';
import ReplayOverlay from '../components/ReplayOverlay';
import AdOverlay from '../components/AdOverlay';
import SponsorOverlay from '../components/SponsorOverlay';
import TickerOverlay from '../components/TickerOverlay';
import PopupOverlay from '../components/PopupOverlay';
import CustomOverlay from '../components/CustomOverlay';
import { OVERLAY_STARTER_TEMPLATES, generateAIPrompt } from '../templates/overlayTemplates';

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const state = useOverlayStore();
  const [activeTab, setActiveTab] = useState<'controles' | 'personalizar' | 'jugadores' | 'codigo'>('controles');
  
  const isCustomProject = state.overlayType === 'custom' || Boolean(state.customCode);
  const isAdProject = state.overlayType === 'publicidad' || Boolean(id?.startsWith('ad-'));
  const isLineupProject = state.overlayType === 'lineup' || id === 'liga-pro';
  const isScoreboardProject = !isCustomProject && !isAdProject && !isLineupProject;

  const [localCode, setLocalCode] = useState(state.customCode || '');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('transmisión de un reportaje en vivo');
  const [aiCopied, setAiCopied] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [isOverlayLoading, setIsOverlayLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(curr => (curr?.message === message ? null : curr));
    }, 4000);
  };

  useEffect(() => {
    if (state.customCode) {
      setLocalCode(state.customCode);
    }
  }, [state.customCode]);
  
  const [openSection, setOpenSection] = useState<'home' | 'away' | null>('home');

  // --- Secciones Colapsables (Acordeón de Controles) ---
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sponsor: true,
    banner: true,
    ticker: true,
    popup: true,
    variables: true,
    templates: false,
    clock: true,
    score: true,
    replay: true,
    lineupTeam: true,
    gameMode: true,
    formation: true,
    players: true,
    adAnimation: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  // --- Resizable Panel ---
  const [panelWidth, setPanelWidth] = useState(450);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(450);

  const onResizeMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(Math.max(startWidth.current + delta, 320), 700);
      setPanelWidth(newWidth);
    };
    const onMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  // --- End Resizable Panel ---

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
  }, [panelWidth]);

  useEffect(() => {
    if (id) {
      setIsOverlayLoading(true);
      // Resetear estado custom antes de cargar el nuevo overlay
      // para evitar que isCustomProject quede en true entre proyectos
      state.updateState({ customCode: '', overlayType: undefined, customVariables: {} });
      state.connectWebSocket('studio', id);
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/overlays/${id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.name) setProjectName(data.name);
          else setProjectName(id);

          if (data) {
            const detectedType = data.type || (id.startsWith('ad-') ? 'publicidad' : id === 'liga-pro' ? 'lineup' : (data.settings?.customCode ? 'custom' : 'scoreboard'));
            state.updateState({ 
              overlayType: detectedType,
              ...(data.settings || {}) 
            });
            if (data.settings?.customCode) {
              setLocalCode(data.settings.customCode);
            }
          }
        })
        .catch(() => setProjectName(id))
        .finally(() => setIsOverlayLoading(false));
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

  const handleCompile = () => {
    updateField('customCode', localCode);
    showToast('Overlay compilado y transmitido con éxito.', 'success');
  };

  const handleVariableChange = (key: string, value: string) => {
    const updated = { ...(state.customVariables || {}), [key]: value };
    updateField('customVariables', updated);
  };

  const handleSelectTemplate = (tmplId: string) => {
    const tmpl = OVERLAY_STARTER_TEMPLATES.find(t => t.id === tmplId);
    if (tmpl) {
      setLocalCode(tmpl.code);
      updateField('customCode', tmpl.code);
      updateField('customTemplate', tmpl.id);
      showToast(`Plantilla "${tmpl.name}" cargada.`, 'success');
    }
  };

  const handleCopyAiPrompt = () => {
    const text = generateAIPrompt(aiTopic || 'reportaje en vivo');
    navigator.clipboard.writeText(text);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const overlayId = id || 'default';
      
      const response = await fetch(`${baseUrl}/api/overlays/${overlayId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: state.overlayType,
          settings: {
            isVisible: state.isVisible,
            customCode: localCode || state.customCode,
            customTemplate: state.customTemplate,
            customVariables: state.customVariables,

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
      showToast('¡Overlay guardado correctamente en la Base de Datos!', 'success');
    } catch (error: any) {
      console.error(error);
      showToast('Hubo un error al guardar en la base de datos.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background font-sans">
      <aside
        className="relative w-full h-[45vh] lg:h-full border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col shrink-0 animate-slide-up z-10 shadow-2xl"
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${panelWidth}px` : undefined }}
      >
        {/* Drag Handle */}
        <div
          onMouseDown={onResizeMouseDown}
          title="Arrastrar para redimensionar"
          className="hidden lg:flex absolute top-0 right-0 h-full w-3 cursor-ew-resize z-20 group items-center justify-center"
        >
          <div className="w-1 h-16 rounded-full bg-white/10 group-hover:bg-primary/70 group-active:bg-primary transition-colors duration-150" />
        </div>
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 justify-between">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-surfaceHover rounded-lg transition-colors text-textMuted shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted leading-none mb-0.5">Panel de Control</p>
            <h2
              className="text-sm font-bold text-white truncate leading-snug"
              title={projectName || id}
            >
              {projectName || id || '...'}
            </h2>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`btn-primary px-3 py-1.5 text-sm flex items-center gap-2 shrink-0 ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
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
          {isCustomProject ? (
            <button 
              className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'codigo' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}
              onClick={() => setActiveTab('codigo')}
            >
              <Code2 className="w-4 h-4" /> Código / IA
            </button>
          ) : (
            <>
              <button 
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'personalizar' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}
                onClick={() => setActiveTab('personalizar')}
              >
                <Settings className="w-4 h-4" /> Personalizar
              </button>
              {isLineupProject && (
                <button 
                  className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'jugadores' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}
                  onClick={() => setActiveTab('jugadores')}
                >
                  Jugadores
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'controles' ? (
            <>
              {isOverlayLoading ? (
                /* Skeleton de carga */
                <div className="space-y-4 animate-pulse">
                  <div className="card p-5 bg-surfaceHover border-white/5 flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-white/10 rounded w-2/5" />
                      <div className="h-3 bg-white/5 rounded w-3/5" />
                    </div>
                    <div className="h-10 w-32 bg-white/10 rounded-lg ml-4" />
                  </div>
                  <div className="card p-5 bg-surfaceHover border-white/5 space-y-4">
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="h-3 bg-white/10 rounded w-1/2 mx-auto" />
                        <div className="h-12 bg-white/10 rounded-lg" />
                        <div className="h-9 bg-white/10 rounded-lg" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-white/10 rounded w-1/2 mx-auto" />
                        <div className="h-12 bg-white/10 rounded-lg" />
                        <div className="h-9 bg-white/10 rounded-lg" />
                      </div>
                    </div>
                  </div>
                  <div className="card p-5 bg-surfaceHover border-white/5 space-y-3">
                    <div className="h-3 bg-white/10 rounded w-1/4" />
                    <div className="h-16 bg-white/10 rounded-xl" />
                    <div className="h-9 bg-white/10 rounded-lg" />
                  </div>
                </div>
              ) : (
              <>{/* Visibilidad Global */}
              <section className="card p-5 bg-surfaceHover border-white/5 shadow-md flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-1">
                    {isCustomProject 
                      ? 'Estado del Overlay (Master)' 
                      : isAdProject 
                      ? 'Estado de la Publicidad' 
                      : isLineupProject 
                      ? 'Estado de las Alineaciones' 
                      : 'Estado del Marcador'}
                  </h3>
                  <p className="text-xs text-textMuted/70">
                    {isCustomProject 
                      ? 'Oculta o muestra el gráfico en la señal en vivo de OBS.' 
                      : isAdProject 
                      ? 'Oculta la publicidad en vivo.' 
                      : isLineupProject 
                      ? 'Oculta las alineaciones en vivo.' 
                      : 'Oculta para cambiar equipos sin que se vea en vivo.'}
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

              {/* Si es proyecto de código personalizado, mostrar controles rápidos de variables */}
              {isCustomProject && (
                <>
                  <section className="card overflow-hidden bg-surfaceHover border border-white/5 shadow-md transition-all">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                      onClick={() => toggleSection('variables')}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                          Textos en Vivo (Variables)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          WebSocket
                        </span>
                        <button 
                          type="button"
                          onClick={() => toggleSection('variables')}
                          className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={openSections.variables ? 'Colapsar opción' : 'Expandir opción'}
                        >
                          {openSections.variables ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {openSections.variables && (
                      <div className="p-4 pt-0 border-t border-white/5 space-y-3 mt-1 pt-4">
                        <div>
                          <label className="block text-xs font-bold text-textMuted mb-1">Titular Principal (eddam-title)</label>
                          <input 
                            type="text" 
                            className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-primary outline-none transition-colors"
                            value={state.customVariables?.['eddam-title'] ?? ''}
                            onChange={(e) => handleVariableChange('eddam-title', e.target.value)}
                            placeholder="Ej: INFORME ESPECIAL: TRANSMISIÓN EN DIRECTO"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-textMuted mb-1">Ubicación / Evento (eddam-location)</label>
                          <input 
                            type="text" 
                            className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-primary outline-none transition-colors"
                            value={state.customVariables?.['eddam-location'] ?? state.customVariables?.['eddam-event'] ?? ''}
                            onChange={(e) => {
                              handleVariableChange('eddam-location', e.target.value);
                              handleVariableChange('eddam-event', e.target.value);
                            }}
                            placeholder="Ej: 📍 QUITO, ECUADOR o CUMBRE DIGITAL"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-bold text-textMuted mb-1">Reportero / Ponente (eddam-author)</label>
                            <input 
                              type="text" 
                              className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-primary outline-none transition-colors"
                              value={state.customVariables?.['eddam-author'] ?? state.customVariables?.['eddam-speaker'] ?? ''}
                              onChange={(e) => {
                                handleVariableChange('eddam-author', e.target.value);
                                handleVariableChange('eddam-speaker', e.target.value);
                              }}
                              placeholder="Ej: Juan Carlos Pérez"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-textMuted mb-1">Rol / Cargo (eddam-role)</label>
                            <input 
                              type="text" 
                              className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-primary outline-none transition-colors"
                              value={state.customVariables?.['eddam-role'] ?? ''}
                              onChange={(e) => handleVariableChange('eddam-role', e.target.value)}
                              placeholder="Ej: Corresponsal"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-textMuted mb-1">Cintillo / Alerta (eddam-headline)</label>
                          <input 
                            type="text" 
                            className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-primary outline-none transition-colors"
                            value={state.customVariables?.['eddam-headline'] ?? ''}
                            onChange={(e) => handleVariableChange('eddam-headline', e.target.value)}
                            placeholder="Ej: COMUNICADO OFICIAL: RESOLUCIONES EN TIEMPO REAL"
                          />
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="card p-5 bg-surfaceHover border-white/5 shadow-md flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Editor de Código</h4>
                      <p className="text-xs text-textMuted mt-0.5">Modifica el HTML/Tailwind o usa el asistente de IA</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('codigo')}
                      className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-black font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Code2 className="w-3.5 h-3.5" /> Abrir Editor
                    </button>
                  </section>
                </>
              )}

              {/* CONTROLES DE PUBLICIDAD */}
              {isAdProject && (
                <section className="space-y-4">
                  {/* SELLO DEL AUSPICIADOR */}
                  <div className="card overflow-hidden bg-surfaceHover border border-blue-500/20 shadow-md transition-all">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                      onClick={() => toggleSection('sponsor')}
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          Sello Superior (Auspiciador)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => updateField('isSponsorVisible', !state.isSponsorVisible)}
                          className={`text-[10px] px-2.5 py-1 rounded font-bold transition-all shadow-sm flex items-center gap-1 ${state.isSponsorVisible ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                        >
                          {state.isSponsorVisible ? <><Eye className="w-3 h-3 inline mr-1" /> Visible</> : <><EyeOff className="w-3 h-3 inline mr-1" /> Oculto</>}
                        </button>
                        <button 
                          type="button"
                          onClick={() => toggleSection('sponsor')}
                          className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={openSections.sponsor ? 'Colapsar opción' : 'Expandir opción'}
                        >
                          {openSections.sponsor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {openSections.sponsor && (
                      <div className="p-4 pt-0 border-t border-white/5 space-y-4 mt-1 pt-4">
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
                    )}
                  </div>

                  {/* BANNER INFERIOR */}
                  <div className="card overflow-hidden bg-surfaceHover border border-blue-500/20 shadow-md transition-all">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                      onClick={() => toggleSection('banner')}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          Banner Inferior
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => updateField('isAdVisible', !state.isAdVisible)}
                          className={`text-[10px] px-2.5 py-1 rounded font-bold transition-all shadow-sm flex items-center gap-1 ${state.isAdVisible ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                        >
                          {state.isAdVisible ? <><Eye className="w-3 h-3 inline mr-1" /> Visible</> : <><EyeOff className="w-3 h-3 inline mr-1" /> Oculto</>}
                        </button>
                        <button 
                          type="button"
                          onClick={() => toggleSection('banner')}
                          className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={openSections.banner ? 'Colapsar opción' : 'Expandir opción'}
                        >
                          {openSections.banner ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {openSections.banner && (
                      <div className="p-4 pt-0 border-t border-white/5 space-y-4 mt-1 pt-4">
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
                    )}
                  </div>

                  {/* CINTA INFERIOR (TICKER) */}
                  <div className="card overflow-hidden bg-surfaceHover border border-blue-500/20 shadow-md transition-all">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                      onClick={() => toggleSection('ticker')}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          Cinta Inferior (Ticker)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => updateField('isTickerVisible', !state.isTickerVisible)}
                          className={`text-[10px] px-2.5 py-1 rounded font-bold transition-all shadow-sm flex items-center gap-1 ${state.isTickerVisible ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                        >
                          {state.isTickerVisible ? <><Eye className="w-3 h-3 inline mr-1" /> Visible</> : <><EyeOff className="w-3 h-3 inline mr-1" /> Oculto</>}
                        </button>
                        <button 
                          type="button"
                          onClick={() => toggleSection('ticker')}
                          className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={openSections.ticker ? 'Colapsar opción' : 'Expandir opción'}
                        >
                          {openSections.ticker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {openSections.ticker && (
                      <div className="p-4 pt-0 border-t border-white/5 space-y-4 mt-1 pt-4">
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
                    )}
                  </div>

                  {/* POP-UP LATERAL */}
                  <div className="card overflow-hidden bg-surfaceHover border border-blue-500/20 shadow-md transition-all">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                      onClick={() => toggleSection('popup')}
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          Pop-up Lateral (Promo)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => updateField('isPopupVisible', !state.isPopupVisible)}
                          className={`text-[10px] px-2.5 py-1 rounded font-bold transition-all shadow-sm flex items-center gap-1 ${state.isPopupVisible ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                        >
                          {state.isPopupVisible ? <><Eye className="w-3 h-3 inline mr-1" /> Visible</> : <><EyeOff className="w-3 h-3 inline mr-1" /> Oculto</>}
                        </button>
                        <button 
                          type="button"
                          onClick={() => toggleSection('popup')}
                          className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={openSections.popup ? 'Colapsar opción' : 'Expandir opción'}
                        >
                          {openSections.popup ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {openSections.popup && (
                      <div className="p-4 pt-0 border-t border-white/5 space-y-4 mt-1 pt-4">
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
                    )}
                  </div>
                </section>
              )}

              {/* CONTROLES DE ALINEACIÓN (LINEUP) */}
              {isLineupProject && (
                <section className="card overflow-hidden bg-surfaceHover border border-white/5 shadow-md transition-all">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                    onClick={() => toggleSection('lineupTeam')}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-textMuted" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Equipo a Mostrar en Pantalla
                      </h3>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => updateField('lineupTeamVisible', 'home')} 
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase transition-colors ${state.lineupTeamVisible === 'home' ? 'bg-primary text-white shadow' : 'bg-white/10 text-textMuted hover:bg-white/20'}`}
                        >
                          {state.homeName}
                        </button>
                        <button 
                          onClick={() => updateField('lineupTeamVisible', 'away')} 
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase transition-colors ${state.lineupTeamVisible === 'away' ? 'bg-primary text-white shadow' : 'bg-white/10 text-textMuted hover:bg-white/20'}`}
                        >
                          {state.awayName}
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => toggleSection('lineupTeam')}
                        className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                        title={openSections.lineupTeam ? 'Colapsar opción' : 'Expandir opción'}
                      >
                        {openSections.lineupTeam ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {openSections.lineupTeam && (
                    <div className="p-4 pt-0 border-t border-white/5 mt-1 pt-4">
                      <div className="flex gap-2">
                        <button onClick={() => updateField('lineupTeamVisible', 'home')} className={`flex-1 py-2 rounded font-bold ${state.lineupTeamVisible === 'home' ? 'bg-primary text-white' : 'bg-white/10 text-textMuted hover:bg-white/20'}`}>Local ({state.homeName})</button>
                        <button onClick={() => updateField('lineupTeamVisible', 'away')} className={`flex-1 py-2 rounded font-bold ${state.lineupTeamVisible === 'away' ? 'bg-primary text-white' : 'bg-white/10 text-textMuted hover:bg-white/20'}`}>Visitante ({state.awayName})</button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* CONTROLES DE MARCADOR (SCOREBOARD) */}
              {isScoreboardProject && (
                <>
                  <section className="card overflow-hidden bg-surfaceHover border border-white/5 shadow-md transition-all">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                      onClick={() => toggleSection('clock')}
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-textMuted" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted">
                          Reloj de Juego
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-mono font-bold bg-black/60 px-2 py-0.5 rounded border border-white/10 text-white">
                          {formatTime(state.timerElapsed)}
                        </span>
                        {!state.timerIsRunning ? (
                          <button onClick={() => updateField('timerIsRunning', true)} className="text-[10px] px-2.5 py-1 rounded font-bold bg-green-600 hover:bg-green-500 text-white flex items-center gap-1 shadow-sm">
                            <Play className="w-3 h-3" /> Jugar
                          </button>
                        ) : (
                          <button onClick={() => updateField('timerIsRunning', false)} className="text-[10px] px-2.5 py-1 rounded font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                            <Square className="w-3 h-3" /> Pausar
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => toggleSection('clock')}
                          className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={openSections.clock ? 'Colapsar opción' : 'Expandir opción'}
                        >
                          {openSections.clock ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {openSections.clock && (
                      <div className="p-4 pt-0 border-t border-white/5 mt-1 pt-4">
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
                      </div>
                    )}
                  </section>

                  <section className="card overflow-hidden bg-surfaceHover border border-white/5 shadow-md transition-all">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                      onClick={() => toggleSection('score')}
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-textMuted" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted">
                          Marcador
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-bold font-mono bg-black/60 px-2.5 py-0.5 rounded border border-white/10 text-white flex items-center gap-1.5">
                          <span className="text-emerald-400">{state.homeName} {state.homeScore}</span>
                          <span className="text-white/40">-</span>
                          <span className="text-rose-400">{state.awayScore} {state.awayName}</span>
                        </span>
                        <button 
                          type="button"
                          onClick={() => toggleSection('score')}
                          className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={openSections.score ? 'Colapsar opción' : 'Expandir opción'}
                        >
                          {openSections.score ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {openSections.score && (
                      <div className="p-4 pt-0 border-t border-white/5 mt-1 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="card p-4 space-y-3 bg-surface border-primary/20 shadow-md">
                            <div className="text-xs text-textMuted font-bold text-center">LOCAL ({state.homeName})</div>
                            <div className="flex items-center justify-between bg-background rounded-lg p-1 border border-border">
                              <button onClick={() => updateField('homeScore', Math.max(0, state.homeScore - 1))} className="p-3 hover:text-primary transition-colors"><Minus className="w-5 h-5"/></button>
                              <span className="font-bold text-3xl">{state.homeScore}</span>
                              <button onClick={() => updateField('homeScore', state.homeScore + 1)} className="p-3 hover:text-primary transition-colors"><Plus className="w-5 h-5"/></button>
                            </div>
                            <button onClick={() => triggerGoal('home')} className="w-full btn-primary bg-green-600 hover:bg-green-500 py-2 text-sm font-bold shadow-lg shadow-green-900/50">¡GOL LOCAL!</button>
                          </div>

                          <div className="card p-4 space-y-3 bg-surface border-red-500/20 shadow-md">
                            <div className="text-xs text-textMuted font-bold text-center">VISITANTE ({state.awayName})</div>
                            <div className="flex items-center justify-between bg-background rounded-lg p-1 border border-border">
                              <button onClick={() => updateField('awayScore', Math.max(0, state.awayScore - 1))} className="p-3 hover:text-red-500 transition-colors"><Minus className="w-5 h-5"/></button>
                              <span className="font-bold text-3xl">{state.awayScore}</span>
                              <button onClick={() => updateField('awayScore', state.awayScore + 1)} className="p-3 hover:text-red-500 transition-colors"><Plus className="w-5 h-5"/></button>
                            </div>
                            <button onClick={() => triggerGoal('away')} className="w-full btn-primary bg-red-600 hover:bg-red-500 py-2 text-sm font-bold shadow-lg shadow-red-900/50">¡GOL VISITANTE!</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                  
                  {/* Botón Especial: Replay / Destacado */}
                  <div className="card overflow-hidden bg-gradient-to-r from-yellow-600/10 to-yellow-800/10 border border-yellow-500/20 shadow-lg transition-all">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                      onClick={() => toggleSection('replay')}
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-yellow-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-500">
                          Efecto Destacado
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={triggerReplay}
                          disabled={state.isReplayActive}
                          className={`text-xs px-2.5 py-1 rounded font-bold uppercase transition-all shadow-sm flex items-center gap-1.5 ${
                            state.isReplayActive 
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:to-yellow-500 text-black border border-yellow-400 hover:scale-105'
                          }`}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          {state.isReplayActive ? 'Reproduciendo...' : 'Lanzar Replay'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => toggleSection('replay')}
                          className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={openSections.replay ? 'Colapsar opción' : 'Expandir opción'}
                        >
                          {openSections.replay ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {openSections.replay && (
                      <div className="p-4 pt-0 border-t border-yellow-500/20 mt-1 pt-4">
                        <button 
                          onClick={triggerReplay}
                          disabled={state.isReplayActive}
                          className={`w-full py-3 rounded-lg font-bold italic tracking-widest text-lg uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${state.isReplayActive ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:to-yellow-500 text-black border-2 border-yellow-400 hover:scale-[1.02]'}`}
                        >
                          <Trophy className="w-5 h-5" />
                          {state.isReplayActive ? 'Reproduciendo...' : 'Lanzar Replay'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      ) : activeTab === 'personalizar' ? (
            isAdProject ? (
              <div className="space-y-4">
                <div className="card overflow-hidden bg-surfaceHover border border-white/5 shadow-md transition-all">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none group"
                    onClick={() => toggleSection('adAnimation')}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-textMuted" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Comportamiento de Animación
                      </h3>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white uppercase border border-white/10">
                        {state.adMode === 'loop' ? 'Loop Automático' : 'Estático'}
                      </span>
                      <button 
                        type="button"
                        onClick={() => toggleSection('adAnimation')}
                        className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                        title={openSections.adAnimation ? 'Colapsar opción' : 'Expandir opción'}
                      >
                        {openSections.adAnimation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {openSections.adAnimation && (
                    <div className="p-4 pt-0 border-t border-white/5 space-y-4 mt-1 pt-4">
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
                  )}
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="card overflow-hidden bg-surfaceHover border border-white/10 shadow-lg">
                <button 
                  type="button"
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => setOpenSection(openSection === 'home' ? null : 'home')}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0" 
                      style={{ backgroundColor: state.homeColor || '#3b82f6' }}
                    />
                    <span className="font-semibold text-sm group-hover:text-white transition-colors">
                      Equipo 1 (Local): <span className="font-black text-primary uppercase ml-1">{state.homeName || 'LOCAL'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {state.homeLogo && (
                      <img src={state.homeLogo} alt="Logo Local" className="w-5 h-5 object-contain rounded bg-white/10 p-0.5" />
                    )}
                    <span className="p-1 text-textMuted group-hover:text-white rounded transition-colors">
                      {openSection === 'home' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
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
                  type="button"
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => setOpenSection(openSection === 'away' ? null : 'away')}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0" 
                      style={{ backgroundColor: state.awayColor || '#ef4444' }}
                    />
                    <span className="font-semibold text-sm group-hover:text-white transition-colors">
                      Equipo 2 (Visitante): <span className="font-black text-primary uppercase ml-1">{state.awayName || 'VISITANTE'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {state.awayLogo && (
                      <img src={state.awayLogo} alt="Logo Visitante" className="w-5 h-5 object-contain rounded bg-white/10 p-0.5" />
                    )}
                    <span className="p-1 text-textMuted group-hover:text-white rounded transition-colors">
                      {openSection === 'away' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
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
              
              {/* Modalidad de Juego - Colapsable */}
              <div className="card bg-surfaceHover border border-white/5 shadow-md overflow-hidden">
                <div 
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none group"
                  onClick={() => toggleSection('gameMode')}
                >
                  <label className="text-xs text-textMuted font-bold uppercase tracking-wider group-hover:text-white transition-colors cursor-pointer">
                    Modalidad de Juego
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/20 text-primary border border-primary/30">
                      Fútbol {state.gameMode}
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSection('gameMode'); }}
                      className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                      title={openSections.gameMode ? 'Colapsar opción' : 'Expandir opción'}
                    >
                      {openSections.gameMode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {openSections.gameMode && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-1 pt-3">
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
                )}
              </div>

              {/* Selector de Equipo para Alineación */}
              <div className="flex items-center gap-2 bg-surfaceHover p-1 rounded-lg border border-white/5">
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

              {/* Formación Táctica - Colapsable */}
              <div className="card bg-surfaceHover border border-white/5 shadow-md overflow-hidden">
                <div 
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none group"
                  onClick={() => toggleSection('formation')}
                >
                  <label className="text-xs text-textMuted font-bold uppercase tracking-wider group-hover:text-white transition-colors cursor-pointer">
                    Formación ({state.lineupTeamVisible === 'home' ? 'Local' : 'Visitante'})
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white border border-white/15 font-mono">
                      {state.lineupTeamVisible === 'home' ? state.homeFormation : state.awayFormation}
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSection('formation'); }}
                      className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                      title={openSections.formation ? 'Colapsar opción' : 'Expandir opción'}
                    >
                      {openSections.formation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {openSections.formation && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-1 pt-3">
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
                )}
              </div>

              {/* Lista de Jugadores - Colapsable */}
              <div className="card bg-surfaceHover border border-white/5 shadow-md overflow-hidden">
                <div 
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none group"
                  onClick={() => toggleSection('players')}
                >
                  <label className="text-xs text-textMuted font-bold uppercase tracking-wider group-hover:text-white transition-colors cursor-pointer">
                    Plantel de Jugadores ({state.lineupTeamVisible === 'home' ? state.homeName : state.awayName})
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-textMuted font-semibold">
                      {(state.lineupTeamVisible === 'home' ? state.homePlayers : state.awayPlayers).length} jug.
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSection('players'); }}
                      className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                      title={openSections.players ? 'Colapsar opción' : 'Expandir opción'}
                    >
                      {openSections.players ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {openSections.players && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-1 pt-3 space-y-2">
                    <div className="flex font-bold text-[10px] text-textMuted uppercase tracking-wider px-2">
                      <div className="w-12">#</div>
                      <div className="flex-1">Nombre del Jugador</div>
                    </div>
                    {(state.lineupTeamVisible === 'home' ? state.homePlayers : state.awayPlayers).map((player, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-background/50 border border-white/5 p-2 rounded-lg">
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
                )}
              </div>

            </div>
          ) : null}

          {activeTab === 'codigo' ? (
            <div className="space-y-4">
              {/* Barra superior de herramientas de código */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> HTML + Tailwind CSS
                </span>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Asistente IA
                </button>
              </div>

              {/* Selector de Plantillas Rápidas - Colapsable */}
              <div className="card bg-surfaceHover border border-white/5 shadow-sm overflow-hidden">
                <div 
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none group"
                  onClick={() => toggleSection('templates')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider group-hover:text-white transition-colors">
                      Plantillas Base
                    </span>
                    <span className="text-[10px] text-textMuted/70 hidden sm:inline">• Reemplaza el código</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-textMuted border border-white/10">
                      {OVERLAY_STARTER_TEMPLATES.find(t => t.id === state.customTemplate)?.name || 'Plantillas'}
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSection('templates'); }}
                      className="p-1 text-textMuted group-hover:text-white hover:bg-white/10 rounded transition-colors"
                      title={openSections.templates ? 'Colapsar opción' : 'Expandir opción'}
                    >
                      {openSections.templates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {openSections.templates && (
                  <div className="p-3.5 pt-0 border-t border-white/5 mt-1 pt-3">
                    <div className="grid grid-cols-2 gap-1.5">
                      {OVERLAY_STARTER_TEMPLATES.map(tmpl => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => handleSelectTemplate(tmpl.id)}
                          className={`p-2 rounded-lg text-left border transition-all text-xs ${
                            state.customTemplate === tmpl.id
                              ? 'bg-primary/20 border-primary text-white font-bold'
                              : 'bg-background/50 hover:bg-white/10 border-white/5 text-textMuted hover:text-white'
                          }`}
                        >
                          <span className="font-bold truncate block">{tmpl.name}</span>
                          <span className="text-[9px] opacity-75">{tmpl.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Editor Textarea */}
              <div className="relative">
                <textarea 
                  rows={15}
                  spellCheck={false}
                  className="w-full bg-black/90 border border-white/15 rounded-xl p-3.5 text-emerald-300 font-mono text-xs outline-none focus:border-primary transition-all leading-relaxed shadow-inner"
                  value={localCode}
                  onChange={(e) => setLocalCode(e.target.value)}
                  placeholder="Escribe o pega aquí el código HTML/Tailwind de tu overlay..."
                />
              </div>

              {/* Botón de Compilar Overlay */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCompile}
                  className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Compilar Overlay</span>
                </button>
              </div>
              <p className="text-[11px] text-textMuted text-center">
                Al pulsar "Compilar Overlay", el diseño se actualizará de inmediato en el Preview y en OBS en vivo.
              </p>
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
                {isCustomProject ? (
                  <CustomOverlay />
                ) : isAdProject ? (
                  <>
                    <AdOverlay isPreview />
                    <SponsorOverlay isPreview />
                    <TickerOverlay isPreview />
                    <PopupOverlay isPreview />
                  </>
                ) : isLineupProject ? (
                  <Lineup isPreview />
                ) : (
                  <>
                    <Scoreboard isPreview />
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
                {isCustomProject ? (
                  <CustomOverlay />
                ) : isAdProject ? (
                  <>
                    <AdOverlay />
                    <SponsorOverlay />
                    <TickerOverlay />
                    <PopupOverlay />
                  </>
                ) : isLineupProject ? (
                  <Lineup />
                ) : (
                  <>
                    <Scoreboard />
                    <ReplayOverlay />
                  </>
                )}
            </div>
          </div>
          
        </div>
      </main>

      {/* Modal Asistente de Prompt para IA */}
      {isAiModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setIsAiModalOpen(false)}
        >
          <div 
            className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Asistente de Prompt para IA</span>
              </h3>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="text-textMuted hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1.5">
                  ¿Para qué transmisión necesitas el overlay?
                </label>
                <input 
                  type="text" 
                  className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-primary"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ej: reportaje de elecciones en vivo, transmisión de evento musical, misa"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted mb-1.5">
                  Prompt generado con especificaciones técnicas (1920x1080, Tailwind, OBS)
                </label>
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-xs text-gray-300 font-mono max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                  {generateAIPrompt(aiTopic)}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-lg font-bold text-sm text-textMuted hover:bg-white/5"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleCopyAiPrompt}
                className={`btn-primary px-5 py-2 text-sm flex items-center gap-2 ${
                  aiCopied ? 'bg-green-600 hover:bg-green-600' : ''
                }`}
              >
                {aiCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{aiCopied ? '¡Prompt Copiado!' : 'Copiar Prompt para ChatGPT / Claude'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[70] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-xl shadow-2xl border backdrop-blur-md animate-slide-up transition-all ${
            toast.type === 'success' 
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100 shadow-emerald-900/30' 
              : 'bg-red-950/95 border-red-500/50 text-red-100 shadow-red-900/30'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium flex-1 break-words">{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white shrink-0"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
