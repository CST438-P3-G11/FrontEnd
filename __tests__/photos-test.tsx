import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../app/(tabs)/photos';

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
    if (url.includes('/photos/getByUserId')) {
        return Promise.resolve({
            ok: true,
            json: async () => [
                {
                    photo_id: 1,
                    user_id: 1,
                    plane_id: 10,
                    url: 'http://test.com/photo.jpg',
                },
            ],
        });
    }

    if (url.includes('/planes/getById')) {
        return Promise.resolve({
            ok: true,
            json: async () => ({
                plane_id: 10,
                user_id: 1,
                name: 'Boeing 747',
            }),
        });
    }

    return Promise.reject(new Error('Unknown endpoint'));
}) as jest.Mock;

describe('Photos', () => {
    it('renders page title', async () => {
        const { findByText } = render(<App />);

        const title = await findByText('My Photos');
        expect(title).toBeTruthy();
    });

    it('renders fetched plane name', async () => {
        const { findByText } = render(<App />);

        const planeName = await findByText('Boeing 747');
        expect(planeName).toBeTruthy();
    });
});

