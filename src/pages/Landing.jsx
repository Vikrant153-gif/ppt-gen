import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Landing({ user }) {
  const [quickPrompt, setQuickPrompt] = useState('');
  const navigate = useNavigate();

  const handleQuickGenerate = () => {
    if (quickPrompt.trim()) {
      navigate(`/projects?generate=${encodeURIComponent(quickPrompt.trim())}`);
    }
  };

  return (
    <div className="landing">
      <nav className="nav">
        <div className="brand">ppt-gen <span>/ studio</span></div>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/projects" className="nav-btn">My Projects</Link>
              <Link to="/projects" className="btn-black">Open App</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn">Sign In</Link>
              <Link to="/signup" className="btn-black">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <span className="tag-pill">AI Presentation Engine</span>
        <h1>Your ideas. Generated into decks in seconds.</h1>
        <p>
          Prompt-to-slide synthesis mapped directly to strict JSON schemas.
          Instant layout consistency without broken drag-and-drop.
        </p>

        <div className="hero-search-bar">
          <input
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickGenerate()}
            placeholder="Describe your presentation topic..."
          />
          <button
            onClick={handleQuickGenerate}
            className="btn-black"
            style={{
              padding: '10px 20px', fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            ✨ Generate
          </button>
        </div>

        <div className="hero-cta">
          {user ? (
            <Link to="/projects" className="btn-black">Open Dashboard</Link>
          ) : (
            <Link to="/signup" className="btn-black">Get Started Free</Link>
          )}
          <a href="#how-it-works" className="btn-outline">How It Works</a>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="how-section">
        <div className="section-header">
          <span className="tag-pill">Pipeline</span>
          <h2>Three steps. No templates to hunt for.</h2>
          <p>From a rough topic to a structured deck — the entire pipeline runs server-side.</p>
        </div>

        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-num">01</div>
            <h3>Describe your topic</h3>
            <p>
              Type a plain-text prompt — &ldquo;5G network architecture&rdquo; or 
              &ldquo;climate change mitigation strategies.&rdquo; That's the only input.
            </p>
          </div>
          <div className="how-step-arrow">→</div>
          <div className="how-step">
            <div className="how-step-num">02</div>
            <h3>AI structures the deck</h3>
            <p>
              The backend calls Gemini 2.0 Flash, constrains output to our slide JSON schema, 
              and picks layouts — standard, split, cards, metrics, headline — per slide.
            </p>
          </div>
          <div className="how-step-arrow">→</div>
          <div className="how-step">
            <div className="how-step-num">03</div>
            <h3>Edit, tweak, export</h3>
            <p>
              Open the visual editor, change layouts, rephrase content, 
              then export to PDF, PPTX, DOCX, PNG, or JPEG. All client-side.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID (expanded) ─── */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="tag-pill">Capabilities</span>
          <h2>What's actually under the hood</h2>
          <p>No vague promises. Here's what the system does and how.</p>
        </div>

        <div className="features-grid-v2">
          <div className="feature-card-v2">
            <div className="fc-icon">⚡</div>
            <h3>Prompt → JSON Schema</h3>
            <p>
              Every AI response is constrained to a strict slide schema. 
              No freeform HTML, no broken formatting — just structured data the renderer expects.
            </p>
          </div>

          <div className="feature-card-v2">
            <div className="fc-icon">◫</div>
            <h3>5 Layout Types</h3>
            <p>
              Standard bullets, two-column split, 3-card grids, metric showcases, 
              and bold headlines. The AI picks per slide, you can override.
            </p>
          </div>

          <div className="feature-card-v2">
            <div className="fc-icon">⤓</div>
            <h3>5-Format Export</h3>
            <p>
              PDF Document, PowerPoint (.pptx), Word (.docx), PNG Graphic, and JPEG Image. 
              All captured client-side with rich layouts and embedded high-res imagery.
            </p>
          </div>

          <div className="feature-card-v2">
            <div className="fc-icon">🔒</div>
            <h3>JWT Authentication</h3>
            <p>
              bcrypt-hashed passwords, Bearer token auth on every API route. 
              Your decks are isolated per account — no one else can read or edit them.
            </p>
          </div>

          <div className="feature-card-v2">
            <div className="fc-icon">☁</div>
            <h3>MongoDB Atlas Storage</h3>
            <p>
              Slides live in a Mongoose schema with user references. 
              Auto-save debounces at 800ms so nothing is lost between edits.
            </p>
          </div>

          <div className="feature-card-v2">
            <div className="fc-icon">⟳</div>
            <h3>Live Visual Editor</h3>
            <p>
              Three-panel workspace: slide list, rendered preview, and property editor. 
              Change layouts, titles, and content while watching the slide update live.
            </p>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="stack-section">
        <div className="section-header">
          <span className="tag-pill">Stack</span>
          <h2>Built with things you can actually audit</h2>
        </div>

        <div className="stack-strip">
          {[
            { name: 'React 19', desc: 'Frontend UI' },
            { name: 'Vite', desc: 'Dev server + bundler' },
            { name: 'Node.js', desc: 'Backend runtime' },
            { name: 'Express', desc: 'REST API framework' },
            { name: 'MongoDB', desc: 'Document database' },
            { name: 'Mongoose', desc: 'ODM layer' },
            { name: 'Gemini 2.0', desc: 'AI model' },
            { name: 'JWT', desc: 'Auth tokens' },
          ].map((t) => (
            <div key={t.name} className="stack-chip">
              <span className="stack-chip-name">{t.name}</span>
              <span className="stack-chip-desc">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="cta-section">
        <h2>Stop dragging rectangles around. Start typing.</h2>
        <p>
          ppt-gen turns a one-line prompt into a structured, editable presentation.
          No sign-up friction — create an account and generate your first deck in under a minute.
        </p>
        <div className="cta-actions">
          {user ? (
            <Link to="/projects" className="btn-black" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/signup" className="btn-black" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand">ppt-gen <span>/ studio</span></span>
            <p>AI-powered presentation generation engine</p>
          </div>
          <div className="footer-meta">
            <p style={{ fontWeight: 600, color: '#111' }}>Built by Vikrant Tewatia &amp; Sushant</p>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '0.82rem', color: '#666', fontWeight: 500 }}>Contact Us:</span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href="mailto:vikrtew@gmail.com"
                  style={{ color: '#000', textDecoration: 'underline', fontSize: '0.82rem', fontWeight: 500 }}
                >
                  vikrtew@gmail.com
                </a>
                <span style={{ color: '#ccc' }}>·</span>
                <a
                  href="mailto:sushantbhadana99@gmail.com"
                  style={{ color: '#000', textDecoration: 'underline', fontSize: '0.82rem', fontWeight: 500 }}
                >
                  sushantbhadana99@gmail.com
                </a>
              </div>
            </div>
            <p style={{ marginTop: 12, color: '#999', fontSize: '0.75rem' }}>
              &copy; {new Date().getFullYear()} ppt-gen studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
