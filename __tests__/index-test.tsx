import {render} from '@testing-library/react-native'

import HomeScreen from '@/app/(tabs)/index'

jest.mock('@/lib/auth', () => ({
    useAuth: () => ({token: 'test-token'}),
}))

jest.mock('expo-router', () => ({
    router: {push: jest.fn()},
}))

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
    })) as jest.Mock;

describe('HomeScreen', () => {
    it('renders UI text', async () => {
        const {getByText} = render(<HomeScreen/>);

        expect(await getByText('PlanespOtter ✈️')).toBeTruthy();
        expect(await getByText('Play Game')).toBeTruthy();
        expect(await getByText('Profile')).toBeTruthy();
        expect(await getByText('Top Players')).toBeTruthy();
    })
})

describe('HomeScreen leaderboard', () => {
    it('renders leaderboard entries from API', async () => {
        const mockData = [
            { user: { name: 'User 1' }, bestStreak: 42 },
            { user: { name: 'User 2' }, bestStreak: 30 },
        ];

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockData),
            })
        ) as jest.Mock;

        const { findByText } = render(<HomeScreen />);

        expect(await findByText('#1')).toBeTruthy();
        expect(await findByText('User 1')).toBeTruthy();
        expect(await findByText('42')).toBeTruthy();

        expect(await findByText('#2')).toBeTruthy();
        expect(await findByText('User 2')).toBeTruthy();
        expect(await findByText('30')).toBeTruthy();
    });

    it('renders no photos when empty map received', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([]),
            })
        ) as jest.Mock;

        const {queryByText, getByText} = render(<HomeScreen />);

        await getByText('Top Players');

        expect(queryByText('#1')).toBeNull();
    });
});