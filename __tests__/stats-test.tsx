import React from 'react';
import { render } from '@testing-library/react-native';
import StatsScreen from '../app/(tabs)/stats';

jest.mock('../lib/auth', () => ({
    useAuth: () => ({
        token: 'fake-token',
        user: { userId: 1 },
    }),
}));

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: async () => ({
            gamesPlayed: 10,
            correctGuesses: 7,
            winningStreak: 3,
            bestStreak: 5,
        }),
    })
) as jest.Mock;

describe('StatsScreen', () => {
    it('renders stats from API', async () => {
        const { findByText } = render(<StatsScreen />);

        expect(await findByText('Your Stats')).toBeTruthy();
        expect(await findByText('Games Played')).toBeTruthy();
        expect(await findByText('10')).toBeTruthy();

        expect(await findByText('Correct Guesses')).toBeTruthy();
        expect(await findByText('7')).toBeTruthy();

        expect(await findByText('Win Rate')).toBeTruthy();
        expect(await findByText('70%')).toBeTruthy(); // 7/10 = 70%

        expect(await findByText('Current Streak')).toBeTruthy();
        expect(await findByText('3 🔥')).toBeTruthy();

        expect(await findByText('Best Streak')).toBeTruthy();
        expect(await findByText('5')).toBeTruthy();
    });
})