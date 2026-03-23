import re
import os
import json

# 設定檔案路徑
CARDS_DB_PATH = r'c:\Users\asdfg\Desktop\antigravaty\src\engine\CardsDB.ts'
LAW_CASES_DB_PATH = r'c:\Users\asdfg\Desktop\antigravaty\src\engine\LawCasesDB.ts'

def load_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def validate_and_reconstruct():
    print("--- 開始驗證與重建卡牌資料庫 ---")
    
    cards_content = load_file(CARDS_DB_PATH)
    laws_content = load_file(LAW_CASES_DB_PATH)

    # 1. 提取所有 LawCase IDs
    # 簡單的 Regex 提取字串 ID，例如 "LC-A01" 或 "A-01-2"
    law_ids = set(re.findall(r'"([A-ZLC0-9-]+)": \{', laws_content))
    print(f"找到 {len(law_ids)} 個法律案件定義。")

    # 2. 提取所有卡牌定義
    # 匹配 'A-01': { ... }
    card_pattern = re.compile(r"'([A-E]-[0-9]{2})': \{", re.DOTALL)
    card_ids = card_pattern.findall(cards_content)
    print(f"找到 {len(card_ids)} 張卡牌。")

    missing_cases = []
    
    # 3. 檢查 B/C 選項是否都有 lawCaseIds 且對應到 LawCasesDB
    # 我們遍歷每一張卡進行細部檢查
    for card_id in card_ids:
        # 尋找該卡片的區塊（直到下一個卡片或結尾）
        start_idx = cards_content.find(f"'{card_id}': {{")
        # 假設大括號對齊，簡單找下一個卡片開頭
        next_card_match = card_pattern.search(cards_content, start_idx + 1)
        end_idx = next_card_match.start() if next_card_match else len(cards_content)
        card_block = cards_content[start_idx:end_idx]

        # 檢查選項類型 B 或 C
        # 這裡用 Regex 掃描選項區塊
        options = re.findall(r"([1-3]): \{ type: '([BC])',.*?lawCaseIds: \[(.*?)\]", card_block, re.DOTALL)
        for opt_idx, opt_type, cases_str in options:
            cases = [c.strip().strip("'").strip('"') for c in cases_str.split(',') if c.strip()]
            if not cases:
                print(f"[警告] 卡片 {card_id} 選項 {opt_idx} (類型 {opt_type}) 缺少 lawCaseIds")
            else:
                for c_id in cases:
                    if c_id not in law_ids:
                        print(f"[錯誤] 卡片 {card_id} 關聯的法案 {c_id} 不存在於 LawCasesDB.ts")
                        missing_cases.append((card_id, c_id))

    # 4. 規則檢查：檢查 A 類選項是否都有 succRate (依 GEMINI.md)
    a_options_without_rate = re.findall(r"'([A-E]-[0-9]{2})': \{.*?([1-3]): \{ type: 'A', (?!.*?succRate)", cards_content, re.DOTALL)
    for card_id, opt_idx in a_options_without_rate:
        if card_id.startswith('A-') or card_id.startswith('B-') or card_id.startswith('C-'):
            print(f"[警告] 卡片 {card_id} 選項 {opt_idx} (類型 A) 缺少 succRate 定義")

    print("\n--- 驗證結束 ---")
    if not missing_cases:
        print("✅ 所有 B/C 關聯法案皆正確對應。")
    else:
        print(f"❌ 共有 {len(missing_cases)} 個錯誤。")

if __name__ == "__main__":
    validate_and_reconstruct()
