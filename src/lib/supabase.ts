import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Realtime sync will be disabled.');
}

/**
 * Supabase 實時通訊客戶端
 * 用於處理 PVP 房間同步、廣播與資料庫更新。
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
