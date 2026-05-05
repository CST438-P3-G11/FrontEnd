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

global.fetch = jest.fn((url) => {
    if (url.includes('/planes/getForGame')) {
        return Promise.resolve({
            text: () =>
                Promise.resolve(JSON.stringify([
                    { plane_id: 1, user_id: 1, name: 'Boeing 747' },
                    { plane_id: 2, user_id: 1, name: 'Airbus A320' },
                ])),
        });
    }

    if (url.includes('/photos/getRandomByPlaneId')) {
        return Promise.resolve({
            json: () =>
                Promise.resolve({
                    photo_id: 1,
                    user_id: 1,
                    plane_id: 1,
                    url: 'https://example.com/plane.jpg',
                }),
        });
    }

    return Promise.reject(new Error('Unknown URL'));
}) as jest.Mock;

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