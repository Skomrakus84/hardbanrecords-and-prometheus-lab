import React from 'react';

const AnalyticsView: React.FC = () => {
  // Przykładowe statystyki (do rozbudowy po integracji z backendem)
  return (
    <div style={{ background: '#222', color: 'white', padding: 24, borderRadius: 8, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>Statystyki aplikacji</h3>
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
        <li>Wydania muzyczne: <b>12</b></li>
        <li>Książki: <b>5</b></li>
        <li>Rozdziały: <b>37</b></li>
        <li>Użytkownicy: <b>1</b></li>
      </ul>
      <div style={{ color: '#aaa', fontSize: 13, marginTop: 16 }}>
        Wersja demo – dane przykładowe. Po wdrożeniu backendu pojawią się wykresy i szczegółowe statystyki.
      </div>
    </div>
  );
};

export default AnalyticsView;
