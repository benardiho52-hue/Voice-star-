
import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  bg: "#0B0713",
  panel: "#181024",
  panel2: "#211432",
  purple: "#9B5CFF",
  pink: "#FF4FA3",
  white: "#FFFFFF",
  muted: "#B9ACC9",
  border: "#39264D",
  green: "#45D6A1",
  yellow: "#FFC857",
  red: "#FF637D",
};

const TABS = [
  { id: "Home", icon: "⌂" },
  { id: "Discover", icon: "◉" },
  { id: "Create", icon: "+" },
  { id: "Live", icon: "●" },
  { id: "Profile", icon: "♙" },
];

const INITIAL_ARTISTS = [
  { id: "a1", name: "Star Melody", genre: "Afrobeats", followers: 1250 },
  { id: "a2", name: "King Freestyle", genre: "Freestyle", followers: 890 },
  { id: "a3", name: "Purple Voice", genre: "Gospel", followers: 2140 },
];

const INITIAL_SONGS = [
  {
    id: "s1",
    title: "My First Melody",
    artist: "Star Melody",
    genre: "Afrobeats",
  },
  {
    id: "s2",
    title: "Dreams Will Rise",
    artist: "Purple Voice",
    genre: "Gospel",
  },
];

function Button({
  title,
  onPress,
  secondary = false,
  small = false,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        small && styles.smallButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && styles.secondaryButtonText,
          small && styles.smallButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.linkText}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function Tag({ children, color = COLORS.purple }) {
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[styles.tagText, { color }]}>{children}</Text>
    </View>
  );
}

function EmptyState({ title, message }) {
  return (
    <Card style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>♫</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.mutedText}>{message}</Text>
    </Card>
  );
}

export default function App() {
  const [tab, setTab] = useState("Home");
  const [profileName, setProfileName] = useState("VoiceStar Artist");
  const [editingName, setEditingName] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [songGenre, setSongGenre] = useState("Afrobeats");
  const [songDescription, setSongDescription] = useState("");
  const [songs, setSongs] = useState(INITIAL_SONGS);
  const [artists, setArtists] = useState(INITIAL_ARTISTS);
  const [following, setFollowing] = useState([]);
  const [search, setSearch] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chat, setChat] = useState([
    { id: "c1", name: "Star Melody", text: "Welcome to VoiceStar!" },
    { id: "c2", name: "King Freestyle", text: "Let us hear your voice!" },
  ]);
  const [points, setPoints] = useState(0);
  const [gifts, setGifts] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [recording, setRecording] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState("Reverb");
  const [isLive, setIsLive] = useState(false);
  const [roomName, setRoomName] = useState("VoiceStar Music Room");
  const [familyName, setFamilyName] = useState("Dream Voices");
  const [familyRole, setFamilyRole] = useState("Member");
  const [isPrivate, setIsPrivate] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [ownerMode, setOwnerMode] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);

  const visibleArtists = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return artists;
    return artists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(value) ||
        artist.genre.toLowerCase().includes(value)
    );
  }, [artists, search]);

  const mySongs = songs.filter((song) => song.artist === profileName);

  function showMessage(title, message) {
    Alert.alert(title, message);
  }

  function toggleFollow(artistId) {
    const alreadyFollowing = following.includes(artistId);

    setFollowing((current) =>
      alreadyFollowing
        ? current.filter((id) => id !== artistId)
        : [...current, artistId]
    );
  }

  function publishSong() {
    const title = songTitle.trim();

    if (!title) {
      showMessage("Song title required", "Enter a title before publishing.");
      return;
    }

    const newSong = {
      id: `song-${Date.now()}`,
      title,
      artist: profileName.trim() || "VoiceStar Artist",
      genre: songGenre,
      description: songDescription.trim(),
    };

    setSongs((current) => [newSong, ...current]);
    setSongTitle("");
    setSongDescription("");
    setTab("Profile");

    showMessage(
      "Demo song published",
      "The song has been added to this app session. Online publishing requires a backend."
    );
  }

  function sendChat() {
    const text = chatMessage.trim();

    if (!text) return;

    setChat((current) => [
      ...current,
      {
        id: `chat-${Date.now()}`,
        name: profileName || "Artist",
        text,
      },
    ]);

    setChatMessage("");
  }

  function sendGift() {
    setGifts((current) => current + 1);
    setPoints((current) => current + 10);
    showMessage(
      "Free demo gift sent!",
      "You earned 10 demo points. This does not transfer money or real gifts."
    );
  }

  function completeTask(taskId, reward) {
    if (completedTasks.includes(taskId)) {
      showMessage("Task completed", "You have already claimed this demo reward.");
      return;
    }

    setCompletedTasks((current) => [...current, taskId]);
    setPoints((current) => current + reward);
    showMessage("Reward earned!", `You earned ${reward} demo points.`);
  }

  function startRecordingDemo() {
    setRecording((current) => !current);

    if (!recording) {
      showMessage(
        "Recording demo",
        "The recording indicator is on, but microphone recording has not been connected yet."
      );
    } else {
      showMessage(
        "Recording demo stopped",
        "Connect a recording library to capture and save real audio."
      );
    }
  }

  function toggleLive() {
    const next = !isLive;
    setIsLive(next);

    showMessage(
      next ? "Demo room started" : "Demo room stopped",
      next
        ? "This is a local room preview, not a public livestream."
        : "Your local demo room is now marked as stopped."
    );
  }

  function createArtistProfile() {
    const name = profileName.trim();

    if (!name) {
      showMessage("Name required", "Enter an artist name first.");
      return;
    }

    setArtists((current) => {
      const exists = current.some(
        (artist) => artist.name.toLowerCase() === name.toLowerCase()
      );

      if (exists) return current;

      return [
        {
          id: `artist-${Date.now()}`,
          name,
          genre: "New Artist",
          followers: 0,
        },
        ...current,
      ];
    });

    showMessage(
      "Artist profile ready",
      "Your profile is available in this local Discover list."
    );
  }

  function openOwnerTools() {
    if (!ownerMode) {
      showMessage(
        "Owner access",
        "This is a demo toggle, not secure owner authentication. Real owner permissions must be enforced on a backend."
      );
      return;
    }

    showMessage(
      "Owner tools preview",
      "Owner dashboard, reports, user moderation, payout review, and app settings are planned. Secure server-side permissions are still required."
    );
  }

  function renderHome() {
    const recentSongs = showAllSongs ? songs : songs.slice(0, 3);

    return (
      <>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>V</Text>
            </View>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.brandName}>VoiceStar</Text>
              <Text style={styles.mutedText}>Your voice. Your stage.</Text>
            </View>
            <Tag color={COLORS.pink}>BETA</Tag>
          </View>

          <Text style={styles.heroHeadline}>
            Your next big moment{"\n"}starts with your voice.
          </Text>

          <Text style={styles.heroDescription}>
            Discover artists, share songs, practice your sound, and join the
            VoiceStar community.
          </Text>

          <View style={styles.rowWrap}>
            <Button title="Create a song +" onPress={() => setTab("Create")} />
            <Button
              title="Explore artists"
              secondary
              onPress={() => setTab("Discover")}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{songs.length}</Text>
            <Text style={styles.statLabel}>Demo songs</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{following.length}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>Demo points</Text>
          </Card>
        </View>

        <SectionTitle
          title="Your music space"
          action="Open Studio"
          onAction={() => setTab("Studio")}
        />

        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => setTab("Studio")}
          >
            <Text style={styles.featureIcon}>♫</Text>
            <Text style={styles.cardTitle}>Mix Studio</Text>
            <Text style={styles.mutedText}>Shape your sound</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => setTab("Live")}
          >
            <Text style={styles.featureIcon}>●</Text>
            <Text style={styles.cardTitle}>Live Room</Text>
            <Text style={styles.mutedText}>Enter the stage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => setTab("Family")}
          >
            <Text style={styles.featureIcon}>♧</Text>
            <Text style={styles.cardTitle}>Families</Text>
            <Text style={styles.mutedText}>Grow together</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => setTab("Profile")}
          >
            <Text style={styles.featureIcon}>♙</Text>
            <Text style={styles.cardTitle}>Artist profile</Text>
            <Text style={styles.mutedText}>Build your name</Text>
          </TouchableOpacity>
        </View>

        <SectionTitle
          title="Fresh sounds"
          action={showAllSongs ? "Show less" : "View all"}
          onAction={() => setShowAllSongs((current) => !current)}
        />

        {recentSongs.length ? (
          recentSongs.map((song) => (
            <Card key={song.id} style={styles.songCard}>
              <View style={styles.songArtwork}>
                <Text style={styles.songArtworkText}>♫</Text>
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.cardTitle}>{song.title}</Text>
                <Text style={styles.mutedText}>{song.artist}</Text>
                <Tag>{song.genre || "Music"}</Tag>
              </View>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() =>
                  showMessage(
                    "Song preview",
                    "Audio playback will work after a real audio player and song files are connected."
                  )
                }
              >
                <Text style={styles.playButtonText}>▶</Text>
              </TouchableOpacity>
            </Card>
          ))
        ) : (
          <EmptyState
            title="No songs yet"
            message="Create your first song to start filling your music space."
          />
        )}

        <Card style={styles.noticeCard}>
          <Text style={styles.cardTitle}>Welcome to VoiceStar</Text>
          <Text style={styles.mutedText}>
            This build is the app interface and local demo. Account security,
            shared songs, live audio/video, real gifts, and payments need
            backend setup before public use.
          </Text>
        </Card>
      </>
    );
  }

  function renderDiscover() {
    return (
      <>
        <Text style={styles.pageTitle}>Discover</Text>
        <Text style={styles.pageSubtitle}>
          Find voices, genres, and new music.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Search artists or genres..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        <SectionTitle title="Artists to discover" />

        {visibleArtists.length ? (
          visibleArtists.map((artist) => {
            const isFollowing = following.includes(artist.id);

            return (
              <Card key={artist.id} style={styles.artistCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {artist.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.artistInfo}>
                  <Text style={styles.cardTitle}>{artist.name}</Text>
                  <Text style={styles.mutedText}>{artist.genre}</Text>
                  <Text style={styles.smallMuted}>
                    {artist.followers.toLocaleString()} demo followers
                  </Text>
                </View>

                <Button
                  title={isFollowing ? "Following" : "Follow"}
                  small
                  secondary={isFollowing}
                  onPress={() => toggleFollow(artist.id)}
                />
              </Card>
            );
          })
        ) : (
          <EmptyState
            title="No artists found"
            message="Try another artist name or genre."
          />
        )}

        <SectionTitle title="Explore genres" />

        <View style={styles.rowWrap}>
          {["Afrobeats", "Gospel", "Freestyle", "R&B", "Pop", "Hip-hop"].map(
            (genre) => (
              <TouchableOpacity
                key={genre}
                style={styles.genreChip}
                onPress={() => setSearch(genre)}
              >
                <Text style={styles.genreText}>{genre}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <Button
          title="Create my artist profile"
          onPress={createArtistProfile}
        />
      </>
    );
  }

  function renderCreate() {
    return (
      <>
        <Text style={styles.pageTitle}>Create</Text>
        <Text style={styles.pageSubtitle}>
          Choose what you want to create on VoiceStar.
        </Text>

        <TouchableOpacity
          style={styles.createTile}
          onPress={() => setTab("Studio")}
        >
          <Text style={styles.createIcon}>♫</Text>
          <View style={styles.createTextWrap}>
            <Text style={styles.cardTitle}>Record and mix</Text>
            <Text style={styles.mutedText}>
              Open the Studio interface and explore vocal effects.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createTile}
          onPress={() => setTab("Live")}
        >
          <Text style={styles.createIcon}>●</Text>
          <View style={styles.createTextWrap}>
            <Text style={styles.cardTitle}>Create a room</Text>
            <Text style={styles.mutedText}>
              Set a room name and preview the live-room interface.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createTile}
          onPress={() => setTab("Family")}
        >
          <Text style={styles.createIcon}>♧</Text>
          <View style={styles.createTextWrap}>
            <Text style={styles.cardTitle}>Create a family</Text>
            <Text style={styles.mutedText}>
              Start a community and view family tasks.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createTile}
          onPress={() => {
            setSongTitle("");
            setTab("Publish");
          }}
        >
          <Text style={styles.createIcon}>↑</Text>
          <View style={styles.createTextWrap}>
            <Text style={styles.cardTitle}>Publish a song</Text>
            <Text style={styles.mutedText}>
              Add your song details to the local demo list.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderStudio() {
    const effects = [
      { name: "Reverb", description: "Room and space effect" },
      { name: "Echo", description: "Repeating vocal effect" },
      { name: "Bass", description: "Low-frequency control" },
      { name: "Treble", description: "High-frequency control" },
      { name: "Compression", description: "Vocal level control" },
      { name: "AutoTune", description: "Pitch-correction concept" },
      { name: "Voice Changer", description: "Voice transformation concept" },
      { name: "Beat Library", description: "Beat selection concept" },
    ];

    return (
      <>
        <Text style={styles.pageTitle}>Mix Studio</Text>
        <Text style={styles.pageSubtitle}>
          Prepare your sound and explore studio controls.
        </Text>

        <Card style={styles.recordPanel}>
          <View style={styles.recordCircle}>
            <Text style={styles.recordIcon}>{recording ? "■" : "●"}</Text>
          </View>

          <Text style={styles.cardTitle}>
            {recording ? "Demo recording active" : "Ready for your voice"}
          </Text>

          <Text style={styles.mutedText}>
            This button previews the recording flow. Real microphone capture
            and audio-file saving are not connected yet.
          </Text>

          <Button
            title={recording ? "Stop demo recording" : "Start recording demo"}
            onPress={startRecordingDemo}
          />
        </Card>

        <SectionTitle title="Vocal effects" />

        <View style={styles.effectsGrid}>
          {effects.map((effect) => {
            const selected = selectedEffect === effect.name;

            return (
              <TouchableOpacity
                key={effect.name}
                style={[
                  styles.effectTile,
                  selected && styles.effectTileSelected,
                ]}
                onPress={() => {
                  setSelectedEffect(effect.name);
                  showMessage(
                    effect.name,
                    "This selects the effect in the demo interface. Actual audio processing must still be implemented."
                  );
                }}
              >
                <Text style={styles.effectIcon}>
                  {effect.name === "Reverb"
                    ? "≈"
                    : effect.name === "Echo"
                    ? "〰"
                    : effect.name === "Bass"
                    ? "♫"
                    : effect.name === "AutoTune"
                    ? "♬"
                    : effect.name === "Voice Changer"
                    ? "◉"
                    : "✦"}
                </Text>
                <Text style={styles.cardTitle}>{effect.name}</Text>
                <Text style={styles.smallMuted}>{effect.description}</Text>
                {selected ? <Tag color={COLORS.pink}>Selected</Tag> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Card>
          <Text style={styles.cardTitle}>Next: publish your track</Text>
          <Text style={styles.mutedText}>
            When real audio recording and mixing are connected, the finished
            audio file can be attached to a song before publishing.
          </Text>
          <Button title="Continue to Publish" onPress={() => setTab("Publish")} />
        </Card>
      </>
    );
  }

  function renderPublish() {
    return (
      <>
        <Text style={styles.pageTitle}>Publish Song</Text>
        <Text style={styles.pageSubtitle}>
          Add the details for your demo song.
        </Text>

        <Card>
          <Text style={styles.fieldLabel}>Song title *</Text>
          <TextInput
            style={styles.input}
            value={songTitle}
            onChangeText={setSongTitle}
            placeholder="Enter your song title"
            placeholderTextColor={COLORS.muted}
          />

          <Text style={styles.fieldLabel}>Artist</Text>
          <TextInput
            style={styles.input}
            value={profileName}
            onChangeText={setProfileName}
            placeholder="Artist name"
            placeholderTextColor={COLORS.muted}
          />

          <Text style={styles.fieldLabel}>Genre</Text>
          <View style={styles.rowWrap}>
            {["Afrobeats", "Gospel", "Freestyle", "R&B", "Pop", "Hip-hop"].map(
              (genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreChip,
                    songGenre === genre && styles.genreChipSelected,
                  ]}
                  onPress={() => setSongGenre(genre)}
                >
                  <Text style={styles.genreText}>{genre}</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={songDescription}
            onChangeText={setSongDescription}
            placeholder="Tell listeners about your song..."
            placeholderTextColor={COLORS.muted}
            multiline
            textAlignVertical="top"
          />

          <Button title="Publish demo song" onPress={publishSong} />
          <Button
            title="Cancel"
            secondary
            onPress={() => setTab("Create")}
          />

          <Text style={styles.smallMuted}>
            Publishing here only updates the current app session. Online song
            uploads need file storage and a backend.
          </Text>
        </Card>
      </>
    );
  }

  function renderLive() {
    return (
      <>
        <Text style={styles.pageTitle}>Live Room</Text>
        <Text style={styles.pageSubtitle}>
          Set up a room and preview the stage.
        </Text>

        <Card style={styles.liveBanner}>
          <View style={styles.liveHeader}>
            <Tag color={COLORS.red}>{isLive ? "LIVE DEMO" : "ROOM PREVIEW"}</Tag>
            <Text style={styles.smallMuted}>Local preview</Text>
          </View>

          <Text style={styles.liveRoomTitle}>{roomName || "Music Room"}</Text>
          <Text style={styles.mutedText}>
            Sing, share music, and build a community around your sound.
          </Text>

          <View style={styles.stage}>
            <View style={styles.hostAvatar}>
              <Text style={styles.avatarText}>
                {(profileName || "V").charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.cardTitle}>{profileName || "Host"}</Text>
            <Tag color={COLORS.pink}>HOST</Tag>

            <View style={styles.seatRow}>
              {["Guest 1", "Guest 2", "Guest 3"].map((guest) => (
                <View key={guest} style={styles.guestSeat}>
                  <Text style={styles.guestSeatIcon}>＋</Text>
                  <Text style={styles.smallMuted}>{guest}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.fieldLabel}>Room name</Text>
          <TextInput
            style={styles.input}
            value={roomName}
            onChangeText={setRoomName}
            placeholder="Give your room a name"
            placeholderTextColor={COLORS.muted}
          />

          <Button
            title={isLive ? "Stop room demo" : "Start room demo"}
            onPress={toggleLive}
          />
        </Card>

        <SectionTitle title="Room actions" />

        <View style={styles.rowWrap}>
          <Button title="Send free gift" onPress={sendGift} />
          <Button
            title="Invite / seats"
            secondary
            onPress={() =>
              showMessage(
                "Guest seats",
                "Seat invitations and live audio connections are not implemented yet."
              )
            }
          />
        </View>

        <SectionTitle title="Room chat" />

        <Card>
          {chat.slice(-8).map((item) => (
            <View key={item.id} style={styles.chatLine}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatText}>{item.text}</Text>
            </View>
          ))}

          <View style={styles.chatInputRow}>
            <TextInput
              style={[styles.input, styles.chatInput]}
              value={chatMessage}
              onChangeText={setChatMessage}
              placeholder="Write a message..."
              placeholderTextColor={COLORS.muted}
              onSubmitEditing={sendChat}
              returnKeyType="send"
            />
            <Button title="Send" small onPress={sendChat} />
          </View>
        </Card>

        <Text style={styles.smallMuted}>
          This is not a public livestream. Real-time rooms require streaming
          infrastructure, moderation, and server-side room management.
        </Text>
      </>
    );
  }

  function renderFamily() {
    const tasks = [
      {
        id: "task-profile",
        title: "Complete your artist profile",
        description: "Set your artist name and profile details.",
        reward: 10,
      },
      {
        id: "task-discover",
        title: "Discover an artist",
        description: "Visit Discover and find someone new.",
        reward: 5,
      },
      {
        id: "task-song",
        title: "Publish a demo song",
        description: "Add a song using the Publish screen.",
        reward: 15,
      },
      {
        id: "task-family",
        title: "Support your family",
        description: "Check in and encourage your team.",
        reward: 10,
      },
    ];

    return (
      <>
        <Text style={styles.pageTitle}>Family & Tasks</Text>
        <Text style={styles.pageSubtitle}>
          Build a team, complete activities, and earn demo points.
        </Text>

        <Card>
          <Text style={styles.fieldLabel}>Family name</Text>
          <TextInput
            style={styles.input}
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="Family name"
            placeholderTextColor={COLORS.muted}
          />

          <Text style={styles.fieldLabel}>Your demo role</Text>
          <View style={styles.rowWrap}>
            {["Member", "Co-captain", "Captain"].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.genreChip,
                  familyRole === role && styles.genreChipSelected,
                ]}
                onPress={() => setFamilyRole(role)}
              >
                <Text style={styles.genreText}>{role}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.familySummary}>
            <View>
              <Text style={styles.cardTitle}>{familyName || "My Family"}</Text>
              <Text style={styles.mutedText}>{familyRole}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsNumber}>{points}</Text>
              <Text style={styles.smallMuted}>demo points</Text>
            </View>
          </View>
        </Card>

        <SectionTitle title="Daily tasks" />

        {tasks.map((task) => {
          const done = completedTasks.includes(task.id);

          return (
            <Card key={task.id} style={styles.taskCard}>
              <View style={styles.taskTextWrap}>
                <Text style={styles.cardTitle}>{task.title}</Text>
                <Text style={styles.mutedText}>{task.description}</Text>
                <Text style={styles.rewardText}>+{task.reward} demo points</Text>
              </View>

              <Button
                title={done ? "Claimed" : "Complete"}
                small
                secondary={done}
                onPress={() => completeTask(task.id, task.reward)}
              />
            </Card>
          );
        })}

        <Card>
          <Text style={styles.cardTitle}>Family battles and levels</Text>
          <Text style={styles.mutedText}>
            Family battles, experience levels, rankings, and co-captain
            permissions are planned. This screen does not yet store roles or
            rewards on a server.
          </Text>
        </Card>
      </>
    );
  }

  function renderProfile() {
    const myFollowers = artists.find(
      (artist) => artist.name.toLowerCase() === profileName.toLowerCase()
    );

    return (
      <>
        <Text style={styles.pageTitle}>Artist Profile</Text>
        <Text style={styles.pageSubtitle}>
          Manage your local artist profile and preferences.
        </Text>

        <Card style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {(profileName || "V").charAt(0).toUpperCase()}
            </Text>
          </View>

          {editingName ? (
            <TextInput
              style={styles.input}
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Your artist name"
              placeholderTextColor={COLORS.muted}
            />
          ) : (
            <Text style={styles.profileName}>
              {profileName || "VoiceStar Artist"}
            </Text>
          )}

          <Tag color={COLORS.purple}>ARTIST</Tag>

          <View style={styles.rowWrap}>
            <View style={styles.profileStat}>
              <Text style={styles.statNumber}>{mySongs.length}</Text>
              <Text style={styles.statLabel}>My demo songs</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.statNumber}>{following.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.statNumber}>{gifts}</Text>
              <Text style={styles.statLabel}>Demo gifts</Text>
            </View>
          </View>

          <Button
            title={editingName ? "Save name" : "Edit artist name"}
            onPress={() => {
              if (editingName && !profileName.trim()) {
                showMessage("Name required", "Enter an artist name.");
                return;
              }
              setEditingName((current) => !current);
            }}
          />
        </Card>

        <SectionTitle title="My songs" />

        {mySongs.length ? (
          mySongs.map((song) => (
            <Card key={song.id} style={styles.songCard}>
              <View style={styles.songArtwork}>
                <Text style={styles.songArtworkText}>♫</Text>
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.cardTitle}>{song.title}</Text>
                <Text style={styles.mutedText}>{song.genre}</Text>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            title="Your stage is waiting"
            message="Publish your first demo song to see it here."
          />
        )}

        <SectionTitle title="Preferences" />

        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Text style={styles.mutedText}>
                Demo preference for notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.purple }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.cardTitle}>Private profile</Text>
              <Text style={styles.mutedText}>
                Demo preference; not server-enforced
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: COLORS.border, true: COLORS.purple }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.cardTitle}>Owner dashboard preview</Text>
              <Text style={styles.mutedText}>
                This switch does not grant secure owner access
              </Text>
            </View>
            <Switch
              value={ownerMode}
              onValueChange={setOwnerMode}
              trackColor={{ false: COLORS.border, true: COLORS.purple }}
              thumbColor={COLORS.white}
            />
          </View>

          <Button
            title="Open owner tools preview"
            secondary
            onPress={openOwnerTools}
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Account security</Text>
          <Text style={styles.mutedText}>
            Real sign-in, verification badges, account recovery, moderation,
            and owner permissions must be implemented securely on a backend.
          </Text>
        </Card>
      </>
    );
  }

  function renderContent() {
    switch (tab) {
      case "Home":
        return renderHome();
      case "Discover":
        return renderDiscover();
      case "Create":
        return renderCreate();
      case "Studio":
        return renderStudio();
      case "Publish":
        return renderPublish();
      case "Live":
        return renderLive();
      case "Family":
        return renderFamily();
      case "Profile":
        return renderProfile();
      default:
        return renderHome();
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.appHeader}>
        <TouchableOpacity
          style={styles.headerBrand}
          onPress={() => setTab("Home")}
        >
          <View style={styles.headerLogo}>
            <Text style={styles.headerLogoText}>V</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>VoiceStar</Text>
            <Text style={styles.headerSubtitle}>CREATE · CONNECT · SHINE</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pointsPill}
          onPress={() =>
            showMessage(
              "Demo points",
              `${points} points earned in this app session. These are not cash or withdrawable rewards.`
            )
          }
        >
          <Text style={styles.pointsPillText}>✦ {points}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.bottomNav}>
        {TABS.map((item) => {
          const selected = tab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => setTab(item.id)}
            >
              <View style={[styles.navIconWrap, selected && styles.navActive]}>
                <Text
                  style={[
                    styles.navIcon,
                    selected && styles.navIconActive,
                    item.id === "Create" && styles.createNavIcon,
                  ]}
                >
                  {item.icon}
                </Text>
              </View>
              <Text
                style={[
                  styles.navLabel,
                  selected && styles.navLabelActive,
                ]}
              >
                {item.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  appHeader: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLogo: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogoText: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "900",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  pointsPill: {
    backgroundColor: COLORS.panel2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pointsPillText: {
    color: COLORS.yellow,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  hero: {
    backgroundColor: COLORS.panel2,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
    marginBottom: 18,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 10,
  },
  logoCircle: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.pink,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 23,
  },
  heroTitleWrap: {
    flex: 1,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
  },
  heroHeadline: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 35,
    marginBottom: 12,
  },
  heroDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 9,
  },
  button: {
    minHeight: 45,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.purple,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
    marginBottom: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  secondaryButtonText: {
    color: "#D9C4FF",
  },
  smallButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
    marginTop: 0,
    marginBottom: 0,
  },
  smallButtonText: {
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 15,
    alignItems: "center",
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
  linkText: {
    color: COLORS.pink,
    fontSize: 12,
    fontWeight: "800",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  featureTile: {
    width: "48%",
    flexGrow: 1,
    minHeight: 125,
    padding: 14,
    borderRadius: 19,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIcon: {
    color: COLORS.pink,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 9,
  },
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 11,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  smallMuted: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  tag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 7,
  },
  tagText: {
    fontSize: 9,
    fontWeight: "900",
  },
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  songArtwork: {
    width: 58,
    height: 58,
    borderRadius: 15,
    backgroundColor: COLORS.panel2,
    borderWidth: 1,
    borderColor: COLORS.purple,
    justifyContent: "center",
    alignItems: "center",
  },
  songArtworkText: {
    color: COLORS.pink,
    fontSize: 30,
    fontWeight: "900",
  },
  songInfo: {
    flex: 1,
  },
  playButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    color: COLORS.white,
    fontWeight: "900",
  },
  noticeCard: {
    borderColor: "#60418A",
    marginTop: 8,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 25,
  },
  emptyIcon: {
    color: COLORS.pink,
    fontSize: 35,
    marginBottom: 8,
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 6,
    marginBottom: 5,
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  input: {
    minHeight: 47,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: COLORS.white,
    fontSize: 13,
    marginTop: 7,
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  artistCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },
  artistInfo: {
    flex: 1,
  },
  genreChip: {
    backgroundColor: COLORS.panel2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 7,
  },
  genreChipSelected: {
    borderColor: COLORS.pink,
    backgroundColor: "#3A1737",
  },
  genreText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  createTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
    padding: 16,
    marginBottom: 12,
  },
  createIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.panel2,
    color: COLORS.pink,
    fontSize: 26,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    paddingTop: 5,
  },
  createTextWrap: {
    flex: 1,
  },
  arrow: {
    color: COLORS.pink,
    fontSize: 28,
  },
  recordPanel: {
    alignItems: "center",
    paddingVertical: 23,
  },
  recordCircle: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: "#3B1839",
    borderWidth: 2,
    borderColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  recordIcon: {
    color: COLORS.pink,
    fontSize: 33,
    fontWeight: "900",
  },
  effectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 12,
  },
  effectTile: {
    width: "48%",
    flexGrow: 1,
    minHeight: 118,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 12,
  },
  effectTileSelected: {
    borderColor: COLORS.pink,
    backgroundColor: "#29142F",
  },
  effectIcon: {
    color: COLORS.pink,
    fontSize: 25,
    marginBottom: 6,
  },
  fieldLabel: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 3,
  },
  liveBanner: {
    padding: 15,
  },
  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  liveRoomTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  stage: {
    backgroundColor: "#100A1B",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    alignItems: "center",
    padding: 18,
    marginVertical: 15,
  },
  hostAvatar: {
    width: 72,
    height: 72,
    borderRadius: 38,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  seatRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 22,
    gap: 7,
  },
  guestSeat: {
    flex: 1,
    minHeight: 75,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  guestSeatIcon: {
    color: COLORS.pink,
    fontSize: 24,
  },
  chatLine: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatName: {
    color: COLORS.pink,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 3,
  },
  chatText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  chatInput: {
    flex: 1,
    marginBottom: 0,
  },
  familySummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pointsBadge: {
    alignItems: "flex-end",
  },
  pointsNumber: {
    color: COLORS.yellow,
    fontSize: 23,
    fontWeight: "900",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taskTextWrap: {
    flex: 1,
  },
  rewardText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 22,
  },
  profileAvatar: {
    width: 94,
    height: 94,
    borderRadius: 48,
    backgroundColor: COLORS.purple,
    borderWidth: 3,
    borderColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileAvatarText: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: "900",
  },
  profileName: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 4,
  },
  profileStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingTextWrap: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#181024",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 7,
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navIconWrap: {
    minWidth: 40,
    minHeight: 29,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navActive: {
    backgroundColor: "#39204E",
  },
  navIcon: {
    color: COLORS.muted,
    fontSize: 22,
    fontWeight: "700",
  },
  navIconActive: {
    color: COLORS.pink,
  },
  createNavIcon: {
    fontSize: 29,
    color: COLORS.pink,
    fontWeight: "900",
  },
  navLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "600",
  },
  navLabelActive: {
    color: COLORS.white,
    fontWeight: "900",
  },
  bottomSpace: {
    height: 20,
  },
});
