import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface NewProductForm {
  name: string;
  current_stock: number;
  unit: string;
  stock_threshold: number;
}

const initialForm: NewProductForm = {
  name: '',
  current_stock: 0,
  unit: '',
  stock_threshold: 10,
};

function NewProduct() {
  const [form, setForm] = useState<NewProductForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'current_stock' || name === 'stock_threshold' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.from('products').insert({
        name: form.name,
        current_stock: form.current_stock,
        unit: form.unit,
        stock_threshold: form.stock_threshold,
      });

      if (error) throw error;

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      console.error('Error al agregar el producto:', err);
      setError('Error al agregar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Producto</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Producto agregado exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Actual</label>
          <input
            type="number"
            name="current_stock"
            value={form.current_stock}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
            placeholder="ej: sacos, m³, unidades"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Umbral de Stock</label>
          <input
            type="number"
            name="stock_threshold"
            value={form.stock_threshold}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewProduct;