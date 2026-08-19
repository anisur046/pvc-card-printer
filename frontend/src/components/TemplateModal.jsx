import React from 'react';
import { FolderOpen, Sparkles, Check, X, Shield, Award, UserCheck, CreditCard } from 'lucide-react';

export const PRESET_TEMPLATES = [
  {
    id: 'employee-dark',
    title: 'Corporate Employee ID',
    category: 'Corporate',
    badgeText: 'SECURITY CLEARED',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    accentColor: '#38bdf8',
    icon: Shield,
    frontElements: [
      { id: 'bg-header', type: 'shape', shapeType: 'rectangle', x: 0, y: 0, width: 337, height: 60, fill: '#1e293b' },
      { id: 'brand-title', type: 'text', content: 'NEXUS CYBER CORP', x: 20, y: 22, fontSize: 14, fontWeight: '700', color: '#38bdf8' },
      { id: 'photo', type: 'image', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', x: 20, y: 75, width: 90, height: 110, borderRadius: 8 },
      { id: 'name', type: 'text', content: 'Alexander Wright', x: 125, y: 80, fontSize: 16, fontWeight: '700', color: '#ffffff' },
      { id: 'role', type: 'text', content: 'Lead Systems Architect', x: 125, y: 104, fontSize: 11, fontWeight: '500', color: '#94a3b8' },
      { id: 'dept-label', type: 'text', content: 'DEPARTMENT', x: 125, y: 130, fontSize: 9, fontWeight: '700', color: '#64748b' },
      { id: 'dept-val', type: 'text', content: 'Cloud Engineering & Security', x: 125, y: 144, fontSize: 10, fontWeight: '600', color: '#e2e8f0' },
      { id: 'id-label', type: 'text', content: 'ID NUMBER', x: 125, y: 165, fontSize: 9, fontWeight: '700', color: '#64748b' },
      { id: 'id-val', type: 'text', content: 'NX-94082-SEC', x: 125, y: 179, fontSize: 11, fontWeight: '700', color: '#38bdf8' },
      { id: 'barcode', type: 'barcode', value: 'NX94082SEC', x: 20, y: 195, width: 140, height: 35 },
      { id: 'qr', type: 'qr', value: 'https://nexuscorp.internal/verify/NX-94082', x: 270, y: 165, width: 50, height: 50 }
    ],
    backElements: [
      { id: 'terms-title', type: 'text', content: 'PROPERTY OF NEXUS CYBER CORP', x: 20, y: 20, fontSize: 12, fontWeight: '700', color: '#38bdf8' },
      { id: 'terms-body', type: 'text', content: 'If found, please return to any Nexus Cyber Corp facility or call security hotline at +1 (800) 555-0199.', x: 20, y: 45, fontSize: 10, fontWeight: '400', color: '#94a3b8', width: 290 },
      { id: 'sig-strip', type: 'shape', shapeType: 'rectangle', x: 20, y: 110, width: 200, height: 35, fill: '#ffffff' },
      { id: 'sig-label', type: 'text', content: 'AUTHORIZED SIGNATURE', x: 20, y: 150, fontSize: 8, fontWeight: '600', color: '#64748b' }
    ]
  },
  {
    id: 'student-vibrant',
    title: 'University Campus Student Pass',
    category: 'Education',
    badgeText: 'STUDENT 2026',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
    accentColor: '#38bdf8',
    icon: Award,
    frontElements: [
      { id: 'uni-title', type: 'text', content: 'STANFORD POLYTECHNIC', x: 20, y: 25, fontSize: 15, fontWeight: '800', color: '#ffffff' },
      { id: 'photo', type: 'image', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', x: 20, y: 70, width: 95, height: 115, borderRadius: 12 },
      { id: 'name', type: 'text', content: 'Sophia Chen', x: 130, y: 75, fontSize: 17, fontWeight: '700', color: '#ffffff' },
      { id: 'major', type: 'text', content: 'B.S. Artificial Intelligence', x: 130, y: 100, fontSize: 11, fontWeight: '500', color: '#e0f2fe' },
      { id: 'valid-label', type: 'text', content: 'VALID UNTIL', x: 130, y: 130, fontSize: 9, fontWeight: '700', color: '#bae6fd' },
      { id: 'valid-val', type: 'text', content: 'JUN 2028', x: 130, y: 144, fontSize: 11, fontWeight: '700', color: '#ffffff' },
      { id: 'qr', type: 'qr', value: 'STU-2026-88912', x: 260, y: 145, width: 60, height: 60 }
    ],
    backElements: []
  },
  {
    id: 'vip-executive',
    title: 'Executive VIP Access Pass',
    category: 'VIP & Events',
    badgeText: 'VIP ALL-ACCESS',
    gradient: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
    accentColor: '#f59e0b',
    icon: Sparkles,
    frontElements: [
      { id: 'vip-gold-line', type: 'shape', shapeType: 'rectangle', x: 0, y: 0, width: 337, height: 8, fill: '#f59e0b' },
      { id: 'vip-badge', type: 'text', content: '★ VIP EXECUTIVE PASS ★', x: 20, y: 30, fontSize: 14, fontWeight: '800', color: '#f59e0b' },
      { id: 'name', type: 'text', content: 'Marcus Vance', x: 20, y: 70, fontSize: 20, fontWeight: '800', color: '#ffffff' },
      { id: 'title', type: 'text', content: 'Global Operations VP', x: 20, y: 98, fontSize: 12, fontWeight: '500', color: '#d1d5db' },
      { id: 'qr', type: 'qr', value: 'VIP-EXECUTIVE-MARCUS', x: 240, y: 65, width: 75, height: 75 },
      { id: 'barcode', type: 'barcode', value: 'VIP998231', x: 20, y: 170, width: 160, height: 40 }
    ],
    backElements: []
  }
];

export default function TemplateModal({ isOpen, onClose, onSelectTemplate }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content template-modal">
        <div className="modal-header">
          <div className="modal-title">
            <FolderOpen size={22} className="modal-icon text-accent" />
            <div>
              <h2>PVC Card Preset Template Library</h2>
              <p className="subtitle">Choose a pre-designed CR80 standard badge to get started</p>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="template-grid">
            {PRESET_TEMPLATES.map((tmpl) => {
              const IconComp = tmpl.icon;
              return (
                <div key={tmpl.id} className="template-card-item">
                  <div className="template-preview-box" style={{ background: tmpl.gradient }}>
                    <div className="template-badge" style={{ color: tmpl.accentColor, borderColor: tmpl.accentColor }}>
                      <IconComp size={12} />
                      <span>{tmpl.badgeText}</span>
                    </div>
                    <div className="preview-card-title">{tmpl.title}</div>
                  </div>
                  <div className="template-info">
                    <div className="tmpl-category">{tmpl.category}</div>
                    <h3>{tmpl.title}</h3>
                    <button 
                      className="btn btn-primary btn-block" 
                      style={{ marginTop: '10px' }}
                      onClick={() => {
                        onSelectTemplate(tmpl);
                        onClose();
                      }}
                    >
                      <Check size={14} /> Use Template
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
