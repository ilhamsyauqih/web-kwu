import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const Checkout = () => {
    const { cart, totalPrice, clearCart, sessionId } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        paymentMethod: 'cod'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sessionId) {
            toast.error('Session tidak valid. Silakan refresh halaman.');
            return;
        }

        if (cart.length === 0) {
            toast.error('Keranjang kosong!');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    session_id: sessionId,
                    total_amount: totalPrice,
                    status: 'pending',
                    shipping_address: `${formData.name} (${formData.phone}), ${formData.address}`
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Update product stock
            for (const item of cart) {
                const { error: stockError } = await supabase.rpc('decrement_stock', {
                    product_id: item.id,
                    quantity: item.quantity
                });

                if (stockError) {
                    console.warn('Failed to update stock for product:', item.id, stockError);
                }
            }

            // 4. Clear cart
            await clearCart();

            toast.success('Pesanan berhasil dibuat!');
            navigate('/orders');

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Gagal membuat pesanan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <PageTransition>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Pembayaran</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Shipping Form */}
                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Pengiriman</h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark outline-none"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark outline-none"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                <textarea
                                    name="address"
                                    rows="4"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark outline-none"
                                    value={formData.address}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Metode Pembayaran</h2>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                        className="text-primary-dark focus:ring-primary-dark"
                                    />
                                    <span>Bayar di Tempat (COD)</span>
                                </label>
                                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="transfer"
                                        checked={formData.paymentMethod === 'transfer'}
                                        onChange={handleChange}
                                        className="text-primary-dark focus:ring-primary-dark"
                                    />
                                    <span>Transfer Bank</span>
                                </label>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-8 rounded-xl shadow-sm h-fit">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Ringkasan Pesanan</h2>
                        <div className="space-y-4 mb-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="text-gray-600">{item.name} x {item.quantity}</span>
                                    <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-primary-dark">Rp {totalPrice.toLocaleString()}</span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            form="checkout-form"
                            disabled={loading || cart.length === 0}
                            className="w-full py-3 bg-primary-dark text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : 'Buat Pesanan'}
                        </motion.button>
                    </div>
                </div>
            </PageTransition>
        </Layout>
    );
};

export default Checkout;
