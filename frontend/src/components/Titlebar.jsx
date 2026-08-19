import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, CreditCard, Cpu, Printer, User, LogOut } from 'lucide-react';

export default function Titlebar({ backendOnline, defaultPrinter, currentUser, onLogout }) {
  const [isElectron, setIsElectron] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      window.electronAPI.isMaximized().then(setIsMaximized);
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
      window.electronAPI.isMaximized().then(setIsMaximized);
    }
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.closeWindow();
  };

  return (
    <div className="app-titlebar">
      <div className="titlebar-drag-area">
        <div className="titlebar-left">
          <div className="titlebar-logo">
            <CreditCard size={15} className="title-icon" />
            <span className="app-name">PVC Card Studio Desktop</span>
            <span className="app-version">v1.0 Pro</span>
          </div>

          <div className="titlebar-pills">
            <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`}>
              <Cpu size={12} />
              <span>{backendOnline ? 'Go API Connected' : 'Local Standalone'}</span>
            </div>
            {defaultPrinter && (
              <div className="status-pill printer-pill">
                <Printer size={12} />
                <span>{defaultPrinter}</span>
              </div>
            )}
            {currentUser && (
              <div className="status-pill user-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8' }}>
                <User size={12} />
                <span>Operator: {currentUser.username}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentUser && onLogout && (
        <button 
          className="titlebar-logout-btn"
          onClick={onLogout}
          title="Sign Out / Lock Application"
          style={{
            background: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: '#fda4af',
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginRight: '8px',
            webkitAppRegion: 'no-drag'
          }}
        >
          <LogOut size={12} />
          <span>Logout</span>
        </button>
      )}

      {isElectron ? (
        <div className="window-controls">
          <button className="window-btn minimize" onClick={handleMinimize} title="Minimize">
            <Minus size={14} />
          </button>
          <button className="window-btn maximize" onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? <Copy size={12} /> : <Square size={12} />}
          </button>
          <button className="window-btn close" onClick={handleClose} title="Close">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="browser-mode-tag">Desktop Web Client</div>
      )}
    </div>
  );
}
