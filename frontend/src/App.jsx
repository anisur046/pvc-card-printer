import React, { useState, useEffect, useRef } from 'react';
import Titlebar from './components/Titlebar';
import Navbar from './components/Navbar';
import Toolbar from './components/Toolbar';
import Inspector from './components/Inspector';
import PrintModal from './components/PrintModal';
import BatchModal from './components/BatchModal';
import TemplateModal, { PRESET_TEMPLATES } from './components/TemplateModal';
import BrowseModal from './components/BrowseModal';
import AadhaarQuickPrintBar from './components/AadhaarQuickPrintBar';
import OutputCardPreview from './components/OutputCardPreview';
import LoginScreen from './components/LoginScreen';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { renderPdfToImageDataUrl } from './utils/pdfRenderer';
import { generateExactDemoFrontCard, generateExactDemoBackCard, cropAadhaarSides, renderPresetTemplateToDataUrl } from './utils/aadhaarCardGenerator';
import { Sparkles, Layers, RotateCw, Save, CheckCircle, Upload, FolderOpen } from 'lucide-react';
import './App.css';

// Default CR80 dimensions in pixels (Landscape: 337.5px x 212.5px)
const CARD_WIDTH = 337.5;
const CARD_HEIGHT = 212.5;

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pvc_studio_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [appMode, setAppMode] = useState('quick-aadhaar'); // 'quick-aadhaar' | 'studio'
  const [orientation, setOrientation] = useState('landscape');
  const [activeSide, setActiveSide] = useState('front');
  const [is3dView, setIs3dView] = useState(false);
  const [overlayEffect, setOverlayEffect] = useState('none');

  // Aadhaar Quick Bar States
  const [currentFileName, setCurrentFileName] = useState('');
  const [pdfPassword, setPdfPassword] = useState('');
  const [aiModel, setAiModel] = useState('model1');
  const [language, setLanguage] = useState('Bengali');
  const [rawFileSrc, setRawFileSrc] = useState(null);
  const [rawFileObj, setRawFileObj] = useState(null);

  // Side Card Images for Output Preview
  const [frontCardImage, setFrontCardImage] = useState(null);
  const [backCardImage, setBackCardImage] = useState(null);

  // Card Sides Elements State for Studio
  const defaultTmpl = PRESET_TEMPLATES[0];
  const [frontElements, setFrontElements] = useState(defaultTmpl.frontElements);
  const [backElements, setBackElements] = useState(defaultTmpl.backElements);

  // Side Customization
  const [frontConfig, setFrontConfig] = useState({ bgColor: '#0f172a', bgGradient: defaultTmpl.gradient });
  const [backConfig, setBackConfig] = useState({ bgColor: '#0f172a', bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' });

  const [selectedElementId, setSelectedElementId] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [defaultPrinter, setDefaultPrinter] = useState('');

  // Modals
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [printSide, setPrintSide] = useState('both'); // 'front' | 'back' | 'both'
  const [notification, setNotification] = useState(null);

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const cardFrontRef = useRef(null);
  const cardBackRef = useRef(null);

  const canvasWidth = orientation === 'landscape' ? CARD_WIDTH : CARD_HEIGHT;
  const canvasHeight = orientation === 'landscape' ? CARD_HEIGHT : CARD_WIDTH;

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenPrintModal = () => {
    if (!frontCardImage && !backCardImage) {
      showNotify('Please browse or select a card file to print.');
      setIsBrowseModalOpen(true);
      return;
    }
    setIsPrintModalOpen(true);
  };

  // Check Backend Health & Electron status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/health');
        if (res.ok) setBackendOnline(true);
        else setBackendOnline(false);
      } catch (e) {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);

    if (window.electronAPI && window.electronAPI.getPrinters) {
      window.electronAPI.getPrinters().then(printers => {
        const def = printers.find(p => p.isDefault);
        if (def) setDefaultPrinter(def.name);
      }).catch(() => {});
    }

    return () => clearInterval(interval);
  }, []);

  const generateDemoAadhaarCards = () => {
    setFrontCardImage(generateExactDemoFrontCard());
    setBackCardImage(generateExactDemoBackCard());
  };

  // Handle Quick Bar File Selection
  const handleSelectQuickFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCurrentFileName(file.name);
    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuf = event.target.result;
        setRawFileObj(arrayBuf);

        showNotify('Processing e-Aadhaar PDF...');
        const res = await renderPdfToImageDataUrl(arrayBuf, pdfPassword);
        if (res.success) {
          setRawFileSrc(res.dataUrl);
          const cropped = await cropAadhaarSides(res.dataUrl);
          setFrontCardImage(cropped.frontImage || res.dataUrl);
          setBackCardImage(cropped.backImage || res.dataUrl);
          showNotify(`PDF Processed: ${file.name}`);
        } else if (res.isPasswordRequired) {
          showNotify('PDF Password required. Enter password above.');
        } else {
          showNotify(`PDF Error: ${res.error}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target.result;
        setRawFileSrc(result);
        const cropped = await cropAadhaarSides(result);
        setFrontCardImage(cropped.frontImage || result);
        setBackCardImage(cropped.backImage || result);
        showNotify(`Loaded image: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle SHOW CARD action
  const handleShowCard = async () => {
    if (rawFileObj) {
      showNotify('Rendering e-Aadhaar PDF...');
      const res = await renderPdfToImageDataUrl(rawFileObj, pdfPassword);
      if (res.success) {
        showNotify('Cropping Front & Back Card Sides...');
        const cropped = await cropAadhaarSides(res.dataUrl);
        setFrontCardImage(cropped.frontImage || res.dataUrl);
        setBackCardImage(cropped.backImage || res.dataUrl);
        showNotify('e-Aadhaar Card Rendered Successfully!');
      } else {
        showNotify(res.error || 'Failed to unlock PDF. Check password.');
      }
    } else if (rawFileSrc) {
      showNotify('Cropping Front & Back Card Sides...');
      const cropped = await cropAadhaarSides(rawFileSrc);
      setFrontCardImage(cropped.frontImage || rawFileSrc);
      setBackCardImage(cropped.backImage || rawFileSrc);
      showNotify('e-Aadhaar Card Rendered!');
    } else {
      showNotify('Please select or browse an e-Aadhaar PDF or card file first.');
      setIsBrowseModalOpen(true);
    }
  };

  // Submit Cards from Browse Modal
  const handleSubmitBrowsedCards = ({ frontImage, backImage }) => {
    if (frontImage) setFrontCardImage(frontImage);
    if (backImage) setBackCardImage(backImage);
    showNotify('Front & Back Aadhaar card graphics loaded!');
  };

  // Handle Template Selection from Preset Library
  const handleSelectTemplate = async (tmpl) => {
    showNotify(`Applying template: ${tmpl.title}...`);
    const frontUrl = await renderPresetTemplateToDataUrl(tmpl, 'front');
    const backUrl = await renderPresetTemplateToDataUrl(tmpl, 'back');

    setFrontCardImage(frontUrl);
    setBackCardImage(backUrl);
    setFrontElements(tmpl.frontElements || []);
    setBackElements(tmpl.backElements || []);
    setFrontConfig({ bgColor: tmpl.accentColor, bgGradient: tmpl.gradient });
    setBackConfig({ bgColor: '#0f172a', bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' });
    showNotify(`Applied template: ${tmpl.title}`);
  };

  // Add Element
  const handleAddElement = (type, defaultVal) => {
    const newEl = {
      id: `${type}-${Date.now()}`,
      type,
      content: defaultVal,
      x: 30,
      y: 30,
      width: type === 'photo' ? 90 : type === 'qr' ? 60 : type === 'barcode' ? 140 : 180,
      height: type === 'photo' ? 110 : type === 'qr' ? 60 : type === 'barcode' ? 35 : 30,
      fontSize: type === 'text' ? 14 : 12,
      fontWeight: '600',
      color: '#ffffff',
      bgColor: type === 'badge' ? '#38bdf8' : 'transparent',
      borderRadius: type === 'photo' ? 8 : 4
    };

    const activeElements = activeSide === 'front' ? frontElements : backElements;
    const setActiveElements = activeSide === 'front' ? setFrontElements : setBackElements;
    setActiveElements([...activeElements, newEl]);
    setSelectedElementId(newEl.id);
  };

  // Update Element
  const handleUpdateElement = (updatedProps) => {
    if (!selectedElementId) return;
    const activeElements = activeSide === 'front' ? frontElements : backElements;
    const setActiveElements = activeSide === 'front' ? setFrontElements : setBackElements;
    setActiveElements(activeElements.map(el => el.id === selectedElementId ? { ...el, ...updatedProps } : el));
  };

  // Delete Element
  const handleDeleteElement = (id) => {
    const activeElements = activeSide === 'front' ? frontElements : backElements;
    const setActiveElements = activeSide === 'front' ? setFrontElements : setBackElements;
    setActiveElements(activeElements.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // Layer ordering
  const handleLayerChange = (id, direction) => {
    const activeElements = activeSide === 'front' ? frontElements : backElements;
    const setActiveElements = activeSide === 'front' ? setFrontElements : setBackElements;
    const idx = activeElements.findIndex(el => el.id === id);
    if (idx === -1) return;
    const newArr = [...activeElements];
    if (direction === 'up' && idx < newArr.length - 1) {
      const temp = newArr[idx];
      newArr[idx] = newArr[idx + 1];
      newArr[idx + 1] = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = newArr[idx];
      newArr[idx] = newArr[idx - 1];
      newArr[idx - 1] = temp;
    }
    setActiveElements(newArr);
  };

  // PDF Export
  const handleExportPdf = async () => {
    try {
      showNotify('Generating high-resolution CR80 PDF...');
      const targetRef = cardFrontRef.current;
      if (!targetRef) return;

      const dataUrl = await htmlToImage.toPng(targetRef, { pixelRatio: 4 });
      const isLandscape = orientation === 'landscape';
      const pdfWidth = isLandscape ? 85.6 : 53.98;
      const pdfHeight = isLandscape ? 53.98 : 85.6;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`pvc_card_${Date.now()}.pdf`);
      showNotify('PDF Exported Successfully!');
    } catch (e) {
      console.error('Export PDF error:', e);
      showNotify('Failed to export PDF: ' + e.message);
    }
  };

  // Save Project
  const handleSaveTemplate = async () => {
    const cardData = {
      orientation,
      frontCardImage,
      backCardImage
    };

    if (window.electronAPI && window.electronAPI.showSaveDialog) {
      try {
        const res = await window.electronAPI.showSaveDialog({
          title: 'Save PVC Card Project',
          defaultPath: 'my_card_design.pvccard',
          filters: [{ name: 'PVC Card Project', extensions: ['pvccard', 'json'] }]
        });

        if (!res.canceled && res.filePath) {
          await window.electronAPI.saveFileContent(res.filePath, JSON.stringify(cardData, null, 2));
          showNotify('Project saved to disk!');
        }
      } catch (e) {
        showNotify('Failed to save file: ' + e.message);
      }
    } else {
      localStorage.setItem('pvc_card_design', JSON.stringify(cardData));
      showNotify('Saved project locally!');
    }
  };

  const handleLoginSuccess = (userPayload) => {
    setCurrentUser(userPayload);
    showNotify(`Welcome back, ${userPayload.username}!`);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('pvc_studio_session');
    } catch (e) {}
    setCurrentUser(null);
    showNotify('Signed out of PVC Card Studio');
  };

  if (!currentUser) {
    return (
      <div className="app-container">
        <Titlebar backendOnline={backendOnline} defaultPrinter={defaultPrinter} currentUser={null} onLogout={null} />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Native Desktop Titlebar */}
      <Titlebar backendOnline={backendOnline} defaultPrinter={defaultPrinter} currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Top Navigation */}
      <Navbar 
        orientation={orientation}
        setOrientation={setOrientation}
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        is3dView={is3dView}
        setIs3dView={setIs3dView}
        backendOnline={backendOnline}
        onOpenBrowse={() => setIsBrowseModalOpen(true)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenBatch={() => setIsBatchModalOpen(true)}
        onOpenPrint={handleOpenPrintModal}
        onExportPdf={handleExportPdf}
        onSaveTemplate={handleSaveTemplate}
      />

      {/* Aadhaar / ID Quick Print Control Bar (Exact Reference Screenshot) */}
      <AadhaarQuickPrintBar 
        onSelectFile={handleSelectQuickFile}
        onShowCard={handleShowCard}
        onAddCard={() => setIsBrowseModalOpen(true)}
        onOpenSettings={() => setIsTemplateModalOpen(true)}
        onEditPhoto={() => showNotify('Click photo to edit or adjust')}
        onReset={() => {
          setFrontCardImage(null);
          setBackCardImage(null);
          setCurrentFileName('');
          showNotify('Reset card preview');
        }}
        onPrintCard={handleOpenPrintModal}
        currentFileName={currentFileName}
        pdfPassword={pdfPassword}
        setPdfPassword={setPdfPassword}
        aiModel={aiModel}
        setAiModel={setAiModel}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Workbench Stage */}
      <main className="workspace-main" style={{ flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        {notification && (
          <div className="notify-toast">
            <CheckCircle size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* OUTPUT CARD PREVIEW SECTION (Matching Reference Screenshot) */}
        <OutputCardPreview 
          frontCardImage={frontCardImage}
          backCardImage={backCardImage}
          onPrintCard={handleOpenPrintModal}
          onExportPdf={handleExportPdf}
          cardFrontRef={cardFrontRef}
          cardBackRef={cardBackRef}
        />
      </main>

      {/* Browse Card Files Modal */}
      <BrowseModal 
        isOpen={isBrowseModalOpen}
        onClose={() => setIsBrowseModalOpen(false)}
        onSubmitCards={handleSubmitBrowsedCards}
        onOpenPrint={handleOpenPrintModal}
      />

      {/* Desktop Print Manager Modal */}
      <PrintModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        orientation={orientation}
        activeSide={activeSide}
        onExportPdf={handleExportPdf}
        cardFrontRef={cardFrontRef}
        cardBackRef={cardBackRef}
        printSide={printSide}
        setPrintSide={setPrintSide}
      />

      {/* Batch CSV Modal */}
      <BatchModal 
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        backendOnline={backendOnline}
        onApplyBatchRow={(row) => showNotify(`Applied ${row.name || 'row'}`)}
      />

      {/* Template Library Modal */}
      <TemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* High-Resolution PVC Print Mount for Electron & Printer Spooling */}
      <div id="pvc-print-mount" className={orientation}>
        {(printSide === 'front' || printSide === 'both') && (frontCardImage || backCardImage) && (
          <div className="print-page">
            <img 
              src={frontCardImage || backCardImage} 
              alt="Front PVC Card" 
              className="print-page-img" 
            />
          </div>
        )}
        {(printSide === 'back' || printSide === 'both') && (backCardImage || frontCardImage) && (
          <div className="print-page">
            <img 
              src={backCardImage || frontCardImage} 
              alt="Back PVC Card" 
              className="print-page-img" 
            />
          </div>
        )}
      </div>
    </div>
  );
}
