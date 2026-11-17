import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los proyectos. ¿Está corriendo el backend?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setCreating(true);
      await api.post('/projects', { name, description, status: 'active' });
      setName('');
      setDescription('');
      setShowForm(false);
      await fetchProjects();
    } catch (err) {
      alert('Error al crear el proyecto');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-red-600" />
        <p className="mt-4 text-sm text-slate-500">Cargando proyectos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{error}</div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Proyectos</h1>
          <p className="mt-1 text-slate-500">Gestiona tus proyectos de software</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:from-red-700 hover:to-orange-600"
          >
            {showForm ? 'Cancelar' : '+ Nuevo proyecto'}
          </button>
        )}
      </div>

      {showForm && user?.role === 'admin' && (
        <div className="mb-8 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Crear nuevo proyecto</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nombre del proyecto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Sistema de ventas"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el proyecto…"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:from-red-700 hover:to-orange-600 disabled:opacity-60"
            >
              {creating ? 'Creando…' : 'Crear proyecto'}
            </button>
          </form>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Todos los proyectos
          <span className="ml-2 text-sm font-normal text-slate-400">({projects.length})</span>
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-white/80 p-14 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
            📁
          </div>
          <p className="font-medium text-slate-600">No hay proyectos todavía</p>
          <p className="mt-1 text-sm text-slate-400">Crea el primero usando el botón de arriba</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md hover:shadow-orange-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 transition group-hover:text-red-700">
                    {project.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {project.description || 'Sin descripción'}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : project.status === 'completed'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                Creado el {new Date(project.created_at).toLocaleDateString('es-PE')}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;