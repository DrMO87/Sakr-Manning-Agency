import os
import django
import random
import io
from datetime import datetime
from django.core.files.uploadedfile import SimpleUploadedFile
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.pdfgen import canvas

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from django.apps import apps
Document = apps.get_model('api', 'Document')
Users = apps.get_model('api', 'Users')
Company = apps.get_model('companies', 'Company')

def add_header_footer(canvas_obj, doc):
    canvas_obj.saveState()
    
    # --- Header ---
    logo_path = "logo.png"
    if os.path.exists(logo_path):
        # Draw logo (x, y, width, height)
        # Position it at top left
        canvas_obj.drawImage(logo_path, 40, doc.pagesize[1] - 80, width=60, height=60, preserveAspectRatio=True, mask='auto')
    
    # Header Text
    canvas_obj.setFont('Helvetica-Bold', 18)
    canvas_obj.setFillColor(colors.HexColor("#1e3a8a")) # Tailwind Blue-900
    canvas_obj.drawString(110, doc.pagesize[1] - 50, "SAKR MANNING AGENCY")
    
    canvas_obj.setFont('Helvetica', 10)
    canvas_obj.setFillColor(colors.HexColor("#64748b"))
    canvas_obj.drawString(110, doc.pagesize[1] - 65, "Official Candidate Curriculum Vitae")
    
    # Header Line
    canvas_obj.setStrokeColor(colors.HexColor("#cbd5e1"))
    canvas_obj.setLineWidth(1)
    canvas_obj.line(40, doc.pagesize[1] - 90, doc.pagesize[0] - 40, doc.pagesize[1] - 90)
    
    # --- Footer ---
    canvas_obj.setStrokeColor(colors.HexColor("#cbd5e1"))
    canvas_obj.line(40, 50, doc.pagesize[0] - 40, 50)
    
    # Footer Text - Left
    canvas_obj.setFont('Helvetica-Oblique', 9)
    canvas_obj.setFillColor(colors.HexColor("#94a3b8"))
    canvas_obj.drawString(40, 35, "Developed by Code Square")
    
    # Footer Text - Right (Date/Time and Page)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    page_num = f"Page {doc.page}"
    right_text = f"{now_str}  |  {page_num}"
    
    canvas_obj.drawRightString(doc.pagesize[0] - 40, 35, right_text)
    
    canvas_obj.restoreState()

def generate_pdf(name, email, phone, position, idx):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=110, bottomMargin=70
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        name='CVTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=20,
        alignment=1 # Center
    )
    
    heading_style = ParagraphStyle(
        name='CVHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor("#1d4ed8"),
        spaceAfter=10,
        spaceBefore=15
    )
    
    normal_style = ParagraphStyle(
        name='CVNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=colors.HexColor("#334155"),
        leading=16
    )
    
    story = []
    
    # Title
    story.append(Paragraph(name, title_style))
    
    # Personal Information Table
    data = [
        [Paragraph("<b>Email:</b>", normal_style), Paragraph(email, normal_style)],
        [Paragraph("<b>Phone:</b>", normal_style), Paragraph(phone, normal_style)],
        [Paragraph("<b>Position:</b>", normal_style), Paragraph(position, normal_style)],
        [Paragraph("<b>Candidate ID:</b>", normal_style), Paragraph(f"CAN-{idx:05d}", normal_style)]
    ]
    
    t = Table(data, colWidths=[100, 350])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#334155")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
    ]))
    
    story.append(t)
    story.append(Spacer(1, 20))
    
    # Professional Summary
    story.append(Paragraph("Professional Summary", heading_style))
    summary_text = (
        f"{name} is a highly dedicated professional applying for the position of {position}. "
        "With a strong background in maritime operations and a proven track record of safety and efficiency, "
        "they are well-equipped to handle the rigorous demands of modern shipping. They possess all relevant "
        "certifications and have undergone rigorous safety compliance training."
    )
    story.append(Paragraph(summary_text, normal_style))
    
    # Experience
    story.append(Paragraph("Experience", heading_style))
    for i in range(1, 4):
        story.append(Paragraph(f"<b>Previous Role {i}</b>", normal_style))
        story.append(Paragraph(f"Vessel Type: Bulk Carrier | Duration: {random.randint(6, 12)} months", normal_style))
        story.append(Spacer(1, 8))
        
    # Certification
    story.append(Paragraph("Certifications", heading_style))
    certs = ["STCW Basic Safety Training", "Advanced Firefighting", "Medical First Aid", "Security Awareness"]
    for cert in certs:
        story.append(Paragraph(f"• {cert}", normal_style))
        story.append(Spacer(1, 4))
        
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def seed_cvs():
    print("Starting CV document seeding with real PDFs...")
    statuses = ['Pending', 'Active', 'Blacklist']
    positions = ['Master', 'Chief Officer', 'Second Officer', 'Chief Engineer', 'Oiler', 'Bosun', 'Able Seaman']
    
    # Delete old dummy documents to replace them with real PDF ones
    Document.objects.all().delete()
    print("Cleared old documents.")
    
    docs_to_create = 20
    
    users = list(Users.objects.all())
    companies = list(Company.objects.all())
    
    if not users:
        print("No users found to attach documents to.")
        return

    count = 0
    for i in range(docs_to_create):
        status = random.choice(statuses)
        name = f"Candidate {i+1}"
        email = f"candidate{i+1}@example.com"
        phone = f"+1234500{i:02d}"
        position = random.choice(positions)
        
        # Generate real PDF bytes
        pdf_bytes = generate_pdf(name, email, phone, position, i+1)
        dummy_file = SimpleUploadedFile(f"CV_{name.replace(' ', '_')}.pdf", pdf_bytes, content_type="application/pdf")
        
        user = random.choice(users)
        company = random.choice(companies) if companies else None
        
        Document.objects.create(
            user=user,
            company=company,
            title=f"{name} CV",
            name=name,
            email=email,
            phone_number=phone,
            position=position,
            status=status,
            file=dummy_file
        )
        count += 1
    print(f"Created {count} beautifully formatted CV documents.")

if __name__ == '__main__':
    seed_cvs()
