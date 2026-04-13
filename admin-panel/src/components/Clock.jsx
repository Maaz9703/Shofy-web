import React, { useState, useEffect, memo } from 'react';

const Clock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px', borderRadius: 10,
      background: 'var(--card)', border: '1px solid var(--border)',
      fontSize: '0.8rem', color: 'var(--text-2)',
    }}>
      <div style={{ 
        width: 7, height: 7, borderRadius: '50%', 
        background: '#10b981', 
        boxShadow: '0 0 6px rgba(16,185,129,0.8)', 
        flexShrink: 0 
      }} />
      Live · {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};

export default memo(Clock);
