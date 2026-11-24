import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md shadow-red-200'
        : 'text-slate-600 hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-slate-700'
    }`;

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-red-100/80 bg-white/90 backdrop-blur-md shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-sm font-bold text-white shadow-md">
              TF
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Task<span className="text-red-600">Flow</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/dashboard" className={navClass}>Inicio</NavLink>
            <NavLink to="/trabajos" className={navClass}>Trabajos</NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/proyectos" className={navClass}>Proyectos</NavLink>
            )}
            <NavLink to="/perfil" className={navClass}>Perfil</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <Link
              to={`/profile/${user?.id}`}
              className="hidden items-center gap-2 rounded-full border border-red-100 bg-red-50/50 px-3 py-1.5 sm:flex dark:border-slate-600 dark:bg-slate-800"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;