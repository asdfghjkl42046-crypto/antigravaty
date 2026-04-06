/**
 * 品牌視覺資產配置 (Brand Assets Configuration)
 */
export const BRAND_ASSETS = {
  LOGO: {
    // 靜態圖檔 (用於 Favicon 或 Meta 標籤)
    STATIC: '/assets/logo.png',
    // 核心動態影片 (用於 GlowLogo 組件)
    VIDEO: '/assets/logo_anim.mp4',
    // 影片播放設定
    SETTINGS: {
      AUTO_PLAY: true,
      LOOP: true,
      MUTED: true,
      PLAYS_INLINE: true,
      POSTER: '/assets/logo.png', // 影片加載前的替代圖
    }
  },
  // 未來可擴充其他品牌資產
};

export type BrandAssets = typeof BRAND_ASSETS;
