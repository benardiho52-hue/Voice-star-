import React, { useState } from "react";
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
} from "react-native";

const C = {
  bg: "#090711",
  panel: "#151022",
  panel2: "#211632",
  purple: "#A855F7",
  pink: "#FF4FC8",
  white: "#FFFFFF",
  muted: "#B8ADC9",
  green: "#55E6A5",
};

export default function App() {
  const [tab, setTab] = useState("Home");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("New Artist");
  const [genre, setGenre] = useState("Afrobeats");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [songs, setSongs] = useState([]);

  const publishSong = () => {
    if (!title.trim()) {
      Alert.alert("Song title needed", "Enter your song title first.");
      return;
    }

    const song = {
      id: Date.now().toString(),
      title: title.trim(),
      artist: artist.trim() || "New Artist",
      genre,
      description: description.trim(),
      visibility,
    };

    setSongs((previous) => [song, ...previous]);
    setTitle("");
    setDescription("");
    setTab("Home");
    Alert.alert(
      "Song added!",
      "Your song is now listed in this app for testing. Online publishing and audio uploads are not connected yet."
    );
  };

  const Button = ({ label, onPress, secondary = false }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>Voice<Text style={{ color: C.pink }}>Star</Text> ✦</Text>
        <Text style={styles.muted}>YOUR STAGE. YOUR VOICE. YOUR STAR POWER!</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>VS</Text>
      </View>
    </View>
  );

  const SongCard = ({ song }) => (
    <View style={styles.songCard}>
      <View style={styles.songIcon}>
        <Text style={{ fontSize: 25 }}>♫</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.muted}>{song.artist} · {song.genre}</Text>
        <Text style={styles.small}>{song.visibility} · Test release</Text>
      </View>
    </View>
  );

  const Home = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>WELCOME TO YOUR STAGE</Text>
        <Text style={styles.heroTitle}>Your voice deserves to be heard.</Text>
        <Text style={styles.muted}>
          Create music, share your sound, and get ready to shine.
        </Text>
        <Button label="＋ Publish a Song" onPress={() => setTab("Publish")} />
      </View>

      <Text style={styles.sectionTitle}>Your Studio</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.tile} onPress={() => setTab("Studio")}>
          <Text style={styles.tileIcon}>🎙️</Text>
          <Text style={styles.tileTitle}>Artist Studio</Text>
          <Text style={styles.muted}>Your music workspace</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile} onPress={() => setTab("Player")}>
          <Text style={styles.tileIcon}>🎧</Text>
          <Text style={styles.tileTitle}>Music Player</Text>
          <Text style={styles.muted}>Your listening space</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile} onPress={() =>
          Alert.alert("Live Rooms", "Live streaming is not connected yet.")
        }>
          <Text style={styles.tileIcon}>🔴</Text>
          <Text style={styles.tileTitle}>Live Rooms</Text>
          <Text style={styles.muted}>Coming soon</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile} onPress={() =>
          Alert.alert("Discover", "Song discovery will be connected next.")
        }>
          <Text style={styles.tileIcon}>✨</Text>
          <Text style={styles.tileTitle}>Discover</Text>
          <Text style={styles.muted}>Find new voices</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Test Releases ({songs.length})</Text>
      {songs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.tileIcon}>♫</Text>
          <Text style={styles.songTitle}>Your stage is waiting</Text>
          <Text style={styles.muted}>Publish a test song to see it here.</Text>
        </View>
      ) : (
        songs.map((song) => <SongCard key={song.id} song={song} />)
      )}
    </ScrollView>
  );

  const Studio = () => (
    <ScrollView>
      <Text style={styles.pageTitle}>Artist Studio 🎙️</Text>
      <Text style={styles.muted}>Your creative space starts here.</Text>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Recording & Mixing</Text>
        <Text style={styles.muted}>
          Microphone recording, vocal effects, and audio mixing are not connected in this test version.
        </Text>
        <Button label="Record Vocals — Coming Soon" onPress={() =>
          Alert.alert("Recording", "Microphone recording will be implemented next.")
        } />
        <Button label="Mix Your Sound — Coming Soon" secondary onPress={() =>
          Alert.alert("Mix Studio", "Reverb, echo, bass, treble, and pitch correction are not connected yet.")
        } />
      </View>
      <Button label="Publish a Song" onPress={() => setTab("Publish")} />
    </ScrollView>
  );

  const Player = () => (
    <View>
      <Text style={styles.pageTitle}>Music Player 🎧</Text>
      <View style={styles.empty}>
        <Text style={{ fontSize: 55, color: C.pink }}>♫</Text>
        <Text style={styles.songTitle}>Ready for your sound?</Text>
        <Text style={styles.muted}>
          This test version lists song details but does not play audio files yet.
        </Text>
      </View>
      <Text style={styles.sectionTitle}>Available Test Songs</Text>
      {songs.length === 0 ? (
        <Text style={styles.muted}>No songs added yet.</Text>
      ) : (
        songs.map((song) => <SongCard key={song.id} song={song} />)
      )}
    </View>
  );

  const Publish = () => (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Text style={styles.pageTitle}>Publish Song ✨</Text>
      <Text style={styles.muted}>Add your song details for this app test.</Text>

      <View style={styles.panel}>
        <Text style={styles.label}>Song Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your song title"
          placeholderTextColor={C.muted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Artist Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your artist name"
          placeholderTextColor={C.muted}
          value={artist}
          onChangeText={setArtist}
        />

        <Text style={styles.label}>Genre</Text>
        <View style={styles.chips}>
          {["Afrobeats", "Gospel", "Pop", "Hip-Hop"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setGenre(item)}
              style={[styles.chip, genre === item && styles.selectedChip]}
            >
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Tell listeners about your song"
          placeholderTextColor={C.muted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Who can see it?</Text>
        <View style={styles.chips}>
          {["Public", "Private"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setVisibility(item)}
              style={[styles.chip, visibility === item && styles.selectedChip]}
            >
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.small}>
          Note: This test saves song details in app memory only. It does not upload audio or save online.
        </Text>
        <Button label="Publish Test Song" onPress={publishSong} />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          {tab === "Home" && <Home />}
          {tab === "Studio" && <Studio />}
          {tab === "Player" && <Player />}
          {tab === "Publish" && <Publish />}
        </View>

        <View style={styles.nav}>
          {[
            ["Home", "⌂"],
            ["Player", "♫"],
            ["Studio", "🎙"],
            ["Publish", "＋"],
          ].map(([name, icon]) => (
            <TouchableOpacity
              key={name}
              style={styles.navItem}
              onPress={() => setTab(name)}
            >
              <Text style={[styles.navIcon, tab === name && styles.activeText]}>
                {icon}
              </Text>
              <Text style={[styles.navText, tab === name && styles.activeText]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 16,
  },
  logo: { color: C.white, fontSize: 27, fontWeight: "900" },
  muted: { color: C.muted, fontSize: 12, lineHeight: 19 },
  small: { color: C.muted, fontSize: 10, marginTop: 6 },
  avatar: {
    width: 43, height: 43, borderRadius: 22,
    backgroundColor: C.panel2, borderWidth: 1, borderColor: C.purple,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: C.pink, fontWeight: "900" },
  content: { flex: 1, paddingBottom: 8 },
  hero: {
    backgroundColor: C.panel, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: "#38244F", marginBottom: 20,
  },
  eyebrow: { color: C.pink, fontSize: 10, fontWeight: "800", marginBottom: 10 },
  heroTitle: { color: C.white, fontSize: 29, fontWeight: "900", marginBottom: 10 },
  sectionTitle: { color: C.white, fontSize: 17, fontWeight: "800", marginBottom: 12, marginTop: 8 },
  pageTitle: { color: C.white, fontSize: 25, fontWeight: "900", marginBottom: 6, marginTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  tile: {
    width: "48%", minHeight: 120, backgroundColor: C.panel,
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#30203F",
  },
  tileIcon: { fontSize: 26, marginBottom: 9 },
  tileTitle: { color: C.white, fontWeight: "800", marginBottom: 5 },
  empty: {
    backgroundColor: C.panel, borderRadius: 18, padding: 24,
    alignItems: "center", marginBottom: 18, borderWidth: 1, borderColor: "#30203F",
  },
  songCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 13, backgroundColor: C.panel, borderRadius: 15, marginBottom: 10,
  },
  songIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: C.panel2,
    alignItems: "center", justifyContent: "center",
  },
  songTitle: { color: C.white, fontWeight: "800", fontSize: 15 },
  panel: { backgroundColor: C.panel, borderRadius: 18, padding: 16, marginTop: 18, marginBottom: 16 },
  label: { color: C.white, fontSize: 13, fontWeight: "700", marginTop: 14, marginBottom: 8 },
  input: {
    backgroundColor: C.bg, color: C.white, borderWidth: 1, borderColor: "#3A2A4B",
    borderRadius: 11, padding: 13, fontSize: 14,
  },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 20, backgroundColor: C.panel2 },
  selectedChip: { backgroundColor: C.purple },
  chipText: { color: C.white, fontWeight: "700", fontSize: 12 },
  button: {
    backgroundColor: C.purple, padding: 14, borderRadius: 12,
    alignItems: "center", marginTop: 14,
  },
  secondaryButton: { backgroundColor: C.panel2, borderWidth: 1, borderColor: C.purple },
  buttonText: { color: C.white, fontWeight: "800", textAlign: "center" },
  nav: {
    flexDirection: "row", justifyContent: "space-around",
    backgroundColor: "#181024", borderRadius: 17, paddingVertical: 10,
    marginTop: 8, marginBottom: 6,
  },
  navItem: { alignItems: "center", minWidth: 58 },
  navIcon: { color: C.muted, fontSize: 20, marginBottom: 3 },
  navText: { color: C.muted, fontSize: 10 },
  activeText: { color: C.pink, fontWeight: "900" },
});
