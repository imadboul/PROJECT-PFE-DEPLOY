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
from Tax_Service.taxCalcul import convert_unit
import os

def generate_pdf(invoice_id):

    invoice = Invoice.objects.get(id = invoice_id)
    client = invoice.contract.client
    lines = invoice.invoice_InvoiceLine_items.all() # type: ignore
    
    

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
   
    ('BACKGROUND', (0,0), (-1,0), colors.Color(1, 0.6, 0.2)),

    
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),

   
    ('ALIGN', (0,0), (0,0), 'LEFT'),
    ('ALIGN', (1,0), (1,0), 'RIGHT'),

    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0,0), (-1,0), 8),]))

    elements.append(top_table)
    elements.append(Spacer(1,15))
    client = invoice.contract.client

    data = [
        ['Name: ', client.firstName],
        ['Last Name: ', client.lastName],
        ['ID: ', client.id],
        ["contract:", str(invoice.contract_id)] # type: ignore
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
    elements.append(Spacer(1,20))
    table_data = [['ID', 'Product','Unit Price','Unit','qte','qte Unit','HT', 'TAX','Total']]
    
    
    
    grouped = {}

    for prod in lines:
        product_id = prod.product.id

        qte = convert_unit(prod.qte, prod.product.density, prod.unit, prod.product.unit)
        HT = qte * prod.product.unit_price
        TAX = prod.tax_price

        if product_id not in grouped:
            grouped[product_id] = {
                "row": [
                    prod.product.id,
                    prod.product.name,
                    prod.product.unit_price,
                    prod.product.unit,
                    prod.qte,
                    prod.unit,
                    HT,
                    TAX,
                    HT + TAX
                ]
            }
        else:
            
            grouped[product_id]["row"][7] += TAX
            grouped[product_id]["row"][8] += TAX 
        
        
        
        
        
    for item in grouped.values():
        row = item["row"]

        table_data.append([
            row[0],
            row[1],
            row[2],
            row[3],
            str(row[4]),
            str(row[5]),
            str(round(row[6], 2)),
            str(round(row[7], 2)),
            str(round(row[8], 2)),
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
    elements.append(Spacer(1, 10))
    
    elements.append(product_table)


    totals_data = [
    ["HT:", f"{invoice.HT} DA"],
    ["TVA:", f"{invoice.TVA} DA"],
    ["TTC:", f"{invoice.TTC} DA"],
]   

    totals_table = Table(totals_data, colWidths=[80, 120])
    totals_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),

    ('ALIGN', (0,0), (-1,-1), 'RIGHT'),

    ('TEXTCOLOR', (0,0), (-1,-1), colors.black),

    ('BOTTOMPADDING', (0,0), (-1,-1), 6),

    ('LINEABOVE', (0,0), (-1,0), 1, colors.black),

  
    ('BOX', (0,0), (-1,-1), 1, colors.black),

   
    ('BACKGROUND', (0,0), (-1,-1), colors.whitesmoke),
]))
    totals_table.hAlign = 'RIGHT'
    elements.append(Spacer(1,20))
    elements.append(totals_table)













    doc.build(elements)
    
    pdf = buffer.getvalue()
    buffer.close()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="contract_{invoice.id}.pdf"'
    return response