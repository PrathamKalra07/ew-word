import React from 'react';

export const PageBreakComponent = () => (
  <div 
    className="page-break" 
    data-page-break="true"
    contentEditable={false}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '20px 0',
      pointerEvents: 'none',
      userSelect: 'none',
    }}
  >
    <div style={{
      borderTop: '1px dashed #ccc',
      width: '100%',
      position: 'relative',
    }}>
      <span style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: '-10px',
        background: 'white',
        padding: '0 10px',
        color: '#999',
        fontSize: '0.8em',
      }}>
        PAGE BREAK
      </span>
    </div>
  </div>
);