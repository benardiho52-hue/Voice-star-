import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  'https://kdpqbdytfvnbtiwnaafo.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_qU0P4XwycZ33TrsY2EyF0w__A2KdawN';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);