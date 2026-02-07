import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProjectExplorer from './pages/ProjectExplorer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explorer" element={<ProjectExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
