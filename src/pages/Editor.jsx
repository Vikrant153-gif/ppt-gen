import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ExportModal from '../components/ExportModal';
import SlideRenderer from '../components/SlideRenderer';
import PresentMode from '../components/PresentMode';
import { getThemeList } from '../utils/themes';
import { updateProject as apiUpdateProject, fetchProject, fetchUnsplashImage } from '../utils/api';

const THEME_LIST = getThemeList();

const LAYOUT_OPTIONS = [
  { value: 'standard', label: 'Standard', icon: '☰', desc: 'Title + bullets' },
  { value: 'headline', label: 'Headline', icon: '◉', desc: 'Bold statement' },
  { value: 'split', label: 'Split', icon: '◫', desc: 'Two columns' },
  { value: 'cards', label: 'Cards', icon: '▦', desc: '3-card grid' },
  { value: 'metrics', label: 'Metrics', icon: '▥', desc: 'KPI numbers' },
];

export default function Editor({ projects, setProjects, refreshProjects }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentProject = projects.find((p) => p.id === id);
  const [activeSlideId, setActiveSlideId] = useState(currentProject?.slides[0]?.id);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPresentOpen, setIsPresentOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  // Unsplash Image state
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  // Load project if not in local state
  useEffect(() => {
    if (!currentProject) {
      fetchProject(id).then(proj => {
        setProjects(prev => {
          const exists = prev.find(p => p.id === id);
          if (exists) return prev;
          return [...prev, proj];
        });
        setActiveSlideId(proj.slides?.[0]?.id);
      }).catch(() => {
        navigate('/projects');
      });
    }
  }, [id]);

  // Debounced save to backend
  const debouncedSave = useCallback((updatedProject) => {
    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        await apiUpdateProject(updatedProject.id, {
          title: updatedProject.title,
          slides: updatedProject.slides
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('unsaved');
      }
    }, 800);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Loading state
  if (!currentProject) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div className="export-spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }}></div>
        <p style={{ color: '#888' }}>Loading presentation...</p>
      </div>
    );
  }

  const activeSlideIndex = Math.max(
    0,
    currentProject.slides.findIndex((s) => s.id === activeSlideId)
  );

  // ─── Slide CRUD helpers ─────────────────────────────────────────────────────

  const addSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      layout: 'standard',
      title: 'New Slide',
      subtitle: '',
      content: ['Type bullet points or description here...'],
      theme: activeSlide?.theme || 'default',
    };
    const updated = projects.map((p) =>
      p.id === id ? { ...p, slides: [...p.slides, newSlide], updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    setActiveSlideId(newSlide.id);
    debouncedSave(updated.find(p => p.id === id));
  };

  const deleteSlide = (slideId) => {
    if (currentProject.slides.length === 1) return;
    const filtered = currentProject.slides.filter((s) => s.id !== slideId);
    const updated = projects.map((p) =>
      p.id === id ? { ...p, slides: filtered, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    setActiveSlideId(filtered[0]?.id);
    debouncedSave(updated.find(p => p.id === id));
  };

  const updateSlideField = (field, value) => {
    const updated = projects.map((p) => {
      if (p.id === id) {
        const updatedSlides = p.slides.map((s) => {
          if (s.id === activeSlideId) {
            if (field === 'content') {
              return { ...s, content: value.split('\n') };
            }
            return { ...s, [field]: value };
          }
          return s;
        });
        return { ...p, slides: updatedSlides, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    setProjects(updated);
    debouncedSave(updated.find(p => p.id === id));
  };

  const updateProjectTitle = (newTitle) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    debouncedSave(updated.find(p => p.id === id));
  };

  const handleSearchImage = async (customQuery) => {
    const query = customQuery || imageSearchQuery || activeSlide?.unsplashQuery || activeSlide?.title || 'presentation background';
    setImageLoading(true);
    try {
      const imgData = await fetchUnsplashImage(query);
      updateSlideField('image', imgData);
      setImageSearchQuery('');
    } catch (err) {
      console.error('Failed to fetch image:', err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = () => {
    updateSlideField('image', null);
  };

  const moveSlide = (slideId, direction) => {
    const slides = [...currentProject.slides];
    const idx = slides.findIndex(s => s.id === slideId);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= slides.length) return;
    [slides[idx], slides[newIdx]] = [slides[newIdx], slides[idx]];
    const updated = projects.map((p) =>
      p.id === id ? { ...p, slides, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    debouncedSave(updated.find(p => p.id === id));
  };

  const duplicateSlide = (slideId) => {
    const srcSlide = currentProject.slides.find(s => s.id === slideId);
    if (!srcSlide) return;
    const newSlide = { ...srcSlide, id: `slide-${Date.now()}` };
    const idx = currentProject.slides.findIndex(s => s.id === slideId);
    const slides = [...currentProject.slides];
    slides.splice(idx + 1, 0, newSlide);
    const updated = projects.map((p) =>
      p.id === id ? { ...p, slides, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    setActiveSlideId(newSlide.id);
    debouncedSave(updated.find(p => p.id === id));
  };

  // ─── Derived state ──────────────────────────────────────────────────────────

  const activeSlide = currentProject.slides.find((s) => s.id === activeSlideId) || currentProject.slides[0];
  const contentText = Array.isArray(activeSlide?.content) ? activeSlide.content.join('\n') : (activeSlide?.content || '');
  const currentLayout = activeSlide?.layout || 'standard';

  const saveStatusIndicator = {
    saved: { text: '✓ Saved', color: '#22c55e' },
    saving: { text: '⟳ Saving...', color: '#f59e0b' },
    unsaved: { text: '● Unsaved', color: '#ef4444' }
  };

  const contentHints = {
    standard: 'One bullet point per line (format: **Key Concept:** Description)',
    headline: 'Main statement (first line is displayed prominently)',
    split: 'Right-column bullets, one per line',
    cards: 'Pairs of lines — odd lines are card titles, even lines are descriptions',
    metrics: 'One metric per line, format: "42% — Growth rate"',
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="editor-layout">
      <header className="editor-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/projects" className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            ← Projects
          </Link>
          <input
            value={currentProject.title}
            onChange={(e) => updateProjectTitle(e.target.value)}
            style={{
              fontWeight: 700, fontSize: '1rem',
              border: '1px dashed transparent', outline: 'none',
              background: 'transparent', padding: '4px 8px', borderRadius: '6px'
            }}
            placeholder="Presentation Title"
          />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: saveStatusIndicator[saveStatus].color }}>
            {saveStatusIndicator[saveStatus].text}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge">{currentProject.slides.length} slides</span>
          <span className="badge" style={{ background: '#f0e6ff', color: '#764ba2' }}>
            {LAYOUT_OPTIONS.find(l => l.value === currentLayout)?.label || 'Standard'}
          </span>
          <button
            className="btn-outline"
            onClick={() => setIsPresentOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: '#000',
              color: '#fff',
              border: '1px solid #000',
            }}
            title="Present slideshow (F)"
          >
            <span>▶</span> Present
          </button>
          <button
            className="btn-outline"
            onClick={() => setIsExportOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <span>⤓</span> Export
          </button>
        </div>
      </header>

      <div className="editor-body">
        {/* LEFT: Slide list sidebar */}
        <aside className="editor-sidebar">
          <button className="btn-black" onClick={addSlide} style={{ width: '100%', marginBottom: 16, fontSize: '0.85rem' }}>
            + Add Slide
          </button>

          {currentProject.slides.map((slide, index) => (
            <div key={slide.id} className={`slide-thumb ${activeSlideId === slide.id ? 'active' : ''}`}>
              <button
                className="slide-thumb-btn"
                onClick={() => setActiveSlideId(slide.id)}
              >
                <span className="slide-thumb-num">{index + 1}</span>
                <div className="slide-thumb-preview" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  {slide.image?.url && (
                    <img
                      src={slide.image.url}
                      alt=""
                      style={{
                        width: 32,
                        height: 24,
                        borderRadius: 4,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid #ddd',
                      }}
                    />
                  )}
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <span className="slide-thumb-title">{slide.title || 'Untitled'}</span>
                    <span className="slide-thumb-layout">{slide.layout || 'standard'}</span>
                  </div>
                </div>
              </button>
              <div className="slide-thumb-actions">
                <button className="slide-action-btn" onClick={() => moveSlide(slide.id, -1)} disabled={index === 0} title="Move up">↑</button>
                <button className="slide-action-btn" onClick={() => moveSlide(slide.id, 1)} disabled={index === currentProject.slides.length - 1} title="Move down">↓</button>
                <button className="slide-action-btn" onClick={() => duplicateSlide(slide.id)} title="Duplicate">⧉</button>
                <button className="slide-action-btn delete" onClick={() => deleteSlide(slide.id)} disabled={currentProject.slides.length === 1} title="Delete">✕</button>
              </div>
            </div>
          ))}
        </aside>

        {/* CENTER: Visual slide preview */}
        <main className="editor-canvas-area">
          <div className="slide-preview-frame">
            <SlideRenderer slide={activeSlide} />
          </div>
          <div className="slide-counter">
            Slide {activeSlideIndex + 1} of {currentProject.slides.length}
          </div>
        </main>

        {/* RIGHT: Edit properties panel */}
        <aside className="editor-properties">
          <h3 className="props-heading">Slide Properties</h3>

          {/* Layout selector */}
          <div className="props-section">
            <label className="props-label">Layout</label>
            <div className="layout-picker">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`layout-pick-btn ${currentLayout === opt.value ? 'active' : ''}`}
                  onClick={() => updateSlideField('layout', opt.value)}
                  title={opt.desc}
                >
                  <span className="layout-pick-icon">{opt.icon}</span>
                  <span className="layout-pick-name">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme selector */}
          <div className="props-section">
            <label className="props-label">Theme</label>
            <div className="theme-picker">
              {THEME_LIST.map((theme) => (
                <button
                  key={theme.key}
                  className={`theme-pick-btn ${(activeSlide?.theme || 'default') === theme.key ? 'active' : ''}`}
                  onClick={() => updateSlideField('theme', theme.key)}
                  title={theme.name}
                >
                  <span
                    className="theme-pick-swatch"
                    style={{
                      background: theme.bg,
                      border: `2px solid ${theme.bg === '#ffffff' || theme.bg === '#fff7ed' || theme.bg === '#faf5ff' ? '#ddd' : theme.bg}`,
                    }}
                  >
                    <span className="theme-pick-accent" style={{ background: theme.accent }}></span>
                  </span>
                  <span className="theme-pick-name">{theme.name}</span>
                </button>
              ))}
            </div>
            <button
              className="theme-apply-all"
              onClick={() => {
                const currentTheme = activeSlide?.theme || 'default';
                const updated = projects.map((p) => {
                  if (p.id === id) {
                    return {
                      ...p,
                      slides: p.slides.map(s => ({ ...s, theme: currentTheme })),
                      updatedAt: new Date().toISOString()
                    };
                  }
                  return p;
                });
                setProjects(updated);
                debouncedSave(updated.find(p => p.id === id));
              }}
              style={{ marginTop: 6, fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Apply to all slides
            </button>
          </div>

          {/* Title input */}
          <div className="props-section">
            <label className="props-label">Title</label>
            <input
              className="props-input"
              value={activeSlide?.title || ''}
              onChange={(e) => updateSlideField('title', e.target.value)}
              placeholder="Slide Title"
            />
          </div>

          {/* Subtitle input */}
          <div className="props-section">
            <label className="props-label">Subtitle</label>
            <input
              className="props-input"
              value={activeSlide?.subtitle || ''}
              onChange={(e) => updateSlideField('subtitle', e.target.value)}
              placeholder="Optional subtitle"
            />
          </div>

          {/* Content textarea */}
          <div className="props-section">
            <label className="props-label">Content</label>
            <span className="props-hint">{contentHints[currentLayout]}</span>
            <textarea
              className="props-textarea"
              value={contentText}
              onChange={(e) => updateSlideField('content', e.target.value)}
              placeholder="Content..."
              rows={6}
            />
          </div>

          {/* ─── Unsplash Image Section ─── */}
          <div className="props-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="props-label" style={{ margin: 0 }}>Slide Imagery</label>
              {activeSlide?.image?.url && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  ✕ Remove
                </button>
              )}
            </div>

            {activeSlide?.image?.url ? (
              <div style={{ border: '1px solid #eaeaea', borderRadius: 8, padding: 8, background: '#fafafa' }}>
                <div style={{ position: 'relative', width: '100%', height: 90, borderRadius: 6, overflow: 'hidden', marginBottom: 6 }}>
                  <img
                    src={activeSlide.image.url}
                    alt={activeSlide.image.alt || 'Slide image'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {activeSlide.image.photographerName && (
                    <span style={{
                      position: 'absolute', bottom: 4, right: 6,
                      fontSize: '0.62rem', color: '#fff', background: 'rgba(0,0,0,0.6)',
                      padding: '2px 6px', borderRadius: 4
                    }}>
                      📷 {activeSlide.image.photographerName}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="props-input"
                    value={imageSearchQuery}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && imageSearchQuery.trim()) handleSearchImage();
                    }}
                    placeholder={activeSlide.unsplashQuery || "Change keyword..."}
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                  />
                  <button
                    className="btn-outline"
                    onClick={() => handleSearchImage()}
                    disabled={imageLoading}
                    style={{ padding: '4px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    {imageLoading ? '...' : 'Replace'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="props-input"
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && imageSearchQuery.trim()) handleSearchImage();
                  }}
                  placeholder="e.g. quantum physics, nebula..."
                  style={{ fontSize: '0.8rem' }}
                />
                <button
                  className="btn-outline"
                  onClick={() => handleSearchImage()}
                  disabled={imageLoading}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  {imageLoading ? '...' : '🔍 Find'}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Export Modal */}
      <ExportModal
        project={{
          ...currentProject,
          slides: currentProject.slides.map(s => ({
            ...s,
            content: Array.isArray(s.content) ? s.content.join('\n') : s.content
          }))
        }}
        activeSlideIndex={activeSlideIndex}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Phase 4: Fullscreen Present Mode */}
      {isPresentOpen && (
        <PresentMode
          project={currentProject}
          initialSlideIndex={activeSlideIndex}
          onClose={() => setIsPresentOpen(false)}
        />
      )}
    </div>
  );
}
