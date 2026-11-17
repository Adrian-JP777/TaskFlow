import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        : 'text-slate-600 hover:bg-red-50 hover:text-red-700'
    }`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-red-100/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/trabajos" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-sm font-bold text-white shadow-md shadow-red-200 transition-transform group-hover:scale-105">
              TF
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Task<span className="text-red-600">Flow</span>
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-1">
            <NavLink to="/trabajos" className={navClass}>Trabajos</NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/proyectos" className={navClass}>Proyectos</NavLink>
            )}
            <NavLink to="/perfil" className={navClass}>Mi perfil</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to={`/profile/${user?.id}`}
              className="hidden items-center gap-2 rounded-full border border-red-100 bg-red-50/50 px-3 py-1.5 transition hover:bg-red-50 sm:flex"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                <p className="text-[11px] capitalize text-slate-500">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 animate-fade-in">
        <Outlet />
      </main>

      <footer className="border-t border-red-100/60 bg-white/60 py-6 text-center text-xs text-slate-400">
        <p>Task<span className="text-red-500">Flow</span> · Gestión de proyectos y solicitudes</p>
      </footer>
    </div>
  );
}

export default Layout;