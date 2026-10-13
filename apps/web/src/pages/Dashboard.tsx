import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, PlusCircle, MonitorPlay, Settings, Copy, X, Check, Trash2, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // Estado para los proyectos desde la DB
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/api/overlays`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Mapeamos los datos de la DB para la UI
          setProjects(data.map((p: any) => ({ ...p, overlays: p.type === 'publicidad' ? 1 : 3 })));
        } else {
          // Datos por defecto si la DB está vacía
          setProjects([
            { id: 'torneo-regional', name: 'Torneo Regional 2026 - Marcador', type: 'scoreboard', overlays: 3 },
            { id: 'liga-pro', name: 'Liga Pro eSports - Alineaciones', type: 'lineup', overlays: 3 },
            { id: 'ad-publicidad', name: 'Publicidad & Auspiciadores', type: 'publicidad', overlays: 1 },
          ]);
        }
      })
      .catch(e => {
        console.error(e);
        setProjects([
          { id: 'torneo-regional', name: 'Torneo Regional 2026 - Marcador', type: 'scoreboard', overlays: 3 },
          { id: 'liga-pro', name: 'Liga Pro eSports - Alineaciones', type: 'lineup', overlays: 3 },
          { id: 'ad-publicidad', name: 'Publicidad & Auspiciadores', type: 'publicidad', overlays: 1 },
        ]);
      });
  }, []);

  const createNewProject = async () => {
    const id = 'ad-' + Math.random().toString(36).substring(7);
    const newProj = { name: 'Sponsors & Publicidad', type: 'publicidad', settings: {} };
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    await fetch(`${API_URL}/api/overlays/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj)
    });
    
    navigate(`/editor/${id}`);
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
          headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_URL}/api/overlays/${deleteProj.id}`, { method: 'DELETE' });
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
        <button 
          onClick={createNewProject} 
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto py-2.5 px-5 text-sm sm:text-base shadow-lg shadow-primary/20"
        >
          <PlusCircle className="w-5 h-5 shrink-0" />
          <span>Nuevo Proyecto</span>
        </button>
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
          {projects.map((proj) => (
            <div 
              key={proj.id} 
              className="card group cursor-pointer hover:-translate-y-1 active:scale-[0.99] transition-all p-5 sm:p-6 flex flex-col justify-between" 
              onClick={() => navigate(`/editor/${proj.id}`)}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-4">
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
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm text-textMuted pt-3 mt-2 border-t border-border/60">
                <span>{proj.overlays} Overlays activos</span>
                <span className="bg-surfaceHover px-2.5 py-1 rounded-md text-xs font-medium border border-border flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
          ))}
          
          <div 
            onClick={createNewProject} 
            className="card border-dashed border-2 flex flex-col items-center justify-center text-textMuted hover:text-white hover:border-primary cursor-pointer active:scale-[0.99] transition-all min-h-[140px] sm:min-h-[160px] p-6 text-center"
          >
            <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
            <p className="font-medium text-sm sm:text-base">Crear un proyecto de Publicidad</p>
          </div>
        </div>
      </main>

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
