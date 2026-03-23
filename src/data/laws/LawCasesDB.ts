import type { LawCase } from '../../types/game';
import { LAWS_A } from './LAWS_A';
import { LAWS_B } from './LAWS_B';
import { LAWS_C } from './LAWS_C';
import { LAWS_D } from './LAWS_D';
import { LAWS_E } from './LAWS_E';
import { LAWS_SYS } from './LAWS_SYS';

/**
 * [六法全書] 地下法庭查哨站 (Law Cases DB)
 * 匯總所有黑灰產提案背後對應的起訴法條、脫罪藉口 (escape) 以及會被貼上的前科標籤 (tag)。
 * 審判引擎 (CourtEngine) 要開鍘前，會先來這裡查表，看看這次該用哪一條罪名跟勝率把對手踢進大牢。
 */
export const LAW_CASES_DB: Record<string, LawCase> = {
  ...LAWS_A,
  ...LAWS_B,
  ...LAWS_C,
  ...LAWS_D,
  ...LAWS_E,
  ...LAWS_SYS,
};
