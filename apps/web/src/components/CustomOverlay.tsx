import { useEffect, useRef, useMemo } from 'react';
import { useOverlayStore } from '../store/useOverlayStore';

interface CustomOverlayProps {
  className?: string;
}

export default function CustomOverlay({ className = '' }: CustomOverlayProps) {
  const { customCode, isVisible, customVariables } = useOverlayStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Procesar el HTML inyectando las variables dinámicas si existen
  const processedHtml = useMemo(() => {
    if (!customCode) return '';
    let html = customCode;

    // Si hay variables personalizadas, reemplazar en el HTML antes de renderizar
    if (customVariables && Object.keys(customVariables).length > 0) {
      Object.entries(customVariables).forEach(([key, val]) => {
        // Reemplazo de sintaxis {{clave}}
        const regexCurly = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(regexCurly, String(val));
      });
    }
    return html;
  }, [customCode, customVariables]);

  // Actualizar elementos por ID si existen en customVariables en tiempo real
  useEffect(() => {
    if (!containerRef.current || !customVariables) return;
    Object.entries(customVariables).forEach(([id, val]) => {
      const el = containerRef.current?.querySelector(`#${id}`);
      if (el) {
        el.textContent = String(val);
      }
    });
  }, [customVariables, processedHtml]);

  // Ejecutar scripts incluidos en el código del usuario de manera segura
  useEffect(() => {
    if (!containerRef.current) return;
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [processedHtml]);

  if (!customCode) {
    return null;
  }

  return (
    <div 
      className={`w-full h-full absolute inset-0 pointer-events-none transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${className}`}
      style={{
        transitionProperty: 'opacity, transform',
        visibility: isVisible ? 'visible' : 'hidden'
      }}
    >
      <div 
        ref={containerRef}
        className="w-full h-full relative"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </div>
  );
}
