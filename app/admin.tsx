import { ImageBackground } from 'expo-image';
import { Pressable, StyleSheet, TextInput, Text, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { ScrollView } from 'react-native';

export default function AdminUserSearchScreen() {
    const { token } = useAuth();

    const [emailInput, setEmailInput] = useState('');
    const [searchedUser, setSearchedUser] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    // Find User by email
    const searchUserByEmail = async () => {
        if (!emailInput.trim() || !token) return;

        setLoading(true);
        setError('');
        setSearchedUser(null);

        try {
            const res = await fetch(
                `https://backend-eu81.onrender.com/user/admin/findUser`,
                {
                    method: 'POST',
                    headers: {
                        'Content-type' : 'text/plain',
                        Authorization: `Bearer ${token}`
                    },
                    body: emailInput.trim(),
                }
            );

            if (!res.ok) {
                throw new Error(`User not found or request failed: ${res.status}`);
            }

            const data = await res.json();
            // Clears the list of user
            setAllUsers([]);

            setSearchedUser(data);
        } catch (error) {
            console.log('Error searching user:', error);
            setError('User not found');
        } finally {
            setLoading(false);
        }
    };

    // Get All Users
    const getAllUsers = async () => {
        if (!token) return;

        try {
            const res = await fetch(`https://backend-eu81.onrender.com/user/admin`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`Failed: ${res.status}`);
            }

            const data = await res.json();
            // Set searched user to null (if looking for one)
            setSearchedUser(null);

            setAllUsers(data);
        } catch (error) {
            console.log('Error getting all users:', error);
        }
    };

    // Update User's Admin Status to an Admin
    const makeAdmin = async () => {
        const res = await fetch(`https://backend-eu81.onrender.com/user/admin/makeAdmin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'text/plain',
                Authorization: `Bearer ${token}`,
            },
            body: emailInput.trim(),
        });

        if (!res.ok) {
            setError(`Failed: ${res.status}`);
            return;
        }

        const data = await res.json();
        setAllUsers([]);

        setSearchedUser(data);
    };

    // Update User's Admin Status to a Member (Non Admin)
    const removeAdmin = async () => {
        const res = await fetch(`https://backend-eu81.onrender.com/user/admin/removeAdmin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'text/plain',
                Authorization: `Bearer ${token}`,
            },
            body: emailInput.trim(),
        });

        if (!res.ok) {
            setError(`Failed: ${res.status}`);
            return;
        }

        const data = await res.json();
        setAllUsers([]);

        setSearchedUser(data);
    };

    // Delete a User
    const deleteUser = async () => {
        const res = await fetch(`https://backend-eu81.onrender.com/user/admin/deleteUser`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'text/plain',
                Authorization: `Bearer ${token}`,
            },
            body: emailInput.trim(),
        });

        if (!res.ok) {
            setError(`Failed: ${res.status}`);
            return;
        }

        setError('User Successfully Deleted!');
        setSearchedUser(null);
        setAllUsers([]);
        setEmailInput('');
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Admin User Search',
                }}
            />

            <ImageBackground
                source={require('@/assets/images/default-background.png')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
                contentFit="fill"
            >
                <ThemedView style={styles.container}>
                    <ThemedText type="title" style={styles.title}>
                        Admin Search
                    </ThemedText>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter user email"
                        value={emailInput}
                        onChangeText={setEmailInput}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={searchUserByEmail}
                    >
                        <ThemedText style={styles.buttonText}>
                            {loading ? 'Searching...' : 'Search User'}
                        </ThemedText>
                    </Pressable>

                    <Pressable style={styles.button} onPress={getAllUsers}>
                        <ThemedText style={styles.buttonText}>Get All Users</ThemedText>
                    </Pressable>


                    <View style={styles.adminButtonRow}>
                        <Pressable style={styles.buttonMakeAdmin} onPress={makeAdmin}>
                            <ThemedText style={styles.buttonTextAdmin}>Promote</ThemedText>
                        </Pressable>
                        <Pressable style={styles.buttonRemoveAdmin} onPress={removeAdmin}>
                            <ThemedText style={styles.buttonTextAdmin}>Demote</ThemedText>
                        </Pressable>
                    </View>

                    <Pressable style={styles.buttonDeleteUser} onPress={deleteUser}>
                        <ThemedText style={styles.buttonText}>Terminate User</ThemedText>
                    </Pressable>


                    <View style={styles.resultBox}>
                        <ScrollView>
                            {error ? (
                                <Text style={styles.errorText}>{error}</Text>
                            ) : searchedUser ? (
                                <>
                                    <Text style={styles.resultText}>
                                        Email: {searchedUser.email}
                                    </Text>

                                    <Text style={styles.resultText}>
                                        Name: {searchedUser.name ?? 'No name'}
                                    </Text>

                                    <Text style={styles.resultText}>
                                        Role: {searchedUser.is_admin ? 'Admin' : 'Member'}
                                    </Text>
                                </>
                            ) : allUsers.length > 0 ? (
                                allUsers.map((user) => (
                                    <View key={user.user_id ?? user.email} style={styles.userCard}>
                                        <Text style={styles.resultText}>
                                            Email: {user.email}
                                        </Text>

                                        <Text style={styles.resultText}>
                                            Name: {user.name ?? 'No name'}
                                        </Text>

                                        <Text style={styles.resultText}>
                                            Role: {user.is_admin ? 'Admin' : 'Member'}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.placeholderText}>
                                    Search result will appear here.
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </ThemedView>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        resizeMode: 'cover',
    },
    container: {
        width: 320,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.66)',
        borderRadius: 16,
    },
    title: {
        color: 'white',
        fontWeight: '900',
        marginBottom: 24,
    },
    input: {
        width: 260,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#1d72ff',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginBottom: 20,
        width: 260,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    adminButtonRow: {
        flexDirection: 'row',
        gap: 10,
        width: 'auto',
        marginTop: 12,
        marginBottom: 12,
    },
    buttonMakeAdmin: {
        backgroundColor: '#04d022',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginBottom: 20,
        width: 130,
        alignItems: 'center',
    },
    buttonRemoveAdmin: {
        backgroundColor: '#cf0000',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginBottom: 20,
        width: 130,
        alignItems: 'center',
    },
    buttonTextAdmin: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonDeleteUser: {
        backgroundColor: '#000000',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginBottom: 20,
        width: 260,
        alignItems: 'center',
    },
    resultBox: {
        width: 300,
        height: 118,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 14,
        marginTop: 12,
    },
    resultText: {
        fontSize: 16,
        color: 'black',
        marginBottom: 8,
        fontWeight: '600',
    },
    placeholderText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#B00020',
        textAlign: 'center',
        fontWeight: '600',
    },
    userCard: {
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});