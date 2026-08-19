import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Upload, 
  Printer, 
  Check, 
  X, 
  Image as ImageIcon, 
  Eye, 
  Scissors, 
  CreditCard,
  Sparkles,
  Sliders,
  FileText,
  Lock,
  AlertCircle
} from 'lucide-react';
import { renderPdfToImageDataUrl } from '../utils/pdfRenderer';
import { cropImageCanvas } from '../utils/aadhaarCardGenerator';

const ID_PRESETS = [
  {
    id: 'aadhaar-bottom',
    name: '🆔 e-Aadhaar Official PDF Cut-out (Full Front & Back - No Cut-off)',
    description: 'Auto-crops e-Aadhaar card with full height & width. Preserves left vertical text, right disclaimer box & bottom red bar.',
    front: { sx: 2.4, sy: 70.2, sw: 45.8, sh: 28.0 },
    back: { sx: 51.8, sy: 70.2, sw: 45.8, sh: 28.0 }
  },
  {
    id: 'aadhaar-bottom-tight',
    name: '🆔 e-Aadhaar Inner Card (No Margins)',
    description: 'Crops inside the outer card border box',
    front: { sx: 3.4, sy: 70.6, sw: 44.0, sh: 27.2 },
    back: { sx: 52.4, sy: 70.6, sw: 44.0, sh: 27.2 }
  },
  {
    id: 'aadhaar-scanned',
    name: '🆔 Scanned Aadhaar Card Document',
    description: 'Captures bottom-left and bottom-right halves from scanned photo/document',
    front: { sx: 1, sy: 50, sw: 48, sh: 44 },
    back: { sx: 51, sy: 50, sw: 48, sh: 44 }
  },
  {
    id: 'pan',
    name: '💳 PAN Card / Voter ID / Ration Card',
    description: 'Left half = Front card, Right half = Back card',
    front: { sx: 0, sy: 0, sw: 50, sh: 100 },
    back: { sx: 50, sy: 0, sw: 50, sh: 100 }
  },
  {
    id: 'split-vertical',
    name: '✂️ Top & Bottom Halves',
    description: 'Top half = Front card, Bottom half = Back card',
    front: { sx: 0, sy: 0, sw: 100, sh: 50 },
    back: { sx: 0, sy: 50, sw: 100, sh: 50 }
  }
];

export default function BrowseModal({ isOpen, onClose, onSubmitCards, onOpenPrint }) {
  const [activeTab, setActiveTab] = useState('auto-id'); // 'auto-id' | 'separate-files'
  const [selectedPreset, setSelectedPreset] = useState('aadhaar-bottom');

  // Auto-ID Single Document State
  const [idDocImage, setIdDocImage] = useState(null);
  const [idDocFileName, setIdDocFileName] = useState('');
  const [autoFrontImage, setAutoFrontImage] = useState(null);
  const [autoBackImage, setAutoBackImage] = useState(null);

  // PDF Password Handling
  const [pdfPassword, setPdfPassword] = useState('');
  const [rawPdfSource, setRawPdfSource] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  // Separate Files State
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontFileName, setFrontFileName] = useState('');
  const [backFileName, setBackFileName] = useState('');

  // Comprehensive Fine-tuning offsets for Auto Crop
  const [fineTune, setFineTune] = useState({
    sxOffset: 0, // horizontal shift %
    syOffset: 0, // vertical shift %
    widthScale: 0, // width scale %
    heightScale: 0 // height scale %
  });

  // Process Auto Crop whenever document or preset changes
  useEffect(() => {
    if (idDocImage && activeTab === 'auto-id') {
      const preset = ID_PRESETS.find(p => p.id === selectedPreset) || ID_PRESETS[0];

      const frontBounds = {
        sx: Math.max(0, preset.front.sx + fineTune.sxOffset),
        sy: Math.max(0, preset.front.sy + fineTune.syOffset),
        sw: Math.max(5, preset.front.sw + fineTune.widthScale),
        sh: Math.max(5, preset.front.sh + fineTune.heightScale)
      };

      const backBounds = {
        sx: Math.max(0, preset.back.sx + fineTune.sxOffset),
        sy: Math.max(0, preset.back.sy + fineTune.syOffset),
        sw: Math.max(5, preset.back.sw + fineTune.widthScale),
        sh: Math.max(5, preset.back.sh + fineTune.heightScale)
      };

      cropImageCanvas(idDocImage, frontBounds.sx, frontBounds.sy, frontBounds.sw, frontBounds.sh).then(setAutoFrontImage);
      cropImageCanvas(idDocImage, backBounds.sx, backBounds.sy, backBounds.sw, backBounds.sh).then(setAutoBackImage);
    }
  }, [idDocImage, selectedPreset, fineTune, activeTab]);

  if (!isOpen) return null;

  const processLoadedPdf = async (pdfSource, fileName, pwd = '') => {
    setIsProcessingPdf(true);
    setPasswordError(null);

    const res = await renderPdfToImageDataUrl(pdfSource, pwd);
    setIsProcessingPdf(false);

    if (res.success) {
      setIdDocImage(res.dataUrl);
      setIdDocFileName(fileName);
      setRawPdfSource(pdfSource);
      setPasswordError(null);
    } else if (res.isPasswordRequired) {
      setRawPdfSource(pdfSource);
      setIdDocFileName(fileName);
      setPasswordError(res.error);
    } else {
      setPasswordError(res.error || 'Failed to parse PDF file');
    }
  };

  const handleUnlockPdfWithPassword = () => {
    if (rawPdfSource) {
      processLoadedPdf(rawPdfSource, idDocFileName, pdfPassword);
    }
  };

  const handleNativeBrowseDoc = async (target) => {
    if (window.electronAPI && window.electronAPI.showOpenDialog) {
      try {
        const res = await window.electronAPI.showOpenDialog({
          title: 'Select Document (e-Aadhaar PDF / PAN Card / Ration Card / Image)',
          properties: ['openFile'],
          filters: [
            { name: 'Documents & Cards', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'svg'] }
          ]
        });

        if (!res.canceled && res.filePaths.length > 0) {
          const filePath = res.filePaths[0];
          const fileName = filePath.split(/[\\/]/).pop();
          const ext = fileName.split('.').pop().toLowerCase();

          if (ext === 'pdf') {
            const dataUrl = `file:///${filePath.replace(/\\/g, '/')}`;
            processLoadedPdf(dataUrl, fileName, pdfPassword);
          } else {
            const dataUrl = `file:///${filePath.replace(/\\/g, '/')}`;
            if (target === 'auto-doc') {
              setIdDocImage(dataUrl);
              setIdDocFileName(fileName);
            } else if (target === 'front') {
              setFrontImage(dataUrl);
              setFrontFileName(fileName);
            } else if (target === 'back') {
              setBackImage(dataUrl);
              setBackFileName(fileName);
            }
          }
        }
      } catch (e) {
        console.error('File browse error:', e);
      }
    }
  };

  const handleFileInputDoc = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        processLoadedPdf(event.target.result, file.name, pdfPassword);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        if (target === 'auto-doc') {
          setIdDocImage(result);
          setIdDocFileName(file.name);
        } else if (target === 'front') {
          setFrontImage(result);
          setFrontFileName(file.name);
        } else if (target === 'back') {
          setBackImage(result);
          setBackFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (autoPrint = false) => {
    let finalFront = null;
    let finalBack = null;

    if (activeTab === 'auto-id') {
      finalFront = autoFrontImage;
      finalBack = autoBackImage;
    } else {
      finalFront = frontImage;
      finalBack = backImage;
    }

    if (!finalFront && !finalBack) return;

    onSubmitCards({
      frontImage: finalFront,
      backImage: finalBack
    });

    onClose();

    if (autoPrint) {
      setTimeout(() => {
        onOpenPrint();
      }, 300);
    }
  };

  const isReady = activeTab === 'auto-id' ? (autoFrontImage || autoBackImage) : (frontImage || backImage);

  return (
    <div className="modal-backdrop">
      <div className="modal-content browse-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Scissors size={22} className="modal-icon text-accent" />
            <div>
              <h2>Auto ID Card Splitter & e-Aadhaar PDF Engine</h2>
              <p className="subtitle">Automatic Front & Back card detection for e-Aadhaar PDF, PAN, Ration & Govt ID cards</p>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'auto-id' ? 'active' : ''}`}
            onClick={() => setActiveTab('auto-id')}
          >
            <Sparkles size={16} />
            <span>Automatic e-Aadhaar PDF / PAN / Govt ID Splitter</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'separate-files' ? 'active' : ''}`}
            onClick={() => setActiveTab('separate-files')}
          >
            <FolderOpen size={16} />
            <span>Browse Separate Front & Back Images</span>
          </button>
        </div>

        <div className="modal-body">
          {/* TAB 1: AUTO ID CARD SPLITTER */}
          {activeTab === 'auto-id' && (
            <div className="auto-id-container">
              {/* Preset Selector */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>
                  Select Document Type Preset:
                </label>
                <div className="preset-radio-grid">
                  {ID_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      className={`preset-btn ${selectedPreset === preset.id ? 'active' : ''}`}
                      onClick={() => setSelectedPreset(preset.id)}
                    >
                      <div className="preset-name">{preset.name}</div>
                      <div className="preset-desc">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Password Alert */}
              {passwordError && (
                <div className="status-banner error" style={{ margin: '10px 0' }}>
                  <Lock size={18} />
                  <div style={{ flex: 1 }}>
                    <strong>Password Protected PDF:</strong>
                    <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>{passwordError}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input 
                        type="password"
                        placeholder="Enter PDF Password (e.g. PINK1994)"
                        className="input-field"
                        style={{ maxWidth: '240px' }}
                        value={pdfPassword}
                        onChange={(e) => setPdfPassword(e.target.value)}
                      />
                      <button className="btn btn-primary" onClick={handleUnlockPdfWithPassword}>
                        Unlock PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isProcessingPdf && (
                <div className="status-banner info" style={{ margin: '10px 0' }}>
                  <Sparkles size={18} className="spin" />
                  <span>Processing e-Aadhaar PDF & rendering high-resolution cards...</span>
                </div>
              )}

              {/* Upload Document Box */}
              {!idDocImage ? (
                <div className="browse-dropzone" style={{ margin: '12px 0', padding: '24px' }}>
                  <FileText size={36} opacity={0.5} className="text-accent" />
                  <p style={{ fontSize: '0.95rem', fontWeight: '700' }}>Browse e-Aadhaar PDF / PAN / Ration Card File</p>
                  <span className="subtext">Select the e-Aadhaar PDF file or single document image</span>

                  <div className="browse-btn-group" style={{ maxWidth: '320px', marginTop: '12px' }}>
                    {window.electronAPI && (
                      <button className="btn btn-secondary" onClick={() => handleNativeBrowseDoc('auto-doc')}>
                        <FolderOpen size={16} /> Browse Computer File
                      </button>
                    )}
                    <label className="btn btn-primary">
                      <Upload size={16} /> Upload e-Aadhaar PDF / Image
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileInputDoc(e, 'auto-doc')} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="auto-preview-section">
                  <div className="auto-file-tag">
                    <span>Loaded Document: <strong>{idDocFileName}</strong></span>
                    <button className="btn-text-danger" onClick={() => setIdDocImage(null)}>
                      <X size={14} /> Change Document
                    </button>
                  </div>

                  {/* Auto Split Previews */}
                  <div className="browse-dual-grid">
                    <div className="browse-card-box">
                      <div className="browse-box-header">
                        <Check size={16} className="text-accent" />
                        <h3>Detected Front Side</h3>
                      </div>
                      {autoFrontImage ? (
                        <div className="browse-preview-wrapper">
                          <img src={autoFrontImage} alt="Auto Front Card" className="browse-preview-img" />
                          <div className="preview-file-tag">Front Card (CR80 Ready)</div>
                        </div>
                      ) : (
                        <div className="browse-dropzone">Extracting Front...</div>
                      )}
                    </div>

                    <div className="browse-card-box">
                      <div className="browse-box-header">
                        <Check size={16} className="text-accent" />
                        <h3>Detected Back Side</h3>
                      </div>
                      {autoBackImage ? (
                        <div className="browse-preview-wrapper">
                          <img src={autoBackImage} alt="Auto Back Card" className="browse-preview-img" />
                          <div className="preview-file-tag">Back Card (CR80 Ready)</div>
                        </div>
                      ) : (
                        <div className="browse-dropzone">Extracting Back...</div>
                      )}
                    </div>
                  </div>

                  {/* Fine Tuning Sliders */}
                  <div className="fine-tune-box">
                    <div className="fine-tune-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sliders size={14} />
                        <span>Interactive Fine-Tune Crop Controls</span>
                      </div>
                      <button 
                        className="btn-text-subtle" 
                        onClick={() => setFineTune({ sxOffset: 0, syOffset: 0, widthScale: 0, heightScale: 0 })}
                        style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}
                      >
                        Reset Sliders
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginTop: '8px' }}>
                      <div className="form-group">
                        <label className="form-label">Horizontal Shift ({fineTune.sxOffset > 0 ? `+${fineTune.sxOffset}` : fineTune.sxOffset}%)</label>
                        <input 
                          type="range" 
                          min="-15" 
                          max="15" 
                          step="0.5"
                          value={fineTune.sxOffset} 
                          onChange={(e) => setFineTune({ ...fineTune, sxOffset: parseFloat(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Vertical Shift ({fineTune.syOffset > 0 ? `+${fineTune.syOffset}` : fineTune.syOffset}%)</label>
                        <input 
                          type="range" 
                          min="-15" 
                          max="15" 
                          step="0.5"
                          value={fineTune.syOffset} 
                          onChange={(e) => setFineTune({ ...fineTune, syOffset: parseFloat(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Card Width Scale ({fineTune.widthScale > 0 ? `+${fineTune.widthScale}` : fineTune.widthScale}%)</label>
                        <input 
                          type="range" 
                          min="-15" 
                          max="15" 
                          step="0.5"
                          value={fineTune.widthScale} 
                          onChange={(e) => setFineTune({ ...fineTune, widthScale: parseFloat(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Card Height Scale ({fineTune.heightScale > 0 ? `+${fineTune.heightScale}` : fineTune.heightScale}%)</label>
                        <input 
                          type="range" 
                          min="-15" 
                          max="15" 
                          step="0.5"
                          value={fineTune.heightScale} 
                          onChange={(e) => setFineTune({ ...fineTune, heightScale: parseFloat(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEPARATE FRONT & BACK FILES */}
          {activeTab === 'separate-files' && (
            <div className="browse-dual-grid">
              {/* Front Side Upload */}
              <div className="browse-card-box">
                <div className="browse-box-header">
                  <ImageIcon size={18} className="text-accent" />
                  <h3>Front Side Card Image</h3>
                </div>

                {frontImage ? (
                  <div className="browse-preview-wrapper">
                    <img src={frontImage} alt="Front Card Preview" className="browse-preview-img" />
                    <div className="preview-file-tag">{frontFileName || 'Front Image Loaded'}</div>
                    <button className="btn-remove-img" onClick={() => setFrontImage(null)}>
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="browse-dropzone">
                    <Upload size={32} opacity={0.4} />
                    <p>Browse Front Card File</p>
                    <span className="subtext">PNG, JPG, WEBP, SVG</span>

                    <div className="browse-btn-group">
                      {window.electronAPI && (
                        <button className="btn btn-secondary" onClick={() => handleNativeBrowseDoc('front')}>
                          <FolderOpen size={14} /> Browse Computer
                        </button>
                      )}
                      <label className="btn btn-primary">
                        <Upload size={14} /> Select Front File
                        <input type="file" accept="image/*" onChange={(e) => handleFileInputDoc(e, 'front')} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Back Side Upload */}
              <div className="browse-card-box">
                <div className="browse-box-header">
                  <ImageIcon size={18} className="text-accent" />
                  <h3>Back Side Card Image</h3>
                </div>

                {backImage ? (
                  <div className="browse-preview-wrapper">
                    <img src={backImage} alt="Back Card Preview" className="browse-preview-img" />
                    <div className="preview-file-tag">{backFileName || 'Back Image Loaded'}</div>
                    <button className="btn-remove-img" onClick={() => setBackImage(null)}>
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="browse-dropzone">
                    <Upload size={32} opacity={0.4} />
                    <p>Browse Back Card File</p>
                    <span className="subtext">PNG, JPG, WEBP, SVG</span>

                    <div className="browse-btn-group">
                      {window.electronAPI && (
                        <button className="btn btn-secondary" onClick={() => handleNativeBrowseDoc('back')}>
                          <FolderOpen size={14} /> Browse Computer
                        </button>
                      )}
                      <label className="btn btn-primary">
                        <Upload size={14} /> Select Back File
                        <input type="file" accept="image/*" onChange={(e) => handleFileInputDoc(e, 'back')} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isReady && (
            <div className="status-banner success" style={{ marginTop: '14px' }}>
              <Check size={18} />
              <span>Front & Back card sides extracted and ready for PVC card printing!</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              disabled={!isReady}
              onClick={() => handleSubmit(false)}
            >
              <Eye size={16} />
              Display Front & Back on Canvas
            </button>

            <button 
              className="btn btn-primary" 
              disabled={!isReady}
              onClick={() => handleSubmit(true)}
            >
              <Printer size={16} />
              Display & Print PVC Card Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
