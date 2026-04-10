import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
// Force re-compilation of CSS

// 載入 Next.js 內建的無襯線字體，做為系統主要 UI 易讀字型
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// 載入等寬字體，專門用來顯示遊戲中的終端機指令、Log 系統與精確的財報數字資訊
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// 系統全域 Metadata 設定，定義並控制在瀏覽器標籤頁 (Tab) 上的顯示名稱與 SEO 描述
export const metadata: Metadata = {
  title: 'Antigravity 法律終端',
  description: '現代法律審判模擬系統',
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

/**
 * 系統最根部的佈局容器組件 (Root Layout)
 * 負責在最底層注入全局字體變數、Global CSS 以及抗鋸齒 (antialiased) 渲染樣式，
 * 並將所有的虛擬 DOM 子系統 (如 page.tsx) 包裝在其中。
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning：避免 Next.js SSR 在開發模式下因瀏覽器擴充元件干擾而狂噴水合作用 (Hydration) 失配的警告紅字
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
