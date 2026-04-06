from io import BytesIO
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from .models import Contract ,Client
from django.conf import settings
from datetime import datetime
import os

def generate_pdf(contract_id):

    contract = Contract.objects.get(id=contract_id)
    client = Client.objects.get(id = contract.client_id) # type: ignore
    

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
  
    elements.append(Paragraph(f"CONTRACT N°{contract.id}", styles['MyTitle'],))
    elements.append(Spacer(1,12)) 
    
    elements.append(Paragraph("Client Information :", styles['Header']))
    elements.append(Spacer(1,8)) 
    
    data = [
        ['Name: ', client.firstName],
        ['Last Name: ', client.lastName],
        ['ID: ', client.id],
        ['Phone Number: ', client.phoneNumber],
    ]
    
    client_table = Table(data,colWidths=[120,250])
    
    client_table.setStyle(TableStyle([
        ('FONTNAME', (0,0) , (0,-1),'Helvetica-Bold' ),
        ('VALIGN',(0,0),(-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING',(0,0),(-1,-1),6), 
        ('GRID', (0,0), (-1,-1), 0.2, colors.black),
        ('LINEAFTER', (0,0) , (0,-1),0.4, colors.black),
         ('BACKGROUND', (0,0), (0,-1), colors.Color(1, 0.6, 0.2)),
       
    ]))
    client_table.hAlign = 'LEFT'
    elements.append(client_table)
    elements.append(Spacer(1,12)) 
    
    elements.append(Paragraph("Contract Information :", styles['Header']))
    
    elements.append(Spacer(1,8)) 
    contract_data = [
    ["Start Date:", str(contract.start_date.date())],
    ["End Date:", str(contract.end_date.date())],
    ["Agreed Quantity:", str(contract.qte_global) + " LITRE" ],
    ["Product Type:", str(contract.product_type.name)]]
    
    contract_table = Table(contract_data,colWidths=[120,250])
    
    contract_table.setStyle(TableStyle([
        ('FONTNAME', (0,0) , (0,-1),'Helvetica-Bold' ),
        ('VALIGN',(0,0),(-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING',(0,0),(-1,-1),6), 
        ('GRID', (0,0), (-1,-1), 0.2, colors.black),
        ('LINEAFTER', (0,0) , (0,-1),0.4, colors.black),
        ('BACKGROUND', (0,0), (0,-1), colors.Color(1, 0.6, 0.2)),
       
    ]))
    contract_table.hAlign = 'LEFT'
    elements.append(contract_table)
    elements.append(Spacer(1,10)) 
    
    line = Table([['']],colWidths=[650])
    line.setStyle(TableStyle([
        ('LINEABOVE',(0,0),(-1,-1),1.5, colors.black)
    ]))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("VALIDATION", styles['MyTitle']))
    elements.append(line)
    elements.append(Spacer(1,10))
    
    
    
    if contract.state != 'validated':
        elements.append(Paragraph("NOT VALIDATED YET", styles['MyTitle']))
        
    else:
        
        validated_by = (contract.validated_by.firstName + ' '+contract.validated_by.lastName) # type: ignore
        validated_at = contract.validated_at.strftime(" %d/%m/%Y at %H:%M") # type: ignore
    
    
        validation_data = [
    ["Validated by:", validated_by],
    ["Validated on:", validated_at]]
    
        validation_table = Table(validation_data, colWidths=[225, 225])
        validation_table.setStyle(TableStyle([
        ('FONTNAME', (0,0) , (0,-1),'Helvetica-Bold' ),
        ('VALIGN',(0,0),(-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING',(0,0),(-1,-1),6), 
        ('GRID', (0,0), (-1,-1), 0.2, colors.black),
        ('LINEAFTER', (0,0) , (0,-1),0.4, colors.black),
        ('BACKGROUND', (0,0), (0,-1), colors.Color(1, 0.6, 0.2)),
       
    ]))
        validation_table.hAlign = 'LEFT'
        elements.append(validation_table)
        elements.append(Spacer(1,10))
        
        logo_path = os.path.join(settings.BASE_DIR, 'catalog/static/stamp.png')
    
        if os.path.exists(logo_path):
            
            img = Image(logo_path,width=120, height=120)
            img.hAlign = 'RIGHT'
            elements.append(Spacer(1, 50)) 
            elements.append(img)
    
     
    
        
    
    
    
    

    
    
























    doc.build(elements)
    
    # 6. Return response
    pdf = buffer.getvalue()
    buffer.close()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="contract_{contract.id}.pdf"'
    return response