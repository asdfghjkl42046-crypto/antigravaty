# 🛡️ ANTIGRAVITY PROTOCOL ACTIVATOR
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "⚠️ ACTIVATING PROJECT CONSTITUTION PROTOCOL..." -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan

$constitutionPath = "c:\Users\asdfg\Desktop\antigravaty\CONSTITUTION.md"

if (Test-Path $constitutionPath) {
    $content = Get-Content $constitutionPath
    Write-Host "📜 CONSTITUTION CONTENT:" -ForegroundColor Green
    $content | ForEach-Object { Write-Host $_ }
} else {
    Write-Error "CRITICAL: CONSTITUTION.md NOT FOUND!"
}

Write-Host "`n🔍 INTEGRITY CHECKING..." -ForegroundColor Cyan
# 檢查是否有 src/multiplayer 以外的 src 檔案被近期更動 (Git 輔助)
$changedFiles = git status --porcelain src/
if ($changedFiles) {
    Write-Host "⚠️ WARNING: FILES IN 'src/' HAVE BEEN MODIFIED!" -ForegroundColor Red
    $changedFiles | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "✅ ISOLATION INTEGRITY VERIFIED: NO MODIFICATIONS IN CORE 'src/'." -ForegroundColor Green
}

Write-Host "`n🚀 PROTOCOL FULLY ENGAGED. AWAITING USER COMMANDS." -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
