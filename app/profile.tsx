import {Image, ImageBackground} from 'expo-image';
import { Pressable, StyleSheet, TextInput, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, router } from 'expo-router';
import {useEffect, useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/lib/auth';

function HeaderUser() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    const initial = (user.email?.[0] ?? '?').toUpperCase();

    return (
        <View style={headerStyles.row}>
            <Pressable
                onPress={() => router.push('/profile')}
                style={headerStyles.avatar}
                accessibilityLabel={`Profile for ${user.email}`}
            >
                <Text style={headerStyles.avatarText}>{initial}</Text>
            </Pressable>

            <Pressable
                onPress={async () => {
                    await signOut();
                    router.replace('/login');
                }}
                style={({ pressed }) => [
                    headerStyles.signOut,
                    pressed && { opacity: 0.6 },
                ]}
            >
                <Text style={headerStyles.signOutText}>Sign out</Text>
            </Pressable>
        </View>
    );
}


export default function ProfileScreen() {
    const { user, token, signOut } = useAuth();

    // Initial value is inputUrl with '' and if there are changes setInputUrl will be used
    const [inputUrl, setInputUrl] = useState('');
    const [backgroundUrl, setBackgroundUrl] = useState('');

    // For changing Name
    const [name, setName] = useState('');
    const [nameInput, setNameInput] = useState('');

    // For background
    useEffect(() => {
        loadBackground();
    }, []);

    const loadBackground = async () => {
        try {
            const savedUrl = await AsyncStorage.getItem('profileBackgroundUrl');
            if (savedUrl) {
                setBackgroundUrl(savedUrl);
            }
        } catch (error) {
            console.log('Error loading background:', error);
        }
    };

    const saveBackground = async () => {
        try {
            await AsyncStorage.setItem('profileBackgroundUrl', inputUrl);
            setBackgroundUrl(inputUrl);
        } catch (error) {
            console.log('Error saving background:', error);
        }
    };

    // For update name or not
    useEffect(() => {
        if (!user?.email || !token) return;

        const loadProfile = async () => {
            try {
                const res = await fetch(
                    `https://backend-eu81.onrender.com/user/currentUser`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(`Failed to load profile: ${res.status}`);
                }

                const data = await res.json();

                setName(data.name ?? '');
                setNameInput(data.name ?? '');
                console.log('Current user from backend:', data);
            } catch (error) {
                console.log('Error loading profile:', error);
            }
        };

        loadProfile();
    }, [user?.email, token]);

    const saveName = async () => {
        if (!user?.email || !token) return;

        try {
            const res = await fetch(
                `https://backend-eu81.onrender.com/user/updateName`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: nameInput,
                }
            );

            if (!res.ok) {
                throw new Error(`Failed to update name: ${res.status}`);
            }

            const data = await res.json();

            setName(data.name ?? nameInput);
        } catch (error) {
            console.log('Error saving name:', error);
        }
    };

    return (
        // This is for the top bar, to show header, since it's outside the tabs folder
        <>
            <Stack.Screen
                options={{
                    title: 'Profile',
                    headerRight: () => <HeaderUser />,
                }}
            />

            <ImageBackground
                source={
                    backgroundUrl
                        ? { uri: backgroundUrl }
                        : require('@/assets/images/default-background.png')
                }
                style={styles.background}
                imageStyle={styles.backgroundImage}
                /*Stretches the image to cover the entire screen, basically fitting it~~*/
                contentFit={'fill'}
            >

                <ThemedView style = {styles.container}>
                    {/*Inline Styling example*/}
                    <ThemedText type = 'title' style={{color : 'white', fontWeight : 900}}>
                        Profile
                    </ThemedText>

                    <ThemedView style={styles.infoSection}>
                        <ThemedText type="subtitle" style={styles.nameStyle}>{user?.email ?? 'Not signed in'}</ThemedText>
                        <ThemedText style={styles.nameStyle}>{user?.isAdmin ? 'Admin' : 'Member'}</ThemedText>
                        <ThemedText style={styles.nameStyle}>{name || 'No Name'}</ThemedText>
                    </ThemedView>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter New Name"
                        value={nameInput}
                        onChangeText={setNameInput}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Paste image URL here"
                        value={inputUrl}
                        onChangeText={setInputUrl}
                        autoCapitalize="none"
                    />
                    <Pressable
                        style={styles.buttonSecondary}
                        onPress={saveName}
                    >
                        <ThemedText style={styles.buttonText}>Change Name</ThemedText>
                    </Pressable>

                    <Pressable
                        style={styles.buttonSecondary}
                        onPress={saveBackground}
                    >
                        <ThemedText style={styles.buttonText}>Change Profile Background</ThemedText>
                    </Pressable>

                    {/*<Pressable*/}
                    {/*    style={styles.buttonDanger}*/}
                    {/*    onPress={async () => {*/}
                    {/*        await signOut();*/}
                    {/*        router.replace('/login');*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <ThemedText style={styles.buttonText}>Sign out</ThemedText>*/}
                    {/*</Pressable>*/}
                </ThemedView>
            </ImageBackground>
        </>
    )

};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        resizeMode: 'cover',
    },
    container: {
        // flex: 1,
        width: 300,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'transparent',
        backgroundColor: 'rgba(0, 0, 0, 0.66)',
        borderRadius: 16,
    },
    infoSection: {
        alignItems: 'center',
        padding: 18,
        backgroundColor: 'transparent',
    },
    nameStyle: {
        paddingTop: 12,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'red',
        textShadowOffset: { width: 3, height: 4 },
        textShadowRadius: 2,
    },
    input: {
        width: 260,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    buttonSecondary: {
        backgroundColor: '#1d72ff',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginBottom: 12,
        marginTop: 20,
        width: 260,
        alignItems: 'center',
    },
    buttonDanger: {
        backgroundColor: '#B00020',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginBottom: 12,
        marginTop: 20,
        width: 260,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

// For Header Style
const headerStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginRight: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    signOut: {
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    signOutText: {
        color: '#B00020',
        fontWeight: '600',
        fontSize: 14,
    },
});