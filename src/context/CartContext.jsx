import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getOrCreateSession } from '../lib/sessionManager';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize session and load cart
    useEffect(() => {
        const initializeCart = async () => {
            try {
                const session = await getOrCreateSession();
                setSessionId(session);
                await loadCart(session);
            } catch (error) {
                console.error('Error initializing cart:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeCart();
    }, []);

    // Real-time subscription for cart changes
    useEffect(() => {
        if (!sessionId) return;

        const subscription = supabase
            .channel('cart-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'cart_items',
                    filter: `session_id=eq.${sessionId}`
                },
                () => {
                    // Reload cart when changes detected
                    loadCart(sessionId);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [sessionId]);

    // Load cart from database
    const loadCart = async (session) => {
        try {
            const { data: cartItems, error } = await supabase
                .from('cart_items')
                .select(`
                    id,
                    quantity,
                    product_id,
                    products (
                        id,
                        name,
                        price,
                        image_url,
                        flavor,
                        stock
                    )
                `)
                .eq('session_id', session);

            if (error) throw error;

            // Transform data to match cart structure
            const transformedCart = cartItems.map(item => ({
                id: item.products.id,
                name: item.products.name,
                price: item.products.price,
                image_url: item.products.image_url,
                flavor: item.products.flavor,
                stock: item.products.stock,
                quantity: item.quantity,
                cartItemId: item.id
            }));

            setCart(transformedCart);
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const addToCart = async (product) => {
        if (!sessionId) return;

        try {
            // Check if item already exists in cart
            const { data: existing } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('session_id', sessionId)
                .eq('product_id', product.id)
                .single();

            if (existing) {
                // Update quantity
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + 1 })
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                // Insert new item
                const { error } = await supabase
                    .from('cart_items')
                    .insert([{
                        session_id: sessionId,
                        product_id: product.id,
                        quantity: 1
                    }]);

                if (error) throw error;
            }

            // Optimistic update
            setCart((prevCart) => {
                const existingItem = prevCart.find((item) => item.id === product.id);
                if (existingItem) {
                    return prevCart.map((item) =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                }
                return [...prevCart, { ...product, quantity: 1 }];
            });

        } catch (error) {
            console.error('Error adding to cart:', error);
            // Reload cart to sync state
            await loadCart(sessionId);
        }
    };

    const removeFromCart = async (productId) => {
        if (!sessionId) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('session_id', sessionId)
                .eq('product_id', productId);

            if (error) throw error;

            // Optimistic update
            setCart((prevCart) => prevCart.filter((item) => item.id !== productId));

        } catch (error) {
            console.error('Error removing from cart:', error);
            // Reload cart to sync state
            await loadCart(sessionId);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!sessionId || quantity < 1) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('session_id', sessionId)
                .eq('product_id', productId);

            if (error) throw error;

            // Optimistic update
            setCart((prevCart) =>
                prevCart.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                )
            );

        } catch (error) {
            console.error('Error updating quantity:', error);
            // Reload cart to sync state
            await loadCart(sessionId);
        }
    };

    const clearCart = async () => {
        if (!sessionId) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('session_id', sessionId);

            if (error) throw error;

            setCart([]);

        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
            loading,
            sessionId
        }}>
            {children}
        </CartContext.Provider>
    );
};
