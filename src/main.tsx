import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './lib/FirebaseContext.tsx';
import { GoogleWorkspaceProvider } from './lib/GoogleWorkspaceContext.tsx';
import { CurrencyProvider } from './lib/CurrencyContext.tsx';
import { LanguageProvider } from './lib/LanguageContext.tsx';

// Intercept and suppress benign WebSocket / dev-server HMR connection errors to keep the preview pristine
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason && 
      (reason === 'WebSocket closed without opened.' ||
       (reason.message && (reason.message.includes('WebSocket') || reason.message.includes('websocket'))) ||
       (typeof reason === 'string' && (reason.includes('WebSocket') || reason.includes('websocket'))))
    ) {
      event.preventDefault();
      console.warn('Gracefully suppressed development WebSocket rejection:', reason);
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message && 
      (event.message.includes('WebSocket') || event.message.includes('websocket') || event.message.includes('HMR'))
    ) {
      event.preventDefault();
      console.warn('Gracefully suppressed development WebSocket error:', event.message);
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <GoogleWorkspaceProvider>
        <CurrencyProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </CurrencyProvider>
      </GoogleWorkspaceProvider>
    </FirebaseProvider>
  </StrictMode>,
);
