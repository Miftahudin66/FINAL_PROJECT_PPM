import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { DetailScreen } from '../screens/DetailScreen';
import { AddItemScreen } from '../screens/AddItemScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAuth } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { CartProvider } from '../context/CartContext';
import { ActivityIndicator, View } from 'react-native';
import { WishlistScreen } from '../screens/WishlistScreen';
import { CartScreen } from '../screens/CartScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SettingsProvider>
            <CartProvider>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {user ? (
                            <>
                                <Stack.Screen name="MainTabs" component={TabNavigator} />
                                <Stack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="AddItem" component={AddItemScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
                            </>
                        ) : (
                            <Stack.Screen name="Login" component={LoginScreen} />
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </CartProvider>
        </SettingsProvider>
    );
};
