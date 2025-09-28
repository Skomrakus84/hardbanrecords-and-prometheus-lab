import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SimpleTest from './SimpleTest';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimpleTest />
  </StrictMode>
);