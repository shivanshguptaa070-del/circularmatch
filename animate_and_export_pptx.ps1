$ppt = New-Object -ComObject PowerPoint.Application
$filePath = "c:\Users\sysye\OneDrive\Desktop\circularmatch\circularmatch\CircularMatch_HACKDAY_Pitch.pptx"
$pdfPath = "c:\Users\sysye\OneDrive\Desktop\circularmatch\circularmatch\CircularMatch_Pitch_Deck.pdf"
$exportDir = "c:\Users\sysye\OneDrive\Desktop\circularmatch\circularmatch\pptx_slides"

if (!(Test-Path $exportDir)) { New-Item -ItemType Directory -Path $exportDir | Out-Null }

$pres = $ppt.Presentations.Open($filePath, 0, 0, 0)
Write-Host "Opened presentation with $($pres.Slides.Count) slides."

# Enum constants
# msoAnimEffectFade = 10, msoAnimEffectZoom = 13, msoAnimEffectRiseUp = 26, msoAnimEffectWipe = 22
# msoAnimTriggerWithPrevious = 2, msoAnimTriggerAfterPrevious = 3

for ($i = 1; $i -le $pres.Slides.Count; $i++) {
    $s = $pres.Slides.Item($i)
    
    # 1. Slide Transition: Smooth Fade
    $s.SlideShowTransition.EntryEffect = 1537 # ppEffectFade
    $s.SlideShowTransition.Duration = 0.4
    $s.SlideShowTransition.AdvanceOnClick = $true
    
    # Clear any existing animation sequence
    while ($s.TimeLine.MainSequence.Count -gt 0) {
        $s.TimeLine.MainSequence.Item(1).Delete()
    }
    
    $numShapes = $s.Shapes.Count
    
    # Animate Shape 2 (Header Title & Chip): Fade In at start of slide
    if ($numShapes -ge 2) {
        $effHeader = $s.TimeLine.MainSequence.AddEffect($s.Shapes.Item(2), 10, 0, 1) # Fade
        $effHeader.Timing.TriggerType = 2 # WithPrevious
        $effHeader.Timing.Duration = 0.35
        $effHeader.Timing.TriggerDelayTime = 0.05
    }
    
    # Find Picture shape (usually the last shape)
    $pictureShape = $null
    for ($j = 1; $j -le $numShapes; $j++) {
        if ($s.Shapes.Item($j).Type -eq 13) { # Picture
            $pictureShape = $s.Shapes.Item($j)
            break
        }
    }
    
    # Animate Picture (Zoom in alongside the content)
    if ($pictureShape -ne $null) {
        $effPic = $s.TimeLine.MainSequence.AddEffect($pictureShape, 13, 0, 1) # Zoom
        $effPic.Timing.TriggerType = 2 # WithPrevious
        $effPic.Timing.Duration = 0.45
        $effPic.Timing.TriggerDelayTime = 0.2
    }
    
    # Animate Content Cards (shapes 4 to second-to-last or before bottom banner)
    # Stagger them with AfterPrevious
    $delayCounter = 0
    for ($j = 4; $j -le $numShapes; $j++) {
        $sh = $s.Shapes.Item($j)
        if ($sh.Type -ne 13 -and $j -ne 3) { # Not picture and not footer
            $eff = $s.TimeLine.MainSequence.AddEffect($sh, 10, 0, 1) # Fade In
            $eff.Timing.TriggerType = 3 # AfterPrevious
            $eff.Timing.Duration = 0.25
            $eff.Timing.TriggerDelayTime = 0.08
            $delayCounter++
        }
    }
    
    Write-Host "Slide ${i}: Configured $($s.TimeLine.MainSequence.Count) animation effects."
}

# Save animated PPTX
$pres.Save()
Write-Host "Saved animated presentation: $filePath"

# Export high-res PDF
try {
    $pres.SaveAs($pdfPath, 32) # 32 = ppSaveAsPDF
    Write-Host "Exported presentation to PDF: $pdfPath"
} catch {
    Write-Host "PDF export error: $_"
}

# Export high-res PNG previews of each slide
for ($i = 1; $i -le $pres.Slides.Count; $i++) {
    $s = $pres.Slides.Item($i)
    $outImg = Join-Path $exportDir "slide_$i.png"
    $s.Export($outImg, "PNG", 1920, 1080)
}
Write-Host "Exported refreshed slide PNGs to: $exportDir"

$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "PowerPoint animation and export complete!"
