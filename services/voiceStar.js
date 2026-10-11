
import { supabase } from "../lib/supabase";

// ------------------------------
// Shared helpers
// ------------------------------

function checkError(error) {
  if (error) throw error;
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  checkError(error);

  if (!user) {
    throw new Error("Please sign in to continue.");
  }

  return user;
}

// ------------------------------
// PROFILES
// ------------------------------

export async function getCurrentUser() {
  return await requireUser();
}

export async function getArtistProfile(userId) {
  if (!userId) throw new Error("Artist ID is required.");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  checkError(error);
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
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      cleanUpdates[field] = updates[field];
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error("Enter profile details to update.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(cleanUpdates)
    .eq("id", user.id)
    .select()
    .single();

  checkError(error);
  return data;
}

// ------------------------------
// SONGS AND HOME FEED
// ------------------------------

export async function getSongs(limit = 30) {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("visibility", "public")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  checkError(error);
  return data ?? [];
}

export async function getArtistSongs(artistId) {
  if (!artistId) throw new Error("Artist ID is required.");

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("artist_id", artistId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  checkError(error);
  return data ?? [];
}

export async function publishSong({
  title,
  genre,
  description = "",
  cover_url = null,
  audio_url,
  hashtags = [],
  visibility = "public",
}) {
  const user = await requireUser();

  if (!title?.trim()) {
    throw new Error("Enter a song title.");
  }

  if (!audio_url) {
    throw new Error("Upload or save your song audio first.");
  }

  if (!["public", "private"].includes(visibility)) {
    throw new Error("Visibility must be public or private.");
  }

  const { data, error } = await supabase
    .from("songs")
    .insert({
      user_id: user.id,
      artist_id: user.id,
      title: title.trim(),
      genre: genre || null,
      description,
      cover_url,
      audio_url,
      hashtags,
      visibility,
      status: "published",
    })
    .select()
    .single();

  checkError(error);
  return data;
}

// ------------------------------
// LIVE ROOMS
// ------------------------------

export async function getLiveRooms() {
  const { data, error } = await supabase
    .from("live_rooms")
    .select("*")
    .eq("status", "live")
    .order("created_at", { ascending: false });

  checkError(error);
  return data ?? [];
}

export async function createLiveRoom({
  title,
  livekit_room = null,
}) {
  const user = await requireUser();

  if (!title?.trim()) {
    throw new Error("Enter a room title.");
  }

  const { data, error } = await supabase
    .from("live_rooms")
    .insert({
      host_id: user.id,
      title: title.trim(),
      status: "live",
      viewer_count: 0,
      livekit_room,
    })
    .select()
    .single();

  checkError(error);
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

  checkError(error);
  return data;
}

// ------------------------------
// FOLLOWERS
// ------------------------------

export async function getArtistFollowers(artistId) {
  if (!artistId) throw new Error("Artist ID is required.");

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("following_id", artistId);

  checkError(error);
  return data ?? [];
}

export async function getFollowing(userId) {
  if (!userId) throw new Error("User ID is required.");

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", userId);

  checkError(error);
  return data ?? [];
}

export async function followArtist(artistId) {
  const user = await requireUser();

  if (!artistId) throw new Error("Artist ID is required.");

  if (artistId === user.id) {
    throw new Error("You cannot follow yourself.");
  }

  const { error } = await supabase
    .from("follows")
    .insert({
      follower_id: user.id,
      following_id: artistId,
    });

  checkError(error);
  return true;
}

export async function unfollowArtist(artistId) {
  const user = await requireUser();

  if (!artistId) throw new Error("Artist ID is required.");

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", artistId);

  checkError(error);
  return true;
}

// ------------------------------
// SONG LIKES
// ------------------------------

export async function likeSong(songId) {
  const user = await requireUser();

  if (!songId) throw new Error("Song ID is required.");

  const { error } = await supabase
    .from("likes")
    .insert({
      user_id: user.id,
      song_id: songId,
    });

  checkError(error);
  return true;
}

export async function unlikeSong(songId) {
  const user = await requireUser();

  if (!songId) throw new Error("Song ID is required.");

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("user_id", user.id)
    .eq("song_id", songId);

  checkError(error);
  return true;
}

// ------------------------------
// COMMENTS
// ------------------------------

export async function getSongComments(songId) {
  if (!songId) throw new Error("Song ID is required.");

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("song_id", songId)
    .order("created_at", { ascending: true });

  checkError(error);
  return data ?? [];
}

export async function addSongComment(songId, text) {
  const user = await requireUser();

  if (!songId) throw new Error("Song ID is required.");
  if (!text?.trim()) throw new Error("Write a comment first.");

  const { data, error } = await supabase
    .from("comments")
    .insert({
      song_id: songId,
      user_id: user.id,
      text: text.trim(),
    })
    .select()
    .single();

  checkError(error);
  return data;
}

// ------------------------------
// NOTIFICATIONS
// ------------------------------

export async function getMyNotifications() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  checkError(error);
  return data ?? [];
}

export async function markNotificationRead(notificationId) {
  const user = await requireUser();

  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .select()
    .single();

  checkError(error);
  return data;
}

// ------------------------------
// ACHIEVEMENTS
// ------------------------------

export async function getAchievements() {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("active", true);

  checkError(error);
  return data ?? [];
}

export async function getMyAchievements() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", user.id);

  checkError(error);
  return data ?? [];
}
