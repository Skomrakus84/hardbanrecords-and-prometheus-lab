import React from 'react';

const mockLog = [
  { id: 1, text: 'Użytkownik Jan Kowalski dodał nowe wydanie muzyczne.', date: '2025-09-01 14:23' },
  { id: 2, text: 'Użytkownik Jan Kowalski zaktualizował rozdział książki.', date: '2025-09-01 13:10' },
];

const ActivityLog: React.FC = () => {
  return (
    <div style={{ background: '#222', color: 'white', padding: 24, borderRadius: 8, maxWidth: 500 }}>
      <h3 style={{ marginBottom: 16 }}>Log aktywności</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mockLog.map(entry => (
          <li key={entry.id} style={{ marginBottom: 12, borderBottom: '1px solid #333', paddingBottom: 8 }}>
            <div style={{ fontSize: 14 }}>{entry.text}</div>
            <div style={{ color: '#aaa', fontSize: 12 }}>{entry.date}</div>
          </li>
        ))}
        {mockLog.length === 0 && <li style={{ color: '#aaa' }}>Brak aktywności.</li>}
      </ul>
    </div>
  );
};

export default ActivityLog;
