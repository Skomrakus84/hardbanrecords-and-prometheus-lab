import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useAlert } from './GlobalAlert';

export default function AdminPanel() {
  const { authFetch } = useAuth();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    authFetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
        else showAlert(data.message || 'Błąd pobierania użytkowników');
      })
      .catch(() => showAlert('Błąd sieci'));
  }, [authFetch, showAlert]);

  return (
    <div>
      <h2>Panel administracyjny – Użytkownicy</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nazwa użytkownika</th><th>Rola</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}