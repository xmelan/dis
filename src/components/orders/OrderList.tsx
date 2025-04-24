import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  client_name: string; // Se obtiene al hacer un join con la tabla `clients`
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          updated_at,
          client:clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear los datos para incluir el nombre del cliente
      const formattedData = data.map((order: any) => ({
        ...order,
        client_name: order.client?.name || 'Cliente desconocido',
      }));

      setOrders(formattedData || []);
    } catch (err) {
      console.error('Error al cargar las órdenes:', err);
      setError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Cargando órdenes...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Listado de Órdenes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Cliente</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Estado</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Monto Total</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Fecha de Creación</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Última Actualización</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2 text-sm text-gray-800">{order.client_name}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{order.status}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{order.total_amount.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {new Date(order.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderList;