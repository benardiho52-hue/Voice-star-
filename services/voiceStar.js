
import { supabase } from "../lib/supabase";

/**
 * VoiceStar backend service
 * Handles artist profiles, songs, followers,
 * live rooms, chat messages, and task rewards.
 */

function handleError(error) {
  if (error) {
    throw new Error(error.message || "VoiceStar request failed.");
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  handleError(error);
  return data.user;
}

export async function getArtistProfile(userId) {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  handleError(error);
  return data;
}

export async function updateArtistProfile(userId, updates) {
  const { data, error } = await supabase
    .from("artists")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  handleError(error);
  return data;
}

export async function getSongs(limit = 20) {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  handleError(error);
  return data ?? [];
}

export async function publishSong(song) {
  const { data, error } = await supabase
    .from("songs")
    .insert(song)
    .select()
    .single();

  handleError(error);
  return data;
}

export async function followArtist(followerId, artistId) {
  if (followerId === artistId) {
    throw new Error("You cannot follow yourself.");
  }

  const { error } = await supabase
    .from("followers")
    .upsert(
      {
        follower_id: followerId,
        artist_id: artistId,
      },
      { onConflict: "follower_id,artist_id" }
    );

  handleError(error);
}

export async function unfollowArtist(followerId, artistId) {
  const { error } = await supabase
    .from("followers")
    .delete()
    .eq("follower_id", followerId)
    .eq("artist_id", artistId);

  handleError(error);
}

export async function getLiveRooms() {
  const { data, error } = await supabase
    .from("live_rooms")
    .select("*")
    .order("created_at", { ascending: false });

  handleError(error);
  return data ?? [];
}

export async function sendChatMessage(message) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert(message)
    .select()
    .single();

  handleError(error);
  return data;
}

export async function getChatMessages(roomId, limit = 50) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(limit);

  handleError(error);
  return data ?? [];
}

export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*");

  handleError(error);
  return data ?? [];
}
