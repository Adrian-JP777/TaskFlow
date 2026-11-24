import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    try {
      const [list, c] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setItems(list.data);
      setCount(c.data.count);
    } catch {
      /* silencioso */
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAll = async () => {
    await api.post('/notifications/read-all');
    setCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOne = async (id) => {
    await api.post(`/notifications/${id}/read`);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        aria-label="Notificaciones"
      >
        🔔
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notificaciones</p>
            {count > 0 && (
              <button type="button" onClick={markAll} className="text-xs font-medium text-red-600 hover:underline">
                Marcar todas
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">Sin notificaciones</li>
            )}
            {items.map((n) => (
              <li key={n.id} className={`border-b border-slate-50 dark:border-slate-700 ${n.read ? '' : 'bg-orange-50/50 dark:bg-orange-950/20'}`}>
                {n.link ? (
                  <Link
                    to={n.link}
                    onClick={() => markOne(n.id)}
                    className="block px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>}
                  </Link>
                ) : (
                  <button type="button" onClick={() => markOne(n.id)} className="w-full px-4 py-3 text-left">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}