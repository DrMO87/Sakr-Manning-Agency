/**
 * pdfReportGenerator.jsx  — v4 (real logo embedded)
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a print-ready HTML document opened in a new browser tab.
 * The official Sakr Manning Agency logo is embedded as a Base64 data URI
 * so it renders perfectly offline and in WeasyPrint / Puppeteer.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Logo (Base64 embedded — works offline & in WeasyPrint) ──────────────────
// Vite will bundle this import; the Base64 constant is the fallback for SSR.
import _LOGO_IMPORT from '../assets/icons/logo.png';

// Runtime logo: prefer the Vite-bundled URL; fall back to Base64 for WeasyPrint
const LOGO_SRC = (typeof _LOGO_IMPORT === 'string' && _LOGO_IMPORT)
  ? _LOGO_IMPORT
  : 'data:image/png;base64,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';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const esc = (val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') val = JSON.stringify(val);
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const todayStr = () =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

const refNum = () =>
  `SMA-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

// ─── Shared CSS ───────────────────────────────────────────────────────────────

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;600;700;800&display=swap');

  :root {
    --navy:     #1A365D; --navy-mid: #2A4A7F; --navy-bg: #EBF0F8;
    --gold:     #C9A84C; --gold-bg:  #FDF6E3;
    --teal:     #0D7490;
    --slate:    #334155; --muted:    #64748B;
    --border:   #E2E8F0; --row-alt:  #F8FAFC;
    --white:    #FFFFFF; --r:        5px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-size: 10.5pt; color: var(--slate);
    background: #eef2f7; line-height: 1.55;
  }

  .pw { max-width:210mm; margin:20px auto; background:var(--white); box-shadow:0 4px 24px rgba(0,0,0,.18); border-radius:4px; overflow:hidden; }

  /* ── Document Header ── */
  .dh { display:flex; justify-content:space-between; align-items:center; padding:.85rem 1.6rem .75rem; border-bottom:3px solid var(--navy); gap:.75rem; }
  .dh-logo-img { width:52px; height:52px; object-fit:contain; border-radius:8px; border:2px solid var(--navy-bg); background:var(--navy-bg); padding:2px; }
  .dh-name { font-size:12pt; font-weight:700; color:var(--navy); letter-spacing:.3px; }
  .dh-sub  { font-size:7.5pt; color:var(--muted); margin-top:2px; }
  .dh-title { text-align:center; flex:1; font-size:15pt; font-weight:800; color:var(--navy); letter-spacing:-.3px; line-height:1.2; }
  .dh-tag  { font-size:8pt; color:var(--muted); margin-top:3px; }
  .dh-meta { text-align:right; font-size:8pt; color:var(--muted); line-height:1.85; flex-shrink:0; }
  .dh-meta strong { color:var(--slate); font-weight:600; }

  .ab { height:3px; background:linear-gradient(90deg,var(--gold) 0%,var(--navy) 55%,transparent 100%); }

  .dc { padding:1rem 1.6rem 1.5rem; }

  /* ── Summary bar ── */
  .summary-bar { display:flex; align-items:center; gap:.5rem; background:var(--gold-bg); border-left:4px solid var(--gold); border-radius:var(--r); padding:.45rem .9rem; margin-bottom:.55rem; font-size:9.5pt; color:var(--slate); flex-wrap:wrap; }
  .summary-bar strong { color:var(--navy); }

  /* ── Stat pills ── */
  .stat-pills { display:flex; gap:.45rem; margin-bottom:.65rem; flex-wrap:wrap; }
  .sp { display:flex; align-items:center; gap:.35rem; background:var(--navy-bg); border:1px solid var(--border); border-radius:99px; padding:.2rem .7rem; font-size:8.5pt; color:var(--navy); white-space:nowrap; }
  .sp-n { font-weight:800; font-size:10pt; color:var(--navy); }
  .sp-l { font-weight:500; color:var(--muted); font-size:8pt; }

  /* ── Section heading ── */
  .sh { display:flex; align-items:center; gap:.4rem; font-size:9pt; font-weight:700; color:var(--navy); margin:.8rem 0 .35rem; padding-bottom:.28rem; border-bottom:1.5px solid var(--border); text-transform:uppercase; letter-spacing:.4px; }
  .sh::before { content:''; width:4px; height:14px; background:var(--gold); border-radius:2px; flex-shrink:0; }

  /* ── Data table ── */
  .dt { width:100%; border-collapse:collapse; font-size:9pt; table-layout:fixed; }
  .dt thead tr { background:var(--navy); color:var(--white); }
  .dt thead th { padding:8px 10px; text-align:left; font-weight:600; font-size:8.5pt; letter-spacing:.4px; text-transform:uppercase; border:none; word-break:break-word; vertical-align:middle; }
  .dt tbody tr { border-bottom:1px solid var(--border); }
  .dt tbody tr:nth-child(even) { background:var(--row-alt); }
  .dt tbody tr:last-child { border-bottom:none; }
  .dt tbody td { padding:6px 10px; color:var(--slate); vertical-align:top; font-size:9pt; word-break:break-word; overflow-wrap:break-word; }
  .dt tbody td:first-child { font-weight:500; color:var(--navy-mid); }
  .dt .nd { text-align:center; color:var(--muted); font-style:italic; padding:20px; }

  /* ── Detail grid ── */
  .dg { display:grid; grid-template-columns:repeat(3,1fr); gap:.4rem .6rem; margin-top:.35rem; }
  .di { background:var(--row-alt); border:1px solid var(--border); border-radius:var(--r); padding:.45rem .7rem; break-inside:avoid; }
  .di-l { font-size:7pt; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
  .di-v { font-size:9.5pt; font-weight:500; color:var(--navy); word-break:break-word; }
  .di--full { grid-column:1/-1; }

  /* ── GM Signatory (right-aligned, end of doc) ── */
  .sig-wrap { margin-top:2.5rem; display:flex; justify-content:flex-end; break-inside:avoid; padding-top:.5rem; border-top:1px solid var(--border); }
  .sig { text-align:center; width:200px; }
  .sig-space { height:40px; }
  .sig-line { height:1px; background:var(--navy); margin-bottom:.4rem; }
  .sig-name { font-size:9.5pt; font-weight:700; color:var(--navy); }
  .sig-title { font-size:8pt; color:var(--muted); margin-top:2px; font-style:italic; }

  /* ── Footer ── */
  .df { display:flex; justify-content:space-between; align-items:center; padding:.55rem 1.6rem; border-top:1.5px solid var(--border); background:var(--row-alt); font-size:7.5pt; color:var(--muted); margin-top:1.5rem; }
  .df a { color:var(--teal); text-decoration:none; font-weight:500; }
  .df-b { font-weight:700; color:var(--navy); }

  /* ── Watermark ── */
  .wm { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-35deg); font-size:72pt; font-weight:900; color:rgba(26,54,93,.04); pointer-events:none; white-space:nowrap; z-index:0; letter-spacing:8px; user-select:none; }

  /* ── Cover page ── */
  .cover { min-height:297mm; display:flex; flex-direction:column; align-items:center; justify-content:center; background:linear-gradient(160deg,#1A365D 0%,#2A4A7F 55%,#0D7490 100%); color:#fff; text-align:center; padding:4rem 3rem; position:relative; break-after:page; }

  /* ── Toolbar ── */
  .tb { position:sticky; top:0; z-index:9999; background:linear-gradient(90deg,#1A365D,#2A4A7F); color:#fff; padding:.6rem 1.6rem; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 12px rgba(0,0,0,.25); font-size:9.5pt; gap:1rem; }

  @page {
    size: A4;
    margin: 1.8cm 1.8cm 2.2cm;
    @bottom-left   { content:"Sakr Manning Agency  •  sakrmanning.com"; font-family:'Inter',sans-serif; font-size:7pt; color:#94a3b8; }
    @bottom-center { content:"Page " counter(page) " of " counter(pages); font-family:'Inter',sans-serif; font-size:7pt; color:#64748b; }
    @bottom-right  { content:"CONFIDENTIAL"; font-family:'Inter',sans-serif; font-size:6.5pt; color:#94a3b8; letter-spacing:1.5px; }
  }

  @media print {
    html, body { background:white!important; }
    .pw  { box-shadow:none!important; border-radius:0!important; margin:0!important; max-width:none!important; }
    .dc  { padding:.5rem 0 1rem; }
    .dh  { padding:0 0 .75rem; }
    .df  { padding:.5rem 0; }
    .tb  { display:none!important; }
    .cover { break-after:page; }
    .page-break-before { break-before:page; }
    .dt  { break-inside:auto; }
    .dt tbody tr { break-inside:avoid; }
    .summary-bar,.stat-pills,.di,.sig-wrap { break-inside:avoid; }
  }
`;

// ─── Sub-builders ─────────────────────────────────────────────────────────────

const buildCoverPage = ({ title, subtitle = '', date, refNo, logoSrc }) => `
  <div class="cover">
    <img src="${logoSrc}" alt="Sakr Manning Agency Logo"
         style="width:110px;height:110px;object-fit:contain;margin-bottom:1.75rem;
                filter:drop-shadow(0 4px 16px rgba(0,0,0,.35)) brightness(1.15);
                border-radius:12px;" />
    <p style="font-size:10pt;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:.5rem;font-weight:500;">Sakr Manning Agency</p>
    <h1 style="font-size:26pt;font-weight:800;line-height:1.2;color:#fff;margin-bottom:1rem;max-width:580px;">${esc(title)}</h1>
    ${subtitle ? `<p style="font-size:11pt;color:rgba(255,255,255,.75);margin-bottom:2rem;max-width:480px;">${esc(subtitle)}</p>` : ''}
    <div style="width:80px;height:3px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);border-radius:2px;margin:1.25rem auto;"></div>
    <div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:1rem 2rem;display:inline-block;text-align:left;min-width:280px;">
      <div style="font-size:9pt;color:rgba(255,255,255,.65);margin-bottom:.3rem;"><span style="font-weight:700;color:#C9A84C;">Date:</span> ${esc(date)}</div>
      <div style="font-size:9pt;color:rgba(255,255,255,.65);"><span style="font-weight:700;color:#C9A84C;">Ref:</span> ${esc(refNo)}</div>
    </div>
    <div style="position:absolute;bottom:2rem;right:2rem;border:1.5px solid rgba(201,168,76,.5);color:rgba(201,168,76,.7);font-size:7.5pt;padding:3px 12px;border-radius:4px;letter-spacing:2px;font-weight:700;text-transform:uppercase;">Confidential</div>
  </div>
`;

const buildDocHeader = ({ title, date, refNo, logoSrc }) => `
  <div class="dh">
    <div style="display:flex;align-items:center;gap:.65rem;flex-shrink:0;">
      <img src="${logoSrc}" alt="Sakr Manning Agency" class="dh-logo-img" />
      <div>
        <div class="dh-name">Sakr Manning Agency</div>
        <div class="dh-sub">Professional Maritime Crew Management</div>
      </div>
    </div>
    <div style="flex:1;text-align:center;">
      <div class="dh-title">${esc(title)}</div>
      <div class="dh-tag">Official Dashboard Report</div>
    </div>
    <div class="dh-meta">
      <div><strong>Date:</strong> ${esc(date)}</div>
      <div><strong>Ref:</strong> ${esc(refNo)}</div>
      <div><strong>System:</strong> Dashboard v2</div>
    </div>
  </div>
  <div class="ab"></div>
`;

const buildDocFooter = (logoSrc) => `
  <div class="df">
    <div style="display:flex;align-items:center;gap:.5rem;">
      <img src="${logoSrc}" alt="" style="width:20px;height:20px;object-fit:contain;opacity:.6;" />
      <a href="https://sakrmanning.com">sakrmanning.com</a> &nbsp;|&nbsp; info@sakrmanning.com
    </div>
    <div><span class="df-b">Sakr Manning Agency</span> &mdash; &copy; ${new Date().getFullYear()}</div>
    <div>Developed by <strong>Code Square</strong></div>
  </div>
`;

const buildToolbar = (title, logoSrc) => `
  <div class="tb">
    <div style="display:flex;align-items:center;gap:.65rem;">
      <img src="${logoSrc}" alt="Logo" style="width:34px;height:34px;object-fit:contain;border-radius:6px;background:rgba(255,255,255,.15);padding:2px;" />
      <div>
        <div style="font-weight:700;font-size:10.5pt;">${esc(title)}</div>
        <div style="font-size:7.5pt;opacity:.7;">PDF Preview — Click "Print / Save as PDF" to export</div>
      </div>
    </div>
    <div style="display:flex;gap:.6rem;">
      <button onclick="window.print()" style="background:#C9A84C;color:#1A365D;border:none;padding:7px 18px;border-radius:5px;font-weight:700;font-size:9.5pt;cursor:pointer;">🖨 Print / Save as PDF</button>
      <button onclick="window.close()" style="background:rgba(255,255,255,.15);color:#fff;border:none;padding:7px 14px;border-radius:5px;font-size:9.5pt;cursor:pointer;">✕ Close</button>
    </div>
  </div>
`;

const buildGMSignature = (logoSrc) => `
  <div class="sig-wrap">
    <div class="sig">
      <div class="sig-space"></div>
      <div class="sig-line"></div>
      <div style="display:flex;align-items:center;justify-content:center;gap:.4rem;margin-bottom:2px;">
        <img src="${logoSrc}" alt="" style="width:18px;height:18px;object-fit:contain;opacity:.7;" />
        <div class="sig-name">General Manager</div>
      </div>
      <div class="sig-title">Sakr Manning Agency</div>
    </div>
  </div>
`;

// ─── Public: buildPdfHtml ─────────────────────────────────────────────────────

export const buildPdfHtml = (title, columns, data, opts = {}) => {
  const {
    showCover        = false,
    showSummaryStats = true,
    date             = todayStr(),
    refNo            = refNum(),
    watermark        = false,
    autoPrint        = false,
    logoSrc          = LOGO_SRC,
  } = opts;

  const colPct = columns.length ? Math.floor(100 / columns.length) : 100;
  const headerCells = columns.map((c) =>
    `<th style="width:${colPct}%">${esc(c.header)}</th>`
  ).join('');

  const bodyRows = data.length
    ? data.map((row) => {
        const cells = columns.map((col) => {
          let val = col.render ? col.render(row) : row[col.key];
          if (val === null || val === undefined) val = '—';
          if (typeof val === 'object') val = JSON.stringify(val);
          return `<td>${esc(val)}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('\n')
    : `<tr><td colspan="${columns.length}" class="nd">No records found for this report.</td></tr>`;

  const statPills = showSummaryStats ? `
    <div class="stat-pills">
      <div class="sp"><span class="sp-n">${data.length}</span><span class="sp-l">Total Records</span></div>
      <div class="sp"><span class="sp-n">${columns.length}</span><span class="sp-l">Columns</span></div>
      <div class="sp"><span class="sp-n">${date}</span><span class="sp-l">Report Date</span></div>
      <div class="sp"><span class="sp-n">${refNo}</span><span class="sp-l">Ref</span></div>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <title>${esc(title)} — Sakr Manning Agency</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  ${watermark ? '<div class="wm">SAKR MANNING</div>' : ''}
  ${buildToolbar(title, logoSrc)}
  ${showCover ? buildCoverPage({ title, date, refNo, logoSrc }) : ''}
  <div class="pw">
    ${buildDocHeader({ title, date, refNo, logoSrc })}
    <div class="dc">

      ${statPills}
      <div class="sh">Report Data</div>
      <table class="dt">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      ${buildGMSignature(logoSrc)}
    </div>
    ${buildDocFooter(logoSrc)}
  </div>
  ${autoPrint ? '<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),800));<\/script>' : ''}
</body>
</html>`;
};

// ─── Public: generateStatPdfReport ───────────────────────────────────────────

export const generateStatPdfReport = (title, columns, data, opts = {}) => {
  try {
    const html = buildPdfHtml(title, columns, data, { logoSrc: LOGO_SRC, ...opts });
    const win  = window.open('', '_blank', 'width=1050,height=850,scrollbars=yes');
    if (!win) { console.error('Popup blocked — allow popups for this site.'); return false; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  } catch (err) {
    console.error('PDF generation failed:', err);
    return false;
  }
};

// ─── Public: generateDetailPdfReport ─────────────────────────────────────────

export const generateDetailPdfReport = (title, sections, data, opts = {}) => {
  const {
    showCover = true,
    watermark = false,
    date      = todayStr(),
    refNo     = refNum(),
    autoPrint = false,
    logoSrc   = LOGO_SRC,
  } = opts;

  const sectionsHtml = sections.map((sec) => `
    <div class="sh">${esc(sec.heading)}</div>
    <div class="dg">
      ${sec.fields.map((f) => `
        <div class="di${f.fullWidth ? ' di--full' : ''}">
          <div class="di-l">${esc(f.label)}</div>
          <div class="di-v">${esc(f.render ? f.render(data) : (data[f.key] ?? '—'))}</div>
        </div>`).join('')}
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <title>${esc(title)} — Sakr Manning Agency</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  ${watermark ? '<div class="wm">SAKR MANNING</div>' : ''}
  ${buildToolbar(title, logoSrc)}
  ${showCover ? buildCoverPage({ title, date, refNo, logoSrc }) : ''}
  <div class="pw">
    ${buildDocHeader({ title, date, refNo, logoSrc })}
    <div class="dc">
      ${sectionsHtml}
      ${buildGMSignature(logoSrc)}
    </div>
    ${buildDocFooter(logoSrc)}
  </div>
  ${autoPrint ? '<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),800));<\/script>' : ''}
</body>
</html>`;

  try {
    const win = window.open('', '_blank', 'width=1050,height=850,scrollbars=yes');
    if (!win) { console.error('Popup blocked.'); return false; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  } catch (err) {
    console.error('Detail PDF generation failed:', err);
    return false;
  }
};

export { LOGO_SRC };
export default { generateStatPdfReport, generateDetailPdfReport, buildPdfHtml, LOGO_SRC };
