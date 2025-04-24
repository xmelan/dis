import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: string;
    name: string;
    current_stock: number;
    unit: string;
    stock_threshold: number;
    created_at: string;
    updated_at: string;
}

function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Error al cargar los productos:', err);
            setError('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigateToNewProduct = () => {
        navigate('/productos/nuevo');
    }

    if (loading) return <div className="p-4">Cargando productos...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (

        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Listado de Productos</h2>
                <button
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={handleNavigateToNewProduct}
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nombre</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Stock Actual</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Unidad</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Umbral de Stock</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Última Actualización</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-t">
                                <td className="px-4 py-2 text-sm text-gray-800">{product.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{product.current_stock}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{product.unit}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{product.stock_threshold}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">
                                    {new Date(product.updated_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductList;