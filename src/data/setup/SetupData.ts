import type { StartPath } from '../../types/game';

/**
 * 開局設定文字
 * 包含玩家在開局時的人數選擇、模式選擇、命名引導等文字。
 */
export const SETUP_TEXT = {
  SETUP_TITLE: '創業之路',
  SETUP_SUBTITLE: '請選擇參與本局對弈的企業家數量 (1-4人)',
  // 命運的交叉路口：選擇要對抗死板呆滯的腳本法官，還是要面對變化莫測、冷酷無情的 AI 大語言模型法官
  MODE_SELECT: {
    TITLE_MAIN: '創業冒險',
    TITLE_SUB: '現代法律篇',
    PROMPT: '請選擇本局遊戲的法官模擬模式',
    WEBSITE_TITLE: '網站模式',
    WEBSITE_DESC: '使用固定戲劇性文案模板，無需等待 AI 生成',
    WEBSITE_BTN: '開始遊戲',
    AI_TITLE: 'AI 模式',
    AI_DESC: '由 LLM 生成無限變化的判決，支援自由文字陳述',
    AI_BTN: '開始遊戲',
  },
  PLAYER_COUNT_LABEL: 'Players',
  EXIT_BTN: '返回模式選擇',
  NEXT_STEP_BTN: '進入各別設定',
  BACK_TO_COUNT_BTN: '返回人數選擇',
  BACK_TO_PREP_BTN: '返回',
  BACK_TO_PREV_PLAYER_BTN: '返回上一位玩家',
  NEXT_PLAYER_BTN: '確認，下一位玩家',
  START_GAME_BTN: '開始創業',

  // 開局新聞快報：依照玩家有沒有在起跑點作弊 (塞紅包)，播報出來的系統廣播
  NORMAL_BONUS_MSG: (name: string) =>
    `恭喜！${name} 選擇了白手起家，獲得減少懲罰（-5% 罰金）的獎勵！`,
  BRIBE_BONUS_MSG: (name: string, judge: string, itemName: string) =>
    `恭喜！${name} 準備的 ${itemName} 深受 ${judge} 喜愛，獲得減少懲罰（-20% 罰金）的獎勵！`,

  REGISTRATION_TITLE: '經營權登記',
  AVOIDANCE_NOTICE: '請其餘閒雜人等迴避', // 確保背後沒有他人在偷瞄底牌的警告標語
  SECRET_SETTING_PROMPT: '準備進行秘密設定',
  START_SETTING_BTN: '點擊開始設定',

  // 企業登記表的預設文字
  NAME_LABEL: '企業名稱',
  NAME_PLACEHOLDER: (idx: number) => `例如：九龍集團 (預設: 企業 ${idx + 1})`,
  PATH_LABEL: '選擇開局天賦',
  PREP_MEANS_LABEL: '初始預備手段', // 例如行賄古董給老法官
  DEFAULT_BRIBE_NAME: '禮物', // 當找不到賄賂品對應標籤時的預設中文名稱
  DEFAULT_CORP_NAME: (idx: number) => `企業 ${idx + 1}`,
};

import { CARDS_START } from '../cards/CARDS_START';

/**
 * 將長篇描述文本依照段落切割成適合書本分頁的數組
 */
const splitDescriptionToPages = (description: string): string[] => {
  const paragraphs = description.split('\n').filter(p => p.trim() !== '');
  const pages: string[] = [];
  // 每兩段分一頁，確保閱讀氣息感
  for (let i = 0; i < paragraphs.length; i += 2) {
    pages.push(paragraphs.slice(i, i + 2).join('\n\n'));
  }
  return pages;
};

/**
 * 經營權登記路徑名稱對照
 */
export const START_PATH_NAMES: Record<StartPath, string> = {
  normal: '白手起家',
  backdoor: '融資創業',
  blackbox: '家族企業',
};

/**
 * 從 CARDS_START 動態獲取開局路徑的劇情內容
 */
export const START_PATH_LABELS: Record<StartPath, string[]> = {
  normal: splitDescriptionToPages(CARDS_START.START_PATHS[1].description),
  backdoor: splitDescriptionToPages(CARDS_START.START_PATHS[2].description),
  blackbox: splitDescriptionToPages(CARDS_START.START_PATHS[3].description),
};
