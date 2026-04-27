import {Animated, Button, StyleSheet, useColorScheme, useWindowDimensions, View} from 'react-native';
import {MD3DarkTheme, MD3LightTheme, PaperProvider, RadioButton} from "react-native-paper";
import React, {useEffect} from "react";
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
    {plane_id: 6, name: "Bombardier Challenger 650"}
]

const photoList: Photo[] = [
    {plane_id: 1, url: "https://cdn.jetphotos.com/full/2/15190_1063675846.jpg"},
    {plane_id: 2, url: "https://cdn.jetphotos.com/full/6/52128_1655584941.jpg"},
    {
        plane_id: 3,
        url: "https://upload.wikimedia.org/wikipedia/commons/6/64/McDonnell_Douglas_MD-83_American_Airlines_N9615W_%288516015305%29.jpg"
    },
    {
        plane_id: 4,
        url: "https://i0.wp.com/northwestairlineshistory.org/wp-content/uploads/2020/04/NWA_753_N591NW_MSP_2009-03_Norris.jpg"
    },
    {
        plane_id: 5,
        url: "https://static0.simpleflyingimages.com/wordpress/wp-content/uploads/2021/02/French-bee-Airbus-A350-941-F-HREV-2-scaled.jpg"
    },
    {
        plane_id: 6,
        url: "https://chapmanfreeborn.aero/wp-content/uploads/2025/01/Bombardier-Challenger-650-feature-image.jpg"
    }
]

const App = () => {
    const [checked, setChecked] = React.useState('none');
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark'
        ? {...MD3DarkTheme, colors: {...MD3DarkTheme.colors, onSurface: '#FFFFFF'}}
        : MD3LightTheme;

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

    const [answers, setAnswers] = React.useState(getAnswers());
    const [correct, setCorrect] = React.useState(pickPlane(answers));

    const handlePress = () => {
        const correctAnswer = answerMap[correct].name;

        if (checked === correctAnswer) {
            console.log("Correct");
        } else {
            console.log("Incorrect");
        }
    }

    let answerMap: Plane[] = []
    answers.forEach((answer) => {
        answerMap.push(planeList[answer]);
    })

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <ScrollView>
                    <AutoHeightImage
                        source={{uri: photoList[answers[correct]].url}}
                        width={useWindowDimensions().width}
                    />
                    <RadioButton.Group onValueChange={checked => setChecked(checked)} value={checked}>
                        <View style={styles.optionContainer}>
                            {answerMap.map((answer, index) => (
                                <RadioButton.Item
                                    key={answer.plane_id}
                                    value={answer.name}
                                    label={answer.name}
                                    position="leading"
                                />
                            ))}
                        </View>
                    </RadioButton.Group>
                    <View style={styles.button}>
                        <Button
                            title="Submit"
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
    },
    button: {
        marginHorizontal: 10
    }
});
