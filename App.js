import React, { useCallback, useEffect, useState } from "react";
import {
SafeAreaView,
View,
Text,
ScrollView,
TouchableOpacity,
TextInput,
StatusBar,
StyleSheet,
Alert,
ActivityIndicator,
} from "react-native";

import { supabase } from "./lib/supabase";
import {
fetchSongs,
publishSong as saveSong,
} from "./services/voiceStar";

const C = {
bg: "#090711",
panel: "#151022",
panel2: "#211632",
purple: "#A855F7",
pink: "#FF4FC8",
white: "#FFFFFF",
muted: "#B8AFC8",
border: "#332544",
};

export default function App() {
const [tab, setTab] = useState("Home");
const [songs, setSongs] = useState([]);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);

const [title, setTitle] = useState("");
const [artist, setArtist] = useState("");
const [genre, setGenre] = useState("Afrobeats");
const [description, setDescription] = useState("");
const [visibility, setVisibility] = useState("Public");

const loadSongs = useCallback(async () => {
setLoading(true);
try {
const result = await fetchSongs();
setSongs(result);
} catch (error) {
console.log("Song loading:", error.message);
Alert.alert("Song loading failed", error.message);
} finally {
setLoading(false);
}
}, []);

useEffect(() => {
loadSongs();
}, [loadSongs]);

const publishSong = async () => {
if (saving) return;

if (!title.trim()) {
  Alert.alert("Song title needed", "Enter your song title first.");
  return;
}

setSaving(true);

try {
  const savedSong = await saveSong({
    title: title.trim(),
    artist_name: artist.trim() || "New Artist",
    genre: genre.trim() || "Afrobeats",
    description: description.trim(),
    audio_url: null,
    cover_url: null,
    visibility: visibility === "Private" ? "private" : "public",
  });

  setSongs((previous) => [
    savedSong,
    ...previous.filter((song) => song.id !== savedSong.id),
  ]);

  setTitle("");
  setDescription("");
  setTab("Home");

  Alert.alert(
    "Song published",
    "Your song details have been saved. Audio upload is not enabled in this version."
  );
} catch (error) {
  Alert.alert(
    "Publishing failed",
    error.message || "Check your sign-in, database columns, and permissions."
  );
} finally {
  setSaving(false);
}

};

const renderSong = (song) => (
<View key={String(song.id)} style={styles.songCard}>
<View style={styles.songIcon}>
<Text style={styles.songIconText}>♫</Text>
</View>
<View style={styles.songInfo}>
<Text style={styles.songTitle}>{song.title}</Text>
<Text style={styles.muted}>
{song.artist} · {song.genre}
</Text>
{!!song.description && (
<Text style={styles.description}>{song.description}</Text>
)}
</View>
</View>
);

const renderHome = () => (
<>
<View style={styles.hero}>
<Text style={styles.brand}>VoiceStar</Text>
<Text style={styles.heroTitle}>Your stage, your voice, your star power!</Text>
<Text style={styles.muted}>
Share your music and discover new voices.
</Text>
<TouchableOpacity
style={styles.primaryButton}
onPress={() => setTab("Studio")}
>
<Text style={styles.primaryButtonText}>Publish a song</Text>
</TouchableOpacity>
</View>

  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>New Voices</Text>
    <TouchableOpacity onPress={loadSongs}>
      <Text style={styles.link}>Refresh</Text>
    </TouchableOpacity>
  </View>

  {loading ? (
    <ActivityIndicator color={C.pink} style={{ margin: 24 }} />
  ) : songs.length ? (
    songs.map(renderSong)
  ) : (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Your stage is waiting</Text>
      <Text style={styles.muted}>
        Published public songs will appear here.
      </Text>
    </View>
  )}
</>

);

const renderDiscover = () => (
<View style={styles.empty}>
<Text style={styles.sectionTitle}>Discover Music</Text>
<Text style={styles.muted}>
Explore publicly published songs from VoiceStar artists.
</Text>
<TouchableOpacity style={styles.secondaryButton} onPress={loadSongs}>
<Text style={styles.primaryButtonText}>Load songs</Text>
</TouchableOpacity>
{songs.map(renderSong)}
</View>
);

const renderStudio = () => (
<View style={styles.formCard}>
<Text style={styles.sectionTitle}>Artist Studio</Text>
<Text style={styles.muted}>
Add your song details and publish to VoiceStar.
</Text>

  <Text style={styles.label}>Song title *</Text>
  <TextInput
    style={styles.input}
    value={title}
    onChangeText={setTitle}
    placeholder="Enter song title"
    placeholderTextColor={C.muted}
    maxLength={120}
  />

  <Text style={styles.label}>Artist name</Text>
  <TextInput
    style={styles.input}
    value={artist}
    onChangeText={setArtist}
    placeholder="Your artist name"
    placeholderTextColor={C.muted}
    maxLength={100}
  />

  <Text style={styles.label}>Genre</Text>
  <TextInput
    style={styles.input}
    value={genre}
    onChangeText={setGenre}
    placeholder="Afrobeats"
    placeholderTextColor={C.muted}
    maxLength={60}
  />

  <Text style={styles.label}>Description</Text>
  <TextInput
    style={[styles.input, styles.multiline]}
    value={description}
    onChangeText={setDescription}
    placeholder="Tell listeners about your song"
    placeholderTextColor={C.muted}
    multiline
    maxLength={1000}
  />

  <Text style={styles.label}>Who can listen?</Text>
  <View style={styles.choiceRow}>
    {["Public", "Private"].map((option) => (
      <TouchableOpacity
        key={option}
        style={[
          styles.choice,
          visibility === option && styles.choiceSelected,
        ]}
        onPress={() => setVisibility(option)}
      >
        <Text style={styles.choiceText}>{option}</Text>
      </TouchableOpacity>
    ))}
  </View>

  <TouchableOpacity
    style={[styles.primaryButton, saving && styles.disabled]}
    onPress={publishSong}
    disabled={saving}
  >
    <Text style={styles.primaryButtonText}>
      {saving ? "Publishing..." : "Publish song"}
    </Text>
  </TouchableOpacity>
</View>

);

const renderProfile = () => (
<View style={styles.empty}>
<Text style={styles.sectionTitle}>Artist Profile</Text>
<Text style={styles.muted}>
Your public songs are listed below.
</Text>
{songs.map(renderSong)}
<TouchableOpacity
style={styles.secondaryButton}
onPress={() => setTab("Studio")}
>
<Text style={styles.primaryButtonText}>Publish a song</Text>
</TouchableOpacity>
</View>
);

return (
<SafeAreaView style={styles.container}>
<StatusBar barStyle="light-content" backgroundColor={C.bg} />

  <ScrollView
    style={styles.content}
    contentContainerStyle={styles.contentInner}
    keyboardShouldPersistTaps="handled"
  >
    {tab === "Home" && renderHome()}
    {tab === "Discover" && renderDiscover()}
    {tab === "Studio" && renderStudio()}
    {tab === "Profile" && renderProfile()}
  </ScrollView>

  <View style={styles.bottomNav}>
    {["Home", "Discover", "Studio", "Profile"].map((item) => (
      <TouchableOpacity
        key={item}
        style={styles.navItem}
        onPress={() => setTab(item)}
      >
        <Text
          style={[
            styles.navText,
            tab === item && styles.navTextActive,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</SafeAreaView>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: C.bg,
},
content: {
flex: 1,
},
contentInner: {
padding: 18,
paddingBottom: 28,
},
hero: {
backgroundColor: C.panel,
borderRadius: 22,
borderWidth: 1,
borderColor: C.border,
padding: 22,
marginBottom: 26,
},
brand: {
color: C.pink,
fontSize: 27,
fontWeight: "900",
marginBottom: 18,
},
heroTitle: {
color: C.white,
fontSize: 25,
fontWeight: "800",
lineHeight: 33,
marginBottom: 10,
},
muted: {
color: C.muted,
fontSize: 14,
lineHeight: 21,
},
primaryButton: {
backgroundColor: C.purple,
padding: 15,
borderRadius: 13,
alignItems: "center",
marginTop: 20,
},
secondaryButton: {
backgroundColor: C.pink,
padding: 13,
borderRadius: 12,
alignItems: "center",
marginTop: 18,
},
primaryButtonText: {
color: C.white,
fontWeight: "800",
fontSize: 15,
},
disabled: {
opacity: 0.6,
},
sectionHeader: {
flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 12,
},
sectionTitle: {
color: C.white,
fontSize: 21,
fontWeight: "800",
marginBottom: 8,
},
link: {
color: C.pink,
fontWeight: "700",
},
songCard: {
flexDirection: "row",
backgroundColor: C.panel,
borderRadius: 15,
borderWidth: 1,
borderColor: C.border,
padding: 14,
marginBottom: 12,
},
songIcon: {
width: 48,
height: 48,
borderRadius: 12,
backgroundColor: C.panel2,
alignItems: "center",
justifyContent: "center",
marginRight: 12,
},
songIconText: {
color: C.pink,
fontSize: 28,
fontWeight: "900",
},
songInfo: {
flex: 1,
},
songTitle: {
color: C.white,
fontSize: 16,
fontWeight: "800",
marginBottom: 5,
},
description: {
color: C.muted,
marginTop: 6,
lineHeight: 20,
},
empty: {
backgroundColor: C.panel,
borderRadius: 18,
padding: 20,
marginBottom: 16,
},
emptyTitle: {
color: C.white,
fontSize: 18,
fontWeight: "800",
marginBottom: 8,
},
formCard: {
backgroundColor: C.panel,
borderRadius: 20,
borderWidth: 1,
borderColor: C.border,
padding: 18,
},
label: {
color: C.white,
fontWeight: "700",
marginTop: 17,
marginBottom: 8,
},
input: {
backgroundColor: C.bg,
color: C.white,
borderColor: C.border,
borderWidth: 1,
borderRadius: 12,
paddingHorizontal: 13,
paddingVertical: 13,
fontSize: 15,
},
multiline: {
minHeight: 95,
textAlignVertical: "top",
},
choiceRow: {
flexDirection: "row",
gap: 10,
},
choice: {
flex: 1,
borderRadius: 12,
padding: 13,
borderWidth: 1,
borderColor: C.border,
alignItems: "center",
},
choiceSelected: {
backgroundColor: C.purple,
borderColor: C.pink,
},
choiceText: {
color: C.white,
fontWeight: "700",
},
bottomNav: {
flexDirection: "row",
justifyContent: "space-around",
backgroundColor: "#181024",
borderTopWidth: 1,
borderTopColor: C.border,
paddingVertical: 15,
},
navItem: {
alignItems: "center",
paddingHorizontal: 5,
},
navText: {
color: C.muted,
fontWeight: "700",
fontSize: 12,
},
navTextActive: {
color: C.pink,
},
});
