/**
 * 《創業冒險：現代法律篇》核心型別定義與開發規範
 *
 * 本文件為系統之唯一真值來源 (Single Source of Truth)，定義了遊戲資產、
 * 法律毀滅機制、雜湊鏈審計與結局判定之核心邏輯。
 *
 * 參考規範：GEMINI.md (V2.88+)
 */

// ============================================================
// ⚖️ 玩家與資源庫 (Players & Resources)
// ============================================================

/**
 * 專業人才職能 (GEMINI.md §4)
 * lawyer: 律師 (處理起訴/撤告) | pr: 公關 (操縱名聲/博弈)
 * accountant: 會計 (信託/稅收) | cto: 技術長 (AP/系統優化)
 */
export type RoleType = 'lawyer' | 'pr' | 'accountant' | 'cto';

/** 職能等級 (0-3)：LV1 提供基礎加成，LV3 開啟專屬路徑 (如會計師信託自動轉移) */
export type RoleLevel = 0 | 1 | 2 | 3;

/** 專業人才團隊分佈快照 */
export type RoleMap = Record<RoleType, RoleLevel>;

/**
 * 錄得行為標籤 (AppliedTag)
 * 於卡牌決策完成時產生，作為法庭階段的敘事與起訴依據。
 */
export interface AppliedTag {
  tag: string[]; // 犯罪標籤名稱 (如 [「偽造文書罪」])
  netIncome: number; // 非法獲利快照 (單位: 萬元)。罰金基數 = netIncome * 3.0 (§2-2)
  lawCaseIds?: string[]; // 關聯法典 ID，若無則由司法系統動態判定
  rpChange: number; // 該決策導致的名聲隨動快照 (用於勝訴回撥)
  multiplier?: number;
  multiplierSource?: string;
  surface_term?: string;
  hidden_intent?: string;
  escape?: string;
}

/**
 * 加密雜湊鏈標籤 (Hash Chain Tag)
 * 具備 SHA-256 指紋，確保紀錄不可回溯修改 (§5)。
 */
export interface Tag {
  id: number; // 事件存根 ID (Timestamp-based)，同一決策產生的多個標籤共享此 ID
  text: string; // 標籤名稱
  turn: number; // 錄得回合 (1-50)。用於聖皇路徑判定 (末 5 回合清白)
  timestamp: string; // 生成之 ISO 8601 時間戳
  isCrime: boolean; // 犯罪特徵旗標：決定是否觸發起訴機率判定
  hash: string; // 雜湊鏈簽名：SHA256(PreHash + Text + TS)
  netIncome: number; // 入帳收益存根 (單位: 萬元)
  lawCaseIds?: string[];
  rpChange?: number;
  isResolved?: boolean; // 結案標記：勝訴後設為 True，其關聯黑材料將被「一案一清」
  multiplier?: number; // 獲取倍率 (如 x2)
  multiplierSource?: string; // 倍率來源 (如 'CTO')
  surface_term?: string;
  hidden_intent?: string;
  escape?: string;
}

/**
 * 黑材料來源追蹤 (BlackMaterialSource)
 * 實現標籤與黑材料點數 (BM) 的精準綁定，支持精算起訴率與定向撤案。
 */
export interface BlackMaterialSource {
  tag: string; // 產生源標籤
  count: number; // 黑材料點數：採「基礎 1 點 + 類別加重」機制 (B 類總計約 2, C 類總計約 4)
  actionId: number; // 溯源關鍵：連結至特定犯罪事件 ID (Tag.id)
  turn: number; // 生成回合：區分「新生成 BM」(3.5% 加成) vs「既有舊 BM」(0.8% 加成)
}

/**
 * 玩家主體實體 (Player Entity)
 * 遊戲內所有交互之核心狀態存儲。
 */
export interface Player {
  id: string; // 系統唯一 UUID，嚴禁隨意覆寫
  name: string; // 企業/法人名稱
  g: number; // 核心流動資產 (萬元)。G <= 0 且無信託時判定破產 (§3-2)
  rp: number; // 社會信用名聲 (0-100)。< 50 收益減半 (§1-2)；<= 20 全局判定失效
  ip: number; // 政治人脈資源。用於人才升級成本 (消耗 100 IP/級)
  ap: number; // 行動力。每回合重置 5 點，可用於重抽手牌 (消耗 1 AP)
  blackMaterialSources: BlackMaterialSource[]; // 黑材料精算庫
  tags: Tag[]; // 完整犯罪史紀錄 (雜湊鏈)
  trustFund: number; // 會計師信託金 (上限 1000 萬)。破產時唯一續命資產 (§4-2)
  totalTrials: number; // 累計被告次數：影響敗訴後的累犯加重倍率
  roles?: Partial<RoleMap>; // 專業團隊構成
  isBankrupt: boolean; // 破產終止旗標
  skipNextCard: boolean; // 負面狀態：代表受監管。下回合首張卡片效果無效
  consecutiveCleanTurns: number; // 連續清白回合計數：驅動信託金自動轉移 (§4-2)
  genesisHash: string; // 雜湊起點签章
  lastHash: string; // 當前雜湊尾端指標
  startPath?: StartPath; // 開局路徑影響初始資源佈點
  bribeItem?: BribeItem; // 法庭干預道具 (古董、名酒等)
  totalIncome: number; // 生涯總營運獲益累計 (不含初始資本)，用於評價系統
  totalFinesPaid: number; // 累計繳納代價 (單位: 萬元)，包含罰金與撤告費用
  totalTagsCount: number; // 違法階梯：每 40 標籤提升 10% 起訴下限 (§2-1)
  hasUsedExtraAppeal: boolean; // 每局限用 1 次的非常上訴權限 (§4-4)
  startBonusFineReduction?: number; // 開局永久罰金減免比例 (例如 0.05 代表 5%)
}

/** 法官性格風格：影響案件減免、裁決機率與特定對話風格 */
export type JudgePersonality =
  | 'traditionalist'
  | 'algorithmic'
  | 'elegant'
  | 'pragmatic'
  | 'power_broker';

/** 法庭運行模式：ai (GPT-4o 強力驅動動態辯論) | website (靜態文本對局) */
export type JudgeMode = 'ai' | 'website' | null;

/** 導覽標籤類型 */
export type NavTab = 'home' | 'shop' | 'scan';

/** 開局與互動道具類型 */
export type BribeItem = 'antique' | 'crypto' | 'art' | 'wine' | 'intel';
export type StartPath = 'normal' | 'backdoor' | 'blackbox';

// ============================================================
// 🃏 卡牌決策引擎 (Card & Decision Engine)
// ============================================================

/**
 * 特殊邏輯標籤 (Special Logic Tags)
 * sue: 強制起訴 (E 類或嚴重違規失敗觸發)
 * declareLogic: 洗錢二階 (C 類卡牌必備，偵測到此標籤則開啟二階申報/隱匿選單)
 * skip_next: 跳過下回合首張卡片 (政府管制或特定負面事件)
 */
export type SpecialTag = 'sue' | 'declareLogic' | 'skip_next';

/** 選項基礎規格 */
export interface BaseOption {
  label?: string; // UI 標題
  ap?: number; // 行動力消耗 (若不填則由引擎預設為 1)
  costG?: number; // 固定資金成本消耗
  skipNextCard?: boolean; // 副作用：引發政府管制鎖定
  special?: SpecialTag; // 邏輯擴充標籤 (§6-5)
  rp?: number; // 預設名聲
  ip?: number; // 預設技術資產 (IP) (§5-4)
  g?: number; // 預設資金收益 (用於扁平結構)
  lawCaseIds?: string[]; // 關聯法典 ID (以此為基礎計算 BM，1 標籤 = 1 BM)
  surface_term?: string;
  hidden_intent?: string;
  escape?: string;
}

/** 選項類型分類 (GEMINI.md §5-2 / §6-1) */
export type OptionType = 'X' | 'Y' | 'Z';
export type LocationType = 'A' | 'B' | 'C' | 'D' | 'E';

/** X 型 (合法型)：透明商業行為。不觸發任何法律風險 (無標籤/無 BM)。 */
export interface OptionX extends BaseOption {
  type: 'X';
  succRate: number; // 基礎成功率 (通常 > 0.8)
  succ: {
    g?: number;
    rp?: number;
    ip?: number;
    bm?: number | 'all'; // 用於消除/減少現有黑材料
    lawCaseIds?: string[];
  };
  fail: {
    g?: number;
    rp?: number;
    ip?: number;
    loss?: number;
  };
}

/** Y 型 (灰色型)：遊走灰色地帶。法律風險 (BM) 依所屬法案標籤數累計。其中 C 類卡無此選項。 */
export interface OptionY extends BaseOption {
  type: 'Y';
  succRate?: number; // 支援機率檢定
  succ?: {
    g?: number;
    rp?: number;
    ip?: number;
    bm?: number;
    lawCaseIds?: string[];
  };
  fail?: {
    g?: number;
    rp?: number;
    ip?: number;
    lawCaseIds?: string[];
  };
}

/** Z 型 (違法型)：明顯違法行為。法律風險依標籤數累計；C 類卡將觸發申報/略過機制 (略過額外 +2 BM)。 */
export interface OptionZ extends BaseOption {
  type: 'Z';
  succRate?: number;
  succ?: {
    g?: number;
    rp?: number;
    ip?: number;
    bm?: number | 'all';
    lawCaseIds?: string[];
  };
  fail?: SpecialFail;
}

/** 特殊失敗情境：黑箱或滅證操作失敗觸發之「強制起訴」路徑 */
export interface SpecialFail {
  g?: number;
  rp?: number;
  ip?: number;
  loss?: number;
  special?: 'sue';
  lawCaseIds?: string[];
}

/** 決策結果包裹：用於 Store 狀態同步與 UI 更新 */
export interface ActionResult {
  success: boolean; // 原子操作狀態：AP 不足或邏輯衝突時為 False
  message: string; // 系統回饋描述 (包含結果標題與詳細敘事)
  updates: Partial<Player>;
  appliedTags: AppliedTag[]; // 本次行動固化下來的犯罪特徵
  apRefunded: boolean; // CTO 等級能力觸發標記
  log: Omit<ActionLog, 'hash'>; // 日誌存根 (待雜湊後上鏈)
  actionId: number; // 關聯唯一決策 ID：實現一案一清之物理依據
  forcedTrial?: { tagId: number; reason: string }; // 強制起訴訊號
  bm?: number; // 當次決策產生的新增黑材料點數
}

export type CardOption = OptionX | OptionY | OptionZ;

/** 區域情境卡牌 (1+3 結構) */
export interface Card {
  title?: string;
  description?: string;
  1: CardOption;
  2: CardOption;
  3: CardOption;
}

export type CardsDatabase = Record<string, Card>;

/** 行動存根日誌：為 Hash Chain 審計之基石 (§5) */
export interface ActionLog {
  playerId: string;
  turn: number;
  cardId: string;
  optionIndex: number;
  tags: string; // 逗號分隔之標籤彙總
  timestamp: string; // 決策固化之 ISO 8601
  hash: string; // 決策雜湊指紋 (不可篡改性證明)
}

// ============================================================
// 🏛️ 法典與法庭管理 (Law & Courtroom)
// ============================================================

/** 法案核心定義 (GEMINI.md §7) */
export interface LawCase {
  id: string; // 內部編號 (對應 LawCasesDB Key)
  tag: string[]; // 行動關聯標籤 (支援多重標籤)
  lawName: string; // 引用法典正名 (e.g., 「洗錢防制法 §5」)
  hidden_intent: string; // 敗訴之違法背後動機
  survival_rate: number; // 原始脫身勝訴率 (0.1 - 0.9)
  evidence_list: string[]; // 採樣之法庭證據清單
  // --- 網站模式專屬 JKL 辯護選項 (預留填充區) ---
  // --- 網站模式專屬 JKL 辯護選項與專屬法庭反駁 ---
  defense_j?: string; // 選項 J：+0%
  defense_j_text?: string;
  web_judgment_j?: string;
  edu_j?: string;

  defense_k?: string; // 選項 K：+5%
  defense_k_text?: string;
  web_judgment_k?: string;
  edu_k?: string;

  defense_l?: string; // 選項 L：+10%
  defense_l_text?: string;
  web_judgment_l?: string;
  edu_l?: string;

  web_judgment_win?: string; // 網站模式通用勝訴法官台詞 (Fallback)
  web_judgment_lose?: string; // 網站模式通用敗訴法官台詞 (Fallback)
  surface_term?: string;
  escape?: string;
}

/** 遊戲宏觀階段 */
export type GamePhase = 'play' | 'summary' | 'courtroom' | 'gameover' | 'victory';

/**
 * 遊戲目前的狀態
 */
export interface PlayerConfig {
  name: string;
  path: StartPath;
  bribeItem?: BribeItem;
}

export interface GameStateData {
  players: Player[]; // 所有的玩家
  turn: number; // 目前是第幾回合
  currentPlayerIndex: number; // 輪到誰了
  phase: GamePhase; // 目前在哪個畫面
  actionLogs: ActionLog[]; // 過去的紀錄
  trial: TrialState | null; // 法庭審判的詳細資料
  judgePersonality: JudgePersonality | null;
  judgeMode: JudgeMode;
  startNotifications: string[]; // 開局背景與路徑增益提示
  usedCodes: string[]; // 已領取的實體卡片代碼紀錄
  endingResult: EndingResult | null;
  engineError: { context: string; message: string } | null; // 核心引擎致命錯誤攔截快照
  pendingTrialId?: string; // 引擎傳發：待處理的法庭起訴 ID
}

export type BetChoice = 'win' | 'lose' | 'none';
export interface Bet {
  playerId: string;
  choice: BetChoice;
}

/**
 * 法庭對局階段管理 (§6)
 * 1: 起訴敘事 | 2: 旁觀者干預 | 3: 場外賭局 | 4: 被告答辯
 * 5: 律師介入 (撤告/撤案) | 6: 庭審裁決 | 7: 非常上訴
 */
export type TrialStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** 法庭對局實例狀態 */
export interface TrialState {
  defendantId: string;
  lawCase: LawCase;
  stage: TrialStage;
  bystanderIds: string[]; // 擁有干預/押注權限之非被告玩家
  actingBystanderIndex: number;
  interventions: { playerId: string; text: string }[]; // 旁觀者發言影響力存根
  bets: Bet[]; // 盈虧自負之博弈數據
  question?: string; // 法官發問 (Stage 4)
  narrative?: string; // 庭審各階段之動機描述與對話
  defenseText?: string; // 被告答辯全文內容
  chosenDefenseLabel?: string; // 玩家實際選擇的 J/K/L 選項內容
  isDefenseSuccess?: boolean; // 答辯判定結果
  finalSurvivalRate?: number; // 結算點之最終存活機率快照
  judgment?: string; // 最終判決摘要文案
  extraAppealUsed?: boolean; // 本場法庭是否已申請非常上訴
  isAppeal?: boolean; // 非常上訴回合標記：用於套用 6.0x 嘲諷文案
  punishment?: { fine: number; rpLoss: number }; // 固定裁罰金額與名聲剝奪量
  punishmentDetail?: string; // 罰金計算明細文本 (e.g. "300萬 - 20%折扣 = 240萬")
  isReady: boolean; // 操作權限鎖定標記 (倒數計時門檻)
  timer: number; // 各階段交互限時
  systemPrompt?: string; // AI Judge 情境注入存根
  userPrompt?: string; // AI Judge 數據快照
  lawCaseTagId?: number; // 確指之非法標籤索引：用於結案後標記 Resolve
  isInevitable?: boolean; // 不可規避標記：特定行為觸發之強制傳票
  forcedReason?: string; // 強制判定之邏輯解釋
  judgePersonality?: JudgePersonality;
  /** AI 模式下動態產出的 JKL 辯護選項文案 */
  generatedOptions?: {
    j: string;
    k: string;
    l: string;
  };
}

// ============================================================
// 🏆 結局判定與結算報告 (Evaluation & Endings)
// ============================================================

/** 結局優先級路徑 (GEMINI.md §3-1 / §3-4) */
export type VictoryRoute = 'tycoon' | 'saint' | 'dragonhead' | null;

/** 結局類型編碼 */
export type EndingType = 'dragonhead' | 'tycoon' | 'saint' | 'bankrupt' | 'arrested' | 'limit';

/** 結局結算最終報告：包含財富、聲譽與歷史罪行之綜合評價 */
export interface EndingResult {
  playerId: string;
  type: EndingType;
  title: string; // 結局標題 (e.g. 『偽聖皇』)
  evaluation: string; // 依標籤構成生存之評價稱號集 (e.g. 『逃稅達人 / 法外狂徒』)
  description: string; // 最終敘事文案
  stats: {
    totalProfit: number; // 最終總資產 (萬元，含海外信託)
    totalFines: number; // 累計法治代價累計
    finalRp: number; // 當前結算信用名聲
  };
}
