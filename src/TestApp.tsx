import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🎵 HardbanRecords Lab - TEST</h1>
      <p>If you see this, React is working!</p>
      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'green',
        color: 'white'
      }}>
        ✅ Frontend successfully loaded!
      </div>
    </div>
  );
};

export default TestApp;
