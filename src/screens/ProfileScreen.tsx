import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboardStats } from '../services/Database';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Info, Shield, ChevronRight, Heart } from 'lucide-react-native';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../utils/format';

export const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const initial = user?.email ? user.email[0].toUpperCase() : 'U';
    const [stats, setStats] = useState({ totalRevenue: 0, activeRentals: 0, lateRentals: 0 });

    useFocusEffect(
        useCallback(() => {
            if (user?.role === 'admin') {
                const data = getDashboardStats();
                setStats(data);
            }
        }, [user])
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#4F46E5', '#4338CA']} style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <Text style={styles.name}>{user?.email?.split('@')[0]}</Text>
                <Text style={styles.email}>{user?.email}</Text>

                <View style={styles.roleBadge}>
                    <Shield size={12} color="#E0E7FF" style={{ marginRight: 4 }} />
                    <Text style={styles.roleText}>{user?.role === 'admin' ? 'ADMINISTRATOR' : 'STAFF MEMBER'}</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Akun</Text>
                    <View style={styles.menuCard}>
                        <View style={styles.menuItem}>
                            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                <User size={20} color="#4F46E5" />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>Informasi Profil</Text>
                                <Text style={styles.menuSubtitle}>Lihat detail akun Anda</Text>
                            </View>
                            <ChevronRight size={20} color="#D1D5DB" />
                        </View>

                        {/* Divider */}
                        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 70 }} />

                        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
                            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                                <Shield size={20} color="#10B981" />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>Pengaturan</Text>
                                <Text style={styles.menuSubtitle}>Tema & Bahasa</Text>
                            </View>
                            <ChevronRight size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Aplikasi</Text>
                    <View style={styles.menuCard}>
                        <View style={styles.menuItem}>
                            <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
                                <Info size={20} color="#4B5563" />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>Versi Aplikasi</Text>
                                <Text style={styles.menuSubtitle}>v{Constants.expoConfig?.version || '1.0.0'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
                    <LogOut size={20} color="#DC2626" />
                    <Text style={styles.logoutText}>Keluar Akun</Text>
                </TouchableOpacity>

                {user?.role === 'admin' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Admin Dashboard</Text>
                        <View style={styles.menuCard}>
                            <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Total Pendapatan</Text>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981' }}>
                                        {formatCurrency(stats.totalRevenue)}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Sewa Aktif</Text>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4F46E5' }}>{stats.activeRentals}</Text>
                                </View>
                            </View>
                            {/* Simple Bar Chart Visualization */}
                            <View style={{ padding: 15, paddingTop: 0, flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 }}>
                                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                                    <View key={i} style={{ flex: 1, backgroundColor: '#E0E7FF', borderRadius: 4 }}>
                                        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                            <View style={{ height: `${h}%`, backgroundColor: '#4F46E5', borderRadius: 4 }} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                <Text style={styles.footerText}>© 2024 RentReady. All rights reserved.</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
        textTransform: 'capitalize',
    },
    email: {
        fontSize: 14,
        color: '#E0E7FF',
        marginBottom: 15,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        color: '#E0E7FF',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        marginTop: 10,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
    },
    menuCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 5,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DC2626',
    },
    footerText: {
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 50,
        color: '#D1D5DB',
        fontSize: 12,
    }
});
