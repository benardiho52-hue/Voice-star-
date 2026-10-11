import { supabase } from "../lib/supabase";

function checkError(error) {
  if (error) {
    throw new Error(error.message || "VoiceStar request failed.");
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  checkError(error);
  return data.user;
}

export async function getArtistProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  checkError(error);
  return data;
}

export async function updateArtistProfile(userId, updates) {
  const allowed = ["username", "display_name", "bio", "avatar_url"];
  const safeUpdates = Object.fromEntries(
    Object.entries(updates || {}).filter(([key]) =>
      allowed.includes(key)
    )
  );

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  checkError(error);
  return data;
}

export async function getSongs(limit = 20) {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  checkError(error);
  return data ?? [];
}

export async function publishSong(song) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Please sign in before publishing.");
  }

  const payload = {
    title: song.title,
    audio_url: song.audio_url ?? song.audioUrl,
    user_id: user.id,
    artist_id: user.id,
    artist_name:
      song.artist_name ??
      song.artistName ??
      "VoiceStar Artist",
    genre: song.genre ?? "Afrobeats",
    cover_url: song.cover_url ?? song.coverUrl ?? null,
    visibility: song.visibility ?? "public",
    status: song.status ?? "published",
    description: song.description ?? "",
    hashtags: Array.isArray(song.hashtags)
      ? song.hashtags
      : [],
  };

  if (!payload.title || !payload.audio_url) {
    throw new Error("Song title and audio URL are required.");
  }

  const { data, error } = await supabase
    .from("songs")
    .insert(payload)
    .select()
    .single();

  checkError(error);
  return data;
}

export async function followArtist(followerId, artistId) {
  if (!followerId || !artistId) {
    throw new Error("Both user IDs are required.");
  }

  if (followerId === artistId) {
    throw new Error("You cannot follow yourself.");
  }

  const { error } = await supabase
    .from("follows")
    .upsert(
      {
        follower_id: followerId,
        following_id: artistId,
      },
      { onConflict: "follower_id,following_id" }
    );

  checkError(error);
}

export async function unfollowArtist(followerId, artistId) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", artistId);

  checkError(error);
}

export async function getLiveRooms() {
  const { data, error } = await supabase
    .from("live_rooms")
    .select("*")
    .eq("status", "live")
    .order("created_at", { ascending: false });

  checkError(error);
  return data ?? [];
}

export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  checkError(error);
  return data ?? [];
}
