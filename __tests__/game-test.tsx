import React from "react";
import { render } from '@testing-library/react-native';
import App from '../app/(tabs)/game';

jest.mock('../lib/auth', () => ({
    useAuth: () => ({
        token: 'fake-token',
        user: { userId: 1 },
    }),
}));

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');

    const inset = { top: 0, bottom: 0, left: 0, right: 0 };

    const SafeAreaInsetsContext = React.createContext(inset);

    return {
        SafeAreaProvider: ({ children }: any) => children,
        SafeAreaInsetsContext,
        SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
        useSafeAreaInsets: () => inset,
    };
});

jest.mock('expo-image', () => ({
    Image: 'Image',
}));

jest.mock('react-native-paper', () => {
    const actual = jest.requireActual('react-native-paper');
    return {
        ...actual,
        Portal: ({ children }: any) => children,
    };
});

describe('Game', () => {
    beforeEach(() => {
        const values = [0.1, 0.2, 0.3, 0.4, 0.5];
        let i = 0;

        jest.spyOn(global.Math, 'random').mockImplementation(() => {
            const value = values[i % values.length];
            i++;
            return value;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders plane answer text', async () => {
        const { findByText } = render(<App />);

        const option = await findByText('Submit');

        expect(option).toBeTruthy();
    });
})