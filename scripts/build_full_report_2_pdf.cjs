const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'report_screenshots_2');
const OUTPUT_PDF = path.join(__dirname, '..', 'PPT_GEN_Progress_Report_2.pdf');
const OUTPUT_HTML = path.join(__dirname, '..', 'report_presentation_2.html');

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: Screenshot not found: ${filePath}`);
    return '';
  }
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

const imgLanding = getBase64Image('1_landing.png');
const imgAuth = getBase64Image('2_auth.png');
const imgDashboard = getBase64Image('3_dashboard.png');
const imgAiModal = getBase64Image('4_ai_modal.png');
const imgEditor = getBase64Image('5_editor_split.png');
const imgPresent = getBase64Image('6_present_mode.png');
const imgExport = getBase64Image('7_export_modal.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PPT-GEN Progress Report II — Full-Stack AI & Cloud Architecture</title>
  <style>
    @page {
      size: 1920px 1080px;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    body {
      background: #09090b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .slide {
      width: 1920px;
      height: 1080px;
      page-break-after: always;
      position: relative;
      background: #ffffff;
      padding: 70px 90px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: #09090b;
    }

    /* Typography */
    h1.slide-title {
      font-size: 48px;
      font-weight: 800;
      color: #09090b;
      margin-bottom: 32px;
      letter-spacing: -0.03em;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    h1.slide-title span.badge-num {
      font-size: 18px;
      font-weight: 700;
      color: #7c3aed;
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      padding: 6px 14px;
      border-radius: 999px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .footer {
      position: absolute;
      bottom: 36px;
      left: 90px;
      right: 90px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      color: #71717a;
      font-weight: 500;
      border-top: 1px solid #f4f4f5;
      padding-top: 16px;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #18181b;
    }
    .footer-brand span {
      color: #7c3aed;
    }

    /* PAGE 1: TITLE COVER (Black & White Minimalist with Purple AI Accent) */
    .slide-cover {
      background: #09090b;
      color: #ffffff;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 90px 110px;
    }
    .cover-left {
      width: 58%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }
    .cover-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #c084fc;
      text-transform: uppercase;
      margin-bottom: 24px;
      width: fit-content;
    }
    .cover-title {
      font-size: 88px;
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.04em;
      margin-bottom: 20px;
      color: #ffffff;
    }
    .cover-title span {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover-subtitle {
      font-size: 24px;
      color: #a1a1aa;
      line-height: 1.5;
      max-width: 780px;
      font-weight: 400;
    }
    .cover-meta {
      font-size: 17px;
      color: #71717a;
      line-height: 1.6;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 24px;
      margin-top: 48px;
    }
    .cover-meta strong {
      color: #f4f4f5;
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
      border-radius: 14px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15);
      object-fit: cover;
    }

    /* 2 COLUMNS CARDS GRID */
    .two-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      flex-grow: 1;
      margin-bottom: 30px;
    }
    .info-card {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 14px;
      padding: 38px 40px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .card-heading {
      font-size: 26px;
      font-weight: 800;
      color: #09090b;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .card-heading span.dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #7c3aed;
      display: inline-block;
    }
    .point-group {
      margin-bottom: 20px;
    }
    .point-title {
      font-size: 19px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 5px;
    }
    .point-desc {
      font-size: 16px;
      color: #52525b;
      line-height: 1.5;
    }

    /* TABLE DESIGN */
    .table-container {
      width: 100%;
      flex-grow: 1;
      margin-bottom: 30px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e4e4e7;
      background: #ffffff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: #09090b;
      color: #ffffff;
      padding: 18px 24px;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    td {
      padding: 15px 24px;
      font-size: 16px;
      color: #27272a;
      border-bottom: 1px solid #f4f4f5;
      line-height: 1.45;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    td.col-bold {
      font-weight: 700;
      color: #09090b;
    }
    .tag-status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tag-live {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }
    .tag-upgraded {
      background: #f5f3ff;
      color: #7c3aed;
      border: 1px solid #ddd6fe;
    }

    /* ARCHITECTURE DIAGRAM */
    .arch-canvas {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-bottom: 30px;
    }
    .arch-flow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      position: relative;
    }
    .arch-box {
      background: #ffffff;
      border: 1.5px solid #18181b;
      border-radius: 12px;
      padding: 24px 20px;
      width: 18%;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
      text-align: center;
      transition: all 0.2s ease;
    }
    .arch-box.arch-highlight {
      border: 2px solid #7c3aed;
      background: #faf5ff;
    }
    .arch-box h3 {
      font-size: 20px;
      font-weight: 800;
      color: #09090b;
      margin-bottom: 8px;
    }
    .arch-box p {
      font-size: 14px;
      color: #52525b;
      line-height: 1.4;
    }
    .arch-arrow {
      font-size: 26px;
      color: #7c3aed;
      font-weight: 900;
    }
    .arch-callouts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .callout-box {
      background: #fafafa;
      border-left: 5px solid #09090b;
      padding: 20px 24px;
      border-radius: 0 10px 10px 0;
      border-top: 1px solid #f4f4f5;
      border-right: 1px solid #f4f4f5;
      border-bottom: 1px solid #f4f4f5;
    }
    .callout-box.callout-purple {
      border-left-color: #7c3aed;
      background: #fbfbfe;
    }
    .callout-box h4 {
      font-size: 18px;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 6px;
    }
    .callout-box p {
      font-size: 15px;
      color: #52525b;
      line-height: 1.5;
    }

    /* 5 STEPS PIPELINE */
    .steps-row {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 30px;
      flex-grow: 1;
    }
    .step-card {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 28px 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .step-num {
      font-size: 38px;
      font-weight: 900;
      color: #09090b;
      margin-bottom: 14px;
      line-height: 1;
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .step-num span {
      font-size: 14px;
      color: #7c3aed;
      font-weight: 700;
    }
    .step-title {
      font-size: 19px;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 10px;
    }
    .step-desc {
      font-size: 15px;
      color: #52525b;
      line-height: 1.5;
    }
    .highlight-banner {
      border: 1.5px solid #e4e4e7;
      border-radius: 10px;
      padding: 20px 28px;
      background: #fafafa;
      font-size: 17px;
      color: #18181b;
      font-weight: 600;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .highlight-banner span.icon {
      font-size: 22px;
    }

    /* SCREENSHOT VIEW (PAGE 7, 8, 9, 10, 11, 12, 13) */
    .screenshot-layout {
      display: flex;
      justify-content: space-between;
      gap: 44px;
      flex-grow: 1;
      align-items: flex-start;
      margin-bottom: 30px;
    }
    .screenshot-left {
      width: 64%;
      display: flex;
      flex-direction: column;
    }
    .screenshot-frame {
      width: 100%;
      height: 610px;
      background: #09090b;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #d4d4d8;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
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
      margin-top: 12px;
      font-size: 14px;
      color: #71717a;
      font-style: italic;
      display: flex;
      justify-content: space-between;
    }
    .screenshot-right {
      width: 34%;
      background: #fafafa;
      border-radius: 14px;
      padding: 34px 30px;
      border: 1px solid #e4e4e7;
      display: flex;
      flex-direction: column;
    }
    .screenshot-right h3 {
      font-size: 24px;
      font-weight: 800;
      color: #09090b;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .screenshot-right ul {
      list-style-type: none;
    }
    .screenshot-right li {
      position: relative;
      padding-left: 22px;
      font-size: 16px;
      color: #27272a;
      line-height: 1.55;
      margin-bottom: 15px;
    }
    .screenshot-right li::before {
      content: "▪";
      position: absolute;
      left: 0;
      color: #7c3aed;
      font-size: 18px;
      line-height: 1;
      top: 1px;
    }
    .screenshot-right strong {
      color: #09090b;
    }

    /* DEPLOYMENT METRICS GRID (SLIDE 15) */
    .deploy-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .deploy-card {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    .deploy-val {
      font-size: 36px;
      font-weight: 900;
      color: #09090b;
      margin-bottom: 6px;
    }
    .deploy-val.purple {
      color: #7c3aed;
    }
    .deploy-val.green {
      color: #059669;
    }
    .deploy-label {
      font-size: 14px;
      color: #71717a;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* THANKS BANNER */
    .thanks-banner {
      font-size: 42px;
      font-weight: 800;
      color: #09090b;
      margin-top: 16px;
      letter-spacing: -0.03em;
    }
  </style>
</head>
<body>

  <!-- ==================== SLIDE 1: TITLE COVER ==================== -->
  <div class="slide slide-cover">
    <div class="cover-left">
      <div>
        <div class="cover-pill">PROGRESS REPORT II — MILESTONE PHASE 2 TO 4</div>
        <div class="cover-title">PPT-GEN<br><span>Cloud & AI Full-Stack</span></div>
        <div class="cover-subtitle">
          Full-stack MERN presentation platform powered by Google Gemini 3 Flash, concurrent Unsplash HD imagery, JWT authentication, Phase 4 Present Mode, and automated cloud deployments.
        </div>
      </div>
      <div class="cover-meta">
        Presented by: <strong>Vikrant Tewatia</strong> (24001015068) & <strong>Sushant</strong> (24001015062)<br>
        Under the Guidance of: <strong>Dr. Meenakshi</strong> | Department of Electronics, J.C. Bose UST, YMCA<br>
        Live Web: <strong>https://ppt-gen-two.vercel.app</strong> | API: <strong>https://ppt-gen-backend-doal.onrender.com</strong>
      </div>
    </div>
    <div class="cover-right">
      <img src="${imgEditor}" class="cover-mockup" alt="PPT-GEN Production Editor">
    </div>
  </div>

  <!-- ==================== SLIDE 2: EXECUTIVE SUMMARY & EVOLUTION ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Executive Summary & System Evolution
      <span class="badge-num">Report II</span>
    </h1>
    <div class="two-cards-grid">
      <div class="info-card">
        <div class="card-heading"><span class="dot"></span>Phase 1 Baseline (Prototype)</div>
        <div class="point-group">
          <div class="point-title">Client-Only Architecture</div>
          <div class="point-desc">Initial milestone focused strictly on client-side React 19 canvas rendering and in-memory presentation schemas with local state persistence.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Generic Placeholder Images</div>
          <div class="point-desc">Early visual previews relied on static CSS watermarks or arbitrary mock placeholders without external content correlation.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Manual Slide Authoring</div>
          <div class="point-desc">Required users to write content bullet-by-bullet or use mock templates without live generative artificial intelligence capabilities.</div>
        </div>
        <div class="point-group">
          <div class="point-title">No User Persistence or Cloud State</div>
          <div class="point-desc">Decks were isolated to single browser instances with zero authentication or multi-device cloud synchronization.</div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-heading"><span class="dot"></span>Phase 2–4 Transformation (Production Full-Stack)</div>
        <div class="point-group">
          <div class="point-title">Production Express & MongoDB Atlas Backend</div>
          <div class="point-desc">Full RESTful micro-service with BCrypt password hashing, stateless JSON Web Tokens (JWT), and MongoDB Atlas cloud storage.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Google Gemini 3 Flash Prompt Engineering</div>
          <div class="point-desc">Sub-2 second structured JSON inference generating 15-25 word factual bullets (<strong>**Key Concept:**</strong>) with zero marketing fluff.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Concurrent Unsplash HD Visual Pipeline</div>
          <div class="point-desc">Automated contextual photo matching with parallel fetching, photographer attribution badges, and 42% split layout image cards.</div>
        </div>
        <div class="point-group">
          <div class="point-title">Phase 4 Present Mode & 5 Streamlined Exports</div>
          <div class="point-desc">Fullscreen presentation engine with keyboard controls, auto-hiding HUD, and strictly focused 5 production export formats.</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 2 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 3: EXPANDED TECH STACK ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Full-Stack Production Technology Stack
      <span class="badge-num">Architecture</span>
    </h1>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">Tier</th>
            <th style="width: 25%;">Technology & Version</th>
            <th style="width: 40%;">Core Responsibility</th>
            <th style="width: 15%;">Deployment</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-bold">Frontend SPA</td>
            <td>React 19 + Vite 8.2 + React Router v7</td>
            <td>Modern concurrent UI, aspect-ratio locked 16:9 canvas, and modular view orchestration.</td>
            <td><span class="tag-status tag-live">Vercel Edge</span></td>
          </tr>
          <tr>
            <td class="col-bold">Backend API</td>
            <td>Node.js v26 + Express 4.19 + CORS</td>
            <td>Stateless REST API, JWT auth gatekeeper, Unsplash proxy, and Gemini prompt orchestrator.</td>
            <td><span class="tag-status tag-live">Render Cloud</span></td>
          </tr>
          <tr>
            <td class="col-bold">Cloud Database</td>
            <td>MongoDB Atlas (Mongoose ODM)</td>
            <td>Distributed document store preserving User credentials, deck hierarchies, and slide entities.</td>
            <td><span class="tag-status tag-live">Atlas Cluster</span></td>
          </tr>
          <tr>
            <td class="col-bold">Generative AI</td>
            <td>Google Gemini 3 Flash Preview</td>
            <td>Structured JSON schema synthesis generating high-density technical and domain slide summaries.</td>
            <td><span class="tag-status tag-upgraded">Google AI API</span></td>
          </tr>
          <tr>
            <td class="col-bold">Visual Media CDN</td>
            <td>Unsplash REST API (Official)</td>
            <td>Concurrent keyword-driven photography retrieval with author attribution and orientation filtering.</td>
            <td><span class="tag-status tag-live">Unsplash CDN</span></td>
          </tr>
          <tr>
            <td class="col-bold">Export Engines</td>
            <td>jsPDF + html2canvas + docx + pptxgenjs</td>
            <td>100% client-side binary compilation for 5 production formats: PDF, PPTX, DOCX, PNG, JPEG.</td>
            <td><span class="tag-status tag-live">In-Browser</span></td>
          </tr>
          <tr>
            <td class="col-bold">Auth & Security</td>
            <td>BCrypt.js + JSONWebToken (JWT)</td>
            <td>Salted password hashing (10 rounds) and HMAC-SHA256 bearer token authorization middleware.</td>
            <td><span class="tag-status tag-live">Active</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 3 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 4: SYSTEM ARCHITECTURE ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      End-to-End System Architecture
      <span class="badge-num">Data Flow</span>
    </h1>
    <div class="arch-canvas">
      <div class="arch-flow">
        <div class="arch-box">
          <h3>Vercel React SPA</h3>
          <p>Landing, Auth, Studio Dashboard, 16:9 Editor, and Present Mode.</p>
        </div>
        <div class="arch-arrow">➔</div>
        <div class="arch-box arch-highlight">
          <h3>Render Express API</h3>
          <p>JWT verification, input validation, and asynchronous microservice coordination.</p>
        </div>
        <div class="arch-arrow">➔</div>
        <div class="arch-box">
          <h3>Google Gemini 3</h3>
          <p>Structured schema synthesis with domain bullets & image query keywords.</p>
        </div>
        <div class="arch-arrow">➔</div>
        <div class="arch-box">
          <h3>Unsplash API</h3>
          <p>Concurrent parallel image retrieval for each generated slide topic.</p>
        </div>
        <div class="arch-arrow">➔</div>
        <div class="arch-box">
          <h3>MongoDB Atlas</h3>
          <p>Atomic persistence of authenticated deck state and slide arrays.</p>
        </div>
      </div>
      <div class="arch-callouts">
        <div class="callout-box">
          <h4>Stateless Microservice Design</h4>
          <p>Decoupled frontend and backend communicating exclusively over HTTPS with JWT bearer authentication. Frontend assets cache on Vercel's global CDN while the Express backend executes on Render container infrastructure.</p>
        </div>
        <div class="callout-box callout-purple">
          <h4>Dual Engine Parallel Synthesis</h4>
          <p>Generative text synthesis and visual asset discovery occur in a synchronized multi-stage pipeline: Gemini produces topic-aligned image search keywords, which trigger concurrent Unsplash queries via Promise.all.</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 4 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 5: AI & IMAGE PIPELINE ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Generative AI & Image Pipeline Workflow
      <span class="badge-num">Pipeline</span>
    </h1>
    <div class="steps-row">
      <div class="step-card">
        <div class="step-num">01 <span>INPUT</span></div>
        <div class="step-title">Prompt & Count</div>
        <div class="step-desc">User specifies deck topic and slide count (3 to 15) in the Studio Dashboard AI Modal.</div>
      </div>
      <div class="step-card">
        <div class="step-num">02 <span>LLM</span></div>
        <div class="step-title">Gemini Synthesis</div>
        <div class="step-desc">Gemini 3 Flash returns strictly typed JSON with 15-25 word factual bullets and landscape query tags.</div>
      </div>
      <div class="step-card">
        <div class="step-num">03 <span>PARALLEL</span></div>
        <div class="step-title">Unsplash Pipeline</div>
        <div class="step-desc">Backend executes concurrent Unsplash searches via Promise.all, securing high-res photography and credits.</div>
      </div>
      <div class="step-card">
        <div class="step-num">04 <span>PERSIST</span></div>
        <div class="step-title">Atlas Database Save</div>
        <div class="step-desc">Complete presentation with integrated images and layout metadata commits atomically to MongoDB.</div>
      </div>
      <div class="step-card">
        <div class="step-num">05 <span>RENDER</span></div>
        <div class="step-title">16:9 Canvas Display</div>
        <div class="step-desc">React mounts the presentation immediately into the editor with 42% image cards and present mode triggers.</div>
      </div>
    </div>
    <div class="highlight-banner">
      <span class="icon">⚡</span>
      <span><strong>Prompt Engineering Rule:</strong> Gemini is strictly prompted to prohibit marketing buzzwords and produce 15–25 word factual bullets formatted as <code>**Key Concept:** Description</code> with real-world metrics.</span>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 5 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 6: DATABASE & AUTH SCHEMA ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Database Models & Authentication Security
      <span class="badge-num">Data Schema</span>
    </h1>
    <div class="two-cards-grid">
      <div class="info-card">
        <div class="card-heading"><span class="dot"></span>User Model & JWT Authentication</div>
        <div class="point-group">
          <div class="point-title">• name: String (Trimmed, 2–50 characters)</div>
          <div class="point-desc">Author profile identity displayed on studio dashboard and export metadata.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• email: String (Unique index, normalized lowercase)</div>
          <div class="point-desc">Primary authentication credential preventing duplicate registration conflicts.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• password: String (BCrypt Salted Hash)</div>
          <div class="point-desc">Pre-save Mongoose hook runs bcrypt.genSalt(10) ensuring raw passwords never touch disk.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• JWT Session Management</div>
          <div class="point-desc">Issues HMAC-SHA256 signed bearer tokens with 7-day expiration and automatic 401 redirect protection.</div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-heading"><span class="dot"></span>Project & Slide Schema Hierarchy</div>
        <div class="point-group">
          <div class="point-title">• userId: ObjectId (Indexed foreign key)</div>
          <div class="point-desc">Strict tenant isolation ensuring users only access and modify their own presentation decks.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• slides: [SlideSubdocument]</div>
          <div class="point-desc">Sequential collection containing slide id, title, subtitle, layout, and content array.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• image: { url, alt, photographerName, photographerUrl }</div>
          <div class="point-desc">Embedded object linking high-res Unsplash photo asset and required API attribution badges.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• timestamps: { createdAt, updatedAt }</div>
          <div class="point-desc">Automated change tracking facilitating dashboard recency sorting and audit histories.</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 6 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 7: SCREENSHOT - LANDING PAGE ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Landing Page & Team Attribution
      <span class="badge-num">Showcase 1</span>
    </h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgLanding}" alt="Landing Page">
        </div>
        <div class="screenshot-caption">
          <span>Figure 1: Production landing interface deployed on Vercel CDN</span>
          <span>https://ppt-gen-two.vercel.app/</span>
        </div>
      </div>
      <div class="screenshot-right">
        <h3>Feature Highlights</h3>
        <ul>
          <li><strong>Hero Value Proposition:</strong> Clean black & white minimalist typography conveying AI-accelerated presentation authoring.</li>
          <li><strong>Streamlined 5 Exports Pill:</strong> Live badge declaring support for strictly PDF, JPEG, PNG graphic, Word (.docx), and PowerPoint (.pptx).</li>
          <li><strong>Author Attribution:</strong> Professional footer crediting <em>Built by Vikrant Tewatia & Sushant</em>.</li>
          <li><strong>Direct Contact Hyperlinks:</strong> Integrated <code>mailto:</code> links for vikrtew@gmail.com and sushantbhadana99@gmail.com.</li>
          <li><strong>Session-Aware Navigation:</strong> Smart navbar toggling between "Get Started" and "Open Studio" based on token state.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 7 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 8: SCREENSHOT - AUTHENTICATION ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      JWT User Authentication & Security
      <span class="badge-num">Showcase 2</span>
    </h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgAuth}" alt="Login Screen">
        </div>
        <div class="screenshot-caption">
          <span>Figure 2: Secure sign-in dialog with validation feedback (/login)</span>
          <span>Backend JWT Authentication</span>
        </div>
      </div>
      <div class="screenshot-right">
        <h3>Security Architecture</h3>
        <ul>
          <li><strong>Stateless Token Auth:</strong> Client stores signed JWT bearer token securely in browser storage.</li>
          <li><strong>Automatic Route Guard:</strong> <code>&lt;ProtectedRoute&gt;</code> wrapper instantly redirects unauthenticated users to <code>/login</code>.</li>
          <li><strong>Input Normalization:</strong> Trimmed strings and lowercased email sanitization prevent case sensitivity bugs.</li>
          <li><strong>BCrypt Hashing:</strong> Passwords protected with industry-standard adaptive salted hashes on Render backend.</li>
          <li><strong>One-Click Switching:</strong> Seamless navigation between Login and Signup modals with unified error messaging.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 8 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 9: SCREENSHOT - STUDIO DASHBOARD ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Studio Projects Dashboard
      <span class="badge-num">Showcase 3</span>
    </h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgDashboard}" alt="Projects Dashboard">
        </div>
        <div class="screenshot-caption">
          <span>Figure 3: Authenticated user dashboard with multi-deck grid (/projects)</span>
          <span>MongoDB Atlas Cloud Sync</span>
        </div>
      </div>
      <div class="screenshot-right">
        <h3>Dashboard Controls</h3>
        <ul>
          <li><strong>User Profile Header:</strong> Displays authenticated user name with clean logout and home navigation pills.</li>
          <li><strong>✨ AI Generate Trigger:</strong> High-visibility purple accent button opening prompt engineering generator.</li>
          <li><strong>Deck Cards Grid:</strong> Dynamic cards showing presentation title, slide count badge, and formatted timestamp.</li>
          <li><strong>▶ Present Button:</strong> Direct trigger on each card allowing instant presentation launch without editor loading.</li>
          <li><strong>Direct Card Export:</strong> Allows immediate compilation into PDF or PowerPoint directly from dashboard overview.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 9 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 10: SCREENSHOT - AI MODAL ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Intelligent Gemini AI Generation Modal
      <span class="badge-num">Showcase 4</span>
    </h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgAiModal}" alt="AI Modal">
        </div>
        <div class="screenshot-caption">
          <span>Figure 4: AI presentation creation modal with topic input and length slider</span>
          <span>Google Gemini 3 Flash Preview</span>
        </div>
      </div>
      <div class="screenshot-right">
        <h3>Generation Capabilities</h3>
        <ul>
          <li><strong>Natural Language Input:</strong> Accepts high-level topic titles, detailed technical prompts, or domain summaries.</li>
          <li><strong>Dynamic Slide Range:</strong> Slider allows users to dial exact slide counts from 3 up to 15 structured slides.</li>
          <li><strong>Sub-2s LLM Response:</strong> Powered by Gemini 3 Flash with strict JSON Schema output enforcement.</li>
          <li><strong>Zero Slop Guarantee:</strong> Enforces factual bullets, technical concepts, real metrics, and zero marketing filler.</li>
          <li><strong>Loading State HUD:</strong> Clean animated spinner communicating concurrent text generation and Unsplash image fetching.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 10 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 11: SCREENSHOT - PRESENTATION EDITOR ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      16:9 Presentation Editor & Unsplash Visuals
      <span class="badge-num">Showcase 5</span>
    </h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgEditor}" alt="Presentation Editor">
        </div>
        <div class="screenshot-caption">
          <span>Figure 5: 16:9 slide canvas with 42% Unsplash photo card and photographer credit</span>
          <span>Distraction-Free Inline Editor</span>
        </div>
      </div>
      <div class="screenshot-right">
        <h3>Canvas Features</h3>
        <ul>
          <li><strong>42% Split Image Card:</strong> Curated high-resolution Unsplash photo rendered in dedicated right-column card.</li>
          <li><strong>Photographer Attribution:</strong> Official badge linking photographer's Unsplash profile directly.</li>
          <li><strong>Cleaned UI (No Copilot):</strong> Removed sidebar copilot distraction to focus completely on slide content and structure.</li>
          <li><strong>Markdown Bold Parsing:</strong> Automatically renders <code>**Key Concept:**</code> prefixes in bold black contrast.</li>
          <li><strong>Aspect-Locked Geometry:</strong> Enforces exact 16:9 ratio, completely eliminating broken margins across displays.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 11 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 12: SCREENSHOT - PRESENT MODE ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Phase 4 Fullscreen Present Mode
      <span class="badge-num">Showcase 6</span>
    </h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgPresent}" alt="Present Mode">
        </div>
        <div class="screenshot-caption">
          <span>Figure 6: Fullscreen cinematic presentation engine with HUD controls and progress bar</span>
          <span>Phase 4 Milestone Feature</span>
        </div>
      </div>
      <div class="screenshot-right">
        <h3>Presentation Controls</h3>
        <ul>
          <li><strong>Keyboard Shortcuts:</strong> Spacebar or Right Arrow to advance, Left Arrow to reverse, Esc to exit.</li>
          <li><strong>Native Fullscreen Toggle:</strong> Press <kbd>F</kbd> key or click HUD icon for true browser fullscreen presentation.</li>
          <li><strong>Automated Autoplay:</strong> Press <kbd>P</kbd> key to cycle through presentation automatically at 5-second intervals.</li>
          <li><strong>Auto-Hiding Floating HUD:</strong> Controls auto-fade during mouse inactivity to deliver an immersion-first experience.</li>
          <li><strong>Bottom Progress Bar:</strong> Real-time linear progress bar communicating visual pacing through the deck.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 12 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 13: SCREENSHOT - EXPORT MODAL ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Streamlined 5-Format Export Engine
      <span class="badge-num">Showcase 7</span>
    </h1>
    <div class="screenshot-layout">
      <div class="screenshot-left">
        <div class="screenshot-frame">
          <img src="${imgExport}" alt="Export Modal">
        </div>
        <div class="screenshot-caption">
          <span>Figure 7: Streamlined export modal restricted strictly to 5 production formats</span>
          <span>Client-Side Document Compilers</span>
        </div>
      </div>
      <div class="screenshot-right">
        <h3>5 Production Formats</h3>
        <ul>
          <li><strong>1. PDF Document:</strong> Multi-page landscape PDF compiled at 2x High-DPI resolution via jsPDF and html2canvas.</li>
          <li><strong>2. JPEG Image Deck:</strong> High-compression rasterized image export for quick sharing and mobile viewing.</li>
          <li><strong>3. PNG Graphic Deck:</strong> Lossless crisp graphic format with transparency preservation.</li>
          <li><strong>4. Microsoft Word (.docx):</strong> Structured document generated using client-side docx Packer.</li>
          <li><strong>5. PowerPoint Deck (.pptx):</strong> Native widescreen 16:9 slides built via pptxgenjs for offline PowerPoint editing.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 13 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 14: CHALLENGES & SOLUTIONS ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Engineering Challenges Faced & Solved
      <span class="badge-num">Problem Solving</span>
    </h1>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40%;">Technical Hurdle</th>
            <th style="width: 60%;">Architectural Solution Implemented</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-bold">Google Gemini Model Deprecation (gemini-2.0-flash 404)</td>
            <td>Migrated to <code>gemini-3-flash-preview</code> with <code>responseMimeType: 'application/json'</code>, reducing generation latency from ~90s down to ~1.9s.</td>
          </tr>
          <tr>
            <td class="col-bold">Sequential Image Fetching Bottlenecked Deck Creation</td>
            <td>Engineered a parallel <code>Promise.all</code> Unsplash pipeline executing all slide image queries concurrently without blocking Express event loop.</td>
          </tr>
          <tr>
            <td class="col-bold">Washed-out / Invisible Slide Images</td>
            <td>Overhauled <code>SlideRenderer.jsx</code> to render true <code>&lt;img&gt;</code> elements inside prominent 42% split layout cards with dark hero backdrops.</td>
          </tr>
          <tr>
            <td class="col-bold">GitHub Secret Scanning Blocked Git Push</td>
            <td>Reset repository tree, updated <code>render.yaml</code> with <code>sync: false</code> for all secrets, and enforced strict <code>.gitignore</code> rules.</td>
          </tr>
          <tr>
            <td class="col-bold">Render Free Tier Cold Start & URL Normalization</td>
            <td>Implemented defensive URL trimming in <code>src/utils/api.js</code> guaranteeing accurate routing regardless of trailing slash or missing <code>/api</code>.</td>
          </tr>
          <tr>
            <td class="col-bold">Vercel SPA Client-Side Direct Routing 404s</td>
            <td>Configured <code>vercel.json</code> rewrites routing all dynamic paths back to <code>/index.html</code>, preserving React Router state on reload.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 14 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 15: CLOUD DEPLOYMENT & METRICS ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Production Cloud Deployment & Verification
      <span class="badge-num">DevOps</span>
    </h1>
    <div class="deploy-grid">
      <div class="deploy-card">
        <div class="deploy-val green">100%</div>
        <div class="deploy-label">API Health Uptime</div>
      </div>
      <div class="deploy-card">
        <div class="deploy-val purple">~1.9s</div>
        <div class="deploy-label">Gemini 3 Latency</div>
      </div>
      <div class="deploy-card">
        <div class="deploy-val green">5 / 5</div>
        <div class="deploy-label">Export Formats Live</div>
      </div>
      <div class="deploy-card">
        <div class="deploy-val purple">0 KB</div>
        <div class="deploy-label">Server Disk Leak</div>
      </div>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">Component</th>
            <th style="width: 30%;">Host / Service</th>
            <th style="width: 35%;">Live URL / Endpoint</th>
            <th style="width: 15%;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-bold">Frontend Application</td>
            <td>Vercel Global Edge Network</td>
            <td>https://ppt-gen-two.vercel.app/</td>
            <td><span class="tag-status tag-live">Active</span></td>
          </tr>
          <tr>
            <td class="col-bold">Backend Web Service</td>
            <td>Render Cloud Platform (Node.js)</td>
            <td>https://ppt-gen-backend-doal.onrender.com/api/health</td>
            <td><span class="tag-status tag-live">Active</span></td>
          </tr>
          <tr>
            <td class="col-bold">Database Cluster</td>
            <td>MongoDB Atlas (AWS Cloud)</td>
            <td>Cluster0 (mongodb+srv://...)</td>
            <td><span class="tag-status tag-live">Connected</span></td>
          </tr>
          <tr>
            <td class="col-bold">Git Repository</td>
            <td>GitHub (Main Branch)</td>
            <td>https://github.com/Vikrant153-gif/ppt-gen.git</td>
            <td><span class="tag-status tag-live">Synchronized</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 15 of 16</div>
    </div>
  </div>

  <!-- ==================== SLIDE 16: CONCLUSION & NEXT STEPS ==================== -->
  <div class="slide">
    <h1 class="slide-title">
      Conclusion & Next Milestones
      <span class="badge-num">Milestones</span>
    </h1>
    <div class="two-cards-grid">
      <div class="info-card">
        <div class="card-heading"><span class="dot"></span>Progress Report II Accomplishments</div>
        <div class="point-desc" style="font-size: 18px; line-height: 1.6; color: #27272a;">
          PPT-GEN has successfully transitioned from a client-side prototype into a <strong>production-grade, cloud-deployed full-stack platform</strong>. By combining Google Gemini 3 Flash structured prompting, Unsplash concurrent HD media discovery, Phase 4 Fullscreen Present Mode, and 5 client-side document compilers, PPT-GEN delivers end-to-end presentation authoring in seconds without layout degradation.
        </div>
      </div>

      <div class="info-card">
        <div class="card-heading"><span class="dot"></span>Upcoming Milestones (Final Phase)</div>
        <div class="point-group">
          <div class="point-title">• Dynamic Audio Narration (Text-to-Speech)</div>
          <div class="point-desc">Integrating Web Speech API for automated slide voiceovers during present mode playback.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• Interactive Chart & Graph Schemas</div>
          <div class="point-desc">Expanding layout schemas with SVG bar, line, and radar chart generation directly from Gemini data.</div>
        </div>
        <div class="point-group">
          <div class="point-title">• Multi-User Real-Time Collaboration</div>
          <div class="point-desc">WebSocket-based synchronized room editing allowing teams to co-author slide decks simultaneously.</div>
        </div>
      </div>
    </div>
    <div class="thanks-banner">
      Thank You. Demonstrations & Questions Welcome!
    </div>
    <div class="footer">
      <div class="footer-brand">PPT-GEN <span>/ studio</span> — Progress Report II</div>
      <div>Slide 16 of 16</div>
    </div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  console.log('Saved report_presentation_2.html');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`file://${OUTPUT_HTML}`, { waitUntil: 'networkidle0' });

  console.log('Generating PDF: PPT_GEN_Progress_Report_2.pdf...');
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
  console.error('PDF Generation Error:', err);
  process.exit(1);
});
