"""
pdf_renderer.py
-------------------------------------------------------------------------------
Server-side PDF generation service for Sakr Manning Agency.

Dependencies (add to requirements.txt):
    weasyprint>=60.0
    Jinja2>=3.1          # or use Django's built-in template engine

Usage examples
--------------
1. Quick tabular report from a Django view:

    from pdf_renderer import render_tabular_pdf

    response = render_tabular_pdf(
        title       = "Active Seafarers Report",
        columns     = ["Name", "Rank", "Nationality", "Status"],
        rows        = [["Ahmed Ali", "Captain", "Egyptian", "Active"]],
        summary_text= "All currently active seafarers as of today.",
        stat_cards  = [
            {"number": 42,  "label": "Total Seafarers"},
            {"number": 8,   "label": "Nationalities"},
        ],
    )
    return response  # Django HttpResponse with PDF bytes

2. Detailed single-record (profile) PDF:

    from pdf_renderer import render_detail_pdf

    response = render_detail_pdf(
        title="Seafarer Profile",
        subtitle="Official Manning Document",
        sections=[
            {"heading": "Personal Info", "fields": [
                {"label": "Full Name",   "value": user.full_name},
                {"label": "Nationality","value": user.nationality},
            ]},
        ],
        signatories=[
            {"name": "Capt. Khaled Sakr", "title": "General Manager"},
        ],
        show_cover=True,
        watermark=True,
    )
    return response

3. Return raw HTML for Puppeteer/Playwright:

    from pdf_renderer import render_html

    html_string = render_html("base_report.html", context)
    # Pass html_string to your headless browser process

-------------------------------------------------------------------------------
"""

from __future__ import annotations

import os
import datetime
import time
from pathlib import Path
from typing import Any

# -- Django imports ------------------------------------------------------------
try:
    from django.template.loader import render_to_string
    from django.http import HttpResponse
    _DJANGO_AVAILABLE = True
except ImportError:
    _DJANGO_AVAILABLE = False

# -- Jinja2 (standalone fallback) ----------------------------------------------
try:
    from jinja2 import Environment, FileSystemLoader
    _JINJA2_AVAILABLE = True
except ImportError:
    _JINJA2_AVAILABLE = False

# -- WeasyPrint ----------------------------------------------------------------
try:
    import weasyprint
    _WEASYPRINT_AVAILABLE = True
except ImportError:
    _WEASYPRINT_AVAILABLE = False

# -- Config --------------------------------------------------------------------

TEMPLATE_DIR = Path(__file__).parent / "templates" / "pdf"
# -- Embedded logo (Base64) for offline / WeasyPrint rendering ------------------
_LOGO_PATH = Path(__file__).parent / "Sakr-Manning-Agency-Frontend" / "src" / "assets" / "icons" / "logo.png"
try:
    import base64 as _b64
    LOGO_DATA_URI = "data:image/png;base64," + _b64.b64encode(_LOGO_PATH.read_bytes()).decode()
except Exception:
    LOGO_DATA_URI = ""  # Logo not found — renders without image



def _today_str() -> str:
    return datetime.date.today().strftime("%d %B %Y")


def _ref_num() -> str:
    return f"SMA-{datetime.date.today().year}-{str(int(time.time()))[-6:]}"


# -----------------------------------------------------------------------------
# HTML RENDERING
# -----------------------------------------------------------------------------

def render_html(template_name: str, context: dict[str, Any]) -> str:
    """
    Render an HTML template with the given context.

    Tries Django's template engine first; falls back to Jinja2.
    The template must live in templates/pdf/<template_name>.
    """
    if _DJANGO_AVAILABLE:
        # Django's render_to_string looks in TEMPLATES directories
        return render_to_string(f"pdf/{template_name}", context)

    if _JINJA2_AVAILABLE:
        env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))
        tmpl = env.get_template(template_name)
        return tmpl.render(**context)

    raise RuntimeError(
        "Neither Django template engine nor Jinja2 is available. "
        "Install jinja2 (pip install jinja2) or use this inside a Django project."
    )


# -----------------------------------------------------------------------------
# PDF CONVERSION
# -----------------------------------------------------------------------------

def html_to_pdf_bytes(html: str, base_url: str | None = None) -> bytes:
    """Convert an HTML string to PDF bytes via WeasyPrint."""
    if not _WEASYPRINT_AVAILABLE:
        raise RuntimeError(
            "WeasyPrint is not installed. Run: pip install weasyprint"
        )
    wp = weasyprint.HTML(string=html, base_url=base_url or str(TEMPLATE_DIR))
    return wp.write_pdf()


def _pdf_response(pdf_bytes: bytes, filename: str) -> "HttpResponse":
    """Wrap PDF bytes in a Django HttpResponse for download."""
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


# -----------------------------------------------------------------------------
# PUBLIC API
# -----------------------------------------------------------------------------

def render_tabular_pdf(
    title: str,
    columns: list[str],
    rows: list[list[Any]],
    *,
    subtitle: str = "",
    summary_text: str = "",
    stat_cards: list[dict] | None = None,
    signatories: list[dict] | None = None,
    show_cover: bool = False,
    watermark: bool = False,
    report_date: str | None = None,
    ref_number: str | None = None,
    generated_by: str = "Sakr Manning Agency",
    filename: str | None = None,
    as_response: bool = True,
    base_url: str | None = None,
) -> "bytes | HttpResponse":
    """
    Render a tabular (list) report as PDF.

    Parameters
    ----------
    title        : Report heading.
    columns      : List of column header strings.
    rows         : 2-D list — each inner list is one table row.
    subtitle     : Optional sub-heading shown on the cover page.
    summary_text : Body text for the executive summary callout box.
    stat_cards   : List of {number, label} dicts for summary stats.
    signatories  : List of {name, title} dicts. Defaults to three blank slots.
    show_cover   : Include a cover page.
    watermark    : Show a faint "SAKR MANNING" watermark.
    report_date  : Override the date string shown in the document.
    ref_number   : Override the reference number.
    generated_by : Person / system that generated the report.
    filename     : PDF download filename. Auto-generated if None.
    as_response  : If True (default), return Django HttpResponse; else bytes.
    base_url     : Base URL passed to WeasyPrint for resolving relative assets.

    Returns
    -------
    Django HttpResponse (PDF download) or raw bytes if as_response=False.
    """
    date   = report_date or _today_str()
    ref    = ref_number  or _ref_num()
    fname  = filename    or f"{title.replace(' ', '_')}_Report_{datetime.date.today()}.pdf"

    context = {
        "title":        title,
        "subtitle":     subtitle,
        "summary_text": summary_text or f"This report contains {len(rows)} record(s) across {len(columns)} fields, generated on {date}. Reference: {ref}.",
        "report_date":  date,
        "ref_number":   ref,
        "generated_by": generated_by,
        "show_cover":   show_cover,
        "watermark":    watermark,
        "logo_uri":     LOGO_DATA_URI,
        "logo_uri":     LOGO_DATA_URI,
        "columns":      columns,
        "rows":         [[str(cell) if cell is not None else "—" for cell in row] for row in rows],
        "stat_cards":   stat_cards or [
            {"number": len(rows),    "label": "Total Records"},
            {"number": len(columns), "label": "Data Columns"},
            {"number": date,         "label": "Report Date"},
        ],
        "sections":     [],
        "signatories":  signatories or [],
    }

    html_str  = render_html("base_report.html", context)
    pdf_bytes = html_to_pdf_bytes(html_str, base_url=base_url)

    return _pdf_response(pdf_bytes, fname) if as_response else pdf_bytes


def render_detail_pdf(
    title: str,
    sections: list[dict],
    *,
    subtitle: str = "",
    summary_text: str = "",
    stat_cards: list[dict] | None = None,
    signatories: list[dict] | None = None,
    show_cover: bool = True,
    watermark: bool = False,
    report_date: str | None = None,
    ref_number: str | None = None,
    generated_by: str = "Sakr Manning Agency",
    filename: str | None = None,
    as_response: bool = True,
    base_url: str | None = None,
) -> "bytes | HttpResponse":
    """
    Render a detail (profile / single-record) report as PDF.

    Parameters
    ----------
    sections : List of section dicts:
               [
                 {
                   "heading": "Personal Information",
                   "fields": [
                     {"label": "Full Name",    "value": "Ahmed Ali"},
                     {"label": "Nationality",  "value": "Egyptian"},
                     {"label": "Address",      "value": "...", "full_width": True},
                   ]
                 },
                 ...
               ]

    All other parameters same as render_tabular_pdf.
    """
    date  = report_date or _today_str()
    ref   = ref_number  or _ref_num()
    fname = filename    or f"{title.replace(' ', '_')}_{datetime.date.today()}.pdf"

    context = {
        "title":        title,
        "subtitle":     subtitle,
        "summary_text": summary_text,
        "report_date":  date,
        "ref_number":   ref,
        "generated_by": generated_by,
        "show_cover":   show_cover,
        "watermark":    watermark,
        "columns":      [],
        "rows":         [],
        "stat_cards":   stat_cards or [],
        "sections":     sections,
        "signatories":  signatories or [],
    }

    html_str  = render_html("base_report.html", context)
    pdf_bytes = html_to_pdf_bytes(html_str, base_url=base_url)

    return _pdf_response(pdf_bytes, fname) if as_response else pdf_bytes


def render_html_only(
    title: str,
    columns: list[str],
    rows: list[list[Any]],
    sections: list[dict] | None = None,
    **kwargs,
) -> str:
    """
    Return raw rendered HTML string (no PDF conversion).
    Useful for Puppeteer / Playwright workflows or unit testing.
    """
    date = kwargs.get("report_date") or _today_str()
    ref  = kwargs.get("ref_number")  or _ref_num()

    context = {
        "title":        title,
        "subtitle":     kwargs.get("subtitle", ""),
        "summary_text": kwargs.get("summary_text", ""),
        "report_date":  date,
        "ref_number":   ref,
        "generated_by": kwargs.get("generated_by", "Sakr Manning Agency"),
        "show_cover":   kwargs.get("show_cover", False),
        "watermark":    kwargs.get("watermark", False),
        "columns":      columns,
        "rows":         [[str(c) if c is not None else "—" for c in row] for row in rows],
        "stat_cards":   kwargs.get("stat_cards", []),
        "sections":     sections or [],
        "signatories":  kwargs.get("signatories", []),
    }
    return render_html("base_report.html", context)
