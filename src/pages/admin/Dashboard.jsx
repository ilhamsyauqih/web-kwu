import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ orders: 0, revenue: 0, customers: 0, itemsSold: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch Orders
            const { data: orders, error: ordersError } = await supabase.from('orders').select('*');
            if (ordersError) throw ordersError;

            // Fetch Order Items for Total Sold count
            const { data: orderItems, error: itemsError } = await supabase.from('order_items').select('*');
            if (itemsError) throw itemsError;

            if (orders) {
                // Calculate Stats
                const revenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
                const uniqueCustomers = new Set(orders.map(o => o.shipping_address)).size;
                // Calculate total items sold from order_items
                const totalItemsSold = orderItems ? orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

                setStats({
                    orders: orders.length,
                    revenue,
                    customers: uniqueCustomers,
                    itemsSold: totalItemsSold
                });

                // Prepare Recent Orders
                setRecentOrders(orders.slice(0, 5).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

                // Prepare Chart Data (Revenue per Day)
                const salesMap = {};
                orders.forEach(order => {
                    const date = new Date(order.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
                    salesMap[date] = (salesMap[date] || 0) + Number(order.total_amount);
                });

                const chartData = Object.keys(salesMap).map(date => ({
                    name: date,
                    sales: salesMap[date]
                }));

                // Sort chart data by date if possible, or just keys
                setSalesData(chartData);
            }
        } catch (error) {
            console.log('Error fetching stats (using mock):', error.message);
            // Mock Data
            setStats({ orders: 124, revenue: 15400000, customers: 89, itemsSold: 342 });
            setRecentOrders([
                { id: 101, shipping_address: 'John Doe', total_amount: 45000, status: 'pending', created_at: new Date().toISOString() },
                { id: 100, shipping_address: 'Jane Smith', total_amount: 32000, status: 'shipped', created_at: new Date(Date.now() - 86400000).toISOString() },
            ]);
            setSalesData([
                { name: '12/15', sales: 150000 },
                { name: '12/16', sales: 230000 },
                { name: '12/17', sales: 180000 },
                { name: '12/18', sales: 320000 },
                { name: '12/19', sales: 250000 },
            ]);
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

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Date</th>
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
                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">Rp {Number(order.total_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
