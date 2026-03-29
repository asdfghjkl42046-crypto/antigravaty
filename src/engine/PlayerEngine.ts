/**
 * 玩家檔案與犯罪紀錄管理
 * 負責幫玩家開新帳號、管理他們的財產、黑歷史還有結案功能。
 */

import type {
  Player,
  StartPath,
  BribeItem,
  BlackMaterialSource,
  Tag,
  JudgePersonality,
} from '../types/game';
import { sha256, roundUp } from './MathEngine';
import { SETUP_TEXT } from '@/data/setup/SetupData';
import { BRIBE_LABELS, JUDGE_LABELS } from '../data/judges/JudgeTemplatesDB';
import { getBribeScore } from './MechanicsEngine';
import { CARDS_DB } from '../data/cards/CardsDB';
import { getResolvedTags, LAW_CASES_DB } from '@/data/laws/LawCasesDB';

// ============================================================
// 黑歷史與犯罪證據管理
// ============================================================

/**
 * 算出玩家身上總共有多少件壞事（黑材料）
 */
export function getTotalBlackMaterials(player: Player): number {
  return (player.blackMaterialSources || []).reduce((sum, s) => sum + (Number(s.count) || 0), 0);
}

/**
 * 增加犯罪紀錄
 * 當玩家做了壞事，系統會把這筆帳記下來。
 */
export function addBlackMaterials(
  sources: BlackMaterialSource[], // 目前玩家身上的壞事清單
  tags: string[], // 這次行動牽涉的違法項目
  bmPerAction: number, // 這次行動總共會產生多少個壞事單位
  actionId: number, // 對應引發壞事的行動編號
  turn: number // 發生於第幾回合
): BlackMaterialSource[] {
  // 複製一份清單：確保修改不會影響到原始資料，保持資料穩定
  const updated = sources.map((s) => ({ ...s }));

  // 驗證項目是否存在
  if (!tags || tags.length === 0) {
    throw new Error('addBlackMaterials: 未提供具體的違法項目 (tags)。');
  }
  const tagList = tags;
  for (const tag of tagList) {
    // 檢查這筆罪刑在相同的行動來源下，是否已經被記錄過
    const existing = updated.find((s) => s.tag === tag && s.actionId === actionId);
    if (existing) {
      // 若已存在相同來源項目，則累加數量
      existing.count += bmPerAction;
    } else {
      // 若尚未記錄，則新增紀錄
      updated.push({ tag, count: bmPerAction, actionId, turn });
    }
  }
  return updated;
}

/**
 * 刪除特定案件的證據
 * 官司打完（結案）後，把那個案子的證據清掉。
 */
export function removeBlackMaterialsByTag(
  player: Player,
  tagText: string,
  tagId?: number
): BlackMaterialSource[] {
  if (!player || !player.blackMaterialSources) return [];

  // 首先：優先尋找案件編號進行精準過濾，保留所有 "不屬於這起案件" 的壞事
  if (tagId !== undefined && tagId !== 0) {
    return player.blackMaterialSources.filter((s) => s.actionId !== tagId);
  }

  // 備援方案：如果函數沒有被傳遞編號，則退化為使用項目名稱過濾 (名稱必須完全吻合)
  return player.blackMaterialSources.filter((s) => s.tag !== tagText);
}

/**
 * 清除所有犯罪紀錄
 */
export function clearAllBlackMaterials(): BlackMaterialSource[] {
  return []; // 變回乾淨的人
}

// ============================================================
// 預設玩家工廠與開局路徑處理器
// ============================================================

// 預設罰金基礎倍率：統一為 1.0x，使基礎罰金與案件不法所得相等。
const INITIAL_FINE_MULTIPLIER = 1.0;

/**
 * 創造新玩家檔案
 * 根據玩家選的開局路線，發放對應的起始資金，甚至塞給你天生的犯罪紀錄
 */
export async function createInitialPlayer(
  name: string,
  path: StartPath,
  bribeItem?: BribeItem
): Promise<Player> {
  // 自動產生具備時間戳與隨機亂碼的唯一玩家編號
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
  // 建立玩家專屬的防偽出生證明碼
  const genesis = await sha256(`GENESIS_${id}_${name}_${path}`);
  return createPlayerFromConfig(id, name, path, genesis, bribeItem);
}

/**
 * 集中管理不同出身背景的初始資產、社會信用、違法黑金以及天生的罰金減免比例
 */
/**
 * 內部助手：將路徑代號轉換為虛擬卡牌的選項索引
 */
function getPathOptionIndex(path: StartPath): 1 | 2 | 3 {
  if (path === 'normal') return 1;
  if (path === 'backdoor') return 2;
  return 3;
}

/**
 * 內部助手：根據配置檔與基礎資料，組裝出完整的玩家實體
 */
async function createPlayerFromConfig(
  id: string,
  name: string,
  path: StartPath,
  genesis: string,
  bribeItem?: BribeItem
): Promise<Player> {
  // 1. 初始化路徑數值設定區：從虛擬系統卡牌讀取數據
  const card = CARDS_DB['START_PATHS'];
  const optIdx = getPathOptionIndex(path);
  const opt = card[optIdx];
  const config = opt.succ!;

  const initialG = config.g || 100;
  const initialRP = config.rp || 100;
  const initialLawCaseIds = config.lawCaseIds || [];

  // 動態解析標籤，確保與法律資料庫同步
  const initialTagTexts = getResolvedTags(initialLawCaseIds);

  // 計算不法所得：資金總額扣除保底 100 萬後，即為該路徑之原罪代價
  const initialBooty = Math.max(0, initialG - 100);

  // 2. 把天生自帶的犯罪紀錄也寫進防偽系統中
  const tags: Tag[] = [];
  let currentHash = genesis;
  const startId = Date.now();
  const timestamp = new Date().toISOString();

  // 遍歷該路徑帶來的法案，展開其下的所有標籤，並實例化寫入玩家犯罪史
  for (const lawCaseId of initialLawCaseIds) {
    const lawCase = LAW_CASES_DB[lawCaseId];
    if (!lawCase) continue;

    const caseTags = Array.isArray(lawCase.tag) ? lawCase.tag : [lawCase.tag];

    for (const text of caseTags) {
      // 將「上一個區塊的加密碼」 + 「本次標籤」 + 「時間戳」做加密，形成鏈狀結構
      const newHash = await sha256(currentHash + text + timestamp);

      tags.push({
        id: startId,
        text,
        turn: 0, // 初始前科均標記為第 0 回合
        isCrime: true,
        isResolved: false,
        timestamp,
        hash: newHash,
        surface_term: lawCase.surface_term,
        hidden_intent: lawCase.hidden_intent,
        escape: lawCase.escape,
        netIncome: initialBooty, // 存入起始黑金基數
        lawCaseIds: [lawCaseId], // 寫入精確 ID
      });

      currentHash = newHash;
    }
  }

  // 將所有屬性打包成新玩家檔案
  return {
    id,
    name,
    g: initialG,
    rp: initialRP,
    ip: 0, // 每位玩家初始人脈點數必定從 0 起跳
    ap: 5, // 預設每回合給予 5 點基礎行動力
    // 如果身上有帶原罪標籤開局，同步會被生出一筆 1 點的對應黑料量作為引信
    blackMaterialSources: tags.map((t) => ({
      tag: t.text,
      count: 1,
      actionId: startId,
      turn: 0,
    })),
    tags,
    trustFund: 0, // 海外實體避險信託帳戶歸 0
    totalTrials: 0, // 歷史總計上法院次數為 0
    roles: { lawyer: 0, pr: 0, accountant: 0, cto: 0 }, // 初始無任何人力銀行天賦啟用
    isBankrupt: false, // 是否宣告破產出局
    skipNextCard: false,
    // 正規路徑開局享有一回合 Streak Bonus (連續守法回合數從 1 起跳)，其他走歪路的則從 0 開局重新計算
    consecutiveCleanTurns: tags.length > 0 ? 0 : 1,
    genesisHash: genesis, // 帳號創世區塊碼永久防偽保存
    lastHash: currentHash, // 紀錄最後一個區塊的 Hash 供日後抽卡事件繼續銜接打鏈
    startPath: path,
    bribeItem,
    totalIncome: initialG, // 作為賽後成就統計生涯最大總資金歷史紀錄
    totalFinesPaid: 0,
    totalTagsCount: tags.length,
    hasUsedExtraAppeal: false, // 非常上訴(緊急豁免) 權利保留尚未行使
    startBonusFineReduction: 0, // 在稍後的 init 廣播函式內才會計算賦予
  };
}

export interface PlayerConfig {
  name: string;
  path: StartPath;
  bribeItem?: BribeItem;
}

/**
 * 遊戲開局總設定
 * 負責把所有玩家拉進遊戲、隨機選出一位法官，並結算玩家開局送禮有沒有拍對馬屁
 */
export async function initializeGameSession(
  configs: PlayerConfig[],
  sortFn: (players: Player[], round: number) => Player[]
): Promise<{
  players: Player[];
  judgePersonality: JudgePersonality;
  startNotifications: string[];
}> {
  // 從資料庫動態撈取所有註冊在案的法官人格
  const personalities = Object.keys(JUDGE_LABELS) as JudgePersonality[];
  const judge = personalities[Math.floor(Math.random() * personalities.length)];

  // 透過配置檔非同步並行調用工廠，實例化出每位玩家
  const players = await Promise.all(
    configs.map((c) => createInitialPlayer(c.name, c.path, c.bribeItem))
  );

  // 利用外部傳入的引擎排序邏輯決定第一回合的第一動名單輪次
  const sortedPlayers = sortFn(players, 1);
  const startNotifications: string[] = [];

  // 走訪所有已完成建制的玩家，計算並廣播開局天賦紅利 (Bonus)
  sortedPlayers.forEach((p: Player) => {
    if (!p.startPath) return;

    // 1. 檢查路徑自帶的紅利 (例如：'normal' 路徑享有的 95 折庇護)
    // 這裡維持邏輯特判：僅白手起家路徑享有 5% 永久減免
    if (p.startPath === 'normal') {
      p.startBonusFineReduction = 0.05;
      startNotifications.push(SETUP_TEXT.NORMAL_BONUS_MSG(p.name));
    }

    // 2. 特權關說玩家：檢查開場攜帶的貢品與這場法官人設的契合度 (滿分為5)
    if (p.bribeItem) {
      const score = getBribeScore(judge, p.bribeItem);
      // 若完美猜中法官胃口 (5分滿)，取得極高法槌好感度庇護
      if (score === 5) {
        // 該玩家終生罰金八折 (-20% 減免)！
        p.startBonusFineReduction = 0.2;
        const judgeName = JUDGE_LABELS[judge].judgeName;
        const itemName = BRIBE_LABELS[p.bribeItem] || SETUP_TEXT.DEFAULT_BRIBE_NAME;
        // 發布開局獎賞的驚喜廣播
        startNotifications.push(SETUP_TEXT.BRIBE_BONUS_MSG(p.name, judgeName, itemName));
      }
    }
  });

  return { players: sortedPlayers, judgePersonality: judge, startNotifications };
}
