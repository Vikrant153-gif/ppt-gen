import { useState } from 'react';
import {
  exportToPdf,
  exportSlideImage,
  exportAllSlidesZip,
  exportToDocx,
  exportToPptx
} from '../utils/exportUtils';

const FORMATS = [
  {
    id: 'pdf',
    title: 'PDF Document',
    ext: '.pdf',
    icon: '📄',
    desc: 'Multi-page 16:9 presentation deck captured in high-DPI graphics'
  },
  {
    id: 'jpg',
    title: 'JPEG Image',
    ext: '.jpg',
    icon: '🖼️',
    desc: 'High-resolution slide images (single slide or ZIP archive)'
  },
  {
    id: 'png',
    title: 'PNG Graphic',
    ext: '.png',
    icon: '🎨',
    desc: 'Crisp lossless slide graphics (single slide or ZIP archive)'
  },
  {
    id: 'docx',
    title: 'Word Document',
    ext: '.docx',
    icon: '📝',
    desc: 'Formatted Microsoft Word doc with headers & page breaks'
  },
  {
    id: 'pptx',
    title: 'PowerPoint Deck',
    ext: '.pptx',
    icon: '📊',
    desc: 'Native Microsoft PowerPoint presentation (.pptx)'
  }
];

export default function ExportModal({ project, activeSlideIndex = 0, isOpen, onClose }) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [imageScope, setImageScope] = useState('current'); // 'current' | 'all'
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setStatusMessage('Preparing export...');
    setErrorMsg('');

    try {
      switch (selectedFormat) {
        case 'pdf':
          await exportToPdf(project, (progress) => {
            setStatusMessage(progress.text);
          });
          break;

        case 'jpg':
          if (imageScope === 'current') {
            setStatusMessage('Rendering current slide JPG...');
            await exportSlideImage(project, activeSlideIndex, 'jpg');
          } else {
            await exportAllSlidesZip(project, 'jpg', (progress) => {
              setStatusMessage(progress.text);
            });
          }
          break;

        case 'png':
          if (imageScope === 'current') {
            setStatusMessage('Rendering current slide PNG...');
            await exportSlideImage(project, activeSlideIndex, 'png');
          } else {
            await exportAllSlidesZip(project, 'png', (progress) => {
              setStatusMessage(progress.text);
            });
          }
          break;

        case 'docx':
          setStatusMessage('Building Word document...');
          await exportToDocx(project);
          break;

        case 'pptx':
          setStatusMessage('Generating PowerPoint deck...');
          await exportToPptx(project);
          break;

        default:
          throw new Error('Unsupported format');
      }

      setStatusMessage('Export complete!');
      setTimeout(() => {
        setIsExporting(false);
        setStatusMessage('');
        onClose();
      }, 700);
    } catch (err) {
      console.error('Export failed:', err);
      setErrorMsg(err.message || 'Export failed. Please try again.');
      setIsExporting(false);
    }
  };

  const isImageFormat = selectedFormat === 'jpg' || selectedFormat === 'png';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Export Deck</h2>
            <p style={{ fontSize: '0.88rem', color: '#666', marginTop: 4 }}>
              Export <span style={{ fontWeight: 600, color: '#111' }}>{project.title}</span> ({project.slides?.length || 0} slides)
            </p>
          </div>
          <button className="delete-btn" onClick={onClose} disabled={isExporting} aria-label="Close modal">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="export-error-banner">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="export-format-label">Select Output Format</div>
        <div className="export-grid">
          {FORMATS.map((fmt) => (
            <div
              key={fmt.id}
              className={`export-card ${selectedFormat === fmt.id ? 'active' : ''}`}
              onClick={() => !isExporting && setSelectedFormat(fmt.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '1.3rem' }}>{fmt.icon}</span>
                <span className="export-ext-pill">{fmt.ext}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>{fmt.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 4, lineHeight: 1.4 }}>
                {fmt.desc}
              </div>
            </div>
          ))}
        </div>

        {isImageFormat && (
          <div className="export-suboptions">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>Image Scope:</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: 8 }}>
              <button
                type="button"
                className={`export-scope-btn ${imageScope === 'current' ? 'active' : ''}`}
                onClick={() => setImageScope('current')}
                disabled={isExporting}
              >
                Current Slide (Slide {activeSlideIndex + 1})
              </button>
              <button
                type="button"
                className={`export-scope-btn ${imageScope === 'all' ? 'active' : ''}`}
                onClick={() => setImageScope('all')}
                disabled={isExporting}
              >
                All Slides (ZIP Archive)
              </button>
            </div>
          </div>
        )}

        {isExporting && (
          <div className="export-status-box">
            <span className="export-spinner" />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111' }}>
              {statusMessage || 'Processing export...'}
            </span>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </button>
          <button
            className="btn-black"
            onClick={handleExport}
            disabled={isExporting}
            style={{ minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {isExporting ? 'Exporting...' : `Download ${FORMATS.find((f) => f.id === selectedFormat)?.ext.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
