import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusStyles = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-orange-100 text-orange-700',
  review: 'bg-amber-100 text-amber-800',
  done: 'bg-emerald-100 text-emerald-700',
};

const priorityStyles = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusLabels = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  review: 'En revisión',
  done: 'Completado',
};

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;
    async function loadJobs() {
      try {
        const { data: projects } = await api.get('/projects');
        const grouped = await Promise.all(
          projects.map(async (project) => {
            const { data: issues } = await api.get(`/projects/${project.id}/issues`);
            return issues.map((issue) => ({
              ...issue,
              projectName: project.name,
              projectId: project.id,
            }));
          })
        );
        if (active) setJobs(grouped.flat());
      } catch {
        if (active) setError('No se pudieron cargar los trabajos. Comprueba que el servidor esté disponible.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadJobs();
    return () => {
      active = false;
    };
  }, []);

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-red-600" />
        <p className="mt-4 text-sm text-slate-500">Cargando trabajos…</p>
      </div>
    );
  }

  return (
    <section className="animate-fade-in">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Trabajos</h1>
          <p className="mt-1 text-slate-500">Consulta y gestiona las tareas de todos los proyectos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'todo', label: 'Por hacer' },
            { key: 'in_progress', label: 'En progreso' },
            { key: 'review', label: 'Revisión' },
            { key: 'done', label: 'Hechos' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === f.key
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md shadow-red-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-red-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-white/80 p-14 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
            📋
          </div>
          <p className="font-medium text-slate-600">No hay trabajos con este filtro</p>
          <p className="mt-1 text-sm text-slate-400">Crea tareas desde un proyecto o cambia el filtro</p>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map((job) => (
          <Link
            key={job.id}
            to={`/projects/${job.projectId}/issues/${job.id}`}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md hover:shadow-orange-100"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 transition group-hover:text-red-700">
                  {job.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{job.projectName}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[job.status] || statusStyles.todo}`}>
                  {statusLabels[job.status] || job.status}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[job.priority] || priorityStyles.medium}`}>
                  {job.priority}
                </span>
              </div>
            </div>
            {job.description && (
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default JobsPage;