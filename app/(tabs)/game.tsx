import {Image} from 'expo-image';
import {Animated, Platform, StyleSheet} from 'react-native';

import ScrollView = Animated.ScrollView;



export default function GameScreen() {
    return (
        <ScrollView>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
