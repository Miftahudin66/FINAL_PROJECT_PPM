import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, Image, Dimensions, TextInput, Modal } from 'react-native';
import { Item, Rental } from '../types';
import * as Database from '../services/Database';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { randomUUID } from 'expo-crypto';
import { ChevronLeft, ShoppingCart, User, Shield, Trash2, Info, Clock, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../utils/format';

const { width } = Dimensions.get('window');

export const DetailScreen = ({ route, navigation }: any) => {
    const { itemId } = route.params;
    const { user } = useAuth();
    const { t, theme } = useSettings();

    // Refresh item data
    const item = Database.getItems().find(i => i.id === itemId);

    const [modalVisible, setModalVisible] = useState(false);
    const [renterName, setRenterName] = useState('');
    const [duration, setDuration] = useState('1');
    const [timeUnit, setTimeUnit] = useState<'day' | 'hour'>('day');
    const [quantity, setQuantity] = useState('1');

    if (!item) return null;

    const handleRent = () => {
        if (!renterName || !duration) {
            Alert.alert('Error', 'Mohon lengkapi data penyewa dan durasi.');
            return;
        }

        const qty = parseInt(quantity) || 1;
        const dur = parseInt(duration) || 1;

        if (qty > item.stock) {
            Alert.alert('Stok Kurang', `Hanya tersedia ${item.stock} unit.`);
            return;
        }

        const rentalStart = new Date();
        // Calculate End Date roughly for display (Countdown logic handles real expiry)
        const rentalEnd = new Date(rentalStart.getTime() + (timeUnit === 'day' ? dur * 24 * 3600 * 1000 : dur * 3600 * 1000));

        const price = timeUnit === 'day' ? item.pricePerDay : (item.pricePerHour || 0);
        const total = price * dur * qty;

        const newRental: Rental = {
            id: randomUUID(),
            itemId: item.id,
            itemName: item.name,
            userId: (user as any)?.id || 'guest',
            customerName: renterName,
            startDate: rentalStart.toISOString(),
            endDate: rentalEnd.toISOString(),
            totalCost: total,
            quantity: qty,
            duration: dur,
            timeUnit: timeUnit,
            status: 'active',
            synced: 0
        };

        Database.addRental(newRental);
        setModalVisible(false);

        Alert.alert('Sukses!', 'Barang berhasil disewa. Waktu mulai berjalan sekarang.', [
            { text: 'Lihat Riwayat', onPress: () => navigation.navigate('Rentals') },
            { text: 'OK' }
        ]);
        navigation.goBack();
    };


    const handleDelete = () => {
        Alert.alert('Hapus Barang', 'Apakah Anda yakin?', [
            { text: 'Batal', style: 'cancel' },
            { text: 'Hapus', style: 'destructive', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: '#F3F4F6' }]}>
            <LinearGradient colors={theme === 'dark' ? ['#312E81', '#1E1B4B'] : ['#4F46E5', '#4338CA']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>Detail Barang</Text>
                    <View style={{ width: 28 }}>
                        {user?.role === 'admin' && (
                            <TouchableOpacity onPress={handleDelete}>
                                <Trash2 color="#FECACA" size={24} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.imageUrl || 'https://placehold.co/600x400/png' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{item.name}</Text>
                        <View style={styles.priceBadge}>
                            <View>
                                <Text style={styles.priceText}>{formatCurrency(item.pricePerDay)}<Text style={styles.unitText}>/hari</Text></Text>
                                {item.pricePerHour > 0 && (
                                    <Text style={styles.priceTextSmall}>{formatCurrency(item.pricePerHour)}<Text style={styles.unitText}>/jam</Text></Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Stok Tersedia</Text>
                            <Text style={styles.metaValue}>{item.stock || 1} Unit</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>Deskripsi</Text>
                    <Text style={styles.description}>{item.description || 'Tidak ada deskripsi.'}</Text>

                    {/* Action Button */}
                    <View style={styles.actionCard}>
                        {item.stock > 0 ? (
                            <TouchableOpacity style={styles.rentButton} onPress={() => setModalVisible(true)}>
                                <Text style={styles.rentButtonText}>Sewa Sekarang</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.disabledButton}>
                                <Text style={styles.disabledButtonText}>Stok Habis</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Rental Form Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Form Sewa Barang</Text>

                        <Text style={styles.label}>Nama Penyewa</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Wajib diisi"
                            value={renterName}
                            onChangeText={setRenterName}
                        />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Jumlah Unit</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Durasi</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={duration}
                                    onChangeText={setDuration}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Satuan Waktu</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                            <TouchableOpacity
                                style={[styles.choiceChip, timeUnit === 'day' && styles.choiceActive]}
                                onPress={() => setTimeUnit('day')}
                            >
                                <Text style={[styles.choiceText, timeUnit === 'day' && styles.choiceTextActive]}>Harian</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.choiceChip, timeUnit === 'hour' && styles.choiceActive]}
                                onPress={() => setTimeUnit('hour')}
                            >
                                <Text style={[styles.choiceText, timeUnit === 'hour' && styles.choiceTextActive]}>Jam</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.confirmButton} onPress={handleRent}>
                            <Text style={styles.confirmText}>Konfirmasi Sewa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Batal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        alignItems: 'center'
    },
    header: {
        paddingTop: 50,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30, // Curve effect
        borderBottomRightRadius: 30,
        zIndex: 1,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    imageContainer: {
        marginTop: -30, // Overlap header
        marginHorizontal: 20,
        borderRadius: 20,
        height: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    categoryTag: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    content: {
        padding: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        marginRight: 10,
    },
    priceBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    priceText: {
        color: '#4F46E5',
        fontWeight: 'bold',
        fontSize: 16,
    },
    priceTextSmall: {
        color: '#4F46E5',
        fontWeight: '600',
        fontSize: 13,
        marginTop: 2,
    },
    unitText: {
        fontSize: 12,
        fontWeight: 'normal',
        color: '#6B7280',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 20,
    },
    metaItem: {},
    metaLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    statusLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 22,
        marginBottom: 30,
    },
    actionCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 15,
        textAlign: 'center',
    },
    rentButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButtonText: {
        color: '#6B7280',
        fontWeight: 'bold',
        fontSize: 16,
    },
    rentButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    rentedCard: {
        backgroundColor: '#FEF2F2',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    rentedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#DC2626',
        marginBottom: 5,
    },
    rentedSubtitle: {
        fontSize: 14,
        color: '#B91C1C',
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    choiceChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    choiceActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    choiceText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    choiceTextActive: {
        color: '#4F46E5',
    },
    confirmButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
    },
    cancelText: {
        color: '#6B7280',
        fontWeight: '600',
        fontSize: 16,
    },
});
