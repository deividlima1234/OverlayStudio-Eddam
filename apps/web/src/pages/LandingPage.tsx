import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  Monitor, 
  Trophy, 
  Users, 
  Megaphone, 
  Zap, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Cpu
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Estado para la demostración interactiva del Hero Showcase
  const [demoTab, setDemoTab] = useState<'lineup' | 'scoreboard' | 'ad'>('lineup');

  // Estado para el acordeón de preguntas frecuentes (FAQ)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(curr => curr === idx ? null : idx);
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const faqs = [
    {
      q: '¿Necesito instalar algún programa en mi computadora?',
      a: 'No. Eddam Overlay Studio es 100% web. Puedes acceder desde cualquier navegador moderno en tu PC, laptop o smartphone sin instalar nada extra.'
    },
    {
      q: '¿Cómo se conecta con OBS Studio o vMix?',
      a: 'Cada proyecto genera una URL única de salida limpia. En OBS Studio simplemente agregas una "Fuente de Navegador" (Browser Source), pegas la URL a 1920x1080 y listo. ¡Sin retardos y con fondo transparente!'
    },
    {
      q: '¿Funciona para transmisiones de fútbol u otros deportes?',
      a: '¡Por supuesto! Incluye motores dedicados para marcadores de fútbol, cronómetro en vivo, tiempo extra, alineaciones interactivas con formaciones tácticas (4-4-2, 4-3-3, etc.) y banners de repetición.'
    },
    {
      q: '¿Qué es el Generador de Overlays con Inteligencia Artificial?',
      a: 'Es una herramienta asistida que te permite describir el tipo de gráfico que necesitas (ej. "Transmisión de elecciones en vivo", "Torneo de eSports") y genera el código React y Tailwind listo para compilar.'
    },
    {
      q: '¿Puedo previsualizar cómo se verá en teléfonos móviles?',
      a: 'Sí, la plataforma cuenta con un simulador dual que te permite alternar entre Monitor PC (16:9) y Smartphone Android tanto en orientación vertical como horizontal.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white selection:bg-primary selection:text-white font-sans overflow-x-hidden">
      
      {/* Fondo con mallas de degradado sutiles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-primary/15 via-indigo-600/10 to-transparent blur-[120px]" />
        <div className="absolute top-[800px] -left-48 w-[600px] h-[500px] bg-purple-600/10 blur-[130px]" />
        <div className="absolute top-[1400px] -right-48 w-[600px] h-[500px] bg-blue-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f27_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* ========================================================= */}
      {/* 1. NAVBAR */}
      {/* ========================================================= */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0b0e]/80 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 p-0.5 shadow-lg shadow-primary/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#0e0e12] rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                EDDAM <span className="text-primary">STUDIO</span>
              </span>
              <span className="text-[10px] text-zinc-400 block -mt-1 font-mono tracking-widest uppercase">
                OVERLAYS EN TIEMPO REAL
              </span>
            </div>
          </div>

          {/* Enlaces de Navegación (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#caracteristicas" className="hover:text-white transition-colors">Características</a>
            <a href="#showcase" className="hover:text-white transition-colors">Demostración</a>
            <a href="#dispositivos" className="hover:text-white transition-colors">PC & Móvil</a>
            <a href="#pasos" className="hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#faq" className="hover:text-white transition-colors">Preguntas</a>
          </div>

          {/* Botones de Acción (Auth) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              className="text-xs sm:text-sm font-bold text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => openAuth('register')}
              className="btn-primary text-xs sm:text-sm font-bold flex items-center gap-2 py-2.5 px-4 sm:px-5 shadow-lg shadow-primary/25 rounded-xl transition-all"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Badge Novedad */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 mb-8 backdrop-blur-md hover:border-primary/40 transition-all cursor-pointer">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white font-bold">Novedad v2.0:</span>
          <span className="text-zinc-400">Simulador de Pantallas PC y Móvil Android</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Titular Principal */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Overlays Profesionales para OBS{' '}
          <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            en Tiempo Real con IA
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          La suite definitiva para transmisiones de streaming, eSports y televisión. 
          Controla marcadores deportivos, alineaciones tácticas dinámicas y banners publicitarios 
          con latencia cero mediante WebSockets.
        </p>

        {/* Botones de Llamada a la Acción (CTA) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => openAuth('register')}
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primaryHover text-white font-extrabold rounded-2xl text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>Crear mi Primer Overlay Gratis</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 bg-surface/90 hover:bg-surfaceHover border border-white/15 text-white font-bold rounded-2xl text-base flex items-center justify-center gap-2.5 backdrop-blur-md transition-all active:scale-95 shadow-lg"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Ver Demo del Estudio</span>
          </button>
        </div>

        {/* Métricas y Garantías */}
        <div className="mt-14 pt-10 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <span className="block text-2xl sm:text-3xl font-black text-white font-mono">0 ms</span>
            <span className="text-xs text-zinc-400">Latencia en Vivo</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <span className="block text-2xl sm:text-3xl font-black text-primary font-mono">100%</span>
            <span className="text-xs text-zinc-400">Compatible con OBS</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">24/7</span>
            <span className="text-xs text-zinc-400">Operación en la Nube</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-mono">4K / 60</span>
            <span className="text-xs text-zinc-400">Calidad Gráfica Full</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SHOWCASE INTERACTIVO (DEMOSTRACIÓN EN MONITOR DE ESTUDIO) */}
      {/* ========================================================= */}
      <section id="showcase" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-4xl font-black">
            Pruébalo en Vivo antes de Transmitir
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl mx-auto">
            Alterna entre las plantillas disponibles para ver la calidad gráfica en tiempo real.
          </p>

          {/* Selector de Pestañas del Showcase */}
          <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-[#16161d] border border-white/10 gap-2">
            <button
              onClick={() => setDemoTab('lineup')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                demoTab === 'lineup' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Alineaciones Tácticas</span>
            </button>

            <button
              onClick={() => setDemoTab('scoreboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                demoTab === 'scoreboard' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Marcador Deportivo</span>
            </button>

            <button
              onClick={() => setDemoTab('ad')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                demoTab === 'ad' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Publicidad & Sponsors</span>
            </button>
          </div>
        </div>

        {/* Marco de Monitor de Estudio */}
        <div className="bg-[#121217] border-2 border-white/10 rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
          {/* Barra Superior del Monitor */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-zinc-400 ml-2 font-mono text-[11px] hidden sm:inline">
                OBS STUDIO FEED • 1920×1080 (60 FPS)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-extrabold text-[10px] uppercase tracking-wider animate-pulse shadow-md">
                <span className="w-2 h-2 rounded-full bg-white" />
                ON AIR (EN VIVO)
              </span>
            </div>
          </div>

          {/* Pantalla del Showcase */}
          <div className="w-full aspect-video bg-gradient-to-br from-black to-zinc-950 rounded-2xl relative overflow-hidden flex items-center justify-center p-4 sm:p-8 border border-white/5 shadow-inner">
            
            {demoTab === 'lineup' && (
              <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in">
                {/* Cancha Táctica Simulada */}
                <div className="w-64 sm:w-80 h-44 sm:h-56 bg-[#168a29] border-4 border-white/80 rounded-xl relative shadow-2xl flex flex-col justify-around p-3 transform perspective-800 rotateX-20">
                  <div className="text-[10px] font-black tracking-widest text-white/90 text-center uppercase bg-black/40 py-0.5 rounded">
                    FORMACIÓN 4-3-3
                  </div>
                  {/* Jugadores simulados */}
                  <div className="flex justify-around">
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">7</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">9</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">11</span>
                  </div>
                  <div className="flex justify-around">
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">8</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">5</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">10</span>
                  </div>
                  <div className="flex justify-around">
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">2</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">3</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">4</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-black text-[10px] flex items-center justify-center shadow">6</span>
                  </div>
                  <div className="flex justify-center">
                    <span className="w-6 h-6 rounded-full bg-amber-400 border border-white text-black font-black text-[10px] flex items-center justify-center shadow">1</span>
                  </div>
                </div>

                {/* Lista de Jugadores */}
                <div className="flex-1 w-full space-y-1.5 text-left">
                  <div className="flex items-center justify-between border-b border-white/20 pb-1">
                    <h4 className="text-sm sm:text-base font-black italic tracking-wider text-white uppercase">
                      STARTING XI • SPORT TOKIO
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-400">TITULARES</span>
                  </div>
                  {['1. C. PORTERO', '4. D. RAMÍREZ', '5. M. SILVA (C)', '10. L. MESSIAS', '9. K. DELANTERO'].map((jugador, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-semibold">
                      <span>{jugador}</span>
                      <span className="text-[10px] text-zinc-400">Titular</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {demoTab === 'scoreboard' && (
              <div className="w-full max-w-xl text-center space-y-4 animate-fade-in">
                {/* Marcador Estilo Televisión */}
                <div className="bg-[#101018]/90 border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
                  {/* Equipo Local */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow">
                      ST
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-sm block">SPORT TOKIO</span>
                      <span className="text-[10px] text-zinc-400">Local</span>
                    </div>
                  </div>

                  {/* Score y Tiempo */}
                  <div className="px-5 py-2 bg-black/60 rounded-xl border border-white/10">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
                      2 - 1
                    </span>
                    <span className="block text-[11px] font-bold text-emerald-400 font-mono">
                      78:42 • 2T
                    </span>
                  </div>

                  {/* Equipo Visitante */}
                  <div className="flex-1 flex items-center justify-end gap-3 text-right">
                    <div>
                      <span className="font-extrabold text-sm block">CANCHANURA</span>
                      <span className="text-[10px] text-zinc-400">Visitante</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-white shadow">
                      CN
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400">
                  Controla goles, tarjetas y tiempo con botones en vivo desde cualquier pantalla.
                </p>
              </div>
            )}

            {demoTab === 'ad' && (
              <div className="w-full max-w-2xl text-center space-y-4 animate-fade-in">
                <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-blue-900/80 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                      PATROCINADOR OFICIAL
                    </span>
                    <h3 className="text-lg font-black text-white">
                      BEBIDAS ENERGÉTICAS APEX TURBO
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1">
                      El poder que impulsa a los campeones de la Liga Pro 2026.
                    </p>
                  </div>
                  <div className="px-5 py-2.5 bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shrink-0">
                    VISITAR SITIO WEB
                  </div>
                </div>
                
                {/* Ticker de Noticias Inferior */}
                <div className="bg-black/80 border border-white/10 rounded-xl py-2 px-4 flex items-center gap-3 text-xs text-left">
                  <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase">
                    ÚLTIMO MINUTO
                  </span>
                  <span className="text-zinc-300 truncate">
                    Próximo partido de cuartos de final programado para este sábado a las 18:00 hrs.
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Pie del Monitor */}
          <div className="flex items-center justify-between pt-3 text-[11px] text-zinc-500">
            <span>EDDAM STUDIO DISPLAY PRO • COMPATIBLE CON OBS STUDIO / VMix</span>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-primary hover:underline font-bold flex items-center gap-1"
            >
              <span>Abrir en el Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. CARACTERÍSTICAS (BENTO GRID) */}
      {/* ========================================================= */}
      <section id="caracteristicas" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black">
            Todo lo que Necesitas para tu Transmisión
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg mt-3 max-w-2xl mx-auto">
            Herramientas profesionales diseñadas para streamers, productores de eventos y canales de televisión.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Simulador PC y Móvil */}
          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Simulador de Pantallas PC & Móvil</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Verifica en tiempo real cómo se ve tu overlay en un monitor widescreen de escritorio (16:9) y en smartphones Android tanto en formato vertical como horizontal.
            </p>
          </div>

          {/* Card 2: Marcadores en Vivo */}
          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Marcadores Deportivos Dinámicos</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Goles, cronómetro en vivo, tiempo extra, tarjetas y cambio de logos de equipos con controles intuitivos de un solo toque sin interrumpir el stream.
            </p>
          </div>

          {/* Card 3: Alineaciones Tácticas */}
          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Alineaciones Tácticas con Dorsales 3D</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Motor inteligente que distribuye las camisetas en el césped según la formación elegida (4-4-2, 4-3-3, 3-5-2) con animaciones secuenciales fluidas.
            </p>
          </div>

          {/* Card 4: Generador con IA */}
          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Asistente de IA para Overlays</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Describe tu programa ("debate electoral", "podcast", "misa en vivo") y genera el prompt con especificaciones técnicas de Tailwind y React listas para usar.
            </p>
          </div>

          {/* Card 5: Publicidad y Sponsors */}
          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Publicidad & Auspiciadores</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Monetiza tus eventos con rotadores automáticos de sponsors, banners pop-up y barras de noticias tipo televisión profesional.
            </p>
          </div>

          {/* Card 6: Latencia Cero WebSockets */}
          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">WebSockets en Tiempo Real</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Comunicación bidireccional instantánea. Lo que presionas en tu panel de control se refleja en OBS de inmediato sin recargas de página.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CÓMO FUNCIONA (PASO A PASO) */}
      {/* ========================================================= */}
      <section id="pasos" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white/[0.01] border-y border-white/5">
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-primary block mb-2">
            FLUJO SENCILLO Y RÁPIDO
          </span>
          <h2 className="text-3xl sm:text-5xl font-black">
            De Cero a Transmitir en 3 Pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Paso 1 */}
          <div className="bg-[#121216] border border-white/10 rounded-3xl p-8 relative">
            <div className="w-10 h-10 rounded-xl bg-primary text-white font-black text-lg flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
              1
            </div>
            <h3 className="text-xl font-bold mb-3">Elige tu Plantilla o Crea con IA</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Inicia con plantillas prediseñadas para marcadores, alineaciones, auspiciadores o genera una personalizada con código React.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="bg-[#121216] border border-white/10 rounded-3xl p-8 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30">
              2
            </div>
            <h3 className="text-xl font-bold mb-3">Personaliza y Controla en Vivo</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Ajusta colores, nombres, logos y utiliza la consola de control para sumar goles, cambiar jugadores o rotar publicidad mientras transmites.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="bg-[#121216] border border-white/10 rounded-3xl p-8 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
              3
            </div>
            <h3 className="text-xl font-bold mb-3">Pega la URL en OBS y Transmite</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Copia la URL única del overlay y pégala en OBS Studio como Fuente de Navegador (Browser Source). Todo se sincroniza automáticamente.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PREGUNTAS FRECUENTES (FAQ) */}
      {/* ========================================================= */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black">
            Preguntas Frecuentes
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Todo lo que necesitas saber sobre el funcionamiento de Eddam Overlay Studio.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base hover:text-primary transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. CTA BANNER FINAL */}
      {/* ========================================================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Eleva el Nivel de tus Transmisiones Hoy
          </h2>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Únete a cientos de streamers, torneos eSports y creadores de contenido que ya producen eventos con gráficos de nivel televisivo.
          </p>

          <button
            onClick={() => openAuth('register')}
            className="px-8 py-4 bg-white hover:bg-zinc-100 text-black font-black rounded-2xl text-base shadow-2xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span>Crear mi Cuenta Gratis</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================= */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-zinc-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">EDDAM OVERLAY STUDIO</span>
              <span>Soluciones gráficas en tiempo real para OBS Studio.</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => openAuth('login')} className="hover:text-white transition-colors">
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">
              Panel de Proyectos
            </button>
            <a href="#caracteristicas" className="hover:text-white transition-colors">
              Características
            </a>
          </div>

          <p>© {new Date().getFullYear()} Eddam Studio. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 9. MODAL DE AUTENTICACIÓN (LOGIN / REGISTRO) */}
      {/* ========================================================= */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

    </div>
  );
}
