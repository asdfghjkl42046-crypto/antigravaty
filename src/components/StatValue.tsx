'use client'; // 包含精密的數字跳動動畫與計時器，必須在客端環境執行

import { useState, useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** UI 動態樣式縫合工具 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 財報看板資料接口：接收外資準備匯入的最新數據
interface StatValueProps {
  value: number; // 戶頭裡血淋淋的最新餘額
  suffix?: string; // 幣值單位綴飾 (例如 萬、點)
  color?: string; // 文字顏色
  fontSize?: string; // 字體大小
}

/**
 * 數值顯示元件
 * 負責以漂亮的方式顯示錢 (G)、名聲 (RP) 等數值。
 * 每當數值變動時，會在原本數字的上方彈出一個跳動的加減號，顯示變動的數值。
 */
export default function StatValue({
  value,
  suffix = '',
  color = '',
  fontSize = 'text-base',
}: StatValueProps) {
  // 假帳底本：顯示在枱面上給人看的大數字
  const [displayValue, setDisplayValue] = useState(value);
  // 秘密差額：這次交易到底暗槓了多少錢 (Delta)
  const [diff, setDiff] = useState<number | null>(null);
  // 煙火開關：控制要不要把這次賺到的差價彈出來炫耀
  const [showDiff, setShowDiff] = useState(false);
  // 暴力重繪金鑰：用全新的時間戳強迫畫面打掉重練，確保每次洗錢動畫都能完美彈跳
  const [diffKey, setDiffKey] = useState(0);

  // 秘密黑盒子 (Ref)：悄悄記下上一筆帳的舊數字。
  // 寫在這裡就算被反覆查帳也不會引發效能崩潰的連鎖地獄
  const prevValueRef = useRef(value);

  // 查水表雷達：一旦發現上層資金有變動，立刻啟動炫耀（或吐血）動畫！
  useEffect(() => {
    if (value !== prevValueRef.current) {
      // 計算淨差額：到底被坑了多少還是賺了多少 (新值 - 舊值)
      const delta = value - prevValueRef.current;
      setDiff(delta);
      setShowDiff(true); // 點火發射特效數字
      setDisplayValue(value); // 瞬間把作假帳的大螢幕數字蓋成新的
      setDiffKey((prev) => prev + 1); // [遞增 Key]：確保頻繁更新時，React 仍能識別為新元件並重啟動畫特效

      // 把新數字鎖進黑盒子備查，以免下回合重複計算
      prevValueRef.current = value;

      // 毀屍滅跡計時器：炫耀個 2 秒就好，馬上把彈出的數字銷毀免得留下證據
      const timer = setTimeout(() => setShowDiff(false), 2000);

      // 斷尾求生：如果兩秒內金錢再度暴增，立刻把上一個計時器滅口以重新起算
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    // 數字看板基石：提供跳動泡泡一個絕對死角的發射基地
    <div className="relative group/stat">
      {/* 穩如泰山的表面財報數字 */}
      <p className={cn(fontSize, 'font-black tracking-tighter transition-all duration-300', color)}>
        {displayValue}
        {suffix}
      </p>

      {/* 只有在真的有錢進出的瞬間，才會激射出帶有加減號的漂浮小計數器 */}
      {showDiff && diff !== null && diff !== 0 && (
        <span
          key={diffKey}
          // -top-6 讓暴衝的數字往上飛，並加上磨砂背景防止字體溶入凌亂的戰場
          className={cn(
            'absolute -top-6 right-0 text-[11px] font-black animate-val-up whitespace-nowrap z-[60] py-0.5 px-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10',
            // 利潤就是綠色，被扒皮就是血紅色
            diff > 0 ? 'text-emerald-400' : 'text-rose-400'
          )}
        >
          {/* 如果是賺錢，霸氣地強制在前面冠上 "+" 號 */}
          {diff > 0 ? `+${diff}` : diff}
          {suffix}
        </span>
      )}
    </div>
  );
}
