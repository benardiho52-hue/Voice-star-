import { supabase } from "../lib/supabase";

/**

* VoiceStar database service
  */

function handleError(error) {
if (error) {
throw new Error(error.message || "VoiceStar request failed.");
}
}

/** Get the signed-in user */
export async function getCurrentUser() {
const { data, error } = await supabase.auth.getUser();
handleError(error);

if (!data.user) {
throw new Error("Please sign in to continue.");
}

return data.user;
}

/** Get an artist profile */
export async function getArtistProfile(userId) {
if (!userId) {
throw new Error("User ID is required.");
}

const { data, error } = await supabase
.from("profiles")
.select("*")
.eq("id", userId)
.maybeSingle();

handleError(error);
return data;
}

/** Load live rooms /
export async function getLiveRooms() {
const { data, error } = await supabase
.from("live_rooms")
.select("");

handleError(error);
return data ?? [];
}

/** Load notifications for the signed-in user */
export async function getMyNotifications() {
const user = await getCurrentUser();

const { data, error } = await supabase
.from("notifications")
.select("*")
.eq("user_id", user.id);

handleError(error);
return data ?? [];
}

/** Load followers for an artist */
export async function getArtistFollowers(userId) {
if (!userId) {
throw new Error("Artist ID is required.");
}

const { data, error } = await supabase
.from("follows")
.select("*");

handleError(error);

return (data ?? []).filter(
(follow) => follow.following_id === userId
);
}
