import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, Plus, Edit, X, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Stock = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        flavor: '',
        image_url: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id');

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            toast.error('Gagal memuat produk');
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
            const { error } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', id);

            if (error) throw error;
            toast.success('Stock updated!');
        } catch (err) {
            console.error('Error updating stock:', err);
            toast.error('Gagal update stock');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('Ukuran gambar maksimal 2MB');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            flavor: '',
            image_url: ''
        });
        setImageFile(null);
        setImagePreview('');
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            flavor: product.flavor || '',
            image_url: product.image_url || ''
        });
        setImageFile(null);
        setImagePreview(product.image_url || '');
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = formData.image_url;

            // Upload new image if selected
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                flavor: formData.flavor,
                image_url: imageUrl
            };

            if (editingProduct) {
                // Update existing product
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id);

                if (error) throw error;
                toast.success('Produk berhasil diupdate!');
            } else {
                // Add new product
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);

                if (error) throw error;
                toast.success('Produk berhasil ditambahkan!');
            }

            setShowModal(false);
            fetchProducts();
        } catch (err) {
            console.error('Error saving product:', err);
            toast.error('Gagal menyimpan produk');
        } finally {
            setUploading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Produk berhasil dihapus!');
            fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Gagal menghapus produk');
        }
    };

    if (loading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Stock Management</h1>
                <button
                    onClick={openAddModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-green-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Image</th>
                            <th className="px-6 py-3">Product Name</th>
                            <th className="px-6 py-3">Flavor</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Stock</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <img
                                        src={product.image_url || 'https://placehold.co/50x50/png?text=No+Image'}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                </td>
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
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => saveStock(product.id, product.stock)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="Save Stock"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="text-green-600 hover:text-green-800 p-1"
                                            title="Edit Product"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="Delete Product"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Image
                                </label>
                                <div className="flex items-center space-x-4">
                                    {imagePreview && (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-lg border"
                                        />
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-dark transition">
                                            <div className="flex items-center justify-center space-x-2 text-gray-600">
                                                <Upload className="w-5 h-5" />
                                                <span className="text-sm">
                                                    {imageFile ? imageFile.name : 'Choose image or drop here'}
                                                </span>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Max 2MB. JPG, PNG, WebP</p>
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark outline-none"
                                    placeholder="e.g., Gedebog Original"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark outline-none"
                                    placeholder="Product description"
                                ></textarea>
                            </div>

                            {/* Flavor and Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Flavor *
                                    </label>
                                    <input
                                        type="text"
                                        name="flavor"
                                        required
                                        value={formData.flavor}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark outline-none"
                                        placeholder="e.g., Original"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark outline-none"
                                        placeholder="15000"
                                    />
                                </div>
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Initial Stock *
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    required
                                    value={formData.stock}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark outline-none"
                                    placeholder="100"
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stock;
