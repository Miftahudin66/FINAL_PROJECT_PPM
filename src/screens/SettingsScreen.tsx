import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { Moon, Sun, Globe, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const SettingsScreen = ({ navigation }: any) => {
    const { theme, toggleTheme, language, toggleLanguage, t, colors } = useSettings();

    const isDark = theme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={isDark ? ['#312E81', '#1E1B4B'] : ['#4F46E5', '#4338CA']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t.settings}</Text>
                    <View style={{ width: 28 }} />
                </View>
            </LinearGradient>

            <View style={styles.content}>

                {/* Theme Section */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            {isDark ? <Moon size={24} color={colors.primary} /> : <Sun size={24} color={colors.primary} />}
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>{t.theme}</Text>
                            <Text style={[styles.subLabel, { color: colors.subText }]}>
                                {isDark ? t.darkMode : t.lightMode}
                            </Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor={isDark ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Language Section */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Globe size={24} color={colors.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>{t.language}</Text>
                            <Text style={[styles.subLabel, { color: colors.subText }]}>
                                {language === 'id' ? 'Bahasa Indonesia' : 'English'}
                            </Text>
                        </View>
                        <Switch
                            value={language === 'en'}
                            onValueChange={toggleLanguage}
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor={language === 'en' ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    backButton: {
        padding: 5,
    },
    content: {
        padding: 20,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subLabel: {
        fontSize: 14,
        marginTop: 2,
    },
});
