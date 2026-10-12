
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
