import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

            {cart.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
                    <Link to="/catalog" className="text-primary-dark hover:underline font-semibold">Start Shopping</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                        <img src={item.image_url || 'https://placehold.co/400x400'} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                        <p className="text-sm text-gray-500">Rp {item.price.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border rounded-lg">
                                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-600 hover:text-primary-dark disabled:opacity-50" disabled={item.quantity <= 1}><Minus className="w-4 h-4" /></motion.button>
                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-600 hover:text-primary-dark"><Plus className="w-4 h-4" /></motion.button>
                                    </div>
                                    <motion.button whileHover={{ scale: 1.1, color: '#ef4444' }} whileTap={{ scale: 0.9 }} onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2 text-gray-600">
                            <span>Subtotal</span>
                            <span>Rp {totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-gray-600">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6">
                            <span>Total</span>
                            <span>Rp {totalPrice.toLocaleString()}</span>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link to="/checkout" className="block w-full text-center bg-primary-dark text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                                Proceed to Checkout
                            </Link>
                        </motion.div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Cart;
