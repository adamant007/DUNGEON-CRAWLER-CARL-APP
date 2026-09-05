import type { CloudPayload } from './types';
import { getSupabase } from './supabase';

const PREFIX = 'crawler-companion:';

export function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode / quota) */
  }
}

/** Name of the cloud table holding one save row per authenticated user. */
const TABLE = 'crawler_saves';

export async function saveCloud(userId: string, payload: CloudPayload): Promise<void> {
  const pending = getSupabase();
  if (!pending) throw new Error('Cloud saving is not configured.');
  const supabase = await pending;
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function loadCloud(userId: string): Promise<{ data: CloudPayload; updatedAt: string } | null> {
  const pending = getSupabase();
  if (!pending) throw new Error('Cloud saving is not configured.');
  const supabase = await pending;
  const { data, error } = await supabase.from(TABLE).select('data, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { data: (data as any).data as CloudPayload, updatedAt: (data as any).updated_at as string };
}
