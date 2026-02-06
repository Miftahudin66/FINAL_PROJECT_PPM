import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Database from '../services/Database';
import { Rental } from '../types';
import { Clock, CheckCircle, ArrowRight, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../utils/format';

const RentalCard = ({ rental, onReturn }: { rental: Rental, onReturn: (id: string, itemId: string) => void }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
        if (rental.status !== 'active') return;

        const calculateTimeLeft = () => {
            const end = new Date(rental.endDate).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft('Waktu Habis');
                setIsOverdue(true);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}h ${hours}j`);
            } else {
                setTimeLeft(`${hours}j ${minutes}m`);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [rental.endDate, rental.status]);

    return (
        <View style={[styles.card, isOverdue && styles.cardOverdue]}>
            <View style={styles.row}>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{rental.itemName}</Text>
                    <View style={styles.customerRow}>
                        <User size={12} color="#6B7280" />
                        <Text style={styles.customer}>{rental.customerName}</Text>
                    </View>
                </View>
                <View style={[styles.badge, { backgroundColor: rental.status === 'active' ? (isOverdue ? '#FECACA' : '#FEF3C7') : '#D1FAE5' }]}>
                    <Text style={[styles.badgeText, { color: rental.status === 'active' ? (isOverdue ? '#DC2626' : '#D97706') : '#059669' }]}>
                        {rental.status === 'active' ? (isOverdue ? 'TERLAMBAT' : 'DISEWA') : 'SELESAI'}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Sisa Waktu</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} color={isOverdue ? '#DC2626' : '#4F46E5'} />
                        <Text style={[styles.detailValue, { color: isOverdue ? '#DC2626' : '#4F46E5' }]}>
                            {rental.status === 'active' ? timeLeft : '-'}
                        </Text>
                    </View>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Durasi Awal</Text>
                    <Text style={styles.detailValue}>
                        {rental.duration ? `${rental.duration} ${rental.timeUnit === 'day' ? 'Hari' : 'Jam'}` : '-'}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Qty</Text>
                    <Text style={styles.detailValue}>{rental.quantity || 1} Unit</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.costLabel}>Total Biaya</Text>
                <Text style={styles.costValue}>{formatCurrency(rental.totalCost)}</Text>
            </View>

            {rental.status === 'active' && (
                <TouchableOpacity style={styles.returnButton} onPress={() => onReturn(rental.id, rental.itemId)}>
                    <Text style={styles.returnButtonText}>Kembalikan Barang</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export const RentalsScreen = () => {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadRentals = useCallback(() => {
        const data = Database.getRentals();
        setRentals(data.reverse()); // Show newest first
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadRentals();
        }, [loadRentals])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadRentals();
        setTimeout(() => setRefreshing(false), 500);
    };

    const handleReturn = (rentalId: string, itemId: string) => {
        Alert.alert(
            "Konfirmasi Pengembalian",
            "Tandai barang ini sudah dikembalikan dan statusnya menjadi Tersedia?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Konfirmasi",
                    onPress: () => {
                        Database.returnRental(rentalId, itemId);
                        loadRentals();
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#4F46E5', '#4338CA']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Riwayat Penyewaan</Text>
            </LinearGradient>

            <FlatList
                data={rentals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RentalCard rental={item} onReturn={handleReturn} />}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Clock size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>Belum ada riwayat sewa</Text>
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
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardOverdue: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    customer: {
        fontSize: 13,
        color: '#6B7280',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 15,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    detailItem: {
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 8,
    },
    costLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    },
    costValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    returnButton: {
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    returnButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    empty: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        color: '#9CA3AF',
        fontSize: 16,
    }
});
