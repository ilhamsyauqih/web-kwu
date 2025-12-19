import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { totalItems } = useCart();

    return (
        <nav className="bg-white/60 backdrop-blur-md shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary-dark">
                            Gedebog<span className="text-orange-500">Chips</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink
                            to="/"
                            className={({ isActive }) => `transition pb-1 ${isActive ? 'text-primary-dark border-b-2 border-primary-dark font-medium' : 'text-gray-700 hover:text-primary-dark'}`}
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/catalog"
                            className={({ isActive }) => `transition pb-1 ${isActive ? 'text-primary-dark border-b-2 border-primary-dark font-medium' : 'text-gray-700 hover:text-primary-dark'}`}
                        >
                            Catalog
                        </NavLink>
                        <NavLink
                            to="/about"
                            className={({ isActive }) => `transition pb-1 ${isActive ? 'text-primary-dark border-b-2 border-primary-dark font-medium' : 'text-gray-700 hover:text-primary-dark'}`}
                        >
                            About
                        </NavLink>

                        <div className="flex items-center space-x-4">
                            <Link to="/cart" className="relative text-gray-700 hover:text-primary-dark">
                                <ShoppingCart className="w-6 h-6" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                            {/* Placeholder for User/Admin */}
                            <Link to="/admin" className="text-gray-700 hover:text-primary-dark">
                                <User className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>

                    <div className="md:hidden flex items-center space-x-4">
                        <Link to="/cart" className="relative text-gray-700 hover:text-primary-dark">
                            <ShoppingCart className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/90 backdrop-blur-md border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
                        <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Home</Link>
                        <Link to="/catalog" className="block px-3 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Catalog</Link>
                        <Link to="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>About</Link>
                        <Link to="/cart" className="block px-3 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Cart</Link>
                        <Link to="/admin" className="block px-3 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Admin</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
