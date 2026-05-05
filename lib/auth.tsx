import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? '';

const TOKEN_KEY = 'planespotter.jwt';
const USER_KEY = 'planespotter.user';

const githubDiscovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/' + GITHUB_CLIENT_ID,
};

export type AuthUser = {
  userId: number;
  email: string;
  isAdmin: boolean | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// SecureStore on native, localStorage on web (SecureStore is unsupported on web).
const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount.
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          storage.get(TOKEN_KEY),
          storage.get(USER_KEY),
        ]);
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        // Ignore restore errors; user just needs to log in again.
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (jwt: string, who: AuthUser) => {
    setToken(jwt);
    setUser(who);
    await Promise.all([
      storage.set(TOKEN_KEY, jwt),
      storage.set(USER_KEY, JSON.stringify(who)),
    ]);
  }, []);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    setError(null);
    await Promise.all([storage.remove(TOKEN_KEY), storage.remove(USER_KEY)]);
  }, []);

  const exchange = useCallback(
    async (provider: 'google' | 'github', body: Record<string, string>) => {
      const res = await fetch(`${API_BASE_URL}/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`Backend rejected ${provider} auth (${res.status})`);
      }
      const data = (await res.json()) as { token: string; user: AuthUser };
      await persist(data.token, data.user);
    },
    [persist],
  );

  // --- Google ---
  // responseType 'id_token' forces the implicit flow so Google returns the
  // ID token directly to the browser. expo-auth-session adds a nonce for us.
  // androidClientId is used when running as a native Android build; falls back
  // to webClientId via the Expo proxy when undefined (e.g. in Expo Go).
  const [googleRequest, googleResponse, googlePrompt] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.IdToken,
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken =
        googleResponse.params.id_token ?? googleResponse.authentication?.idToken;
      if (idToken) {
        setIsLoading(true);
        exchange('google', { idToken })
          .catch((e) => setError(e.message))
          .finally(() => setIsLoading(false));
      } else {
        // Help future-us debug if the response shape changes.
        console.warn('Google response had no id_token. Params:', googleResponse.params);
        setError('Google did not return an ID token. See console for details.');
      }
    } else if (googleResponse?.type === 'error') {
      setError(googleResponse.error?.message ?? 'Google sign-in failed');
    }
  }, [googleResponse, exchange]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!googleRequest) {
      setError('Google sign-in is not ready yet');
      return;
    }
    await googlePrompt();
  }, [googleRequest, googlePrompt]);

  // --- GitHub ---
  const githubRedirectUri = AuthSession.makeRedirectUri({ scheme: 'planespotter' });
  const [githubRequest, githubResponse, githubPrompt] = AuthSession.useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      scopes: ['read:user', 'user:email'],
      redirectUri: githubRedirectUri,
      usePKCE: false,
    },
    githubDiscovery,
  );

  useEffect(() => {
    if (githubResponse?.type === 'success' && githubResponse.params.code) {
      setIsLoading(true);
      exchange('github', {
        code: githubResponse.params.code,
        redirectUri: githubRedirectUri,
      })
        .catch((e) => setError(e.message))
        .finally(() => setIsLoading(false));
    } else if (githubResponse?.type === 'error') {
      setError(githubResponse.error?.message ?? 'GitHub sign-in failed');
    }
    // githubRedirectUri is stable per-render
  }, [githubResponse, exchange, githubRedirectUri]);

  const signInWithGitHub = useCallback(async () => {
    setError(null);
    if (!githubRequest) {
      setError('GitHub sign-in is not ready yet');
      return;
    }
    await githubPrompt();
  }, [githubRequest, githubPrompt]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isReady,
      error,
      signInWithGoogle,
      signInWithGitHub,
      signOut,
    }),
    [user, token, isLoading, isReady, error, signInWithGoogle, signInWithGitHub, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
