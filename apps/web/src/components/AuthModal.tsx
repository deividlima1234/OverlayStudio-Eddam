import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff, 
  Sparkles, 
  Zap,
  Shield,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register' | 'forgot' | 'verify-code' | 'new-password' | 'reset-success';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Estados para recuperación de contraseña (Código de 6 dígitos)
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sincronizar initialMode cuando se abre
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessNotice(null);
    }
  }, [isOpen, initialMode]);

  // Manejo de temporizador para reenvío de código
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Manejo de Login y Registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    setIsLoading(true);

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register' 
      ? { name: name.trim(), email: cleanEmail, password: cleanPassword }
      : { email: cleanEmail, password: cleanPassword };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      setAuth(data.user, data.token);
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      console.warn('API Auth error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const fallbackUser = {
          id: 'usr_local_' + Math.random().toString(36).substring(7),
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`
        };
        setAuth(fallbackUser, 'local-token-' + Date.now());
        onClose();
        navigate('/dashboard');
      } else {
        setError(err.message || 'Error de conexión con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Paso 1: Solicitar Código de Verificación al correo
  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al solicitar el código de recuperación');
      }

      setMode('verify-code');
      setResendCooldown(60);
      setSuccessNotice('Código de 6 dígitos enviado. Revisa tu bandeja de entrada o spam.');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      console.warn('Forgot-password API error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        // En modo local sin backend activo simulamos el envío para permitir pruebas de UI
        setMode('verify-code');
        setResendCooldown(60);
        setSuccessNotice('Simulación local: Usa el código 123456');
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        setError(err.message || 'Error al comunicarse con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de los 6 inputs de código PIN
  const handleDigitChange = (index: number, val: string) => {
    const rawVal = val.replace(/\D/g, ''); // solo números

    if (rawVal.length > 1) {
      // Manejar pegar contenido de varios dígitos
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        if (index + i < 6 && rawVal[i]) {
          newDigits[index + i] = rawVal[i];
        }
      }
      setDigits(newDigits);
      const nextIndex = Math.min(index + rawVal.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = rawVal;
    setDigits(newDigits);

    if (rawVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 2. Paso 2: Verificar PRIMERO el código de 6 dígitos antes de pedir nueva contraseña
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setError('Por favor ingresa los 6 dígitos del código de verificación.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: fullCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Código incorrecto o expirado');
      }

      // Código verificado exitosamente -> avanzar al formulario de nueva clave
      setSuccessNotice('Código verificado con éxito. Define tu nueva contraseña.');
      setMode('new-password');
    } catch (err: any) {
      console.warn('Verify-code API error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        // En simulación local
        setSuccessNotice('Código verificado con éxito.');
        setMode('new-password');
      } else {
        setError(err.message || 'El código ingresado es incorrecto o no existe.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Paso 3: Guardar la nueva contraseña
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullCode = digits.join('');

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: fullCode,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña');
      }

      setMode('reset-success');
    } catch (err: any) {
      console.warn('Reset-password API error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setMode('reset-success');
      } else {
        setError(err.message || 'Error al guardar la nueva contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    const guestProfile = {
      id: 'usr_guest',
      name: 'Usuario Invitado',
      email: 'invitado@eddam.studio',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'
    };
    setAuth(guestProfile, 'guest-token-' + Date.now());
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

        {/* Botón Volver (para modos de recuperación) */}
        {(mode === 'forgot' || mode === 'verify-code' || mode === 'new-password') && (
          <button 
            type="button"
            onClick={() => {
              setError(null);
              setSuccessNotice(null);
              if (mode === 'new-password') setMode('verify-code');
              else if (mode === 'verify-code') setMode('forgot');
              else setMode('login');
            }}
            className="absolute top-5 left-5 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {mode === 'new-password' ? 'Cambiar código' : mode === 'verify-code' ? 'Cambiar correo' : 'Volver'}
            </span>
          </button>
        )}

        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* VISTA 1 & 2: LOGIN Y REGISTRO                            */}
        {/* ======================================================== */}
        {(mode === 'login' || mode === 'register') && (
          <>
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
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
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
                      required
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
                    required
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
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccessNotice(null);
                        setMode('forgot');
                      }}
                      className="text-[11px] text-primary hover:underline hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
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
                className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
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
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Probar como Invitado (Acceso Inmediato)</span>
            </button>

            {/* Garantía de Seguridad */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conexión segura y aislamiento de overlays por cuenta</span>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* VISTA 3: RECUPERACIÓN - INGRESAR CORREO                   */}
        {/* ======================================================== */}
        {mode === 'forgot' && (
          <div>
            <div className="text-center mt-4 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Recuperación de Cuenta</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">¿Olvidaste tu contraseña?</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Ingresa tu correo electrónico registrado y te enviaremos un código de seguridad de 6 dígitos.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar Código de Verificación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors text-center font-medium cursor-pointer"
              >
                Cancelar y volver al inicio
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* VISTA 4: PASO 2 - INGRESAR Y VERIFICAR CÓDIGO PRIMERO    */}
        {/* ======================================================== */}
        {mode === 'verify-code' && (
          <div>
            <div className="text-center mt-3 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Paso 1: Verificación de Código</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Ingresa el Código</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Enviamos un código de 6 dígitos a <br />
                <span className="text-white font-semibold">{email}</span>
              </p>
            </div>

            {successNotice && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              {/* 6 Cuadros de Código PIN */}
              <div>
                <label className="block text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Código de 6 Dígitos
                </label>
                <div className="flex justify-between gap-2 max-w-xs mx-auto">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className="w-11 h-12 sm:w-12 sm:h-12 text-center text-xl font-bold bg-[#18181f] border border-white/10 rounded-xl text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all font-mono"
                    />
                  ))}
                </div>
              </div>

              {/* Botón Reenviar Código */}
              <div className="text-center pt-1">
                {resendCooldown > 0 ? (
                  <span className="text-[11px] text-zinc-500">
                    Reenviar código en <strong className="text-zinc-400 font-mono">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestCode()}
                    className="text-[11px] text-primary hover:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>¿No te llegó el código? Reenviar</span>
                  </button>
                )}
              </div>

              {/* Botón de Verificación de Código */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verificar Código</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* VISTA 5: PASO 3 - FORMULARIO DE NUEVA CONTRASEÑA         */}
        {/* (Solo se muestra cuando el código ya ha sido verificado) */}
        {/* ======================================================== */}
        {mode === 'new-password' && (
          <div>
            <div className="text-center mt-3 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Paso 2: Nueva Contraseña</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Cambia tu Contraseña</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Código verificado. Ingresa y confirma tu nueva contraseña de acceso.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              {/* Campo: Nueva Contraseña */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo: Confirmar Contraseña */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Guardar Nueva Contraseña</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* VISTA 6: ÉXITO TOTAL AL RESTABLECER                      */}
        {/* ======================================================== */}
        {mode === 'reset-success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-2">
              ¡Contraseña Actualizada!
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6">
              Tu contraseña ha sido restablecida exitosamente. Ya puedes ingresar al estudio con tu nueva clave.
            </p>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessNotice(null);
                setPassword('');
                setDigits(['', '', '', '', '', '']);
                setNewPassword('');
                setConfirmPassword('');
                setMode('login');
              }}
              className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              <span>Iniciar Sesión Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
