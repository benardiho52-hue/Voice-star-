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


import {
  getSongs as fetchSongs,
  publishSong as saveSong,
} from "./services/voiceStar";


const C = {
  bg: "#090711",
  panel: "#151022",
  panel2: "#211632",
  purple: "#A855F7",
  pink: "#FF4FC8",
  white: "#FFFFFF",
  muted: "#B9ADC9",
  border: "#352448",
};

export default function App() {
  const [tab, setTab] = useState("Home");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Afrobeats");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [visibility, setVisibility] = useState("public");

  const loadSongs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchSongs();
      setSongs(Array.isArray(result) ? result : []);
    } catch (error) {
      console.log("Load songs error:", error.message);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const publishSong = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Enter your song title.");
      return;
    }

    if (!audioUrl.trim()) {
      Alert.alert(
        "Audio URL required",
        "Enter a direct URL to your uploaded song audio."
      );
      return;
    }

    setPublishing(true);

    try {
      const saved = await saveSong({
        title: title.trim(),
        artist_name: artist.trim() || "VoiceStar Artist",
        genre: genre.trim() || "Afrobeats",
        description: description.trim(),
        audio_url: audioUrl.trim(),
        cover_url: coverUrl.trim() || null,
        visibility,
      });

      setSongs((previous) => [saved, ...previous]);
      setTitle("");
      setArtist("");
      setDescription("");
      setAudioUrl("");
      setCoverUrl("");
      setTab("Home");

      Alert.alert("Success", "Your song has been published.");
      await loadSongs();
    } catch (error) {
      Alert.alert(
        "Publishing failed",
        error.message || "Please try again."
      );
    } finally {
      setPublishing(false);
    }
  };

  const SongCard = ({ song }) => (
    <View style={styles.songCard}>
      <View style={styles.musicIcon}>
        <Text style={styles.musicSymbol}>♫</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.muted}>
          {song.artist_name || song.artist || "VoiceStar Artist"}
          {" · "}
          {song.genre || "Afrobeats"}
        </Text>
      </View>
    </View>
  );

  const renderSongs = () => {
    if (loading) {
      return <ActivityIndicator color={C.pink} />;
    }

    if (!songs.length) {
      return (
        <View style={styles.empty}>
          <Text style={styles.heading}>Your stage is waiting!</Text>
          <Text style={styles.muted}>
            Your public songs will appear here.
          </Text>
        </View>
      );
    }

    return songs.map((song, index) => (
      <SongCard key={song.id || index} song={song} />
    ));
  };

  const renderStudio = () => (
    <View>
      <Text style={styles.heading}>Artist Studio</Text>
      <Text style={styles.muted}>
        Prepare your song for publication.
      </Text>

      <View style={styles.panel}>
        <Text style={styles.label}>Song title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter song title"
          placeholderTextColor={C.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Artist name</Text>
        <TextInput
          value={artist}
          onChangeText={setArtist}
          placeholder="Your artist name"
          placeholderTextColor={C.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Genre</Text>
        <TextInput
          value={genre}
          onChangeText={setGenre}
          placeholder="Afrobeats"
          placeholderTextColor={C.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Song audio URL *</Text>
        <TextInput
          value={audioUrl}
          onChangeText={setAudioUrl}
          placeholder="https://example.com/song.mp3"
          placeholderTextColor={C.muted}
          autoCapitalize="none"
          keyboardType="url"
          style={styles.input}
        />

        <Text style={styles.hint}>
          This requires an uploaded audio file URL. Phone audio upload
          is not implemented in this screen yet.
        </Text>

        <Text style={styles.label}>Cover image URL (optional)</Text>
        <TextInput
          value={coverUrl}
          onChangeText={setCoverUrl}
          placeholder="https://example.com/cover.jpg"
          placeholderTextColor={C.muted}
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your song"
          placeholderTextColor={C.muted}
          multiline
          style={[styles.input, { minHeight: 85 }]}
        />

        <Text style={styles.label}>Visibility</Text>
        <View style={styles.row}>
          {["public", "private"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setVisibility(item)}
              style={[
                styles.choice,
                visibility === item && styles.selected,
              ]}
            >
              <Text style={styles.choiceText}>
                {item === "public" ? "🌍 Public" : "🔒 Private"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          disabled={publishing}
          onPress={publishSong}
          style={styles.primary}
        >
          {publishing ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={styles.primaryText}>Publish Song</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>V</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.brand}>VoiceStar</Text>
          <Text style={styles.tagline}>YOUR VOICE. YOUR STAGE.</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 18, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "Home" && (
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroSmall}>WELCOME TO VOICESTAR</Text>
              <Text style={styles.heroTitle}>
                Your stage.{"\n"}Your star power!
              </Text>
              <Text style={styles.muted}>
                Discover music and share your voice with the world.
              </Text>
              <TouchableOpacity
                style={styles.primary}
                onPress={() => setTab("Studio")}
              >
                <Text style={styles.primaryText}>＋ Publish a Song</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.heading}>New Voices</Text>
            {renderSongs()}
          </View>
        )}

        {tab === "Discover" && (
          <View>
            <Text style={styles.heading}>Discover</Text>
            <Text style={styles.muted}>Explore music from artists.</Text>
            {renderSongs()}
          </View>
        )}

        {tab === "Studio" && renderStudio()}

        {tab === "Profile" && (
          <View style={styles.empty}>
            <Text style={styles.heading}>Artist Profile</Text>
            <Text style={styles.muted}>
              Your VoiceStar artist journey starts here.
            </Text>
            <TouchableOpacity
              style={styles.primary}
              onPress={() => setTab("Studio")}
            >
              <Text style={styles.primaryText}>Publish a Song</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          ["Home", "⌂"],
          ["Discover", "⌕"],
          ["Studio", "♫"],
          ["Profile", "◉"],
        ].map(([name, symbol]) => (
          <TouchableOpacity
            key={name}
            style={styles.navItem}
            onPress={() => setTab(name)}
          >
            <Text
              style={[
                styles.navIcon,
                tab === name && { color: C.pink },
              ]}
            >
              {symbol}
            </Text>
            <Text
              style={[
                styles.navLabel,
                tab === name && { color: C.pink },
              ]}
            >
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: C.white, fontSize: 26, fontWeight: "900" },
  brand: { color: C.white, fontSize: 21, fontWeight: "900" },
  tagline: { color: C.muted, fontSize: 9, letterSpacing: 1 },
  hero: {
    backgroundColor: C.panel,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },
  heroSmall: { color: C.pink, fontWeight: "800", fontSize: 11 },
  heroTitle: {
    color: C.white,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "900",
    marginVertical: 12,
  },
  heading: {
    color: C.white,
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 8,
  },
  muted: { color: C.muted, fontSize: 13, lineHeight: 20 },
  panel: {
    backgroundColor: C.panel,
    borderRadius: 18,
    padding: 15,
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  label: {
    color: C.white,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 7,
  },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    color: C.white,
    padding: 12,
    fontSize: 14,
  },
  hint: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 7 },
  row: { flexDirection: "row", gap: 10 },
  choice: {
    flex: 1,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    padding: 12,
    alignItems: "center",
  },
  selected: { borderColor: C.pink, backgroundColor: "#30152F" },
  choiceText: { color: C.white, fontWeight: "700" },
  primary: {
    backgroundColor: C.purple,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },
  primaryText: { color: C.white, fontSize: 15, fontWeight: "800" },
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 13,
    marginTop: 10,
  },
  musicIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: C.panel2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  musicSymbol: { color: C.pink, fontSize: 27, fontWeight: "900" },
  songTitle: { color: C.white, fontSize: 15, fontWeight: "800" },
  empty: {
    backgroundColor: C.panel,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 12,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#181024",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 9,
  },
  navItem: { flex: 1, alignItems: "center" },
  navIcon: { color: C.muted, fontSize: 23 },
  navLabel: { color: C.muted, fontSize: 10, marginTop: 3 },
});
