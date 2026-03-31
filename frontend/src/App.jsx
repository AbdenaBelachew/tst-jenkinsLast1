import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')
  const [items, setItems] = useState([])
  const [newItemName, setNewItemName] = useState('')
  const [loading, setLoading] = useState(false)

  const getBaseUrl = () => {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : `http://${window.location.hostname}`;
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/status`);
      const data = await res.json();
      if (data.status === 'Online') {
        setBackendStatus(`Online: ${data.message}`);
      } else {
        setBackendStatus(`Database Issue: ${data.message}`);
      }
    } catch (err) {
      setBackendStatus('Backend Offline (Check server)');
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/test/list`);
      const payload = await res.json();
      if (payload.data) {
        setItems(payload.data);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchItems();
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/test/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName })
      });
      
      if (res.ok) {
        setNewItemName('');
        fetchItems(); // Refresh the list
      }
    } catch (err) {
      console.error("Failed to add item:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {/* Decorative background blobs */}
      <div className="blob" style={{ top: '-100px', left: '-100px' }}></div>
      <div className="blob" style={{ bottom: '-100px', right: '-100px', background: '#0ea5e9' }}></div>
      
      <div className="glass-container" style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ marginBottom: '1rem', display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '100px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Production Build v1.1
        </div>
        
        <h1>Data Logic Core</h1>
        <p>A simple end-to-end demonstration of premium state management and real-time database integrations.</p>
        
        <div style={{ margin: '1rem 0', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)', color: backendStatus.includes('Online') ? '#4ade80' : '#f87171' }}>
          <span style={{ opacity: 0.6 }}>Database Status:</span> {backendStatus}
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
          <input 
            type="text" 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter a new record name..."
            style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
          />
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || !newItemName.trim()}
          >
            {loading ? 'Adding...' : 'Insert Data'}
          </button>
        </form>

        {/* List Section */}
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.8 }}>Recent Records:</h3>
          {items.length === 0 ? (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', opacity: 0.5 }}>
              No records found.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map(item => (
                <li key={item.id} style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontWeight: '500' }}>{item.name}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: '400', textAlign: 'center' }}>
          Crafted with precision using <span style={{ color: 'rgba(255,255,255,0.6)' }}>React + Node/PG</span>
        </div>
      </div>
    </div>
  )
}

export default App
