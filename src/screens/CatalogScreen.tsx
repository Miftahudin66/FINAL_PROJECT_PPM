import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image, Dimensions, StatusBar, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Item } from '../types';
import * as Database from '../services/Database';
import { Package, Plus, TrendingUp, Search, X, ShoppingCart, Heart } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { useSettings } from '../context/SettingsContext';

const { width } = Dimensions.get('window');

const DashboardHeader = ({ total, rented, t }: { total: number, rented: number, t: any }) => (
  <View style={styles.dashboardContainer}>
    <View style={styles.statCard}>
      <View style={[styles.iconBg, { backgroundColor: '#EEF2FF' }]}>
        <Package size={24} color="#4F46E5" />
      </View>
      <View>
        <Text style={styles.statLabel}>{t.totalItems}</Text>
        <Text style={styles.statValue}>{total}</Text>
      </View>
    </View>
    <View style={styles.statCard}>
      <View style={[styles.iconBg, { backgroundColor: '#FEF2F2' }]}>
        <TrendingUp size={24} color="#DC2626" />
      </View>
      <View>
        <Text style={styles.statLabel}>{t.rentedOut}</Text>
        <Text style={styles.statValue}>{rented}</Text>
      </View>
    </View>
  </View>
);

const CATEGORIES = ['Kamera', 'Lensa', 'Lighting', 'Audio', 'Tripod', 'Drone', 'Aksesoris'];

const ItemCard = React.memo(({ item, index, onPress, t }: { item: Item; index: number, onPress: (id: string) => void, t: any }) => {
  return (
    <Animated.View exiting={FadeInDown} entering={FadeInDown.delay(index * 100).springify()}>
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress(item.id)}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl || 'https://placehold.co/600x400/png' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{formatCurrency(item.pricePerDay)}<Text style={styles.priceUnit}>/hari</Text></Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: item.status === 'available' ? '#ECFDF5' : '#FEF2F2' }]}>
              <Text style={[styles.statusText, { color: item.status === 'available' ? '#059669' : '#DC2626' }]}>
                {item.status === 'available' ? t.available : t.rented}
              </Text>
            </View>
          </View>

          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export const CatalogScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { user } = useAuth();
  const { t, theme, colors } = useSettings();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 18) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  const loadItems = useCallback(() => {
    const data = Database.getItems();
    setItems(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const rentedCount = items.filter(i => i.status === 'rented').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={theme === 'dark' ? ['#312E81', '#1E1B4B'] : ['#4F46E5', '#4338CA']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userEmail}>{user?.email?.split('@')[0] || 'User'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Cart')}
            >
              <View style={styles.badgeDot} />
              <ShoppingCart size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Wishlist')}
            >
              <Heart size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
          <TextInput
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <DashboardHeader total={items.length} rented={rentedCount} t={t} />

        <View style={styles.categoryScroll}>
          <FlatList
            horizontal
            data={CATEGORIES}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.catChip,
                  { backgroundColor: selectedCategory === item ? colors.primary : colors.card, borderColor: colors.border }
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[
                  styles.catChipText,
                  { color: selectedCategory === item ? 'white' : colors.subText }
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <ItemCard item={item} index={index} onPress={(id) => navigation.navigate('Detail', { itemId: id })} t={t} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color={colors.subText} />
              <Text style={[styles.emptyText, { color: colors.subText }]}>{t.emptyCatalog}</Text>
              {user?.role === 'admin' && <Text style={[styles.emptySubText, { color: colors.subText }]}>{t.addFirstItem}</Text>}
            </View>
          }
        />
      </View>

      {user?.role === 'admin' && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('AddItem')}>
          <Plus color="white" size={28} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  searchBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
  },
  dashboardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconBg: {
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  categoryScroll: {
    marginTop: 0,
    marginBottom: 5,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  priceTag: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backdropFilter: 'blur(10px)',
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#D1D5DB',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#4F46E5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 20,
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 5,
    color: '#9CA3AF',
    fontSize: 13,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative'
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4F46E5',
    zIndex: 10
  }
});
