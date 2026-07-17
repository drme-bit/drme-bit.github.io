import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TerrainProvider } from '@/contexts/TerrainContext';
import { ModalProvider } from '@/contexts/ModalContext';
import App from '@/App';
import '@/styles/global.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <TerrainProvider>
        <BrowserRouter>
          <ModalProvider>
            <App />
          </ModalProvider>
        </BrowserRouter>
      </TerrainProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
