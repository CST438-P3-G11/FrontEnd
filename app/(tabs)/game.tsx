import {Animated, Button, StyleSheet, useColorScheme, useWindowDimensions, View} from 'react-native';
import {MD3DarkTheme, MD3LightTheme, PaperProvider, RadioButton} from "react-native-paper";
import React from "react";
import AutoHeightImage from "react-native-auto-height-image";
import {SafeAreaProvider} from "react-native-safe-area-context";
import ScrollView = Animated.ScrollView;

const App = () => {
    const [checked, setChecked] = React.useState('none');
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark'
        ? {...MD3DarkTheme, colors: {...MD3DarkTheme.colors, onSurface: '#FFFFFF'}}
        : MD3LightTheme;
    const [pressed, setPressed] = React.useState(false);

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <ScrollView>
                    <AutoHeightImage
                        source={{uri: 'https://i.imgur.com/yiT90vB.jpeg'}}
                        width={useWindowDimensions().width}
                    />
                    <RadioButton.Group onValueChange={checked => setChecked(checked)} value={checked}>
                        <View style={styles.optionContainer}>
                            <RadioButton.Item
                                value="first"
                                label="Embraer 175"
                                position="leading"
                            />
                            <RadioButton.Item
                                value="second"
                                label="Airbus A220"
                                position="leading"
                            />
                            <RadioButton.Item
                                value="third"
                                label="Bombardier CRJ-900"
                                position="leading"
                            />
                            <RadioButton.Item
                                value="fourth"
                                label="Dassault Falcon 900"
                                position="leading"
                            />
                        </View>
                    </RadioButton.Group>
                    <View style={styles.button}>
                        <Button title="Submit"/>
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
