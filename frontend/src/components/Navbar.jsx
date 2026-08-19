import React from 'react';
import { 
  Printer, 
  Layers, 
  RotateCw, 
  FileSpreadsheet, 
  Download, 
  Sparkles,
  Server,
  FolderOpen,
  Save,
  Upload
} from 'lucide-react';

export default function Navbar({
  orientation,
  setOrientation,
  activeSide,
  setActiveSide,
  is3dView,
  setIs3dView,
  backendOnline,
  onOpenBrowse,
  onOpenTemplates,
  onOpenBatch,
  onOpenPrint,
  onExportPdf,
  onSaveTemplate
}) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <Layers size={20} />
        </div>
        <div>
          <h1 className="brand-title">PVC Card Studio</h1>
        </div>
        <div className="brand-badge">
          <Server size={12} />
          {backendOnline ? 'Go API Online' : 'Local Mode'}
        </div>
      </div>

      <div className="nav-actions">
        {/* Browse Card Files */}
        <button className="btn btn-secondary" onClick={onOpenBrowse} title="Browse Front & Back Card Files">
          <Upload size={16} className="text-accent" />
          <span>Browse Card</span>
        </button>

        {/* Front / Back Toggle */}
        <div className="btn-group" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
          <button 
            className={`btn ${activeSide === 'front' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => setActiveSide('front')}
          >
            Front Side
          </button>
          <button 
            className={`btn ${activeSide === 'back' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => setActiveSide('back')}
          >
            Back Side
          </button>
        </div>

        {/* Orientation Toggle */}
        <button 
          className="btn btn-secondary" 
          onClick={() => setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape')}
          title="Toggle Orientation"
        >
          <RotateCw size={16} />
          {orientation === 'landscape' ? 'Landscape' : 'Portrait'}
        </button>

        {/* 3D View Toggle */}
        <button 
          className={`btn ${is3dView ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIs3dView(!is3dView)}
          title="Toggle 3D View"
        >
          <Sparkles size={16} />
          3D Plastic View
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-panel)', margin: '0 4px' }} />

        {/* Template Library */}
        <button className="btn btn-secondary" onClick={onOpenTemplates}>
          <FolderOpen size={16} />
          Templates
        </button>

        {/* Batch CSV */}
        <button className="btn btn-secondary" onClick={onOpenBatch}>
          <FileSpreadsheet size={16} />
          Batch CSV
        </button>

        {/* Save Template */}
        <button className="btn btn-secondary" onClick={onSaveTemplate} title="Save to Go Backend">
          <Save size={16} />
          Save
        </button>

        {/* Export PDF */}
        <button className="btn btn-secondary" onClick={onExportPdf}>
          <Download size={16} />
          Export PDF
        </button>

        {/* Direct Print */}
        <button className="btn btn-primary" onClick={onOpenPrint}>
          <Printer size={16} />
          Print PVC
        </button>
      </div>
    </header>
  );
}
