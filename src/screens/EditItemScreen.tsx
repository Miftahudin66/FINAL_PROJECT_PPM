import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Save, Image as ImageIcon } from 'lucide-react-native';
import { Item } from '../types';
import * as Database from '../services/Database';
import { useSettings } from '../context/SettingsContext';
import * as ImagePicker from 'expo-image-picker';

export const EditItemScreen = ({ route, navigation }: any) => {
    const { itemId } = route.params;
    const initialItem = Database.getItems().find(i => i.id === itemId);
    const { theme, colors } = useSettings();

    if (!initialItem) {
        return <View><Text>Item not found</Text></View>;
    }

    const [name, setName] = useState(initialItem.name);
    const [category, setCategory] = useState(initialItem.category);
    const [price, setPrice] = useState(initialItem.pricePerDay.toString());
    const [hourlyPrice, setHourlyPrice] = useState((initialItem.pricePerHour || 0).toString());
    const [stock, setStock] = useState((initialItem.stock || 1).toString());
    const [description, setDescription] = useState(initialItem.description);

    const [imageUrl, setImageUrl] = useState(initialItem.imageUrl || '');

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (!name || !price || !category) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        const updatedItem: Item = {
            ...initialItem,
            name,
            category,
            pricePerDay: parseFloat(price),
            pricePerHour: parseFloat(hourlyPrice) || 0,
            stock: parseInt(stock) || 1,
            description,
            imageUrl
        };

        try {
            Database.updateItem(updatedItem);
            Alert.alert('Sukses', 'Barang berhasil diupdate', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={theme === 'dark' ? ['#312E81', '#1E1B4B'] : ['#4F46E5', '#4338CA']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Barang</Text>
                    <View style={{ width: 28 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.label}>Nama Barang</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} />

                    <Text style={styles.label}>Kategori (Ketik baru jika perlu)</Text>
                    <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Contoh: Kamera, Drone, Gaming" />

                    <Text style={styles.label}>Stok Barang</Text>
                    <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Harga Harian (Rp)</Text>
                            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Harga Per Jam (Rp)</Text>
                            <TextInput style={styles.input} value={hourlyPrice} onChangeText={setHourlyPrice} keyboardType="numeric" />
                        </View>
                    </View>

                    <Text style={styles.label}>URL Gambar</Text>
                    <View style={styles.inputRow}>
                        <ImageIcon size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                        <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />
                        <TouchableOpacity onPress={pickImage} style={{ padding: 5, marginLeft: 5 }}>
                            <Text style={{ color: '#4F46E5', fontWeight: 'bold' }}>Pilih</Text>
                        </TouchableOpacity>
                    </View>
                    {imageUrl ? <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 200, borderRadius: 10, marginTop: 10 }} resizeMode="cover" /> : null}

                    <Text style={[styles.label, { marginTop: 15 }]}>Deskripsi</Text>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Save color="white" size={20} style={{ marginRight: 10 }} />
                        <Text style={styles.saveText}>Simpan Perubahan</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    backButton: { padding: 5 },
    content: { padding: 20 },
    formCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, shadowColor: '#000', elevation: 2 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, fontSize: 15, color: '#1F2937', marginBottom: 5 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2 },
    saveButton: { flexDirection: 'row', backgroundColor: '#4F46E5', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
    saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
