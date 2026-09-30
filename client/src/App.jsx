import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Auth mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Auth mode="register" />} />
    </Routes>
  );
}