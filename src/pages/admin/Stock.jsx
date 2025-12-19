import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, Plus } from 'lucide-react';

const Stock = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data fallback
    const mockProducts = [
        { id: 1, name: 'Gedebog Original', flavor: 'Original', stock: 100, price: 15000 },
        { id: 2, name: 'Gedebog Balado', flavor: 'Balado', stock: 80, price: 16000 },
        { id: 3, name: 'Gedebog Cheese', flavor: 'Cheese', stock: 50, price: 17000 },
    ];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('products').select('*').order('id');
            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.log('Error fetching products (using mock):', err.message);
            setProducts(mockProducts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleStockChange = (id, newStock) => {
        setProducts(products.map(p => p.id === id ? { ...p, stock: parseInt(newStock) || 0 } : p));
    };

    const saveStock = async (id, newStock) => {
        try {
            const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
            if (error) throw error;
            alert('Stock updated!');
        } catch (err) {
            console.error('Error updating stock:', err);
            alert('Stock updated (Simulation)!');
        }
    };

    if (loading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Stock Management</h1>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-green-700 transition">
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Product Name</th>
                            <th className="px-6 py-3">Flavor</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Current Stock</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500">#{product.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 text-gray-600">{product.flavor}</td>
                                <td className="px-6 py-4 text-gray-600">Rp {product.price.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        value={product.stock}
                                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                                        className="w-24 px-3 py-1 border rounded focus:ring focus:ring-primary/20 outline-none"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => saveStock(product.id, product.stock)}
                                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Stock;
