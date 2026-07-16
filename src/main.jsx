import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { TerrainProvider } from '@/contexts/TerrainContext';
import App from '@/App';
import '@/styles/global.scss';
import '@/styles/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <TerrainProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TerrainProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
