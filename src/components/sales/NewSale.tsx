import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Client {
  id: string;
  name: string;
}

interface NewSaleForm {
  client_id: string;
  invoice_number: string;
  sale_date: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'completed';
}

const initialForm: NewSaleForm = {
  client_id: '',
  invoice_number: '',
  sale_date: new Date().toISOString().split('T')[0],
  total_amount: 0,
  status: 'pending',
  payment_status: 'pending',
};

function NewSale() {
  const [form, setForm] = useState<NewSaleForm>(initialForm);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('id, name').order('name');
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar la lista de clientes');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'total_amount' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.from('sales').insert({
        client_id: form.client_id,
        invoice_number: form.invoice_number,
        sale_date: new Date(form.sale_date).toISOString(),
        total_amount: form.total_amount,
        status: form.status,
        payment_status: form.payment_status,
      });

      if (error) throw error;

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      console.error('Error al registrar la venta:', err);
      setError('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Venta</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Venta registrada exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <select
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Seleccionar cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número de Factura</label>
          <input
            type="text"
            name="invoice_number"
            value={form.invoice_number}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Venta</label>
          <input
            type="date"
            name="sale_date"
            value={form.sale_date}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monto Total</label>
          <input
            type="number"
            name="total_amount"
            value={form.total_amount}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
          >
            <option value="pending">Pendiente</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Pago</label>
          <select
            name="payment_status"
            value={form.payment_status}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            required
          >
            <option value="pending">Pendiente</option>
            <option value="partial">Parcial</option>
            <option value="completed">Completado</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Venta'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewSale;