import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Supplier {
  id: string;
  name: string;
}

interface InventoryEntryForm {
  supplier_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  entry_date: string;
  invoice_number: string;
  // notes: string;
}

const initialForm: InventoryEntryForm = {
  supplier_id: '',
  product_name: '',
  quantity: 0,
  unit: '',
  unit_price: 0,
  total_price: 0,
  entry_date: new Date().toISOString().split('T')[0],
  invoice_number: '',
  // notes: '',
};

function InventoryEntry() {
  const [form, setForm] = useState<InventoryEntryForm>(initialForm);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error al cargar suplidores:', err);
      setError('Error al cargar la lista de suplidores');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Automatically calculate total price when quantity or unit price changes
      if (name === 'quantity' || name === 'unit_price') {
        const quantity = name === 'quantity' ? parseFloat(value) : prev.quantity;
        const unitPrice = name === 'unit_price' ? parseFloat(value) : prev.unit_price;
        newForm.total_price = quantity * unitPrice;
      }
      
      return newForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.from('inventory_entries').insert({
        ...form,
        entry_date: new Date(form.entry_date).toISOString(),
      });

      if (error) throw error;

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      console.error('Error al guardar entrada:', err);
      setError('Error al guardar la entrada de inventario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Entrada de Inventario</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Entrada de inventario registrada exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suplidor
            </label>
            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Seleccionar suplidor</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto
            </label>
            <input
              type="text"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Unitario
            </label>
            <input
              type="number"
              name="unit_price"
              value={form.unit_price}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Total
            </label>
            <input
              type="number"
              name="total_price"
              value={form.total_price}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary bg-gray-50"
              required
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Entrada
            </label>
            <input
              type="date"
              name="entry_date"
              value={form.entry_date}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Factura
            </label>
            <input
              type="text"
              name="invoice_number"
              value={form.invoice_number}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
          />
        </div> */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Entrada'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InventoryEntry;