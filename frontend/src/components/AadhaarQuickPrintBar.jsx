import React, { useState } from 'react';
import { 
  FileText, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  Check, 
  Settings, 
  Edit3, 
  RefreshCw, 
  Printer, 
  Sparkles,
  FolderOpen,
  Upload
} from 'lucide-react';

export default function AadhaarQuickPrintBar({
  onSelectFile,
  onShowCard,
  onAddCard,
  onOpenSettings,
  onEditPhoto,
  onReset,
  onPrintCard,
  currentFileName,
  pdfPassword,
  setPdfPassword,
  aiModel,
  setAiModel,
  language,
  setLanguage
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="aadhaar-quick-bar-container">
      {/* Primary Top Control Bar */}
      <div className="quick-bar-top">
        {/* File Select Pill */}
        <label className="pill-control-btn file-pill" title="Choose e-Aadhaar PDF or Image">
          <Check size={14} className="text-success" />
          <span className="file-name-text">{currentFileName || 'Select e-Aadhaar PDF'}</span>
          <input 
            type="file" 
            accept=".pdf,image/*" 
            onChange={onSelectFile} 
            style={{ display: 'none' }} 
          />
        </label>

        {/* PDF Password Field */}
        <div className="pill-input-wrapper">
          <Lock size={14} className="icon-muted" />
          <input 
            type={showPassword ? 'text' : 'password'}
            className="pill-input"
            placeholder="Password (e.g. PINK1994)"
            value={pdfPassword}
            onChange={(e) => setPdfPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="btn-icon-subtle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* AI Model Selector */}
        <select 
          className="pill-select"
          value={aiModel}
          onChange={(e) => setAiModel(e.target.value)}
        >
          <option value="model1">Ai Model 1</option>
          <option value="model2">Ai Model 2 (Enhanced)</option>
          <option value="model3">Ai Model 3 (High Precision)</option>
        </select>

        {/* Language Selector */}
        <select 
          className="pill-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="Bengali">Bengali (বাংলা)</option>
          <option value="Hindi">Hindi (हिंदी)</option>
          <option value="English">English</option>
          <option value="Marathi">Marathi (मराठी)</option>
          <option value="Tamil">Tamil (தமிழ்)</option>
          <option value="Telugu">Telugu (తెలుగు)</option>
          <option value="Gujarati">Gujarati (ગુજરાતી)</option>
        </select>

        {/* Quick Toggles */}
        <div className="pill-badge-toggle">
          <span>Yes</span>
        </div>

        <select className="pill-select-sm">
          <option value="HB">HB</option>
          <option value="HQ">HQ</option>
        </select>

        {/* SHOW CARD Glow Button */}
        <button className="pill-btn-glow" onClick={onShowCard}>
          <Eye size={16} />
          <span>SHOW CARD</span>
        </button>
      </div>

      {/* Secondary Action Bar */}
      <div className="quick-bar-actions">
        <button className="action-pill-btn" onClick={onAddCard}>
          <Plus size={14} />
          <span>Add Card</span>
        </button>

        <button className="action-pill-btn active">
          <Check size={14} />
        </button>

        <button className="action-pill-btn" onClick={onOpenSettings}>
          <Settings size={14} />
          <span>APP SETTINGS</span>
        </button>

        <button className="action-pill-btn" onClick={onEditPhoto}>
          <Edit3 size={14} />
          <span>Edit Photo</span>
        </button>

        <button className="action-pill-btn" onClick={onReset}>
          <RefreshCw size={14} />
          <span>Reset</span>
        </button>

        <button className="action-pill-btn print-pill" onClick={onPrintCard}>
          <Printer size={14} />
          <span>Print Card</span>
        </button>
      </div>
    </div>
  );
}
