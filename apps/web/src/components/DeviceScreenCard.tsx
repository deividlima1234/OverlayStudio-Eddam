import React, { useRef, useState, useEffect } from 'react';
import {
  Wifi,
  BatteryMedium,
  Radio,
  Smartphone
} from 'lucide-react';

export type ViewMode = 'pc' | 'mobile';
export type MobileOrientation = 'portrait' | 'landscape';

interface DeviceScreenCardProps {
  mode: 'preview' | 'live';
  viewMode: ViewMode;
  orientation: MobileOrientation;
  parentScale: number;
  projectName?: string;
  children: React.ReactNode;
}

export default function DeviceScreenCard({
  mode,
  viewMode,
  orientation,
  parentScale,
  projectName = 'Liga Pro eSports - Alineaciones',
  children,
}: DeviceScreenCardProps) {
  const isLive = mode === 'live';

  // Refs y estados para medición automática con ResizeObserver
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = screenContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [viewMode, orientation]);

  // Cálculo matemático exacto de escala para que 1920x1080 llene el 100% del ancho sin recortes ni huecos
  const activeScale = containerWidth > 0 ? containerWidth / 1920 : (viewMode === 'pc' ? parentScale : 0.35);
  const calculatedHeight = Math.round(1080 * activeScale);

  // ==========================================
  // 1. MODO PC (MONITOR ESCRITORIO 16:9)
  // ==========================================
  if (viewMode === 'pc') {
    return (
      <div className="w-full flex flex-col items-center transition-all duration-300">
        {/* Chasis del Monitor PC */}
        <div
          className={`w-full bg-[#131316] border-2 rounded-2xl p-2.5 pb-3 shadow-2xl relative transition-all duration-300 ${isLive
            ? 'border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
            : 'border-amber-400/40 border-dashed shadow-[0_0_20px_rgba(245,158,11,0.08)]'
            }`}
        >
          {/* Barra Superior del Monitor / Studio Frame */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2 select-none">
            {/* Lado izquierdo: Botones ventana + Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 opacity-60">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
              </div>

              {isLive ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider uppercase shadow-lg shadow-red-600/30">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Live (Programa)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black tracking-wider uppercase shadow-lg shadow-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-black inline-block" />
                  <span>Preview (Estudio)</span>
                </div>
              )}
            </div>

            {/* Centro: Título de Monitor PC */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-textMuted font-mono">
              <span className="text-white/90 font-bold">MONITOR ESCRITORIO</span>
              <span>•</span>
              <span>1920 × 1080 (16:9)</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">60 FPS</span>
            </div>

            {/* Lado derecho: Indicador de Señal */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-textMuted border border-white/5">
                {isLive ? '🔴 SALIDA OBS LIVE' : '🟡 SALIDA PREVIEW'}
              </span>
            </div>
          </div>

          {/* Pantalla 16:9 con medición responsive */}
          <div
            ref={screenContainerRef}
            className="w-full aspect-video bg-black rounded-xl relative overflow-hidden shadow-inner"
            style={{ height: `${calculatedHeight}px` }}
          >
            <div
              className="w-[1920px] h-[1080px] origin-top-left relative"
              style={{ transform: `scale(${activeScale})` }}
            >
              {children}
            </div>
          </div>

          {/* Bisel inferior del monitor */}
          <div className="flex items-center justify-between px-3 pt-2 text-[10px] text-zinc-500">
            <span className="tracking-widest font-mono text-[9px] uppercase">PANTALLA DE PC / MONITOR DE CONTROL</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="font-mono text-[9px]">{isLive ? 'EN EL AIRE' : 'LISTO'}</span>
            </div>
          </div>
        </div>

        {/* Soporte de la base del monitor */}
        <div className="w-24 h-2 bg-gradient-to-b from-[#27272a] to-[#18181b] rounded-b-md shadow-md" />
        <div className="w-36 h-1 bg-[#27272a]/70 rounded-full shadow-lg" />
      </div>
    );
  }

  // ==========================================
  // 2. MODO MÓVIL ANDROID - HORIZONTAL (LANDSCAPE 16:9)
  // ==========================================
  if (orientation === 'landscape') {
    return (
      <div className="w-full flex flex-col items-center my-3">
        {/* Chasis de Teléfono Android en Horizontal con proporción ergonómica */}
        <div
          className={`w-full max-w-[850px] bg-[#101014] border-[10px] border-[#1f1f23] rounded-[2.5rem] p-2.5 pb-2 shadow-2xl relative transition-all duration-300 ring-1 ring-white/10 ${isLive
            ? 'border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.2)]'
            : 'border-amber-400/40 border-dashed shadow-[0_0_25px_rgba(245,158,11,0.1)]'
            }`}
        >
          {/* Botones físicos superiores de volumen del móvil */}
          <div className="absolute -top-[13px] left-28 w-14 h-[4px] bg-[#333338] rounded-t-sm" />
          <div className="absolute -top-[13px] left-46 w-10 h-[4px] bg-[#333338] rounded-t-sm" />

          {/* Barra superior de información del modo móvil */}
          <div className="flex items-center justify-between px-4 py-1.5 mb-1.5 select-none border-b border-white/5">
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-bold text-white/90">MÓVIL ANDROID (HORIZONTAL)</span>
              <span className="text-[10px] text-zinc-500 font-mono">16:9 Fullscreen</span>
            </div>

            <div className="flex items-center gap-2">
              {isLive ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Live (Móvil)
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow">
                  Preview (Móvil)
                </span>
              )}
              <div className="flex items-center gap-1.5 text-zinc-400 pl-2">
                <Wifi className="w-3 h-3" />
                <BatteryMedium className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Contenedor relativo que alberga la cámara punch hole lateral y la pantalla */}
          <div className="relative flex items-center justify-center">
            {/* Cámara Frontal Punch-hole en el marco lateral izquierdo del teléfono horizontal */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-black ring-2 ring-[#2e2e33] flex items-center justify-center shadow-inner">
                <div className="w-1 h-1 rounded-full bg-blue-900/90" />
              </div>
            </div>

            {/* Pantalla del Teléfono 16:9 que llena el 100% del ancho interior sin huecos */}
            <div
              ref={screenContainerRef}
              className="w-full aspect-video bg-black rounded-xl relative overflow-hidden shadow-inner border border-white/5"
              style={{ height: `${calculatedHeight}px` }}
            >
              {/* Contenido escalado con precisión matemática */}
              <div
                className="w-[1920px] h-[1080px] origin-top-left relative"
                style={{ transform: `scale(${activeScale})` }}
              >
                {children}
              </div>

              {/* Barra de gestos lateral derecha de Android */}
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/30 rounded-full pointer-events-none" />
            </div>
          </div>

          {/* Pie del marco del teléfono */}
          <div className="flex items-center justify-between px-3 pt-2 text-[9px] text-zinc-500 font-mono">
            <span>DISPOSITIVO: SAMSUNG GALAXY / ANDROID FLAGSHIP</span>
            <span>ORIENTACIÓN: HORIZONTAL (PANTALLA COMPLETA)</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. MODO MÓVIL ANDROID - VERTICAL (PORTRAIT 9:16)
  // ==========================================
  return (
    <div className="w-full flex flex-col items-center my-3">
      {/* Chasis de Teléfono Android en Vertical estándar */}
      <div
        className={`w-full max-w-[390px] bg-[#101014] border-[10px] border-[#1f1f23] rounded-[3rem] p-3 pb-2.5 shadow-2xl relative transition-all duration-300 ring-1 ring-white/10 ${isLive
          ? 'border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.2)]'
          : 'border-amber-400/40 border-dashed shadow-[0_0_25px_rgba(245,158,11,0.1)]'
          }`}
      >
        {/* Botones físicos laterales del teléfono */}
        <div className="absolute -left-[13px] top-28 w-[4px] h-12 bg-[#333338] rounded-l-sm" />
        <div className="absolute -left-[13px] top-44 w-[4px] h-12 bg-[#333338] rounded-l-sm" />
        <div className="absolute -right-[13px] top-32 w-[4px] h-14 bg-[#333338] rounded-r-sm" />

        {/* Auricular superior y Cámara Punch-hole centrada */}
        <div className="flex flex-col items-center justify-center pt-0.5 pb-2">
          <div className="w-10 h-1 bg-[#2e2e33] rounded-full mb-1" />
          <div className="w-3.5 h-3.5 rounded-full bg-black ring-2 ring-[#2e2e33] flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/90" />
          </div>
        </div>

        {/* Barra de Estado de Android (Hora, 5G, Batería) */}
        <div className="flex items-center justify-between px-3 py-1 text-[11px] text-zinc-400 font-medium select-none mb-1.5">
          <span className="font-semibold text-white/90">12:00</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-400">5G</span>
            <Wifi className="w-3 h-3 text-zinc-400" />
            <BatteryMedium className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>

        {/* Header de la Pantalla del Móvil: Badge y Título */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-2 bg-[#18181d] rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-black uppercase tracking-wider shadow animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Live (Móvil)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider shadow">
                Preview (Móvil)
              </span>
            )}
            <span className="text-[10px] font-bold text-white/90 truncate max-w-[170px]">
              {projectName}
            </span>
          </div>
          <span className="text-[9px] text-zinc-400 font-mono">Vertical 9:16</span>
        </div>

        {/* Pantalla del Reproductor 16:9 que encaja al 100% de ancho sin recortes */}
        <div
          ref={screenContainerRef}
          className="w-full aspect-video bg-black rounded-xl relative overflow-hidden shadow-inner border border-white/10"
          style={{ height: `${calculatedHeight}px` }}
        >
          {/* Contenido escalado exactamente para que la cancha y la alineación sean 100% visibles */}
          <div
            className="w-[1920px] h-[1080px] origin-top-left relative"
            style={{ transform: `scale(${activeScale})` }}
          >
            {children}
          </div>
        </div>

        {/* Panel informativo de transmisión móvil limpia (Monitor de señal para el operador) */}
        <div className="mt-3 bg-[#15151a] rounded-xl p-2.5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400 font-medium">Resolución renderizada:</span>
            <span className="text-white font-mono font-bold">1920 × 1080 (Escalada a {Math.round(containerWidth)}px)</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400 font-medium">Estado de transmisión:</span>
            <span className={`font-bold flex items-center gap-1 ${isLive ? 'text-red-400' : 'text-amber-400'}`}>
              <Radio className="w-3 h-3" />
              {isLive ? 'Transmitiendo en Vivo' : 'Modo Estudio (Preview)'}
            </span>
          </div>
          <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
            <span>FORMATO: MÓVIL ANDROID ESTÁNDAR</span>
            <span>60 FPS • OBS</span>
          </div>
        </div>

        {/* Barra de Navegación por Gestos de Android en la parte inferior */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-24 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
