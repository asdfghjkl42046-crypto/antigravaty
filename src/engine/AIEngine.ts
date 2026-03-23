import { Player, TrialState, JudgePersonality } from '../types/game';
import { getTotalBlackMaterials } from './GameEngine';
import { JUDGE_LABELS } from '../data/judges/JudgeTemplatesDB';

/**
 * AI 靈魂劇本產生器
 * 負責把玩家的案件資料與法官的人偶設定檔融合，寫成專屬的劇本大綱送給雲端 AI 人工智慧。
 * 這是讓每一次法庭對話都充滿火花與張力的幕後黑手。
 */
export class AIEngine {
  /**
   * 建立【法官靈魂設定檔】(System Prompt)
   * 功能：給 AI 洗腦，強迫它扮演特定性格的法官，包含語氣、口癖與禁忌。
   * 讓 AI 徹底化身為這場法庭的無情裁決者。
   * @param personalityId 抽出的法官性格 (傳統派、科技派、貴族派等)
   */
  static assembleSystemPrompt(personalityId: JudgePersonality): string {
    // 透過傳入的 ID 從法官資料庫提取出該名法官的細部設定檔
    const judge = JUDGE_LABELS[personalityId];
    // 防呆處理：如果不幸查無此人，預設為一個無情的常規審判長，避免系統崩潰
    if (!judge) return '你現在是《創業冒險：現代法律篇》桌遊的最高法院的審判長。請進行專業判決。';

    // 回傳一段結構嚴謹、帶有強烈命令語氣的系統級提示詞 (System Prompt)
    // 會動態把專屬該法官的 prompt_injection (包含大量性格標籤) 嵌入其中約束 AI 的行為
    return `【系統底層指令】
你現在是《創業冒險：現代法律篇》桌遊的最高法院的 AI 審判長。你必須完全、絕對地沉浸於以下隨機分配的法官個性中。你的每一句判決文、對玩家的稱呼、用詞遣字與嘲諷方式，都必須 100% 符合此人設。

【當前法官個性設定】：
${judge.prompt_injection}

【語氣鐵律】：禁止使用一般的 AI 客服語氣。你是一個握有生殺大權、有血有肉且性格鮮明的人類法官。你的判決必須充滿戲劇張力。

【輸出限制】：
即使你充滿個性，你的判決陳詞仍必須緊扣玩家的「黑材料數量 (BM)」、「敗訴罰金 (Trials)」與「名聲 (RP)」來進行說理或嘲諷。結案陳詞字數控制在 100~150 字之間，且必須嚴格遵守系統要求的資料回傳格式。`;
  }

  /**
   * 建立【案情摘要報告】(User Prompt)
   * 功能：把玩家是怎麼狡辯的、身上背了幾條罪、有沒有被群眾嘲笑等資訊，全部寫成起訴書餵給 AI。
   * AI 看完這份報告後，就會開始對玩家進行毒舌噴發。
   */
  static assembleJudgmentPrompt(trial: TrialState, defendant: Player): string {
    // 先抓出法官判決文中最常用來做文章的幾個核心玩家指標：總黑量、上法院次數、目前名望
    const bm = getTotalBlackMaterials(defendant);
    const trials = defendant.totalTrials || 0;
    const rp = defendant.rp;

    // 將複雜的巢狀物件狀態轉譯為具備高度結構化的 Markdown 文本報告，以利大語言模型理解具體案情
    return `請根據以下案件數據產出判決陳詞：

【當前案件】：${trial.lawCase?.tag} (引用法條 §${trial.lawCase?.lawName})
【法律抗辯術語】：
- 被告主張 (表面說詞)：${trial.lawCase?.surface_term}
- 實際行為 (動機)：${trial.lawCase?.hidden_intent}

【被告資料】：
- 企業名聲 (RP): ${rp}
- 現有黑材料 (BM): ${bm}
- 違法標籤 (Trials): ${trials}

【辯論紀錄】：
- 核心主張：${trial.isDefenseSuccess ? `勝訴/勉強接受「${trial.lawCase?.surface_term}」` : `敗訴/指控成立：實際上是「${trial.lawCase?.hidden_intent}」`}
- 被告陳述：${trial.defenseText || '（未提供額外陳述）'}
- 旁觀者干預：${trial.interventions.map((i) => i.text).join('; ') || '（無干預）'}

請以此為基礎，用你被分配的法官人設回傳判決文。`;
  }
}
