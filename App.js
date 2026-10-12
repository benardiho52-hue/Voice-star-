
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
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioPlayer,
} from "expo-audio";

const C = {
  bg: "#090711",
  panel: "#151022",
  panel2: "#211632",
  purple: "#A855F7",
  pink: "#FF4FC8",
  white: "#FFFFFF",
  muted: "#B8ADC9",
};

export default function App() {
  const [tab, setTab] = useState("Home");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("New Artist");
  const [genre, setGenre] = useState("Afrobeats");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [songs, setSongs] = useState([]);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const recorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );
  const player = useAudioPlayer();

  const startRecording = async () => {
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission needed",
          "Allow VoiceStar to use your microphone."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setIsPlaying(false);
      Alert.alert("Recording started", "Sing your song now!");
    } catch (error) {
      Alert.alert("Recording error", String(error));
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      setRecordingUri(recorder.uri);
      setIsRecording(false);
      Alert.alert(
        "Recording saved",
        "Your recording is ready to preview."
      );
    } catch (error) {
      setIsRecording(false);
      Alert.alert("Recording error", String(error));
    }
  };

  const playRecording = async () => {
    if (!recordingUri) {
      Alert.alert("No recording", "Record your vocals first.");
      return;
    }

    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      await player.replace({ uri: recordingUri });
      player.play();
      setIsPlaying(true);
    } catch (error) {
      Alert.alert("Playback error", String(error));
    }
  };

  const stopPlayback = () => {
    player.pause();
    setIsPlaying(false);
  };

  

   const publishSong = async () => {
if (!title.trim()) {
Alert.alert("Error", "Enter a song title.");
return;
}

try {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    Alert.alert("Sign in required", "Sign in before publishing.");
    return;
  }

  const { data, error } = await supabase
    .from("songs")
    .insert({
      artist_id: user.id,
      user_id: user.id,
      title: title.trim(),
      artist_name: artist.trim() || "New Artist",
      genre,
      description: description.trim(),
      visibility: visibility.toLowerCase(),
    })
    .select()
    .single();

  if (error) throw error;

  setSongs((old) => [{
    id: data.id,
    title: data.title,
    artist: data.artist_name,
    genre: data.genre,
    description: data.description || "",
    visibility: data.visibility,
  }, ...old]);

  setTitle("");
  setDescription("");
  setTab("Home");
  Alert.alert("Success", "Song saved online!");
} catch (e) {
  Alert.alert("Publishing failed", e.message);
}

     const song = {
      id: Date.now().toString(),
      title: title.trim(),
      artist: artist.trim() || "New Artist",
      genre,
      description: description.trim(),
      visibility,
      audioUri: recordingUri,
    };

    setSongs((previous) => [song, ...previous]);
    setTitle("");
    setDescription("");
    setTab("Home");

    Alert.alert(
      "Test song added",
      recordingUri
        ? "Song details and local recording are linked. Audio has not been uploaded online."
        : "Song details are saved for this test. Record vocals in Studio to attach audio."
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

  const SongCard = ({ song }) => (
    <View style={styles.songCard}>
      <Text style={styles.songIcon}>♫</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.muted}>
          {song.artist} · {song.genre}
        </Text>
        <Text style={styles.small}>
          {song.visibility} · {song.audioUri ? "Audio attached" : "No audio"}
        </Text>
      </View>
    </View>
  );

  const Home = () => (
    <ScrollView>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>WELCOME TO YOUR STAGE</Text>
        <Text style={styles.heroTitle}>
          Your voice deserves to be heard.
        </Text>
        <Text style={styles.muted}>
          Record music, share your sound, and get ready to shine.
        </Text>
        <Button label="＋ Publish a Song" onPress={() => setTab("Publish")} />
      </View>

      <Text style={styles.sectionTitle}>Your Studio</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.tile} onPress={() => setTab("Studio")}>
          <Text style={styles.tileIcon}>🎙️</Text>
          <Text style={styles.tileTitle}>Artist Studio</Text>
          <Text style={styles.muted}>Record your vocals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile} onPress={() => setTab("Player")}>
          <Text style={styles.tileIcon}>🎧</Text>
          <Text style={styles.tileTitle}>Music Player</Text>
          <Text style={styles.muted}>Your test songs</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        Your Test Releases ({songs.length})
      </Text>
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
      <Text style={styles.muted}>Record your voice and preview it.</Text>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Voice Recording</Text>
        <Text style={styles.muted}>
          Allow microphone permission when your phone asks.
        </Text>

        {!isRecording ? (
          <Button label="● Start Recording" onPress={startRecording} />
        ) : (
          <Button
            label="■ Stop Recording"
            onPress={stopRecording}
            secondary
          />
        )}

        {recordingUri && !isRecording && (
          <>
            <Button label="▶ Play Recording" onPress={playRecording} />
            {isPlaying && (
              <Button
                label="■ Stop Playback"
                onPress={stopPlayback}
                secondary
              />
            )}
            <Button
              label="Use Recording for My Song"
              onPress={() => setTab("Publish")}
              secondary
            />
          </>
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Mix Studio</Text>
        <Text style={styles.muted}>
          Reverb, echo, bass, treble, and pitch correction will be added next.
        </Text>
      </View>
    </ScrollView>
  );

  const Player = () => (
    <ScrollView>
      <Text style={styles.pageTitle}>Music Player 🎧</Text>
      {recordingUri && (
        <View style={styles.panel}>
          <Text style={styles.songTitle}>Your Latest Recording</Text>
          <Button label="▶ Play Recording" onPress={playRecording} />
          {isPlaying && (
            <Button
              label="■ Stop Playback"
              onPress={stopPlayback}
              secondary
            />
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Available Test Songs</Text>
      {songs.length === 0 ? (
        <Text style={styles.muted}>No songs added yet.</Text>
      ) : (
        songs.map((song) => <SongCard key={song.id} song={song} />)
      )}
    </ScrollView>
  );

  const Publish = () => (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Text style={styles.pageTitle}>Publish Song ✨</Text>
      <Text style={styles.muted}>Prepare your song for testing.</Text>

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
          {recordingUri
            ? "A local recording is ready to attach."
            : "No recording attached. You can record one in Studio."}
        </Text>
        <Button label="Save Test Song" onPress={publishSong} />
      </View>
    </ScrollView>
  );

  const Discover = () => (
    <ScrollView>
      <Text style={styles.pageTitle}>Discover ✨</Text>
      <Text style={styles.muted}>
        Discover songs released on your stage.
      </Text>
      {songs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.tileIcon}>♫</Text>
          <Text style={styles.songTitle}>No songs yet</Text>
          <Text style={styles.muted}>
            Your songs will appear here when you add them.
          </Text>
        </View>
      ) : (
        songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))
      )}
      <Button
        label="Publish a Song"
        onPress={() => setTab("Publish")}
      />
    </ScrollView>
  );
  const Profile = () => (
    <ScrollView>
      <Text style={styles.pageTitle}>Artist Profile 🌟</Text>
      <View style={styles.panel}>
        <Text style={styles.tileIcon}>🎤</Text>
        <Text style={styles.heroTitle}>
          {artist.trim() || "New Artist"}
        </Text>
        <Text style={styles.muted}>
          Your VoiceStar artist profile
        </Text>
        <Text style={styles.small}>Genre: {genre}</Text>
        <Text style={styles.small}>
          Test releases: {songs.length}
        </Text>
        <Button
          label="Publish a Song"
          onPress={() => setTab("Publish")}
        />
        <Button
          label="Open Music Player"
          onPress={() => setTab("Player")}
          secondary
        />
      </View>
    </ScrollView>
  );

  const renderScreen = () => {
    if (tab === "Studio") return <Studio />;
    if (tab === "Player") return <Player />;
    if (tab === "Publish") return <Publish />;
    if (tab === "Discover") return <Discover />;
    if (tab === "Profile") return <Profile />;
    return <Home />;
  };

  const navItems = [
    { name: "Home", icon: "⌂" },
    { name: "Discover", icon: "⌕" },
    { name: "Studio", icon: "♫" },
    { name: "Profile", icon: "◎" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={C.bg}
      />

      <View style={styles.appHeader}>
        <View>
          <Text style={styles.brand}>
            Voice<Text style={styles.brandAccent}>Star</Text>
          </Text>
          <Text style={styles.tagline}>
            Your stage, your voice, your star power!
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setTab("Publish")}
        >
          <Text style={styles.headerButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.screen}>
        {renderScreen()}
      </View>

      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            accessibilityRole="button"
            onPress={() => setTab(item.name)}
            style={styles.navItem}
          >
            <Text
              style={[
                styles.navIcon,
                tab === item.name && styles.navActive,
              ]}
            >
              {item.icon}
            </Text>
            <Text
              style={[
                styles.navLabel,
                tab === item.name && styles.navActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2038",
  },
  brand: {
    color: C.white,
    fontSize: 25,
    fontWeight: "900",
  },
  brandAccent: { color: C.pink },
  tagline: { color: C.muted, fontSize: 10, marginTop: 3 },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: { color: C.white, fontSize: 28 },
  hero: {
    backgroundColor: C.panel,
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#39234D",
  },
  eyebrow: {
    color: C.pink,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 10,
  },
  heroTitle: {
    color: C.white,
    fontSize: 25,
    fontWeight: "900",
    marginBottom: 10,
  },
  pageTitle: {
    color: C.white,
    fontSize: 25,
    fontWeight: "900",
    marginVertical: 10,
  },
  sectionTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 12,
  },
  muted: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  small: {
    color: C.muted,
    fontSize: 11,
    marginVertical: 5,
  },
  panel: {
    backgroundColor: C.panel,
    borderRadius: 18,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#30223F",
  },
  button: {
    backgroundColor: C.purple,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButton: {
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: C.pink,
  },
  buttonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  tile: {
    flex: 1,
    minHeight: 125,
    backgroundColor: C.panel,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#30223F",
  },
  tileIcon: { color: C.pink, fontSize: 26, marginBottom: 8 },
  tileTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },
  empty: {
    alignItems: "center",
    backgroundColor: C.panel,
    padding: 24,
    borderRadius: 18,
    marginTop: 8,
  },
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.panel,
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#30223F",
  },
  songIcon: {
    color: C.pink,
    fontSize: 25,
    width: 32,
    textAlign: "center",
  },
  songTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  label: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#0E0A17",
    color: C.white,
    borderWidth: 1,
    borderColor: "#3A2A4D",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  multiline: { minHeight: 88, textAlignVertical: "top" },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 5,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: "#3A2A4D",
  },
  selectedChip: {
    backgroundColor: "#5D267C",
    borderColor: C.pink,
  },
  chipText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#181024",
    borderTopWidth: 1,
    borderTopColor: "#30223F",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  navIcon: { color: C.muted, fontSize: 21, marginBottom: 2 },
  navLabel: { color: C.muted, fontSize: 10, fontWeight: "700" },
  navActive: { color: C.pink },
});
