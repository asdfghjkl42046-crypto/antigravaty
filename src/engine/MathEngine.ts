/**
 * 基礎運算工具
 * 負責處理遊戲中最基本的數學計算（如進位）與資料加密。
 */

import { throwNumericalCheckError } from './errors/EngineErrors';
import type { MoneyValue } from '../types/game';

/**
 * 進位高手：只要有小數點零頭，一律往上加到整數
 * 主要用於計算名聲 (RP) 與技術 (IP) 損失，確保數值呈現為整數。
 */
export function roundUp(num: number): number {
  if (num === undefined || num === null || Number.isNaN(Number(num))) {
    throwNumericalCheckError(
      'MathEngine.roundUp',
      `傳入值非法 (值: ${num})。基礎運算層拒絕處理任何非數字輸入。`
    );
  }
  return Math.ceil(Math.round(num * 1e6) / 1e6);
}

/**
 * 資金對齊：進位 (10萬)
 * 用於收益、罰金、規費，確保不產生 1~9 萬的殘值。
 */
export function alignToTenCeil(num: number): number {
  return Math.ceil(Math.round(num * 1e6) / 1e7) * 10;
}

/**
 * 資金對齊：捨去 (10萬)
 * 用於海外信託轉移，不足 10 萬則為 0 萬。
 */
export function alignToTenFloor(num: number): number {
  return Math.floor(Math.round(num * 1e6) / 1e7) * 10;
}

/**
 * 產生防偽指紋
 */
export async function sha256(message: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return fallbackSha256(message);
  }

  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err: unknown) {
    return fallbackSha256(message);
  }
}

function fallbackSha256(message: string): string {
  const utf8 = new TextEncoder().encode(message);
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

export function resolveMoneyValue(value: MoneyValue | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (Array.isArray(value) && value.length === 2) {
    const [min, max] = value;
    const range = max - min;
    const step = 10;
    const steps = Math.floor(range / step);
    return Math.floor(Math.random() * (steps + 1)) * step + min;
  }
  return 0;
}

/**
 * UI 格式化工具：統一處理數值正負號與繁體中文單位
 * @param forceShowPlus 是否強制顯示正號 (用於顯示變動量)
 */
export function formatValue(val: number, unit: string = '', forceShowPlus: boolean = false): string {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const sign = isNegative ? '-' : (forceShowPlus && val > 0 ? '+' : '');
  return `${sign}${absVal}${unit}`;
}
