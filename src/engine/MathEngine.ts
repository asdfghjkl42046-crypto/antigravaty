/**
 * 《創業冒險：現代法律篇》核心基礎運算 (底層模組)
 * 負責最基礎且無狀態依賴的數學與加密運算，被所有其他 Engine 廣泛調用
 */

/**
 * §1-1 無條件進位 (Round Up)
 * 凡涉及百分比計算導致小數點，一律無條件進位。
 * 修正浮點數精度誤差（例如 220.00000000000003 應判定為 220，若為 220.1 則進位成 221）
 * 這是為了確保玩家在受到懲罰或罰金計算時，系統採取對抗風險最嚴格的標準
 */
export function roundUp(num: number): number {
  return Math.ceil(Math.round(num * 1e6) / 1e6);
}

import { throwEnvironmentError } from './errors/EngineErrors';

/**
 * 產生 SHA-256 雜湊 (Cryptography Hash)
 * 用於產生標籤的 Hash Chain (雜湊鏈)，讓遊戲中的每一筆黑材料跟前一筆綁定，無法輕易竄改
 * @param message 傳入要加密的字串內容 (通常是：前一筆 Hash + 動作名稱 + 時間戳)
 * @returns 回傳 64 字元的十六進制雜湊字串
 */
export async function sha256(message: string): Promise<string> {
  // 總裁指示：環境檢查必須最優先！
  // 檢查 Web Crypto API 是否可用。在非 HTTPS 或舊版環境中，crypto.subtle 為 undefined。
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throwEnvironmentError(
      'sha256 運算失敗',
      'Web Crypto API (crypto.subtle) 在目前環境中不可用。請確保網頁運行於 HTTPS 安全上下文或現代瀏覽器中。'
    );
  }

  try {
    // 1. 將字串轉換為 Uint8Array 位元組陣列供瀏覽器底層 API 解析
    const msgBuffer = new TextEncoder().encode(message);
    // 2. 呼叫瀏覽器原生且無法輕易被攔截的 Web Crypto API 進行 SHA-256 摘要計算
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // 3. 將 ArrayBuffer 轉回可操作的標準數字陣列
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // 4. 將每個 byte 轉成兩位的 16 進位字串並連接起來，生成防偽指紋
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err: any) {
    throwEnvironmentError('sha256 摘要計算出錯', err?.message || '未知錯誤');
  }
}

