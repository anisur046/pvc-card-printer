import React, { useState } from 'react';
import { Sparkles, Printer, Download, Maximize2, Minimize2, CreditCard, Sliders, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export default function OutputCardPreview({
  frontCardImage,
  backCardImage,
  onPrintCard,
  onExportPdf,
  cardFrontRef,
  cardBackRef
}) {
  const [scaleMode, setScaleMode] = useState('physical'); // 'physical' (1:1 85.6mm x 54mm) | 'fit'
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);

  // Fine-tune scale and offsets for Front and Back cards
  const [frontAdjust, setFrontAdjust] = useState({ scale: 1.0, x: 0, y: 0 });
  const [backAdjust, setBackAdjust] = useState({ scale: 1.0, x: 0, y: 0 });

  const resetAdjustments = () => {
    setFrontAdjust({ scale: 1.0, x: 0, y: 0 });
    setBackAdjust({ scale: 1.0, x: 0, y: 0 });
  };

  return (
    <div className="output-card-preview-section">
      {/* Glow Title Header & Action Bar */}
      <div className="output-preview-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1080px', margin: '0 auto 16px auto', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="star-glow">✨</span>
          <h2 className="output-preview-title" style={{ margin: 0 }}>OUTPUT CARD PREVIEW</h2>
          <div className="size-badge">
            <CreditCard size={13} />
            <span>CR80 PVC (85.6mm × 54.0mm)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className={`btn ${showAdjustPanel ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAdjustPanel(!showAdjustPanel)}
            title="Adjust PVC Card Scale & Position"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            <Sliders size={14} />
            <span>{showAdjustPanel ? 'Hide Card Adjuster' : 'Adjust Front & Back Cards'}</span>
            {showAdjustPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button 
            className={`btn ${scaleMode === 'physical' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setScaleMode(scaleMode === 'physical' ? 'fit' : 'physical')}
            title="Toggle between Exact 1:1 Physical PVC Card size (85.6mm x 54mm) and HD Fit view"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            {scaleMode === 'physical' ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            <span>{scaleMode === 'physical' ? '1:1 Physical PVC Size (85.6×54mm)' : 'HD Expanded View'}</span>
          </button>
          <button className="btn btn-secondary" onClick={onExportPdf} style={{ padding: '6px 14px', fontSize: '13px' }}>
            <Download size={14} />
            <span>Export PDF</span>
          </button>
          <button className="btn btn-primary" onClick={onPrintCard} style={{ padding: '6px 16px', fontSize: '13px' }}>
            <Printer size={14} />
            <span>Print PVC Card</span>
          </button>
        </div>
      </div>

      {/* Interactive Adjustment Controls Panel */}
      {showAdjustPanel && (
        <div className="card-adjust-panel" style={{ width: '100%', maxWidth: '1080px', margin: '0 auto 16px auto', padding: '14px 18px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-panel)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
              <Sliders size={16} />
              <span>Interactive PVC Card Position & Scale Adjuster</span>
            </div>
            <button className="btn-text-subtle" onClick={resetAdjustments} style={{ fontSize: '12px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={12} /> Reset Positions
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* FRONT SIDE ADJUSTMENTS */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#38bdf8', marginBottom: '8px' }}>Front Side Adjustments</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Scale ({Math.round(frontAdjust.scale * 100)}%)</label>
                  <input type="range" min="0.8" max="1.2" step="0.01" value={frontAdjust.scale} onChange={(e) => setFrontAdjust({ ...frontAdjust, scale: parseFloat(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Shift X ({frontAdjust.x}px)</label>
                  <input type="range" min="-30" max="30" step="1" value={frontAdjust.x} onChange={(e) => setFrontAdjust({ ...frontAdjust, x: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Shift Y ({frontAdjust.y}px)</label>
                  <input type="range" min="-30" max="30" step="1" value={frontAdjust.y} onChange={(e) => setFrontAdjust({ ...frontAdjust, y: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* BACK SIDE ADJUSTMENTS */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#38bdf8', marginBottom: '8px' }}>Back Side Adjustments</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Scale ({Math.round(backAdjust.scale * 100)}%)</label>
                  <input type="range" min="0.8" max="1.2" step="0.01" value={backAdjust.scale} onChange={(e) => setBackAdjust({ ...backAdjust, scale: parseFloat(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Shift X ({backAdjust.x}px)</label>
                  <input type="range" min="-30" max="30" step="1" value={backAdjust.x} onChange={(e) => setBackAdjust({ ...backAdjust, x: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Shift Y ({backAdjust.y}px)</label>
                  <input type="range" min="-30" max="30" step="1" value={backAdjust.y} onChange={(e) => setBackAdjust({ ...backAdjust, y: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side by Side Dual Card Display Grid */}
      <div className={`output-dual-cards-container ${scaleMode}`}>
        {/* FRONT CARD PREVIEW */}
        <div className={`output-card-wrapper ${scaleMode}`}>
          <div className="card-side-label">
            <span>Front Side (CR80 PVC)</span>
            <span className="dim-tag">85.6 mm × 54.0 mm</span>
          </div>
          <div 
            ref={cardFrontRef}
            className={`output-card-box ${scaleMode}`}
          >
            {frontCardImage ? (
              <img 
                src={frontCardImage} 
                alt="Aadhaar Front Side" 
                className="output-card-img" 
                style={{
                  transform: `scale(${frontAdjust.scale}) translate(${frontAdjust.x}px, ${frontAdjust.y}px)`
                }}
              />
            ) : (
              <div className="card-placeholder-box">
                <Sparkles size={32} opacity={0.3} />
                <p>Front Side Preview</p>
                <span className="subtext">Select file & click SHOW CARD</span>
              </div>
            )}
          </div>
        </div>

        {/* BACK CARD PREVIEW */}
        <div className={`output-card-wrapper ${scaleMode}`}>
          <div className="card-side-label">
            <span>Back Side (CR80 PVC)</span>
            <span className="dim-tag">85.6 mm × 54.0 mm</span>
          </div>
          <div 
            ref={cardBackRef}
            className={`output-card-box ${scaleMode}`}
          >
            {backCardImage ? (
              <img 
                src={backCardImage} 
                alt="Aadhaar Back Side" 
                className="output-card-img"
                style={{
                  transform: `scale(${backAdjust.scale}) translate(${backAdjust.x}px, ${backAdjust.y}px)`
                }}
              />
            ) : (
              <div className="card-placeholder-box">
                <Sparkles size={32} opacity={0.3} />
                <p>Back Side Preview</p>
                <span className="subtext">Select file & click SHOW CARD</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
