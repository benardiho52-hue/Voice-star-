
import { supabase } from '../lib/supabase';

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  if (!user) {
    throw new Error('Please sign in to continue.');
  }

  return user;
}

export async function getMyCoinWallet() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('coin_wallets')
    .select('user_id, balance, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getMyCoinLedger(limit = 50) {
  const user = await requireUser();

  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || 50, 100)
  );

  const { data, error } = await supabase
    .from('coin_ledger')
    .select(
      'id, user_id, delta, entry_type, reference_id, description, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) throw error;

  return data || [];
}
