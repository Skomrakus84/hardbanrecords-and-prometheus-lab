import React from 'react';
import ReactDOM from 'react-dom/client';

function SimpleApp() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      color: '#333',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🚀 HardbanRecords Lab - Test Page</h1>
      <p>Jeśli widzisz to, React działa poprawnie!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h2>Status sprawdzenia:</h2>
        <ul>
          <li>✅ React renderuje się poprawnie</li>
          <li>✅ CSS inline działa</li>
          <li>✅ Vercel deployment sukces</li>
        </ul>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);