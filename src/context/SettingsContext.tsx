import React, { createContext, useContext, useState } from 'react';

type Language = 'id' | 'en';
type Theme = 'light' | 'dark';

export const TEXTS = {
    id: {
        inventory: 'Inventaris',
        rentals: 'Penyewaan',
        profile: 'Profil',
        searchPlaceholder: 'Cari barang...',
        totalItems: 'Total Barang',
        rentedOut: 'Sedang Disewa',
        available: 'TERSEDIA',
        rented: 'DISEWA',
        welcome: 'Selamat Datang',
        greetingMorning: 'Selamat Pagi',
        greetingAfternoon: 'Selamat Sore',
        greetingEvening: 'Selamat Malam',
        settings: 'Pengaturan',
        language: 'Bahasa',
        theme: 'Tema',
        logout: 'Keluar',
        appVersion: 'Versi Aplikasi',
        account: 'Akun',
        profileInfo: 'Informasi Profil',
        emptyCatalog: 'Belum ada barang',
        addFirstItem: 'Tekan + untuk tambah barang baru',
        darkMode: 'Mode Gelap',
        lightMode: 'Mode Terang'
    },
    en: {
        inventory: 'Inventory',
        rentals: 'Rentals',
        profile: 'Profile',
        searchPlaceholder: 'Search items...',
        totalItems: 'Total Items',
        rentedOut: 'Rented Out',
        available: 'AVAILABLE',
        rented: 'RENTED',
        welcome: 'Welcome',
        greetingMorning: 'Good Morning',
        greetingAfternoon: 'Good Afternoon',
        greetingEvening: 'Good Evening',
        settings: 'Settings',
        language: 'Language',
        theme: 'Theme',
        logout: 'Log Out',
        appVersion: 'App Version',
        account: 'Account',
        profileInfo: 'Profile Info',
        emptyCatalog: 'No items found',
        addFirstItem: 'Tap + to add your first item',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode'
    }
};

export const COLORS = {
    light: {
        background: '#F9FAFB',
        text: '#1F2937',
        card: '#FFFFFF',
        subText: '#6B7280',
        primary: '#4F46E5',
        border: '#E5E7EB'
    },
    dark: {
        background: '#111827',
        text: '#F9FAFB',
        card: '#1F2937',
        subText: '#9CA3AF',
        primary: '#6366F1',
        border: '#374151'
    }
};

interface SettingsContextType {
    language: Language;
    theme: Theme;
    toggleLanguage: () => void;
    toggleTheme: () => void;
    t: typeof TEXTS['id'];
    colors: typeof COLORS['light'];
}

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('id');
    const [theme, setTheme] = useState<Theme>('light');

    const toggleLanguage = () => setLanguage(prev => prev === 'id' ? 'en' : 'id');
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const value = {
        language,
        theme,
        toggleLanguage,
        toggleTheme,
        t: TEXTS[language],
        colors: COLORS[theme]
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
