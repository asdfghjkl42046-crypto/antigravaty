/**
 * 玩家檔案與前科管理局
 * 負責創建玩家角色、決定開局財產，加上管理黑歷史與洗白機制
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

// ============================================================
// 黑歷史與犯罪證據管理
// ============================================================

/**
 * 計算玩家總黑材料數
 * 將玩家身上所有的 BlackMaterialSource 陣列中的 count (累積罪證) 進行加總
 */
export function getTotalBlackMaterials(player: Player): number {
  return (player.blackMaterialSources || []).reduce((sum, s) => sum + s.count, 0);
}

/**
 * 增加犯罪前科
 * 當玩家做了壞事，系統會把這筆帳記在對應的標籤上，等著秋後算帳
 */
export function addBlackMaterials(
  sources: BlackMaterialSource[], // 目前玩家身上的黑料歷史清單
  tags: string[], // 這次行動牽涉的違法標籤陣列
  bmPerAction: number, // 這次行動總共會產生多少個黑材料單位
  actionId: number, // 對應引發黑料的歷史行動局 ID
  turn: number // 發生於第幾回合
): BlackMaterialSource[] {
  const updated = [...sources];
  // 總裁指示：如果遇到例外狀況沒有具體標籤名稱，不能苟且使用 unknown 帶過，必須強制拋出 Error 報錯！
  if (!tags || tags.length === 0) {
    throw new Error('嚴重異常：試圖記錄犯罪黑資料，卻未提供具體的違犯標籤（tags array 為空）！');
  }
  const tagList = tags;
  // 使用精確除法防止任何通膨
  const perTag = bmPerAction / tagList.length;

  for (const tag of tagList) {
    // 檢查這筆罪刑在相同的行動來源下，是否已經被立案過
    const existing = updated.find((s) => s.tag === tag && s.actionId === actionId);
    if (existing) {
      // 若曾經立案，則直接疊加最新的罪證數量
      existing.count += perTag;
    } else {
      // 若尚未記錄，推入一筆全新的犯罪足跡追蹤紀錄
      updated.push({ tag, count: perTag, actionId, turn });
    }
  }
  return updated;
}

/**
 * 銷毀特定證據 (一案一清)
 * 不管法庭判你贏還是輸，只要結案了，這個案子的前科就會被銷毀，不能再告一次
 */
export function removeBlackMaterialsByTag(
  player: Player,
  tagText: string,
  tagId?: number
): BlackMaterialSource[] {
  if (!player || !player.blackMaterialSources) return [];

  // 首先：優先尋找 tagId (即 actionId) 進行高精準度過濾，保留所有 "不屬於這起案件來源" 的黑料
  if (tagId !== undefined && tagId !== 0) {
    return player.blackMaterialSources.filter((s) => s.actionId !== tagId);
  }

  // 備援方案：如果函數沒有被正當傳遞 ID，則退化為使用標籤純文字過濾 (字串必須 100% 吻合)
  return player.blackMaterialSources.filter((s) => s.tag !== tagText);
}

/**
 * 終極洗白法術
 * 直接清空玩家名下所有的犯罪紀錄，立刻變回乾淨企業家
 */
export function clearAllBlackMaterials(): BlackMaterialSource[] {
  return []; // 直接回傳空陣列，代表所有犯罪證據被乾淨除役
}

// ============================================================
// 預設玩家工廠與開局路徑處理器
// ============================================================

// 預設罰金倍率基準：此系統專用於反推「隱蔽路徑玩家」初始自帶標籤的虛擬入帳金額。
// 為了跟 GEMINI.md 2-2 規範的 3 倍基礎罰金定律匹配。
const INITIAL_FINE_MULTIPLIER = 3.0;

/**
 * 創造新玩家檔案
 * 根據玩家選的開局路線 (走後門、黑箱作業)，發放對應的起始資金，甚至塞給你天生的犯罪紀錄
 */
export async function createInitialPlayer(
  name: string,
  path: StartPath,
  bribeItem?: BribeItem
): Promise<Player> {
  // 自動產生具備時間戳與隨機亂碼的唯一玩家流水號 ID
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
  // 建立玩家專屬的防偽出生證明碼
  const genesis = await sha256(`GENESIS_${id}_${name}_${path}`);
  return createPlayerFromConfig(id, name, path, genesis, bribeItem);
}

/**
 * 集中管理不同出身背景的初始資產、社會信用、違法黑金以及天生的罰金減免比例
 */
const STARTING_CONFIGS: Record<
  StartPath,
  { g: number; rp: number; booty: number; tags: string[]; fineReduction: number }
> = {
  normal: {
    g: 100, // 標準起始資金
    rp: 105, // 道德包袱較高，名聲微幅領先
    booty: 0,
    tags: [],
    fineReduction: 0.05, // 正規路徑享有的法院 95 折罰金庇護
  },
  backdoor: {
    g: 250, // 特權啟動資金
    rp: 90, // 但名聲先天受損
    booty: 150, // 違法黑金
    tags: ['【隱蔽型利益輸送】'],
    fineReduction: 0,
  },
  blackbox: {
    g: 400, // 獲得龐大本金
    rp: 75, // 名聲敗壞及格線
    booty: 300, // 鉅額黑金
    tags: ['【隱蔽型利益輸送】', '【數據清洗下的倖存者】'],
    fineReduction: 0,
  },
};

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
  // 1. 初始化路徑數值設定區 (總裁指示：拔除無意義的預設值，改採嚴謹的物件查表法)
  const config = STARTING_CONFIGS[path];
  const initialG = config.g;
  const initialRP = config.rp;
  const initialBooty = config.booty;
  const initialTagTexts = config.tags;

  // 2. 把天生自帶的犯罪紀錄也寫進防偽系統中
  const tags: Tag[] = [];
  let currentHash = genesis;
  const startId = Date.now();

  // 計算每個前科標籤虛擬的「髒款入帳額」：
  // 核心平衡邏輯：為了達成「被告一次就回到 100 萬」的目標，
  // 這裡直接將 totalBooty 作為每個標籤的 netIncome，並在 MechanicsEngine 套用 1.0x 倍率。
  // 因為開局標籤共享同一個證據 ID (startId)，當一案宣告有罪後，相關證據會全數銷毀，
  // 這樣能保證「第一案」就罰回正確總額，且「第二案」不會重複計算。
  const incomePerTag =
    initialTagTexts.length > 0 ? roundUp(initialBooty) : 0;

  // 遍歷該路徑天生帶來的標籤陣列，直接實例化寫入玩家的犯罪史
  for (const text of initialTagTexts) {
    const timestamp = new Date().toISOString();
    // 將「上一個區塊的 Hash」 + 「本次標籤」 + 「時間戳」做 SHA256 加密，形成鏈狀結構
    const newHash = await sha256(currentHash + text + timestamp);
    tags.push({
      id: startId,
      text,
      turn: 0, // 所有的初始標籤一律標定為回合 0 (既有舊案)
      timestamp, // 記錄發生當局的犯案具體時刻
      isCrime: true, // 從特權拿錢必定是犯罪紀錄
      hash: newHash, // 此防偽區塊專用防竄改碼
      netIncome: incomePerTag, // 記錄當初拿了多少錢
      isResolved: false, // 標記為尚未被司法界審理過
    });
    // 收尾換棒：將 currentHash 更新為此次產出的 Hash，以供下一個標籤銜接
    currentHash = newHash;
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
    const config = STARTING_CONFIGS[p.startPath];

    // 1. 檢查路徑自帶的紅利 (例如：'normal' 路徑享有的 95 折庇護)
    if (config.fineReduction > 0) {
      p.startBonusFineReduction = config.fineReduction;
      if (p.startPath === 'normal') {
        startNotifications.push(SETUP_TEXT.NORMAL_BONUS_MSG(p.name));
      }
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
