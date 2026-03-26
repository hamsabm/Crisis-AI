import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { StandaloneDashboard } from './pages/StandaloneDashboard';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import './index.css';

export type UserRole = 'Citizen' | 'Responder' | 'Admin' | null;

function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    toast('Backend is currently unavailable during production (Working in Local)', {
      icon: '⚠️',
      duration: 8000,
      style: {
        background: '#0c1829',
        color: '#fff',
        border: '1px solid #334155',
        boxShadow: '0 0 20px rgba(255, 68, 68, 0.2)'
      }
    });
  }, []);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setView('dashboard');
  };

  return (
    <>
      <Toaster position="top-right" />
      {view === 'landing' && <LandingPage onLaunch={() => setView('login')} />}
      {view === 'login' && <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />}
      {view === 'dashboard' && <StandaloneDashboard role={role} onBack={() => { setView('landing'); setRole(null); }} />}
    </>
  );
}

export default App;
