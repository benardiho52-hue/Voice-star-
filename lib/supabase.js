
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdpqbdytfvnbtiwnaafo.supabase.co';

const supabasePublishableKey =
  'sb_publishable_qU0P4XwycZ33TrsY2EyF0w__A2KdawN';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

export async function getMyProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, username, display_name, bio, avatar_url, personal_level, personal_xp'
    )
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
