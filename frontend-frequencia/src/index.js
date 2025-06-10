import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Configuração avançada do Service Worker
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (registration.waiting) {
      if (window.confirm('Nova versão disponível! Recarregar agora?')) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  },
  onSuccess: () => {
    console.log('Aplicativo carregado offline');
  }
});

// Verificar atualizações periodicamente (opcional)
if ('serviceWorker' in navigator) {
  setInterval(() => {
    navigator.serviceWorker.ready.then(reg => reg.update());
  }, 2 * 60 * 60 * 1000); // 2 horas
}