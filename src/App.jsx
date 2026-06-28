import React, { useState } from 'react';
import { apiFetch } from './api/client.js';

function App() {
  const [status, setStatus] = useState('API test has not run yet.');

  const checkApi = async () => {
    try {
      await apiFetch('/api/health');
      setStatus('API connection succeeded.');
    } catch (error) {
      setStatus(`API connection failed: ${error.message}`);
    }
  };

  return (
    <main className="app">
      <section className="panel">
        <p className="eyebrow">BitBrake</p>
        <h1>React setup is working</h1>
        <p className="description">
          This is a Vite React project. The backend URL is managed with
          VITE_API_BASE_URL in the .env file.
        </p>
        <button type="button" onClick={checkApi}>
          Test API connection
        </button>
        <p className="status">{status}</p>
      </section>
    </main>
  );
}

export default App;
