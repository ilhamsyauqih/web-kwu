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
            // Check if it's a numeric ID (Supabase usually) or check existing data source
            // Simple heuristic used here: try Supabase first, if not found/error, try LocalStorage

            // 1. Try Supabase Update
            const { data, error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)
                .select();

            // Only return if we actually updated rows in Supabase
            if (!error && data && data.length > 0) {
                toast.success('Status pesanan diperbarui (Database)!');
                fetchStats();
                return;
            }

            // 2. Fallback to LocalStorage if Supabase failed (or didn't find it)
            // Note: This assumes Supabase error implies "not found" or "connection issue", so we try local.
            const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const orderIndex = localOrders.findIndex(o => o.id == orderId);

            if (orderIndex !== -1) {
                localOrders[orderIndex].status = newStatus;
                localStorage.setItem('orders', JSON.stringify(localOrders));
                toast.success('Status pesanan diperbarui (Lokal)!');
                fetchStats();
            } else {
                // Only show error if we also failed locally and it wasn't a "row not found" silent fail
                if (error) console.error('Supabase update error:', error);
                // If clearly not found in either
                if (error && orderIndex === -1) toast.error('Gagal memperbarui status.');
            }

        } catch (err) {
            console.error('Update status error:', err);
            toast.error('Terjadi kesalahan saat memperbarui status.');
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            // 1. Fetch from Supabase (Attempt)
            let supabaseOrders = [];
            let supabaseOrderItems = [];

            try {
                const { data: orders, error: ordersError } = await supabase.from('orders').select('*');
                if (!ordersError && orders) supabaseOrders = orders;

                const { data: orderItems, error: itemsError } = await supabase.from('order_items').select('*');
                if (!itemsError && orderItems) supabaseOrderItems = orderItems;
            } catch (err) {
                console.log('Supabase fetch failed, proceeding with local data only.');
            }

            // 2. Fetch from Local Storage
            const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const localOrderItems = JSON.parse(localStorage.getItem('order_items') || '[]');

            // 3. Merge Data (Prioritizing unique IDs if possible, but for now simple concatenation)
            // Note: In a real app we might want to deduplicate by ID if syncing logic existed.
            const allOrders = [...supabaseOrders, ...localOrders];
            const allOrderItems = [...supabaseOrderItems, ...localOrderItems];

            if (allOrders.length > 0) {
                // Calculate Stats
                const revenue = allOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
                const uniqueCustomers = new Set(allOrders.map(o => o.shipping_address)).size;
                const totalItemsSold = allOrderItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

                setStats({
                    orders: allOrders.length,
                    revenue,
                    customers: uniqueCustomers,
                    itemsSold: totalItemsSold
                });

                // Prepare Recent Orders
                setRecentOrders(allOrders.slice(0, 5).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

                // Prepare Chart Data (Revenue per Day)
                const salesMap = {};
                allOrders.forEach(order => {
                    const date = new Date(order.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
                    salesMap[date] = (salesMap[date] || 0) + Number(order.total_amount);
                });

                const chartData = Object.keys(salesMap).map(date => ({
                    name: date,
                    sales: salesMap[date]
                }));

                setSalesData(chartData);

            } else {
                // 4. Mock Data (Only if ABSOLUTELY no data exists)
                setStats({ orders: 0, revenue: 0, customers: 0, itemsSold: 0 });
                setRecentOrders([]);
                setSalesData([]);
            }
        } catch (error) {
            console.error('Critical error in dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
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
                            <BarChart
                                data={salesData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
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
                    <div className="p-8 text-center text-gray-500">
                        Belum ada pesanan
                    </div>
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
                                                {!['pending', 'confirmed', 'shipped', 'completed', 'cancelled'].includes(order.status) && order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">Rp {Number(order.total_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
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
