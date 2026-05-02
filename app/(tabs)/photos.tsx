import {useAuth} from "@/lib/auth";
import {Button, MD3DarkTheme, MD3LightTheme, PaperProvider, Dialog, Portal, TextInput} from "react-native-paper";
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
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [newPhotoUrl, setNewPhotoUrl] = React.useState('');
    const [newPlaneName, setNewPlaneName] = React.useState('');

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

    const addPhoto = async (planeName: string, photoUrl: string) => {
        try {
            if (!userId) throw new Error("User not authenticated");

            let planeId: number;

            const res = await fetch(
                `${API_BASE_URL}/planes/getByName?name=${planeName}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.ok) {
                const plane: Plane[] = await res.json();
                planeId = plane[0].plane_id;
                setPlanes((prev) => ({
                    ...prev,
                    [planeId]: plane[0],
                }));
            } else if (res.status === 404) {
                const newPlane = {
                    plane_id: 0,
                    user_id: userId,
                    name: planeName,
                };

                const addPlaneRes = await fetch(
                    `${API_BASE_URL}/planes/addPlane`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(newPlane),
                    }
                );

                if (!addPlaneRes.ok) {
                    throw new Error("Failed to add plane");
                }

                const createdPlaneRes = await fetch(
                    `${API_BASE_URL}/planes/getByName?name=${planeName}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!createdPlaneRes.ok) {
                    throw new Error("Failed to fetch created plane");
                }

                const createdPlane: Plane[] = await createdPlaneRes.json();
                planeId = createdPlane[0].plane_id;
                setPlanes((prev) => ({
                    ...prev,
                    [planeId]: createdPlane[0],
                }));
            } else {
                throw new Error(`Failed to fetch plane: ${res.status}`);
            }

            const newPhoto = {
                photo_id: 0,
                user_id: userId,
                plane_id: planeId,
                url: photoUrl,
            };

            const addPhotoRes = await fetch(
                `${API_BASE_URL}/photos/addPhoto`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newPhoto),
                }
            );

            if (!addPhotoRes.ok) {
                throw new Error("Failed to add photo");
            }

            const createdPhoto: Photo = await addPhotoRes.json();

            setPhotos((prev) => [createdPhoto, ...prev]);

        } catch (err) {
            console.error("Failed to add photo:", err);
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
                            onPress={() => setAddDialogVisible(true)}
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

                <Portal>
                    <Dialog
                        visible={addDialogVisible}
                        onDismiss={() => setAddDialogVisible(false)}
                    >
                        <Dialog.Title>Add Photo</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                                label='Plane Name'
                                value={newPlaneName}
                                onChangeText={setNewPlaneName}
                                style={{marginBottom: 10}}
                            />

                            <TextInput
                                label='Photo URL'
                                value={newPhotoUrl}
                                onChangeText={setNewPhotoUrl}
                            />
                        </Dialog.Content>

                        <Dialog.Actions>
                            <Button onPress={() => setAddDialogVisible(false)}>
                                Cancel
                            </Button>

                            <Button
                                onPress={() => {
                                    addPhoto(newPlaneName, newPhotoUrl);
                                    setAddDialogVisible(false);
                                }}
                            >
                                Submit
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
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