import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [creating, setCreating] = useState(false);

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
      await fetchData();
    } catch (err) {
      alert('Error al crear el issue');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'review':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-slate-500">Cargando proyecto...</div>
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-20 text-slate-500">Proyecto no encontrado</div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
      >
        ← Volver a proyectos
      </Link>

      {/* Header del proyecto */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
            <p className="text-slate-500 mt-2">
              {project.description || 'Sin descripción'}
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
              project.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Formulario de nuevo issue */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Nuevo Issue</h2>
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Corregir error de login"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el issue..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {creating ? 'Creando...' : 'Crear Issue'}
          </button>
        </form>
      </div>

      {/* Lista de issues */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Issues
          <span className="ml-2 text-sm font-normal text-slate-500">({issues.length})</span>
        </h2>
      </div>

      {issues.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-500">No hay issues en este proyecto.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{issue.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {issue.description || 'Sin descripción'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityStyles(issue.priority)}`}>
                    {issue.priority}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyles(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDetailPage;