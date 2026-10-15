/**
 * Motor de Detección y Extracción Dinámica de Variables de Overlay
 * Eddam Overlay Studio
 */

export interface OverlayVariableDef {
  id: string;
  label: string;
  defaultValue?: string;
  type?: 'text' | 'textarea';
  placeholder?: string;
}

/**
 * Convierte un identificador como 'eddam-main-title' o 'tema_debate' o 'nombreInvitado'
 * en un título legible para el operador: 'Main Title', 'Tema Debate', 'Nombre Invitado'.
 */
export function formatIdToLabel(id: string): string {
  // Remover prefijo común 'eddam-' si existe
  const cleaned = id.replace(/^eddam[-_]/i, '');
  
  // Convertir camelCase a palabras separadas
  const separated = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Reemplazar guiones y guiones bajos por espacios
  const withSpaces = separated.replace(/[-_]+/g, ' ').trim();
  
  if (!withSpaces) return id.toUpperCase();

  // Capitalizar cada palabra
  return withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Analiza un string de código HTML de un overlay y extrae todas las variables dinámicas
 * usando primero el bloque formal de metadata EDDAM_VARIABLES, o mediante escaneo heurístico de IDs y {{tags}}.
 */
export function parseOverlayVariables(code: string): OverlayVariableDef[] {
  if (!code || typeof code !== 'string') return [];

  const variables: OverlayVariableDef[] = [];
  const seenIds = new Set<string>();

  // =========================================================================
  // Método 1: Detección formal vía bloque JSON <!-- EDDAM_VARIABLES: [...] -->
  // =========================================================================
  const jsonBlockRegex = /<!--\s*EDDAM_VARIABLES:\s*(\[[\s\S]*?\])\s*-->/i;
  const jsonMatch = code.match(jsonBlockRegex);

  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.id === 'string' && item.id.trim()) {
            const cleanId = item.id.trim();
            if (!seenIds.has(cleanId)) {
              seenIds.add(cleanId);
              variables.push({
                id: cleanId,
                label: typeof item.label === 'string' && item.label.trim() 
                  ? item.label.trim() 
                  : formatIdToLabel(cleanId),
                defaultValue: typeof item.default === 'string' 
                  ? item.default 
                  : typeof item.defaultValue === 'string' 
                  ? item.defaultValue 
                  : '',
                type: item.type === 'textarea' ? 'textarea' : 'text',
                placeholder: typeof item.placeholder === 'string' ? item.placeholder : undefined
              });
            }
          }
        }

        // Si se encontraron variables formales, las devolvemos directamente
        if (variables.length > 0) {
          return variables;
        }
      }
    } catch (err) {
      console.warn('Error al parsear bloque EDDAM_VARIABLES JSON:', err);
    }
  }

  // =========================================================================
  // Método 2: Extracción Inteligente por IDs HTML y data-label
  // =========================================================================
  // Excluimos IDs técnicos que suelen ser contenedores generales
  const ignoredIds = new Set([
    'root', 'app', 'container', 'wrapper', 'main', 'overlay', 'background', 
    'bg', 'canvas', 'video', 'stream', 'layer'
  ]);

  // Regex para buscar elementos HTML con ID y su contenido de texto inmediato
  const elementWithIdRegex = /<([a-zA-Z0-9]+)[^>]*?\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = elementWithIdRegex.exec(code)) !== null) {
    const tagName = match[1].toLowerCase();
    const id = match[2].trim();
    const innerContent = match[3];

    // Ignorar etiquetas que no sean de texto (ej. svg, path, script, style)
    if (['svg', 'path', 'script', 'style', 'canvas', 'img', 'video', 'audio'].includes(tagName)) {
      continue;
    }

    if (ignoredIds.has(id.toLowerCase())) {
      continue;
    }

    // Extraer texto plano despojando etiquetas HTML anidadas simples
    const plainText = innerContent.replace(/<[^>]+>/g, '').trim();

    // Solo considerar elementos que tengan texto visible o prefijo semántico
    const isSemantic = id.toLowerCase().startsWith('eddam-') || 
                      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'b', 'i', 'label'].includes(tagName);

    if (isSemantic && !seenIds.has(id)) {
      seenIds.add(id);

      // Buscar si tiene data-label especificado
      const dataLabelMatch = match[0].match(/data-label=["']([^"']+)["']/i);
      const customLabel = dataLabelMatch ? dataLabelMatch[1].trim() : formatIdToLabel(id);

      // Si el texto es largo o es un párrafo, sugerir tipo textarea
      const isLongText = plainText.length > 60 || tagName === 'p';

      variables.push({
        id,
        label: customLabel,
        defaultValue: plainText,
        type: isLongText ? 'textarea' : 'text',
        placeholder: `Ej: ${plainText || customLabel}`
      });
    }
  }

  // =========================================================================
  // Método 3: Extracción de variables tipo {{variable}}
  // =========================================================================
  const curlyRegex = /{{\s*([a-zA-Z0-9_-]+)\s*}}/g;
  let curlyMatch: RegExpExecArray | null;

  while ((curlyMatch = curlyRegex.exec(code)) !== null) {
    const varName = curlyMatch[1].trim();
    if (varName && !seenIds.has(varName)) {
      seenIds.add(varName);
      variables.push({
        id: varName,
        label: formatIdToLabel(varName),
        defaultValue: '',
        type: 'text',
        placeholder: `Valor para {{${varName}}}`
      });
    }
  }

  return variables;
}

/**
 * Obtiene un objeto mapa { [id]: valor } a partir de las definiciones de variables
 */
export function extractInitialValues(defs: OverlayVariableDef[], currentValues?: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = { ...(currentValues || {}) };

  defs.forEach(def => {
    // Si el valor no existe o está vacío y la definición tiene un defaultValue, asignarlo
    if (result[def.id] === undefined && def.defaultValue !== undefined) {
      result[def.id] = def.defaultValue;
    }
  });

  return result;
}
