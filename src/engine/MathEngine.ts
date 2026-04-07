/**
 * 基礎運算工具
 * 負責處理遊戲中最基本的數學計算（如進位）與資料加密。
 */

/**
 * 無條件進位
 * 只要計算結果有小數點，一律往上加 1（例如 220.1 變成 221）。
 */
import { throwEnvironmentError, throwNumericalCheckError } from './errors/EngineErrors';

/**
 * §1-1 無條件進位 (Round Up)
 * 凡涉及百分比計算導致小數點，一律無條件進位。
 * 修正浮點數精度誤差（例如 220.00000000000003 應判定為 220，若為 220.1 則進位成 221）
 * 這是為了確保玩家在受到懲罰或罰金計算時，系統採取對抗風險最嚴格的標準
 */
export function roundUp(num: number): number {
  // 核心邊界防禦：攔截任何可能導致 NaN 傳播的非法傳入值
  if (num === undefined || num === null || Number.isNaN(Number(num))) {
    throwNumericalCheckError(
      'MathEngine.roundUp',
      `傳入值非法 (值: ${num})。基礎運算層拒絕處理任何非數字輸入。`
    );
  }
  return Math.ceil(Math.round(num * 1e6) / 1e6);
}

/**
 * 資料加密功能
 * 幫每一筆犯罪紀錄產生唯一的「指紋」，確保紀錄不會被隨意改動。
 */
export async function sha256(message: string): Promise<string> {
  // 檢查 Web Crypto API 是否可用。在非 HTTPS 或舊版環境中，crypto.subtle 為 undefined。
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    console.warn('[MathEngine] Web Crypto API 不可用，已自動切換至純 JS 後備雜湊方案。');
    return fallbackSha256(message);
  }

  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err: any) {
    console.error('[MathEngine] 原生 sha256 計算失敗，嘗試使用後備方案。', err);
    return fallbackSha256(message);
  }
}

/**
 * 純 JS 實作的 SHA-256 後備方案 (用於開發環境或非 HTTPS 模式)
 * 此實作為確保系統在任何環境下皆能維護雜湊鏈完整性。
 */
function fallbackSha256(message: string): string {
  const utf8 = new TextEncoder().encode(message);
  const words = new Uint32Array(64);
  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const k = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  const words_full = new Uint32Array((((utf8.length + 8) >> 6) + 1) << 4);
  for (let i = 0; i < utf8.length; i++) words_full[i >> 2] |= utf8[i] << (24 - 8 * (i % 4));
  words_full[utf8.length >> 2] |= 0x80 << (24 - 8 * (utf8.length % 4));
  words_full[words_full.length - 1] = utf8.length * 8;

  for (let j = 0; j < words_full.length; j += 16) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) w[i] = words_full[j + i];
    for (let i = 16; i < 64; i++) {
      const s0 =
        ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^
        ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^
        (w[i - 15] >>> 3);
      const s1 =
        ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^
        ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^
        (w[i - 2] >>> 10);
      w[i] = w[i - 16] + s0 + w[i - 7] + s1;
    }

    let [a, b, c, d, e, f, g, l] = h;
    for (let i = 0; i < 64; i++) {
      const s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (l + s1 + ch + k[i] + w[i]) | 0;
      const s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;
      l = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
    h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0;
    h[7] = (h[7] + l) | 0;
  }

  return Array.from(h)
    .map((v) => (v >>> 0).toString(16).padStart(8, '0'))
    .join('');
}
