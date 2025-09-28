import React from 'react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = 'Brak danych do wyświetlenia.' }) => (
  <div style={{ color: '#aaa', textAlign: 'center', padding: 32 }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
    <div>{message}</div>
  </div>
);

export default EmptyState;
