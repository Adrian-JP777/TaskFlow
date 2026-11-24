import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusLabels = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  review: 'En revisión',
  done: 'Completado',
};

const statusStyles = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
  in_progress: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-700/50" />
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">No se pudo cargar el dashboard.</p>;

  const countMap = Object.fromEntries((data.byStatus || []).map((s) => [s.status, s.count]));

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Hola, {user?.name?.split(' ')[0] || 'equipo'} 👋
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Resumen de tu trabajo en TaskFlow</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Por hacer', key: 'todo', color: 'from-slate-500 to-slate-600' },
          { label: 'En progreso', key: 'in_progress', color: 'from-orange-500 to-red-500' },
          { label: 'En revisión', key: 'review', color: 'from-amber-500 to-orange-500' },
          { label: 'Completados', key: 'done', color: 'from-emerald-500 to-teal-600' },
        ].map((c) => (
          <div
            key={c.key}
            className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{c.label}</p>
            <p className={`mt-2 bg-gradient-to-r ${c.color} bg-clip-text text-3xl font-bold text-transparent`}>
              {countMap[c.key] || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Mis tareas pendientes</h2>
          {data.myIssues?.length === 0 ? (
            <p className="text-sm text-slate-400">No tienes issues asignados.</p>
          ) : (
            <ul className="space-y-2">
              {data.myIssues.map((issue) => (
                <li key={issue.id}>
                  <Link
                    to={`/projects/${issue.project_id}/issues/${issue.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-orange-300 dark:border-slate-700 dark:hover:border-orange-700"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{issue.title}</p>
                      <p className="text-xs text-slate-400">{issue.project_name}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyles[issue.status]}`}>
                      {statusLabels[issue.status] || issue.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Actividad reciente</h2>
          <ul className="space-y-2">
            {(data.recent || []).map((issue) => (
              <li key={issue.id}>
                <Link
                  to={`/projects/${issue.project_id}/issues/${issue.id}`}
                  className="block rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-orange-300 dark:border-slate-700"
                >
                  <p className="font-medium text-slate-800 dark:text-slate-100">{issue.title}</p>
                  <p className="text-xs text-slate-400">
                    {issue.project_name} · {statusLabels[issue.status] || issue.status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {data.projects?.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Proyectos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 dark:border-slate-700 dark:bg-slate-800"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                <p className="mt-1 text-xs capitalize text-slate-400">{p.status}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardPage;