import { LOGO_SRC } from "./pdfReportGenerator";

// ─── Shared CSS ───────────────────────────────────────────────────────────────

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');

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
    font-size: 10pt; color: var(--slate);
    background: #eef2f7; line-height: 1.6;
  }

  .pw { max-width:210mm; margin:20px auto; background:var(--white); box-shadow:0 4px 24px rgba(0,0,0,.18); border-radius:4px; overflow:hidden; }

  /* ── Document Header ── */
  .dh { display:flex; justify-content:space-between; align-items:center; padding:1.2rem 2.5rem; border-bottom:4px solid var(--navy); gap:1rem; }
  .dh-logo-img { width:65px; height:65px; object-fit:contain; border-radius:8px; border:2px solid var(--navy-bg); background:var(--navy-bg); padding:2px; }
  .dh-name { font-size:14pt; font-weight:800; color:var(--navy); font-family: 'Outfit', sans-serif; letter-spacing: 0.5px; }
  .dh-sub  { font-size:8.5pt; color:var(--muted); margin-top:2px; font-weight:500; }
  .dh-title { text-align:center; flex:1; font-size:18pt; font-weight:800; font-family: 'Outfit', sans-serif; color:var(--navy); letter-spacing:-.3px; line-height:1.2; text-transform: uppercase; }

  .ab { height:4px; background:linear-gradient(90deg,var(--gold) 0%,var(--navy) 55%,transparent 100%); }

  .dc { padding:2rem 2.5rem 3rem; }

  /* ── Contract Typography ── */
  h1.contract-heading { text-align: center; font-size: 16pt; font-weight: 800; color: var(--navy); margin-bottom: 1.5rem; font-family: 'Outfit', sans-serif; letter-spacing: 0.5px; text-decoration: underline; text-decoration-color: var(--gold); text-underline-offset: 6px; }
  
  .intro-text { font-size: 10pt; font-weight: 600; color: var(--slate); margin-bottom: 1.5rem; }
  .section-label { font-size: 10.5pt; font-weight: 700; color: var(--navy); margin-top: 1.5rem; margin-bottom: 0.8rem; font-family: 'Outfit', sans-serif;}
  
  .data-grid { display: grid; grid-template-columns: 200px 1fr; gap: 0.4rem 1rem; margin-bottom: 1.5rem; background: var(--row-alt); padding: 1rem 1.2rem; border-radius: 6px; border-left: 3px solid var(--navy); }
  .dg-label { font-weight: 600; color: var(--muted); font-size: 9.5pt; }
  .dg-value { font-weight: 700; color: var(--navy); font-size: 9.5pt; border-bottom: 1px dotted var(--border); }
  
  .terms-grid { display: grid; grid-template-columns: 20px 200px 1fr; gap: 0.4rem 0.5rem; margin-bottom: 1.5rem; }
  .tg-num { font-weight: 700; color: var(--gold); font-size: 10pt; }
  .tg-label { font-weight: 600; color: var(--muted); font-size: 9.5pt; }
  .tg-value { font-weight: 700; color: var(--navy); font-size: 9.5pt; border-bottom: 1px dotted var(--border); }
  
  .clause { font-size: 9.5pt; color: var(--slate); margin-bottom: 1rem; text-align: justify; line-height: 1.6; }
  
  .signatures-wrap { margin-top: 3rem; display: flex; justify-content: space-between; gap: 2rem; }
  .sig-block { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .sig-line { width: 100%; height: 1px; background: var(--slate); margin-top: 3rem; margin-bottom: 0.5rem; }
  .sig-name { font-weight: 800; color: var(--navy); font-size: 10pt; font-family: 'Outfit', sans-serif; }
  .sig-title { font-size: 8.5pt; color: var(--muted); }
  
  .poea-block { margin-top: 3rem; border: 1px solid var(--border); padding: 1.5rem; border-radius: 6px; background: var(--row-alt); text-align: center; }
  .poea-title { font-weight: 800; color: var(--navy); font-family: 'Outfit', sans-serif; margin-bottom: 2rem; }
  
  /* ── Toolbar ── */
  .tb { position:sticky; top:0; z-index:9999; background:linear-gradient(90deg,#1A365D,#2A4A7F); color:#fff; padding:.6rem 1.6rem; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 12px rgba(0,0,0,.25); font-size:9.5pt; gap:1rem; }

  @page {
    size: A4;
    margin: 1.5cm;
    @bottom-left   { content:"Sakr Manning Agency  •  sakrmanning.com"; font-family:'Inter',sans-serif; font-size:7pt; color:#94a3b8; }
    @bottom-center { content:"Page " counter(page) " of " counter(pages); font-family:'Inter',sans-serif; font-size:7pt; color:#64748b; }
    @bottom-right  { content:"CONFIDENTIAL"; font-family:'Inter',sans-serif; font-size:6.5pt; color:#94a3b8; letter-spacing:1.5px; }
  }

  @media print {
    html, body { background:white!important; }
    .pw  { box-shadow:none!important; border-radius:0!important; margin:0!important; max-width:none!important; }
    .dc  { padding:1.5rem 0 1rem; }
    .dh  { padding:0 0 1rem; }
    .tb  { display:none!important; }
    .signatures-wrap, .poea-block { break-inside: avoid; }
  }
`;

const esc = (val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') val = JSON.stringify(val);
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const buildToolbar = (title) => `
  <div class="tb">
    <div style="display:flex;align-items:center;gap:.65rem;">
      <img src="${LOGO_SRC}" alt="Logo" style="width:34px;height:34px;object-fit:contain;border-radius:6px;background:rgba(255,255,255,.15);padding:2px;" />
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

const buildHeader = () => `
  <div class="dh">
    <div style="display:flex;align-items:center;gap:.85rem;flex-shrink:0;">
      <img src="${LOGO_SRC}" alt="Sakr Manning Agency" class="dh-logo-img" />
      <div>
        <div class="dh-name">Sakr Manning Agency</div>
        <div class="dh-sub">Professional Maritime Crew Management</div>
      </div>
    </div>
    <div class="dh-title">CONTRACT OF EMPLOYMENT</div>
  </div>
  <div class="ab"></div>
`;

export const buildContractPdfHtml = (contract) => {
  // Extracting details with safe fallbacks
  const user = contract.personal_details || contract.user_details || {};
  const travelDocs = contract.travel_documents || {};
  const ship = contract.ship_details || {};
  const company = contract.company_details || {};
  const rank = contract.rank_name || contract.position || "—";
  
  const seafarerName = user.full_name || contract.user_name || contract.applicant_name || "—";
  const dateOfBirth = user.date_of_birth || "—";
  const placeOfBirth = user.Place_Of_Birth || user.place_of_birth || "—";
  const seafarerAddress = contract.contact_details?.address || user.address || "—";
  
  const sirb = travelDocs.seaman_book ? (travelDocs.seaman_book.document_number || travelDocs.seaman_book.number) : null;
  const sirbNumber = sirb || user.seaman_book_no || "—";
  
  // Custom or fallback fields
  const eRegNumber = user.e_reg_no || "—";
  const licenseNumber = user.license_no || "—";
  
  const agentName = "Sakr Manning Agency";
  const shipownerName = company.company_name || "—";
  const shipownerAddress = company.address || company.country || "—";
  const shipManagerName = company.manager_name || company.company_name || "—";
  const shipManagerAddress = company.manager_address || company.address || "—";
  
  const vesselName = ship.ship_name || contract.ship_name || "—";
  const imoNumber = ship.imo_number || "—";
  const grt = ship.grt || "—";
  const yearBuilt = ship.year_built || "—";
  const flag = ship.flag || "—";
  const vesselType = ship.ship_type || "—";
  const classSociety = ship.classification_society || "—";
  
  const contractDuration = contract.duration ? `${contract.duration} months` : "—";
  const pointOfHire = contract.point_of_hire || "—";
  const cbaDetails = contract.cba_details || "N/A";
  
  const today = new Date();
  const day = today.getDate();
  const monthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <title>Contract of Employment - ${esc(seafarerName)}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  ${buildToolbar("Contract of Employment - " + seafarerName)}
  <div class="pw">
    ${buildHeader()}
    <div class="dc">
      
      <div class="intro-text" style="text-align: center; margin-bottom: 2rem;">
        KNOW ALL MEN BY THIS PRESENTS:
      </div>
      
      <div class="intro-text">
        This Contract, entered into voluntarily by and between:
      </div>

      <div class="data-grid">
        <div class="dg-label">Name of Seafarer:</div><div class="dg-value">${esc(seafarerName)}</div>
        <div class="dg-label">Date of Birth:</div><div class="dg-value">${esc(dateOfBirth)}</div>
        <div class="dg-label">Place of Birth:</div><div class="dg-value">${esc(placeOfBirth)}</div>
        <div class="dg-label">Address:</div><div class="dg-value">${esc(seafarerAddress)}</div>
        <div class="dg-label">SIRB No.:</div><div class="dg-value">${esc(sirbNumber)}</div>
        <div class="dg-label">E-Reg. No.:</div><div class="dg-value">${esc(eRegNumber)}</div>
        <div class="dg-label">License No.:</div><div class="dg-value">${esc(licenseNumber)}</div>
      </div>
      
      <div class="intro-text" style="margin-left: 1.2rem;">
        hereinafter referred to as the <strong>Seafarer</strong>,
      </div>
      
      <div class="intro-text" style="text-align: center;">
        and
      </div>

      <div class="data-grid">
        <div class="dg-label">Name of Agent:</div><div class="dg-value">${esc(agentName)}</div>
        <div class="dg-label">Name of Principal / Shipowner:</div><div class="dg-value">${esc(shipownerName)}</div>
        <div class="dg-label">Address of Principal / Shipowner:</div><div class="dg-value">${esc(shipownerAddress)}</div>
        <div class="dg-label">Name of Vessel Manager:</div><div class="dg-value">${esc(shipManagerName)}</div>
        <div class="dg-label">Address of Vessel Manager:</div><div class="dg-value">${esc(shipManagerAddress)}</div>
      </div>

      <div class="intro-text" style="margin-left: 1.2rem; margin-bottom: 0.8rem;">
        for the following vessel:
      </div>

      <div class="data-grid">
        <div class="dg-label">Name of Vessel:</div><div class="dg-value">${esc(vesselName)}</div>
        <div class="dg-label">IMO Number:</div><div class="dg-value">${esc(imoNumber)}</div>
        <div class="dg-label">Gross Registered Tonnage (GRT):</div><div class="dg-value">${esc(grt)}</div>
        <div class="dg-label">Year Built:</div><div class="dg-value">${esc(yearBuilt)}</div>
        <div class="dg-label">Flag:</div><div class="dg-value">${esc(flag)}</div>
        <div class="dg-label">Type of Vessel:</div><div class="dg-value">${esc(vesselType)}</div>
        <div class="dg-label">Classification Society:</div><div class="dg-value">${esc(classSociety)}</div>
      </div>

      <div class="intro-text" style="margin-left: 1.2rem;">
        hereinafter referred to as the <strong>Employer</strong>,
      </div>

      <h1 class="contract-heading" style="margin-top: 2rem;">WITNESSETH</h1>

      <div class="intro-text">
        That the seafarer shall be employed on board under the following terms and conditions:
      </div>

      <div class="terms-grid">
        <div class="tg-num">1.1</div><div class="tg-label">Duration of Contract:</div><div class="tg-value">${esc(contractDuration)}</div>
        <div class="tg-num">1.2</div><div class="tg-label">Position:</div><div class="tg-value">${esc(rank)}</div>
        <div class="tg-num">1.3</div><div class="tg-label">Point of Hire:</div><div class="tg-value">${esc(pointOfHire)}</div>
        <div class="tg-num">1.4</div><div class="tg-label">Collective Bargaining Agreement, if any:</div><div class="tg-value">${esc(cbaDetails)}</div>
      </div>

      <div class="clause">
        The terms and conditions in accordance with Governing Board Resolution No. 09, and Memorandum Circular No. 10, both Series of 2010, and Memorandum Circular No. 34, Series of 2020 (Compliance with the 2018 Amendments to the Maritime Labour Convention, 2006) shall be strictly and faithfully observed.
      </div>
      
      <div class="clause">
        Any alterations or changes, in any part of this Contract shall be evaluated, verified, processed and approved by the Philippine Overseas Employment Administration (POEA). Upon approval, the same shall be deemed an integral part of the Standard Terms and Conditions governing the Employment of Filipino Seafarers On-Board Ocean Going Vessels.
      </div>
      
      <div class="clause">
        Violations of the Terms and Conditions of this Contract with its approved addendum shall be ground for disciplinary action against the erring party.
      </div>

      <div class="intro-text" style="margin-top: 2rem;">
        IN WITNESS WHEREOF the parties have hereto set their hands this <strong>${day}</strong> day of <strong>${monthYear}</strong> at <strong>Alexandria</strong>, Egypt.
      </div>

      <div class="signatures-wrap">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${esc(seafarerName)}</div>
          <div class="sig-title">Seafarer</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">Capt. Khaled Sakr</div>
          <div class="sig-title">General Manager</div>
          <div class="sig-title">For the Employer</div>
        </div>
      </div>

      <div class="poea-block">
        <div class="poea-title">Verified and approved by the POEA:</div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4rem;">
          <div style="text-align: left; width: 45%;">
            <div style="border-bottom: 1px solid var(--slate); margin-bottom: 0.5rem; height: 1.5rem;"></div>
            <div style="font-weight: 600; font-size: 8.5pt;">Date</div>
          </div>
          <div style="text-align: center; width: 45%;">
            <div style="border-bottom: 1px solid var(--slate); margin-bottom: 0.5rem; height: 1.5rem;"></div>
            <div style="font-weight: 600; font-size: 8.5pt;">Name and Signature of POEA Official</div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <script>window.addEventListener("load",()=>setTimeout(()=>window.print(),800));</script>
</body>
</html>`;
};

export const generateContractPdf = (contract) => {
  try {
    const html = buildContractPdfHtml(contract);
    const win = window.open('', '_blank', 'width=1050,height=850,scrollbars=yes');
    if (!win) { 
      console.error('Popup blocked — allow popups for this site.'); 
      return false; 
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  } catch (err) {
    console.error('Contract PDF generation failed:', err);
    return false;
  }
};

export default { generateContractPdf, buildContractPdfHtml };
