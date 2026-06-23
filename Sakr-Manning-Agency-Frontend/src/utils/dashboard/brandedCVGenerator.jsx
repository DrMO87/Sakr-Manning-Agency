/**
 * brandedCVGenerator.jsx — v3 (Premium Tabular Design)
 * Official Sakr Manning Agency Seafarer Employment Application
 */

import _LOGO_IMPORT from '../../assets/icons/logo.png';
import { getMediaUrl } from "../fileHelpers";

const LOGO_SRC = typeof _LOGO_IMPORT === 'string' && _LOGO_IMPORT ? _LOGO_IMPORT : '';
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const esc = (v) => {
  if (v == null) return '';
  return String(v)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
};

const fmt = (val) => esc(val) || '\u2014';
const todayStr = () => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CV_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  :root {
    --navy: #0F172A;
    --navy-mid: #1E293B;
    --navy-light: #F8FAFC;
    --slate: #334155;
    --muted: #64748B;
    --border: #E2E8F0;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: 'Inter', sans-serif; font-size: 9.5pt; color: var(--slate); background: #f1f5f9; line-height: 1.5; }
  
  .pw { max-width: 210mm; margin: 20px auto; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 12mm; border-radius: 12px; position: relative; z-index: 1; }
  
  /* Watermark */
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70%; opacity: 0.04; z-index: -1; pointer-events: none; }
  .watermark img { width: 100%; height: auto; object-fit: contain; }

  /* Top Header Box */
  .hdr-box { border: 2px solid var(--border); border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; background: #fff; }
  .hdr-left { display: flex; flex-direction: column; gap: 2px; }
  .hdr-title { font-size: 16pt; font-weight: 800; color: var(--navy); letter-spacing: 1px; }
  .hdr-sub1 { font-size: 8.5pt; font-weight: 600; color: var(--muted); letter-spacing: 0.5px; }
  .hdr-sub2 { font-size: 8.5pt; color: var(--slate); margin-top: 4px; }
  .hdr-sub3 { font-size: 8.5pt; color: var(--slate); }
  
  .hdr-photo { width: 95px; height: 115px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #fff; }
  .hdr-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }

  /* Sections */
  .sh { background: var(--navy-light); color: var(--navy); border-left: 4px solid var(--navy); padding: 8px 12px; font-size: 10pt; font-weight: 700; text-transform: uppercase; margin-top: 18px; margin-bottom: 10px; border-radius: 0 6px 6px 0; }
  
  /* Field Grids */
  .fg { display: grid; border-left: 1px solid var(--border); border-top: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
  .fg-2 { grid-template-columns: repeat(2, 1fr); }
  .fg-3 { grid-template-columns: repeat(3, 1fr); }
  .fg-4 { grid-template-columns: repeat(4, 1fr); }
  .fg-5 { grid-template-columns: repeat(5, 1fr); }
  .fg-6 { grid-template-columns: repeat(6, 1fr); }
  
  .fi { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 6px 10px; background: rgba(255,255,255,0.8); }
  .fi-bg { background: var(--navy-light); }
  .fi-l { font-size: 8pt; color: var(--muted); margin-bottom: 2px; }
  .fi-v { font-size: 9pt; font-weight: 600; color: var(--navy); word-break: break-word; }
  
  /* Tables */
  .dt { width: 100%; border-collapse: collapse; margin-top: 4px; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
  .dt thead th { background: var(--navy-light); color: var(--navy); font-weight: 600; font-size: 8.5pt; padding: 6px 10px; text-align: left; border: 1px solid var(--border); }
  .dt tbody td { padding: 6px 10px; font-size: 9pt; font-weight: 500; color: var(--slate); border: 1px solid var(--border); vertical-align: top; }
  .nd { text-align: center; color: var(--muted); font-style: italic; font-weight: 400; padding: 14px !important; }

  .checkbox-group { display: flex; gap: 8px; align-items: center; margin-top: 2px; }
  .chk { display: flex; align-items: center; gap: 6px; font-size: 8.5pt; font-weight: 500; color: var(--navy); }
  .box { width: 12px; height: 12px; border: 1.5px solid var(--muted); display: inline-block; border-radius: 2px; }
  .box.checked { background: var(--navy); border-color: var(--navy); position: relative; }
  .box.checked::after { content: ''; position: absolute; left: 3px; top: 1px; width: 3px; height: 6px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }

  /* Toolbar */
  .tb { position: sticky; top: 0; z-index: 9999; background: #0F172A; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 0 0 12px 12px; margin-bottom: 12px; }
  .tb button { background: #fff; color: #0F172A; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 9.5pt; transition: all 0.2s; }
  .tb button:hover { background: #E2E8F0; }

  @page {
    size: A4; margin: 10mm;
    @bottom-center { content: "Sakr Manning Agency — Confidential Seafarer Application — Page " counter(page) " of " counter(pages); font-family: 'Inter', sans-serif; font-size: 7.5pt; color: var(--muted); }
  }
  @media print {
    html, body { background: white !important; }
    .pw { box-shadow: none !important; margin: 0 !important; max-width: none !important; padding: 0 !important; border-radius: 0 !important; }
    .tb { display: none !important; }
    .watermark { opacity: 0.05 !important; }
    .sh, .fi-bg, .dt thead th, .box.checked, .hdr-box { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
`;

// ─── Build HTML ───────────────────────────────────────────────────────────────

export const buildCvHtml = (submission, opts = {}) => {
  const sa = submission?.seafarer_application || {};
  const personal = sa['1_personal_details'] || {};
  const education = sa['2_education_qualifications'] || {};
  const contact = sa['3_contact_details'] || {};
  const docs = sa['6_travel_documents'] || {};
  const kin = sa['4_next_of_kin_emergency_contact'] || {};
  
  const certs = Array.isArray(sa['5_professional_qualification_certificate_of_competency']) ? sa['5_professional_qualification_certificate_of_competency'] : [];
  const health = Array.isArray(sa['7_health_certificates_vaccinations']) ? sa['7_health_certificates_vaccinations'] : [];
  const sea = Array.isArray(sa['9_complete_sea_service_details']) ? sa['9_complete_sea_service_details'] : [];
  const courses = Array.isArray(sa['8_marine_courses']) ? sa['8_marine_courses'] : [];
  const refs = Array.isArray(sa['10_references']) ? sa['10_references'] : [];
  const decl = sa['11_declaration'] || {};

  const adminDocs = opts.adminDocs || [];
  const adminDocsRows = adminDocs.length ? adminDocs.map(d => `<tr><td>${fmt(d.title)}</td><td>${fmt(new Date(d.created_at).toLocaleDateString())}</td></tr>`).join('') : `<tr><td colspan="2" class="nd">No admin attachments found.</td></tr>`;

  const name = esc(submission?.user_name || personal?.full_name || 'Applicant');
  const pos = esc(submission?.position_name || '—');
  const refId = esc(submission?.generated_id || 'PENDING');
  const date = todayStr();
  const avatarRaw = submission?.user?.profile_image || submission?.profile_image || '';
  const avatar = avatarRaw ? getMediaUrl(avatarRaw) : DEFAULT_AVATAR;

  // Language checkboxes builder
  const langBox = (langObj) => {
    const l = langObj || {};
    return `
      <div class="chk"><div class="box ${l.fluent ? 'checked' : ''}"></div> Fluent</div>
      <div class="chk"><div class="box ${l.good ? 'checked' : ''}"></div> Good</div>
      <div class="chk"><div class="box ${l.average ? 'checked' : ''}"></div> Avg</div>
      <div class="chk"><div class="box ${l.poor ? 'checked' : ''}"></div> Poor</div>
    `;
  };

  const certRows = certs.length ? certs.map(c => `<tr><td>${fmt(c.certificate_name)}</td><td>${fmt(c.number)}</td><td>${fmt(c.issue_date)}</td><td>${fmt(c.expiry_date)}</td><td>${fmt(c.issued_by)}</td><td>${fmt(c.issued_at)}</td></tr>`).join('') : `<tr><td colspan="6" class="nd">No professional qualifications recorded.</td></tr>`;
  
  const healthRows = health.length ? health.map(h => `<tr><td>${fmt(h.certificate_type)}</td><td>${fmt(h.number)}</td><td>${fmt(h.issue_date)}</td><td>${fmt(h.expiry_date)}</td><td>${fmt(h.first_dose)}</td><td>${fmt(h.last_dose)}</td><td>${fmt(h.issued_by)}</td><td>${fmt(h.issued_at)}</td></tr>`).join('') : `<tr><td colspan="8" class="nd">No health certificates recorded.</td></tr>`;

  const seaRows = sea.length ? sea.map(s => `<tr><td>${fmt(s.company_name)}</td><td>${fmt(s.rank)}</td><td>${fmt(s.vessel_name_imo)}</td><td>${fmt(s.flag)}</td><td>${fmt(s.sign_on)}</td><td>${fmt(s.sign_off)}</td><td>${fmt(s.period)}</td><td>${fmt(s.vessel_type)}</td></tr>`).join('') : `<tr><td colspan="8" class="nd">No sea service recorded.</td></tr>`;

  const courseRows = courses.length ? courses.map(c => `<tr><td>${fmt(c.course_name)}</td><td>${fmt(c.number)}</td><td>${fmt(c.issue_date)}</td><td>${fmt(c.expiry_date)}</td><td>${fmt(c.issued_by)}</td><td>${fmt(c.issued_at)}</td></tr>`).join('') : `<tr><td colspan="6" class="nd">No marine courses recorded.</td></tr>`;

  const refRows = refs.length ? refs.map((r, i) => `<tr><td>${i+1}</td><td>${fmt(r.company_country)}</td><td>${fmt(r.position)}</td><td>${fmt(r.name)}</td><td>${fmt(r.tel)}</td><td>${fmt(r.email)}</td></tr>`).join('') : `<tr><td colspan="6" class="nd">No references recorded.</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Application — ${name}</title>
  <style>${CV_STYLES}</style>
</head>
<body>
  <div class="tb">
    <div><strong>Sakr Manning Agency</strong> | Seafarer Employment Application</div>
    <div style="display:flex;gap:10px;">
      <button onclick="window.print()">Print / Save as PDF</button>
      <button onclick="window.close()" style="background:rgba(255,255,255,0.2);color:#fff;">Close</button>
    </div>
  </div>

  <div class="pw">
    <div class="watermark"><img src="${LOGO_SRC}" alt="watermark" /></div>
    
    <!-- HEADER -->
    <div class="hdr-box">
      <div class="hdr-left" style="display:flex; flex-direction:row; align-items:center; gap:16px;">
        <img src="${LOGO_SRC}" alt="Logo" style="width:85px; height:85px; object-fit:contain;" />
        <div style="display:flex; flex-direction:column; gap:2px;">
          <div class="hdr-title">SAKR MANNING AGENCY</div>
          <div class="hdr-sub1">FOR RECRUITING EGYPTIAN LABOR ABROAD</div>
          <div class="hdr-sub2">Crewing Management Manual — Seafarer Employment Application</div>
          <div class="hdr-sub3">Rev: 13 | Page: 1</div>
          <div class="hdr-sub3">Contract Ref: ${refId} | Generated: ${date}</div>
        </div>
      </div>
      <div class="hdr-photo" style="padding:4px;">
        <img src="${esc(avatar)}" alt="Photo" style="border-radius:4px;" />
      </div>
    </div>

    <!-- APPLICATION DETAILS -->
    <div class="sh">APPLICATION DETAILS</div>
    <div class="fg fg-4">
      <div class="fi"><div class="fi-l">Position Applied For</div><div class="fi-v">${pos}</div></div>
      <div class="fi"><div class="fi-l">Assigned Code</div><div class="fi-v">—</div></div>
      <div class="fi"><div class="fi-l">Register Code</div><div class="fi-v">—</div></div>
      <div class="fi"><div class="fi-l">Other Position</div><div class="fi-v">—</div></div>
      
      <div class="fi"><div class="fi-l">Issue Date</div><div class="fi-v">—</div></div>
      <div class="fi"><div class="fi-l">Revision Date</div><div class="fi-v">${date}</div></div>
      <div class="fi"><div class="fi-l">Register Date</div><div class="fi-v">—</div></div>
      <div class="fi"><div class="fi-l">Available From</div><div class="fi-v">—</div></div>
    </div>

    <!-- 1. PERSONAL DETAILS -->
    <div class="sh">1. PERSONAL DETAILS</div>
    <div class="fg fg-4">
      <div class="fi" style="grid-column: span 2;"><div class="fi-l">Full Name</div><div class="fi-v">${fmt(personal.full_name)}</div></div>
      <div class="fi"><div class="fi-l">Date of Birth</div><div class="fi-v">${fmt(personal.date_of_birth)}</div></div>
      <div class="fi"><div class="fi-l">Place of Birth</div><div class="fi-v">${fmt(personal.place_of_birth)}</div></div>
      
      <div class="fi"><div class="fi-l">Nationality</div><div class="fi-v">${fmt(personal.nationality)}</div></div>
      <div class="fi"><div class="fi-l">Marital Status</div><div class="fi-v">${fmt(personal.marital_status)}</div></div>
      <div class="fi"><div class="fi-l">Height (cm)</div><div class="fi-v">${fmt(personal.height)}</div></div>
      <div class="fi"><div class="fi-l">Weight (kg)</div><div class="fi-v">${fmt(personal.weight)}</div></div>
      
      <div class="fi"><div class="fi-l">Overall Size</div><div class="fi-v">${fmt(personal.overall_size)}</div></div>
      <div class="fi"><div class="fi-l">Shirt Size</div><div class="fi-v">${fmt(personal.shirt_size)}</div></div>
      <div class="fi"><div class="fi-l">Trouser Size</div><div class="fi-v">${fmt(personal.trouser_size)}</div></div>
      <div class="fi"><div class="fi-l">Shoes Size</div><div class="fi-v">${fmt(personal.shoes_size)}</div></div>
    </div>

    <!-- 2. EDUCATION & LANGUAGES -->
    <div class="sh">2. EDUCATION & LANGUAGES</div>
    <div class="fg fg-3">
      <div class="fi"><div class="fi-l">College / School</div><div class="fi-v">${fmt(education.college_school)}</div></div>
      <div class="fi"><div class="fi-l">Graduation Year</div><div class="fi-v">${fmt(education.graduation_year)}</div></div>
      <div class="fi"><div class="fi-l">English Level</div><div class="fi-v">
        <div class="checkbox-group">
          <div class="chk"><div class="box ${education.english_level === 'Fluent' ? 'checked' : ''}"></div> Fluent</div>
          <div class="chk"><div class="box ${education.english_level === 'Good' ? 'checked' : ''}"></div> Good</div>
          <div class="chk"><div class="box ${education.english_level === 'Average' ? 'checked' : ''}"></div> Avg</div>
          <div class="chk"><div class="box ${education.english_level === 'Poor' ? 'checked' : ''}"></div> Poor</div>
        </div>
      </div></div>
    </div>
    
    <table class="dt">
      <thead><tr><th>Language</th><th>Capabilities</th></tr></thead>
      <tbody>
        <tr><td>English</td><td>${langBox(education.languages?.english)}</td></tr>
        <tr><td>Other: ${fmt(education.languages?.other_language_name)}</td><td>${langBox(education.languages?.other)}</td></tr>
      </tbody>
    </table>

    <!-- 3. CONTACT DETAILS -->
    <div class="sh">3. CONTACT DETAILS</div>
    <div class="fg fg-2">
      <div class="fi" style="grid-column: span 2;"><div class="fi-l">Home Address</div><div class="fi-v">${fmt(contact.home_address)}</div></div>
      <div class="fi"><div class="fi-l">Telephone / Mobile</div><div class="fi-v">${fmt(contact.telephone_mobile)}</div></div>
      <div class="fi"><div class="fi-l">Email Address</div><div class="fi-v">${fmt(contact.email_address)}</div></div>
      <div class="fi"><div class="fi-l">Nearest Airport</div><div class="fi-v">${fmt(contact.nearest_airport)}</div></div>
    </div>

    <!-- 4. NEXT OF KIN -->
    <div class="sh">4. NEXT OF KIN / EMERGENCY CONTACT</div>
    <div class="fg fg-2">
      <div class="fi"><div class="fi-l">Full Name</div><div class="fi-v">${fmt(kin.full_name)}</div></div>
      <div class="fi"><div class="fi-l">Relationship</div><div class="fi-v">${fmt(kin.relationship)}</div></div>
      <div class="fi"><div class="fi-l">Address</div><div class="fi-v">${fmt(kin.address)}</div></div>
      <div class="fi"><div class="fi-l">Telephone / Mobile</div><div class="fi-v">${fmt(kin.telephone_mobile)}</div></div>
      <div class="fi" style="grid-column: span 2;"><div class="fi-l">Email</div><div class="fi-v">${fmt(kin.email)}</div></div>
    </div>

    <!-- 5. CERTIFICATE OF COMPETENCY -->
    <div class="sh">5. PROFESSIONAL QUALIFICATIONS / CERTIFICATE OF COMPETENCY</div>
    <table class="dt">
      <thead><tr><th>Certificate Name</th><th>Number</th><th>Issue Date</th><th>Expiry Date</th><th>Issued By</th><th>Issued At</th></tr></thead>
      <tbody>${certRows}</tbody>
    </table>

    <!-- 6. TRAVEL DOCUMENTS -->
    <div class="sh">6. TRAVEL DOCUMENTS</div>
    <div class="fg fg-5">
      <div class="fi fi-bg"><div class="fi-v">Passport</div></div>
      <div class="fi"><div class="fi-l">Number</div><div class="fi-v">${fmt(docs.passport?.number)}</div></div>
      <div class="fi"><div class="fi-l">Issue Date</div><div class="fi-v">${fmt(docs.passport?.issue_date)}</div></div>
      <div class="fi"><div class="fi-l">Expiry Date</div><div class="fi-v">${fmt(docs.passport?.expiry_date)}</div></div>
      <div class="fi"><div class="fi-l">Issued At</div><div class="fi-v">${fmt(docs.passport?.issued_at)}</div></div>
      
      <div class="fi fi-bg"><div class="fi-v">Seaman Book</div></div>
      <div class="fi"><div class="fi-l">Number</div><div class="fi-v">${fmt(docs.seaman_book?.number)}</div></div>
      <div class="fi"><div class="fi-l">Issue Date</div><div class="fi-v">${fmt(docs.seaman_book?.issue_date)}</div></div>
      <div class="fi"><div class="fi-l">Expiry Date</div><div class="fi-v">${fmt(docs.seaman_book?.expiry_date)}</div></div>
      <div class="fi"><div class="fi-l">Issued At</div><div class="fi-v">${fmt(docs.seaman_book?.issued_at)}</div></div>
      
      <div class="fi fi-bg"><div class="fi-v">US VISA</div></div>
      <div class="fi"><div class="fi-l">Number</div><div class="fi-v">${fmt(docs.us_visa?.number)}</div></div>
      <div class="fi"><div class="fi-l">Issue Date</div><div class="fi-v">${fmt(docs.us_visa?.issue_date)}</div></div>
      <div class="fi"><div class="fi-l">Expiry Date</div><div class="fi-v">${fmt(docs.us_visa?.expiry_date)}</div></div>
      <div class="fi"><div class="fi-l">Issued At</div><div class="fi-v">${fmt(docs.us_visa?.issued_at)}</div></div>
    </div>

    <!-- 7. HEALTH -->
    <div class="sh">7. HEALTH CERTIFICATES / VACCINATIONS</div>
    <table class="dt">
      <thead><tr><th>Certificate / Vaccine</th><th>Number</th><th>Issue Date</th><th>Expiry Date</th><th>1st Dose</th><th>2nd/Last Dose</th><th>Issued By</th><th>Issued At</th></tr></thead>
      <tbody>${healthRows}</tbody>
    </table>

    <!-- 8. MARINE COURSES -->
    <div class="sh">8. MARINE COURSES</div>
    <table class="dt">
      <thead><tr><th>Course Name</th><th>Number</th><th>Issue Date</th><th>Expiry Date</th><th>Issued By</th><th>Issued At</th></tr></thead>
      <tbody>${courseRows}</tbody>
    </table>

    <!-- 9. SEA SERVICE -->
    <div class="sh">9. COMPLETE SEA SERVICE DETAILS</div>
    <table class="dt">
      <thead><tr><th>Principal</th><th>Rank</th><th>Vessel & IMO</th><th>Flag</th><th>Sign On</th><th>Sign Off</th><th>Period</th><th>Vessel Type</th></tr></thead>
      <tbody>${seaRows}</tbody>
    </table>

    <!-- 10. REFERENCES -->
    <div class="sh">10. REFERENCES</div>
    <table class="dt">
      <thead><tr><th>#</th><th>Principal / Country</th><th>Position</th><th>Name</th><th>Tel</th><th>Email</th></tr></thead>
      <tbody>${refRows}</tbody>
    </table>

    <!-- 11. DECLARATION -->
    <div class="sh">11. DECLARATION</div>
    <div class="fg" style="padding:12px; font-size:8.5pt;">
      <p style="margin-bottom:8px;">I confirm that all information provided in this application is true and correct. I understand that any false information may lead to rejection of my application or immediate dismissal from employment.</p>
      <div style="display:flex; justify-content:space-between; margin-top:20px;">
        <div><strong>Applicant Name:</strong> ${name}</div>
        <div><strong>Date:</strong> ${fmt(decl.date)}</div>
        <div style="width:150px; border-bottom:1px solid #000; text-align:center;">Signature</div>
      </div>
    </div>

    <!-- 12. ADMIN ATTACHMENTS -->
    <div class="sh">12. ADMIN FILES & ATTACHMENTS</div>
    <table class="dt">
      <thead><tr><th>Document Title</th><th>Upload Date</th></tr></thead>
      <tbody>${adminDocsRows}</tbody>
    </table>

  </div>
</body>
</html>`;
};
export const generateBrandedCVPdf = (submission, opts = {}) => {
  try {
    const html = buildCvHtml(submission, opts);
    const win = window.open('', '_blank', 'width=1050,height=850,scrollbars=yes');
    if (!win) { console.error('Popup blocked'); return false; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  } catch (err) {
    console.error('CV generation failed:', err);
    return false;
  }
};
