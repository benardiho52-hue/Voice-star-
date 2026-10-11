import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
console.warn(
"VoiceStar: Supabase URL or anon key is missing. Check your environment variables."
);
}

export const supabase = createClient(
SUPABASE_URL || "https://your-project.supabase.co",
SUPABASE_ANON_KEY || "your-anon-key",
{
auth: {
persistSession: true,
autoRefreshToken: true,
detectSessionInUrl: false,
},
}
);

export default supabase;