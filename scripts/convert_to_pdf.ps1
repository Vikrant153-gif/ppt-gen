$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = (Resolve-Path 'PPT_GEN_Final_Project_Report.docx').Path
$pdfPath = [System.IO.Path]::ChangeExtension($docPath, '.pdf')
$doc = $word.Documents.Open($docPath)
$pages = $doc.ComputeStatistics(2)
$doc.SaveAs([ref]$pdfPath, [ref]17)
$doc.Close()
$word.Quit()
Write-Host "Total Pages in PDF: $pages"
