
import { supabase } from '../lib/supabase';

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Please sign in first.');
  return data.user;
}

export async function getMyProfile() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateMyProfile(updates) {
  const user = await requireUser();
  const allowed = ['username', 'display_name', 'bio', 'avatar_url'];
  const safeUpdates = {};

  for (const key of allowed) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key];
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(safeUpdates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPublishedSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('visibility', 'public')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMySongs() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function publishSong(song) {
  const user = await requireUser();
  const profile = await getMyProfile();

  const title = String(song.title || '').trim();
  const audioUrl = String(song.audio_url || '').trim();

  if (!title) throw new Error('Enter a song title.');
  if (!audioUrl) throw new Error('A song audio URL is required.');

  const { data, error } = await supabase
    .from('songs')
    .insert({
      user_id: user.id,
      artist_id: user.id,
      artist_name:
        profile?.display_name ||
        profile?.username ||
        'VoiceStar Artist',
      title,
      audio_url: audioUrl,
      genre: song.genre || null,
      cover_url: song.cover_url || null,
      description: song.description || '',
      hashtags: Array.isArray(song.hashtags) ? song.hashtags : [],
      visibility: song.visibility === 'private' ? 'private' : 'public',
      status: 'published',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function followArtist(artistId) {
  const user = await requireUser();
  if (user.id === artistId) {
    throw new Error('You cannot follow yourself.');
  }

  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: artistId,
    });

  if (error && error.code !== '23505') throw error;
  return true;
}

export async function unfollowArtist(artistId) {
  const user = await requireUser();
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', artistId);

  if (error) throw error;
  return true;
}

export async function getFollowersCount(artistId) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', artistId);

  if (error) throw error;
  return count || 0;
}

export async function hasLikedSong(songId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('song_likes')
    .select('song_id')
    .eq('song_id', songId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function likeSong(songId) {
  const user = await requireUser();
  const { error } = await supabase
    .from('song_likes')
    .insert({ song_id: songId, user_id: user.id });

  if (error && error.code !== '23505') throw error;
  return true;
}

export async function unlikeSong(songId) {
  const user = await requireUser();
  const { error } = await supabase
    .from('song_likes')
    .delete()
    .eq('song_id', songId)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}

export async function addSongComment(songId, body) {
  const user = await requireUser();
  const text = String(body || '').trim();
  if (!text) throw new Error('Comment cannot be empty.');

  const { data, error } = await supabase
    .from('song_comments')
    .insert({
      song_id: songId,
      user_id: user.id,
      body: text,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSongComments(songId) {
  const { data, error } = await supabase
    .from('song_comments')
    .select('*')
    .eq('song_id', songId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getLiveRooms() {
  const { data, error } = await supabase
    .from('live_rooms')
    .select('*')
    .eq('status', 'live')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createLiveRoom(title, livekitRoom = null) {
  const user = await requireUser();
  const roomTitle = String(title || '').trim();

  if (roomTitle.length < 2) {
    throw new Error('Room title must contain at least 2 characters.');
  }

  const { data, error } = await supabase
    .from('live_rooms')
    .insert({
      host_id: user.id,
      title: roomTitle,
      livekit_room: livekitRoom,
      status: 'live',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endLiveRoom(roomId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('live_rooms')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
    })
    .eq('id', roomId)
    .eq('host_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyNotifications() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markNotificationRead(notificationId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
