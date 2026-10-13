export interface OverlayStarterTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  code: string;
}

export const OVERLAY_STARTER_TEMPLATES: OverlayStarterTemplate[] = [
  {
    id: 'blank',
    name: 'Lienzo en Blanco',
    category: 'Básico',
    badge: 'Personalizado',
    description: 'Estructura base limpia a 1920x1080 con fondo transparente lista para programar desde cero.',
    code: `<!-- Eddam Overlay Studio - Lienzo en Blanco (1920x1080) -->
<div class="w-full h-full flex items-center justify-center p-12 select-none">
  <div class="bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl p-8 text-white text-center shadow-2xl max-w-xl">
    <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold">
      ⚡
    </div>
    <h1 class="text-3xl font-extrabold tracking-tight">Eddam Overlay Studio</h1>
    <p class="text-sm text-gray-300 mt-2">Lienzo en Blanco preparado a 1920x1080 para OBS Studio.</p>
    <div class="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
      Fondo 100% transparente • Listo para programar o personalizar con IA
    </div>
  </div>
</div>`
  },
  {
    id: 'reportaje',
    name: 'Reportaje / Noticiero (Lower Third)',
    category: 'Noticias & Directos',
    badge: 'Popular',
    description: 'Cintillo informativo inferior para despachos, entrevistas y coberturas en directo.',
    code: `<!-- Eddam Overlay Studio - Lower Third para Reportaje / Noticiero -->
<div class="w-full h-full flex flex-col justify-end p-12 select-none">
  <div class="max-w-3xl flex flex-col gap-2.5 animate-slide-up">
    
    <!-- Badge Superior con animación en vivo -->
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white font-black text-xs tracking-widest uppercase rounded-md shadow-lg shadow-red-900/50">
        <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        EN DIRECTO
      </span>
      <span class="px-3 py-1 bg-black/80 backdrop-blur-md text-gray-200 font-semibold text-xs tracking-wider rounded-md border border-white/10" id="eddam-location">
        📍 COBERTURA ESPECIAL
      </span>
    </div>

    <!-- Placa Principal con Glassmorphism -->
    <div class="bg-gradient-to-r from-black/95 via-gray-900/90 to-black/80 backdrop-blur-xl border-l-4 border-l-red-500 border-y border-r border-white/10 rounded-r-xl p-5 shadow-2xl flex flex-col gap-1">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase drop-shadow" id="eddam-title">
        INFORME EN VIVO: DESARROLLO DE LA TRANSMISIÓN
      </h1>
      <div class="flex items-center gap-3 text-sm font-medium text-gray-300 mt-1">
        <span class="text-red-400 font-bold" id="eddam-author">Juan Carlos Pérez</span>
        <span class="text-gray-500">|</span>
        <span class="text-gray-300" id="eddam-role">Corresponsal en Terreno</span>
      </div>
    </div>

  </div>
</div>`
  },
  {
    id: 'conferencia',
    name: 'Evento en Vivo / Conferencia',
    category: 'Eventos & Charlas',
    badge: 'Elegante',
    description: 'Tarjeta flotante para identificar ponentes, panelistas y conferencistas en streaming.',
    code: `<!-- Eddam Overlay Studio - Ponente en Conferencia -->
<div class="w-full h-full flex flex-col justify-end items-start p-14 select-none">
  <div class="bg-gray-950/90 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl flex items-center gap-5 max-w-2xl border-l-8 border-l-blue-500 animate-slide-up">
    <div class="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-black text-2xl shrink-0">
      🎤
    </div>
    <div class="flex flex-col">
      <span class="text-xs font-bold uppercase tracking-widest text-blue-400" id="eddam-event">
        CUMBRE DE TECNOLOGÍA & MEDIOS 2026
      </span>
      <h2 class="text-2xl font-black text-white tracking-tight mt-0.5" id="eddam-speaker">
        Dra. Carolina Méndez
      </h2>
      <p class="text-sm text-gray-300 font-medium mt-0.5" id="eddam-role">
        Directora de Innovación Digital & Streaming
      </p>
    </div>
  </div>
</div>`
  },
  {
    id: 'breaking-news',
    name: 'Última Hora / Breaking News',
    category: 'Noticias & Directos',
    badge: 'Urgente',
    description: 'Cintillo inferior completo con alerta parpadeante de última hora y cintillo continuo.',
    code: `<!-- Eddam Overlay Studio - Cintillo de Última Hora -->
<div class="w-full h-full flex flex-col justify-end p-0 select-none">
  <div class="w-full flex items-stretch shadow-2xl border-t-2 border-red-500 bg-black/95 backdrop-blur-xl text-white">
    <div class="bg-red-600 px-8 py-3.5 flex items-center gap-2.5 font-black text-lg tracking-widest uppercase shrink-0 shadow-lg shadow-red-900/50">
      <span class="w-3 h-3 rounded-full bg-white animate-ping"></span>
      ÚLTIMA HORA
    </div>
    <div class="flex-1 px-6 py-3.5 flex items-center overflow-hidden">
      <p class="text-lg font-bold text-gray-100 tracking-wide truncate" id="eddam-headline">
        COMUNICADO OFICIAL: AVANCES Y RESOLUCIONES EN TIEMPO REAL
      </p>
    </div>
    <div class="bg-gray-900 px-6 py-3.5 border-l border-white/10 flex items-center text-xs font-mono font-bold text-gray-400">
      EDDAM LIVE
    </div>
  </div>
</div>`
  },
  {
    id: 'publicidad-creativa',
    name: 'Banner Publicitario Creativo',
    category: 'Publicidad & Sponsors',
    badge: 'Comercial',
    description: 'Popup publicitario moderno en esquina inferior derecha con llamada a la acción.',
    code: `<!-- Eddam Overlay Studio - Banner Publicitario Creativo -->
<div class="w-full h-full flex flex-col justify-end items-end p-12 select-none">
  <div class="bg-gradient-to-br from-indigo-950/95 via-gray-950/95 to-black/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 shadow-2xl max-w-md border-r-4 border-r-indigo-500 animate-slide-up flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <span class="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider rounded border border-indigo-500/30">
        Auspiciador Oficial
      </span>
      <span class="text-xs text-gray-400 font-mono">EDDAM MEDIA</span>
    </div>
    <h3 class="text-xl font-black text-white leading-tight" id="eddam-ad-title">
      Impulsa tu Marca en Alta Definición
    </h3>
    <p class="text-xs text-gray-300 leading-relaxed" id="eddam-ad-desc">
      Soluciones gráficas en tiempo real para eventos, streaming y broadcast profesional.
    </p>
    <div class="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-indigo-300">
      <span>📞 +51 983 032 706</span>
      <span>🌐 eddam.studio</span>
    </div>
  </div>
</div>`
  }
];

export const generateAIPrompt = (overlayType: string = 'reportaje en vivo') => {
  return `Actúa como un desarrollador experto en gráficos en tiempo real y transmisión para OBS Studio (Eddam Overlay Studio).

Necesito que generes el código para un OVERLAY de: "${overlayType}".

REQUISITOS TÉCNICOS ESTRICTOS DE EDDAM OVERLAY STUDIO:
1. Resolución nativa: 1920x1080 (Full HD).
2. Fondo transparente: El contenedor raíz debe ocupar "w-full h-full" con fondo 100% transparente para que la señal de video de OBS se vea debajo sin obstrucciones.
3. Estilos: Utiliza clases utilitarias de Tailwind CSS modernas (glassmorphism con backdrop-blur, degradados oscuros semitransparentes bg-black/80 o bg-gray-950/90, bordes finos border-white/10, sombras shadow-2xl).
4. Animaciones: Agrega animaciones CSS sutiles y elegantes (animate-slide-up, animate-pulse, transiciones suaves).
5. Textos e IDs dinámicos: Asigna IDs semánticos a los elementos editables (por ejemplo id="eddam-title", id="eddam-subtitle", id="eddam-author", id="eddam-location") para que el operador pueda cambiar los textos en vivo.
6. Tipografía y legibilidad: Usa fuentes limpias, textos en negrita (font-black o font-extrabold), tracking cuidado y buen contraste para pantallas de transmisión.
7. Formato de entrega: Devuelve ÚNICAMENTE el bloque HTML envuelto en un contenedor raíz:
   <div class="w-full h-full ...">
     ...
   </div>
   No incluyas etiquetas <html> ni <body>, solo el código interno listo para copiar y compilar.`;
};
