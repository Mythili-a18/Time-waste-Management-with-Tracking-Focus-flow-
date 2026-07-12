import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ── Schema guard: clear stale storage if required keys are missing ──
try {
  const stored = localStorage.getItem('focusflow_appdata');
  if (stored) {
    const parsed = JSON.parse(stored);
    // If key fields added in this version are missing, reset to defaults
    if (!parsed.userProfile || parsed.userProfile === undefined) {
      console.warn('⚠️ Schema mismatch detected. Clearing stale localStorage and reloading with defaults.');
      localStorage.removeItem('focusflow_appdata');
    }
  }
} catch (e) {
  console.error('❌ Failed to validate storage schema. Clearing.', e);
  localStorage.removeItem('focusflow_appdata');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
