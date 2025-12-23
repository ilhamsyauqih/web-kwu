import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import gedebogImg from '../assets/gambar_gedebog.jpg';

const Home = () => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .limit(3);

                if (error) throw error;
                setFeaturedProducts(data || []);
            } catch (err) {
                console.error('Error fetching featured products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/catalog?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`${product.name} ditambahkan ke keranjang!`);
    };

    return (
        <Layout>
            <PageTransition>
                {/* Hero Section */}
                <div className="bg-primary/10 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between mb-16">
                    <div className="md:w-1/2 space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                            Renyah. Gurih. <span className="text-primary-dark">Gedebog.</span>
                        </h1>
                        <p className="text-lg text-gray-600">
                            Rasakan cita rasa unik keripik batang pisang asli.
                            Sehat, lezat, dan penuh rasa.
                        </p>

                        {/* Search Flavour Bar */}
                        <form onSubmit={handleSearch} className="flex items-center w-full max-w-md bg-white rounded-4xl shadow-md overflow-hidden border border-gray-100 p-1">
                            <Search className="w-5 h-5 text-gray-400 ml-3" />
                            <input
                                type="text"
                                placeholder="Cari rasa favoritmu..."
                                className="w-full px-4 py-3 outline-none text-gray-700 bg-transparent placeholder-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary-dark text-white px-6 py-2 rounded-3xl font-medium hover:bg-green-700 transition mx-1"
                            >
                                Cari
                            </motion.button>
                        </form>

                        <motion.div whileHover={{ x: 5 }}>
                            <Link to="/catalog" className="inline-flex items-center text-primary-dark font-semibold hover:underline mt-4">
                                Vau lihat semua produk <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                    <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
                        {/* Placeholder for Hero Image */}
                        <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-full shadow-xl flex items-center justify-center overflow-hidden">
                            <img src={gedebogImg} alt="Gedebog Chips" className="object-cover w-full h-full" />
                        </div>
                    </div>
                </div>

                {/* Featured Section */}
                <section>
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Rasa Terpopuler</h2>
                        <Link to="/catalog" className="text-primary-dark font-medium hover:underline">Lihat semua</Link>
                    </div>
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Memuat produk...</div>
                    ) : featuredProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">Belum ada produk tersedia</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
                                    whileHover={{ y: -5 }}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                        <img
                                            src={product.image_url || 'https://placehold.co/400x400/png?text=Product'}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{product.flavor}</p>
                                    <p className="text-gray-600 text-sm mb-4">{product.description || 'Keripik batang pisang yang lezat.'}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-primary-dark">Rp {product.price.toLocaleString()}</span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleAddToCart(product)}
                                            className="px-4 py-2 bg-primary/10 text-primary-dark rounded-lg hover:bg-primary/20 transition"
                                        >
                                            Tambah
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </PageTransition>
        </Layout>
    );
};

export default Home;
