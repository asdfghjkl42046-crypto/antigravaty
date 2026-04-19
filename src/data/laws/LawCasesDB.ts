import type { LawCase } from '../../types/game';
import { LAWS_A } from './LAWS_A';
import { LAWS_B } from './LAWS_B';
import { LAWS_C } from './LAWS_C';
import { LAWS_D } from './LAWS_D';
import { LAWS_E } from './LAWS_E';
import { LAWS_START } from './LAWS_START';
import { throwDataDefinitionError } from '../../engine/errors/EngineErrors';

/**
 * 法律案件資料庫
 * 包含所有案件的起訴法條、辯護藉口與犯罪標籤。
 * 法庭系統會在這裡查詢案件資料。
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
 * 將各種格式的 LawCase ID 正規化為標準格式 (例如 A011 -> A-01-1)
 * @param id 原始 ID
 * @returns 正規化後的標準 ID
 */
export function normalizeLawCaseId(id: string): string {
  if (!id) return '';
  const trimmed = id.trim().toUpperCase();

  // 處理緊湊格式：[A-E][數字兩位][數字一位] (例如 A011, B113)
  const compactRegex = /^([A-E])(\d{2})(\d)$/;
  const match = trimmed.match(compactRegex);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  // 處理已經帶有橫槓但不規範的情況 (例如 a-1-1 -> A-01-1)
  // 若需要更嚴謹的補零邏輯可在此擴充，目前優先處理用戶指定的緊湊轉標準格式
  return trimmed;
}

/**
 * 根據法條實體 ID 列表動態解析並合併所有對應的犯罪標籤
 * @param lawCaseIds 法條編號陣列
 * @returns 去重後的標籤字串陣列
 */
export function getResolvedTags(lawCaseIds?: string[]): string[] {
  if (!lawCaseIds || lawCaseIds.length === 0) return [];
  const tagSet = new Set<string>();
  for (const id of lawCaseIds) {
    const normalizedId = normalizeLawCaseId(id);
    const law = LAW_CASES_DB[normalizedId];
    if (law && law.tag) {
      if (Array.isArray(law.tag)) {
        law.tag.forEach((t) => tagSet.add(t));
      } else {
        // 相容舊版單一字串格式 (若仍存在)
        tagSet.add(law.tag as unknown as string);
      }
    } else {
      throwDataDefinitionError(
        'LawCasesDB.getResolvedTags',
        `找不到法條 ID: ${normalizedId} (原始 ID: ${id})，請檢查卡牌資料是否正確。`
      );
    }
  }
  return Array.from(tagSet);
}

/**
 * 格式化顯示用標籤
 * 把標籤陣列轉換成方便顯示的字串（用 / 隔開）。
 * @param tag 原始標籤數據
 * @returns 格式化後的顯示字串
 */
export function formatLawTags(tag: string | string[] | undefined): string {
  if (!tag) return '未知罪嫌';
  if (Array.isArray(tag)) {
    return tag.length > 0 ? tag.join('/') : '無標籤';
  }
  return tag; // 若為字串則直接回傳
}
