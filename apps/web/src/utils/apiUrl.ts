/**
 * Obtiene la URL base de la API automáticamente.
 * - Si se define VITE_API_URL en el build, se usa esa URL.
 * - Si estamos en un VPS o servidor de producción (Nginx Reverse Proxy),
 *   se usa string vacío "" para que las peticiones vayan al mismo dominio (/api).
 * - En desarrollo local (localhost), usa http://localhost:3000.
 */
export const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';
  }

  return 'http://localhost:3000';
};
