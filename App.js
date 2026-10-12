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
  muted: "#A69AB8",
  green: "#38D996",
};

export default function App() {
  const [tab, setTab] = useState("Home");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Afrobeats");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [songs, setSongs] = useState([]);

  function publishSong() {
    if (!title.trim()) {
      Alert.alert("Song title required", "Enter your song title first.");
      return;
    }

    const song = {
      id: Date.now().toString(),
      title: title.trim(),
      genre,
      description: description.trim(),
      visibility,
    };

    setSongs((previous) => [song, ...previous]);
    setTitle("");
    setDescription("");
    setTab("Home");

    Alert.alert(
      "Test song saved!",
      "Your song was added to this app's temporary list. It has not been uploaded online."
    );
  }

  function NavButton({ name, emoji }) {
    const active = tab === name;
    return (
      <TouchableOpacity
        style={[styles.navButton, active && styles.navActive]}
        onPress={() => setTab(name)}
      >
        <Text style={styles.navEmoji}>{emoji}</Text>
        <Text style={[styles.navText, active && { color: C.pink }]}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  }

  function ToolCard({ emoji, title, detail, onPress }) {
    return (
      <TouchableOpacity style={styles.toolCard} onPress={onPress}>
        <Text style={styles.toolEmoji}>{emoji}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.muted}>{detail}</Text>
      </TouchableOpacity>
    );
  }

  function Header({ subtitle }) {
    return (
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            Voice<Text style={{ color: C.pink }}>Star</Text> ✦
          </Text>
          <Text style={styles.muted}>{subtitle}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={{ color: C.white, fontWeight: "bold" }}>VS</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <Header subtitle="Your voice. Your stage." />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "Home" && (
          <>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>WELCOME TO YOUR STAGE</Text>
              <Text style={styles.heroTitle}>Let the world{"\n"}hear you.</Text>
              <Text style={styles.heroText}>
                Create music, build your artist profile and prepare your next
                release.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setTab("Studio")}
              >
                <Text style={styles.buttonText}>Open Artist Studio →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Your creative tools</Text>
            <View style={styles.grid}>
              <ToolCard
                emoji="🎙️"
                title="Artist Studio"
                detail="Prepare your music"
                onPress={() => setTab("Studio")}
              />
              <ToolCard
                emoji="🎵"
                title="Music Player"
                detail="Preview area"
                onPress={() => setTab("Player")}
              />
              <ToolCard
                emoji="🚀"
                title="Publish Song"
                detail="Create a test release"
                onPress={() => setTab("Publish")}
              />
              <ToolCard
                emoji="🔴"
                title="Live Room"
                detail="Coming soon"
                onPress={() =>
                  Alert.alert(
                    "Live Room",
                    "Live streaming will be connected in a later step."
                  )
                }
              />
            </View>

            <Text style={styles.sectionTitle}>
              Your test releases ({songs.length})
            </Text>
            {songs.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 30 }}>🎧</Text>
                <Text style={styles.cardTitle}>Your music starts here</Text>
                <Text style={styles.muted}>
                  Create a test release using Publish Song.
                </Text>
              </View>
            ) : (
              songs.map((song) => (
                <View style={styles.songCard} key={song.id}>
                  <Text style={{ fontSize: 25 }}>🎶</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{song.title}</Text>
                    <Text style={styles.muted}>
                      {song.genre} · {song.visibility}
                    </Text>
                  </View>
                  <Text style={{ color: C.green }}>SAVED</Text>
                </View>
              ))
            )}
          </>
        )}

        {tab === "Player" && (
          <>
            <Text style={styles.pageTitle}>Music Player</Text>
            <Text style={styles.muted}>
              This screen is a preview placeholder. Audio playback is not
              connected yet.
            </Text>
            <View style={styles.playerCard}>
              <Text style={styles.recordIcon}>♫</Text>
              <Text style={styles.heroTitle}>Your next hit</Text>
              <Text style={styles.muted}>No audio selected</Text>
              <View style={styles.progress}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.muted}>0:00 / 0:00</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() =>
                  Alert.alert(
                    "Audio coming next",
                    "First we will test the app screens, then connect audio files and playback."
                  )
                }
              >
                <Text style={styles.buttonText}>Test Player</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {tab === "Studio" && (
          <>
            <Text style={styles.pageTitle}>Artist Studio</Text>
            <Text style={styles.muted}>
              Get your next release ready.
            </Text>
            {[
              ["🎙️", "Record vocals", "Audio recording not connected"],
              ["🎚️", "Mix your sound", "Effects will be added next"],
              ["🎧", "Preview your track", "Player connection coming next"],
              ["🚀", "Publish your song", "Open the publishing form"],
            ].map((item, index) => (
              <TouchableOpacity
                key={item[1]}
                style={styles.studioRow}
                onPress={() => {
                  if (index === 3) setTab("Publish");
                  else
                    Alert.alert(
                      item[1],
                      "This tool will be connected after the basic app test."
                    );
                }}
              >
                <Text style={{ fontSize: 28 }}>{item[0]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item[1]}</Text>
                  <Text style={styles.muted}>{item[2]}</Text>
                </View>
                <Text style={{ color: C.pink, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {tab === "Publish" && (
          <>
            <Text style={styles.pageTitle}>Publish Song</Text>
            <Text style={styles.muted}>
              Fill in your release details to test the form.
            </Text>

            <Text style={styles.label}>SONG TITLE *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your song title"
              placeholderTextColor={C.muted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>GENRE</Text>
            <View style={styles.genreRow}>
              {["Afrobeats", "Gospel", "Pop", "Hip-Hop"].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setGenre(item)}
                  style={[
                    styles.genreChip,
                    genre === item && styles.genreSelected,
                  ]}
                >
                  <Text
                    style={{
                      color: genre === item ? C.white : C.muted,
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Tell listeners about your song"
              placeholderTextColor={C.muted}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>WHO CAN SEE THIS SONG?</Text>
            <View style={styles.genreRow}>
              {["Public", "Private"].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setVisibility(item)}
                  style={[
                    styles.visibilityChip,
                    visibility === item && styles.genreSelected,
                  ]}
                >
                  <Text style={{ color: C.white }}>
                    {item === "Public" ? "🌍 " : "🔒 "}
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.notice}>
              <Text style={styles.muted}>
                Note: This test saves details only in the current app session.
                It does not upload a song or publish it online.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={publishSong}
            >
              <Text style={styles.buttonText}>Save Test Release</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavButton name="Home" emoji="⌂" />
        <NavButton name="Player" emoji="♫" />
        <NavButton name="Studio" emoji="🎙" />
        <NavButton name="Publish" emoji="＋" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logo: { color: C.white, fontSize: 25, fontWeight: "900" },
  muted: { color: C.muted, fontSize: 13, lineHeight: 20 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: C.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, paddingHorizontal: 18 },
  hero: {
    backgroundColor: C.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#573078",
    padding: 22,
    marginTop: 8,
    marginBottom: 25,
  },
  eyebrow: {
    color: C.pink,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  heroTitle: {
    color: C.white,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 10,
  },
  heroText: { color: C.muted, fontSize: 14, lineHeight: 22 },
  primaryButton: {
    backgroundColor: C.purple,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: C.white, fontWeight: "bold", fontSize: 15 },
  sectionTitle: {
    color: C.white,
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 14,
    marginTop: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  toolCard: {
    width: "48%",
    backgroundColor: C.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#30213F",
    padding: 16,
    marginBottom: 12,
    minHeight: 135,
  },
  toolEmoji: { fontSize: 29, marginBottom: 12 },
  cardTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },
  empty: {
    alignItems: "center",
    padding: 25,
    backgroundColor: C.panel,
    borderRadius: 18,
    gap: 7,
  },
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    marginBottom: 10,
    backgroundColor: C.panel,
    borderRadius: 15,
  },
  pageTitle: {
    color: C.white,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 6,
  },
  playerCard: {
    backgroundColor: C.panel,
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    marginTop: 25,
  },
  recordIcon: {
    width: 120,
    height: 120,
    lineHeight: 120,
    textAlign: "center",
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: C.panel2,
    color: C.pink,
    fontSize: 60,
    marginBottom: 20,
  },
  progress: {
    height: 5,
    width: "100%",
    backgroundColor: C.panel2,
    borderRadius: 4,
    marginTop: 25,
    marginBottom: 10,
  },
  progressFill: {
    height: 5,
    width: "0%",
    backgroundColor: C.pink,
  },
  studioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.panel,
    borderRadius: 16,
    padding: 17,
    marginTop: 13,
  },
  label: {
    color: C.pink,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 23,
    marginBottom: 9,
  },
  input: {
    color: C.white,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: "#39264B",
    borderRadius: 13,
    padding: 15,
    fontSize: 15,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreChip: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: "#39264B",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  genreSelected: {
    backgroundColor: "#63309A",
    borderColor: C.pink,
  },
  visibilityChip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: "#39264B",
    padding: 14,
    borderRadius: 12,
  },
  notice: {
    backgroundColor: C.panel,
    borderRadius: 12,
    padding: 13,
    marginTop: 22,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#110C1A",
    borderTopWidth: 1,
    borderTopColor: "#30213F",
    paddingTop: 9,
    paddingBottom: 8,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 62,
  },
  navActive: { backgroundColor: C.panel2 },
  navEmoji: { color: C.white, fontSize: 21, marginBottom: 3 },
  navText: { color: C.muted, fontSize: 11 },
});
