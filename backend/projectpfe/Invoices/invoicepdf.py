from io import BytesIO
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from .models import Invoice
from django.conf import settings
from datetime import datetime
import os

def generate_pdf(invoice_id):

    invoice = Invoice.objects.get(id = invoice_id)
    client = invoice.contract.client
    lines = invoice.invoice_InvoiceLine_items.all()
    
    

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=20*mm, 
        leftMargin=20*mm,
        topMargin=10*mm, 
        bottomMargin=20*mm
    )
    

    styles = getSampleStyleSheet()
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='MyTitle', 
        fontSize=16, 
        leading=20, 
        alignment=1,  
        spaceAfter=10
    ))
    
    styles.add(ParagraphStyle(
        name='Header', 
        fontSize=12, 
        leading=15, 
        spaceAfter=5,
    ))
    
    styles.add(ParagraphStyle(
        name='NormalBold', 
        fontSize=11, 
        leading=14, 
        spaceAfter=5, 
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
    name='Notice',
    fontSize=10,
    leading=14,
    alignment=1,  # center
    textColor=colors.red,
    spaceBefore=20
))
    
    
    elements = []
    
    
    logo_path = os.path.join(settings.BASE_DIR, 'catalog/static/logo.png')
    
    if os.path.exists(logo_path):
        img = Image(logo_path,width=120, height=70)
        img.hAlign = 'LEFT'
    
        
    title = Paragraph("PFE PROJECT ISIL-70", styles['MyTitle'])
    
    header_table = Table([[img, title]], colWidths=[120, 300])

    header_table.setStyle(TableStyle([
    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ('ALIGN',(1,0),(1,0),'RIGHT'),
    ('ALIGN',(0,0),(0,0),'LEFT'),
    
     ]))

    header_table.hAlign = 'LEFT'
    elements.append(header_table)
    elements.append(Spacer(1,10)) 
    
    line = Table([['']],colWidths=[650])
    line.setStyle(TableStyle([
        ('LINEABOVE',(0,0),(-1,-1),1, colors.black)
    ]))
    
    elements.append(line)
    elements.append(Spacer(1,10)) 
    elements.append(Paragraph(f"INVOICE N° {invoice.id}", styles['MyTitle']))
    elements.append(Spacer(1,12))
  

    top_data = [[
    Paragraph(f"<b>Date:</b> {invoice.date_de_facteration.strftime('%Y-%m-%d')}", styles['Normal']), # type: ignore
    Paragraph(f"<b>Type:</b> {invoice.type}", styles['Normal'])
    ]]

    top_table = Table(top_data, colWidths=[250, 200]) 
    

    top_table.setStyle(TableStyle([
    ('ALIGN', (0,0), (0,0), 'LEFT'),
    ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))

    elements.append(top_table)
    elements.append(Spacer(1,15))
    client = invoice.contract.client

    client_data = [
    ["Name:", client.firstName],
    ["Last Name:", client.lastName],
    ["Contract ID:", str(invoice.contract.id)],
    ]

    client_table = Table(client_data, colWidths=[120, 300])

    client_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
    ('LINEAFTER', (0,0), (0,-1), 0.5, colors.black),
    ('BOTTOMPADDING',(0,0),(-1,-1),6),
    ]))

    elements.append(client_table)
    elements.append(Spacer(1,20))
    table_data = [['ID', 'Product','Unit Price','Unit','qte', 'Total(BT)', 'TAX','Total']]

















    doc.build(elements)
    
    pdf = buffer.getvalue()
    buffer.close()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="contract_{invoice.id}.pdf"'
    return response