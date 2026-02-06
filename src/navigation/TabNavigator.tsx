import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CatalogScreen } from '../screens/CatalogScreen';
import { RentalsScreen } from '../screens/RentalsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Home, ClipboardList, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: '#4F46E5',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 5
                }
            }}
        >
            <Tab.Screen
                name="Catalog"
                component={CatalogScreen}
                options={{
                    title: 'Inventory',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Rentals"
                component={RentalsScreen}
                options={{
                    title: 'Rentals',
                    tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'My Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
};
