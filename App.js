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

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const current = session?.user ?? null;
      setUser(current);
      setEmail(current?.email || "");
    });

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
      Alert.alert(
        "Could not publish",
        error.message || "Please try again."
      );
    } finally {
      setLoading(false);
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

  function Button({ label, onPress, secondary = false }) {
    return (
      <TouchableOpacity
        style={[styles.button, secondary && styles.secondary]}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function Panel({ children }) {
    return <View style={styles.panel}>{children}</View>;
  }

  function Heading({ children }) {
    return <Text style={styles.heading}>{children}</Text>;
  }

  function Field({ label, value, onChangeText, placeholder, multiline }) {
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          multiline={multiline}
          style={[styles.input, multiline && { minHeight: 90 }]}
        />
      </>
    );
  }

  function SongCard({ song }) {
    return (
      <Panel>
        <View style={styles.row}>
          <View style={styles.musicIcon}>
            <Text style={{ color: C.white, fontSize: 24 }}>♫</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{song.title}</Text>
            <Text style={styles.muted}>
              {song.artist} · {song.genre}
            </Text>
          </View>
        </View>
      </Panel>
    );
  }

  function Home() {
    return (
      <>
        <Panel>
          <Text style={styles.pink}>YOUR VOICE. YOUR STAGE.</Text>
          <Text style={styles.heroTitle}>Let the world hear you.</Text>
          <Text style={styles.muted}>
            Sing, discover artists, meet your community and grow your sound.
          </Text>
          <Button label="＋ Create music" onPress={() => setScreen("Studio")} />
          <Button label="🎤 Enter Stage" onPress={() => setScreen("Stage")} />
          <Button label="♧ Find Groups" onPress={() => setScreen("Groups")} secondary />
        </Panel>

        <Heading>Trending voices</Heading>
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </>
    );
  }

  function Discover() {
    return (
      <>
        <Heading>Discover music</Heading>
        <Field
          label="SEARCH"
          value={search}
          onChangeText={setSearch}
          placeholder="Search songs, genres or artists"
        />
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
        {!filteredSongs.length && (
          <Text style={styles.muted}>No matching songs found.</Text>
        )}
      </>
    );
  }

  function Studio() {
    return (
      <>
        <Heading>Artist Studio</Heading>
        <Panel>
          <Text style={styles.pink}>CREATE YOUR NEXT HIT</Text>
          <Field label="SONG TITLE" value={title} onChangeText={setTitle} placeholder="Enter song title" />
          <Field label="GENRE" value={genre} onChangeText={setGenre} placeholder="Afrobeats, Gospel, R&B..." />
          <Field label="DESCRIPTION" value={description} onChangeText={setDescription} placeholder="Tell us about your song" multiline />
          <Button
            label={loading ? "Publishing..." : "Publish Song ↗"}
            onPress={publishSong}
          />
        </Panel>

        <Heading>Vocal effects controls</Heading>
        <Panel>
          <Text style={styles.muted}>
            These controls are a prototype interface. They do not process audio
            until the recording and audio-effects engine is connected.
          </Text>

          {Object.keys(effects).map((name) => (
            <View key={name} style={{ marginTop: 15 }}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>
                  {name === "Pitch" ? "Pitch correction" : name}
                </Text>
                <Text style={styles.pink}>{effects[name]}</Text>
              </View>
              <View style={styles.row}>
                <Button
                  label="−"
                  secondary
                  onPress={() =>
                    setEffects((old) => ({
                      ...old,
                      [name]: Math.max(name === "Pitch" ? -12 : 0, old[name] - 5),
                    }))
                  }
                />
                <Button
                  label="+"
                  onPress={() =>
                    setEffects((old) => ({
                      ...old,
                      [name]: Math.min(name === "Pitch" ? 12 : 100, old[name] + 5),
                    }))
                  }
                />
              </View>
            </View>
          ))}
          <Button
            label="Reset effects"
            secondary
            onPress={() =>
              setEffects({
                Reverb: 30,
                Echo: 10,
                Bass: 50,
                Treble: 50,
                Compression: 30,
                Pitch: 0,
              })
            }
          />
        </Panel>
      </>
    );
  }

  function Stage() {
    return (
      <>
        <Heading>Live Stage</Heading>
        <Panel>
          <Text style={styles.pink}>● STAGE ROOM</Text>
          <Text style={styles.heroTitle}>
            {room?.name || "VoiceStar Open Mic"}
          </Text>
          <Text style={styles.muted}>
            {room
              ? "Room created on this device. Live streaming is not connected yet."
              : "Create a room or join a seat to try the stage interface."}
          </Text>

          <Field
            label="ROOM NAME"
            value={roomName}
            onChangeText={setRoomName}
            placeholder="e.g. Afrobeat Freestyle"
          />
          <Button
            label="＋ Create Stage Room"
            onPress={() => {
              const name = roomName.trim();
              if (!name) {
                Alert.alert("Room name", "Enter a room name first.");
                return;
              }

              setRoom({ name });
              setSeats([]);
              setRoomName("");
              Alert.alert("Room created", "Your demo stage room is ready.");
            }}
          />
        </Panel>

        <Heading>Artist seats</Heading>
        <View style={styles.seatGrid}>
          {Array.from({ length: 8 }, (_, i) => {
            const occupied = seats.includes(i);
            return (
              <TouchableOpacity
                key={i}
                style={[styles.seat, occupied && styles.seatActive]}
                onPress={() => {
                  if (!room) {
                    Alert.alert("Join a room", "Create a stage room first.");
                    return;
                  }

                  setSeats((old) =>
                    occupied ? old.filter((seat) => seat !== i) : [...old, i]
                  );
                }}
              >
                <Text style={styles.seatText}>
                  {occupied ? "🎤" : `Seat ${i + 1}`}
                </Text>
                <Text style={styles.muted}>
                  {occupied ? "You" : "Available"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Panel>
          <Heading>Room interactions</Heading>
          <Text style={styles.muted}>
            Seats, gifts and sample chat work locally in this prototype.
            Real guests need a shared backend and live audio service.
          </Text>
          <View style={styles.row}>
            <Button
              label="❤️ Like"
              onPress={() =>
                Alert.alert("Liked", "Your demo reaction was recorded locally.")
              }
            />
            <Button
              label="🎁 Send gift"
              onPress={() => {
                setGifts((old) => old + 1);
                Alert.alert("Demo gift", "One local demo gift added.");
              }}
              secondary
            />
          </View>
          <Button label="Open Chat" onPress={() => setScreen("Chat")} />
        </Panel>
      </>
    );
  }

  function Chat() {
    return (
      <>
        <Heading>Community Chat</Heading>
        <Panel>
          {messages.map((message) => (
            <View key={message.id} style={styles.chatBubble}>
              <Text style={styles.pink}>{message.sender}</Text>
              <Text style={styles.cardTitle}>{message.text}</Text>
            </View>
          ))}

          <TextInput
            value={chatMessage}
            onChangeText={setChatMessage}
            placeholder="Write a message..."
            placeholderTextColor={C.muted}
            style={styles.input}
          />
          <Button
            label="Send message"
            onPress={() => {
              const text = chatMessage.trim();
              if (!text) return;

              setMessages((old) => [
                ...old,
                {
                  id: `${Date.now()}`,
                  sender: email ? email.split("@")[0] : "Guest",
                  text,
                },
              ]);
              setChatMessage("");
            }}
          />
          <Text style={styles.muted}>
            Messages currently stay on this device; shared chat is not
            connected yet.
          </Text>
        </Panel>
      </>
    );
  }

  function Groups() {
    return (
      <>
        <Heading>Groups & Families</Heading>
        <Panel>
          <Text style={styles.muted}>
            Create a local demo community. Online membership and invitations
            require backend tables and permissions.
          </Text>
          <Field
            label="GROUP OR FAMILY NAME"
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter a name"
          />
          <Button
            label="＋ Create Group"
            onPress={() => {
              const name = groupName.trim();
              if (!name) {
                Alert.alert("Name required", "Enter a group name.");
                return;
              }

              setGroups((old) => [...old, { id: `${Date.now()}`, name }]);
              setGroupName("");
            }}
          />
        </Panel>

        <Heading>Your communities</Heading>
        {groups.length === 0 ? (
          <Text style={styles.muted}>No groups created on this device yet.</Text>
        ) : (
          groups.map((group) => (
            <Panel key={group.id}>
              <Text style={styles.cardTitle}>♧ {group.name}</Text>
              <Text style={styles.muted}>Created locally · 1 demo member</Text>
            </Panel>
          ))
        )}
      </>
    );
  }

  function Tasks() {
    return (
      <>
        <Heading>Tasks & Rewards</Heading>
        <Panel>
          <Text style={styles.heroTitle}>{xp} XP</Text>
          <Text style={styles.muted}>Demo experience points earned on this device</Text>
          <Text style={styles.cardTitle}>🎁 Demo gifts: {gifts}</Text>
        </Panel>

        {tasks.map((task) => (
          <Panel key={task.id}>
            <Text style={styles.cardTitle}>{task.title}</Text>
            <Text style={styles.muted}>Reward: {task.reward} XP</Text>
            <Button
              label={task.done ? "Completed ✓" : "Complete demo task"}
              secondary={task.done}
              onPress={() => {
                if (task.done) return;

                setTasks((old) =>
                  old.map((item) =>
                    item.id === task.id ? { ...item, done: true } : item
                  )
                );
                setXp((old) => old + task.reward);
                Alert.alert("Task complete", `You earned ${task.reward} demo XP.`);
              }}
            />
          </Panel>
        ))}

        <Text style={styles.muted}>
          XP and gifts here are prototypes, not transferable currency. Real
          rewards need server-side validation to prevent cheating.
        </Text>
      </>
    );
  }

  function Profile() {
    return (
      <>
        <Heading>Artist Profile</Heading>
        <Panel>
          <Text style={styles.heroTitle}>
            {email ? email.split("@")[0] : "New Voice"}
          </Text>
          <Text style={styles.muted}>
            {email || "Sign in to publish your music."}
          </Text>
          <Text style={styles.cardTitle}>Experience: {xp} demo XP</Text>
          <Text style={styles.cardTitle}>Demo gifts: {gifts}</Text>

          {!user ? (
            <>
              <Field
                label="EMAIL ADDRESS"
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder="Enter your email"
              />
              <Button
                label={authLoading ? "Please wait..." : "Sign in with email"}
                onPress={signIn}
              />
              {authLoading && (
                <ActivityIndicator color={C.purple} style={{ marginTop: 12 }} />
              )}
            </>
          ) : (
            <Button label="Sign out" secondary onPress={signOut} />
          )}
        </Panel>
      </>
    );
  }

  const screenContent = {
    Home: <Home />,
    Discover: <Discover />,
    Studio: <Studio />,
    Stage: <Stage />,
    Chat: <Chat />,
    Groups: <Groups />,
    Tasks: <Tasks />,
    Profile: <Profile />,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>
            VOICE<Text style={{ color: C.pink }}>STAR</Text> ✦
          </Text>
          <Text style={styles.tagline}>YOUR VOICE. YOUR STAGE.</Text>
        </View>
        <Text style={{ fontSize: 24, color: C.purple }}>♫</Text>
      </View>

      <ScrollView
        key={screen}
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {screenContent[screen] || <Home />}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.nav}
        contentContainerStyle={styles.navContent}
      >
        {tabs.map(([name, symbol]) => (
          <TouchableOpacity
            key={name}
            style={[styles.navItem, screen === name && styles.navActive]}
            onPress={() => setScreen(name)}
          >
            <Text style={[styles.navIcon, screen === name && styles.activeText]}>
              {symbol}
            </Text>
            <Text style={[styles.navLabel, screen === name && styles.activeText]}>
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { color: C.white, fontSize: 22, fontWeight: "900" },
  tagline: { color: C.muted, fontSize: 9, letterSpacing: 2 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  panel: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
  },
  heroTitle: {
    color: C.white,
    fontSize: 27,
    fontWeight: "900",
    marginVertical: 8,
  },
  pink: { color: C.pink, fontWeight: "800", marginBottom: 6 },
  muted: { color: C.muted, fontSize: 12, marginTop: 4, lineHeight: 19 },
  heading: {
    color: C.white,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 5,
  },
  button: {
    flex: 1,
    backgroundColor: C.purple,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 10,
  },
  secondary: { backgroundColor: "#30203F", borderWidth: 1, borderColor: C.border },
  buttonText: { color: C.white, fontWeight: "800", fontSize: 12 },
  musicIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#392253",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { color: C.white, fontSize: 13, fontWeight: "800" },
  label: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#100C19",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    padding: 13,
    color: C.white,
    marginTop: 5,
    marginBottom: 8,
    minHeight: 46,
  },
  seatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 14 },
  seat: {
    width: "48%",
    minHeight: 78,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.panel,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
  },
  seatActive: { borderColor: C.pink, backgroundColor: "#30152E" },
  seatText: { color: C.white, fontWeight: "800" },
  chatBubble: {
    backgroundColor: "#21162E",
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
  },
  nav: {
    flexGrow: 0,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: "#100B18",
  },
  navContent: { paddingHorizontal: 4, alignItems: "center" },
  navItem: {
    minWidth: 68,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  navActive: {
    borderTopWidth: 2,
    borderTopColor: C.pink,
  },
  navIcon: { color: C.muted, fontSize: 19 },
  navLabel: { color: C.muted, fontSize: 10, marginTop: 3 },
  activeText: { color: C.pink, fontWeight: "900" },
});
