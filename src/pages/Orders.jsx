import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getSessionId } from '../lib/sessionManager';
import Layout from '../components/Layout';
import PageTransition from '../components/PageTransition';
import { Link } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyOrders = async () => {
        setLoading(true);
        try {
            const sessionId = getSessionId();

            if (!sessionId) {
                setOrders([]);
                setLoading(false);
                return;
            }

            // Fetch orders for this session
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            if (!ordersData || ordersData.length === 0) {
                setOrders([]);
                setLoading(false);
                return;
            }

            // Fetch order items with product details for each order
            const ordersWithItems = await Promise.all(ordersData.map(async (order) => {
                const { data: items, error: itemsError } = await supabase
                    .from('order_items')
                    .select(`
                        *,
                        products (
                            id,
                            name,
                            image_url
                        )
                    `)
                    .eq('order_id', order.id);

                if (itemsError) {
                    console.error('Error fetching items for order:', order.id, itemsError);
                    return { ...order, items: [] };
                }

                // Transform items to include product info
                const transformedItems = items.map(item => ({
                    ...item,
                    name: item.products?.name || `Product ${item.product_id}`,
                    image_url: item.products?.image_url || 'https://placehold.co/100x100/png?text=Product',
                    price: item.price_at_purchase
                }));

                return {
                    ...order,
                    items: transformedItems
                };
            }));

            setOrders(ordersWithItems);

        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();

        const sessionId = getSessionId();
        if (!sessionId) return;

        // Real-time subscription for order status updates
        const subscription = supabase
            .channel('my-orders')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `session_id=eq.${sessionId}`
                },
                () => {
                    // Reload orders when status changes
                    fetchMyOrders();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <Layout>
            <PageTransition>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>

                {loading ? (
                    <div className="text-center py-20">Memuat pesanan...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg mb-4">Anda belum memiliki pesanan.</p>
                        <Link to="/catalog" className="text-primary-dark hover:underline font-semibold">Mulai Belanja</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                {/* Order Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-lg text-gray-900">Order #{order.id}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-800' :
                                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                {order.status === 'pending' && 'Menunggu'}
                                                {order.status === 'confirmed' && 'Diterima'}
                                                {order.status === 'shipped' && 'Dikirim'}
                                                {order.status === 'completed' && 'Selesai'}
                                                {order.status === 'cancelled' && 'Batal'}
                                                {!['pending', 'confirmed', 'shipped', 'completed', 'cancelled'].includes(order.status) && order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                                        <p className="text-sm text-gray-600">{order.shipping_address.split(',')[0]}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-right">
                                        <p className="text-gray-500 text-sm">Total Belanja</p>
                                        <p className="text-xl font-bold text-primary-dark">Rp {Number(order.total_amount).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Products List */}
                                {order.items && order.items.length > 0 && (
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Produk yang Dipesan:</h4>
                                        <div className="space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                                    <img
                                                        src={item.image_url || 'https://placehold.co/60x60/png?text=Product'}
                                                        alt={item.name || 'Product'}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-grow">
                                                        <p className="font-medium text-gray-900 text-sm">{item.name || `Product ${item.product_id}`}</p>
                                                        <p className="text-xs text-gray-500">Jumlah: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-gray-900">Rp {Number(item.price * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </PageTransition>
        </Layout>
    );
};

export default Orders;
