import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions, Image } from 'react-native';
import * as Database from '../services/Database';
import { Item } from '../types';
import { randomUUID } from 'expo-crypto';
import { ChevronLeft, Camera, Upload } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

export const AddItemScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomCat, setIsCustomCat] = useState(false);
    const [price, setPrice] = useState('');
    const [hourlyPrice, setHourlyPrice] = useState('');
    const [stock, setStock] = useState('1');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            const dbCats = Database.getCategories();
            // Default categories if DB is empty or has few
            const defaults = ['Kamera', 'Lensa', 'Lighting', 'Audio', 'Tripod', 'Drone', 'Aksesoris'];
            const unique = Array.from(new Set([...defaults, ...dbCats]));
            setCategories(unique);
            if (!category) setCategory(unique[0]);
        }, [])
    );

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
        if (!name || !price) {
            Alert.alert('Error', 'Nama dan Harga harus diisi!');
            return;
        }

        try {
            const finalCategory = isCustomCat ? customCategory : category;
            if (!finalCategory) {
                Alert.alert('Error', 'Kategori harus diisi!');
                return;
            }

            const newItem: Item = {
                id: randomUUID(),
                name,
                category: finalCategory,
                pricePerDay: parseFloat(price),
                pricePerHour: hourlyPrice ? parseFloat(hourlyPrice) : 0,
                stock: parseInt(stock) || 1,
                status: 'available',
                description,
                imageUrl
            };

            Database.addItem(newItem);
            Alert.alert('Sukses', 'Barang berhasil ditambahkan', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#4F46E5', '#4338CA']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tambah Barang</Text>
                    <View style={{ width: 28 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 50 }}>
                {/* Image Placeholder */}
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imagePlaceholder}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
                        ) : (
                            <Camera size={40} color="#D1D5DB" />
                        )}
                        <Text style={styles.imageText}>{imageUrl ? 'Ganti Gambar' : 'Pilih Gambar'}</Text>
                    </TouchableOpacity>
                    <TextInput
                        style={styles.urlInput}
                        placeholder="Atau tempel URL gambar..."
                        value={imageUrl}
                        onChangeText={setImageUrl}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Nama Barang</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Contoh: Sony Alpha A7 III" placeholderTextColor="#9CA3AF" />

                    <Text style={styles.label}>Kategori</Text>
                    <View style={styles.categoryContainer}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, !isCustomCat && category === cat && styles.chipActive]}
                                onPress={() => { setCategory(cat); setIsCustomCat(false); }}
                            >
                                <Text style={[styles.chipText, !isCustomCat && category === cat && styles.chipTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.chip, isCustomCat && styles.chipActive]}
                            onPress={() => setIsCustomCat(true)}
                        >
                            <Text style={[styles.chipText, isCustomCat && styles.chipTextActive]}>+ Baru</Text>
                        </TouchableOpacity>
                    </View>
                    {isCustomCat && (
                        <TextInput
                            style={[styles.input, { marginTop: -10 }]}
                            value={customCategory}
                            onChangeText={setCustomCategory}
                            placeholder="Ketik nama kategori baru..."
                        />
                    )}

                    <Text style={styles.label}>Stok Barang (Unit)</Text>
                    <TextInput
                        style={styles.input}
                        value={stock}
                        onChangeText={setStock}
                        keyboardType="numeric"
                        placeholder="1"
                    />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Harga Harian</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.currencyPrefix}>Rp</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Harga Per Jam</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.currencyPrefix}>Rp</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={hourlyPrice}
                                    onChangeText={setHourlyPrice}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.label}>Deskripsi</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Jelaskan kondisi dan kelengkapan barang..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                        <Text style={styles.buttonText}>Simpan Barang</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
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
    formContainer: {
        flex: 1,
        marginTop: -20,
    },
    imageSection: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    imageText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 5,
    },
    urlInput: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        fontSize: 14,
    },
    card: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 5,
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
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
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
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    chipText: {
        fontSize: 14,
        color: '#6B7280',
    },
    chipTextActive: {
        color: '#4F46E5',
        fontWeight: '600',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        marginBottom: 15,
    },
    currencyPrefix: {
        paddingLeft: 15,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    priceInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#4F46E5',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
