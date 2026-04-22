import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  UserPlus, 
  Bell, 
  LogOut, 
  LayoutDashboard,
  CheckCircle2,
  BookOpen,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Add Student', path: '/admin/students/add', icon: UserPlus },
    { name: 'Students List', path: '/admin/students', icon: Users },
    { name: 'Upload Marks', path: '/admin/marks', icon: BookOpen },
    { name: 'Send Notifications', path: '/admin/notifications', icon: Bell },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="text-indigo-500" size={24} />
                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">ADMIN PANEL</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Elite Management</p>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'} />
                <span className="tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
            <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black">A</div>
                    <div>
                        <p className="text-xs font-black text-white">ADMIN USER</p>
                        <p className="text-[10px] text-slate-500 font-bold">System Root</p>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-600 dark:text-slate-400"
            >
                <Menu size={24} />
            </button>
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] hidden sm:block">
                {navItems.find(item => item.path === location.pathname)?.name || 'Command Center'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white p-3 rounded-2xl transition-all group flex items-center gap-2"
              title="Sign out"
            >
              <LogOut size={20} />
              <span className="text-xs font-black uppercase tracking-widest hidden md:block">Sign Out</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
