import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import gedebogImg from '../assets/gambar_gedebog.jpg';

const Home = () => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/catalog?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleAddToCart = (i) => {
        // Mocking product data for the home page since it uses static loop
        // Ideally this should fetch featured products like Catalog
        const product = {
            id: i + 100, // Offset ID to avoid conflict with catalog mock
            name: `Flavor Name ${i}`,
            price: 15000,
            image_url: 'https://placehold.co/400x400/png?text=Flavor',
            flavor: `Flavor ${i}`
        };
        addToCart(product);
        toast.success(`added to cart!`);
    };

    return (
        <Layout>
            <PageTransition>
                {/* Hero Section */}
                <div className="bg-primary/10 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between mb-16">
                    <div className="md:w-1/2 space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                            Crispy. Savory. <span className="text-primary-dark">Gedebog.</span>
                        </h1>
                        <p className="text-lg text-gray-600">
                            Experience the unique taste of authentic banana stem chips.
                            Healthy, delicious, and full of flavor.
                        </p>

                        {/* Search Flavour Bar */}
                        <form onSubmit={handleSearch} className="flex items-center w-full max-w-md bg-white rounded-4xl shadow-md overflow-hidden border border-gray-100 p-1">
                            <Search className="w-5 h-5 text-gray-400 ml-3" />
                            <input
                                type="text"
                                placeholder="Find your favorite flavor..."
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
                                Search
                            </motion.button>
                        </form>

                        <motion.div whileHover={{ x: 5 }}>
                            <Link to="/catalog" className="inline-flex items-center text-primary-dark font-semibold hover:underline mt-4">
                                Or browse all products <ArrowRight className="ml-2 w-5 h-5" />
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

                {/* Featured Section (Placeholder) */}
                <section>
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Popular Flavors</h2>
                        <Link to="/catalog" className="text-primary-dark font-medium hover:underline">View all</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                                <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                    <span className="text-gray-400">Flavor {i} Image</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Flavor Name {i}</h3>
                                <p className="text-gray-500 mb-4">Delicious description of flavor {i}.</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-primary-dark">Rp 15.000</span>
                                    <button
                                        onClick={() => handleAddToCart(i)}
                                        className="px-4 py-2 bg-primary/10 text-primary-dark rounded-lg hover:bg-primary/20 transition"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </PageTransition>
        </Layout>
    );
};

export default Home;
