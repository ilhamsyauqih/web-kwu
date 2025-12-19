import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Home, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'bg-primary-dark text-white' : 'text-gray-600 hover:bg-gray-100';

    return (
        <div className="min-h-screen flex bg-gray-50/90 backdrop-blur-sm font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white/80 shadow-md flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-primary-dark">Admin Panel</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/admin')}`}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/stock" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/admin/stock')}`}>
                        <Package className="w-5 h-5" />
                        <span>Stock Management</span>
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                        <Home className="w-5 h-5" />
                        <span>Back to Store</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
