import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../lib/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type Stats = {
  gamesPlayed: number;
  correctGuesses: number;
  winningStreak: number;
  bestStreak: number;
};

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const userId = user?.userId;

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/stats/getStats?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Stats not found');
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  const winRate = stats && stats.gamesPlayed > 0
    ? Math.round((stats.correctGuesses / stats.gamesPlayed) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Stats</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Games Played</Text>
        <Text style={styles.value}>{stats?.gamesPlayed}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Correct Guesses</Text>
        <Text style={styles.value}>{stats?.correctGuesses}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Win Rate</Text>
        <Text style={styles.value}>{winRate}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Current Streak</Text>
        <Text style={styles.value}>{stats?.winningStreak} 🔥</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Best Streak</Text>
        <Text style={styles.value}>{stats?.bestStreak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 16, color: '#555' },
  value: { fontSize: 20, fontWeight: 'bold' },
  error: { flex: 1, textAlign: 'center', marginTop: 40, color: 'red' },
});