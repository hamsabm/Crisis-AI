import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { StandaloneDashboard } from './pages/StandaloneDashboard';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import './index.css';

export type UserRole = 'Citizen' | 'Responder' | 'Admin' | null;

function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [role, setRole] = useState<UserRole>(null);

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
