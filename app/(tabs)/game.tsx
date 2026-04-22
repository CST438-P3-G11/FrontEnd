import {Image} from 'expo-image';
import {Animated, StyleSheet, useWindowDimensions, View} from 'react-native';
import {RadioButton, useTheme} from "react-native-paper";
import React from "react";
import ScrollView = Animated.ScrollView;
import AutoHeightImage from "react-native-auto-height-image";

const App = () => {
    const [checked, setChecked] = React.useState('first');
    const {colors} = useTheme();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AutoHeightImage
                source={{uri: 'https://i.imgur.com/yiT90vB.jpeg'}}
                width={ useWindowDimensions().width }
            />
            <RadioButton.Group onValueChange={checked => setChecked(checked)} value={checked}>
                <View style={styles.optionContainer}>
                    <RadioButton.Item
                        value="first"
                        label="Embraer 175"
                        position="leading"
                        labelStyle={{color: colors.onSurface}}
                    />
                    <RadioButton.Item
                        value="second"
                        label="Airbus A220"
                        position="leading"
                        labelStyle={{color: colors.onSurface}}
                    />
                    <RadioButton.Item
                        value="third"
                        label="Bombardier CRJ-900"
                        position="leading"
                        labelStyle={{color: colors.onSurface}}
                    />
                    <RadioButton.Item
                        value="fourth"
                        label="Dassault Falcon 900"
                        position="leading"
                        labelStyle={{color: colors.onSurface}}
                    />
                </View>
            </RadioButton.Group>
        </ScrollView>
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
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'column',
    }
});
