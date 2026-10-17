import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import OverlayRender from './pages/OverlayRender';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page Principal */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Panel de Proyectos / Consola de Usuario */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Editor del Overlay */}
        <Route path="/editor/:id" element={<Editor />} />
        
        {/* Salida Limpia para OBS Studio */}
        <Route path="/render/:id" element={<OverlayRender />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
