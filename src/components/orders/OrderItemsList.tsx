import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string; // Se obtiene al hacer un join con la tabla `products`
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

function OrderItemsList() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderItems();
  }, []);

  const fetchOrderItems = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          quantity,
          unit_price,
          total_price,
          created_at,
          product:products(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear los datos para incluir el nombre del producto
      const formattedData = data.map((item: any) => ({
        ...item,
        product_name: item.product?.name || 'Producto desconocido',
      }));

      setOrderItems(formattedData || []);
    } catch (err) {
      console.error('Error al cargar los elementos de las órdenes:', err);
      setError('Error al cargar los elementos de las órdenes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Cargando elementos de las órdenes...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Listado de Elementos de Órdenes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID de Orden</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Producto</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Cantidad</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Precio Unitario</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Precio Total</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Fecha de Creación</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map(order => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2 text-sm text-gray-800">{order.order_id}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{order.product_name}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{order.quantity}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{order.unit_price.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{order.total_price.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderItemsList;