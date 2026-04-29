import { Image } from 'expo-image';
import {Pressable, StyleSheet} from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {router} from "expo-router";
import { useState, useEffect } from 'react';

type LeaderboardEntry = {
    user: { username: string };
    bestStreak: number;
  };
export default function HomeScreen() {
  
  // TODO: replace hardcoded data with fetch from /getLeaderboard when backend is ready

  // const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  // useEffect(() => {
  //   fetch('https://backend-eu81.onrender.com/getLeaderboard')
  //     .then(res => res.json())
  //     .then(data => setLeaderboard(data));
  // }, []);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { user: { username: "ace_spotter" }, bestStreak: 15 },
    { user: { username: "planeguy99" }, bestStreak: 12 },
    { user: { username: "jetfan42" }, bestStreak: 9 },
    { user: { username: "planeguy94" }, bestStreak: 8 },
    { user: { username: "jetfan40" }, bestStreak: 4 },
    { user: { username: "planeguy92" }, bestStreak: 2 },
    { user: { username: "jetfan38" }, bestStreak: 1 },
  ]);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/logo_plane.png')}
          style={styles.reactLogo}
          contentFit = "contain"
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">PlanespOtter ✈️</ThemedText>

        <Pressable
            style={styles.button}
            >
          {/*onPress={() => router.push('/game')*/}
          <ThemedText style={styles.buttonText}>Play Game</ThemedText>
        </Pressable>

        <Pressable
            style={styles.buttonSecondary}
            onPress={() => router.push('/profile')}
            >
          <ThemedText style={styles.buttonText}>Profile</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">Top Players</ThemedText>

        {leaderboard.map((player, index) => (
          <ThemedView key={index} style={styles.leaderboardRow}>
            <ThemedText>#{index + 1}</ThemedText>
            <ThemedText>{player.user.username}</ThemedText>
            <ThemedText>{player.bestStreak}</ThemedText>
          </ThemedView>
        ))}

      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    // justifyContent: 'center',
    gap: 8,

  },
  reactLogo: {
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#1d72ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginBottom: 12,
    marginTop: 20,
    width: 220,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#2a2f36',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    width: 220,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  }
});
