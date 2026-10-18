import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutTemplate, 
  PlusCircle, 
  MonitorPlay, 
  Settings, 
  Copy, 
  X, 
  Check, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Code2,
  Megaphone,
  Trophy,
  Users,
  Sparkles,
  FileCode,
  Home,
  LogOut
} from 'lucide-react';
import { OVERLAY_STARTER_TEMPLATES, generateAIPrompt } from '../templates/overlayTemplates';
import { useAuthStore } from '../store/useAuthStore';
import ProfileModal from '../components/ProfileModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, getAuthHeaders } = useAuthStore();

  // Modal de Perfil y Configuración
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Estado para los proyectos desde la DB
  const [projects, setProjects] = useState<any[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    setIsProjectsLoading(true);
    fetch(`${API_URL}/api/overlays`, {
      headers: { ...getAuthHeaders() }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          // Mapeamos los datos de la DB para la UI
          setProjects(data.map((p: any) => ({ ...p, overlays: p.type === 'publicidad' || p.type === 'custom' ? 1 : 3 })));
        } else {
          // Proyectos de inicio limpios para nuevos usuarios
          setProjects([]);
        }
      })
      .catch(e => {
        console.error(e);
        setProjects([]);
      })
      .finally(() => setIsProjectsLoading(false));
  }, []);

  // Modal de Creación de Proyecto
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newProjectType, setNewProjectType] = useState<'custom' | 'publicidad' | 'scoreboard' | 'lineup'>('custom');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('reportaje');
  const [customCodeInput, setCustomCodeInput] = useState<string>(
    OVERLAY_STARTER_TEMPLATES.find(t => t.id === 'reportaje')?.code || OVERLAY_STARTER_TEMPLATES[0].code
  );
  const [activeCodeTab, setActiveCodeTab] = useState<'code' | 'prompt'>('code');
  const [promptTopic, setPromptTopic] = useState('transmisión de un reportaje en vivo');
  const [promptCopied, setPromptCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setNewProjectName(val);
    setNewProjectId(slugify(val));
  };

  const openCreateModal = (type: 'custom' | 'publicidad' = 'custom') => {
    setNewProjectType(type);
    if (type === 'publicidad') {
      const defaultName = 'Publicidad & Auspiciadores ' + (projects.filter(p => p.type === 'publicidad').length + 1);
      setNewProjectName(defaultName);
      setNewProjectId(slugify(defaultName));
    } else {
      setNewProjectName('');
      setNewProjectId('');
      setSelectedTemplateId('reportaje');
      setCustomCodeInput(OVERLAY_STARTER_TEMPLATES.find(t => t.id === 'reportaje')?.code || OVERLAY_STARTER_TEMPLATES[0].code);
    }
    setActiveCodeTab('code');
    setIsCreateOpen(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = OVERLAY_STARTER_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setCustomCodeInput(tmpl.code);
    }
  };

  const handleCopyPrompt = () => {
    const text = generateAIPrompt(promptTopic || newProjectName || 'reportaje en vivo');
    navigator.clipboard.writeText(text);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const submitCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;

    const trimmedName = newProjectName.trim();
    if (!trimmedName) {
      showToast('Por favor ingresa un nombre para el proyecto', 'error');
      return;
    }

    const finalId = newProjectId.trim() || slugify(trimmedName) || ('proj-' + Math.random().toString(36).substring(7));
    
    if (projects.some(p => p.id === finalId)) {
      showToast(`Ya existe un proyecto con el ID "${finalId}". Elige otro ID único.`, 'error');
      return;
    }

    setIsCreating(true);
    try {
      let initialSettings: any = { isVisible: true };

      if (newProjectType === 'custom') {
        initialSettings = {
          isVisible: true,
          customCode: customCodeInput,
          customTemplate: selectedTemplateId
        };
      } else if (newProjectType === 'publicidad') {
        initialSettings = {
          isVisible: true,
          isAdVisible: true,
          isSponsorVisible: true,
          isTickerVisible: true,
          isPopupVisible: true
        };
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/overlays/${finalId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: trimmedName,
          type: newProjectType,
          settings: initialSettings
        })
      });

      if (!res.ok) {
        throw new Error(`Código ${res.status}`);
      }

      setIsCreateOpen(false);
      showToast(`Proyecto "${trimmedName}" creado con éxito.`, 'success');
      navigate(`/editor/${finalId}`);
    } catch (err: any) {
      console.error('Error al crear proyecto:', err);
      showToast(`Error al crear proyecto: ${err.message || 'Error de conexión'}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const [modalProject, setModalProject] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editId, setEditId] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteProj, setDeleteProj] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(curr => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const openModal = (e: React.MouseEvent, proj: any) => {
    e.stopPropagation();
    setModalProject(proj);
    setEditName(proj.name);
    setEditId(proj.id);
    setCopied(false);
  };

  const saveSettings = async () => {
    if (modalProject) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        const res = await fetch(`${API_URL}/api/overlays/${editId}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ name: editName, type: modalProject.type, settings: modalProject.settings })
        });
        
        if (!res.ok) {
          throw new Error(`Código ${res.status}`);
        }

        if (editId !== modalProject.id) {
           setProjects(prev => [...prev.filter(p => p.id !== modalProject.id), { ...modalProject, id: editId, name: editName }]);
        } else {
           setProjects(prev => prev.map(p => p.id === modalProject.id ? { ...p, name: editName } : p));
        }
        showToast('Configuración del proyecto guardada con éxito.', 'success');
      } catch (e: any) {
        console.error(e);
        showToast(`Error al guardar configuración: ${e.message || 'Error de conexión'}`, 'error');
      }
    }
    setModalProject(null);
  };

  const handleDelete = async () => {
    if (!deleteProj || isDeleting) return;
    setIsDeleting(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const projNameToDelete = deleteProj.name;
    try {
      const res = await fetch(`${API_URL}/api/overlays/${deleteProj.id}`, { 
        method: 'DELETE',
        headers: { ...getAuthHeaders() }
      });
      if (!res.ok) {
        throw new Error(`Código ${res.status}`);
      }
      setProjects(prev => prev.filter(p => p.id !== deleteProj.id));
      setDeleteProj(null);
      showToast(`Proyecto "${projNameToDelete}" eliminado con éxito.`, 'success');
    } catch(e: any) {
      console.error('Error al eliminar overlay:', e);
      showToast(`Error al eliminar "${projNameToDelete}": ${e.message || 'No se pudo conectar con el servidor'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyUrl = () => {
    if (modalProject) {
      const url = `${window.location.origin}/render/${editId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getProjectTypeBadge = (type: string) => {
    switch (type) {
      case 'custom':
        return (
          <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1">
            <Code2 className="w-3 h-3" /> Código / IA
          </span>
        );
      case 'publicidad':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1">
            <Megaphone className="w-3 h-3" /> Publicidad
          </span>
        );
      case 'lineup':
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1">
            <Users className="w-3 h-3" /> Alineación
          </span>
        );
      case 'scoreboard':
      default:
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Marcador
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto animate-fade-in relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-primary/20 p-2.5 sm:p-3 rounded-xl border border-primary/30 shrink-0">
            <LayoutTemplate className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted tracking-tight">
              Eddam Overlay Studio
            </h1>
            <p className="text-xs sm:text-sm text-textMuted mt-0.5">Gestión de gráficos en tiempo real</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {user && (
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 bg-surface/80 hover:bg-white/10 border border-white/10 hover:border-primary/50 px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer group"
              title="Configurar perfil y cuenta"
            >
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`} 
                alt="Avatar" 
                className="w-7 h-7 rounded-lg bg-primary/20 p-0.5 border border-primary/30 shrink-0 group-hover:scale-105 transition-transform" 
              />
              <div className="text-left text-xs leading-tight">
                <span className="font-bold text-white block truncate max-w-[120px] sm:max-w-[150px] group-hover:text-primary transition-colors">
                  {user.name}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono truncate block max-w-[120px]">
                  {user.email}
                </span>
              </div>
            </button>
          )}

          <button 
            onClick={() => navigate('/')} 
            className="btn-secondary flex items-center justify-center gap-1.5 py-2.5 px-3.5 text-xs sm:text-sm"
            title="Ir a la Landing Page Principal"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Inicio</span>
          </button>

          <button 
            onClick={() => {
              logout();
              navigate('/');
            }} 
            className="btn-secondary flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>

          <button 
            onClick={() => openCreateModal('custom')} 
            className="btn-primary flex items-center justify-center gap-2 py-2.5 px-4 sm:px-5 text-xs sm:text-sm shadow-lg shadow-primary/20 flex-1 sm:flex-initial"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </header>

      <main>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-white">
            <MonitorPlay className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            <span>Proyectos Activos</span>
          </h2>
          <span className="text-xs text-textMuted sm:hidden font-medium">
            {projects.length} {projects.length === 1 ? 'activo' : 'activos'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isProjectsLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-5 sm:p-6 flex flex-col justify-between min-h-[140px] sm:min-h-[160px] animate-pulse">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="h-5 bg-white/10 rounded-lg w-3/4" />
                      <div className="flex gap-1">
                        <div className="w-8 h-8 rounded-lg bg-white/5" />
                        <div className="w-8 h-8 rounded-lg bg-white/5" />
                      </div>
                    </div>
                    <div className="h-5 bg-white/10 rounded-md w-1/3" />
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/30">
                    <div className="h-3.5 bg-white/10 rounded w-1/3" />
                    <div className="h-6 bg-white/10 rounded-md w-16" />
                  </div>
                </div>
              ))
            : projects.map((proj) => (
                <div 
                  key={proj.id} 
                  className="card group cursor-pointer hover:-translate-y-1 active:scale-[0.99] transition-all p-5 sm:p-6 flex flex-col justify-between" 
                  onClick={() => navigate(`/editor/${proj.id}`)}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h3 className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {proj.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0 -mr-1 -mt-1">
                        <button 
                          onClick={(e) => openModal(e, proj)}
                          className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors text-textMuted hover:text-white"
                          title="Configurar Proyecto"
                          aria-label="Configurar Proyecto"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeleteProj(proj); }}
                          className="p-2 hover:bg-red-500/20 active:bg-red-500/30 rounded-lg transition-colors text-textMuted hover:text-red-400"
                          title="Eliminar Proyecto"
                          aria-label="Eliminar Proyecto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      {getProjectTypeBadge(proj.type)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-textMuted pt-3 mt-2 border-t border-border/60">
                    <span>{proj.overlays} Overlays activos</span>
                    <span className="bg-surfaceHover px-2.5 py-1 rounded-md text-xs font-medium border border-border flex items-center gap-1.5 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online
                    </span>
                  </div>
                </div>
              ))
          }
          
          <div 
            onClick={() => openCreateModal('publicidad')} 
            className="card border-dashed border-2 border-white/20 hover:border-primary flex flex-col items-center justify-center text-textMuted hover:text-white cursor-pointer active:scale-[0.99] transition-all min-h-[140px] sm:min-h-[160px] p-6 text-center group"
          >
            <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8 mb-2 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:scale-110" />
            <p className="font-semibold text-sm sm:text-base text-white">Crear un proyecto de Publicidad</p>
            <span className="text-xs text-textMuted mt-1">O crea un overlay con código programable</span>
          </div>
        </div>
      </main>

      {/* Modal de Creación de Proyecto */}
      {isCreateOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in"
          onClick={() => !isCreating && setIsCreateOpen(false)}
        >
          <div 
            className="bg-surface border border-white/10 rounded-2xl p-5 sm:p-7 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Crear Nuevo Proyecto</h3>
                  <p className="text-xs text-textMuted">Configura los datos del overlay para tu transmisión</p>
                </div>
              </div>
              <button 
                onClick={() => !isCreating && setIsCreateOpen(false)} 
                className="text-textMuted hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg shrink-0"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6"/>
              </button>
            </div>

            <form onSubmit={submitCreateProject} className="space-y-5">
              {/* Nombre e ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-textMuted mb-1.5">
                    Nombre del Proyecto <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={newProjectName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Reportaje En Vivo - Elecciones"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-textMuted mb-1.5">
                    ID / Enlace OBS (Slug único)
                  </label>
                  <div className="flex items-center bg-background border border-white/10 rounded-lg overflow-hidden focus-within:border-primary">
                    <span className="px-2.5 py-3 text-xs text-textMuted/70 bg-black/40 border-r border-white/5 font-mono select-none">
                      /render/
                    </span>
                    <input 
                      type="text" 
                      className="flex-1 bg-transparent px-3 py-3 text-white text-xs sm:text-sm font-mono outline-none"
                      value={newProjectId}
                      onChange={(e) => setNewProjectId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="reportaje-en-vivo"
                    />
                  </div>
                </div>
              </div>

              {/* Selector de Tipo de Proyecto */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-textMuted mb-2">
                  Tipo de Proyecto
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div 
                    onClick={() => setNewProjectType('custom')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      newProjectType === 'custom' 
                        ? 'bg-primary/15 border-primary shadow-lg shadow-primary/10' 
                        : 'bg-surfaceHover/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${newProjectType === 'custom' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}>
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-white">Código / IA (Programable)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-xs text-textMuted mt-0.5 leading-snug">
                        Programa tu overlay con HTML/Tailwind/JS o ayúdate de una IA externa.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setNewProjectType('publicidad')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      newProjectType === 'publicidad' 
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10' 
                        : 'bg-surfaceHover/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${newProjectType === 'publicidad' ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-white">Publicidad & Auspiciadores</span>
                      <p className="text-xs text-textMuted mt-0.5 leading-snug">
                        Banners rotativos, sello flotante, ticker de noticias y popups.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setNewProjectType('scoreboard')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      newProjectType === 'scoreboard' 
                        ? 'bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                        : 'bg-surfaceHover/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${newProjectType === 'scoreboard' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white'}`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-white">Marcador Deportivo</span>
                      <p className="text-xs text-textMuted mt-0.5 leading-snug">
                        Marcador de fútbol con goles, cronómetro y animación ¡GOOOL!
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setNewProjectType('lineup')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      newProjectType === 'lineup' 
                        ? 'bg-blue-500/15 border-blue-500 shadow-lg shadow-blue-500/10' 
                        : 'bg-surfaceHover/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${newProjectType === 'lineup' ? 'bg-blue-500 text-black' : 'bg-white/10 text-white'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-white">Alineación Táctica</span>
                      <p className="text-xs text-textMuted mt-0.5 leading-snug">
                        Esquema táctico de cancha para Fútbol 11, 9, 7 o 5 con titulares.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección Especial para Tipo 'custom' */}
              {newProjectType === 'custom' && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                  {/* Selector de Plantillas Iniciales */}
                  <div>
                    <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">
                      Selecciona una Plantilla Base
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {OVERLAY_STARTER_TEMPLATES.map(tmpl => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => handleSelectTemplate(tmpl.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            selectedTemplateId === tmpl.id 
                              ? 'bg-primary/20 border-primary text-white shadow-md' 
                              : 'bg-surface/50 border-white/5 hover:border-white/20 text-textMuted hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold truncate">{tmpl.name}</span>
                          </div>
                          <p className="text-[10px] text-textMuted/80 mt-1 line-clamp-1">{tmpl.category}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pestañas: Código Inicial / Generador de Prompt IA */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex gap-1 bg-surface p-1 rounded-lg border border-white/5">
                        <button
                          type="button"
                          onClick={() => setActiveCodeTab('code')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                            activeCodeTab === 'code' ? 'bg-primary text-black' : 'text-textMuted hover:text-white'
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5" /> Código Inicial
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCodeTab('prompt')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                            activeCodeTab === 'prompt' ? 'bg-primary text-black' : 'text-textMuted hover:text-white'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Generar con IA
                        </button>
                      </div>

                      {activeCodeTab === 'prompt' && (
                        <button
                          type="button"
                          onClick={handleCopyPrompt}
                          className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                            promptCopied ? 'bg-green-600 text-white' : 'bg-primary/20 text-primary hover:bg-primary hover:text-white'
                          }`}
                        >
                          {promptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {promptCopied ? '¡Prompt Copiado!' : 'Copiar Prompt para IA'}
                        </button>
                      )}
                    </div>

                    {activeCodeTab === 'code' ? (
                      <div>
                        <textarea 
                          rows={6}
                          className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-xs font-mono outline-none focus:border-primary transition-colors leading-relaxed"
                          value={customCodeInput}
                          onChange={(e) => setCustomCodeInput(e.target.value)}
                          placeholder="Pega o escribe aquí tu código HTML/Tailwind..."
                        />
                        <p className="text-[11px] text-textMuted mt-1 flex items-center gap-1">
                          <span>💡</span> Podrás previsualizar en vivo y compilar este código en el Editor de Studio.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-textMuted mb-1">
                            ¿De qué trata tu transmisión o evento?
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary"
                            value={promptTopic}
                            onChange={(e) => setPromptTopic(e.target.value)}
                            placeholder="Ej: reportaje de elecciones en vivo, cobertura deportiva, transmisión de misa"
                          />
                        </div>

                        <div className="p-3 bg-background rounded-lg border border-white/10 font-mono text-[11px] text-gray-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                          {generateAIPrompt(promptTopic)}
                        </div>
                        <p className="text-[11px] text-textMuted">
                          Copia este prompt, pégalo en ChatGPT, Claude o Gemini, y pega el código resultante en la pestaña "Código Inicial".
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
                <button 
                  type="button"
                  disabled={isCreating}
                  onClick={() => setIsCreateOpen(false)} 
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-sm text-textMuted hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Creando Proyecto...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Crear Proyecto y Abrir Editor</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configuración */}
      {modalProject && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
          onClick={() => setModalProject(null)}
        >
          <div 
            className="bg-surface border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-[550px] max-h-[90vh] overflow-y-auto shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2.5 sm:gap-3">
                <Settings className="text-primary w-5 h-5 sm:w-6 sm:h-6 shrink-0"/> 
                <span>Configuración del Proyecto</span>
              </h3>
              <button 
                onClick={() => setModalProject(null)} 
                className="text-textMuted hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg shrink-0"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6"/>
              </button>
            </div>
            
            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-textMuted mb-2">Nombre del Proyecto</label>
                <input 
                  type="text" 
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm sm:text-base focus:border-primary outline-none transition-colors"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ej: Final de Temporada..."
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-textMuted mb-2">ID del Enlace (Modificable)</label>
                <div className="flex flex-col sm:flex-row bg-background border border-white/10 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 sm:py-0 sm:pl-4 sm:pr-1 flex items-center text-xs sm:text-sm text-textMuted/80 bg-black/30 border-b sm:border-b-0 sm:border-r border-white/5 truncate">
                    {`${window.location.origin}/render/`}
                  </div>
                  <input 
                    type="text" 
                    className="flex-1 bg-black/10 text-white text-xs sm:text-sm font-mono outline-none px-3 py-2.5 sm:py-0 focus:bg-primary/20 transition-colors"
                    value={editId}
                    onChange={(e) => setEditId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  />
                  <button 
                    onClick={copyUrl} 
                    className={`px-4 sm:px-6 py-2.5 sm:py-0 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                      copied ? 'bg-green-600 text-white' : 'bg-primary/20 hover:bg-primary text-primary hover:text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                
                {editId !== modalProject.id && (
                  <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-xs text-red-200 font-bold leading-relaxed">
                      ⚠️ ADVERTENCIA: Al cambiar este ID, la URL en OBS se romperá y tendrás que actualizarla. 
                      Además, este gráfico se reiniciará como un proyecto en blanco (los datos anteriores quedan guardados bajo el ID anterior).
                    </p>
                  </div>
                )}
                <p className="text-xs text-textMuted mt-3 leading-relaxed">
                  Copia este enlace exacto y pégalo en una fuente de Navegador. Se recomienda usar una resolución de <strong className="text-white">1920x1080</strong> y marcar la casilla <strong className="text-white">"Apagar fuente cuando no sea visible"</strong>.
                </p>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
                <button 
                  onClick={() => setModalProject(null)} 
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-sm text-textMuted hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveSettings} 
                  className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar */}
      {deleteProj && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in" 
          onClick={() => !isDeleting && setDeleteProj(null)}
        >
          <div 
            className="bg-surface border border-red-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-[400px] shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50">
                <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold">¿Eliminar Proyecto?</h3>
              <p className="text-textMuted text-xs sm:text-sm leading-relaxed">
                Estás a punto de eliminar el proyecto <strong className="text-white break-words">{deleteProj.name}</strong>. Esta acción no se puede deshacer.
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 w-full mt-3 sm:mt-4">
                <button 
                  onClick={() => setDeleteProj(null)} 
                  disabled={isDeleting}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 rounded-lg font-bold text-sm text-white bg-surfaceHover hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={isDeleting}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 rounded-lg font-bold text-sm text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil y Configuración de Usuario */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Toast de Notificación */}
      {toast && (
        <div 
          className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[70] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-xl shadow-2xl border backdrop-blur-md animate-slide-up transition-all ${
            toast.type === 'success' 
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100 shadow-emerald-900/30' 
              : 'bg-red-950/95 border-red-500/50 text-red-100 shadow-red-900/30'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium flex-1 break-words">{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white shrink-0"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
