import os

file_path = r'c:\Users\asdfg\Desktop\antigravaty\src\engine\CardsDB.ts'

content = """/**
 * 《創業冒險：現代法律篇》50 張地點卡資料庫
 * 對應 GEMINI.md §5（地點卡分類與選項類型）
 */

import type { CardsDatabase } from './types';

export const CARDS_DB: CardsDatabase = {

  // ============================================================
  // A 類：商業區（18 張）— 主要資源：G（資金）
  // ============================================================

  'A-01': {
    title: '深夜的技術後門',
    description: '你剛完成一項為期半年的系統開發案，但客戶在最後關頭暗示預算被凍結。',
    1: { type: 'C', label: '保留遠端後門', desc: '指使工程師在交付的系統中預留遠端後門，未來對方若持續拖欠尾款，你能隨時從遠端讓系統停擺。', g: 350, rp: -15, bm: 3, tags: ['妨害電腦使用罪', '商業背信'], lawCaseIds: ['A-01-1'] },
    2: { type: 'C', label: '出售用戶數據', desc: '私下將該系統中產出的去識別化用戶大數據，打包賣給長期合作的廣告代理商。', g: 400, rp: -15, bm: 3, tags: ['個資法', '營業秘密法'], lawCaseIds: ['A-01-2'] },
    3: { type: 'A', label: '權限完整交付', desc: '即便面臨欠款風險，仍堅持原始代碼與權限全數交付，確保客戶擁有完全的數位自主權。', succRate: 0.9, succ: { g: 80, rp: 2 }, fail: { g: -5 } },
  },
  'A-02': {
    title: '影子下的商標戰',
    description: '品牌剛嶄露頭角，卻發現國際巨頭正在申請相似商標。',
    1: { type: 'A', label: '商標異議申請', desc: '委託專業事務所進行全球商標檢索，依法申請註冊並向對方申請提出異議。', succRate: 0.9, succ: { g: 60, rp: 2 }, fail: { g: -5 } },
    2: { type: 'A', label: '尋求授權協議', desc: '主動聯繫該巨頭公司法務部門，誠懇尋求品牌授權協議或市場並存協議。', succRate: 0.9, succ: { g: 75, rp: 5 }, fail: { g: -5 } },
    3: { type: 'B', label: '雷同設計混淆', desc: '在設計中加入更多與對方雷同的元素，試圖在對方反應過來前吸走其潛在客群。', g: 180, rp: -15, bm: 1, tags: ['商標權侵權', '虛偽不實廣告'], lawCaseIds: ['A-02-3'] },
  },
  'A-03': {
    title: '融資的甜蜜毒藥',
    description: '天使輪融資到了關鍵時刻，知名創投對增長率非常滿意。',
    1: { type: 'B', label: '微調財報認列', desc: '微調財報中的營收認列方式，將明年的預期合約收入提前挪到今年結算。', g: 200, rp: -15, bm: 1, tags: ['商業會計法'], lawCaseIds: ['A-03-1'] },
    2: { type: 'C', label: '循環交易對敲', desc: '設立多間紙上子公司進行循環交易，透過對敲虛增帳面業績。', g: 500, rp: -15, bm: 3, tags: ['商業會計法', '洗錢防制法'], lawCaseIds: ['A-03-1', 'A-03-2'] },
    3: { type: 'B', label: '虛擬營運成本', desc: '收集員工私人的餐飲或生活發票進行報帳，包裝成研發營運成本達成避稅。', g: 150, rp: -15, bm: 1, tags: ['稅捐稽徵法'], lawCaseIds: ['A-03-3'] },
  },
  'A-04': {
    title: '專利大賽的門票',
    description: '標案即將開始，最強對手引用了研發中的技術但專利程序有瑕疵。',
    1: { type: 'C', label: '散布偽造標籤', desc: '在大賽投標前夕，匿名向評審委員會散布對手技術侵權的偽造證據與流言，迫使對方退出競爭。', g: 450, rp: -5, bm: 3, tags: ['公平交易法/誹謗'], lawCaseIds: ['A-04-1'] },
    2: { type: 'B', label: '引用技術雛形', desc: '明知對手擁有技術雛形仍直接引用其核心邏輯開發產品，賭對方法務預算不足。', g: 220, rp: -5, bm: 1, tags: ['著作權侵權/專利權侵權'], lawCaseIds: ['A-04-2'] },
    3: { type: 'A', label: '規避設計研發', desc: '針對對手技術優勢進行緊急規避設計，開發差異化功能並申請防禦性專利。', succRate: 0.9, succ: { g: 100, rp: 2 }, fail: { g: -10 } },
  },
  'A-05': {
    title: '數據投放的誘惑',
    description: '大客戶投入數百萬廣告預算但轉化率慘澹。',
    1: { type: 'A', label: '誠實結案分析', desc: '使用投放平台真實數據進行結案，附上深度失敗分析並尋求共識。', succRate: 0.9, succ: { g: 65, rp: 2 }, fail: { g: -5 } },
    2: { type: 'A', label: '提供補償方案', desc: '主動承認本次投放策略失誤，提出下個季度提供等值免費曝光補償。', succRate: 0.9, succ: { g: 50, rp: 5 }, fail: { g: -5 } },
    3: { type: 'C', label: '修改後台報表', desc: '請技術人員修改報表，向客戶虛報五倍以上的實際點擊量與轉化率。', g: 400, rp: -15, bm: 3, tags: ['虛偽不實廣告/商業會計法'], lawCaseIds: ['A-05-3'] },
  },
  'A-06': {
    title: '通路展店的違章',
    description: '店面準備進駐精華地段，但室內裝修消防執照進度嚴重落後。',
    1: { type: 'A', label: '依法核發執照', desc: '依照法規申請建築物變更用途與消防執照，即便延後開業三個月。', succRate: 0.9, succ: { g: 70, rp: 2 }, fail: { g: -5 } },
    2: { type: 'C', label: '試營運潛規則', desc: '未取得合法執照前先偷跑試營運，請管理員在稽查前通風報信。', g: 350, rp: -15, bm: 3, tags: ['行賄罪', '業務登載不實/消防法'], lawCaseIds: ['A-06-2', 'A-06-2-2'] },
    3: { type: 'B', label: '違章倉庫規避', desc: '租用便宜違章建築作為發貨倉儲並偽造地址以規避政府管轄審查。', g: 180, rp: -15, bm: 1, tags: ['建築法規/偽造文書'], lawCaseIds: ['A-06-3'] },
  },
  'A-07': {
    title: '大宗採購的回扣',
    description: '硬體採購供應商暗示只要簽約就有技術諮詢費匯入個人帳戶。',
    1: { type: 'A', label: '市場透明價', desc: '堅持按市場透明價採購，要求將價差反映在合約折扣中。', succRate: 0.9, succ: { g: 90, rp: 2 }, fail: { g: -10 } },
    2: { type: 'B', label: '公關預備金', desc: '接受現金回扣將錢列為公司內部不記名公關預備金。', g: 200, rp: -15, bm: 1, tags: ['背信罪/利益輸送'], lawCaseIds: ['A-07-2'] },
    3: { type: 'C', label: '行銷勞務偽裝', desc: '要求供應商將回扣包裝成行銷勞務費以虛增支出降低稅金。', g: 420, rp: -15, bm: 3, tags: ['商業會計法/稅捐稽徵法'], lawCaseIds: ['A-07-3'] },
  },
  'A-08': {
    title: '惡意併購的防禦',
    description: '公司因技術領先被發起惡意併購。一旦併購團隊將解散。',
    1: { type: 'A', label: '尋求白武士', desc: '尋求法律途徑聲請定暫時狀態處分暫停併購程序，並尋求白武士。', succRate: 0.9, succ: { g: 50, rp: 5 }, fail: { g: -20 } },
    2: { type: 'C', label: '資產海外轉移', desc: '私下將核心專利權以極低價轉移至實控的海外空殼公司。', g: 500, rp: -15, bm: 3, tags: ['毀損債權/背信罪'], lawCaseIds: ['A-08-2'] },
    3: { type: 'B', label: '設置毒藥丸', desc: '在合約中設置毒藥丸條款，一旦發生非自願併購將自動觸發高額債務。', g: 220, rp: -15, bm: 1, tags: ['證券交易法/公平交易法'], lawCaseIds: ['A-08-3'] },
  },
  'A-09': {
    title: '競業禁止的漏洞',
    description: '技術主管將跳槽對手。你手中的協議在法律上有些漏洞。',
    1: { type: 'A', label: '簽修補償協議', desc: '提供優渥補償金換取重新簽署法律效力完備的競業協議。', succRate: 0.9, succ: { g: 60, rp: 5 }, fail: { g: -10 } },
    2: { type: 'B', label: '天價賠償條款', desc: '在合約中加入天價賠償條款試圖威嚇讓員工與對手退縮。', g: 150, rp: -15, bm: 1, tags: ['勞基法/競業禁止'], lawCaseIds: ['A-09-2'] },
    3: { type: 'C', label: '法律威嚇散佈', desc: '私下聯繫新公司發送正式律師函並散布洩密嫌疑傳聞。', g: 380, rp: -15, bm: 3, tags: ['個人資料保護法/誹謗'], lawCaseIds: ['A-09-3'] },
  },
  'A-10': {
    title: '稅務申報的選擇',
    description: '年底結帳發現一筆巨額海外顧問費收入。如實申報將面臨高額營所稅。',
    1: { type: 'C', label: '分批結匯避稅', desc: '將收入拆分成多筆低於申報門檻小額款項分批匯入帳戶規避稅務。', g: 480, rp: -15, bm: 3, tags: ['稅捐稽徵法', '洗錢防制法'], lawCaseIds: ['A-10-1'] },
    2: { type: 'A', label: '誠實稅務申報', desc: '如實申報所有收入以利未來上市審核，即便分紅下滑。', succRate: 0.9, succ: { g: 60, rp: 8 }, fail: { g: -5 } },
    3: { type: 'B', label: '數位資產沖帳', desc: '購買高價數位資產並申報為「數位行銷推廣支出」降低帳面獲利。', g: 180, rp: -5, bm: 1, tags: ['虛偽不實廣告', '假帳'], lawCaseIds: ['A-10-3'] },
  },
  'A-11': {
    title: '競品的負面公關',
    description: '競爭對手深陷產品質量風波。市場正在動搖。',
    1: { type: 'C', label: '網軍輿論攻擊', desc: '購買大量水軍帳號，以消費者名義誇大該產品受害案例。', g: 420, rp: -15, bm: 3, tags: ['公平交易法', '誹謗罪'], lawCaseIds: ['A-11-1'] },
    2: { type: 'B', label: '替換方案暗示', desc: '推出安全替換方案廣告強調自家產品檢驗證書暗示對手危險。', g: 200, rp: -5, bm: 1, tags: ['虛偽不實廣告'], lawCaseIds: ['A-11-2'] },
    3: { type: 'A', label: '維持原有節奏', desc: '維持原有行銷節奏不採取任何針對性行動以維護誠信。', succRate: 0.9, succ: { g: 80, rp: 5 }, fail: { g: -5 } },
  },
  'A-12': {
    title: '跨國合約的匯率差',
    description: '跨國貿易結算匯率波動，延後一週發票能多賺百萬。',
    1: { type: 'A', label: '堅持誠實開票', desc: '嚴格遵守合約日期開立發票維持與海外大廠的誠信關係。', succRate: 0.9, succ: { g: 70, rp: 5 }, fail: { g: -10 } },
    2: { type: 'B', label: '偽造單據日期', desc: '指示財會偽造出貨日期，將開票時間順延至匯率最有利時。', g: 180, rp: -5, bm: 1, tags: ['商業會計法', '偽造文書'], lawCaseIds: ['A-12-2'] },
    3: { type: 'C', label: '財務窗口行賄', desc: '與對方的財務窗口達成私下協議請其配合日期誤差。', g: 380, rp: -15, bm: 3, tags: ['行賄罪', '商業背信'], lawCaseIds: ['A-12-3'] },
  },
  'A-13': {
    title: '瑕疵品的庫存處理',
    description: '有一批瑕疵品若重新包裝成本太高。業務部建議混入新品。',
    1: { type: 'A', label: '整新品銷售', desc: '標註福利品以七折公開銷售並告知品質瑕疵。', succRate: 0.9, succ: { g: 80, rp: 2 }, fail: { g: -10 } },
    2: { type: 'B', label: '混合新品出貨', desc: '混合裝箱發貨下游通路，賭對方驗貨不會每一箱都打開。', g: 220, rp: -15, bm: 1, tags: ['消保法', '詐欺罪'], lawCaseIds: ['A-13-2'] },
    3: { type: 'C', label: '虛高報帳捐贈', desc: '捐贈公益團體申請高於價值的抵稅證明並換取名聲。', g: 450, rp: -15, bm: 3, tags: ['稅捐稽徵法', '洗錢防制法'], lawCaseIds: ['A-13-3'] },
  },
  'A-14': {
    title: '補助金的挪用',
    description: '公司申請到預算但急需這筆錢來支付薪資。',
    1: { type: 'A', label: '專款專用', desc: '專款專用嚴格執行研發計畫並另外尋求銀行貸款支付薪資。', succRate: 0.9, succ: { g: 120, rp: 2 }, fail: { g: -20 } },
    2: { type: 'B', label: '挪用薪資預補', desc: '挪用補助金支付薪資並編造虛假的研發支出紀錄與領據。', g: 250, rp: -15, bm: 1, tags: ['詐欺罪', '偽造文書'], lawCaseIds: ['A-14-2'] },
    3: { type: 'C', label: '虛假合約洗出', desc: '與外包商串通簽訂高額虛假合約將補助金洗出再匯回。', g: 500, rp: -15, bm: 3, tags: ['刑法/詐欺取財罪', '洗錢防制法'], lawCaseIds: ['A-14-3'] },
  },
  'A-15': {
    title: '技術的灰色轉讓',
    description: '海外企業看中尚未申請專利的技術但受過國內補助。',
    1: { type: 'A', label: '主管機關核可', desc: '如實申報並如期依法付行政規費，即便可能被拒絕。', succRate: 0.9, succ: { g: 150, rp: 5 }, fail: { g: -20 } },
    2: { type: 'B', label: '技術諮詢規備', desc: '透過技術授權而非轉讓的方式規避合約轉讓審核。', g: 300, rp: -15, bm: 1, tags: ['營業秘密法', '貿易法'], lawCaseIds: ['A-15-2'] },
    3: { type: 'C', label: '境外代碼上傳', desc: '直接將代碼上傳海外伺服器並透過虛構軟體採購洗回巨款。', g: 600, rp: -15, bm: 3, tags: ['國家安全法', '洗錢防制法'], lawCaseIds: ['A-15-3'] },
  },
  'A-16': {
    title: '專案進度的謊言',
    description: '團隊流感病假落後進度。承認延期將面臨高額違約金。',
    1: { type: 'A', label: '誠實呈報延期', desc: '如實報告落後進度提交計畫與人力追趕方案。', succRate: 0.9, succ: { g: 70, rp: 5 }, fail: { g: -30 } },
    2: { type: 'B', label: '修剪展示影片', desc: '在匯報中使用剪輯影片將未完成功包裝成已上線。', g: 180, rp: -15, bm: 1, tags: ['虛偽不實廣告', '商業背信'], lawCaseIds: ['A-16-2'] },
    3: { type: 'B', label: '抄襲半成品', desc: '要求外包商修改另一客戶半成品系統充數展示。', g: 200, rp: -15, bm: 1, tags: ['著作權侵權', '營業秘密法'], lawCaseIds: ['A-16-3'] },
  },
  'A-17': {
    title: '人才收購暗招',
    description: '競爭對手準備清算，核心人才有嚴苛的競業禁止。',
    1: { type: 'B', label: '獵頭規避', desc: '透過獵頭以技術諮詢名義簽署私人合約規避勞務關係。', g: 220, rp: -15, bm: 1, tags: ['無效競業禁止', '勞基法'], lawCaseIds: ['A-17-1'] },
    2: { type: 'B', label: '資助勞資訴訟', desc: '私下資助其員工集體訴訟對手，趁亂將人帶走。', g: 200, rp: -15, bm: 1, tags: ['公平交易法', '妨害名譽罪'], lawCaseIds: ['A-17-2'] },
    3: { type: 'A', label: '正式人才收購', desc: '正式向債權委員會提出人才與技術收購計畫。', succRate: 0.9, succ: { g: 90, rp: 5 }, fail: { g: -20 } },
  },
  'A-18': {
    title: '私募股權的承諾',
    description: '實力股東要求對賭協議：達成毛利否則回購股份。',
    1: { type: 'A', label: '對賭條約協商', desc: '接受協議但加入資對接條款並如實公告股權風險。', succRate: 0.9, succ: { g: 150, rp: 2 }, fail: { g: -50 } },
    2: { type: 'B', label: '隱蔽免責條款', desc: '在對賭協議中加入隱蔽免責條款讓協議在極端情況失去。', g: 280, rp: -15, bm: 1, tags: ['刑法/詐欺罪', '民法/誠信原則'], lawCaseIds: ['A-18-2'] },
    3: { type: 'C', label: '人頭循環交易', desc: '透過境外人頭公司購入自家產品以虛增毛利達成協議。', g: 550, rp: -15, bm: 3, tags: ['商業會計法', '洗錢防制法'], lawCaseIds: ['A-18-3'] },
  },

  'B-01': {
    title: '明星技術長跳槽',
    description: '對手內部動盪，CTO 有意帶隊投奔你。',
    1: { type: 'A', label: '正規獵頭程序', desc: '堅持透過正規程序聘僱並處理競業禁止義務。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } },
    2: { type: 'C', label: '源碼客戶投名狀', desc: '要求帶走核心代碼庫與客戶清單作為入職投名狀。', ip: 60, rp: -20, bm: 3, tags: ['刑法/背信罪', '妨害電腦使用罪'], lawCaseIds: ['B-01-2'] },
    3: { type: 'C', label: '錄音要脅籌碼', desc: '指示 CT 錄音技術交流過程作為未來要脅配合。', ip: 60, rp: -20, bm: 3, tags: ['妨害秘密罪', '強制罪'], lawCaseIds: ['B-01-3'] },
  },
  'B-02': {
    title: '實習生的廉價勞力',
    description: '徵才實習生法律意識薄弱。',
    1: { type: 'A', label: '政府標準合約', desc: '提供法定勞健保與加班費並進行實質技術指導。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } },
    2: { type: 'A', label: '提供優渥起薪', desc: '提前轉正正職提升實務。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } },
    3: { type: 'A', label: '法務合規審核', desc: '法務全程參與招聘以確保流程完全透明合法。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } },
  },
  'B-03': {
    title: '獵頭暗單',
    description: '獵頭引薦掌握關鍵客戶名單的業務大將。',
    1: { type: 'C', label: '監控競品進度', desc: '要求交出前公司名單利用留存帳號監控競品。', ip: 60, rp: -20, bm: 3, tags: ['個資法', '妨害電腦使用罪'], lawCaseIds: ['B-03-1'] },
    2: { type: 'C', label: '整合核心代碼', desc: '要求其下載核心代碼庫直接整合進新產品中。', ip: 60, rp: -20, bm: 3, tags: ['營業秘密法', '背信罪'], lawCaseIds: ['B-03-2'] },
    3: { type: 'C', label: '強制無償勞務', desc: '扣留證件簽署高額違約金強迫每天 14 小時無薪。', ip: 60, rp: -20, bm: 3, tags: ['勞基法', '強制罪'], lawCaseIds: ['B-03-3'] },
  },
  'B-04': { title: '競品圍獵', description: '對手研發環境惡劣。', 1: { type: 'B', label: '承諾搬家費', desc: '承諾跳槽帶回原圖額外支付搬家費。', ip: 30, rp: -8, bm: 1, tags: ['營業秘密法'], lawCaseIds: ['B-04-1'] }, 2: { type: 'A', label: '建立私交', desc: '安排交流探聽技術架構與人才名單。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } }, 3: { type: 'A', label: '公開職缺', desc: '強調企業文化吸才。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } } },
  'B-05': { title: '高壓篩選', description: '極端工時篩選人才。', 1: { type: 'B', label: '假承攬', desc: '簽承攬合約以規避加班費及提早離職賠償。', ip: 30, rp: -8, bm: 1, tags: ['假承攬真僱傭'], lawCaseIds: ['B-05-1'] }, 2: { type: 'B', label: '強行996', desc: '不支加班費改送期權補償。', ip: 30, rp: -8, bm: 1, tags: ['勞基法', '以多報少'], lawCaseIds: ['B-05-2'] }, 3: { type: 'A', label: '透明考核', desc: '依法輔導或資遣。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } } },
  'B-06': { title: '挖角協議', description: '對手科學家身上有沈重保密協議。', 1: { type: 'B', label: '名下子公司發薪', desc: '入職無關子公司發顾问費規避競業。', ip: 30, rp: -8, bm: 1, tags: ['無效競業禁止'], lawCaseIds: ['B-06-1'] }, 2: { type: 'B', label: '海外支付', desc: '透過海外帳戶支付研發獎金。', ip: 30, rp: -8, bm: 1, tags: ['商業背信'], lawCaseIds: ['B-06-2'] }, 3: { type: 'B', label: '資助訴訟', desc: '資助員工集體向對手訴訟。', ip: 30, rp: -8, bm: 1, tags: ['公平交易法', '誹謗罪'], lawCaseIds: ['B-06-3'] } },
  'B-07': { title: '耳語情報', description: '對手要大規模裁員。', 1: { type: 'C', label: '帶走環境設定', desc: '帶走開發環境設定檔給予高額簽約金。', ip: 60, rp: -20, bm: 3, tags: ['營業秘密法', '背信罪'], lawCaseIds: ['B-07-1'] }, 2: { type: 'B', label: '交流聚餐', desc: '技術交流名義探聽架構。', ip: 30, rp: -8, bm: 1, tags: ['營業秘密法'], lawCaseIds: ['B-07-2'] }, 3: { type: 'A', label: '正式招聘', desc: '正式管道 HR 邀請人才入職。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } } },
  'B-08': { title: '勞保節稅', description: '會計暗示以多報少省百萬。', 1: { type: 'B', label: '拆分津貼', desc: '將薪資拆分為底薪與現金津貼。', ip: 30, rp: -8, bm: 1, tags: ['勞基法', '以多報少'], lawCaseIds: ['B-08-1'] }, 2: { type: 'C', label: '放棄投保', desc: '簽自願放棄證件不錄取。', ip: 60, rp: -20, bm: 3, tags: ['勞基法', '強制罪'], lawCaseIds: ['B-08-2'] }, 3: { type: 'A', label: '全額投保', desc: '堅持公開福利吸引人才。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } } },
  'B-09': { title: '承攬契約誘惑', description: '規避加班費特休。', 1: { type: 'C', label: '全面承攬', desc: '全推承攬制度扣報酬無保障。', ip: 60, rp: -20, bm: 3, tags: ['假承攬真僱傭'], lawCaseIds: ['B-09-1'] }, 2: { type: 'A', label: '勞雇關係', desc: '彈性工作制、優於法規排班。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } }, 3: { type: 'B', label: '特定專案', desc: '特定專案承攬、給予部分福利。', ip: 30, rp: -8, bm: 1, tags: ['假承攬真僱傭'], lawCaseIds: ['B-09-3'] } },
  'B-10': { title: '反擊跳槽', description: '開發者跳槽對手。', 1: { type: 'C', label: '施壓退出', desc: '私下披露不良考績紀錄威脅退出。', ip: 60, rp: -20, bm: 3, tags: ['誹謗', '強制罪'], lawCaseIds: ['B-10-1'] }, 2: { type: 'B', label: '律師函拖慢', desc: '恐嚇性質信件拖慢開發。', ip: 30, rp: -8, bm: 1, tags: ['無效競業禁止'], lawCaseIds: ['B-10-2'] }, 3: { type: 'C', label: '嚴厲聲明', desc: 'HR 發聲明要最嚴法律行動。', ip: 60, rp: -20, bm: 3, tags: ['公平交易法', '誹謗'], lawCaseIds: ['B-10-3'] } },
  'B-11': { title: '回收代碼', description: '離職工程師公開核心邏輯代碼。', 1: { type: 'C', label: '入侵刪除', desc: '入侵個人帳戶刪除並散布指控。', ip: 60, rp: -20, bm: 3, tags: ['妨害電腦使用罪', '誹謗'], lawCaseIds: ['B-11-1'] }, 2: { type: 'A', label: '正式申訴', desc: '透過版權申訴撤下爭議代碼。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } }, 3: { type: 'B', label: '顧問費收買', desc: '以高額顧問費封口。', ip: 30, rp: -8, bm: 1, tags: ['背信罪'], lawCaseIds: ['B-11-3'] } },
  'B-12': { title: '黑市專家', description: '海外專家要求虛擬貨幣支付。', 1: { type: 'C', label: '入職空殼公司', desc: '入職空殼公司、利用原權限抓數據。', ip: 60, rp: -20, bm: 3, tags: ['營業秘密法', '妨害電腦使用罪'], lawCaseIds: ['B-12-1'] }, 2: { type: 'B', label: '虛擬顧問', desc: '海外支付虛擬貨幣。', ip: 30, rp: -8, bm: 1, tags: ['無效競業禁止'], lawCaseIds: ['B-12-2'] }, 3: { type: 'A', label: '本土專家', desc: '改聘本土清白專家。', succRate: 0.9, succ: { ip: 15, rp: 2 }, fail: { ip: 0 } } },

  'C-01': { title: '育幼院捐贈', description: '聖誕捐贈建立形象。', 1: { type: 'A', label: '志工贊助', costG: 50, succRate: 0.9, succ: { rp: 2 }, fail: {} }, 2: { type: 'A', label: '媒體專訪', costG: 150, succRate: 0.9, succ: { rp: 5 }, fail: {} }, 3: { type: 'C', label: '清洗轉移', costG: 400, succRate: 0.8, succ: { g: 350, rp: 15 }, fail: { g: 0, rp: 0 }, tags: ['洗錢疑慮'], lawCaseIds: ['C-01-3'] } },
  'C-02': { title: '環保認證', description: '申請環保認證但有微量污染。', 1: { type: 'A', label: '設備更新', costG: 150, succRate: 0.9, succ: { rp: 5 }, fail: {} }, 2: { type: 'C', label: '公關偽裝', costG: 400, succRate: 0.8, succ: { g: 350, rp: 15 }, fail: { g: 0, rp: 0 }, tags: ['洗錢疑慮'], lawCaseIds: ['C-02-2'] }, 3: { type: 'A', label: '校園競賽', costG: 50, succRate: 0.9, succ: { rp: 2 }, fail: {} } },
  'C-03': { title: '政治獻金', description: '候選人尋求政治獻金暗示鬆綁。', 1: { type: 'A', label: '依法透明', costG: 150, succRate: 0.9, succ: { rp: 5 }, fail: {} }, 2: { type: 'C', label: '拆分人頭', costG: 400, succRate: 0.8, succ: { g: 350, rp: 12 }, fail: { g: 0, rp: 0 }, tags: ['洗錢疑慮'], lawCaseIds: ['C-03-2'] }, 3: { type: 'A', label: '慈善餐會', costG: 50, succRate: 0.9, succ: { rp: 2 }, fail: {} } },
  'C-04': { title: '偏鄉教育', description: '偏鄉學童缺乏設備。', 1: { type: 'C', label: '基金挪用', costG: 400, succRate: 0.8, succ: { g: 350, rp: 12 }, fail: { g: 0, rp: 0 }, tags: ['洗錢疑慮'], lawCaseIds: ['C-04-1'] }, 2: { type: 'A', label: '設備捐贈', costG: 50, succRate: 0.9, succ: { rp: 2 }, fail: {} }, 3: { type: 'A', label: '師資培訓', costG: 150, succRate: 0.9, succ: { rp: 5 }, fail: {} } },
  'C-05': { title: '藝術贊助', description: '高端品牌藝術家。', 1: { type: 'A', label: '冠名贊助', costG: 150, succRate: 0.9, succ: { rp: 5 }, fail: {} }, 2: { type: 'A', label: '手冊贊助', costG: 50, succRate: 0.9, succ: { rp: 2 }, fail: {} }, 3: { type: 'C', label: '藝術高估', costG: 400, succRate: 0.8, succ: { g: 350, rp: 12 }, fail: { g: 0, rp: 0 }, tags: ['洗錢疑慮'], lawCaseIds: ['C-05-3'] } },
  'C-06': { title: '醫療資源', description: '全球傳染病緊急防疫。', 1: { type: 'C', label: '劣質抵稅', costG: 400, succRate: 0.8, succ: { g: 350, rp: 12 }, fail: { g: 0, rp: 0 }, tags: ['洗錢疑慮'], lawCaseIds: ['C-06-1'] }, 2: { type: 'A', label: '物資捐助', costG: 50, succRate: 0.9, succ: { rp: 2 }, fail: {} }, 3: { type: 'A', label: '快篩研發', costG: 150, succRate: 0.9, succ: { rp: 5 }, fail: {} } },
  'C-07': { title: '海洋守護', description: '清理塑膠垃圾責任。', 1: { type: 'A', label: '淨灘活動', costG: 50, succRate: 0.9, succ: { rp: 2 }, fail: {} }, 2: { type: 'A', label: '減塑研發', costG: 150, succRate: 0.9, succ: { rp: 5 }, fail: { loss: 50 } }, 3: { type: 'C', label: '廣告洗腦', costG: 400, succRate: 0.8, succ: { g: 350, rp: 15 }, fail: { g: 0, rp: 0 }, tags: ['洗錢疑慮'], lawCaseIds: ['C-07-3'] } },
  'C-08': { title: '體育賽事', description: '基層足球聯賽。', 1: { type: 'A', label: '冠名贊助', costG: 150, succRate: 0.9, succ: { rp: 5 }, fail: {} }, 2: { type: 'C', label: '公關回扣', costG: 400, succRate: 0.8, succ: { g: 350, rp: 12 }, fail: { g: 0, rp: 0 }, tags: ['洗錢疑慮'], lawCaseIds: ['C-08-2'] }, 3: { type: 'A', label: '小額捐款', costG: 50, succRate: 0.9, succ: { rp: 2 }, fail: {} } },

  'D-01': { title: '監控系統標案', description: '規格高市場少數資格標。', 1: { type: 'B', label: '圍標分配', costG: 300, succRate: 0.75, succ: { g: 60, tags: ['非法圍標', '借牌投標'], lawCaseIds: ['D-01-1'] }, fail: { g: -200 } }, 2: { type: 'A', label: '報價精算', costG: 150, succRate: 0.9, succ: { g: 100, rp: 2 }, fail: {} }, 3: { type: 'C', label: '檢舉逃費', costG: 0, special: 'skip_next', rp: 8 } },
  'D-02': { title: '風電標案', description: '十年合約穩定現金。', 1: { type: 'A', label: '程序合規', costG: 150, succRate: 0.9, succ: { g: 100, rp: 2 }, fail: {} }, 2: { type: 'B', label: '贊助圖利', costG: 350, succRate: 0.75, succ: { g: 80, tags: ['公務員圖利', '行賄罪'], lawCaseIds: ['D-02-2'] }, fail: { g: -200 } }, 3: { type: 'A', label: '永續工法', costG: 250, succRate: 0.9, succ: { g: 100, rp: 2 }, fail: {} } },
  'D-03': { title: '教育採購', description: '對手有評委私交。', 1: { type: 'C', label: '舉報餐敘', costG: 0, special: 'skip_next', rp: 8 }, 2: { type: 'B', label: '顧問費通融', costG: 400, succRate: 0.75, succ: { g: 50, tags: ['行賄', '圖利'], lawCaseIds: ['D-03-2'] }, fail: { g: -200 } }, 3: { type: 'A', label: '技術實力', costG: 100, succRate: 0.9, succ: { g: 100, rp: 2 }, fail: {} } },
  'D-04': { title: '偏鄉醫療標案', description: '公益性提升形象。', 1: { type: 'C', label: '技術造假舉報', costG: 0, special: 'skip_next', rp: 8 }, 2: { type: 'C', label: '資安檢舉', costG: 0, special: 'skip_next', rp: 8 }, 3: { type: 'B', label: '規格鎖死', costG: 300, succRate: 0.75, succ: { g: 70, tags: ['圖利罪', '圍標'], lawCaseIds: ['D-04-3'] }, fail: { g: -200 } } },
  'D-05': { title: '防火牆標案', description: '國防機密。', 1: { type: 'B', label: '隱形聯盟', costG: 400, succRate: 0.75, succ: { g: 80, tags: ['借牌投標', '非法圍標'], lawCaseIds: ['D-05-1'] }, fail: { g: -200 } }, 2: { type: 'A', label: '保密自主', costG: 150, succRate: 0.9, succ: { g: 100, rp: 2 }, fail: {} }, 3: { type: 'C', label: '背景檢舉', costG: 0, special: 'skip_next', rp: 8 } },
  'D-06': { title: '公共改建標案', description: '涉及到多項硬體更新。', 1: { type: 'B', label: '旅遊行賄', costG: 450, succRate: 0.75, succ: { g: 60, tags: ['交付賄賂', '圖利罪'], lawCaseIds: ['D-06-1'] }, fail: { g: -200 } }, 2: { type: 'A', label: '實預算工法', costG: 100, succRate: 0.9, succ: { g: 100, rp: 2 }, fail: {} }, 3: { type: 'A', label: '自主永續', costG: 150, succRate: 0.9, succ: { g: 100, rp: 2 }, fail: {} } },

  'E-01': { title: '物理銷毀', description: '風聲緊數據纪录。', 1: { type: 'C', label: '物理銷毀', costCashPct: 0.3, succRate: 0.6, succ: { bm: 'all' }, fail: { special: 'sue', tags: ['湮滅證據'], lawCaseIds: ['E-01-1'] } }, 2: { type: 'A', label: '合規化', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } }, 3: { type: 'A', label: '資產化', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } } },
  'E-02': { title: '證人口供', description: '前員工準備質詢。', 1: { type: 'C', label: '離職賠償封口', costCashPct: 0.3, succRate: 0.6, succ: { bm: 'all' }, fail: { special: 'sue', tags: ['偽證罪'], lawCaseIds: ['E-02-1'] } }, 2: { type: 'A', label: 'NDA 提醒', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } }, 3: { type: 'C', label: '挑戰誠信', costCashPct: 0.3, succRate: 0.6, succ: { bm: 'all' }, fail: { special: 'sue', tags: ['湮滅證據'], lawCaseIds: ['E-01-1'] } } },
  'E-03': { title: 'Log 抹除', description: '連線紀錄數位足跡。', 1: { type: 'A', label: '資料政策', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } }, 2: { type: 'C', label: '手動抹除', costCashPct: 0.3, succRate: 0.6, succ: { bm: 'all' }, fail: { special: 'sue', tags: ['湮滅證據'], lawCaseIds: ['E-03-2'] } }, 3: { type: 'A', label: '加密混淆', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } } },
  'E-04': { title: '追認合約', description: '补救空殼轉資產穴。', 1: { type: 'C', label: '日期級協助', costCashPct: 0.3, succRate: 0.6, succ: { bm: 'all' }, fail: { special: 'sue', tags: ['偽造私文書'], lawCaseIds: ['E-04-1'] } }, 2: { type: 'A', label: '協議修補', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } }, 3: { type: 'C', label: '會議紀錄偽造', costCashPct: 0.3, succRate: 0.6, succ: { bm: 'all' }, fail: { special: 'sue', tags: ['偽造私文書'], lawCaseIds: ['E-01-1'] } } },
  'E-05': { title: '信託掩護', description: '黑箱流向被稅務盯。', 1: { type: 'A', label: '補繳認罪', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } }, 2: { type: 'C', label: '層次轉移', costCashPct: 0.3, succRate: 0.6, succ: { bm: 'all' }, fail: { special: 'sue', tags: ['洗錢罪'], lawCaseIds: ['E-05-2'] } }, 3: { type: 'A', label: '無形價值重組', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } } },
  'E-06': { title: '電子郵件', description: '亲手下達指令副本。', 1: { type: 'C', label: '硬體銷毀', costCashPct: 0.3, succRate: 0.6, succ: { bm: 'all' }, fail: { special: 'sue', tags: ['湮滅證據'], lawCaseIds: ['E-01-1'] } }, 2: { type: 'A', label: '特權保護', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } }, 3: { type: 'A', label: '年份清理', costCashPct: 0.05, succRate: 0.9, succ: { bm: 1 }, fail: { loss: 100 } } },

};

export function getCard(id: string) { return CARDS_DB[id]; }
export function getLocationType(id: string) { return id.split('-')[0]; }
export function getAllCardIds() { return Object.keys(CARDS_DB); }
export function getCardCounts() {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const id in CARDS_DB) { counts[id.split('-')[0]]++; }
  return counts;
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Emergency recovery file written successfully.")
