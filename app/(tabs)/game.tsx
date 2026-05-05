import {Animated, Button, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions, View} from 'react-native';
import {MD3DarkTheme, MD3LightTheme, PaperProvider, RadioButton} from "react-native-paper";
import React from "react";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Image} from 'expo-image'
import ScrollView = Animated.ScrollView;
import {useAuth} from "@/lib/auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

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


const App = () => {
    const {token, user} = useAuth();
    const [checked, setChecked] = React.useState('none');
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark'
        ? {...MD3DarkTheme, colors: {...MD3DarkTheme.colors, onSurface: '#FFFFFF'}}
        : MD3LightTheme;
    const [isAnswered, setIsAnswered] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState<Boolean | null>(null);
    const [currentPhoto, setCurrentPhoto] = React.useState<Photo | null>(null);
    const {width: windowWidth} = useWindowDimensions();
    const [aspectRatio, setAspectRatio] = React.useState(1);
    const [planes, setPlanes] = React.useState<Plane[]>([]);
    const [correctIndex, setCorrectIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        loadQuestion();
    }, []);

    const handlePress = async () => {
        if (isAnswered) {
            loadQuestion();
            return;
        }

        if (!user || !token || correctIndex === null) {
            console.warn("Auth or game state not ready");
            return;
        }

        const correctAnswer = answerMap[correctIndex!].plane_id.toString();
        const result = checked === correctAnswer;

        setIsCorrect(result);
        setIsAnswered(true);

        try {
            await fetch(
                `${API_BASE_URL}/stats/sendResult?userId=${user.userId}&result=${result}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (err) {
            console.error("Failed to send stats:", err);
        }
    }

    const getOptionStyle = (answer: Plane) => {
        if (!isAnswered || correctIndex === null) {
            return {};
        }

        const correctId = planes[correctIndex].plane_id.toString();
        const selectedId = checked;

        if (answer.plane_id.toString() === correctId) {
            return {backgroundColor: '#4CAF50'};
        }

        if (answer.plane_id.toString() === selectedId) {
            return {backgroundColor: '#F44336'};
        }

        return {};
    };

    const loadQuestion = async () => {
        try {
            const planeRes = await fetch(`${API_BASE_URL}/planes/getForGame`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const planeText = await planeRes.text();

            const planeData: Plane[] = planeText ? JSON.parse(planeText) : [];

            const randomIndex = Math.floor(Math.random() * planeData.length);
            const correctPlane = planeData[randomIndex];

            const photoRes = await fetch(
                `${API_BASE_URL}/photos/getRandomByPlaneId?plane_id=${correctPlane.plane_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const photoData: Photo = await photoRes.json();

            setPlanes(planeData);
            setCorrectIndex(randomIndex);
            setCurrentPhoto(photoData);

            setChecked('none');
            setIsAnswered(false);
            setIsCorrect(null);

        } catch (err) {
            console.error("Failed to load question:", err);
        }
    };

    const answerMap = planes;

    if (!currentPhoto || planes.length === 0 || correctIndex === null) {
        return (
            <SafeAreaProvider>
                <PaperProvider theme={theme}>
                    <Text>Loading...</Text>
                </PaperProvider>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <ScrollView>
                    <View
                        style={[
                            styles.card,
                            {width: windowWidth * 0.98},
                        ]}
                    >
                        {currentPhoto && (
                            <Image
                                source={{uri: currentPhoto.url}}
                                style={
                                    [styles.image,
                                        {
                                            aspectRatio: aspectRatio
                                        }]
                                }
                                onLoad={({source}) => {
                                    if (source.width && source.height) {
                                        setAspectRatio(source.width / source.height);
                                    }
                                }}
                                contentFit='contain'
                                transition={200}
                            />
                        )}
                    </View>
                    <RadioButton.Group onValueChange={checked => setChecked(checked)} value={checked}>
                        {answerMap.map((answer, index) => {
                            const correctId = planes[correctIndex!].plane_id.toString();
                            const selectedId = checked;
                            const id = answer.plane_id.toString();

                            let feedback = null;

                            if (isAnswered) {
                                if (id === correctId) {
                                    feedback = <Text style={styles.correctText}> ✅ Correct</Text>;
                                } else if (id === selectedId) {
                                    feedback = <Text style={styles.incorrectText}> ❌ Incorrect</Text>;
                                }
                            }

                            return (
                                <Pressable
                                    key={answer.plane_id}
                                    onPress={() => !isAnswered && setChecked(id)}
                                    style={({pressed}) => [
                                        styles.optionContainer,
                                        getOptionStyle(answer),
                                        styles.inlineRow,
                                        pressed && !isAnswered && {opacity: 0.7} // nice feedback
                                    ]}
                                >
                                    <RadioButton
                                        value={id}
                                        status={checked === id ? 'checked' : 'unchecked'}
                                        onPress={() => setChecked(id)}
                                        disabled={isAnswered}
                                    />

                                    <Text style={[styles.answerText, {flex: 1}]}>
                                        {answer.name}
                                        {feedback}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </RadioButton.Group>
                    <View style={styles.button}>
                        <Button
                            title={isAnswered ? "Next Question" : "Submit"}
                            onPress={handlePress}
                        />
                    </View>
                </ScrollView>
            </PaperProvider>
        </SafeAreaProvider>
    );

}

export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    optionContainer: {
        flex: 1,
        alignItems: 'flex-start',
        flexDirection: 'column',
        borderRadius: 8,
        marginVertical: 4,
        marginHorizontal: 10,
        paddingHorizontal: 4,
    },
    button: {
        marginHorizontal: 10
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    answerText: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    correctText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    incorrectText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    card: {
        margin: 8,
        backgroundColor: '#2c2c2e',
        borderRadius: 12,
        padding: 10,
        elevation: 3,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    image: {
        width: '100%',
        borderRadius: 8,
    },
});
