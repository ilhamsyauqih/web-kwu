import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ orders: 0, revenue: 0, customers: 0, itemsSold: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            toast.success('Status pesanan diperbarui!');
        } catch (err) {
            console.error('Update status error:', err);
            toast.error('Gagal memperbarui status.');
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch all orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch all order items
            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('*');

            if (itemsError) throw itemsError;

            if (orders && orders.length > 0) {
                // Calculate Stats
                const revenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
                const uniqueCustomers = new Set(orders.map(o => o.session_id)).size;
                const totalItemsSold = orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

                setStats({
                    orders: orders.length,
                    revenue,
                    customers: uniqueCustomers,
                    itemsSold: totalItemsSold
                });

                // Recent Orders (top 10)
                setRecentOrders(orders.slice(0, 10));

                // Prepare Chart Data (Revenue per Day)
                const salesMap = {};
                orders.forEach(order => {
                    const date = new Date(order.created_at).toLocaleDateString('id-ID', {
                        month: 'short',
                        day: 'numeric'
                    });
                    salesMap[date] = (salesMap[date] || 0) + Number(order.total_amount);
                });

                const chartData = Object.keys(salesMap)
                    .slice(-7)
                    .map(date => ({
                        name: date,
                        sales: salesMap[date]
                    }));

                setSalesData(chartData);
            } else {
                setStats({ orders: 0, revenue: 0, customers: 0, itemsSold: 0 });
                setRecentOrders([]);
                setSalesData([]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Real-time subscription for orders
        const ordersSubscription = supabase
            .channel('dashboard-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                },
                () => {
                    fetchStats();
                }
            )
            .subscribe();

        // Real-time subscription for order items
        const itemsSubscription = supabase
            .channel('dashboard-items')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'order_items'
                },
                () => {
                    fetchStats();
                }
            )
            .subscribe();

        return () => {
            ordersSubscription.unsubscribe();
            itemsSubscription.unsubscribe();
        };
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Sales Dashboard</h1>
                <button onClick={fetchStats} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 text-gray-600">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">Rp {stats.revenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.orders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-medium">Total Items Sold</h3>
                    <p className="text-2xl font-bold text-primary-dark mt-2">{stats.itemsSold}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Active Customers</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.customers}</p>
                </div>
            </div>

            {/* Sales Chart */}
            {salesData.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Analytics</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: '#f0fdf4' }} />
                                <Legend />
                                <Bar dataKey="sales" fill="#22C55E" name="Revenue (Rp)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                </div>
                {recentOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Belum ada pesanan</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Order ID</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{order.shipping_address.split('(')[0]}</td>
                                        <td className="px-6 py-4">
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
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">Rp {Number(order.total_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="block w-full px-2 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                            >
                                                <option value="pending">Menunggu</option>
                                                <option value="confirmed">Diterima</option>
                                                <option value="shipped">Dikirim</option>
                                                <option value="completed">Selesai</option>
                                                <option value="cancelled">Batal</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
