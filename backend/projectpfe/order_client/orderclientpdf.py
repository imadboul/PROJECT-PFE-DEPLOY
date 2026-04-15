from io import BytesIO
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from .models import Orderclient,OrderProductclient, Client, Contract
from django.conf import settings
from datetime import datetime
import os

def generate_pdf(order_id):

    orderclient = Orderclient.objects.get(id = order_id)
    client = Client.objects.get(id = orderclient.client_id) # type: ignore
    products = orderclient.orderclient_Orderproductclient_items.all() # type: ignore
    
    

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
  
    elements.append(Paragraph(f"order N°{orderclient.id}", styles['MyTitle'],))
    elements.append(Spacer(1,12)) 
    
    elements.append(Paragraph("Order Information :", styles['Header']))
    elements.append(Spacer(1,8)) 
    
    data = [
        ['Name: ', client.firstName],
        ['Last Name: ', client.lastName],
        ['ID: ', client.id],
        ['Phone Number: ', client.phoneNumber],
        ["contract:", str(orderclient.contract_id)], # type: ignore
        ["pick up date :", str(orderclient.pickup_date)] # type: ignore
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

    
    elements.append(Spacer(1,10)) 
    
    table_data = [
    ['ID', 'Product', 'type', 'Unit Price','Unit','density', 'Max Qty', 'Taken Qty','Qty left']]
    
    for item in products:
        table_data.append([
            item.product.id,
            item.product.name,
            item.product.product_type,
            str(item.product.unit_price),
            item.product.unit,
            str(item.product.density),
            str(item.qte),
            str(item.qte_taken),
            str(item.qte -item.qte_taken )
            ])
        
    product_table = Table(table_data,colWidths=[40,80, 60, 70, 40, 50,55,55,55])
    
    product_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0),colors.Color(1, 0.6, 0.2)),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),

    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),

    ('GRID', (0,0), (-1,-1), 0.5, colors.black),

    ('BOTTOMPADDING', (0,0), (-1,0), 8),

    ('BACKGROUND', (0,1), (-1,-1), colors.whitesmoke),]))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Products:", styles['Header']))
    elements.append(Spacer(1, 10))
    
    elements.append(product_table)
    

    
   
        
    
    
    
    

    
    






















    elements.append(Spacer(1, 30))

    notice_text = "Notice: This document must be presented at the center to authorize the collection of your order."

    elements.append(Paragraph(notice_text, styles['Notice']))

    doc.build(elements)
    
    # 6. Return response
    pdf = buffer.getvalue()
    buffer.close()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="contract_{orderclient.id}.pdf"'
    return response