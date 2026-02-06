import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Item } from '../types';
import * as Database from '../services/Database';
import { Heart, ArrowRight, Package } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/format';
import { ChevronLeft } from 'lucide-react-native';

export const WishlistScreen = ({ navigation }: any) => {
    const [wishlist, setWishlist] = useState<Item[]>([]);
    const { t, theme, colors } = useSettings();

    const loadWishlist = useCallback(() => {
        const favIds = Database.getFavorites();
        const allItems = Database.getItems();
        const favItems = allItems.filter(item => favIds.includes(item.id));
        setWishlist(favItems);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadWishlist();
        }, [loadWishlist])
    );

    const removeFav = (id: string) => {
        Database.toggleFavorite(id, true);
        loadWishlist();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={theme === 'dark' ? ['#312E81', '#1E1B4B'] : ['#4F46E5', '#4338CA']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Favorit Saya</Text>
                    <View style={{ width: 28 }} />
                </View>
            </LinearGradient>

            <FlatList
                data={wishlist}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Heart size={64} color="#D1D5DB" />
                        <Text style={[styles.emptyText, { color: colors.subText }]}>Belum ada barang favorit</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Detail', { itemId: item.id })}>
                        <Image source={{ uri: item.imageUrl || 'https://placehold.co/100x100/png' }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>{formatCurrency(item.pricePerDay)}/hari</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeFav(item.id)} style={styles.removeBtn}>
                            <Heart size={20} color="#DC2626" fill="#DC2626" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    backButton: { padding: 5 },
    list: { padding: 20 },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    image: { width: 60, height: 60, borderRadius: 10, marginRight: 15, backgroundColor: '#eee' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    price: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
    removeBtn: { padding: 10 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16 },
});
