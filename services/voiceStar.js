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

// Get an artist profile
export async function getArtistProfile(profileId) {
  if (!profileId) {
    throw new Error("Profile ID is required.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  checkError(error);
  return data;
}

// Update a profile using columns in schema.sql
export async function updateArtistProfile(profileId, updates) {
  if (!profileId) {
    throw new Error("Profile ID is required.");
  }

  const allowed = [
    "full_name",
    "artist_name",
    "bio",
    "avatar_url",
    "is_private",
  ];

  const safeUpdates = Object.fromEntries(
    Object.entries(updates || {}).filter(([key]) =>
      allowed.includes(key)
    )
  );

  if (Object.keys(safeUpdates).length === 0) {
    throw new Error("No valid profile fields provided.");
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

// Get published songs
export async function getSongs(limit = 20) {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  checkError(error);
  return data ?? [];
}

// Publish a song
export async function publishSong(song) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Please sign in before publishing.");
  }

  if (!song?.title || !(song.audio_url || song.audioUrl)) {
    throw new Error("Song title and audio URL are required.");
  }

  // Find the existing profile belonging to this signed-in user.
  let profileQuery = supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id);

  let { data: profile, error: profileError } =
    await profileQuery.maybeSingle();

  checkError(profileError);

  // Some existing schemas store a different profile UUID.
  if (!profile && user.email) {
    const result = await supabase
      .from("profiles")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    checkError(result.error);
    profile = result.data;
  }

  if (!profile) {
    throw new Error(
      "Artist profile not found. Create your profile before publishing."
    );
  }

  const payload = {
    profile_id: profile.id,
    title: song.title,
    artist_name:
      song.artist_name ??
      song.artistName ??
      "VoiceStar Artist",
    genre: song.genre ?? "Afrobeats",
    description: song.description ?? "",
    audio_url: song.audio_url ?? song.audioUrl,
    cover_url: song.cover_url ?? song.coverUrl ?? null,
    is_published: true,
  };

  const { data, error } = await supabase
    .from("songs")
    .insert(payload)
    .select()
    .single();

  checkError(error);
  return data;
}

// Follow an artist
// artistId must be the ID from the artists table.
export async function followArtist(profileId, artistId) {
  if (!profileId || !artistId) {
    throw new Error("Profile ID and artist ID are required.");
  }

  const { error } = await supabase
    .from("followers")
    .upsert(
      {
        profile_id: profileId,
        artist_id: artistId,
      },
      {
        onConflict: "profile_id,artist_id",
      }
    );

  checkError(error);
}

// Unfollow an artist
export async function unfollowArtist(profileId, artistId) {
  if (!profileId || !artistId) {
    throw new Error("Profile ID and artist ID are required.");
  }

  const { error } = await supabase
    .from("followers")
    .delete()
    .eq("profile_id", profileId)
    .eq("artist_id", artistId);

  checkError(error);
}

// Get live rooms
export async function getLiveRooms() {
  const { data, error } = await supabase
    .from("live_rooms")
    .select("*")
    .eq("is_live", true)
    .order("created_at", { ascending: false });

  checkError(error);
  return data ?? [];
}

// Get incomplete tasks
export async function getTasks(profileId) {
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("completed", false)
    .order("created_at", { ascending: false });

  if (profileId) {
    query = query.eq("profile_id", profileId);
  }

  const { data, error } = await query;

  checkError(error);
  return data ?? [];
                    }
