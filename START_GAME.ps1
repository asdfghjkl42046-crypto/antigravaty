# 《創業冒險》環境修復與啟動腳本
# 1. 自動重新載入系統 Path（修復安裝 Node 後找不到指令的問題）
# 2. 自動安裝必要的 UI 套件
# 3. 啟動 Next.js 開發伺服器

$G = "`x{1b}[32m"
$R = "`x{1b}[31m"
$Y = "`x{1b}[33m"
$RST = "`x{1b}[0m"

Write-Host "`n$Y[1/3] 正在修復環境變數 (Refresing PATH)...$RST"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 檢查是否成功找到 npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "$G✅ 環境變數修復成功！(Node $(node -v))$RST"
} else {
    Write-Host "$R❌ 仍然找不到 npm。請嘗試重新開機或手動安裝 Node.js。$RST"
    exit
}

Write-Host "`n$Y[2/3] 正在安裝 UI 輔助套件 (lucide-react, clsx, tailwind-merge)...$RST"
npm install lucide-react clsx tailwind-merge

Write-Host "`n$G[3/3] 準備就緒！正在啟動開發伺服器...$RST"
Write-Host "$Y提示：開啟瀏覽器並訪問 http://localhost:3000$RST`n"

npm run dev
