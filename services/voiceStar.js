
import { supabase } from "../lib/supabase";

function checkError(error) {
  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  checkError(error);
  return data.user;
}

export async function getArtistProfile(profileId) {
  if (!profileId) throw new Error("Profile ID is required.");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  checkError(error);
  return data;
}

export async function updateArtistProfile(profileId, updates) {
  const allowed = [
    "username",
    "display_name",
    "bio",
    "avatar_url",
    "role",
  ];

  const safeUpdates = Object.fromEntries(
    Object.entries(updates || {}).filter(([key]) =>
      allowed.includes(key)
    )
  );

  if (!profileId || !Object.keys(safeUpdates).length) {
    throw new Error("Profile ID and valid fields are required.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId)
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
  if (!user) throw new Error("Please sign in first.");

  const audioUrl = song?.audio_url ?? song?.audioUrl;

  if (!song?.title || !audioUrl) {
    throw new Error("Song title and audio URL are required.");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", user.id)
      .maybeSingle();

  checkError(profileError);

  if (!profile) {
    throw new Error("Artist profile not found.");
  }

  const hashtags = Array.isArray(song.hashtags)
    ? song.hashtags
    : typeof song.hashtags === "string"
      ? song.hashtags.split(/[ ,]+/).filter(Boolean)
      : [];

  const { data, error } = await supabase
    .from("songs")
    .insert({
      artist_id: profile.id,
      user_id: profile.id,
      title: song.title,
      artist_name:
        song.artist_name ??
        song.artistName ??
        profile.display_name ??
        profile.username ??
        "VoiceStar Artist",
      genre: song.genre ?? "Afrobeats",
      description: song.description ?? "",
      audio_url: audioUrl,
      cover_url: song.cover_url ?? song.coverUrl ?? null,
      visibility:
        song.visibility === "private" ? "private" : "public",
      status: "published",
      hashtags,
    })
    .select()
    .single();

  checkError(error);
  return data;
}

export async function followArtist(profileId, artistId) {
  if (!profileId || !artistId) {
    throw new Error("Both profile IDs are required.");
  }

  if (profileId === artistId) {
    throw new Error("You cannot follow yourself.");
  }

  const { error } = await supabase
    .from("follows")
    .upsert(
      {
        follower_id: profileId,
        following_id: artistId,
      },
      { onConflict: "follower_id,following_id" }
    );

  checkError(error);
}

export async function unfollowArtist(profileId, artistId) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", profileId)
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
