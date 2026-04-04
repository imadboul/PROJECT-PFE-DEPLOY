from io import BytesIO
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from .models import Contract
from django.conf import settings
import os

def generate_pdf(contract_id):

    contract = Contract.objects.get(id=contract_id)
    

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
        spaceAfter=5
    ))
    styles.add(ParagraphStyle(
        name='NormalBold', 
        fontSize=11, 
        leading=14, 
        spaceAfter=5, 
        fontName='Helvetica-Bold'
    ))
    
    
    elements = []
    
    
    logo_path = os.path.join(settings.BASE_DIR, 'catalog/static/logo.png')
    
    if os.path.exists(logo_path):
        img = Image(logo_path,width=120, height=70 , hAlign='LEFT')
        ##elements.append(img)
        ##elements.append(Spacer(1,1 ))
        
        
    ##elements.append(Paragraph("PFE PROJECT ISIL-70", styles['MyTitle']))
     # Create a simple 2-column table bouklila
        header_table = Table([
    [Image(logo_path, width=120, height=70), 
     Paragraph("PFE PROJECT ISIL-70", styles['MyTitle'])]
          ])

    elements.append(header_table)
    elements.append(Paragraph(f"CONTRACT N°{contract.id}", styles['MyTitle']))
    elements.append(Spacer(1,12)) 

    
    
























    doc.build(elements)
    
    # 6. Return response
    pdf = buffer.getvalue()
    buffer.close()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="contract_{contract.id}.pdf"'
    return response