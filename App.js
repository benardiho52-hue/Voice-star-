import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

export default function App() {
  const [screen, setScreen] = useState("Home");
  const [songs, setSongs] = useState(demoSongs);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Afrobeats");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadSongs();
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setEmail(currentUser?.email || "");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getSession() {
    const { data } = await supabase.auth.getSession();
    const currentUser = data.session?.user ?? null;
    setUser(currentUser);
    setEmail(currentUser?.email || "");
  }

  async function loadSongs() {
    try {
      const { data, error } = await supabase.from("songs").select("*").limit(30);

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((song, index) => ({
          id: String(song.id ?? index),
          title: song.title || "Untitled song",
          artist: song.artist_name || "VoiceStar artist",
          genre: song.genre || "Music",
        }));
        setSongs(mapped);
      } else {
        setSongs(demoSongs);
      }
    } catch (_error) {
      setSongs(demoSongs);
    }
  }

  async function handleSignIn() {
    if (!authEmail.trim()) {
      Alert.alert("Email required", "Enter your email to sign in.");
      return;
    }

    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail.trim(),
      });

      if (error) {
        Alert.alert("Sign in failed", error.message);
        return;
      }

      Alert.alert(
        "Magic link sent",
        "Check your email and sign in with the link sent to you."
      );
      setAuthEmail("");
    } catch (error) {
      Alert.alert("Error", error.message || "Unable to sign in.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setEmail("");
      Alert.alert("Signed out", "You have been logged out.");
    } catch (error) {
      Alert.alert("Error", error.message || "Could not sign out.");
    }
  }

  async function publishSong() {
    if (!title.trim()) {
      Alert.alert("Song title needed", "Enter your song title first.");
      return;
    }

    if (!user) {
      Alert.alert("Sign in required", "You must sign in before publishing.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("songs").insert({
        title: title.trim(),
        genre: genre.trim(),
        description: description.trim(),
        user_id: user.id,
      });

      if (error) {
        Alert.alert("Could not publish", error.message);
        return;
      }

      Alert.alert("Success", "Your song has been published.");
      setTitle("");
      setGenre("Afrobeats");
      setDescription("");
      await loadSongs();
      setScreen("Home");
    } catch (error) {
      Alert.alert("Error", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const filteredSongs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return songs;

    return songs.filter((song) => {
      const haystack = `${song.title} ${song.artist} ${song.genre}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [songs, search]);

  function renderSong(song) {
    return (
      <View key={song.id} style={styles.card}>
        <View style={styles.musicIcon}>
          <Text style={{ color: COLORS.white, fontSize: 24 }}>♫</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{song.title}</Text>
          <Text style={styles.muted}>
            {song.artist} · {song.genre}
          </Text>
        </View>
        <Text style={{ color: COLORS.pink }}>•••</Text>
      </View>
    );
  }

  function HomeScreen() {
    return (
      <>
        <View style={styles.hero}>
          <Text style={styles.pink}>YOUR VOICE. YOUR STAGE.</Text>
          <Text style={styles.heroTitle}>Let the world hear you.</Text>
          <Text style={styles.muted}>
            Share your music, find your audience, and grow your sound.
          </Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setScreen("Studio")}
            >
              <Text style={styles.primaryButtonText}>＋ Create music</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setScreen("Discover")}
            >
              <Text style={styles.primaryButtonText}>⌕ Discover</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.section}>Trending voices</Text>
        {filteredSongs.map(renderSong)}
      </>
    );
  }

  function DiscoverScreen() {
    return (
      <>
        <Text style={styles.section}>Discover</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search songs and artists"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        {filteredSongs.map(renderSong)}
      </>
    );
  }

  function StudioScreen() {
    return (
      <>
        <Text style={styles.section}>Artist Studio</Text>

        <Text style={styles.label}>SONG TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter song title"
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
          multiline
          style={[styles.input, { minHeight: 100 }]}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={publishSong}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Publish Song ↗</Text>
          )}
        </TouchableOpacity>
      </>
    );
  }

  function ProfileScreen() {
    return (
      <>
        <Text style={styles.section}>Profile</Text>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            {email ? email.split("@")[0] : "New Voice"}
          </Text>

          <Text style={styles.muted}>
            {email || "You are not signed in yet."}
          </Text>

          {!email ? (
            <>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.muted}
                style={[styles.input, { marginTop: 16 }]}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSignIn}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign in with email</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSignOut}
            >
              <Text style={styles.primaryButtonText}>Sign out</Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  }

  const screens = {
    Home: HomeScreen,
    Discover: DiscoverScreen,
    Studio: StudioScreen,
    Profile: ProfileScreen,
  };

  const CurrentScreen = screens[screen] || HomeScreen;

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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <CurrentScreen />
      </ScrollView>

      <View style={styles.nav}>
        {['Home', 'Discover', 'Studio', 'Profile'].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.navItem}
            onPress={() => setScreen(item)}
          >
            <Text
              style={[
                styles.navText,
                screen === item && { color: COLORS.pink },
              ]}
            >
              {item === 'Home' ? '⌂' : item === 'Discover' ? '⌕' : item === 'Studio' ? '＋' : '♙'}
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
  brand: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },
  tagline: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2,
  },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  hero: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: "900",
    marginVertical: 8,
  },
  pink: {
    color: COLORS.pink,
    fontWeight: "800",
    marginBottom: 8,
  },
  muted: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: "#251834",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "800",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  musicIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#392253",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  label: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.white,
    padding: 14,
    marginBottom: 12,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#100B19",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    paddingBottom: 8,
  },
  navItem: { alignItems: "center", minWidth: 60 },
  navText: { color: COLORS.muted, fontSize: 21 },
  navLabel: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
});
