import {Animated, Button, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions, View} from 'react-native';
import {MD3DarkTheme, MD3LightTheme, PaperProvider, RadioButton} from "react-native-paper";
import React from "react";
import AutoHeightImage from "react-native-auto-height-image";
import {SafeAreaProvider} from "react-native-safe-area-context";
import ScrollView = Animated.ScrollView;

interface Plane {
    plane_id: number;
    name: string;
}

interface Photo {
    plane_id: number;
    url: string;
}

const planeList: Plane[] = [
    {plane_id: 1, name: "Airbus A320"},
    {plane_id: 2, name: "Boeing 737-800"},
    {plane_id: 3, name: "McDonnell Douglas MD-83"},
    {plane_id: 4, name: "Boeing 757-300"},
    {plane_id: 5, name: "Airbus A350-900"},
    {plane_id: 6, name: "Bombardier Challenger 650"},
    {plane_id: 7, name: "Boeing 747-400"},
    {plane_id: 8, name: "Lockheed L-1011-500 TriStar"},
    {plane_id: 9, name: "Douglas DC-9-50"},
    {plane_id: 10, name: "Airbus A321neo"},
]

const photoList: Photo[] = [
    {
        plane_id: 1,
        url: "https://cdn.jetphotos.com/full/2/15190_1063675846.jpg"
    },
    {
        plane_id: 1,
        url: "https://www.aviationtoday.com/wp-content/uploads/2015/12/VirginAmericaInFlight3.jpg"
    },
    {
        plane_id: 2,
        url: "https://cdn.jetphotos.com/full/6/52128_1655584941.jpg"
    },
    {
        plane_id: 2,
        url: "https://live.staticflickr.com/4857/46193514174_460d9e865d_b.jpg"
    },
    {
        plane_id: 3,
        url: "https://cdn.plnspttrs.net/41425/n564aa-american-airlines-mcdonnell-douglas-md-83-dc-9-83_PlanespottersNet_330634_bab0fa61d3_o.jpg"
    },
    {
        plane_id: 4,
        url: "https://i0.wp.com/northwestairlineshistory.org/wp-content/uploads/2020/04/NWA_753_N591NW_MSP_2009-03_Norris.jpg"
    },
    {
        plane_id: 4,
        url: "https://cdn.jetphotos.com/full/1/47084_1158327251.jpg"
    },
    {
        plane_id: 5,
        url: "https://static0.simpleflyingimages.com/wordpress/wp-content/uploads/2021/02/French-bee-Airbus-A350-941-F-HREV-2-scaled.jpg"
    },
    {
        plane_id: 6,
        url: "https://chapmanfreeborn.aero/wp-content/uploads/2025/01/Bombardier-Challenger-650-feature-image.jpg"
    },
    {
        plane_id: 7,
        url: "https://i.insider.com/58b9eb7ebe967321028b4c81"
    },
    {
        plane_id: 8,
        url: "https://deltamuseum.org/images/default-source/research/aircraft-by-type/jets/lockheed-l-1011-1973-2001/l-1011-500-mountains.jpg"
    },
    {
        plane_id: 9,
        url: "https://cdn.jetphotos.com/full/1/61610_1191969628.jpg"
    },
    {
        plane_id: 10,
        url: "https://global.discourse-cdn.com/infiniteflight/original/4X/b/d/9/bd95f601c511567fb78762a301ca5eff88f8919d.jpeg"
    }
]

//temporary functions to get a random ID from the list, remove/comment out once we're properly fetching from the backend
const getAnswers = () => {
    let answers: number[] = [];
    while (answers.length <= 3) {
        let num = Math.floor(Math.random() * planeList.length);
        while (answers.includes(num)) {
            num = Math.floor(Math.random() * planeList.length);
        }
        answers.push(num)
    }
    return answers;
}

//same as getAnswers
const pickPlane = (answers: string | any[]) => {
    return Math.floor(Math.random() * answers.length);
}

const App = () => {
    const [checked, setChecked] = React.useState('none');
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark'
        ? {...MD3DarkTheme, colors: {...MD3DarkTheme.colors, onSurface: '#FFFFFF'}}
        : MD3LightTheme;
    const [answers, setAnswers] = React.useState(getAnswers());
    const [correct, setCorrect] = React.useState(pickPlane(answers));
    const [isAnswered, setIsAnswered] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState<Boolean | null>(null);
    const [currentPhoto, setCurrentPhoto] = React.useState<Photo | null>(null);
    const {width} = useWindowDimensions();

    React.useEffect(() => {
        const plane = planeList[answers[correct]];
        setCurrentPhoto(pickRandomPhoto(plane.plane_id));
    }, []);

    const handlePress = () => {
        if (isAnswered) {
            const nextAnswers = getAnswers();
            const nextCorrect = pickPlane(nextAnswers);

            setAnswers(nextAnswers);
            setCorrect(nextCorrect);

            const nextPlane = planeList[nextAnswers[nextCorrect]];
            setCurrentPhoto(pickRandomPhoto(nextPlane.plane_id));

            setChecked('none');
            setIsAnswered(false);
            setIsCorrect(null);
            return;
        }

        const correctAnswer = answerMap[correct].plane_id.toString();
        const result = checked === correctAnswer;

        setIsCorrect(result);
        setIsAnswered(true);
    }

    const getOptionStyle = (answer: Plane) => {
        if (!isAnswered) {
            return {};
        }

        const correctId = answerMap[correct].plane_id.toString();
        const selectedId = checked;

        if (answer.plane_id.toString() === correctId) {
            return {backgroundColor: '#4CAF50'};
        }

        if (answer.plane_id.toString() === selectedId) {
            return {backgroundColor: '#F44336'};
        }

        return {};
    }

    const getOptionLabel = (answer: Plane) => {
        if (!isAnswered) {
            return null;
        }

        const correctId = answerMap[correct].plane_id.toString();
        const selectedId = checked;
        const id = answer.plane_id.toString();

        if (id === correctId) {
            return "Correct!";
        }
        if (id === selectedId) {
            return "Incorrect!";
        }

        return null;
    }

    let answerMap: Plane[] = []
    answers.forEach((answer) => {
        answerMap.push(planeList[answer]);
    })

    const correctPlane = answerMap[correct];

    const correctPhotos = photoList.filter(
        (photo) => photo.plane_id === correctPlane.plane_id
    );

    const pickRandomPhoto = (planeId: number) => {
        const photos = photoList.filter(p => p.plane_id === planeId);
        return photos[Math.floor(Math.random() * photos.length)];
    };

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <ScrollView>
                    {currentPhoto && (
                        <AutoHeightImage
                            source={{ uri: currentPhoto.url }}
                            width={width}
                        />
                    )}
                    <RadioButton.Group onValueChange={checked => setChecked(checked)} value={checked}>
                        {answerMap.map((answer, index) => {
                            const correctId = answerMap[correct].plane_id.toString();
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
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    incorrectText: {
        color: '#C62828',
        fontWeight: 'bold',
    },
});
