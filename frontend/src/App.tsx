import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { StandaloneDashboard } from './pages/StandaloneDashboard';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ResponderDashboard } from './pages/ResponderDashboard';
import { useAuthStore } from './stores/authStore';
import './index.css';

export type UserRole = 'Citizen' | 'Responder' | 'Admin' | null;

const ProtectedResponderRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'responder' && user.role !== 'admin') {
    return <Navigate to="/citizen-dashboard" replace />;
  }

  return <>{children}</>;
};

const ProtectedCitizenRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
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

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/citizen-dashboard" 
          element={
            <ProtectedCitizenRoute>
              <StandaloneDashboard role="Citizen" />
            </ProtectedCitizenRoute>
          } 
        />
        <Route 
          path="/responder-dashboard" 
          element={
            <ProtectedResponderRoute>
              <ResponderDashboard />
            </ProtectedResponderRoute>
          } 
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
