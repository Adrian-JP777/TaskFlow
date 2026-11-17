import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [mode, setMode] = useState('user');
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/trabajos';

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const endpoint = registering ? '/auth/register' : '/auth/login';
      const payload = registering ? { name, email, password } : { email, password };
      const { data } = await api.post(endpoint, payload);

      if (mode === 'admin' && data.user.role !== 'admin') {
        setError('Esta cuenta no tiene permisos de administrador.');
        return;
      }

      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-2xl font-bold text-white shadow-xl shadow-red-200">
            TF
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Task<span className="text-red-600">Flow</span>
          </h1>
          <p className="mt-1 text-slate-500">Gestiona proyectos, tareas y solicitudes</p>
        </div>

        <section className="rounded-2xl border border-red-100 bg-white p-7 shadow-xl shadow-red-100/50">
          <h2 className="text-xl font-bold text-slate-800">
            {registering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {registering
              ? 'Regístrate como usuario para empezar a colaborar'
              : 'Elige el tipo de acceso e ingresa tus credenciales'}
          </p>

          {!registering && (
            <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => { setMode('user'); setError(''); }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  mode === 'user' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Usuario
              </button>
              <button
                type="button"
                onClick={() => { setMode('admin'); setError(''); }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  mode === 'admin' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Administrador
              </button>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {registering && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Nombre completo</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                  autoComplete="name"
                  placeholder="Tu nombre"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Correo electrónico</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                autoComplete="email"
                placeholder="correo@ejemplo.com"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña</span>
              <input
                required
                minLength={registering ? 10 : 1}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                autoComplete={registering ? 'new-password' : 'current-password'}
                placeholder={registering ? 'Mínimo 10 caracteres' : '••••••••'}
              />
              {registering && (
                <span className="mt-1.5 block text-xs text-slate-400">Usa al menos 10 caracteres</span>
              )}
            </label>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              disabled={busy}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:from-red-700 hover:to-orange-600 hover:shadow-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Un momento…
                </span>
              ) : registering ? (
                'Crear cuenta'
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {mode === 'user' && (
            <button
              type="button"
              onClick={() => { setRegistering(!registering); setError(''); }}
              className="mt-5 w-full text-center text-sm font-medium text-red-600 transition hover:text-red-700 hover:underline"
            >
              {registering ? 'Ya tengo una cuenta → Iniciar sesión' : '¿No tienes cuenta? Crear cuenta de usuario'}
            </button>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Al continuar aceptas el uso de la plataforma TaskFlow
        </p>
      </div>
    </div>
  );
}

export default LoginPage;