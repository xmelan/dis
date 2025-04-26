import { useState, useEffect } from 'react';
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
    <div className="p-6 pb-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Listado de Órdenes</h2>
      </div>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className='bg-gray-50'>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Monto Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de Creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Última Actualización</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="px-6 py-4 whitespace-nowrap">{order.client_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderList;