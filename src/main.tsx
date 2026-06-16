import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './lib/FirebaseContext.tsx';
import { GoogleWorkspaceProvider } from './lib/GoogleWorkspaceContext.tsx';
import { CurrencyProvider } from './lib/CurrencyContext.tsx';
import { LanguageProvider } from './lib/LanguageContext.tsx';

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
