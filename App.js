
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";

export default function App() {
  const [page, setPage] = useState("Home");
  const [name, setName] = useState("VoiceStar Artist");
  const [song, setSong] = useState("");
  const [songs, setSongs] = useState([]);
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState(["Welcome to VoiceStar!"]);
  const [recording, setRecording] = useState(false);

  const purple = "#8B5CF6";

  const button = (label, action) => (
    <TouchableOpacity style={s.button} onPress={action}>
      <Text style={s.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  const heading = (label) => (
    <Text style={s.heading}>{label}</Text>
  );

  const card = (label, detail, action) => (
    <TouchableOpacity style={s.card} onPress={action}>
      <Text style={s.cardTitle}>{label}</Text>
      <Text style={s.muted}>{detail}</Text>
    </TouchableOpacity>
  );

  function publishSong() {
    if (!song.trim()) {
      Alert.alert("Enter a song title first");
      return;
    }
    setSongs([...songs, song.trim()]);
    setSong("");
    Alert.alert("Song added to your preview!");
  }

  function sendMessage() {
    if (message.trim()) {
      setChat([...chat, message.trim()]);
      setMessage("");
    }
  }

  function showFeature(feature) {
    Alert.alert(
      feature,
      "This is a starter interface. Connecting real online services is a later step."
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0915" />

      <View style={s.header}>
        <Text style={s.logo}>Voice<Text style={{ color: "#EC4899" }}>Star</Text> ✦</Text>
        <Text style={s.points}>⭐ {points}</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {page === "Home" && (
          <>
            <View style={s.hero}>
              <Text style={s.small}>YOUR VOICE. YOUR STAGE.</Text>
              <Text style={s.title}>Welcome to{"\n"}VoiceStar ✨</Text>
              <Text style={s.muted}>
                Sing, create music, meet artists, and share your talent.
              </Text>
              {button("🎙️ Open Artist Studio", () => setPage("Studio"))}
              {button("🔴 Explore Live Rooms", () => setPage("Live"))}
            </View>

            {heading("🔥 Live Rooms")}
            {card("Afrobeats Live Stage", "DJ Star • Live room", () => setPage("Live"))}
            {card("Gospel Praise Room", "Sing and connect", () => setPage("Live"))}
            {card("Freestyle Battle", "Show your skills", () => setPage("Live"))}

            {heading("🎵 Discover Music")}
            {songs.map((item, i) => (
              <View key={i} style={s.card}>
                <Text style={s.cardTitle}>🎶 {item}</Text>
                <Text style={s.muted}>{name}</Text>
              </View>
            ))}
          </>
        )}

        {page === "Discover" && (
          <>
            {heading("🔎 Discover")}
            {card("New Artists", "Meet rising voices", () => showFeature("Artists"))}
            {card("Popular Songs", "Explore new music", () => showFeature("Music"))}
            {card("Follow Artists", "Build your music community", () => showFeature("Following"))}
            {card("Freestyle Beats", "Explore beats for freestyle", () => showFeature("Beats"))}
          </>
        )}

        {page === "Studio" && (
          <>
            {heading("🎙️ Artist Studio")}
            <View style={s.card}>
              <Text style={s.cardTitle}>Microphone Recording</Text>
              <Text style={s.muted}>
                Recording control preview. Audio capture is not connected yet.
              </Text>
              {button(
                recording ? "⏹ Stop Recording Preview" : "🔴 Start Recording",
                () => {
                  setRecording(!recording);
                  if (!recording) showFeature("Microphone");
                }
              )}
            </View>

            {heading("🎚️ Vocal Effects")}
            {["Reverb", "Echo", "Bass", "Treble", "Compression", "AutoTune", "Voice Changer"].map((effect) =>
              card(effect, "Open effect settings", () => showFeature(effect))
            )}

            {heading("📤 Publish Your Song")}
            <TextInput
              style={s.input}
              placeholder="Enter song title"
              placeholderTextColor="#A69BB8"
              value={song}
              onChangeText={setSong}
            />
            {button("Publish Song", publishSong)}
          </>
        )}

        {page === "Live" && (
          <>
            {heading("🔴 Live Room")}
            <View style={s.stage}>
              <Text style={s.title}>🎤 HOST / ARTIST</Text>
              <Text style={s.muted}>{name}</Text>
              <Text style={s.pink}>Singing • Demo Room</Text>
            </View>
            {heading("🪑 Guest Seats")}
            <View style={s.seats}>
              {["🎤", "＋", "＋", "＋"].map((seat, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.seat}
                  onPress={() => showFeature("Join Stage")}
                >
                  <Text style={s.seatText}>{seat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {heading("💖 Gifts & Reactions")}
            {button("❤️ Heart", () => showFeature("Heart Gift"))}
            {button("🔥 Fire", () => showFeature("Fire Gift"))}
            {button("🎁 Free Gift", () => {
              setPoints(points + 10);
              Alert.alert("Demo reward", "10 demo points added.");
            })}
            {heading("💬 Room Chat")}
            {chat.map((item, i) => (
              <Text key={i} style={s.chat}>{item}</Text>
            ))}
            <TextInput
              style={s.input}
              placeholder="Write a message"
              placeholderTextColor="#A69BB8"
              value={message}
              onChangeText={setMessage}
            />
            {button("Send Message", sendMessage)}
            <Text style={s.muted}>
              This is a local demo room, not real live streaming or online chat.
            </Text>
          </>
        )}

        {page === "Family" && (
          <>
            {heading("👑 VoiceStar Family")}
            <View style={s.hero}>
              <Text style={s.title}>Family Together</Text>
              <Text style={s.muted}>
                Captain, co-captains, admins, family tasks, and battles.
              </Text>
            </View>
            {heading("🎯 Tasks & Rewards")}
            {["Visit the app", "Explore a room", "Discover an artist", "Prepare a song"].map((task) =>
              card(task, "Reward: 10 demo points", () => {
                setPoints(points + 10);
                Alert.alert("Task reward", "10 demo points earned.");
              })
            )}
            {button("⚔️ Family Battle", () => showFeature("Family Battle"))}
            {button("🛡️ Manage Family Roles", () => showFeature("Family Roles"))}
          </>
        )}

        {page === "Profile" && (
          <>
            {heading("👤 Artist Profile")}
            <View style={s.profile}>
              <Text style={s.avatar}>⭐</Text>
              <Text style={s.title}>{name}</Text>
              <Text style={s.muted}>VoiceStar Creator</Text>
              <Text style={s.pink}>New Voice</Text>
            </View>
            <Text style={s.label}>Artist name</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Your artist name"
              placeholderTextColor="#A69BB8"
            />
            {heading("⚙️ Account & Safety")}
            {button("Notifications", () => showFeature("Notifications"))}
            {button("Privacy & Community Rules", () => showFeature("Privacy"))}
            {button("Owner Dashboard", () => showFeature("Owner Controls"))}
            <Text style={s.muted}>
              Owner controls must be secured by a real backend before launch.
            </Text>
          </>
        )}
      </ScrollView>

      <View style={s.bottomNav}>
        {["Home", "Discover", "Studio", "Live", "Family", "Profile"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={s.navItem}
            onPress={() => setPage(tab)}
          >
            <Text style={[s.navText, page === tab && s.active]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0915" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#181024",
  },
  logo: { color: "white", fontSize: 23, fontWeight: "900" },
  points: { color: "#F5D0FE", fontWeight: "bold" },
  content: { padding: 16, paddingBottom: 28 },
  hero: {
    backgroundColor: "#211333",
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#57327C",
  },
  small: { color: "#D8B4FE", fontWeight: "bold", marginBottom: 10 },
  title: { color: "white", fontSize: 25, fontWeight: "900", marginBottom: 10 },
  heading: { color: "white", fontSize: 20, fontWeight: "800", marginTop: 18, marginBottom: 12 },
  card: {
    backgroundColor: "#191326",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#30223F",
  },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "700", marginBottom: 6 },
  muted: { color: "#A69BB8", fontSize: 13, lineHeight: 19 },
  button: {
    backgroundColor: "#8B5CF6",
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontWeight: "800" },
  input: {
    backgroundColor: "#191326",
    borderWidth: 1,
    borderColor: "#57327C",
    borderRadius: 12,
    padding: 14,
    color: "white",
    marginTop: 10,
  },
  stage: {
    alignItems: "center",
    backgroundColor: "#211333",
    padding: 28,
    borderRadius: 18,
    marginVertical: 10,
  },
  pink: { color: "#EC4899", marginTop: 8, fontWeight: "bold" },
  seats: { flexDirection: "row", justifyContent: "space-between" },
  seat: {
    backgroundColor: "#291B3B",
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 15,
    width: "22%",
    height: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  seatText: { color: "white", fontSize: 22 },
  chat: {
    color: "white",
    backgroundColor: "#191326",
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  profile: { alignItems: "center", padding: 20 },
  avatar: { color: "#EC4899", fontSize: 44, marginBottom: 10 },
  label: { color: "white", marginTop: 12 },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#181024",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#30223F",
  },
  navItem: { alignItems: "center", paddingHorizontal: 2 },
  navText: { color: "#A69BB8", fontSize: 10, fontWeight: "600" },
  active: { color: "#EC4899", fontWeight: "900" },
});
