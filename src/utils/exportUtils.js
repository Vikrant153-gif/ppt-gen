import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, PageBreak } from 'docx';
import PptxGenJS from 'pptxgenjs';
import THEMES from './themes';

export function sanitizeFilename(name, fallback = 'presentation') {
  if (!name || typeof name !== 'string') return fallback;
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .replace(/\s+/g, '_');
  return cleaned || fallback;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

// ─── Theme helper ─────────────────────────────────────────────────────────────

function getT(slide) {
  return THEMES[slide.theme] || THEMES.default;
}

/**
 * Parses **Bold:** lead-in text and creates HTML elements.
 * Returns a DocumentFragment with bold span + text.
 */
function renderBoldText(text, headingColor) {
  const frag = document.createDocumentFragment();
  const boldMatch = text.match(/^\*\*(.+?)\*\*:?\s*/);
  if (boldMatch) {
    const boldEl = document.createElement('strong');
    boldEl.innerText = boldMatch[1] + ':';
    Object.assign(boldEl.style, { fontWeight: '700', color: headingColor });
    frag.appendChild(boldEl);
    frag.appendChild(document.createTextNode(' ' + text.substring(boldMatch[0].length)));
  } else {
    frag.appendChild(document.createTextNode(text));
  }
  return frag;
}

/**
 * Strips **bold** markdown from text for plain-text contexts.
 */
function stripBold(text) {
  return text.replace(/\*\*(.+?)\*\*:?\s*/, '$1: ');
}

// ─── Layout-aware slide export node builder ───────────────────────────────────

function createSlideExportNode(slide, index, totalSlides, projectTitle) {
  const t = getT(slide);
  const layout = slide.layout || 'standard';
  const hasImage = !!(slide.image && slide.image.url);
  const contentArr = Array.isArray(slide.content)
    ? slide.content
    : (slide.content || '').split('\n');

  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', left: '-9999px', top: '0',
    width: '1280px', height: '720px',
    backgroundColor: t.bg, color: t.text,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    zIndex: '-9999', overflow: 'hidden',
  });

  // Headline with image background
  if (layout === 'headline' && hasImage) {
    container.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.78)), url(${slide.image.url})`;
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
    container.style.color = '#ffffff';
  }

  // ── Header ──
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '14px', color: (layout === 'headline' && hasImage) ? '#94a3b8' : t.muted, fontWeight: '600', letterSpacing: '-0.02em',
    padding: '32px 64px 0', position: 'relative', zIndex: '2',
  });
  const brand = document.createElement('span');
  brand.innerText = projectTitle || 'ppt-gen / studio';
  const counter = document.createElement('span');
  Object.assign(counter.style, {
    background: (layout === 'headline' && hasImage) ? 'rgba(0,0,0,0.5)' : t.cardBg,
    padding: '4px 14px', borderRadius: '9999px',
    color: (layout === 'headline' && hasImage) ? '#f8fafc' : t.subtitle,
    border: `1px solid ${(layout === 'headline' && hasImage) ? 'rgba(255,255,255,0.2)' : t.border}`
  });
  counter.innerText = `${index + 1} / ${totalSlides}`;
  header.appendChild(brand);
  header.appendChild(counter);
  container.appendChild(header);

  // ── Body ──
  const body = document.createElement('div');
  Object.assign(body.style, { flexGrow: '1', display: 'flex', padding: '24px 64px 16px', position: 'relative', zIndex: '2' });

  if (layout === 'headline') {
    Object.assign(body.style, { alignItems: 'center', justifyContent: 'center', textAlign: 'center', flexDirection: 'column' });
    const h1 = document.createElement('h1');
    h1.innerText = slide.title || '';
    Object.assign(h1.style, {
      fontSize: '56px', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: '1.1',
      color: hasImage ? '#ffffff' : t.heading, margin: '0', maxWidth: '900px'
    });
    body.appendChild(h1);
    if (slide.subtitle) {
      const sub = document.createElement('p');
      sub.innerText = slide.subtitle;
      Object.assign(sub.style, {
        fontSize: '22px', color: hasImage ? '#cbd5e1' : t.subtitle,
        marginTop: '20px', fontWeight: '400', lineHeight: '1.5', maxWidth: '700px'
      });
      body.appendChild(sub);
    }
  } else if (layout === 'split') {
    Object.assign(body.style, { gap: '48px', alignItems: 'center' });
    const left = document.createElement('div');
    Object.assign(left.style, { flex: hasImage ? '0 0 54%' : '0 0 42%' });
    const h2 = document.createElement('h2');
    h2.innerText = slide.title || '';
    Object.assign(h2.style, { fontSize: '38px', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.15', color: t.heading, margin: '0 0 10px' });
    left.appendChild(h2);
    if (slide.subtitle) {
      const sub = document.createElement('p');
      sub.innerText = slide.subtitle;
      Object.assign(sub.style, { fontSize: '16px', color: t.subtitle, lineHeight: '1.5', marginBottom: '16px' });
      left.appendChild(sub);
    }
    contentArr.filter(Boolean).forEach((line) => {
      const li = document.createElement('div');
      Object.assign(li.style, { fontSize: '17px', color: t.text, padding: '6px 0 6px 24px', lineHeight: '1.45', position: 'relative' });
      const dot = document.createElement('span');
      Object.assign(dot.style, { position: 'absolute', left: '0', top: '14px', width: '8px', height: '8px', backgroundColor: t.bullet, borderRadius: '50%', display: 'inline-block' });
      li.appendChild(dot);
      li.appendChild(renderBoldText(line, t.heading));
      left.appendChild(li);
    });
    body.appendChild(left);

    if (hasImage) {
      const right = document.createElement('div');
      Object.assign(right.style, { flex: '1', height: '380px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: `1px solid ${t.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' });
      const img = document.createElement('img');
      img.src = slide.image.url;
      img.crossOrigin = 'anonymous';
      Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
      right.appendChild(img);
      body.appendChild(right);
    } else {
      const right = document.createElement('div');
      Object.assign(right.style, { flex: '1' });
      body.appendChild(right);
    }
  } else if (layout === 'cards') {
    Object.assign(body.style, { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' });
    const h2 = document.createElement('h2');
    h2.innerText = slide.title || '';
    Object.assign(h2.style, { fontSize: '32px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '28px', textAlign: 'center', color: t.heading });
    body.appendChild(h2);
    const grid = document.createElement('div');
    Object.assign(grid.style, { display: 'flex', gap: '20px', width: '100%', maxWidth: '1050px' });
    const lines = contentArr.filter(Boolean);
    for (let i = 0; i < 3; i++) {
      const card = document.createElement('div');
      Object.assign(card.style, { flex: '1', background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '14px', padding: '28px' });
      const ch = document.createElement('h4');
      ch.innerText = lines[i * 2] || `Card ${i + 1}`;
      Object.assign(ch.style, { fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: t.heading });
      card.appendChild(ch);
      if (lines[i * 2 + 1]) {
        const cp = document.createElement('p');
        cp.innerText = lines[i * 2 + 1];
        Object.assign(cp.style, { fontSize: '15px', color: t.subtitle, lineHeight: '1.5' });
        card.appendChild(cp);
      }
      grid.appendChild(card);
    }
    body.appendChild(grid);
  } else if (layout === 'metrics') {
    Object.assign(body.style, { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' });
    const h2 = document.createElement('h2');
    h2.innerText = slide.title || '';
    Object.assign(h2.style, { fontSize: '32px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '32px', textAlign: 'center', color: t.heading });
    body.appendChild(h2);
    const grid = document.createElement('div');
    Object.assign(grid.style, { display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' });
    contentArr.filter(Boolean).slice(0, 4).forEach((line) => {
      const parts = line.split(/\s*[—–]\s*/);
      const val = parts[0] || line;
      const label = parts.length >= 2 ? parts.slice(1).join(' — ') : '';
      const item = document.createElement('div');
      Object.assign(item.style, { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px', padding: '24px 28px', background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '14px', textAlign: 'center' });
      const vs = document.createElement('span');
      vs.innerText = val;
      Object.assign(vs.style, { fontSize: '36px', fontWeight: '900', letterSpacing: '-0.03em', color: t.accent });
      item.appendChild(vs);
      if (label) {
        const ls = document.createElement('span');
        ls.innerText = label;
        Object.assign(ls.style, { fontSize: '14px', color: t.subtitle, fontWeight: '500' });
        item.appendChild(ls);
      }
      grid.appendChild(item);
    });
    body.appendChild(grid);
  } else {
    // standard
    if (hasImage) {
      Object.assign(body.style, { flexDirection: 'row', gap: '48px', alignItems: 'center', padding: '24px 64px 16px' });
      const left = document.createElement('div');
      Object.assign(left.style, { flex: '0 0 56%' });
      const h2 = document.createElement('h2');
      h2.innerText = slide.title || '';
      Object.assign(h2.style, { fontSize: '36px', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.15', color: t.heading, margin: '0 0 8px' });
      left.appendChild(h2);
      if (slide.subtitle) {
        const sub = document.createElement('p');
        sub.innerText = slide.subtitle;
        Object.assign(sub.style, { fontSize: '16px', color: t.subtitle, marginBottom: '20px', fontWeight: '500' });
        left.appendChild(sub);
      }
      contentArr.filter(Boolean).forEach((line) => {
        const li = document.createElement('div');
        Object.assign(li.style, { fontSize: '17px', color: t.text, padding: '6px 0 6px 24px', lineHeight: '1.45', position: 'relative' });
        const dot = document.createElement('span');
        Object.assign(dot.style, { position: 'absolute', left: '0', top: '14px', width: '8px', height: '8px', backgroundColor: t.bullet, borderRadius: '50%', display: 'inline-block' });
        li.appendChild(dot);
        li.appendChild(renderBoldText(line, t.heading));
        left.appendChild(li);
      });
      body.appendChild(left);

      const right = document.createElement('div');
      Object.assign(right.style, { flex: '1', height: '380px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: `1px solid ${t.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' });
      const img = document.createElement('img');
      img.src = slide.image.url;
      img.crossOrigin = 'anonymous';
      Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
      right.appendChild(img);
      body.appendChild(right);
    } else {
      Object.assign(body.style, { flexDirection: 'column', justifyContent: 'center', padding: '24px 80px 16px' });
      const h2 = document.createElement('h2');
      h2.innerText = slide.title || '';
      Object.assign(h2.style, { fontSize: '42px', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.15', color: t.heading, margin: '0 0 10px' });
      body.appendChild(h2);
      if (slide.subtitle) {
        const sub = document.createElement('p');
        sub.innerText = slide.subtitle;
        Object.assign(sub.style, { fontSize: '18px', color: t.subtitle, marginBottom: '24px', fontWeight: '500' });
        body.appendChild(sub);
      }
      contentArr.filter(Boolean).forEach((line) => {
        const li = document.createElement('div');
        Object.assign(li.style, { fontSize: '20px', color: t.text, padding: '7px 0 7px 24px', lineHeight: '1.45', position: 'relative' });
        const dot = document.createElement('span');
        Object.assign(dot.style, { position: 'absolute', left: '0', top: '15px', width: '8px', height: '8px', backgroundColor: t.bullet, borderRadius: '50%', display: 'inline-block' });
        li.appendChild(dot);
        li.appendChild(renderBoldText(line, t.heading));
        body.appendChild(li);
      });
    }
  }

  container.appendChild(body);

  // ── Footer ──
  const footer = document.createElement('div');
  Object.assign(footer.style, {
    display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: t.muted,
    borderTop: `1px solid ${t.border}`, padding: '12px 64px 24px',
  });
  const fl = document.createElement('span');
  fl.innerText = 'ppt-gen / studio';
  const fr = document.createElement('span');
  fr.innerText = new Date().toLocaleDateString();
  footer.appendChild(fl);
  footer.appendChild(fr);
  container.appendChild(footer);

  document.body.appendChild(container);
  return container;
}

async function captureSlideCanvas(slide, index, totalSlides, projectTitle) {
  const node = createSlideExportNode(slide, index, totalSlides, projectTitle);
  try {
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      width: 1280,
      height: 720
    });
    return canvas;
  } finally {
    if (node.parentNode) document.body.removeChild(node);
  }
}

// ─── Export functions ─────────────────────────────────────────────────────────

export async function exportToPdf(project, onProgress) {
  const slides = project.slides || [];
  if (slides.length === 0) throw new Error('No slides to export.');

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] });

  for (let i = 0; i < slides.length; i++) {
    if (onProgress) onProgress({ current: i + 1, total: slides.length, text: `Rendering slide ${i + 1} of ${slides.length}...` });
    const canvas = await captureSlideCanvas(slides[i], i, slides.length, project.title);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    if (i > 0) pdf.addPage([1280, 720], 'landscape');
    pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);
  }
  pdf.save(`${sanitizeFilename(project.title)}.pdf`);
}

export async function exportSlideImage(project, slideIndex, format = 'jpg') {
  const slides = project.slides || [];
  const slide = slides[slideIndex] || slides[0];
  if (!slide) throw new Error('Slide not found.');
  const canvas = await captureSlideCanvas(slide, slideIndex, slides.length, project.title);
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `${sanitizeFilename(project.title)}_slide_${slideIndex + 1}.${ext}`);
  }, mimeType, 0.95);
}

export async function exportAllSlidesZip(project, format = 'jpg', onProgress) {
  const slides = project.slides || [];
  if (slides.length === 0) throw new Error('No slides to export.');
  const zip = new JSZip();
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';
  for (let i = 0; i < slides.length; i++) {
    if (onProgress) onProgress({ current: i + 1, total: slides.length, text: `Exporting image ${i + 1} of ${slides.length}...` });
    const canvas = await captureSlideCanvas(slides[i], i, slides.length, project.title);
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    zip.file(`slide_${i + 1}.${ext}`, dataUrl.split(',')[1], { base64: true });
  }
  if (onProgress) onProgress({ current: slides.length, total: slides.length, text: 'Compressing archive...' });
  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `${sanitizeFilename(project.title)}_${ext}_slides.zip`);
}

export async function exportToDocx(project) {
  const slides = project.slides || [];
  const children = [];
  children.push(
    new Paragraph({ text: project.title || 'Untitled Presentation', heading: HeadingLevel.TITLE, spacing: { after: 200 } }),
    new Paragraph({ children: [
      new TextRun({ text: 'Generated via ppt-gen / studio', italics: true, color: '666666' }),
      new TextRun({ text: ` • ${slides.length} slides • ${new Date().toLocaleDateString()}`, color: '888888' })
    ], spacing: { after: 400 } })
  );
  slides.forEach((slide, index) => {
    children.push(new Paragraph({
      text: `Slide ${index + 1}: ${slide.title || 'Untitled Slide'}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 }
    }));
    if (slide.subtitle) {
      children.push(new Paragraph({ children: [new TextRun({ text: slide.subtitle, italics: true, color: '888888' })], spacing: { after: 100 } }));
    }
    const contentArr = Array.isArray(slide.content) ? slide.content : (slide.content || '').split('\n');
    contentArr.forEach((line) => {
      if (line && line.trim().length > 0) {
        // Parse **Bold:** lead-in for rich DOCX formatting
        const boldMatch = line.match(/^\*\*(.+?)\*\*:?\s*/);
        if (boldMatch) {
          const boldPart = boldMatch[1];
          const rest = line.substring(boldMatch[0].length);
          children.push(new Paragraph({
            children: [
              new TextRun({ text: `• ${boldPart}: `, bold: true }),
              new TextRun({ text: rest }),
            ],
            spacing: { after: 80 }
          }));
        } else {
          children.push(new Paragraph({ text: `• ${line}`, spacing: { after: 80 } }));
        }
      }
    });
    if (index < slides.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }));
  });
  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${sanitizeFilename(project.title)}.docx`);
}

/** Layout-aware PPTX export */
export async function exportToPptx(project) {
  const slides = project.slides || [];
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  slides.forEach((s) => {
    const t = getT(s);
    const slide = pptx.addSlide();
    const layout = s.layout || 'standard';
    const contentArr = Array.isArray(s.content) ? s.content : (s.content || '').split('\n');
    // strip # from hex colors for pptxgenjs
    const c = (hex) => (hex || '#000000').replace('#', '');

    slide.background = { color: c(t.bg) };

    if (layout === 'headline') {
      slide.addText(s.title || '', {
        x: 0.8, y: 1.5, w: 8.4, h: 1.8,
        fontSize: 36, fontFace: 'Arial', bold: true, color: c(t.heading), align: 'center', valign: 'middle',
      });
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 1.5, y: 3.3, w: 7, h: 0.8,
          fontSize: 16, fontFace: 'Arial', color: c(t.subtitle), align: 'center',
        });
      }
    } else if (layout === 'split') {
      const hasImg = s.image && s.image.url;
      slide.addText(s.title || '', {
        x: 0.5, y: 0.8, w: hasImg ? 4.5 : 3.5, h: 1.8,
        fontSize: 26, fontFace: 'Arial', bold: true, color: c(t.heading), align: 'left', valign: 'middle',
      });
      const bullets = contentArr.filter(Boolean).map(line => ({ text: stripBold(line), options: { fontSize: 13, color: c(t.text), bullet: { code: '2022', color: c(t.bullet) }, breakLine: true } }));
      if (bullets.length) {
        slide.addText(bullets, {
          x: hasImg ? 0.5 : 4.3, y: hasImg ? 2.6 : 0.8, w: hasImg ? 4.6 : 5.2, h: 4.0,
          fontFace: 'Arial', valign: 'top', lineSpacing: 20,
        });
      }
      if (hasImg) {
        try {
          slide.addImage({ path: s.image.url, x: 5.4, y: 0.8, w: 4.2, h: 4.8, rounding: true });
        } catch (e) { /* ignore pptx image fetch error */ }
      }
    } else if (layout === 'cards') {
      slide.addText(s.title || '', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 22, fontFace: 'Arial', bold: true, color: c(t.heading), align: 'center',
      });
      const lines = contentArr.filter(Boolean);
      for (let i = 0; i < 3; i++) {
        const xPos = 0.5 + i * 3.15;
        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos, y: 1.6, w: 2.9, h: 3.0,
          fill: { color: c(t.cardBg) }, line: { color: c(t.border), width: 1 }, rectRadius: 0.15,
        });
        slide.addText(lines[i * 2] || '', {
          x: xPos + 0.2, y: 1.8, w: 2.5, h: 0.6,
          fontSize: 14, fontFace: 'Arial', bold: true, color: c(t.heading),
        });
        slide.addText(stripBold(lines[i * 2 + 1] || ''), {
          x: xPos + 0.2, y: 2.5, w: 2.5, h: 1.8,
          fontSize: 11, fontFace: 'Arial', color: c(t.subtitle), lineSpacing: 18,
        });
      }
    } else if (layout === 'metrics') {
      slide.addText(s.title || '', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 22, fontFace: 'Arial', bold: true, color: c(t.heading), align: 'center',
      });
      const items = contentArr.filter(Boolean).slice(0, 4);
      const count = items.length || 1;
      const boxW = Math.min(2.2, 8.5 / count);
      const totalW = count * boxW + (count - 1) * 0.3;
      const startX = (10 - totalW) / 2;
      items.forEach((line, i) => {
        const parts = line.split(/\s*[—–]\s*/);
        const val = parts[0] || line;
        const label = parts.length >= 2 ? parts.slice(1).join(' — ') : '';
        const xPos = startX + i * (boxW + 0.3);
        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos, y: 2.0, w: boxW, h: 2.2,
          fill: { color: c(t.cardBg) }, line: { color: c(t.border), width: 1 }, rectRadius: 0.15,
        });
        slide.addText(val, {
          x: xPos, y: 2.2, w: boxW, h: 1.0,
          fontSize: 28, fontFace: 'Arial', bold: true, color: c(t.accent), align: 'center', valign: 'middle',
        });
        if (label) {
          slide.addText(label, {
            x: xPos + 0.1, y: 3.2, w: boxW - 0.2, h: 0.8,
            fontSize: 10, fontFace: 'Arial', color: c(t.subtitle), align: 'center', valign: 'top',
          });
        }
      });
    } else {
      // standard
      const hasImg = s.image && s.image.url;
      const textWidth = hasImg ? 4.6 : 8.4;
      slide.addText(s.title || '', {
        x: 0.8, y: 0.6, w: textWidth, h: 1.0,
        fontSize: 28, fontFace: 'Arial', bold: true, color: c(t.heading), align: 'left',
      });
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.8, y: 1.5, w: textWidth, h: 0.5,
          fontSize: 14, fontFace: 'Arial', color: c(t.subtitle), align: 'left',
        });
      }
      const bullets = contentArr.filter(Boolean).map(line => ({ text: stripBold(line), options: { fontSize: 14, color: c(t.text), bullet: { code: '2022', color: c(t.bullet) }, breakLine: true } }));
      if (bullets.length) {
        slide.addText(bullets, {
          x: 0.8, y: 2.1, w: textWidth, h: 4.2,
          fontFace: 'Arial', valign: 'top', lineSpacing: 22,
        });
      }
      if (hasImg) {
        try {
          slide.addImage({ path: s.image.url, x: 5.6, y: 0.8, w: 4.0, h: 4.8, rounding: true });
        } catch (e) { /* ignore pptx image fetch error */ }
      }
    }
  });

  await pptx.writeFile({ fileName: `${sanitizeFilename(project.title)}.pptx` });
}

export function exportToMarkdown(project) {
  const slides = project.slides || [];
  let md = `# ${project.title || 'Untitled Presentation'}\n\n`;
  md += `*Generated with ppt-gen / studio on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
  slides.forEach((slide, idx) => {
    md += `## Slide ${idx + 1}: ${slide.title || 'Untitled'}\n\n`;
    if (slide.subtitle) md += `*${slide.subtitle}*\n\n`;
    const contentArr = Array.isArray(slide.content) ? slide.content : (slide.content || '').split('\n');
    contentArr.filter(Boolean).forEach(line => { md += `- ${line}\n`; });
    md += '\n';
    if (idx < slides.length - 1) md += `---\n\n`;
  });
  downloadText(md, `${sanitizeFilename(project.title)}.md`, 'text/markdown;charset=utf-8');
}

export function exportToJson(project) {
  const schema = {
    $schema: 'https://ppt-gen.studio/schemas/deck-v1.json',
    id: project.id,
    title: project.title,
    updatedAt: project.updatedAt || new Date().toISOString(),
    exportedAt: new Date().toISOString(),
    slideCount: (project.slides || []).length,
    slides: (project.slides || []).map((s, index) => ({
      index: index + 1, id: s.id, layout: s.layout, theme: s.theme,
      title: s.title, subtitle: s.subtitle,
      content: Array.isArray(s.content) ? s.content : (s.content || '').split('\n'),
    }))
  };
  downloadText(JSON.stringify(schema, null, 2), `${sanitizeFilename(project.title)}.json`, 'application/json;charset=utf-8');
}

export function exportToHtml(project) {
  const slides = project.slides || [];
  const slidesData = slides.map(s => ({
    ...s,
    content: Array.isArray(s.content) ? s.content : (s.content || '').split('\n'),
    _theme: getT(s),
  }));
  const title = project.title || 'Presentation';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ppt-gen</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { min-height: 100vh; display: flex; flex-direction: column; }
    .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: #fff; border-bottom: 1px solid #e5e5e5; }
    .brand { font-weight: 800; font-size: 1.1rem; } .brand span { color: #888; font-weight: 400; }
    .stage { flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 32px; transition: background 0.3s; }
    .card { width: 100%; max-width: 960px; aspect-ratio: 16 / 9; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 48px 64px; text-align: center; transition: all 0.3s; overflow: hidden; }
    .slide-title { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; margin-bottom: 16px; line-height: 1.15; letter-spacing: -0.04em; }
    .slide-subtitle { font-size: 1.1rem; line-height: 1.5; margin-bottom: 16px; }
    .slide-content { font-size: 1.1rem; line-height: 1.7; text-align: left; max-width: 720px; }
    .slide-content li { margin-bottom: 6px; }
    .controls { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; background: #fff; border-top: 1px solid #e5e5e5; }
    button { padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 9999px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    button:disabled { opacity: 0.3; cursor: not-allowed; }
    .pill { font-size: 0.9rem; font-weight: 600; color: #777; }
  </style>
</head>
<body>
  <div class="header"><div class="brand">ppt-gen <span>/ studio</span></div><div style="font-weight:600">${title}</div></div>
  <div class="stage" id="stage">
    <div class="card" id="card">
      <div id="slide-title" class="slide-title"></div>
      <div id="slide-subtitle" class="slide-subtitle"></div>
      <div id="slide-content" class="slide-content"></div>
    </div>
  </div>
  <div class="controls">
    <button id="prevBtn" onclick="prev()">← Previous</button>
    <span id="counter" class="pill"></span>
    <button id="nextBtn" onclick="next()">Next →</button>
  </div>
  <script>
    const slides = ${JSON.stringify(slidesData)};
    let cur = 0;
    function render() {
      const s = slides[cur]; const t = s._theme;
      document.getElementById('stage').style.background = t.cardBg;
      const card = document.getElementById('card');
      card.style.background = t.bg; card.style.color = t.text; card.style.border = '1px solid ' + t.border;
      document.getElementById('slide-title').innerText = s.title || '';
      document.getElementById('slide-title').style.color = t.heading;
      document.getElementById('slide-subtitle').innerText = s.subtitle || '';
      document.getElementById('slide-subtitle').style.color = t.subtitle;
      const contentEl = document.getElementById('slide-content');
      contentEl.style.color = t.text;
      const arr = Array.isArray(s.content) ? s.content : [];
      contentEl.innerHTML = '<ul>' + arr.filter(Boolean).map(l => '<li>' + l + '</li>').join('') + '</ul>';
      document.getElementById('counter').innerText = (cur+1) + ' / ' + slides.length;
      document.getElementById('prevBtn').disabled = cur === 0;
      document.getElementById('nextBtn').disabled = cur >= slides.length - 1;
    }
    function next() { if (cur < slides.length - 1) { cur++; render(); } }
    function prev() { if (cur > 0) { cur--; render(); } }
    window.addEventListener('keydown', e => { if (e.key==='ArrowRight'||e.key===' ') next(); if (e.key==='ArrowLeft') prev(); });
    render();
  </script>
</body>
</html>`;

  downloadText(html, `${sanitizeFilename(project.title)}.html`, 'text/html;charset=utf-8');
}
