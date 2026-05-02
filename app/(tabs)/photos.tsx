import {useAuth} from "@/lib/auth";
import {MD3DarkTheme, MD3LightTheme, PaperProvider} from "react-native-paper";
import {Animated, useColorScheme, useWindowDimensions} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";
import ScrollView = Animated.ScrollView;
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
            const photoData = await photoRes.json();
            setPhotos(photoData);
        } catch (err) {
            console.error("Failed to load photos:" + err);
        }
    }


    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <ScrollView>
                    {photos.map((photo, index) => {

                        return (
                            <Image
                                key={photo.plane_id}
                                source={{uri: photo.url}}
                                style={{
                                    width: windowWidth,
                                    aspectRatio: aspectRatio,
                                }}
                                onLoad={({source}) => {
                                    if (source.width && source.height) {
                                        setAspectRatio(source.width / source.height);
                                    }
                                }}
                                contentFit='contain'
                            />
                        );
                    })}
                </ScrollView>
            </PaperProvider>
        </SafeAreaProvider>
    );
}

export default App;