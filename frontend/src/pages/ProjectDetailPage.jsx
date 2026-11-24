import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { key: 'todo', label: 'Por hacer' },
  { key: 'in_progress', label: 'En progreso' },
  { key: 'review', label: 'Revisión' },
  { key: 'done', label: 'Hecho' },
];

const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-emerald-100 text-emerald-700',
};

function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban'); // kanban | list
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    fetchData();
    api.get('/users').then((r) => setUsers(r.data)).catch(() => {});
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
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssigneeId('');
      setDueDate('');
      setShowForm(false);
      await fetchData();
    } catch (err) {
      alert('Error al crear el issue');
    } finally {
      setCreating(false);
    }
  };

  const moveIssue = async (issueId, newStatus) => {
    const prev = issues;
    setIssues((list) =>
      list.map((i) => (String(i.id) === String(issueId) ? { ...i, status: newStatus } : i))
    );
    try {
      await api.put(`/projects/${id}/issues/${issueId}`, { status: newStatus });
    } catch {
      setIssues(prev);
      alert('No se pudo cambiar el estado');
    }
  };

  const onDrop = (status) => {
    if (dragId != null) {
      moveIssue(dragId, status);
      setDragId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-red-600" />
      </div>
    );
  }

  if (!project) return <div className="py-20 text-center text-slate-500">Proyecto no encontrado</div>;

  return (
    <div className="animate-fade-in">
      <Link
        to={user?.role === 'admin' ? '/proyectos' : '/dashboard'}
        className="mb-6 inline-flex text-sm font-medium text-red-600 hover:text-red-700"
      >
        ← Volver
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-red-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{project.name}</h1>
          <p className="mt-2 text-slate-500">{project.description || 'Sin descripción'}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${view === 'kanban' ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' : 'border border-slate-200 dark:border-slate-600'}`}
          >
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${view === 'list' ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' : 'border border-slate-200 dark:border-slate-600'}`}
          >
            Lista
          </button>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md"
            >
              + Nuevo issue
            </button>
          ) : (
            <form onSubmit={handleCreateIssue} className="space-y-3 rounded-2xl border border-red-100 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción"
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
              <div className="flex flex-wrap gap-3">
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                  <option value="">Sin asignar</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={creating} className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {creating ? 'Creando…' : 'Crear'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-5 py-2 text-sm">Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {view === 'kanban' ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.key)}
              className="min-h-[280px] rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {col.label} ({issues.filter((i) => i.status === col.key).length})
              </h3>
              <div className="space-y-2">
                {issues
                  .filter((i) => i.status === col.key)
                  .map((issue) => (
                    <div
                      key={issue.id}
                      draggable={user?.role === 'admin'}
                      onDragStart={() => setDragId(issue.id)}
                      className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-600 dark:bg-slate-800"
                    >
                      <Link to={`/projects/${id}/issues/${issue.id}`} className="font-medium text-slate-800 hover:text-red-600 dark:text-slate-100">
                        {issue.title}
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityStyles[issue.priority] || priorityStyles.medium}`}>
                          {issue.priority}
                        </span>
                        {issue.assignee_name && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {issue.assignee_name}
                          </span>
                        )}
                        {issue.due_date && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-600">
                            {new Date(issue.due_date).toLocaleDateString('es-PE')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to={`/projects/${id}/issues/${issue.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="font-semibold text-slate-800 dark:text-slate-100">{issue.title}</p>
              <p className="mt-1 text-xs text-slate-400">
                {issue.status} · {issue.priority}
                {issue.assignee_name ? ` · ${issue.assignee_name}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDetailPage;