import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Projects from './pages/Projects';
import Editor from './pages/Editor';
import { fetchProjects } from './utils/api';
import { isLoggedIn, getUser, clearAuth } from './utils/auth';
import './App.css';

// Protected route wrapper — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(getUser());

  const loadProjects = async () => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setProjects([]);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing user={user} />} />
        <Route path="/login" element={
          isLoggedIn() ? <Navigate to="/projects" replace /> : <Login onLogin={() => setUser(getUser())} />
        } />
        <Route path="/signup" element={
          isLoggedIn() ? <Navigate to="/projects" replace /> : <Signup onLogin={() => setUser(getUser())} />
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Projects
              projects={projects}
              setProjects={setProjects}
              refreshProjects={loadProjects}
              loading={loading}
              user={user}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute>
            <Editor
              projects={projects}
              setProjects={setProjects}
              refreshProjects={loadProjects}
              user={user}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
