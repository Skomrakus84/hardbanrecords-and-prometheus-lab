import React from 'react';

interface Collaborator {
  name: string;
  share: string;
}

interface CollaboratorsListProps {
  collaborators: Collaborator[];
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ collaborators }) => {
  if (!collaborators.length) return <div style={{ color: '#aaa' }}>Brak współtwórców.</div>;
  return (
    <ul style={{ color: 'white', padding: 0, listStyle: 'none' }}>
      {collaborators.map((c, i) => (
        <li key={i} style={{ marginBottom: 8, background: '#222', borderRadius: 6, padding: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>{c.name}</span>
          <span style={{ color: '#90caf9' }}>{c.share}%</span>
        </li>
      ))}
    </ul>
  );
};

export default CollaboratorsList;
