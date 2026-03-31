import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState('Checking...')

  useEffect(() => {
    // Attempt to connect to the backend API
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api/status' 
      : `http://${window.location.hostname}:3001/api/status`;

    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'Online') {
          setBackendStatus(`Online: ${data.message}`);
        } else {
          setBackendStatus(`Database Issue: ${data.message}`);
        }
      })
      .catch(err => setBackendStatus('Backend Offline (Check server)'));
  }, [])

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      {/* Decorative background blobs */}
      <div className="blob" style={{ top: '-100px', left: '-100px' }}></div>
      <div className="blob" style={{ bottom: '-100px', right: '-100px', background: '#0ea5e9' }}></div>
      
      <div className="glass-container">
        <div style={{ marginBottom: '1rem', display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '100px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Production Build v1.0
        </div>
        
        <h1>Quantum Logic</h1>
        <p>A simple yet powerful demonstration of premium state management and fluid responsiveness with PostgreSQL.</p>
        
        <div className="counter-display">
          {count}
        </div>

        <div style={{ margin: '1rem 0', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)', color: backendStatus.includes('Online') ? '#4ade80' : '#f87171' }}>
          <span style={{ opacity: 0.6 }}>Database Status:</span> {backendStatus}
        </div>

        <button 
          className="btn-primary"
          onClick={() => setCount((count) => count + 1)}
        >
          Increment State Jenkins
        </button>
        
        <div style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: '400' }}>
          Crafted with precision using <span style={{ color: 'rgba(255,255,255,0.6)' }}>React + Node/PG</span>
        </div>
      </div>
    </div>
  )
}

export default App
