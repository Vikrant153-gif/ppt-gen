import docx

doc = docx.Document('PPT_GEN_Final_Project_Report.docx')
print('Sections count:', len(doc.sections))
for idx, sec in enumerate(doc.sections):
    print(f'Section {idx}: start_type={sec.start_type}')

page_breaks = []
for i, p in enumerate(doc.paragraphs):
    for r in p.runs:
        if 'lastRenderedPageBreak' in r._r.xml or 'w:br' in r._r.xml:
            page_breaks.append((i, p.text[:50]))

print(f'Total page breaks: {len(page_breaks)}')
for pb in page_breaks:
    print(pb)
