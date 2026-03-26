import type { LawCase } from '../../types/game';
import { LAWS_A } from './LAWS_A';
import { LAWS_B } from './LAWS_B';
import { LAWS_C } from './LAWS_C';
import { LAWS_D } from './LAWS_D';
import { LAWS_E } from './LAWS_E';
import { LAWS_START } from './LAWS_START';

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
  ...LAWS_START,
};

/**
 * 根據法條實體 ID 列表動態解析並合併所有對應的犯罪標籤
 * @param lawCaseIds 法條編號陣列
 * @returns 去重後的標籤字串陣列
 */
export function getResolvedTags(lawCaseIds?: string[]): string[] {
  if (!lawCaseIds || lawCaseIds.length === 0) return [];
  const tagSet = new Set<string>();
  for (const id of lawCaseIds) {
    const law = LAW_CASES_DB[id];
    if (law && law.tag) {
      if (Array.isArray(law.tag)) {
        law.tag.forEach((t) => tagSet.add(t));
      } else {
        // 相容舊版單一字串格式 (若仍存在)
        tagSet.add(law.tag);
      }
    }
  }
  return Array.from(tagSet);
}
