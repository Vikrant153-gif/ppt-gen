import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ExportModal from '../components/ExportModal';
import PresentMode from '../components/PresentMode';
import { createProject, deleteProject as apiDeleteProject, generatePresentation } from '../utils/api';

export default function Projects({ projects, setProjects, refreshProjects, loading, user, onLogout }) {
  const navigate = useNavigate();
  const [exportingProject, setExportingProject] = useState(null);
  const [presentingProject, setPresentingProject] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiSlideCount, setAiSlideCount] = useState(8);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const createNewProject = async () => {
    try {
      const newProject = await createProject({
        title: 'Untitled Presentation',
        slides: [
          { id: `slide-${Date.now()}`, title: 'Slide Title', content: ['Type your bullet points or summary...'], layout: 'standard', subtitle: '', theme: 'default' }
        ]
      });
      await refreshProjects();
      navigate(`/editor/${newProject.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();
    try {
      await apiDeleteProject(id);
      await refreshProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const openExportModal = (e, proj) => {
    e.stopPropagation();
    setExportingProject(proj);
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    setAiError('');
    try {
      const result = await generatePresentation(aiTopic.trim(), aiSlideCount);
      await refreshProjects();
      setShowAiModal(false);
      setAiTopic('');
      navigate(`/editor/${result.id}`);
    } catch (err) {
      setAiError(err.message || 'Generation failed. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <div className="brand" style={{ marginBottom: 4 }}>ppt-gen <span>/ studio</span></div>
          <span style={{ fontSize: '0.85rem', color: '#777' }}>Select a presentation to edit</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user && (
            <span style={{ fontSize: '0.82rem', color: '#777', fontWeight: 500 }}>
              👤 {user.name}
            </span>
          )}
          <Link to="/" className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Home</Link>
          <button onClick={() => setShowAiModal(true)} className="btn-black" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            ✨ AI Generate
          </button>
          <button onClick={createNewProject} className="btn-black">+ New Deck</button>
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#ef4444', borderColor: '#fecaca' }}>
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
          <div className="export-spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }}></div>
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: 16 }}>No presentations yet</p>
          <button onClick={createNewProject} className="btn-black">Create your first deck</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="project-card"
              onClick={() => navigate(`/editor/${proj.id}`)}
            >
              <div>
                <h2>{proj.title}</h2>
                <span className="project-meta">
                  {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                <span className="badge">{proj.slides?.length || 0} slides</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPresentingProject(proj);
                    }}
                    title="Present this deck"
                  >
                    ▶ Present
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                    onClick={(e) => openExportModal(e, proj)}
                    title="Export this deck"
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={(e) => handleDeleteProject(e, proj.id)}
                    aria-label="Delete project"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {exportingProject && (
        <ExportModal
          project={exportingProject}
          activeSlideIndex={0}
          isOpen={Boolean(exportingProject)}
          onClose={() => setExportingProject(null)}
        />
      )}

      {/* Phase 4: Fullscreen Present Mode */}
      {presentingProject && (
        <PresentMode
          project={presentingProject}
          initialSlideIndex={0}
          onClose={() => setPresentingProject(null)}
        />
      )}

      {/* AI Generation Modal */}
      {showAiModal && (
        <div className="modal-overlay" onClick={() => !aiGenerating && setShowAiModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>✨ AI Generate Presentation</h2>
                <p style={{ fontSize: '0.88rem', color: '#666', marginTop: 4 }}>
                  Describe your topic and let AI create a full deck
                </p>
              </div>
              <button className="delete-btn" onClick={() => setShowAiModal(false)} disabled={aiGenerating}>✕</button>
            </div>

            {aiError && (
              <div className="export-error-banner">⚠️ {aiError}</div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: 8 }}>
                Topic / Prompt
              </label>
              <textarea
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g., History of Artificial Intelligence, Blockchain Technology, Climate Change Solutions..."
                disabled={aiGenerating}
                style={{
                  width: '100%', minHeight: 100, padding: '12px 16px',
                  border: '1.5px solid #e5e5e5', borderRadius: 12,
                  fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical',
                  outline: 'none', lineHeight: 1.5
                }}
                onFocus={(e) => e.target.style.borderColor = '#000'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: 8 }}>
                Number of Slides: {aiSlideCount}
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={aiSlideCount}
                onChange={(e) => setAiSlideCount(Number(e.target.value))}
                disabled={aiGenerating}
                style={{ width: '100%', accentColor: '#000' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#999', marginTop: 4 }}>
                <span>3 slides</span>
                <span>15 slides</span>
              </div>
            </div>

            {aiGenerating && (
              <div className="export-status-box">
                <span className="export-spinner" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111' }}>
                  AI is researching & building your deck with images...
                </span>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setShowAiModal(false)} disabled={aiGenerating}>Cancel</button>
              <button
                className="btn-black"
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiTopic.trim()}
                style={{
                  minWidth: 160,
                  background: aiGenerating ? '#555' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {aiGenerating ? 'Generating...' : '✨ Generate Deck'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
