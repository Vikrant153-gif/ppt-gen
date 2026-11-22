$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('C:\Users\vikra\OneDrive\Desktop\React Js\nut2.pdf', [Type]::Missing, $true)
    $text = $doc.Content.Text
    $lines = $text -split "`r`n|`n|`r"
    foreach ($line in $lines) {
        if ($line -match "Figure \d" -or $line -match "Fig") {
            Write-Host $line
        }
    }
}
finally {
    if ($doc) { $doc.Close([Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges) }
    $word.Quit()
}
