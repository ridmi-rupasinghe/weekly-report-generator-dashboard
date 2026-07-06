import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, LayoutDashboard, FolderKanban, LogOut, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Layout({ children }) {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-5 border-b border-slate-200">
          <h1 className="text-lg font-bold text-primary-700">Weekly Reports</h1>
          <p className="text-xs text-slate-500 mt-1">{user?.name}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/reports" className={navLinkClass}>
            <FileText size={18} /> My Reports
          </NavLink>
          {isManager && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard size={18} /> Team Dashboard
              </NavLink>
              <NavLink to="/team-reports" className={navLinkClass}>
                <Users size={18} /> Team Reports
              </NavLink>
              <NavLink to="/projects" className={navLinkClass}>
                <FolderKanban size={18} /> Projects
              </NavLink>
              <NavLink to="/ai-assistant" className={navLinkClass}>
                <MessageSquare size={18} /> AI Assistant
              </NavLink>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-6">{children}</main>
    </div>
  );
}
