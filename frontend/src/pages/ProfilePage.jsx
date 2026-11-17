import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwnProfile = currentUser && String(currentUser.id) === String(id);

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then((res) => {
        setUser(res.data);
        setForm({
          name: res.data.name || '',
          bio: res.data.bio || '',
          phone: res.data.phone || '',
        });
      })
      .catch(() => setError('No se pudo cargar el perfil'));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/users/${id}`, form);
      setUser(res.data);
      if (isOwnProfile) updateUser({ ...currentUser, ...res.data });
      setEditMode(false);
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (error && !user) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-red-600" />
        <p className="mt-4 text-sm text-slate-500">Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400" />

        <div className="relative px-6 pb-8 sm:px-8">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-red-500 to-orange-400 text-3xl font-bold text-white shadow-lg">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {isOwnProfile && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Editar perfil
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
          <p className="mt-0.5 text-slate-500">{user.email}</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
            }`}
          >
            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
          </span>

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {editMode ? (
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Biografía</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Cuéntanos un poco sobre ti…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Teléfono</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+51 999 999 999"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:from-red-700 hover:to-orange-600 disabled:opacity-60"
                >
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      name: user.name || '',
                      bio: user.bio || '',
                      phone: user.phone || '',
                    });
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Biografía</p>
                <p className="mt-1 text-slate-700">{user.bio || 'Sin biografía aún'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Teléfono</p>
                <p className="mt-1 text-slate-700">{user.phone || 'No registrado'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/trabajos" className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">
          ← Volver a trabajos
        </Link>
      </div>
    </div>
  );
}

export default ProfilePage;