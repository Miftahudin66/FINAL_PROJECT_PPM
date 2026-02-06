import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/Database';
import { startSyncService } from './src/services/Sync';
import { StatusBar } from 'expo-status-bar';

export default function App() {

    useEffect(() => {
        // Initialize SQLite Database
        try {
            initDatabase();
            console.log('Database initialized');
        } catch (e) {
            console.error('Database init failed', e);
        }

        // Start Sync Service
        const unsubscribeSync = startSyncService();

        return () => {
            unsubscribeSync();
        };
    }, []);

    return (
        <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
        </AuthProvider>
    );
}
