import {Image, ImageBackground} from 'expo-image';
import {Pressable, StyleSheet, TextInput} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {router} from "expo-router";
import {useEffect, useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
    // Initial value is inputUrl with '' and if there are changes setInputUrl will be used
    const [inputUrl, setInputUrl] = useState('');
    const [backgroundUrl, setBackgroundUrl] = useState('');

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

    return (
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
                    <ThemedText type="subtitle" style={styles.nameStyle}>testemail@csumb.edu</ThemedText>
                    <ThemedText style={styles.nameStyle}>testUserName</ThemedText>
                </ThemedView>

                <TextInput
                    style={styles.input}
                    placeholder="Paste image URL here"
                    value={inputUrl}
                    onChangeText={setInputUrl}
                    autoCapitalize="none"
                />
                <Pressable
                    style={styles.buttonSecondary}
                    onPress={() => router.back()}
                >
                    <ThemedText style={styles.buttonText}>Edit Name</ThemedText>
                </Pressable>
                <Pressable
                    style={styles.buttonSecondary}
                    onPress={saveBackground}
                >
                    <ThemedText style={styles.buttonText}>Change Profile Background</ThemedText>
                </Pressable>
            </ThemedView>
        </ImageBackground>
    );
}

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
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});