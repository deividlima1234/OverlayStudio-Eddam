import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Zap,
  Shield
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (mode === 'register' && !name) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    setIsLoading(true);

    // Simulación de autenticación (que conectará con la API en la Fase 2)
    setTimeout(() => {
      setIsLoading(false);
      // Guardar sesión temporal en localStorage
      const userProfile = {
        name: name || (email.split('@')[0].toUpperCase()),
        email: email,
        token: 'demo-jwt-token-' + Date.now(),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
      };
      localStorage.setItem('eddam_user', JSON.stringify(userProfile));
      onClose();
      navigate('/dashboard');
    }, 800);
  };

  const handleGuestAccess = () => {
    const guestProfile = {
      name: 'Usuario Invitado',
      email: 'invitado@eddam.studio',
      token: 'guest-token-' + Date.now(),
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'
    };
    localStorage.setItem('eddam_user', JSON.stringify(guestProfile));
    onClose();
    navigate('/dashboard');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#121216] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luces de acento de fondo */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Eddam Overlay Studio</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {mode === 'login' ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta de Estudio'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login' 
              ? 'Accede para gestionar tus overlays en vivo para OBS Studio' 
              : 'Empieza a transmitir con gráficos profesionales en minutos'}
          </p>
        </div>

        {/* Selector de Pestañas (Login / Register) */}
        <div className="flex bg-[#1a1a22] p-1 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Nombre Completo o Canal
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez / Liga Deportes"
                  className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Contraseña
              </label>
              {mode === 'login' && (
                <span className="text-[11px] text-primary hover:underline cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-[#18181f] border-white/10 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="remember" className="text-xs text-zinc-400 select-none cursor-pointer">
                Recordar mi sesión en este equipo
              </label>
            </div>
          )}

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar al Estudio' : 'Crear Cuenta y Comenzar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">O también</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Acceso Rápido / Modo Invitado */}
        <button
          type="button"
          onClick={handleGuestAccess}
          className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Probar como Invitado (Acceso Inmediato)</span>
        </button>

        {/* Garantía de Seguridad */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Conexión cifrada de extremo a extremo con OBS Studio</span>
        </div>
      </div>
    </div>
  );
}
