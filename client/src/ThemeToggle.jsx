import { useState } from 'react';

// Runs once when the app loads, so the right theme is applied before the first paint
const saved = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.dataset.theme = saved || (systemDark ? 'dark' : 'light');

export default function ThemeToggle({ className = 'chip-btn' }) {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    setTheme(next);
  };

  return (
    <button className={className} onClick={toggle} aria-label="Toggle dark mode">
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  );
}