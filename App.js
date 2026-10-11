
import { supabase } from "./supabase";

/**
 * Publish a song to the VoiceStar Supabase database.
 *
 * Required:
 * - title
 * - audioUrl: a real URL for an uploaded audio file
 *
 * Optional:
 * - genre
 * - description
 * - hashtags: an array of strings
 * - coverUrl
 * - visibility: "public" or "private"
 * - artistName
 */
export async function publishSongToSupabase({
  title,
  audioUrl,
  genre = "Afrobeats",
  description = "",
  hashtags = [],
  coverUrl = null,
  visibility = "public",
  artistName = "VoiceStar Artist",
}) {
  const cleanTitle = title?.trim();
  const cleanAudioUrl = audioUrl?.trim();

  if (!cleanTitle) {
    throw new Error("Please enter a song title.");
  }

  if (!cleanAudioUrl) {
    throw new Error(
      "A real audio URL is required before you can publish a song."
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Could not verify your account: ${authError.message}`);
  }

  if (!user) {
    throw new Error(
      "Please sign in to VoiceStar before publishing a song."
    );
  }

  const cleanArtistName =
    artistName?.trim() || "VoiceStar Artist";

  const cleanHashtags = Array.isArray(hashtags)
    ? hashtags
        .map((tag) => String(tag).trim().replace(/^#/, ""))
        .filter(Boolean)
    : [];

  const song = {
    title: cleanTitle,
    artist_id: user.id,
    user_id: user.id,
    artist_name: cleanArtistName,
    genre: genre?.trim() || "Afrobeats",
    description: description?.trim() || "",
    hashtags: cleanHashtags,
    audio_url: cleanAudioUrl,
    cover_url: coverUrl || null,
    visibility: visibility === "private" ? "private" : "public",
    status: "published",
  };

  const { data, error } = await supabase
    .from("songs")
    .insert(song)
    .select()
    .single();

  if (error) {
    console.error("VoiceStar song publishing failed:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Load public songs from VoiceStar.
 */
export async function getPublishedSongs() {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("visibility", "public")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load VoiceStar songs:", error);
    throw new Error(error.message);
  }

  return data || [];
}
