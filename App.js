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
} from "react-native";

const C = {
  bg: "#090711",
  panel: "#151022",
  panel2: "#201632",
  purple: "#A855F7",
  pink: "#FF4FCB",
  white: "#F8F4FF",
  muted: "#A99BBE",
  green: "#35E6A2",
  red: "#FF476F",
};

const initialArtists = [
  { name: "Star Melody", genre: "Afrobeats", followers: "12.5K" },
  { name: "Golden Voice", genre: "Gospel", followers: "8.2K" },
  { name: "Purple Star", genre: "R&B", followers: "5.6K" },
];

const rooms = [
  { host: "Star Melody", title: "Friday Night Vibes", viewers: "1,284" },
  { host: "Golden Voice", title: "Gospel Live Session", viewers: "856" },
  { host: "Purple Star", title: "New Artists Showcase", viewers: "432" },
];

export default function App() {
  const [page, setPage] = useState("Home");
  const [artists, setArtists] = useState(initialArtists);
  const [following, setFollowing] = useState([]);
  const [coins, setCoins] = useState(100);
  const [likes, setLikes] = useState(0);
  const [songTitle, setSongTitle] = useState("");
  const [songDescription, setSongDescription] = useState("");
  const [publishedSongs, setPublishedSongs] = useState([]);
  const [room, setRoom] = useState(rooms[0]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState(
    "Welcome to VoiceStar! Let your voice shine."
  );

  const go = (next) => {
    setPage(next);
    setNotice("");
  };

  const followArtist = (name) => {
    const already = following.includes(name);
    setFollowing((old) =>
      already ? old.filter((n) => n !== name) : [...old, name]
    );
    setNotice(already ? `Unfollowed ${name}` : `You followed ${name}!`);
  };

  const publishSong = () => {
    if (!songTitle.trim()) {
      setNotice("Please enter your song title first.");
      return;
    }

    setPublishedSongs((old) => [
      {
        id: Date.now(),
        title: songTitle.trim(),
        description: songDescription.trim(),
      },
      ...old,
    ]);

    setSongTitle("");
    setSongDescription("");
    setNotice("Your song was added to this app's song feed.");
    setPage("Discover");
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((old) => [...old, message.trim()]);
    setMessage("");
  };

  const Button = ({ title, onPress, secondary = false }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[s.button, secondary && s.secondaryButton]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const ArtistCard = ({ artist }) => (
    <View style={s.card}>
      <View style={s.row}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>★</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{artist.name}</Text>
          <Text style={s.muted}>
            {artist.genre} · {artist.followers} followers
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => followArtist(artist.name)}
          style={s.smallButton}
        >
          <Text style={s.smallButtonText}>
            {following.includes(artist.name) ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const RoomCard = ({ item }) => (
    <TouchableOpacity
      style={s.roomCard}
      onPress={() => {
        setRoom(item);
        setMessages([]);
        go("Live Room");
      }}
    >
      <View style={s.liveBadge}>
        <Text style={s.liveText}>● LIVE</Text>
      </View>
      <Text style={s.roomTitle}>{item.title}</Text>
      <Text style={s.muted}>Host: {item.host}</Text>
      <Text style={s.viewers}>👁 {item.viewers} viewers</Text>
      <Text style={s.joinText}>Tap to enter room →</Text>
    </TouchableOpacity>
  );

  const renderPage = () => {
    switch (page) {
      case "Home":
        return (
          <>
            <View style={s.hero}>
              <Text style={s.brand}>Voice<Text style={s.pink}>Star</Text></Text>
              <Text style={s.heroTitle}>Your voice. Your stage.</Text>
              <Text style={s.muted}>
                Discover artists, sing live, and let the world hear you.
              </Text>
              <View style={s.row}>
                <Button title="Explore Artists" onPress={() => go("Discover")} />
                <Button title="Go Live" onPress={() => go("Live Rooms")} secondary />
              </View>
            </View>

            <Text style={s.heading}>🔥 Trending Live Rooms</Text>
            {rooms.slice(0, 2).map((item) => (
              <RoomCard key={item.title} item={item} />
            ))}

            <Text style={s.heading}>⭐ Artists to Discover</Text>
            {artists.slice(0, 2).map((artist) => (
              <ArtistCard key={artist.name} artist={artist} />
            ))}

            <Text style={s.heading}>🎵 Latest Songs</Text>
            {publishedSongs.length === 0 ? (
              <View style={s.card}>
                <Text style={s.muted}>
                  Your published songs will appear here after you publish them.
                </Text>
              </View>
            ) : (
              publishedSongs.map((song) => (
                <View style={s.card} key={song.id}>
                  <Text style={s.cardTitle}>🎵 {song.title}</Text>
                  <Text style={s.muted}>{song.description || "New VoiceStar release"}</Text>
                </View>
              ))
            )}
          </>
        );

      case "Discover":
        return (
          <>
            <Text style={s.heading}>Discover Artists 🌟</Text>
            <Text style={s.muted}>Find your next favourite voice.</Text>
            {artists.map((artist) => (
              <ArtistCard key={artist.name} artist={artist} />
            ))}
            <Text style={s.heading}>🎶 Community Songs</Text>
            {publishedSongs.length === 0 ? (
              <Text style={s.muted}>No songs published in this session yet.</Text>
            ) : (
              publishedSongs.map((song) => (
                <View key={song.id} style={s.card}>
                  <Text style={s.cardTitle}>🎵 {song.title}</Text>
                  <Text style={s.muted}>{song.description}</Text>
                </View>
              ))
            )}
            <Button title="+ Create a Song" onPress={() => go("Artist Studio")} />
          </>
        );

      case "Live Rooms":
        return (
          <>
            <Text style={s.heading}>🔴 Live Rooms</Text>
            <Text style={s.muted}>
              Enter a room to view the demo live-room interface.
            </Text>
            {rooms.map((item) => (
              <RoomCard key={item.title} item={item} />
            ))}
            <Button
              title="+ Create Live Room"
              onPress={() => {
                setRoom({
                  host: "You",
                  title: "My Live Room",
                  viewers: "1",
                });
                setMessages([]);
                go("Live Room");
              }}
            />
          </>
        );

      case "Live Room":
        return (
          <>
            <Text style={s.heading}>🔴 LIVE ROOM</Text>
            <View style={s.stage}>
              <Text style={s.liveText}>● LIVE</Text>
              <Text style={s.stageStar}>★</Text>
              <Text style={s.heroTitle}>{room.host}</Text>
              <Text style={s.muted}>{room.title}</Text>
              <Text style={s.viewers}>👁 {room.viewers} viewers</Text>
              <View style={s.seats}>
                {["HOST", "ARTIST", "GUEST", "GUEST"].map((seat, i) => (
                  <View style={s.seat} key={i}>
                    <Text style={s.seatIcon}>{i === 0 ? "🎤" : "🎙️"}</Text>
                    <Text style={s.muted}>{seat}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={s.heading}>💬 Room Chat</Text>
            <View style={s.card}>
              {messages.length === 0 && (
                <>
                  <Text style={s.chatLine}>🌟 StarFan: Your voice is amazing!</Text>
                  <Text style={s.chatLine}>🎤 MusicLover: Can I come on stage?</Text>
                </>
              )}
              {messages.map((m, i) => (
                <Text style={s.chatLine} key={i}>💜 You: {m}</Text>
              ))}
            </View>
            <View style={s.row}>
              <TextInput
                style={[
