import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    checkAuth().finally(() => {
      if (isMounted) setIsChecking(false);
    });
    return () => { isMounted = false; };
  }, [checkAuth]);

  // Si está verificando el token inicial, mostrar pantalla de carga minimalista
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
        <span className="text-xs text-zinc-400 font-mono tracking-wider uppercase">
          Verificando sesión de estudio...
        </span>
      </div>
    );
  }

  // Si no está autenticado, redirigir a la landing page
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
