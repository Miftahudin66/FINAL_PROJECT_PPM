import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

interface ItemCardProps {
    name: string;
    category: string;
    price: number;
    status: 'available' | 'rented' | 'maintenance';
}

const ItemCard: React.FC<ItemCardProps> = ({ name, category, price, status }) => {
    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.subtitle}>{category}</Text>
                <Text style={styles.price}>Rp {price.toLocaleString('id-ID')} / day</Text>
            </View>
            <View style={[styles.statusBadge,
            status === 'available' ? styles.statusAvailable :
                status === 'rented' ? styles.statusRented : styles.statusMaintenance
            ]}>
                <Text style={styles.statusText}>{status.toUpperCase()}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Responsive width logic could be here if not handled by parent
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2e7d32',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 10,
    },
    statusAvailable: {
        backgroundColor: '#e8f5e9',
    },
    statusRented: {
        backgroundColor: '#ffebee',
    },
    statusMaintenance: {
        backgroundColor: '#fff3e0',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default React.memo(ItemCard);
