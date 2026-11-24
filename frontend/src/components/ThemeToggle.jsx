import { useEffect, useState } from 'react';

function applyTheme(dark) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    localStorage.setItem('taskflow_theme', 'dark');
  } else {
    root.classList.remove('dark');
    localStorage.setItem('taskflow_theme', 'light');
  }
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('taskflow_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicar al montar y cuando cambie
  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm transition hover:border-red-200 hover:bg-red-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}