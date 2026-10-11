
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_SUPABASE_PROJECT_URL";
const supabaseAnonKey = "YOUR_SUPABASE_PUBLISHABLE_KEY";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
