import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, PlusCircle, MonitorPlay, Settings, Copy, X, Check, Trash2, AlertTriangle } from 'lucide-react';

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
            { id: 'torneo-regional', name: 'Torneo Regional 2026', type: 'scoreboard', overlays: 3 },
            { id: 'liga-pro', name: 'Liga Pro eSports', type: 'lineup', overlays: 5 },
          ]);
        }
      })
      .catch(e => console.error(e));
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
        await fetch(`${API_URL}/api/overlays/${editId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName, type: modalProject.type, settings: modalProject.settings })
        });
        
        // Si el ID cambió, podríamos eliminar el viejo, pero para mantenerlo simple y seguro 
        // solo actualizaremos si el ID es el mismo, de lo contrario se crea un duplicado (intencionado según advertencia)
        if (editId !== modalProject.id) {
           setProjects([...projects.filter(p => p.id !== modalProject.id), { ...modalProject, id: editId, name: editName }]);
        } else {
           setProjects(projects.map(p => p.id === modalProject.id ? { ...p, name: editName } : p));
        }
      } catch (e) {
        console.error(e);
      }
    }
    setModalProject(null);
  };

  const handleDelete = async () => {
    if (!deleteProj) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      await fetch(`${API_URL}/api/overlays/${deleteProj.id}`, { method: 'DELETE' });
      setProjects(projects.filter(p => p.id !== deleteProj.id));
      setDeleteProj(null);
    } catch(e) {
      console.error(e);
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
    <div className="min-h-screen p-8 animate-fade-in relative">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
            <LayoutTemplate className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted">
              Eddam Overlay Studio
            </h1>
            <p className="text-textMuted">Gestión de gráficos en tiempo real</p>
          </div>
        </div>
        <button onClick={createNewProject} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Nuevo Proyecto
        </button>
      </header>

      <main>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <MonitorPlay className="w-6 h-6 text-primary" />
          Proyectos Activos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="card group cursor-pointer hover:-translate-y-1" onClick={() => navigate(`/editor/${proj.id}`)}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{proj.name}</h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => openModal(e, proj)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors group-hover:bg-white/5"
                      title="Configurar Proyecto"
                    >
                      <Settings className="w-5 h-5 text-textMuted hover:text-white transition-colors" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteProj(proj); }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group-hover:bg-white/5"
                      title="Eliminar Proyecto"
                    >
                      <Trash2 className="w-5 h-5 text-textMuted hover:text-red-500 transition-colors" />
                    </button>
                  </div>
              </div>
              <div className="flex items-center justify-between text-sm text-textMuted">
                <span>{proj.overlays} Overlays activos</span>
                <span className="bg-surfaceHover px-2 py-1 rounded-md text-xs border border-border">
                  Online
                </span>
              </div>
            </div>
          ))}
          
          <div onClick={createNewProject} className="card border-dashed border-2 flex flex-col items-center justify-center text-textMuted hover:text-white hover:border-primary cursor-pointer transition-all min-h-[160px]">
            <PlusCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="font-medium">Crear un proyecto de Publicidad</p>
          </div>
        </div>
      </main>

      {/* Modal de Configuración */}
      {modalProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setModalProject(null)}>
          <div className="bg-surface border border-white/10 rounded-2xl p-6 w-[550px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Settings className="text-primary w-6 h-6"/> 
                Configuración del Proyecto
              </h3>
              <button onClick={() => setModalProject(null)} className="text-textMuted hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-textMuted mb-2">Nombre del Proyecto</label>
                <input 
                  type="text" 
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none transition-colors"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ej: Final de Temporada..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-textMuted mb-2">ID del Enlace (Modificable)</label>
                <div className="flex bg-background border border-white/10 rounded-lg overflow-hidden h-12">
                  <div className="pl-4 pr-1 flex items-center text-sm text-textMuted/80 bg-black/20">
                    {`${window.location.origin}/render/`}
                  </div>
                  <input 
                    type="text" 
                    className="flex-1 bg-black/20 text-white text-sm font-mono outline-none px-2 focus:bg-primary/20 transition-colors"
                    value={editId}
                    onChange={(e) => setEditId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  />
                  <button 
                    onClick={copyUrl} 
                    className={`px-6 flex items-center gap-2 font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-primary/20 hover:bg-primary text-primary hover:text-white'}`}
                  >
                    {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                
                {editId !== modalProject.id && (
                  <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-xs text-red-200 font-bold">
                      ⚠️ ADVERTENCIA: Al cambiar este ID, la URL en OBS se romperá y tendrás que actualizarla. 
                      Además, este gráfico se reiniciará como un proyecto en blanco (los datos anteriores quedan guardados bajo el ID anterior).
                    </p>
                  </div>
                )}
                <p className="text-xs text-textMuted mt-3">
                  Copia este enlace exacto y pégalo en una fuente de Navegador. Se recomienda usar una resolución de <strong className="text-white">1920x1080</strong> y marcar la casilla <strong className="text-white">"Apagar fuente cuando no sea visible"</strong>.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex justify-end gap-3">
                <button onClick={() => setModalProject(null)} className="px-6 py-2 rounded-lg font-bold text-textMuted hover:bg-white/5 transition-colors">Cancelar</button>
                <button onClick={saveSettings} className="btn-primary px-8 py-2">Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar */}
      {deleteProj && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in" onClick={() => setDeleteProj(null)}>
          <div className="bg-surface border border-red-500/30 rounded-2xl p-6 w-[400px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold">¿Eliminar Proyecto?</h3>
              <p className="text-textMuted text-sm">
                Estás a punto de eliminar el proyecto <strong className="text-white">{deleteProj.name}</strong>. Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setDeleteProj(null)} 
                  className="flex-1 py-3 rounded-lg font-bold text-white bg-surfaceHover hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex-1 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
