import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReports from './pages/MyReports';
import ReportForm from './pages/ReportForm';
import Dashboard from './pages/Dashboard';
import TeamReports from './pages/TeamReports';
import Projects from './pages/Projects';
import AiAssistant from './pages/AiAssistant';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'manager' ? '/dashboard' : '/reports'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/reports" element={<MyReports />} />
        <Route path="/reports/new" element={<ReportForm />} />
        <Route path="/reports/:id" element={<ReportForm />} />
      </Route>

      <Route element={<ProtectedRoute managerOnly />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/team-reports" element={<TeamReports />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
