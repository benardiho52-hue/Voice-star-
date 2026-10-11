
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
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
} from "expo-audio";

const C = {
  bg: "#090711",
  panel: "#171022",
  purple: "#9B5CFF",
  pink: "#FF4FA3",
  white: "#FFFFFF",
  muted: "#B7ADC9",
  border: "#352647",
  green: "#4DE1B4",
};

const demoSongs = [
  { id: "demo1", title: "Midnight Melody", artist: "Nova", genre: "Afro Soul" },
  { id: "demo2", title: "Your Love", artist: "Kemi Star", genre: "R&B" },
  { id: "demo3", title: "Rise Again", artist: "Jay Voice", genre: "Gospel" },
];

const tabs = [
  ["Home", "⌂"],
  ["Discover", "⌕"],
  ["Studio", "♫"],
  ["Record", "●"],
  ["Stage", "🎤"],
  ["Chat", "☏"],
  ["Groups", "♧"],
  ["Tasks", "★"],
  ["Profile", "♙"],
];

const initialTasks = [
  { id: "daily", title: "Visit VoiceStar today", reward: 10, done: false },
  { id: "discover", title: "Explore Discover", reward: 10, done: false },
  { id: "profile", title: "Complete your profile", reward: 20, done: false },
  { id: "community", title: "Visit a stage room", reward: 15, done: false },
];

export default function App() {
  const [screen, setScreen] = useState("Home");
  const [songs, setSongs] = useState(demoSongs);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Afrobeats");
  const [description, setDescription] = useState("");

  const [recordingUri, setRecordingUri] = useState(null);
  const [recordingBusy, setRecordingBusy] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const audioPlayer = useAudioPlayer(recordingUri);

  const [roomName, setRoomName] = useState("");
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: "m1", sender: "Nova", text: "Welcome to VoiceStar!" },
    { id: "m2", sender: "Kemi Star", text: "Your voice is amazing!" },
  ]);

  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState(initialTasks);
  const [xp, setXp] = useState(0);
  const [gifts, setGifts] = useState(0);

  const [effects, setEffects] = useState({
    Reverb: 30,
    Echo: 10,
    Bass: 50,
    Treble: 50,
    Compression: 30,
    Pitch: 0,
  });

  useEffect(() => {
    loadSongs();
    getSession();

    const { data } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const current = session?.user ?? null;
        setUser(current);
        setEmail(current?.email || "");
      }
    );

    return () => data.subscription.unsubscribe();
  }, []);

  async function getSession() {
    try {
      const { data } = await supabase.auth.getSession();
      const current = data.session?.user ?? null;
      setUser(current);
      setEmail(current?.email || "");
    } catch (error) {
      console.log("Session error:", error.message);
    }
  }

  async function loadSongs() {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .limit(30);

      if (!error && Array.isArray(data)) {
        const saved = data.map((song, index) => ({
          id: String(song.id ?? index),
          title: song.title || "Untitled song",
          artist: song.artist_name || "VoiceStar artist",
          genre: song.genre || "Music",
        }));

        setSongs([
          ...saved,
          ...demoSongs.filter(
            (demo) => !saved.some((song) => song.id === demo.id)
          ),
        ]);
      }
    } catch (error) {
      console.log("Song loading error:", error.message);
    }
  }

  async function signIn() {
    if (!authEmail.trim()) {
      Alert.alert("Email required", "Enter your email first.");
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail.trim(),
      });

      if (error) throw error;

      Alert.alert(
        "Check your email",
        "Open the sign-in link sent to your email."
      );
      setAuthEmail("");
    } catch (error) {
      Alert.alert("Sign-in failed", error.message || "Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setUser(null);
    setEmail("");
  }

  async function publishSong() {
    if (!title.trim()) {
      Alert.alert("Song title needed", "Enter a title first.");
      return;
    }

    if (!user) {
      Alert.alert("Sign in required", "Sign in before publishing a song.");
      setScreen("Profile");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("songs").insert({
        title: title.trim(),
        genre: genre.trim() || "Music",
        description: description.trim(),
        user_id: user.id,
        artist_name: email.split("@")[0] || "VoiceStar artist",
      });

      if (error) throw error;

      Alert.alert("Published", "Your song has been saved.");
      setTitle("");
      setGenre("Afrobeats");
      setDescription("");
      await loadSongs();
      setScreen("Home");
    } catch (error) {
      Alert.alert("Could not publish", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    if (recordingBusy || recorderState.isRecording) return;

    setRecordingBusy(true);
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission required",
          "Allow VoiceStar to access your microphone in your phone settings."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      Alert.alert("Recording error", error?.message || "Could not start recording.");
    } finally {
      setRecordingBusy(false);
    }
  }

  async function stopRecording() {
    if (recordingBusy || !recorderState.isRecording) return;

    setRecordingBusy(true);
    try {
      await audioRecorder.stop();

      if (audioRecorder.uri) {
        setRecordingUri(audioRecorder.uri);
        Alert.alert("Recording saved", "Your voice recording is ready to preview.");
      } else {
        Alert.alert("Recording stopped", "No audio file was returned. Please try again.");
      }
    } catch (error) {
      Alert.alert("Save error", error?.message || "Could not save the recording.");
    } finally {
      setRecordingBusy(false);
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch (_) {}
    }
  }

  async function previewRecording() {
    if (!recordingUri) {
      Alert.alert("No recording", "Record your voice before previewing it.");
      return;
    }

    try {
      await audioPlayer.seekTo(0);
      audioPlayer.play();
    } catch (error) {
      Alert.alert("Playback error", error?.message || "Could not play the recording.");
    }
  }

  const filteredSongs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return songs.filter((song) =>
      `${song.title} ${song.artist} ${song.genre}`
        .toLowerCase()
        .includes(term)
    );
  }, [songs, search]);
