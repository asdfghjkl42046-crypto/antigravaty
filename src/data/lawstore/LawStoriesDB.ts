import { STORIES_A } from './LawStories_A';
import { STORIES_B } from './LawStories_B';
import { STORIES_C } from './LawStories_C';
import { STORIES_D } from './LawStories_D';
import { STORIES_E } from './LawStories_E';
import { STORIES_START } from './LawStories_START';

export interface RealLawStory {
  background?: string[]; // 1. 背景：支援多段落
  event: string[]; // 2. 事件：支援多段落字串。若以此 "QUOTE:" 開頭，會在 UI 上特別顯示成高亮框
  suspect?: string;
  reason?: string;
  result?: string;
  link?: string; // 外部卷宗或新聞連結
}

/**
 * 台灣真實判例故事資料庫 (Law Case Real Stories)
 * 每個法條案件 (LawCase ID) 對應一則真實社會事件或判決故事。
 */

export const LAW_STORIES_DB: Record<string, RealLawStory> = {
  ...STORIES_A,
  ...STORIES_B,
  ...STORIES_C,
  ...STORIES_D,
  ...STORIES_E,
  ...STORIES_START,
  
  // -- 預設回退文案 (當找不到對應法案故事時顯示) --
  'DEFAULT': {
    event: ['（關於此法條的真實判例故事尚未建檔，敬請期待後續更新。你可以在現實中多關注類似的新聞案件！）'],
  }
};

/**
 * 根據法條 ID 取得真實判例故事
 * @param lawCaseId 對應的 法條 ID
 * @returns 真實故事文案，若無則回傳預設提示
 */
export function getLawStory(lawCaseId: string): RealLawStory {
  const story = LAW_STORIES_DB[lawCaseId];
  return story ? story : LAW_STORIES_DB['DEFAULT'];
}
