import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/auth';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithGitHub, isLoading, error } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PlaneSpotter</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <Pressable
        style={({ pressed }) => [styles.button, styles.google, pressed && styles.pressed]}
        onPress={signInWithGoogle}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.button, styles.github, pressed && styles.pressed]}
        onPress={signInWithGitHub}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Continue with GitHub</Text>
      </Pressable>

      {isLoading && <ActivityIndicator style={styles.spinner} />}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16, opacity: 0.7, marginBottom: 24 },
  button: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  google: { backgroundColor: '#4285F4' },
  github: { backgroundColor: '#24292F' },
  pressed: { opacity: 0.8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  spinner: { marginTop: 16 },
  error: { color: '#B00020', marginTop: 16, textAlign: 'center' },
});
