import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download, Check, AlertCircle, Play, X, Layers } from 'lucide-react';
import Papa from 'papaparse';

export default function BatchModal({ isOpen, onClose, backendOnline, onApplyBatchRow }) {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setHeaders(Object.keys(results.data[0]));
          setCsvData(results.data);
          setSelectedRowIndex(0);
          setStatusMsg({ type: 'success', text: `Loaded ${results.data.length} records successfully!` });
        }
      },
      error: (err) => {
        setStatusMsg({ type: 'error', text: 'CSV parse error: ' + err.message });
      }
    });
  };

  const handleLoadSampleCSV = async () => {
    try {
      let csvText = `id,name,role,department,photo,barcode\n` +
        `EMP-1001,Alexander Wright,Lead Systems Engineer,Engineering,https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150,1001928374\n` +
        `EMP-1002,Sophia Chen,Senior UX Designer,Product Design,https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150,1001928375\n` +
        `EMP-1003,Marcus Vance,Operations Manager,Logistics,https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150,1001928376\n` +
        `EMP-1004,Elena Rostova,Security Architect,CyberSecurity,https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150,1001928377`;

      if (backendOnline) {
        try {
          const res = await fetch('http://localhost:8080/api/batch/sample.csv');
          if (res.ok) csvText = await res.text();
        } catch (e) {}
      }

      setFileName('sample_pvc_records.csv');
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setHeaders(Object.keys(results.data[0]));
          setCsvData(results.data);
          setSelectedRowIndex(0);
          setStatusMsg({ type: 'success', text: `Loaded ${results.data.length} sample employee records!` });
        }
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error loading sample CSV: ' + err.message });
    }
  };

  const handleApplyRow = (index) => {
    setSelectedRowIndex(index);
    if (csvData[index]) {
      onApplyBatchRow(csvData[index]);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content batch-modal">
        <div className="modal-header">
          <div className="modal-title">
            <FileSpreadsheet size={22} className="modal-icon text-accent" />
            <div>
              <h2>Batch CSV Card Generator</h2>
              <p className="subtitle">Import CSV data to bulk-populate PVC ID Cards</p>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* File Upload Bar */}
          <div className="batch-upload-bar">
            <label className="btn btn-primary btn-upload">
              <Upload size={16} />
              Choose CSV File
              <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <button className="btn btn-secondary" onClick={handleLoadSampleCSV}>
              Load Sample CSV Data
            </button>

            {fileName && <span className="file-tag">{fileName} ({csvData.length} rows)</span>}
          </div>

          {statusMsg && (
            <div className={`status-banner ${statusMsg.type}`} style={{ margin: '12px 0' }}>
              {statusMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* CSV Preview Table */}
          {csvData.length > 0 ? (
            <div className="csv-table-wrapper">
              <table className="csv-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>#</th>
                    {headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, rIdx) => (
                    <tr key={rIdx} className={selectedRowIndex === rIdx ? 'active-row' : ''}>
                      <td>
                        <button 
                          className={`btn-select-row ${selectedRowIndex === rIdx ? 'active' : ''}`}
                          onClick={() => handleApplyRow(rIdx)}
                        >
                          {selectedRowIndex === rIdx ? <Check size={14} /> : <Play size={12} />}
                        </button>
                      </td>
                      <td>{rIdx + 1}</td>
                      {headers.map((h, cIdx) => (
                        <td key={cIdx}>{row[h] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-batch-state">
              <Layers size={40} opacity={0.3} />
              <p>No CSV data loaded yet. Upload a CSV file or load sample data above.</p>
              <p className="subtext">CSV columns like <code>name</code>, <code>id</code>, <code>department</code>, <code>role</code>, and <code>barcode</code> will map automatically to canvas text & barcode layers.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {csvData.length > 0 && (
            <button 
              className="btn btn-primary" 
              onClick={() => {
                handleApplyRow(selectedRowIndex);
                onClose();
              }}
            >
              Apply Selected Record to Card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
