// Verificar atualizações periodicamente
if ('serviceWorker' in navigator) {
  const checkUpdates = () => {
    navigator.serviceWorker.ready.then(registration => {
      registration.update().then(() => {
        console.log('Verificando atualizações...');
      });
    });
  };
  
  // Verificar a cada 2 horas
  setInterval(checkUpdates, 2 * 60 * 60 * 1000);
  checkUpdates();
}