import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
    position="bottom-right"
    toastOptions={{ style: { border: '2px solid #0f0f2e', borderRadius: '4px', boxShadow: '4px 4px 0 #0f0f2e', fontWeight: 600 } }}
  />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);