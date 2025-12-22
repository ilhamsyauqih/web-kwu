import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const Catalog = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('q') || '';

    // Mock data fallback
    const mockProducts = [
        { id: 1, name: 'Gedebog Original', description: 'Keripik batang pisang renyah klasik.', price: 15000, flavor: 'Original', stock: 100, image_url: 'https://placehold.co/400x400/png?text=Original' },
        { id: 2, name: 'Gedebog Balado', description: 'Rasa balado pedas dan gurih.', price: 16000, flavor: 'Balado', stock: 80, image_url: 'https://placehold.co/400x400/png?text=Balado' },
        { id: 3, name: 'Gedebog Keju', description: 'Rasa keju yang kaya.', price: 17000, flavor: 'Keju', stock: 50, image_url: 'https://placehold.co/400x400/png?text=Cheese' },
        { id: 4, name: 'Gedebog BBQ', description: 'Rasa BBQ asap.', price: 16000, flavor: 'BBQ', stock: 60, image_url: 'https://placehold.co/400x400/png?text=BBQ' },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase.from('products').select('*');
                if (error) throw error;
                if (data && data.length > 0) {
                    setProducts(data);
                } else {
                    setProducts(mockProducts);
                }
            } catch (err) {
                console.log('Supabase not connected or empty, using mock data:', err.message);
                setProducts(mockProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.flavor && product.flavor.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <Layout><div className="text-center py-20">Memuat produk...</div></Layout>;

    return (
        <Layout>
            <PageTransition>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Katalog Produk
                    {searchTerm && <span className="text-lg font-normal text-gray-500 ml-4">Hasil untuk "{searchTerm}"</span>}
                </h1>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Tidak ada produk yang ditemukan untuk "{searchTerm}".
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="h-48 bg-gray-100 relative">
                                    <img src={product.image_url || 'https://placehold.co/400x400'} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{product.flavor}</p>
                                    <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="font-bold text-primary-dark">Rp {product.price.toLocaleString()}</span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                addToCart(product);
                                                toast.success('Ditambahkan ke keranjang!');
                                            }}
                                            className="px-3 py-1.5 bg-primary-dark text-white rounded hover:bg-green-700 transition text-sm"
                                        >
                                            Tambah ke Keranjang
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </PageTransition>
        </Layout>
    );
};

export default Catalog;
