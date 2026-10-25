import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Copy, 
  Check, 
  Dices, 
  Save, 
  Monitor, 
  CheckCircle2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { getApiUrl } from '../utils/apiUrl';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'perfil' | 'seguridad' | 'preferencias';

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser, getAuthHeaders } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('perfil');

  // Formulario Perfil
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Formulario Seguridad
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Formulario Preferencias (guardadas en localStorage)
  const [defaultResolution, setDefaultResolution] = useState('1080p');
  const [autoCopyUrl, setAutoCopyUrl] = useState(true);
  const [highPerformance, setHighPerformance] = useState(true);

  // Estados UI
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email || 'user')}`);
    }

    // Cargar preferencias locales
    const savedRes = localStorage.getItem('eddam_pref_res');
    if (savedRes) setDefaultResolution(savedRes);

    const savedAutoCopy = localStorage.getItem('eddam_pref_autocopy');
    if (savedAutoCopy !== null) setAutoCopyUrl(savedAutoCopy === 'true');

    const savedHighPerf = localStorage.getItem('eddam_pref_perf');
    if (savedHighPerf !== null) setHighPerformance(savedHighPerf === 'true');
  }, [user, isOpen]);

  // Limpiar mensajes al cambiar pestaña
  useEffect(() => {
    setStatusMessage(null);
  }, [activeTab]);

  if (!isOpen || !user) return null;

  const API_URL = getApiUrl();

  // Generar semilla aleatoria para avatar
  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    const newAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    setAvatar(newAvatarUrl);
  };

  // Copiar ID de usuario
  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Guardar Cambios de Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'El nombre no puede estar vacío.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ name: name.trim(), avatar })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el perfil');
      }

      updateUser({ name: name.trim(), avatar });
      setStatusMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
    } catch (err: any) {
      console.warn('Profile update error:', err);
      // Fallback local si la API estuviera desconectada
      updateUser({ name: name.trim(), avatar });
      setStatusMessage({ type: 'success', text: 'Perfil guardado exitosamente en este equipo.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar Cambio de Contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPassword) {
      setStatusMessage({ type: 'error', text: 'Ingresa tu contraseña actual.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'La nueva contraseña debe tener mínimo 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al conectar con el servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar Preferencias de Estudio
  const handleSavePreferences = () => {
    localStorage.setItem('eddam_pref_res', defaultResolution);
    localStorage.setItem('eddam_pref_autocopy', String(autoCopyUrl));
    localStorage.setItem('eddam_pref_perf', String(highPerformance));
    setStatusMessage({ type: 'success', text: 'Preferencias guardadas para este navegador.' });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luces de acento de fondo */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado con Perfil Resumido */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="relative group">
            <img 
              src={avatar} 
              alt="Avatar" 
              className="w-16 h-16 rounded-2xl bg-primary/20 p-1 border-2 border-primary/40 shadow-lg shadow-primary/20 object-cover"
            />
            <button
              type="button"
              onClick={handleRandomAvatar}
              title="Generar avatar aleatorio"
              className="absolute -bottom-1 -right-1 bg-primary hover:bg-primaryHover p-1.5 rounded-lg text-white shadow-md transition-all active:scale-90 cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white truncate">{user.name}</h2>
              <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Pro
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate">
                ID: {user.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title="Copiar ID de Usuario"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex bg-[#1a1a22] p-1 rounded-xl mb-6 border border-white/5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'perfil'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfil</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seguridad')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'seguridad'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Seguridad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferencias')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preferencias'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Estudio OBS</span>
          </button>
        </div>

        {/* Mensaje de Estado (Éxito / Error) */}
        {statusMessage && (
          <div 
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/10 border border-red-500/20 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 1: PERFIL GENERAL                                */}
        {/* ======================================================== */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Nombre de Usuario o Canal
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre o nombre del canal"
                  className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Correo Electrónico (Asociado)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-[#18181f]/60 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-400 cursor-not-allowed outline-none"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                El correo es el identificador principal de tu cuenta y no puede modificarse directamente.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  URL del Avatar
                </label>
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="text-[11px] text-primary hover:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Dices className="w-3 h-3" />
                  <span>Aleatorio</span>
                </button>
              </div>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://ejemplo.com/avatar.png"
                className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-500 font-mono outline-none focus:border-primary transition-all"
              />
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
                  <Save className="w-4 h-4" />
                  <span>Guardar Información de Perfil</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: SEGURIDAD (CAMBIO DE CONTRASEÑA)               */}
        {/* ======================================================== */}
        {activeTab === 'seguridad' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Contraseña Actual
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Nueva Contraseña
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
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

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Actualizar Contraseña</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 3: PREFERENCIAS OBS & TRANSMISIÓN                */}
        {/* ======================================================== */}
        {activeTab === 'preferencias' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Resolución Predeterminada de Overlays
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1080p', label: '1080p Full HD', desc: '1920 × 1080' },
                  { id: '720p', label: '720p HD', desc: '1280 × 720' },
                  { id: '4k', label: '4K Ultra HD', desc: '3840 × 2160' },
                ].map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setDefaultResolution(res.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      defaultResolution === res.id
                        ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/10'
                        : 'bg-[#18181f] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">{res.label}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{res.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#18181f] border border-white/10 cursor-pointer">
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Copiar URL de OBS automáticamente</div>
                  <div className="text-[10px] text-zinc-400">Copia la URL al portapapeles inmediatamente al crear overlays</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoCopyUrl}
                  onChange={(e) => setAutoCopyUrl(e.target.checked)}
                  className="rounded bg-[#121217] border-white/20 text-primary focus:ring-primary h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#18181f] border border-white/10 cursor-pointer">
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Aceleración por Hardware (GPU)</div>
                  <div className="text-[10px] text-zinc-400">Optimiza renderizado de transiciones en OBS Browser Source</div>
                </div>
                <input
                  type="checkbox"
                  checked={highPerformance}
                  onChange={(e) => setHighPerformance(e.target.checked)}
                  className="rounded bg-[#121217] border-white/20 text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-95 mt-4 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Preferencias de Estudio</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
