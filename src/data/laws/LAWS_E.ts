/**
 * 法律資料：E 類案件
 */
import type { LawCase } from '../../types/game';

export const LAWS_E: Record<string, LawCase> = {
  // E-01: 證據湮滅
  'E-01-1': {
    id: 'E-01-1',
    tag: ['湮滅證據罪'],
    lawName: '《刑法》第 165 條',
    hidden_intent: '被調查時偷偷把關鍵硬碟銷毀滅證。',
    survival_rate: 0.01,
    evidence_list: [
      '專業資料粉碎工具的執行紀錄',
      '監視器拍到針對性銷毀硬體的畫面',
      '調查展開後突然刪除大量檔案的日誌',
      '技術部門收到緊急銷毀指令的對話紀錄',
    ],
    defense_j:
      '硬碟的處理是資訊部門提出來的，說是例行的設備汰換，我沒有想到這個時間點做這件事會有問題。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k:
      '公司定期處理舊設備是正常的資安程序，我當時認為這只是一個硬體維護的決定，不是要銷毀任何調查相關的東西。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '我沒有在接到調查通知之後才去做這件事，那個時間點對我來說只是剛好，我真的沒有意識到這樣會構成湮滅證據。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },

  // E-02: 證人調解
  'E-02-1': {
    id: 'E-02-1',
    tag: ['教唆偽證罪', '妨害司法罪'],
    lawName: '《刑法》第 168 條',
    hidden_intent: '付錢給證人，叫他在庭上說假話或翻供。',
    survival_rate: 0.02,
    evidence_list: [
      '要求證人改口供的秘密協議表',
      '給證人家屬莫名其妙的「生活補助費」紀錄',
      '證人與被告律師私下見面的紀錄',
      '通訊軟體裡商量偽證的秘密對話存根',
    ],
    defense_j:
      '我請事務所去跟他談是因為我覺得當初 he 離職的條件有些地方可以重新確認，不是要他去說謊。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k:
      '那筆補償是基於他對公司過去的貢獻，附帶的條件我的理解是希望他說出他真實記得的事，不是叫他作偽證。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '我沒有叫他在法庭上講任何不實的內容，我只是希望他在陳述的時候能考慮到事情的完整脈絡。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },
  'E-02-3': {
    id: 'E-02-3',
    tag: ['教唆偽證罪', '強制罪'],
    lawName: '《刑法》第 168 條；《刑法》第 304 條',
    hidden_intent: '把證人送出國躲起來，讓他沒辦法出庭作證。',
    survival_rate: 0.01,
    evidence_list: [
      '證人接受海外安置之機票與酒店收據',
      '要求證人更改供詞之秘密協議書',
      '監視器拍到移除關鍵證物之畫面',
      '與證人間涉及利益交換之加密通訊',
    ],
    defense_j:
      '律師的策略是法律團隊自己決定的，我授權他們盡力保護公司，但具體的訴訟手段我沒有逐一指示。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k:
      '那個海外出差的安排是業務部門的正常需求，時間點的問題我沒有想那麼多，不是刻意用來拖延出庭的。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '我沒有叫任何人去阻止那個前員工出庭，出差是他自己答應去的，跟出庭日期撞到我不知道是不是巧合。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },

  // E-03: 數位足跡清理
  'E-03-2': {
    id: 'E-03-2',
    tag: ['妨害電腦使用罪', '湮滅證據罪'],
    lawName: '《刑法》第 358、360 條；第 165 條',
    hidden_intent: '案發後偷偷清掉伺服器紀錄，消滅犯罪痕跡。',
    survival_rate: 0.01,
    evidence_list: [
      '伺服器日誌被故意覆蓋掉的痕跡',
      '案發時系統權限被偷偷改動的紀錄',
      '在終端機輸入強制刪除指令的軌跡',
      '備份檔案被針對性移除的紀錄',
    ],
    defense_j: '那個指示是我下的，當時我說的是把不必要的舊紀錄清掉，我沒有說要偽裝成任何東西。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k:
      '系統紀錄的定期清理是技術部門的正常作業，我當時認為那些Log已經超過保存必要，是可以刪除的。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '我沒有意識到那些紀錄跟調查有關聯，如果我知道，我不會在這個時間點做這個決定，那是一個判斷上的失誤。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },

  // E-04: 合約修改
  'E-04-1': {
    id: 'E-04-1',
    tag: ['偽造私文書罪', '使公務員登載不實罪'],
    lawName: '《刑法》第 210、214、216 條',
    hidden_intent: '叫公證人把合約日期改掉，偽造文件。',
    survival_rate: 0.02,
    evidence_list: [
      '鑑定出合約紙張年份對不上的報告',
      '合約日期跟電腦存檔時間有落差的紀錄',
      '拜託公證人配合改日期的通訊對話',
      '電子合約的原始數位指紋對不上',
    ],
    defense_j:
      '找公證人的事是法務部門去處理的，我只是說需要一份文件來補充當時的合作紀錄，細節我沒有全部掌握。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k:
      '我當時的理解是那份文件是在還原一個真實存在的合作意向，不是要捏造一個從來沒有發生過的事。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '那個合作是真實有過的，只是文件當時沒有留存下來，我認為補齊紀錄跟偽造文書是不同性質的事。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },

  // E-05: 資產隱藏
  'E-05-2': {
    id: 'E-05-2',
    tag: ['洗錢防制法', '稅捐稽徵法'],
    lawName: '《洗錢防制法》第 14 條；《稅捐稽徵法》第 41 條',
    hidden_intent: '透過多層海外公司把錢藏起來，躲避追查。',
    survival_rate: 0.01,
    evidence_list: ['金流路徑圖', '紙上公司文件', '跨境匯款紀錄'],
    defense_j:
      '那個架構是財務顧問提出來的，他說這是合法的海外資產配置方式，我當時沒有理由不相信他的專業判斷。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k:
      '那些公司都是在當地合法登記的，資金的流動也是依照各國的法規處理的，我當時認為這是一個合規的安排。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '我沒有想要洗錢，我的目的是做合法的資產規劃，如果那個架構有問題，那是顧問給我錯誤建議的結果。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },

  // E-06: 郵件備份
  'E-06-3': {
    id: 'E-06-3',
    tag: ['妨害電腦使用罪', '湮滅證據罪'],
    lawName: '《刑法》第 165、358 條',
    hidden_intent: '被調查時偷偷刪掉敏感信件，銷毀證據。',
    survival_rate: 0.01,
    evidence_list: [
      '郵件系統被針對性清空的痕跡',
      '刪除特定敏感關鍵字郵件的紀錄',
      '備份磁帶被物理損壞的照片證明',
      '技術主管收到高層指示要刪除郵件的信件',
    ],
    defense_j:
      '郵件系統的清理是資訊長提出的例行維護作業，我知道有這件事，但沒有針對哪一封信下達特別的指示。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k:
      '備份檔案的定期清除在公司的資料管理政策裡是有規定的，我當時認為這是正常的系統維護程序。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '我沒有叫任何人去刪除跟調查有關的東西，如果那些郵件剛好在這個時候被清掉，那是例行作業的時程問題。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },
};
