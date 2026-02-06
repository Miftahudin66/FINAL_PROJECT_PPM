import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/format';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Trash2, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Database from '../services/Database';
import { randomUUID } from 'expo-crypto';

export const CartScreen = ({ navigation }: any) => {
    const { items, removeFromCart, clearCart, updateQuantity } = useCart();
    const { user } = useAuth();
    const { theme, colors } = useSettings();

    const [duration, setDuration] = useState('1');
    const [timeUnit, setTimeUnit] = useState<'day' | 'hour'>('day');

    const grandTotal = useMemo(() => {
        const d = parseInt(duration) || 1;
        return items.reduce((sum, item) => {
            const price = timeUnit === 'day' ? item.pricePerDay : (item.pricePerHour || 0);
            return sum + (price * d * item.quantity);
        }, 0);
    }, [items, duration, timeUnit]);

    const handleCheckout = () => {
        if (items.length === 0) return;

        Alert.alert(
            'Konfirmasi Sewa',
            `Sewa ${items.length} barang selama ${duration} ${timeUnit === 'day' ? 'Hari' : 'Jam'}?\nTotal: ${formatCurrency(grandTotal)}`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Proses',
                    onPress: () => {
                        try {
                            const now = new Date();
                            const startDate = now.toISOString().split('T')[0];
                            // Simple end date calc could be added here if needed, but for now we trust Duration
                            // For history compatibility, maybe set endDate = startDate + duration

                            items.forEach(item => {
                                const rental = {
                                    id: randomUUID(),
                                    itemId: item.id,
                                    itemName: item.name,
                                    userId: user?.uid || 'anon',
                                    customerName: user?.email?.split('@')[0] || 'Customer',
                                    startDate: startDate,
                                    endDate: 'N/A', // Simple logic doesn't strictly need date math, or we can add it later
                                    totalCost: (timeUnit === 'day' ? item.pricePerDay : (item.pricePerHour || 0)) * (parseInt(duration) || 1) * item.quantity,
                                    quantity: item.quantity,
                                    duration: parseInt(duration) || 1,
                                    timeUnit: timeUnit,
                                    status: 'active' as const,
                                    synced: 0 as 0  // Explicit cast to match SQLite boolean type 0 | 1
                                };
                                Database.addRental(rental);
                            });
                            clearCart();
                            Alert.alert('Sukses', 'Transaksi berhasil!', [{ text: 'OK', onPress: () => navigation.navigate('Rentals') }]);
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={theme === 'dark' ? ['#312E81', '#1E1B4B'] : ['#4F46E5', '#4338CA']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Keranjang Sewa</Text>
                    <View style={{ width: 28 }} />
                </View>
            </LinearGradient>

            <View style={styles.inputSection}>
                <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>Durasi Sewa</Text>
                        <TextInput
                            style={styles.durationInput}
                            value={duration}
                            onChangeText={setDuration}
                            keyboardType="numeric"
                            placeholder="1"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>Satuan Waktu</Text>
                        <View style={styles.toggleRow}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, timeUnit === 'day' && styles.toggleBtnActive]}
                                onPress={() => setTimeUnit('day')}
                            >
                                <Text style={[styles.toggleText, timeUnit === 'day' && styles.toggleTextActive]}>Hari</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, timeUnit === 'hour' && styles.toggleBtnActive]}
                                onPress={() => setTimeUnit('hour')}
                            >
                                <Text style={[styles.toggleText, timeUnit === 'hour' && styles.toggleTextActive]}>Jam</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <FlatList
                data={items}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.imageUrl || 'https://placehold.co/100x100/png' }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>
                                {formatCurrency(timeUnit === 'day' ? item.pricePerDay : (item.pricePerHour || 0))} / {timeUnit === 'day' ? 'hari' : 'jam'}
                            </Text>
                            <View style={styles.qtyContainer}>
                                <TouchableOpacity onPress={() => updateQuantity(item.id, (item.quantity - 1))} style={styles.qtyBtn}>
                                    <Text style={styles.qtyBtnText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.id, (item.quantity + 1))} style={styles.qtyBtn}>
                                    <Text style={styles.qtyBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 5 }}>
                            <Text style={styles.subTotal}>
                                {formatCurrency((timeUnit === 'day' ? item.pricePerDay : (item.pricePerHour || 0)) * (parseInt(duration) || 1) * item.quantity)}
                            </Text>
                            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                <Trash2 size={20} color="#DC2626" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Keranjang kosong</Text>}
            />

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Pembayaran</Text>
                    <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.checkoutBtn, { opacity: items.length === 0 ? 0.5 : 1 }]}
                    onPress={handleCheckout}
                    disabled={items.length === 0}
                >
                    <Text style={styles.checkoutText}>Checkout Sekarang</Text>
                </TouchableOpacity>
            </View>
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
    inputSection: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
    sectionLabel: { fontSize: 12, color: '#6B7280', marginBottom: 10, fontWeight: '600' },
    inputRow: { flexDirection: 'row', gap: 20 },
    durationInput: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, fontSize: 16, marginTop: 5 },
    toggleRow: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, marginTop: 5, padding: 2 },
    toggleBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 },
    toggleBtnActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
    toggleText: { fontSize: 13, color: '#6B7280' },
    toggleTextActive: { color: '#4F46E5', fontWeight: 'bold' },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
    qtyBtn: { backgroundColor: '#F3F4F6', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5' },
    qtyText: { fontSize: 14, fontWeight: 'bold' },
    list: { padding: 20 },
    card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 10, marginBottom: 10, alignItems: 'center' },
    image: { width: 50, height: 50, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
    info: { flex: 1 },
    name: { fontSize: 14, fontWeight: 'bold' },
    price: { fontSize: 12, color: '#6B7280' },
    subTotal: { fontSize: 14, color: '#4F46E5', fontWeight: 'bold' },
    empty: { textAlign: 'center', marginTop: 50, color: '#9CA3AF' },
    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    totalLabel: { fontSize: 16, fontWeight: '600' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#4F46E5' },
    checkoutBtn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center' },
    checkoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
