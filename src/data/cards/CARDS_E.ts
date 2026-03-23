import type { Card } from '../../types/game';

export const CARDS_E: Record<string, Card> = {
  'E-01': {
    title: '【硬碟的物理粉碎】',
    description:
      'AI 法庭的調查風聲日趨緊迫，你手頭上幾份涉及早期違規擴張的原始數據紀錄，正靜靜地躺在辦公室的舊硬碟裡。',
    1: {
      type: 'C',
      label: '委託專業資安公司進行符合國防等級的物理銷毀，徹底將硬碟化為粉塵，不留任何磁軌紀錄。',
      succRate: 0.3,
      costG: 150,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['湮滅證據罪/加重刑責'], lawCaseIds: ['E-01-1'] },
    },
    2: {
      type: 'A',
      label:
        '支付高額律師費進行合規性審查，由法律團隊挑選出具有潛在風險的檔案並進行法律上的「合理格式化」。',
      succRate: 0.9,
      costG: 50,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
    3: {
      type: 'A',
      label:
        '聘請資深律師針對這批數據編寫一套「技術研發紀錄」說明書，試圖將其法律性質從違法證據轉化為合法資產。',
      succRate: 0.9,
      costG: 80,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
  },
  'E-02': {
    title: '【關鍵證人的口供】',
    description:
      '一名曾經參與過你「黑箱」交易的前員工準備接受檢察官質詢。如果他實話實說，你累積的黑材料將成為起訴的鐵證。',
    1: {
      type: 'C',
      label:
        '透過事務所安排一場私人調解，提供優渥的「離職補償金」，並要求其在法庭上作出對公司有利的虛偽陳述。',
      succRate: 0.3,
      costG: 200,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['教唆偽證罪/虛偽陳述'], lawCaseIds: ['E-02-1'] },
    },
    2: {
      type: 'A',
      label:
        '指示法律顧問與該員工簽署嚴謹的保密協議補充條款，並提醒其洩密可能面臨的鉅額違約金風險。',
      succRate: 0.9,
      costG: 60,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
    3: {
      type: 'C',
      label:
        '要求律師運用專業法律程序對該證人的誠信度發起挑戰，並安排其前往海外長期出差以規避出庭。',
      succRate: 0.3,
      costG: 300,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['湮滅證據罪/加重刑責'], lawCaseIds: ['E-02-3'] },
    },
  },
  'E-03': {
    title: '【雲端 Log 的抹除】',
    description:
      '系統後台紀錄了你幾次違規獲取競業秘密的連線紀錄，這些數位足跡正隨時可能被 AI 演算法抓取。',
    1: {
      type: 'A',
      label:
        '聘請技術律師團隊協助撰寫「資料保留政策」，依法在保存期限到期後將相關 Log 紀錄全數正常刪除。',
      succRate: 0.9,
      costG: 50,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
    2: {
      type: 'C',
      label: '指示技術團隊連夜入侵自家備援伺服器，手動抹除所有原始連線紀錄，並製造硬體故障的假象。',
      succRate: 0.3,
      costG: 120,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['妨害電腦使用罪/湮滅證據罪'], lawCaseIds: ['E-03-2'] },
    },
    3: {
      type: 'A',
      label: '支付法律諮詢費，尋求專業建議以「維護系統安全性」為由，對現有紀錄進行加密混淆。',
      succRate: 0.9,
      costG: 80,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
  },
  'E-04': {
    title: '【合約公證的偽造】',
    description:
      '為了補救一筆早期非法轉移資產的漏洞，你需要一份日期超前的「追認合約」來證明當時的行為符合商業常規。',
    1: {
      type: 'C',
      label:
        '委託事務所與合作的公證人商量，支付大筆「速審費」，請其在合約日期與內容上給予「彈性協助」。',
      succRate: 0.3,
      costG: 250,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['偽造私文書罪/公證法違規'], lawCaseIds: ['E-04-1'] },
    },
    2: {
      type: 'A',
      label:
        '指示律師與對造公司進行事後協議，補簽一份具有法律溯及效力的意向書，盡量修補合約上的程序瑕疵。',
      succRate: 0.9,
      costG: 80,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
    3: {
      type: 'C',
      label: '要求事務所尋找專業的文書團隊，重新偽造一整套當時的會議紀錄與簽名，以備 AI 法庭查核。',
      succRate: 0.3,
      costG: 400,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['偽造私文書罪/公證法違規'], lawCaseIds: ['E-04-1'] },
    },
  },
  'E-05': {
    title: '【海外信託的掩護】',
    description:
      '你的黑箱資金流向正被稅務單位盯上。你急需建立一層法律防火牆，將這些錢的來源重新定義為合法的海外顧問費。',
    1: {
      type: 'A',
      label: '配合資深律師的建議，如實申報並補繳欠稅，爭取在 AI 法庭前達成認罪協商以清空黑材料。',
      succRate: 0.9,
      costG: 70,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
    2: {
      type: 'C',
      label:
        '投入巨資設立複雜的層次信託架構，透過多個海外紙上公司進行循環轉帳，掩飾資金的最初來源。',
      succRate: 0.3,
      costG: 500,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['洗錢防制法/掩飾犯罪所得'], lawCaseIds: ['E-05-2'] },
    },
    3: {
      type: 'A',
      label: '聘請會計師與律師共同進行「資產重組計畫」，將爭議資金轉化為公司的無形資產價值。',
      succRate: 0.9,
      costG: 100,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
  },
  'E-06': {
    title: '【湮滅的信件清單】',
    description:
      '公司內部的電子郵件伺服器中，存有幾封你親自下達「黑箱」指令的信件副本。一旦被 AI 溯源抓取，後果不堪設想。',
    1: {
      type: 'C',
      label:
        '支付律師費進行企業內部合規檢修，以「資安升級」為名，將伺服器硬體進行物理替換並銷毀舊設備。',
      succRate: 0.3,
      costG: 200,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['湮滅證據罪/加重刑責'], lawCaseIds: ['E-01-1'] },
    },
    2: {
      type: 'A',
      label:
        '指示法律專員在所有敏感郵件中標註「受律師客戶保密特權保護」，試圖在法庭審理時爭取證據排除。',
      succRate: 0.9,
      costG: 60,
      succ: { bm: 1 },
      fail: { loss: 50 },
    },
    3: {
      type: 'C',
      label:
        '安排律師與資訊長配合，針對郵件系統進行「異常清理」，直接將該年份的信件備份檔案從伺服器中永久移除。',
      succRate: 0.3,
      costG: 300,
      succ: { bm: 'all' },
      fail: { special: 'sue', tags: ['妨害電腦使用罪/湮滅證據罪'], lawCaseIds: ['E-06-3'] },
    },
  },
};
