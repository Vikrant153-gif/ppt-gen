const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'report_screenshots');
const OUTPUT_PDF = path.join(__dirname, '..', 'PPT_GEN_Progress_Report.pdf');

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

const imgLanding = getBase64Image('1_landing.png');
const imgDashboard = getBase64Image('2_dashboard.png');
const imgEditor = getBase64Image('3_editor.png');
const imgEditorSlide2 = getBase64Image('4_editor_slide2.png');
const imgExportModal = getBase64Image('5_export_modal.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PPT-GEN Progress Report</title>
  <style>
    @page {
      size: 1920px 1080px;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #e2e8f0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .slide {
      width: 1920px;
      height: 1080px;
      page-break-after: always;
      position: relative;
      background: #ffffff;
      padding: 80px 100px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Typography */
    h1.slide-title {
      font-family: 'Georgia', serif;
      font-size: 54px;
      font-weight: 700;
      color: #1a4331;
      margin-bottom: 40px;
      letter-spacing: -0.02em;
    }

    .footer {
      position: absolute;
      bottom: 40px;
      left: 100px;
      right: 100px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      color: #888888;
      font-weight: 500;
    }

    /* PAGE 1: TITLE COVER */
    .slide-cover {
      background: #173b2c;
      color: #ffffff;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 100px 120px;
    }
    .cover-left {
      width: 58%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }
    .cover-tag {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: #a7f3d0;
      text-transform: uppercase;
      margin-bottom: 30px;
    }
    .cover-title {
      font-family: 'Georgia', serif;
      font-size: 96px;
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: -0.03em;
      margin-bottom: 24px;
      color: #ffffff;
    }
    .cover-subtitle {
      font-size: 26px;
      color: #cbd5e1;
      line-height: 1.5;
      max-width: 780px;
    }
    .cover-meta {
      font-size: 18px;
      color: #94a3b8;
      line-height: 1.6;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 24px;
      margin-top: 60px;
    }
    .cover-right {
      width: 38%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cover-mockup {
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      object-fit: cover;
    }

    /* 2 COLUMNS CARDS (PAGE 2, 6, 13) */
    .two-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      flex-grow: 1;
      margin-bottom: 40px;
    }
    .info-card {
      background: #f4f5f6;
      border-radius: 14px;
      padding: 44px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .card-heading {
      font-size: 32px;
      font-weight: 700;
      color: #c25e2e;
      margin-bottom: 28px;
    }
    .point-group {
      margin-bottom: 26px;
    }
    .point-title {
      font-size: 22px;
      font-weight: 700;
      color: #111111;
      margin-bottom: 6px;
    }
    .point-desc {
      font-size: 18px;
      color: #555555;
      line-height: 1.5;
    }

    /* TABLE DESIGN (PAGE 3, 12) */
    .table-container {
      width: 100%;
      flex-grow: 1;
      margin-bottom: 40px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: #1a4331;
      color: #ffffff;
      padding: 22px 28px;
      font-size: 20px;
      font-weight: 700;
    }
    td {
      padding: 18px 28px;
      font-size: 18px;
      color: #333333;
      border-bottom: 1px solid #e5e7eb;
      line-height: 1.45;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    td.col-bold {
      font-weight: 700;
      color: #111111;
    }

    /* ARCHITECTURE DIAGRAM (PAGE 4) */
    .arch-canvas {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-bottom: 40px;
    }
    .arch-flow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      position: relative;
    }
    .arch-box {
      background: #ffffff;
      border: 2px solid #1a4331;
      border-radius: 12px;
      padding: 28px 24px;
      width: 28%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      text-align: center;
    }
    .arch-box h3 {
      font-size: 24px;
      font-weight: 800;
      color: #1a4331;
      margin-bottom: 8px;
    }
    .arch-box p {
      font-size: 16px;
      color: #666666;
      line-height: 1.4;
    }
    .arch-arrow {
      font-size: 32px;
      color: #c25e2e;
      font-weight: 900;
    }
    .arch-callouts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    .callout-box {
      background: #f8fafc;
      border-left: 6px solid #1a4331;
      padding: 24px 28px;
      border-radius: 0 10px 10px 0;
    }
    .callout-box h4 {
      font-size: 20px;
      font-weight: 700;
      color: #c25e2e;
      margin-bottom: 6px;
    }
    .callout-box p {
      font-size: 17px;
      color: #555555;
      line-height: 1.5;
    }

    /* 5 STEPS PIPELINE (PAGE 5) */
    .steps-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 40px;
      flex-grow: 1;
    }
    .step-card {
      background: #f4f5f6;
      border-radius: 12px;
      padding: 32px 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .step-num {
      font-size: 44px;
      font-weight: 900;
      color: #c25e2e;
      margin-bottom: 16px;
      line-height: 1;
    }
    .step-title {
      font-size: 22px;
      font-weight: 700;
      color: #111111;
      margin-bottom: 12px;
    }
    .step-desc {
      font-size: 17px;
      color: #555555;
      line-height: 1.5;
    }
    .highlight-banner {
      border: 2px solid #1a4331;
      border-radius: 10px;
      padding: 24px 32px;
      background: #f0fdf4;
      font-size: 19px;
      color: #166534;
      font-weight: 600;
      margin-bottom: 40px;
    }

    /* SCREENSHOT VIEW (PAGE 7, 8, 9, 10, 11) */
    .screenshot-layout {
      display: flex;
      justify-content: space-between;
      gap: 50px;
      flex-grow: 1;
      align-items: flex-start;
      margin-bottom: 40px;
    }
    .screenshot-left {
      width: 63%;
      display: flex;
      flex-direction: column;
    }
    .screenshot-frame {
      width: 100%;
      height: 640px;
      background: #0f172a;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .screenshot-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
    }
    .screenshot-caption {
      margin-top: 14px;
      font-size: 16px;
      color: #777777;
      font-style: italic;
    }
    .screenshot-right {
      width: 34%;
      background: #f8fafc;
      border-radius: 14px;
      padding: 40px 36px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
    }
    .screenshot-right h3 {
      font-size: 28px;
      font-weight: 700;
      color: #c25e2e;
      margin-bottom: 24px;
    }
    .screenshot-right ul {
      list-style-type: none;
    }
    .screenshot-right li {
      position: relative;
      padding-left: 24px;
      font-size: 18px;
      color: #333333;
      line-height: 1.6;
      margin-bottom: 18px;
    }
    .screenshot-right li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #1a4331;
      font-size: 24px;
      line-height: 1;
      top: -2px;
    }

    /* CONCLUSION & THANKS (PAGE 13) */
    .thanks-banner {
      font-family: 'Georgia', serif;
      font-size: 48px;
      font-weight: 700;
      color: #1a4331;
      margin-top: 20px;
    }
  </style>
</head>
<body>

  <!-- ==================== SLIDE 1 ==================== -->
  <div class="slide slide-cover">
    <div class="cover-left">
      <div>
        <div class="cover-tag">PROJECT REPORT</div>
        <div class="cover-title">PPT-GEN</div>
        <div class="cover-subtitle">
          AI-powered presentation generator built with React.js, componentized layout schemas, and client-side multi-format export engine.
        </div>
      </div>
      <div class="cover-meta">
        Presented by: <strong>Vikrant Tewatia</strong> (24001015068) & <strong>Sushant</strong> (24001015062)<br>
        Under the Guidance of: <strong>Dr. Meenakshi</strong> | Department of Electronics, J.C. Bose UST
      </div>
    </div>
    <div class="cover-right">
      <img src="${imgDashboard}" class="cover-mockup" alt="PPT-GEN Preview">
    </div>
  </div>

  <!-- ==================== SLIDE 2 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Problem and Objective</h1>
    <div class="two-cards-grid">
      <div class="info-card">
        <div class="card-heading">The problem</div>
        <div class="point-group">
          <div class="point-title">Manual formatting is slow</div>
          <div class="point-desc">Non-designer professionals spend up to 60–70% of total authoring time wrestling with coordinate placement, margin alignment, and visual inconsistencies rather than refining their core ideas.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Unstructured blank-canvas dilemma</div>
          <div class="point-desc">Users are confronted with empty 16:9 canvases, creating cognitive friction and writer's block when attempting to formulate slide outlines from scratch.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Degradation of visual aesthetics</div>
          <div class="point-desc">Free-form drag-and-drop mechanics allow arbitrary coordinate placement, resulting in broken hierarchies, mismatched margins, overlapping boxes, and visually unappealing slide decks.</div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-heading">Our objective</div>
        <div class="point-group">
          <div class="point-title">Prompt-to-slide schema synthesis</div>
          <div class="point-desc">Decouple semantic content authoring from visual structural rendering, mapping prompts into strictly validated JSON data contracts.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Constrained responsive layout engines</div>
          <div class="point-desc">Enforce mathematically proportioned 16:9 layout templates to preserve typographic hierarchy and prevent layout degradation.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Client-side multi-format export pipeline</div>
          <div class="point-desc">Enable instant, high-fidelity exports into PDF, Word (.docx), PowerPoint (.pptx), images (JPG/PNG), and standalone web decks directly in the browser.</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>2</span>
    </div>
  </div>

  <!-- ==================== SLIDE 3 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Technology Stack</h1>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Layer</th>
            <th style="width: 26%;">Technology</th>
            <th style="width: 52%;">What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-bold">Frontend Framework</td>
            <td>React 19 + Vite</td>
            <td>Component-driven single-page architecture with centralized state management and sub-second HMR.</td>
          </tr>
          <tr>
            <td class="col-bold">Routing & Views</td>
            <td>React Router v7</td>
            <td>Multi-page declarative client-side routing across Landing (/), Dashboard (/projects), and Editor (/editor/:id).</td>
          </tr>
          <tr>
            <td class="col-bold">Canvas & Styling</td>
            <td>Unified CSS3</td>
            <td>High-contrast monochrome palette, responsive grids, and locked 16:9 presentation canvas geometry.</td>
          </tr>
          <tr>
            <td class="col-bold">PDF Engine</td>
            <td>jsPDF + html2canvas</td>
            <td>Off-screen 2x High-DPI canvas rasterization compiled into landscape multi-page PDF documents.</td>
          </tr>
          <tr>
            <td class="col-bold">Document Export</td>
            <td>docx (Packer)</td>
            <td>Pure client-side Office Open XML builder generating structured Microsoft Word (.docx) documents with headers and page breaks.</td>
          </tr>
          <tr>
            <td class="col-bold">Slide Deck Export</td>
            <td>pptxgenjs</td>
            <td>Direct client-side generation of native 16:9 widescreen Microsoft PowerPoint (.pptx) presentations.</td>
          </tr>
          <tr>
            <td class="col-bold">Archive Compression</td>
            <td>JSZip</td>
            <td>In-memory client-side compression for bulk exporting all presentation slides as high-resolution image ZIPs.</td>
          </tr>
          <tr>
            <td class="col-bold">Schema Contract</td>
            <td>JSON Schema</td>
            <td>Strict presentation schema models ensuring zero layout drift and reliable multi-format translation.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>3</span>
    </div>
  </div>

  <!-- ==================== SLIDE 4 ==================== -->
  <div class="slide">
    <h1 class="slide-title">System Architecture</h1>
    <div class="arch-canvas">
      <div class="arch-flow">
        <div class="arch-box">
          <h3>React Client</h3>
          <p>Landing, Projects Dashboard, and 16:9 Editor Views powered by React Router v7.</p>
        </div>
        <div class="arch-arrow">➔</div>
        <div class="arch-box">
          <h3>State & Canvas Engine</h3>
          <p>Unidirectional state store holding presentation arrays, active slide IDs, and markdown updates.</p>
        </div>
        <div class="arch-arrow">➔</div>
        <div class="arch-box">
          <h3>Virtual Staging Engine</h3>
          <p>Isolated 1280x720 off-screen DOM renderer ensuring artifact-free capture.</p>
        </div>
        <div class="arch-arrow">➔</div>
        <div class="arch-box">
          <h3>Multi-Format Exporters</h3>
          <p>jsPDF, docx, pptxgenjs, JSZip, and native Blob builders producing downloads.</p>
        </div>
      </div>
      <div class="arch-callouts">
        <div class="callout-box">
          <h4>Secure & Zero-Server Client Architecture</h4>
          <p>All document and image compilation executes 100% locally in the client browser, eliminating server storage costs, upload delays, and third-party data exposure.</p>
        </div>
        <div class="callout-box">
          <h4>Strict Schema Predictability</h4>
          <p>Layout components strictly adhere to predetermined responsive ratios, completely eliminating the overlapping boxes and margin bugs found in traditional slide suites.</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>4</span>
    </div>
  </div>

  <!-- ==================== SLIDE 5 ==================== -->
  <div class="slide">
    <h1 class="slide-title">How Slide Generation & Export Works</h1>
    <div class="steps-row">
      <div class="step-card">
        <div class="step-num">1</div>
        <div class="step-title">Topic Input</div>
        <div class="step-desc">User enters a presentation topic or opens an existing deck with custom requirements.</div>
      </div>
      <div class="step-card">
        <div class="step-num">2</div>
        <div class="step-title">Schema Map</div>
        <div class="step-desc">Content structures into validated JSON objects specifying slide titles, content bodies, and timestamps.</div>
      </div>
      <div class="step-card">
        <div class="step-num">3</div>
        <div class="step-title">Live Canvas</div>
        <div class="step-desc">React renders responsive 16:9 slides with real-time text editing, thumbnail navigation, and deck renaming.</div>
      </div>
      <div class="step-card">
        <div class="step-num">4</div>
        <div class="step-title">Virtual Stage</div>
        <div class="step-desc">During export, each slide clones into an off-screen 1280x720 node to strip input borders and cursors.</div>
      </div>
      <div class="step-card">
        <div class="step-num">5</div>
        <div class="step-title">Multi-Export</div>
        <div class="step-desc">The chosen engine compiles clean slides into PDF, Word (.docx), PowerPoint (.pptx), images, or web decks.</div>
      </div>
    </div>
    <div class="highlight-banner">
      By decoupling semantic content authoring from visual structural rendering, PPT-GEN guarantees 100% design consistency across all presentation outputs.
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>5</span>
    </div>
  </div>

  <!-- ==================== SLIDE 6 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Data and Slide Schema Design</h1>
    <div class="two-cards-grid">
      <div class="info-card">
        <div class="card-heading">Presentation Deck Schema</div>
        <div class="point-group">
          <div class="point-title">• id: string (e.g., 'proj-1', 'proj-172855...')</div>
          <div class="point-desc">Unique identifier generated at creation, used for URL routing (/editor/:id).</div>
        </div>
        <div class="point-group">
          <div class="point-title">• title: string (e.g., 'AI Product Pitch')</div>
          <div class="point-desc">Deck title editable directly from the editor navigation bar or dashboard cards.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• updatedAt: string (e.g., 'Just now')</div>
          <div class="point-desc">Timestamp showing last modification for dashboard sorting and project audit.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• slides: Array&lt;Slide&gt;</div>
          <div class="point-desc">Central array containing all sequential slide entities belonging to the deck.</div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-heading">Slide Entity Schema</div>
        <div class="point-group">
          <div class="point-title">• id: number (e.g., Date.now())</div>
          <div class="point-desc">Unique timestamp identifier ensuring reliable React key reconciliation and deletion.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• title: string</div>
          <div class="point-desc">Slide heading text, mapped to H1 headers in PDF, Word, and PowerPoint exports.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• content: string</div>
          <div class="point-desc">Multi-line body content, bullet points, and summaries preserved with pre-wrap whitespace.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• layout: '16:9' aspect-locked container</div>
          <div class="point-desc">Enforces mathematical proportions, preventing visual degradation across all displays.</div>
        </div>
      </div>
    </div>
    <div class="highlight-banner" style="margin-bottom: 40px;">
      Strict JSON data models eliminate arbitrary pixel coordinates, guaranteeing deterministic, bug-free document compilation.
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>6</span>
    </div>
  </div>

  <!-- ==================== SLIDE 7 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Dashboard Overview</h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgDashboard}" alt="Projects Dashboard">
        </div>
        <div class="screenshot-caption">Figure 1: Projects dashboard screen (/projects)</div>
      </div>
      <div class="screenshot-right">
        <h3>What it shows</h3>
        <ul>
          <li>Minimalist, high-contrast grid displaying all user presentation decks.</li>
          <li>Real-time metadata displaying slide count pill and last modified status.</li>
          <li><strong>+ New Deck</strong> action button instantly generating fresh presentation workspaces.</li>
          <li>Quick <strong>Export</strong> button on each card for downloading decks without entering the editor.</li>
          <li>Safe deletion control (<strong>✕</strong>) allowing removal of outdated decks.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>7</span>
    </div>
  </div>

  <!-- ==================== SLIDE 8 ==================== -->
  <div class="slide">
    <h1 class="slide-title">16:9 Presentation Editor</h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgEditor}" alt="Presentation Editor">
        </div>
        <div class="screenshot-caption">Figure 2: Slide editor workspace (/editor/:id)</div>
      </div>
      <div class="screenshot-right">
        <h3>What it shows</h3>
        <ul>
          <li>Aspect-locked 16:9 presentation canvas preventing design stretching.</li>
          <li>Distraction-free inline editing for slide headlines and descriptive body text.</li>
          <li>Left thumbnail sidebar providing instant slide switching and overview.</li>
          <li><strong>+ Add Slide</strong> control dynamically expanding deck size with instant state sync.</li>
          <li>Top navigation header featuring inline deck title renaming and export trigger.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>8</span>
    </div>
  </div>

  <!-- ==================== SLIDE 9 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Slide Navigation & Management</h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgEditorSlide2}" alt="Slide Navigation">
        </div>
        <div class="screenshot-caption">Figure 3: Multi-slide authoring view with active selection</div>
      </div>
      <div class="screenshot-right">
        <h3>What it shows</h3>
        <ul>
          <li>Active slide indicator highlighting the currently edited slide in the sidebar.</li>
          <li>Smooth state switching between slides with zero re-rendering lag.</li>
          <li>Per-slide deletion button (<strong>✕</strong>) equipped with minimum-slide protection.</li>
          <li>Two-way text synchronization updating presentation state in real time.</li>
          <li>Subtle dashed input outlines appearing only during active focus or hover.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>9</span>
    </div>
  </div>

  <!-- ==================== SLIDE 10 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Multi-Format Export Engine</h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgExportModal}" alt="Export Modal Dialog">
        </div>
        <div class="screenshot-caption">Figure 4: Multi-format export dialog with 8 output formats</div>
      </div>
      <div class="screenshot-right">
        <h3>What it shows</h3>
        <ul>
          <li>High-contrast modal interface supporting <strong>8 distinct file formats</strong>.</li>
          <li>High-DPI multi-page PDF compilation via jsPDF and html2canvas.</li>
          <li>Image scope selector: Current Slide only or All Slides as a compressed ZIP.</li>
          <li>Native Microsoft Word (.docx) and PowerPoint (.pptx) file generation.</li>
          <li>Animated progress indicator with real-time feedback during canvas rendering.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>10</span>
    </div>
  </div>

  <!-- ==================== SLIDE 11 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Landing Page & Product Synopsis</h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgLanding}" alt="Landing Page">
        </div>
        <div class="screenshot-caption">Figure 5: Landing page and architecture synopsis (/)</div>
      </div>
      <div class="screenshot-right">
        <h3>What it shows</h3>
        <ul>
          <li>High-impact hero section presenting the AI presentation engine value proposition.</li>
          <li>Architectural callout cards highlighting Prompt-to-Slide LLM synthesis.</li>
          <li>Responsive layout standards card preventing design degradation.</li>
          <li>Clear call-to-action buttons directing users into the deck dashboard.</li>
          <li>Unified aesthetic matching modern minimalist design principles.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>11</span>
    </div>
  </div>

  <!-- ==================== SLIDE 12 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Challenges and Solutions</h1>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 45%;">What went wrong</th>
            <th style="width: 55%;">How we fixed it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-bold">Free-form drag-and-drop caused overlapping boxes & broken margins</td>
            <td>Enforced mathematically proportioned, responsive 16:9 layout containers with CSS aspect-ratio locking.</td>
          </tr>
          <tr>
            <td class="col-bold">Capturing live editor screen produced blurry text and input cursor artifacts</td>
            <td>Architected an off-screen virtual stage rendering clean semantic HTML at 2x High-DPI resolution.</td>
          </tr>
          <tr>
            <td class="col-bold">Only active slide was mounted in DOM, preventing multi-slide PDF export</td>
            <td>Implemented sequential off-screen DOM staging to capture every slide sequentially into jsPDF and JSZip.</td>
          </tr>
          <tr>
            <td class="col-bold">Client-side Word & PowerPoint export required heavy server roundtrips</td>
            <td>Integrated client-side docx and pptxgenjs compilers, allowing 100% in-browser binary generation.</td>
          </tr>
          <tr>
            <td class="col-bold">Nested React Router collision crashed navigation on page reload</td>
            <td>Refactored App.jsx and main.jsx into a clean single BrowserRouter under StrictMode.</td>
          </tr>
          <tr>
            <td class="col-bold">Monolithic CSS grew past 480 lines with maintainability bottlenecks</td>
            <td>Restructured into 236 lines of clean, categorized rules without losing any styling or animations.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>12</span>
    </div>
  </div>

  <!-- ==================== SLIDE 13 ==================== -->
  <div class="slide">
    <h1 class="slide-title">Conclusion and Future Scope</h1>
    <div class="two-cards-grid">
      <div class="info-card">
        <div class="card-heading">Conclusion</div>
        <div class="point-desc" style="font-size: 20px; line-height: 1.6; color: #333333;">
          PPT-GEN successfully demonstrates how decoupling semantic content authoring from visual design solves the "blank-canvas dilemma". By combining React 19, strict JSON schemas, and a client-side multi-format export pipeline (PDF, DOCX, PPTX, Images, HTML), users can author, customize, and export presentation-ready decks in seconds without design degradation.
        </div>
      </div>

      <div class="info-card">
        <div class="card-heading">Future scope</div>
        <div class="point-group">
          <div class="point-title">• Real-time LLM inference streaming API integration</div>
          <div class="point-desc">Direct connectivity with Gemini / Claude APIs for automated prompt-to-deck streaming.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• Automated AI image and chart generation</div>
          <div class="point-desc">Contextual visual synthesis using text-to-image models and dynamic SVG data charts.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• Collaborative multi-user editing</div>
          <div class="point-desc">Real-time team co-authoring using WebSockets and CRDT synchronization.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• Cloud presentations sync</div>
          <div class="point-desc">Direct export integration with Google Slides API and Microsoft 365 cloud services.</div>
        </div>
      </div>
    </div>
    <div class="thanks-banner">
      Thank you. Questions?
    </div>
    <div class="footer">
      <span>PPT-GEN | Project Report</span>
      <span>13</span>
    </div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  const htmlPath = path.join(__dirname, '..', 'report_presentation.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('Saved report_presentation.html');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  console.log('Generating PDF...');
  await page.pdf({
    path: OUTPUT_PDF,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('PDF generated successfully at:', OUTPUT_PDF);
  await browser.close();
}

generatePdf().catch(err => {
  console.error(err);
  process.exit(1);
});
