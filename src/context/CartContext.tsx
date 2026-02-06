import React, { createContext, useContext, useState } from 'react';
import { Item } from '../types';

export interface CartItem extends Item {
    quantity: number; // Always 1 for unique rentals, but good structure
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Item) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    isInCart: (itemId: string) => boolean;
    updateQuantity: (itemId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (item: Item) => {
        setItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    const clearCart = () => setItems([]);

    const isInCart = (itemId: string) => !!items.find(i => i.id === itemId);

    const updateQuantity = (itemId: string, quantity: number) => {
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
