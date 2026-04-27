// 測試分頁邏輯
const desc = "你的第一桶金來得比別人快。\n研究所還沒畢業，你就把一份市場分析報告包裝成商業計畫書，拿去敲了幾個天使投資人的門。報告裡的數字是真的，但那份自信是裝出來的——你把最樂觀的情境寫成基本預測，把競爭對手的弱點放大了兩倍，然後用一套你在書上學來的話術，讓對方覺得現在不投就來不及了。\n第一輪融資到了。\n公司起步的那段時間，你跑得很快，快到有些事情沒有仔細想清楚。早期幾份客戶合約，你用了一些你並不完全確定自己有權使用的技術授權；幾次業績報告，數字上做了一點點對你有利的「詮釋」；有一次供應商催款，你讓財務用備用帳戶周轉了一筆說不太清楚來源的資金。\n當時覺得這些都是小事，是創業期的彈性操作，等公司站穩了自然會走回正軌。\n後來也確實走回來了。規模大了，制度建起來了，那些早期的灰色操作被壓在公司歷史的最底層，沒人再提起。但你知道它們在那裡。每次看到稽查相關的新聞，你會有一秒鐘的停頓。每次法務團隊提到早期的合約紀錄，你會不著痕跡地把話題帶過去。\n公司現在很好。但好的是現在，不是過去。\n你坐在這裡，手邊是最新一季的財報，數字漂亮，投資人滿意。你告訴自己那些事已經過去了。你也告訴自己，這次不一樣了。";

// 舊方法
const oldPages = desc.split('\n\n');
console.log('=== 舊分頁 (split \\n\\n) ===');
console.log('頁數:', oldPages.length);
oldPages.forEach((p, i) => console.log(`  Page ${i+1} (${p.length} chars): ${p.substring(0, 40)}...`));

console.log('');

// 新方法
const paginate = (text, maxChars = 200) => {
  const paragraphs = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const pages = [];
  let current = '';
  for (const para of paragraphs) {
    if (current.length > 0 && (current.length + para.length + 1) > maxChars) {
      pages.push(current);
      current = para;
    } else {
      current = current ? current + '\n' + para : para;
    }
  }
  if (current.length > 0) pages.push(current);
  return pages.length > 0 ? pages : [''];
};

const newPages = paginate(desc);
console.log('=== 新分頁 (auto-paginate 200) ===');
console.log('頁數:', newPages.length);
newPages.forEach((p, i) => console.log(`  Page ${i+1} (${p.length} chars): ${p.substring(0, 50)}...`));
