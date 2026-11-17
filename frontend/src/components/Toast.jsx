import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-orange-200 bg-orange-50 text-orange-800',
  };

  const icons = { success: '✓', error: '!', info: 'i' };

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-fade-in ${styles[type] || styles.info}`}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm font-bold">
        {icons[type] || icons.info}
      </span>
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button type="button" onClick={onClose} className="ml-1 shrink-0 text-lg leading-none opacity-60 hover:opacity-100" aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}