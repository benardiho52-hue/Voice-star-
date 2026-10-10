
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "./Supabase";

const COLORS = {
  bg: "#090711",
  panel: "#171022",
  purple: "#9B5CFF",
  pink: "#FF4FA3",
  white: "#FFFFFF",
  muted: "#B7ADC9",
  border: "#352647",
};

const demoSongs = [
  { id: "1", title: "Midnight Melody", artist: "Nova", genre: "Afro Soul" },
  { id: "2", title: "Your Love", artist: "Kemi Star", genre: "R&B" },
  { id: "3", title: "Rise Again", artist: "Jay Voice", genre: "Gospel" },
];

const demoRooms = [
  { id: "1", title: "Late Night Singing", host: "DJ Harmony" },
  { id: "2", title: "Afrobeats Open Mic", host: "Mira" },
  { id: "3", title: "New Voices Showcase", host: "VoiceStar Live" },
];

export default function App() {
  const [screen, setScreen] = useState("Home");
  const [songs, setSongs] = useState(demoSongs);
  const [email, setEmail] = useState("");
  const [dbStatus, setDbStatus] = useState("Checking connection...");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Afrobeats");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkDatabase();
    loadSongs();

    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email || "");
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setEmail(session?.user?.email || "")
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function checkDatabase() {
    try {
      const { error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      setDbStatus(
        error ? "Check database permissions" : "Supabase connected"
      );
    } catch (_error) {
      setDbStatus("Connection unavailable");
    }
  }

  async function loadSongs() {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .limit(30);

      if (!error && data?.length) {
        setSongs(
          data.map((song, index) => ({
            id: String(song.id || index),
            title: song.title || song.name || "Untitled song",
            artist: song.artist_name || song.username || "VoiceStar artist",
            genre: song.genre || "Music",
          }))
        );
      }
    } catch (_error) {
      // Keep demo songs visible until the songs table is available.
    }
  }

  async function publishSong() {
    if (!title.trim()) {
      Alert.alert("Song title needed", "Enter your song title.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        Alert.alert(
          "Sign in required",
          "Sign in to your VoiceStar account before publishing."
        );
        return;
      }

      const { error } = await supabase.from("songs").insert({
        title: title.trim(),
        genre: genre.trim(),
        description: description.trim(),
        user_id: user.id,
      });

      if (error) {
        Alert.alert(
          "Could not publish",
          "The songs table or its permissions may need adjustment: " +
            error.message
        );
        return;
      }

      Alert.alert("Success", "Your song has been published!");
      setTitle("");
      setDescription("");
      await loadSongs();
      setScreen("Home");
    } catch (error) {
      Alert.alert("Error", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function button(label, action, active = false) {
    return (
      <TouchableOpacity
        key={label}
        onPress={action}
        style={[styles.button, active && styles.activeButton]}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function heading(title, subtitle) {
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.muted}>{subtitle}</Text>
      </View>
    );
  }

  function songCard(song) {
    return (
      <View key={song.id} style={styles.card}>
        <View style={styles.musicIcon}>
          <Text style={{ color: COLORS.white, fontSize: 25 }}>♫</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{song.title}</Text>
          <Text style={styles.muted}>
            {song.artist || "VoiceStar artist"} · {song.genre}
          </Text>
        </View>
        <Text style={{ color: COLORS.pink }}>•••</Text>
      </View>
    );
  }

  function roomCard(room) {
    return (
      <TouchableOpacity
        key={room.id}
        style={styles.card}
        onPress={() =>
          Alert.alert(
            room.title,
            "Live audio requires a live-streaming service to be connected."
          )
        }
      >
        <Text style={{ color: COLORS.pink, fontWeight: "900" }}>
          ● LIVE
        </Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{room.title}</Text>
          <Text style={styles.muted}>Host: {room.host}</Text>
        </View>
        <Text style={{ color: COLORS.purple }}>Join ›</Text>
      </TouchableOpacity>
    );
  }

  function Home() {
    return (
      <>
        <View style={styles.hero}>
          <Text style={styles.pink}>YOUR VOICE. YOUR STAGE.</Text>
          <Text style={styles.heroTitle}>
            Let the world{"\n"}hear you.
          </Text>
          <Text style={styles.muted}>
            Sing, share your sound, and find your people.
          </Text>
          <View style={styles.row}>
            {button("＋ Create music", () => setScreen("Studio"), true)}
            {button("◉ Live rooms", () => setScreen("Live"))}
          </View>
        </View>

        <Text style={styles.section}>Trending voices</Text>
        {songs.map(songCard)}

        <View style={styles.rowBetween}>
          <Text style={styles.section}>Live rooms</Text>
          {button("See all ›", () => setScreen("Live"))}
        </View>
        {demoRooms.slice(0, 2).map(roomCard)}
      </>
    );
  }

  function Discover() {
    return (
      <>
        {heading("Discover", "Find your next favourite voice.")}
        <TextInput
          placeholder="Search songs and artists"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        {songs.map(songCard)}
      </>
    );
  }

  function Live() {
    return (
      <>
        {heading("Live rooms", "Sing together and cheer each other on.")}
        <TouchableOpacity
          style={styles.hero}
          onPress={() =>
            Alert.alert(
              "Start a live room",
              "Live audio hosting must be connected to a streaming service."
            )
          }
        >
          <Text style={styles.heroTitle}>＋ Go Live</Text>
          <Text style={styles.muted}>Bring your audience on stage.</Text>
        </TouchableOpacity>
        {demoRooms.map(roomCard)}
      </>
    );
  }

  function Studio() {
    return (
      <>
        {heading("Artist Studio", "Share your music with VoiceStar.")}

        <Text style={styles.label}>SONG TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter your song title"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />

        <Text style={styles.label}>GENRE</Text>
        <TextInput
          value={genre}
          onChangeText={setGenre}
          placeholder="Afrobeats, R&B, Gospel..."
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Tell listeners about your song"
          placeholderTextColor={COLORS.muted}
          style={[styles.input, { minHeight: 100 }]}
          multiline
        />

        <View style={styles.card}>
          <Text style={styles.pink}>♫ Audio upload</Text>
          <Text style={styles.muted}>
            Audio file uploading still needs to be connected.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.activeButton}
          onPress={publishSong}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Publish Song ↗</Text>
          )}
        </TouchableOpacity>
      </>
    );
  }

  function Profile() {
    return (
      <>
        {heading("Artist Profile", "Your VoiceStar account.")}

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            {email ? email.split("@")[0] : "New Voice"}
          </Text>
          <Text style={styles.muted}>
            {email || "You are not signed in."}
          </Text>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.heroTitle}>0</Text>
              <Text style={styles.muted}>Followers</Text>
            </View>
            <View>
              <Text style={styles.heroTitle}>0</Text>
              <Text style={styles.muted}>Gifts</Text>
            </View>
            <View>
              <Text style={styles.heroTitle}>{songs.length}</Text>
              <Text style={styles.muted}>Songs loaded</Text>
            </View>
          </View>

          {email
            ? button("Sign out", async () => {
                await supabase.auth.signOut();
                setEmail("");
              })
            : button("Account sign-in", () =>
                Alert.alert(
                  "Sign in",
                  "A sign-in form must be added to enable account login."
                )
              )}
        </View>

        <Text style={styles.section}>Achievements & badges</Text>
        <View style={styles.card}>
          <Text style={styles.pink}>✦ Rising Voice</Text>
          <Text style={styles.muted}>
            Achievement tracking needs to be connected to the database.
          </Text>
        </View>

        <Text style={styles.section}>Coins & free gifts</Text>
        <View style={styles.card}>
          <Text style={styles.pink}>✧ VoiceStar Wallet</Text>
          <Text style={styles.muted}>
            Your existing coin wallet tables still need to be connected.
          </Text>
        </View>
      </>
    );
  }

  const pages = {
    Home,
    Discover,
    Live,
    Studio,
    Profile,
  };
  const CurrentPage = pages[screen] || Home;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>
            VOICE<Text style={{ color: COLORS.pink }}>STAR</Text> ✦
          </Text>
          <Text style={styles.tagline}>YOUR VOICE. YOUR STAGE.</Text>
        </View>
        <Text style={{ color: COLORS.purple, fontSize: 24 }}>♫</Text>
      </View>

      <TouchableOpacity
        style={styles.status}
        onPress={checkDatabase}
      >
        <Text style={styles.muted}>{dbStatus} · Tap to check</Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <CurrentPage />
      </ScrollView>

      <View style={styles.nav}>
        {["Home", "Discover", "Live", "Studio", "Profile"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setScreen(item)}
            style={styles.navItem}
          >
            <Text
              style={[
                styles.navText,
                screen === item && { color: COLORS.pink },
              ]}
            >
              {item === "Home"
                ? "⌂"
                : item === "Discover"
                ? "⌕"
                : item === "Live"
                ? "◉"
                : item === "Studio"
                ? "＋"
                : "♙"}
            </Text>
            <Text
              style={[
                styles.navLabel,
                screen === item && { color: COLORS.pink },
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
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { color: COLORS.white, fontSize: 22, fontWeight: "900" },
  tagline: { color: COLORS.muted, fontSize: 9, letterSpacing: 2 },
  status: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    backgroundColor: COLORS.panel,
    borderRadius: 10,
  },
  content: { paddingHorizontal: 20, paddingBottom: 25 },
  hero: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "900",
    marginVertical: 10,
  },
  pink: { color: COLORS.pink, fontWeight: "800", marginBottom: 7 },
  muted: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  section: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    marginVertical: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  musicIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#392253",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { color: COLORS.white, fontSize: 13, fontWeight: "800" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#251834",
    borderRadius: 10,
    marginVertical: 4,
  },
  activeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: { color: COLORS.white, fontWeight: "800", fontSize: 12 },
  label: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.panel,
    color: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#100B19",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navItem: { alignItems: "center", minWidth: 50 },
  navText: { color: COLORS.muted, fontSize: 21 },
  navLabel: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
});
