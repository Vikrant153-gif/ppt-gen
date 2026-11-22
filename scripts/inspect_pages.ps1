$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open((Resolve-Path 'PPT_GEN_Final_Project_Report.docx').Path)
$pages = $doc.ComputeStatistics(2)
Write-Host "Total Pages: $pages"

for ($i = 1; $i -le $pages; $i++) {
    $range = $doc.GoTo(1, 1, $i) # wdGoToPage, wdGoToAbsolute, $i
    $line = $range.Paragraphs(1).Range.Text.Trim()
    if ($line.Length -gt 60) { $line = $line.Substring(0, 60) }
    Write-Host "Page $i : $line"
}

$doc.Close()
$word.Quit()
