import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import OverlayRender from './pages/OverlayRender';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/render/:id" element={<OverlayRender />} />
      </Routes>
    </Router>
  );
}

export default App;
