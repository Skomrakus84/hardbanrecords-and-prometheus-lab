import React, { useState } from 'react';

const LanguageSwitcher: React.FC = () => {
  const [lang, setLang] = useState<'pl' | 'en'>('pl');

  // Docelowo: integracja z i18n
  return (
    <select
      value={lang}
      onChange={e => setLang(e.target.value as 'pl' | 'en')}
      style={{ background: '#444', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', marginLeft: 8 }}
      title="Zmień język"
    >
      <option value="pl">Polski</option>
      <option value="en">English</option>
    </select>
  );
};

export default LanguageSwitcher;
