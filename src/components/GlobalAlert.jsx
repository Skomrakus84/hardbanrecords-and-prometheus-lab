import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert }}>
      {children}
      {alert && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          padding: '12px 24px',
          background: alert.type === 'error' ? '#ffdddd' : '#ddffdd',
          color: alert.type === 'error' ? '#a00' : '#070',
          border: '1px solid #ccc',
          borderRadius: 6,
          zIndex: 9999
        }}>
          {alert.message}
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}