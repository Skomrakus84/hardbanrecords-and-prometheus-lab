import React from 'react';

interface SplitsViewProps {
  release?: any;
}

export const SplitsView: React.FC<SplitsViewProps> = ({ release }) => {
  return (
    <div>
      <h2>Splits Management</h2>
      {release ? (
        <div>
          <h3>{release.title} - Splits</h3>
          <p>Splits management will be implemented here.</p>
        </div>
      ) : (
        <p>Please select a release to manage splits.</p>
      )}
    </div>
  );
};