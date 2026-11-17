import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import FileUpload from '../components/FileUpload';
import StarRating from '../components/StarRating';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

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

function IssueDetailPage() {
  const { projectId, issueId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [files, setFiles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [type, setType] = useState('recommendation');
  const [publishing, setPublishing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [issueId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [issueRes, filesRes, recsRes] = await Promise.all([
        api.get(`/projects/${projectId}/issues`).then((r) =>
          r.data.find((i) => String(i.id) === String(issueId))
        ),
        api.get(`/issues/${issueId}/files`),
        api.get(`/issues/${issueId}/recommendations`),
      ]);
      setIssue(issueRes);
      setFiles(filesRes.data);
      setRecommendations(recsRes.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error al cargar el issue', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!issue || newStatus === issue.status) return;
    try {
      setUpdatingStatus(true);
      const { data } = await api.put(`/projects/${projectId}/issues/${issueId}`, {
        status: newStatus,
      });
      setIssue((prev) => ({ ...prev, ...data, status: newStatus }));
      setToast({
        message: `Estado cambiado a «${statusLabels[newStatus] || newStatus}»`,
        type: 'success',
      });
    } catch {
      setToast({ message: 'No se pudo cambiar el estado', type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateRecommendation = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      setPublishing(true);
      await api.post(`/issues/${issueId}/recommendations`, { content, type });
      setContent('');
      await fetchAll();
      setToast({ message: 'Publicado correctamente', type: 'success' });
    } catch {
      setToast({ message: 'Error al publicar', type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  const handleRate = async (recommendationId, rating) => {
    try {
      await api.post(`/issues/${issueId}/recommendations/${recommendationId}/rate`, {
        rating,
      });
      await fetchAll();
      setToast({ message: 'Valoración guardada', type: 'success' });
    } catch {
      setToast({ message: 'Error al valorar', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-red-600" />
        <p className="mt-4 text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!issue) {
    return <div className="py-20 text-center text-slate-500">Issue no encontrado</div>;
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <Link
        to={`/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-red-600 transition hover:text-red-700"
      >
        ← Volver al proyecto
      </Link>

      <div className="mb-6 rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{issue.title}</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          {issue.description || 'Sin descripción'}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusStyles[issue.status] || statusStyles.todo
            }`}
          >
            {statusLabels[issue.status] || issue.status}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              priorityStyles[issue.priority] || priorityStyles.medium
            }`}
          >
            Prioridad: {issue.priority}
          </span>
        </div>

        {user?.role === 'admin' && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Cambiar estado
            </p>
            <div className="flex flex-wrap gap-2">
              {['todo', 'in_progress', 'review', 'done'].map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={updatingStatus || issue.status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    issue.status === s
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md shadow-red-200'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-red-700 disabled:opacity-50'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <span className="text-xl">📎</span> Archivos adjuntos
        </h2>

        {isAuthenticated ? (
          <FileUpload
            issueId={issueId}
            onUploaded={() => {
              fetchAll();
              setToast({ message: 'Archivo subido', type: 'success' });
            }}
            onError={() => setToast({ message: 'Error al subir archivo', type: 'error' })}
          />
        ) : (
          <p className="text-sm text-slate-500">
            <Link to="/login" className="font-medium text-red-600 hover:underline">
              Inicia sesión
            </Link>{' '}
            para adjuntar documentos.
          </p>
        )}

        <div className="mt-5 space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:border-orange-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{f.original_name}</p>
                <p className="text-xs text-slate-400">{(f.size_bytes / 1024).toFixed(1)} KB</p>
              </div>
              <a
                href={`${api.defaults.baseURL}/issues/${issueId}/files/download/${f.id}`}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-red-700 hover:to-orange-600"
                target="_blank"
                rel="noreferrer"
              >
                Descargar
              </a>
            </div>
          ))}
          {files.length === 0 && (
            <p className="text-sm text-slate-400">No hay archivos todavía.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <span className="text-xl">💬</span> Recomendaciones y Peticiones
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleCreateRecommendation} className="mb-6 space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe una recomendación o petición…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
              rows={3}
              required
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              >
                <option value="recommendation">Recomendación</option>
                <option value="request">Petición</option>
              </select>
              <button
                type="submit"
                disabled={publishing}
                className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:from-red-700 hover:to-orange-600 disabled:opacity-60"
              >
                {publishing ? 'Publicando…' : 'Publicar'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mb-6 text-sm text-slate-500">
            <Link to="/login" className="font-medium text-red-600 hover:underline">
              Inicia sesión
            </Link>{' '}
            para publicar o valorar.
          </p>
        )}

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-orange-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{rec.user_name || 'Usuario'}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      rec.type === 'request'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {rec.type === 'request' ? 'Petición' : 'Recomendación'}
                  </span>
                </div>
                <div className="text-right">
                  <StarRating
                    rating={Math.round(rec.avg_rating || 0)}
                    onRate={isAuthenticated ? (r) => handleRate(rec.id, r) : undefined}
                    readonly={!isAuthenticated}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    {Number(rec.avg_rating || 0).toFixed(1)} ({rec.total_ratings || 0} valoraciones)
                  </p>
                </div>
              </div>
              <p className="mt-3 text-slate-700">{rec.content}</p>
            </div>
          ))}
          {recommendations.length === 0 && (
            <p className="text-sm text-slate-400">Aún no hay recomendaciones ni peticiones.</p>
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export default IssueDetailPage;