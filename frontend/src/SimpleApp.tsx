import React from 'react';

export const SimpleApp: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          color: '#2d3748', 
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          🎵 HardbanRecords 🎵
        </h1>
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: '#4a5568', 
          marginBottom: '30px' 
        }}>
          Lab Studio Platform
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            background: '#ebf8ff', 
            padding: '20px', 
            borderRadius: '10px' 
          }}>
            <h3 style={{ color: '#2b6cb0', fontSize: '1.2rem', fontWeight: 'bold' }}>Music Distribution</h3>
            <p style={{ color: '#2c5282' }}>✅ 25 Artists</p>
            <p style={{ color: '#2c5282' }}>✅ 45 Releases</p>
          </div>
          <div style={{ 
            background: '#f0fff4', 
            padding: '20px', 
            borderRadius: '10px' 
          }}>
            <h3 style={{ color: '#276749', fontSize: '1.2rem', fontWeight: 'bold' }}>Digital Publishing</h3>
            <p style={{ color: '#2f855a' }}>✅ 12 Books</p>
            <p style={{ color: '#2f855a' }}>✅ 8 Authors</p>
          </div>
        </div>
        <div style={{ 
          background: '#f7fafc', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#2d3748', fontSize: '1.1rem' }}>
            ✅ <strong>Frontend działa!</strong><br/>
            ✅ <strong>React renderuje się!</strong><br/>
            ✅ <strong>Styling aktywny!</strong>
          </p>
        </div>
        <button style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          🚀 Aplikacja działa!
        </button>
      </div>
    </div>
  );
};

export default SimpleApp;
