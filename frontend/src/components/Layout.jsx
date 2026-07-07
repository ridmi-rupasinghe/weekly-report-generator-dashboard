import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, LayoutDashboard, FolderKanban, LogOut, MessageSquare, Users, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Layout({ children }) {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = (
    <>
      {!isManager && (
        <NavLink to="/reports" className={navLinkClass} onClick={closeSidebar}>
          <FileText size={18} /> My Reports
        </NavLink>
      )}
      {isManager && (
        <>
          <NavLink to="/dashboard" className={navLinkClass} onClick={closeSidebar}>
            <LayoutDashboard size={18} /> Team Dashboard
          </NavLink>
          <NavLink to="/team-reports" className={navLinkClass} onClick={closeSidebar}>
            <Users size={18} /> Team Reports
          </NavLink>
          <NavLink to="/projects" className={navLinkClass} onClick={closeSidebar}>
            <FolderKanban size={18} /> Projects
          </NavLink>
          <NavLink to="/ai-assistant" className={navLinkClass} onClick={closeSidebar}>
            <MessageSquare size={18} /> AI Assistant
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-slate-200 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-primary-700">Weekly Reports</h1>
            <p className="text-xs text-slate-500 mt-1">{user?.name}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={22} />
          </button>
          <span className="font-semibold text-primary-700">Weekly Reports</span>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
