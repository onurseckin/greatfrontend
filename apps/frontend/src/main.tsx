import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Expose React for iframe previews, matching original behavior
(window as any).React = React;
(window as any).ReactDOM = ReactDOMClient;

ReactDOMClient.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
