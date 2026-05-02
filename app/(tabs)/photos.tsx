import {useAuth} from "@/lib/auth";
import {Button, MD3DarkTheme, MD3LightTheme, PaperProvider} from "react-native-paper";
import {Alert, ScrollView, StyleSheet, Text, useColorScheme, useWindowDimensions, View, Platform} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";
import React from "react";
import {Image} from 'expo-image'

interface Plane {
    plane_id: number;
    user_id: number;
    name: string;
}

interface Photo {
    photo_id: number;
    user_id: number;
    plane_id: number;
    url: string;
}

const API_BASE_URL = process.env.EXPO_API_BASE_URL ?? 'http://localhost:8080';

const App = () => {
    const {token, user} = useAuth();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark'
        ? {...MD3DarkTheme, colors: {...MD3DarkTheme.colors, onSurface: '#FFFFFF'}}
        : MD3LightTheme;
    const {width: windowWidth} = useWindowDimensions();
    const [aspectRatio, setAspectRatio] = React.useState(1);
    const userId = user?.userId;
    const [photos, setPhotos] = React.useState<Photo[]>([]);
    const [planes, setPlanes] = React.useState<Record<number, Plane>>({});

    React.useEffect(() => {
        loadUserPhotos()
    }, [])

    const loadUserPhotos = async () => {
        try {
            const photoRes = await fetch(`${API_BASE_URL}/photos/getByUserId?user_id=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const photoData: Photo[] = await photoRes.json();
            setPhotos(photoData);

            const uniquePlaneIds: number[] = [
                ...new Set(photoData.map((p) => p.plane_id)),
            ];

            const missingPlaneIds = uniquePlaneIds.filter(
                (id) => !planes[id]
            );

            await Promise.all(
                missingPlaneIds.map(async (planeId) => {
                    try {
                        const res = await fetch(
                            `${API_BASE_URL}/planes/getById?plane_id=${planeId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        const plane: Plane = await res.json();

                        setPlanes((prev) => ({
                            ...prev,
                            [planeId]: plane,
                        }));
                    } catch (err) {
                        console.error(`Failed to load plane ${planeId}:`, err);
                    }
                })
            );
        } catch (err) {
            console.error("Failed to load photos:" + err);
        }
    }

    const confirmDelete = (photoId: number) => {
        if (Platform.OS === 'web') {
            const ok = window.confirm("Are you sure you want to delete this photo?");
            if (ok) {
                deletePhoto(photoId);
            }
            return;
        }
        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo?',
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Delete', style: 'destructive', onPress: () => deletePhoto(photoId)},
            ]
        );
    };

    const deletePhoto = async (photoId: number) => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/photos/deletePhoto/${photoId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            if (!res.ok) {
                throw new Error(`Delete failed with status ${res.status}`);
            }

            setPhotos((prev) =>
                prev.filter((p) => p.photo_id !== photoId)
            );
        } catch (err) {
            console.error(`Failed to delete photo:`, err);
        }
    };


    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Text style={styles.pageTitle}>My Photos</Text>
                        <Button
                            mode='contained'
                            buttonColor='#2e7d32'
                            textColor='white'
                            labelStyle={styles.addLabel}
                        >
                            Add Photo
                        </Button>
                    </View>
                    {photos.map((photo, index) => {
                        return (
                            <View
                                key={photo.photo_id}
                                style={[styles.card, {width: windowWidth * 0.95}]}
                            >
                                <Text style={styles.title}>
                                    {planes[photo.plane_id]?.name ?? 'Loading...'}
                                </Text>
                                <Image
                                    source={{uri: photo.url}}
                                    style={[styles.image, {aspectRatio}]}
                                    onLoad={({source}) => {
                                        if (source.width && source.height) {
                                            setAspectRatio(source.width / source.height);
                                        }
                                    }}
                                    contentFit='cover'
                                />

                                <Button
                                    mode="contained"
                                    onPress={() => confirmDelete(photo.photo_id)}
                                    style={styles.deleteButton}
                                    buttonColor="#b00020"
                                    textColor="white"
                                    labelStyle={styles.deleteLabel}
                                >
                                    Delete Photo
                                </Button>
                            </View>
                        );
                    })}
                </ScrollView>
            </PaperProvider>
        </SafeAreaProvider>
    );
}

export default App;

const styles = StyleSheet.create({
    scrollContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    card: {
        marginVertical: 10,
        backgroundColor: '#2c2c2e',
        borderRadius: 12,
        padding: 10,

        elevation: 3,
    },
    image: {
        width: '100%',
        borderRadius: 8,
    },
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    deleteButton: {
        marginTop: 10,
        width: '100%',
    },
    deleteLabel: {
        fontSize: 16,
        fontWeight: '400',
    },
    header: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF26',
    },
    pageTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '700',
    },
    addLabel: {
        fontSize: 16,
        fontWeight: '400',
    }
});