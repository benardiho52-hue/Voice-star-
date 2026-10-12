
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
