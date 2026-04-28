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
 * 這邊定義了玩家可以雇用的人才功能
 * lawyer: 律師 (負責處理官司、撤告等法律事務)
 * pr: 公關 (操縱名聲、應對輿論與法庭押注)
 * accountant: 會計 (處理海外信託、節稅紅利)
 * cto: 技術長 (AP 自動化補回、反制挖角)
 */
export type RoleType = 'lawyer' | 'pr' | 'accountant' | 'cto';

/** 人才等級 (0-3)：等級越高，特殊技能的強度或自動化功能就越強 */
export type RoleLevel = 0 | 1 | 2 | 3;

/** 專業人才團隊分佈快照 */
export type RoleMap = Record<RoleType, RoleLevel>;

/**
 * 行動產生的「犯罪紀錄」( AppliedTag )
 * 每次做完決定產生的標籤，會變成日後法庭起訴你的證據。
 */
export interface AppliedTag {
  tag: string[]; // 犯罪標籤 (例如：[偽造文書罪])
  netIncome: number; // 這筆決定賺到的錢 (萬元)。罰金會根據這個數值來算。
  lawCaseIds?: string[]; // 對應的法條 ID
  rpChange: number; // 這次決定對名聲造成的影響
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
  id: number; // 事件編號 (Timestamp)，同一組決定產生的標籤會共用 ID
  text: string; // 標籤名稱
  turn: number; // 發生回合
  timestamp: string; // 生成時間
  isCrime: boolean; // 是否為犯罪標籤：決定要不要進入起訴機率判定
  hash: string; // 防偽指紋：SHA256(上一個紀錄 + 這次項目 + 時間)
  netIncome: number; // 當時這筆決定賺到的淨利 (萬 G)
  lawCaseIds?: string[];
  rpChange?: number;
  isResolved?: boolean; // 結案標記：勝訴後變為 True，黑材料就會被清掉
  multiplier?: number;
  multiplierSource?: string;
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
  name: string; // 企業名稱 (例如：XX 科技)
  ownerName: string; // 總裁姓名 (你本人)
  g: number; // 企業現金 (萬 G)。如果歸零且沒海外信託，就直接破產！
  rp: number; // 社會名聲 (0-100)。低於 50 賺錢效率減半，低於 20 就會被社會唾棄。
  ip: number; // 人脈與技術資源。升級人才或是做某些特殊決定需要它。
  ap: number; // 行動力。每回合重置為 5 點。
  blackMaterialSources: BlackMaterialSource[]; // 目前握在你手中的「黑材料」清單
  tags: Tag[]; // 完整的違法歷史紀錄 (雜湊鏈)
  trustFund: number; // 會計師信託金 (上限 1000 萬)。破產時可以用來東山再起的錢。
  totalTrials: number; // 上法院的次數
  roles?: Partial<RoleMap>; // 你的專業團隊 (雇用的人才)
  isBankrupt: boolean; // 是否已宣告破產
  skipNextCard: boolean; // 是否被政府管制 (下回合第一張牌失效)
  consecutiveCleanTurns: number; // 連續守法了幾個回合
  genesisHash: string; // 創世紀錄雜湊碼
  lastHash: string; // 最後一筆紀錄的雜湊碼
  startPath?: StartPath; // 開局背景
  bribeItem?: BribeItem; // 帶來的貢品/禮物
  totalIncome: number; // 生涯賺過的總利潤
  totalFinesPaid: number; // 生涯交過的罰金與規費總額
  totalTagsCount: number; // 違法階梯：做壞事越多，被警察盯上的基本機率就越高。
  hasUsedExtraAppeal: boolean; // 是否用過那次唯一的「非常上訴」權限
  startBonusFineReduction?: number; // 開局拿到的永久罰金減免比例
  avatarId: number; // 頭像索引
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
export type SpecialTag = 'sue' | 'declareLogic' | 'skip_next' | 'poachtalent';
export type MoneyValue = number | [number, number];

/** 選項基礎規格 */
export interface BaseOption {
  label?: string; // UI 標題
  description?: string; // 詳盡敘事 (Legal Noir)
  ap?: number; // 行動力消耗 (若不填則由引擎預設為 1)
  costG?: number; // 固定資金成本消耗
  skipNextCard?: boolean; // 副作用：引發政府管制鎖定
  special?: SpecialTag; // 邏輯擴充標籤 (§6-5)
  rp?: MoneyValue; // 預設名聲
  ip?: MoneyValue; // 預設技術資產 (IP) (§5-4)
  g?: MoneyValue; // 預設資金收益 (用於替換簡單數值)
  lawCaseIds?: string[]; // 關聯法典 ID (以此為基礎計算 BM，1 標籤 = 1 BM)
  type?: OptionType; // 選項類型分類 (GEMINI.md §5-2 / §6-1)
  surface_term?: string;
  hidden_intent?: string;
  escape?: string;
}

/** 選項類型分類 (GEMINI.md §5-2 / §6-1) */
export type OptionType = 'SR' | 'SSR' | 'SSSR' | 'UR' | 'Z'; // SR: 無罪, SSR: 1標籤, SSSR: 2標籤, UR: 3標籤, Z: 專屬機制
export type LocationType = 'A' | 'B' | 'C' | 'D' | 'E';

/** SR 型 (無罪/合法型)：透明商業行為。不觸發任何法律風險 (無標籤/無 BM)。 */
export interface OptionSR extends BaseOption {
  type?: 'SR';
  succRate?: number; // 基礎成功率 (通常 > 0.8)
  succ?: {
    g?: MoneyValue;
    rp?: MoneyValue;
    ip?: MoneyValue;
    bm?: number | 'all' | string; // 用於消除/減少現有黑材料 (支援 '70%' 等格式)
    lawCaseIds?: string[];
  };
  fail?: {
    g?: MoneyValue;
    rp?: MoneyValue;
    ip?: MoneyValue;
    loss?: number;
    special?: 'sue';
  };
}

/** Risk 型 (風險型)：遊走灰色地帶或違法。法律風險 (BM) 依所屬法案標籤數累計。包含 SSR, SSSR, UR。 */
export interface OptionRisk extends BaseOption {
  type?: 'SSR' | 'SSSR' | 'UR';
  succRate?: number; // 支援機率檢定
  succ?: {
    g?: MoneyValue;
    rp?: MoneyValue;
    ip?: MoneyValue;
    bm?: number | string;
    lawCaseIds?: string[];
  };
  fail?: {
    g?: MoneyValue;
    rp?: MoneyValue;
    ip?: MoneyValue;
    loss?: number;
    special?: 'sue';
    lawCaseIds?: string[];
  };
}

/** Z 型 (違法型)：明顯違法行為。法律風險依標籤數累計；C 類卡將觸發申報/略過機制 (略過額外 +2 BM)。 */
export interface OptionZ extends BaseOption {
  type?: 'Z';
  succRate?: number;
  succ?: {
    g?: MoneyValue;
    rp?: MoneyValue;
    ip?: MoneyValue;
    bm?: number | 'all' | string;
    lawCaseIds?: string[];
  };
  fail?: SpecialFail;
}

/** 特殊失敗情境：黑箱或滅證操作失敗觸發之「強制起訴」路徑 */
export interface SpecialFail {
  g?: MoneyValue;
  rp?: MoneyValue;
  ip?: MoneyValue;
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
  diffs?: NumericalDiffs; // [新增] 數值變動精確差值，用於 UI 彈窗
}

/** 數值變動精確差值結構 */
export interface NumericalDiffs {
  g: number;
  rp: number;
  ip: number;
  bm: number;
  ap?: number; // [新增] 行動力變動
  trust?: number; // 海外信託變動
  bets?: { playerId: string; amount: number; type: 'ip' | 'rp' | 'g' }[]; // 旁觀者押注結果
  breakdown?: {
    name: string;
    level: number;
    g?: number;
    rp?: number;
    trust?: number;
  }[]; // [新增] 詳細來源拆解 (例如：人才收益來源)
}

export type CardOption = OptionSR | OptionRisk | OptionZ;

/** 區域情境卡牌 (1+3 結構) */
export interface Card {
  [key: number]: CardOption | undefined; // 支援透過數字索引安全取值 (1, 2, 3)
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
  indictment?: string; // 精確的法庭起訴狀文本 (起訴公訴敘事)
  survival_rate: number; // 原始脫身勝訴率 (0.1 - 0.9)
  // --- 網站模式專屬 JKL 辯護選項與專屬法庭反駁 ---
  defense_j_text?: string;
  web_judgment_j?: string;
  edu_j?: string;

  defense_k_text?: string;
  web_judgment_k?: string;
  edu_k?: string;

  defense_l_text?: string;
  web_judgment_l?: string;
  edu_l?: string;
}

/** 遊戲宏觀階段 */
export type GamePhase = 'play' | 'summary' | 'courtroom' | 'gameover' | 'victory';

/**
 * 遊戲目前的狀態
 */
export interface PlayerConfig {
  name: string;
  ownerName: string;
  path: StartPath;
  bribeItem?: BribeItem;
  avatarId: number; // 名畫頭像索引
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
  pendingResolution: {
    title: string;
    message: string;
    diffs: NumericalDiffs;
    type: 'success' | 'failure' | 'neutral' | 'passive';
    defendantId?: string;
  } | null; // [新增] 待顯示的結算彈窗數據
  resultDiffs?: NumericalDiffs; // [新增] 用於傳遞計算後的數值差值
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
  resultDiffs?: NumericalDiffs; // [新增] 法庭結算後的數值變動總結
}

// ============================================================
// 🏆 結局判定與結算報告 (Evaluation & Endings)
// ============================================================

/** 結局優先級路徑 (GEMINI.md §3-1 / §3-4) */
export type VictoryRoute = 'tycoon' | 'saint' | 'dragonhead' | null;

/** 結局類型編碼 */
export type EndingType =
  | 'dragonhead'
  | 'tycoon'
  | 'saint'
  | 'saintFake'
  | 'bankrupt'
  | 'arrested'
  | 'limit';

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
