import React from 'react';

// Przykładowy profil użytkownika (do rozbudowy po integracji z auth)
const mockUser = {
  name: 'Jan Kowalski',
  email: 'jan.kowalski@example.com',
  avatar: '',
  role: 'Admin',
};

const UserProfile: React.FC = () => {
  return (
    <div style={{ background: '#222', color: 'white', padding: 24, borderRadius: 8, maxWidth: 340 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
          {mockUser.avatar ? <img src={mockUser.avatar} alt="avatar" style={{ width: '100%', borderRadius: '50%' }} /> : mockUser.name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 20 }}>{mockUser.name}</div>
          <div style={{ color: '#90caf9', fontSize: 14 }}>{mockUser.email}</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>{mockUser.role}</div>
        </div>
      </div>
      <button style={{ background: '#666', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', width: '100%' }}>
        Wyloguj
      </button>
    </div>
  );
};

export default UserProfile;
