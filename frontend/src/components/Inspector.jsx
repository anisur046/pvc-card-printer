import React from 'react';
import { 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Tag
} from 'lucide-react';

export default function Inspector({ 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement,
  onLayerChange,
  sideConfig,
  onUpdateSideConfig,
  csvHeaders
}) {
  if (!selectedElement) {
    return (
      <aside className="inspector-panel">
        <div className="panel-header">
          <span className="panel-title">Card Side Config</span>
        </div>

        <div className="inspector-section">
          <div className="section-title">Background Customization</div>
          <div className="form-group">
            <label className="form-label">Background Color</label>
            <input 
              type="color" 
              className="form-input" 
              style={{ height: '40px', padding: '2px', cursor: 'pointer' }}
              value={sideConfig.bgColor || '#0f172a'} 
              onChange={(e) => onUpdateSideConfig({ bgColor: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gradient Fill</label>
            <select 
              className="form-select"
              value={sideConfig.bgGradient || 'none'}
              onChange={(e) => onUpdateSideConfig({ bgGradient: e.target.value === 'none' ? '' : e.target.value })}
            >
              <option value="none">Solid Color</option>
              <option value="linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)">Deep Indigo Cyber</option>
              <option value="linear-gradient(180deg, #022c22 0%, #065f46 60%, #047857 100%)">Emerald Academy</option>
              <option value="linear-gradient(135deg, #0369a1 0%, #0f172a 100%)">Medical Sky Blue</option>
              <option value="linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)">Dark Carbon VIP</option>
              <option value="linear-gradient(135deg, #7c2d12 0%, #0f172a 100%)">Crimson Security</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Surface Finish Effect</label>
            <select 
              className="form-select"
              value={sideConfig.overlayEffect || 'none'}
              onChange={(e) => onUpdateSideConfig({ overlayEffect: e.target.value })}
            >
              <option value="none">Standard Matte</option>
              <option value="hologram">✨ Holographic Security Shimmer</option>
              <option value="glossy">🛡️ High Gloss Laminate</option>
            </select>
          </div>
        </div>

        <div className="inspector-section">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            💡 Click on any element on the card canvas to customize its text, CSV dynamic bindings, fonts, colors, and layout positions.
          </p>
        </div>
      </aside>
    );
  }

  const el = selectedElement;

  return (
    <aside className="inspector-panel">
      <div className="panel-header">
        <span className="panel-title">Element Inspector</span>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '4px 8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          onClick={() => onDeleteElement(el.id)}
          title="Delete Element"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <div className="inspector-section">
        <div className="section-title">
          <Tag size={14} />
          Content & Data Binding
        </div>

        <div className="form-group">
          <label className="form-label">Element Content / Value</label>
          {el.type === 'photo' ? (
            <input 
              type="text" 
              className="form-input" 
              value={el.content} 
              placeholder="Image URL or upload"
              onChange={(e) => onUpdateElement({ content: e.target.value })}
            />
          ) : (
            <textarea 
              className="form-input" 
              style={{ minHeight: '60px', resize: 'vertical' }}
              value={el.content} 
              onChange={(e) => onUpdateElement({ content: e.target.value })}
            />
          )}
        </div>

        {/* Dynamic CSV Tag Binding */}
        <div className="form-group">
          <label className="form-label">Dynamic CSV Variable Tag</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              className="form-select"
              value={el.dynamicTag || 'none'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'none') {
                  onUpdateElement({ isDynamic: false, dynamicTag: '' });
                } else {
                  onUpdateElement({ isDynamic: true, dynamicTag: val });
                }
              }}
            >
              <option value="none">Static Content</option>
              {csvHeaders && csvHeaders.length > 0 ? (
                csvHeaders.map(h => (
                  <option key={h} value={h}>Direct CSV: {'{' + h + '}'}</option>
                ))
              ) : (
                <>
                  <option value="name">CSV Field: {'{name}'}</option>
                  <option value="role">CSV Field: {'{role}'}</option>
                  <option value="dept">CSV Field: {'{dept}'}</option>
                  <option value="id">CSV Field: {'{id}'}</option>
                  <option value="photo">CSV Field: {'{photo}'}</option>
                </>
              )}
            </select>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
            Binds this element to columns imported from CSV files.
          </span>
        </div>
      </div>

      <div className="inspector-section">
        <div className="section-title">
          <Palette size={14} />
          Style & Appearance
        </div>

        {/* Font Family & Size */}
        {(el.type === 'text' || el.type === 'badge') && (
          <>
            <div className="form-group">
              <label className="form-label">Font Family</label>
              <select 
                className="form-select"
                value={el.fontFamily || 'Inter, sans-serif'}
                onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
              >
                <option value="Inter, sans-serif">Inter Clean</option>
                <option value="Outfit, sans-serif">Outfit Modern</option>
                <option value="'Space Grotesk', sans-serif">Space Grotesk Tech</option>
                <option value="'Courier New', monospace">Courier Monospace</option>
                <option value="Georgia, serif">Serif Classic</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="form-group">
                <label className="form-label">Font Size (px)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={el.fontSize || 12} 
                  onChange={(e) => onUpdateElement({ fontSize: parseFloat(e.target.value) || 12 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Font Weight</label>
                <select 
                  className="form-select"
                  value={el.fontWeight || '400'}
                  onChange={(e) => onUpdateElement({ fontWeight: e.target.value })}
                >
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Text Alignment</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className={`btn ${el.textAlign === 'left' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '6px' }}
                  onClick={() => onUpdateElement({ textAlign: 'left' })}
                >
                  <AlignLeft size={14} />
                </button>
                <button 
                  className={`btn ${el.textAlign === 'center' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '6px' }}
                  onClick={() => onUpdateElement({ textAlign: 'center' })}
                >
                  <AlignCenter size={14} />
                </button>
                <button 
                  className={`btn ${el.textAlign === 'right' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '6px' }}
                  onClick={() => onUpdateElement({ textAlign: 'right' })}
                >
                  <AlignRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Colors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="form-group">
            <label className="form-label">Text / Main Color</label>
            <input 
              type="color" 
              className="form-input" 
              style={{ height: '36px', padding: '2px' }}
              value={el.color || '#ffffff'} 
              onChange={(e) => onUpdateElement({ color: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Background Color</label>
            <input 
              type="color" 
              className="form-input" 
              style={{ height: '36px', padding: '2px' }}
              value={el.bgColor || '#6366f1'} 
              onChange={(e) => onUpdateElement({ bgColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="inspector-section">
        <div className="section-title">Layering & Ordering</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ flex: 1 }}
            onClick={() => onLayerChange(el.id, 'up')}
          >
            <ArrowUp size={14} />
            Bring Forward
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ flex: 1 }}
            onClick={() => onLayerChange(el.id, 'down')}
          >
            <ArrowDown size={14} />
            Send Backward
          </button>
        </div>
      </div>
    </aside>
  );
}
