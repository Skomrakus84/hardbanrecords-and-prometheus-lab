import React, { useState } from 'react';

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Docelowo: integracja z globalnym store i body.classList
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <button
      onClick={toggleTheme}
      style={{ background: '#444', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}
      title="Przełącz motyw"
    >
      {theme === 'dark' ? '🌙 Tryb ciemny' : '☀️ Tryb jasny'}
    </button>
  );
};

export default ThemeSwitcher;
