import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Realtime sync will be disabled.');
}

// 建立一個安全的 Proxy 代理，防止 supabase 為空時調用方法導致黑畫面崩潰
const createSafeSupabase = () => {
  if (supabaseUrl && supabaseAnonKey) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.error('Supabase init error:', e);
    }
  }
  
  console.warn('Supabase is running in MOCK mode (missing env vars)');
  
  // 返回一個代理物件，攔截所有調用
  return new Proxy({} as any, {
    get: (_, prop) => {
      if (prop === 'auth') return { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) };
      return () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }) }),
        from: () => ({ 
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          select: () => ({ 
            eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }) 
          })
        }),
        channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
      });
    }
  });
};

export const supabase = createSafeSupabase();
