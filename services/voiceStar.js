import { supabase } from "../lib/supabase";

// ================================
// VOICESTAR SERVICE
// ================================

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  if (!user) {
    throw new Error("Please sign in to continue.");
  }

  return user;
}

// ================================
// USER PROFILE
// ================================

export async function getCurrentUser() {
  return requireUser();
}

export async function getArtistProfile(userId) {
  if (!userId) throw new Error("Artist ID is required.");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateMyProfile(updates) {
  const user = await requireUser();

  const allowedFields = [
    "username",
    "display_name",
    "bio",
    "avatar_url",
  ];

  const cleanUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      cleanUpdates[field] = updates[field];
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error("No valid profile fields provided.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(cleanUpdates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================================
// SONGS
// ================================

export async function getSongs(limit = 30) {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getArtistSongs(artistId) {
  if (!artistId) throw new Error("Artist ID is required.");

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", artistId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function publishSong(song) {
  const user = await requireUser();

  if (!song?.title?.trim()) {
    throw new Error("Please enter a song title.");
  }

  if (!song?.audio_url?.trim()) {
    throw new Error("Please provide the uploaded song audio URL.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  const artistName =
    profile?.display_name ||
    profile?.username ||
    user.email?.split("@")[0] ||
    "VoiceStar Artist";

  const songData = {
    user_id: user.id,
    artist_id: user.id,
    artist_name: artistName,
    title: song.title.trim(),
    audio_url: song.audio_url.trim(),
    genre: song.genre || null,
    cover_url: song.cover_url || null,
    description: song.description || null,
    hashtags: Array.isArray(song.hashtags) ? song.hashtags : [],
    visibility: song.visibility === "private" ? "private" : "public",
    status: "published",
  };

  const { data, error } = await supabase
    .from("songs")
    .insert(songData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================================
// LIVE ROOMS
// ================================

export async function getLiveRooms() {
  const { data, error } = await supabase
    .from("live_rooms")
    .select("*")
    .eq("status", "live")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createLiveRoom(title, livekitRoom = null) {
  const user = await requireUser();

  if (!title?.trim()) {
    throw new Error("Please enter a live room title.");
  }

  const { data, error } = await supabase
    .from("live_rooms")
    .insert({
      host_id: user.id,
      title: title.trim(),
      status: "live",
      viewer_count: 0,
      livekit_room: livekitRoom,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endLiveRoom(roomId) {
  const user = await requireUser();

  if (!roomId) throw new Error("Room ID is required.");

  const { data, error } = await supabase
    .from("live_rooms")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
    })
    .eq("id", roomId)
    .eq("host_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================================
// FOLLOWERS
// ================================

export async function getArtistFollowers(artistId) {
  if (!artistId) throw new Error("Artist ID is required.");

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("following_id", artistId);

  if (error) throw error;
  return data ?? [];
}

export async function getFollowing(userId) {
  const id = userId || (await requireUser()).id;

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", id);

  if (error) throw error;
  return data ?? [];
}

export async function followArtist(artistId) {
  const user = await requireUser();

  if (!artistId) throw new Error("Artist ID is required.");

  if (artistId === user.id) {
    throw new Error("You cannot follow yourself.");
  }

  const { data, error } = await supabase
    .from("follows")
    .insert({
      follower_id: user.id,
      following_id: artistId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { alreadyFollowing: true };
    }
    throw error;
  }

  return data;
}

export async function unfollowArtist(artistId) {
  const user = await requireUser();

  if (!artistId) throw new Error("Artist ID is required.");

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", artistId);

  if (error) throw error;
  return true;
}

// ================================
// SONG LIKES
// ================================

export async function likeSong(songId) {
  const user = await requireUser();

  if (!songId) throw new Error("Song ID is required.");

  const { data, error } = await supabase
    .from("likes")
    .insert({
      user_id: user.id,
      song_id: songId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { alreadyLiked: true };
    }
    throw error;
  }

  return data;
}

export async function unlikeSong(songId) {
  const user = await requireUser();

  if (!songId) throw new Error("Song ID is required.");

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("user_id", user.id)
    .eq("song_id", songId);

  if (error) throw error;
  return true;
}

// ================================
// SONG COMMENTS
// ================================

export async function getSongComments(songId) {
  if (!songId) throw new Error("Song ID is required.");

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("song_id", songId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addSongComment(songId, text) {
  const user = await requireUser();

  if (!songId) throw new Error("Song ID is required.");

  if (!text?.trim()) {
    throw new Error("Please enter a comment.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      song_id: songId,
      user_id: user.id,
      text: text.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================================
// NOTIFICATIONS
// ================================

export async function getMyNotifications() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(notificationId) {
  const user = await requireUser();

  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================================
// ACHIEVEMENTS
// ================================

export async function getAchievements() {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("active", true)
    .order("threshold", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getMyAchievements() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ================================
// COIN WALLET
// ================================

export async function getMyCoinWallet() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("coin_wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return data ?? { user_id: user.id, balance: 0 };
}

export async function getMyCoinLedger(limit = 50) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("coin_ledger")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
    }
