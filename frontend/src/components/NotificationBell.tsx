import React, { useState } from 'react';

const mockNotifications = [
  { id: 1, text: 'Nowe wydanie muzyczne zostało opublikowane.' },
  { id: 2, text: 'Dodano nowy rozdział do książki.' },
];

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer', position: 'relative' }}
        aria-label="Powiadomienia"
      >
        🔔
        {mockNotifications.length > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: '#e53935', color: 'white', borderRadius: '50%', fontSize: 12, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mockNotifications.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 32, background: '#222', color: 'white', borderRadius: 8, boxShadow: '0 2px 8px #0008', minWidth: 220, zIndex: 10 }}>
          {mockNotifications.length === 0 ? (
            <div style={{ padding: 16, color: '#aaa' }}>Brak powiadomień</div>
          ) : (
            mockNotifications.map(n => (
              <div key={n.id} style={{ padding: 12, borderBottom: '1px solid #333' }}>{n.text}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
