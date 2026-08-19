import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, AlertCircle, RefreshCw, X, ShieldCheck, Settings, Download } from 'lucide-react';

export default function PrintModal({ 
  isOpen, 
  onClose, 
  orientation, 
  activeSide, 
  onExportPdf, 
  cardFrontRef, 
  cardBackRef,
  printSide: externalPrintSide,
  setPrintSide: externalSetPrintSide
}) {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [localPrintSide, setLocalPrintSide] = useState('both');
  const printSide = externalPrintSide !== undefined ? externalPrintSide : localPrintSide;
  const setPrintSide = externalSetPrintSide || setLocalPrintSide;

  const [dpi, setDpi] = useState('300'); // '300', '600'
  const [copies, setCopies] = useState(1);
  const [pageSize, setPageSize] = useState('A4'); // 'A4', 'Letter', 'Legal'
  const [marginType, setMarginType] = useState('default'); // 'default', 'none'
  const [silentPrint, setSilentPrint] = useState(false);
  const [printStatus, setPrintStatus] = useState(null); // { type: 'success'|'error', msg: string }
  const [isElectron, setIsElectron] = useState(false);

  const fetchPrinters = async () => {
    if (window.electronAPI && window.electronAPI.getPrinters) {
      setLoadingPrinters(true);
      setIsElectron(true);
      try {
        const list = await window.electronAPI.getPrinters();
        setPrinters(list);
        const def = list.find(p => p.isDefault);
        if (def) setSelectedPrinter(def.name);
        else if (list.length > 0) setSelectedPrinter(list[0].name);
      } catch (err) {
        console.error('Failed to get printers:', err);
      } finally {
        setLoadingPrinters(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPrinters();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecutePrint = async () => {
    setPrintStatus({ type: 'info', msg: 'Spooling PVC card print job...' });

    if (isElectron && window.electronAPI && window.electronAPI.printCard) {
      try {
        const res = await window.electronAPI.printCard({
          deviceName: selectedPrinter,
          landscape: orientation === 'landscape',
          copies: copies,
          pageSize: pageSize,
          marginType: marginType,
          silent: silentPrint
        });

        if (res.success) {
          setPrintStatus({ 
            type: 'success', 
            msg: res.interactive 
              ? 'Opened system print dialog.' 
              : `Card dispatched to ${selectedPrinter || 'default printer'}!` 
          });
          setTimeout(() => {
            setPrintStatus(null);
            onClose();
          }, 1800);
        } else {
          window.print();
          setPrintStatus({ type: 'success', msg: 'Opened system print window.' });
        }
      } catch (e) {
        window.print();
        setPrintStatus({ type: 'success', msg: 'Opened system print window.' });
      }
    } else {
      // Fallback for Web browser standard print
      window.print();
      setPrintStatus({ type: 'success', msg: 'Sent to system print window.' });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content print-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Printer size={22} className="modal-icon text-accent" />
            <div>
              <h2>PVC Desktop Print Manager</h2>
              <p className="subtitle">CR80 Plastic Card Spooler (3.375" x 2.125" / 85.6mm x 54mm)</p>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Printer Selection section */}
          <div className="form-section">
            <div className="section-title">
              <Settings size={16} />
              <span>Target Printer Device</span>
              {isElectron && (
                <button className="btn-icon-subtle" onClick={fetchPrinters} title="Refresh Printers">
                  <RefreshCw size={14} className={loadingPrinters ? 'spin' : ''} />
                </button>
              )}
            </div>

            {isElectron ? (
              <div className="form-group">
                <label>Select Connected Local Printer</label>
                <select 
                  className="input-select" 
                  value={selectedPrinter} 
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                >
                  {printers.length === 0 ? (
                    <option value="">No printers detected (Using System Default)</option>
                  ) : (
                    printers.map((p, idx) => (
                      <option key={idx} value={p.name}>
                        {p.name} {p.isDefault ? ' (Default)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
            ) : (
              <div className="notice-box info">
                <ShieldCheck size={16} />
                <span>Running in browser mode. Standard system printer dialog will be invoked.</span>
              </div>
            )}
          </div>

          {/* CR80 Card Setup options */}
          <div className="print-options-grid">
            <div className="form-group">
              <label>Print Target Sides</label>
              <div className="radio-pills">
                <button 
                  className={`pill-btn ${printSide === 'front' ? 'active' : ''}`}
                  onClick={() => setPrintSide('front')}
                >
                  Front Side Only
                </button>
                <button 
                  className={`pill-btn ${printSide === 'back' ? 'active' : ''}`}
                  onClick={() => setPrintSide('back')}
                >
                  Back Side Only
                </button>
                <button 
                  className={`pill-btn ${printSide === 'both' ? 'active' : ''}`}
                  onClick={() => setPrintSide('both')}
                >
                  Double-Sided (Duplex)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Card Orientation & Preset</label>
              <div className="preset-info-box">
                <div><strong>Standard:</strong> CR80 (ISO/IEC 7810 ID-1)</div>
                <div><strong>Dimensions:</strong> 3.375" × 2.125" (85.6mm × 54mm)</div>
                <div><strong>Orientation:</strong> {orientation.toUpperCase()}</div>
              </div>
            </div>

            <div className="form-group">
              <label>Paper / Media Size</label>
              <select className="input-select" value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                <option value="A4">A4 Sheet (Standard HP LaserJet, Epson, Canon)</option>
                <option value="Letter">US Letter Paper</option>
                <option value="Legal">US Legal Paper</option>
              </select>
            </div>

            <div className="form-group">
              <label>Printer Hardware & Margins Preset</label>
              <select className="input-select" value={marginType} onChange={(e) => setMarginType(e.target.value)}>
                <option value="default">System Default Driver Margins (HP LaserJet, Canon, Epson)</option>
                <option value="none">Zero Margin Borderless (Fargo, Zebra, Evolis PVC Printers)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Print Resolution (DPI)</label>
              <select className="input-select" value={dpi} onChange={(e) => setDpi(e.target.value)}>
                <option value="300">300 DPI High Definition (Recommended for PVC)</option>
                <option value="600">600 DPI Ultra Sharp Photo Quality</option>
              </select>
            </div>

            <div className="form-group">
              <label>Copies</label>
              <input 
                type="number" 
                min="1" 
                max="500" 
                className="input-field"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
              />
            </div>

            {isElectron && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input 
                    type="checkbox" 
                    checked={silentPrint} 
                    onChange={(e) => setSilentPrint(e.target.checked)} 
                  />
                  <span>Direct Silent Printing (Skip interactive OS print window)</span>
                </label>
              </div>
            )}
          </div>

          {/* Print Status Feedback */}
          {printStatus && (
            <div className={`status-banner ${printStatus.type}`}>
              {printStatus.type === 'success' && <CheckCircle size={18} />}
              {printStatus.type === 'error' && <AlertCircle size={18} />}
              {printStatus.type === 'info' && <RefreshCw size={18} className="spin" />}
              <span>{printStatus.msg}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onExportPdf}>
            <Download size={16} />
            Export High-Res PDF
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleExecutePrint}>
              <Printer size={16} />
              Print PVC Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
