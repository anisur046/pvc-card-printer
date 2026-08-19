import React from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  QrCode, 
  Barcode, 
  ShieldAlert, 
  Square, 
  Minus,
  Sparkles,
  Award
} from 'lucide-react';

export default function Toolbar({ onAddElement, overlayEffect, setOverlayEffect }) {
  return (
    <aside className="toolbar-panel">
      <button 
        className="tool-btn" 
        onClick={() => onAddElement('text', 'HEADER TEXT')}
        title="Add Text Field"
      >
        <Type size={20} />
        <span>Text</span>
      </button>

      <button 
        className="tool-btn" 
        onClick={() => onAddElement('photo', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')}
        title="Add Photo Frame"
      >
        <ImageIcon size={20} />
        <span>Photo</span>
      </button>

      <button 
        className="tool-btn" 
        onClick={() => onAddElement('qr', 'CARD-ID-892401')}
        title="Add QR Code"
      >
        <QrCode size={20} />
        <span>QR Code</span>
      </button>

      <button 
        className="tool-btn" 
        onClick={() => onAddElement('barcode', '8924019920')}
        title="Add Barcode"
      >
        <Barcode size={20} />
        <span>Barcode</span>
      </button>

      <button 
        className="tool-btn" 
        onClick={() => onAddElement('badge', 'VIP ACCESS')}
        title="Add Security Badge"
      >
        <Award size={20} />
        <span>Badge</span>
      </button>

      <button 
        className="tool-btn" 
        onClick={() => onAddElement('shape', '')}
        title="Add Shape / Banner"
      >
        <Square size={20} />
        <span>Shape</span>
      </button>

      <button 
        className="tool-btn" 
        onClick={() => onAddElement('line', '')}
        title="Add Accent Line"
      >
        <Minus size={20} />
        <span>Line</span>
      </button>

      <div style={{ width: '32px', height: '1px', background: 'var(--border-panel)', margin: '8px 0' }} />

      <button 
        className={`tool-btn ${overlayEffect === 'hologram' ? 'active' : ''}`}
        onClick={() => setOverlayEffect(overlayEffect === 'hologram' ? 'none' : 'hologram')}
        title="Toggle Hologram Overlay"
      >
        <Sparkles size={20} />
        <span>Holo</span>
      </button>

      <button 
        className={`tool-btn ${overlayEffect === 'glossy' ? 'active' : ''}`}
        onClick={() => setOverlayEffect(overlayEffect === 'glossy' ? 'none' : 'glossy')}
        title="Toggle Plastic Gloss"
      >
        <ShieldAlert size={20} />
        <span>Gloss</span>
      </button>
    </aside>
  );
}
