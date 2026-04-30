import {Tabs, router} from 'expo-router';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {HapticTab} from '@/components/haptic-tab';
import {IconSymbol} from '@/components/ui/icon-symbol';
import {Colors} from '@/constants/theme';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {useAuth} from '@/lib/auth';

function HeaderUser() {
    const {user, signOut} = useAuth();
    if (!user) return null;
    const initial = (user.email?.[0] ?? '?').toUpperCase();
    return (
        <View style={headerStyles.row}>
            <Pressable
                onPress={() => router.push('/profile')}
                style={headerStyles.avatar}
                accessibilityLabel={`Profile for ${user.email}`}
            >
                <Text style={headerStyles.avatarText}>{initial}</Text>
            </Pressable>
            <Pressable
                onPress={async () => {
                    await signOut();
                    router.replace('/login');
                }}
                style={({pressed}) => [headerStyles.signOut, pressed && {opacity: 0.6}]}
            >
                <Text style={headerStyles.signOutText}>Sign out</Text>
            </Pressable>
        </View>
    );
}

const headerStyles = StyleSheet.create({
    row: {flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 16},
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {color: 'white', fontWeight: '700', fontSize: 14},
    signOut: {paddingVertical: 6, paddingHorizontal: 4},
    signOutText: {color: '#1d72ff', fontWeight: '600', fontSize: 14},
});

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerTitle: 'PlaneSpOtter',
                headerShown: true,
                headerRight: () => <HeaderUser/>,
                tabBarButton: HapticTab,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="house.fill" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="game"
                options={{
                    title: 'Game',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="airplane" color={color}/>,
                }}
            />
        </Tabs>
    );
}
