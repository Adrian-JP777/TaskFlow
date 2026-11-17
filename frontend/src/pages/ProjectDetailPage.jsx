import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-emerald-100 text-emerald-700',
};

const statusStyles = {
  done: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-orange-100 text-orange-700',
  review: 'bg-amber-100 text-amber-800',
  todo: 'bg-slate-100 text-slate-600',
};

const statusLabels = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  review: 'En revisión',
  done: 'Completado',
};

function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, issuesRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/issues`),
      ]);
      setProject(projectRes.data);
      setIssues(issuesRes.data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setCreating(true);
      await api.post(`/projects/${id}/issues`, {
        title,
        description,
        priority,
        status: 'todo',
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setShowForm(false);
      await fetchData();
    } catch (err) {
      alert('Error al crear el issue');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-red-600" />
        <p className="mt-4 text-sm text-slate-500">Cargando proyecto…</p>
      </div>
    );
  }

  if (!project) {
    return <div className="py-20 text-center text-slate-500">Proyecto no encontrado</div>;
  }

  return (
    <div className="animate-fade-in">
      <Link
        to={user?.role === 'admin' ? '/proyectos' : '/trabajos'}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-red-600 transition hover:text-red-700"
      >
        ← Volver
      </Link>

      <div className="mb-8 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
            <p className="mt-2 text-slate-500">{project.description || 'Sin descripción'}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:from-red-700 hover:to-orange-600"
            >
              + Nuevo issue
            </button>
          ) : (
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Nuevo Issue</h2>
              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Título</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Corregir error de login"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe el issue…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:from-red-700 hover:to-orange-600 disabled:opacity-60"
                  >
                    {creating ? 'Creando…' : 'Crear Issue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Issues
          <span className="ml-2 text-sm font-normal text-slate-400">({issues.length})</span>
        </h2>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-white/80 p-12 text-center">
          <p className="font-medium text-slate-600">No hay issues en este proyecto</p>
          <p className="mt-1 text-sm text-slate-400">Crea el primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to={`/projects/${id}/issues/${issue.id}`}
              className="group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md hover:shadow-orange-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800 transition group-hover:text-red-700">
                    {issue.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {issue.description || 'Sin descripción'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[issue.priority] || priorityStyles.medium}`}>
                    {issue.priority}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[issue.status] || statusStyles.todo}`}>
                    {statusLabels[issue.status] || issue.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDetailPage;