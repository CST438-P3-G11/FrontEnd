import { Image } from 'expo-image';
import {Pressable, StyleSheet} from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {router} from "expo-router";


export default function HomeScreen() {
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
});
