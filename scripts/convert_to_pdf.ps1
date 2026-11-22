$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $docPath = (Resolve-Path 'PPT_GEN_Final_Project_Report.docx').Path
    $pdfPath = [System.IO.Path]::ChangeExtension($docPath, '.pdf')
    $doc = $word.Documents.Open($docPath)
    $pages = $doc.ComputeStatistics(2)
    # 17 = wdExportFormatPDF, 0 = wdExportOptimizeForPrint
    $doc.ExportAsFixedFormat($pdfPath, 17, $false, 0)
    $doc.Close([Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges)
    $len = (Get-Item $pdfPath).Length
    Write-Host "Total Pages in PDF: $pages, Length: $len bytes"
}
finally {
    $word.Quit()
}
