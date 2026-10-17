import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import OverlayRender from './pages/OverlayRender';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page Principal (Pública) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Panel de Proyectos (Ruta Protegida) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Editor del Overlay (Ruta Protegida) */}
        <Route 
          path="/editor/:id" 
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } 
        />
        
        {/* Salida Limpia para OBS Studio (Ruta Pública Segura sin Login Requerido en OBS) */}
        <Route path="/render/:id" element={<OverlayRender />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
