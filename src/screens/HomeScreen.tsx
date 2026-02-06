import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, Alert, TextInput, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { getItems, initDatabase, seedDatabase, getCategories } from '../services/Database';
import { Item } from '../types';
import ItemCard from '../components/ItemCard';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            try {
                initDatabase();
                seedDatabase(); // Seed if empty
                loadData();
            } catch (e) {
                console.error(e);
                Alert.alert('Error', 'Failed to load database');
            }
        }, [])
    );

    useEffect(() => {
        filterItems();
    }, [searchQuery, selectedCategory, items]);

    const loadData = () => {
        const data = getItems();
        const cats = getCategories();

        setItems(data);
        setCategories(['Semua', ...cats]);
        setLoading(false);
    };

    const filterItems = () => {
        let result = items;

        // Filter by Category
        if (selectedCategory !== 'Semua') {
            result = result.filter(item => item.category === selectedCategory);
        }

        // Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(lowerQuery) ||
                item.category.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredItems(result);
    };

    const renderItem = useCallback(({ item }: { item: Item }) => (
        <ItemCard
            name={item.name}
            category={item.category}
            price={item.pricePerDay}
            status={item.status}
        />
    ), []);

    const keyExtractor = useCallback((item: Item) => item.id.toString(), []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header & Search */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.headerTitle}>RentReady</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Pro</Text>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari kamera, drone..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.chip,
                                selectedCategory === cat && styles.chipActive
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.chipText,
                                selectedCategory === cat && styles.chipTextActive
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                initialNumToRender={10}
                windowSize={5}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Barang tidak ditemukan</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#4F46E5',
        letterSpacing: -0.5,
    },
    badge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1F2937',
    },
    categoryList: {
        paddingRight: 20,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipActive: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    chipTextActive: {
        color: 'white',
    },
    listContent: {
        padding: 20,
        paddingTop: 10, // Adjust for new header
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
    }
});

export default HomeScreen;
