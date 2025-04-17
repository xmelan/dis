import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertTriangle, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalInventory: number;
  totalSales: number;
  lowStock: number;
  pendingOrders: number;
}

interface InventoryEntry {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  entry_date: string;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInventory: 0,
    totalSales: 0,
    lowStock: 0,
    pendingOrders: 0
  });
  const [recentProducts, setRecentProducts] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent inventory entries
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_entries')
        .select('*')
        .order('entry_date', { ascending: false })
        .limit(4);

      if (inventoryError) throw inventoryError;

      // Calculate total inventory value
      const { data: totalInventoryData, error: totalError } = await supabase
        .from('inventory_entries')
        .select('total_price')
        .not('total_price', 'is', null);

      if (totalError) throw totalError;

      const totalInventoryValue = totalInventoryData.reduce(
        (sum, item) => sum + (item.total_price || 0),
        0
      );

      // Count products with low stock
     // Count products with low stock - Solución práctica
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('products')
        .select('id, current_stock, stock_threshold')
        .then(({ data, error }) => {
          if (error) throw error;
          return {
            data: data?.filter(product => product.current_stock <= product.stock_threshold),
            error: null
          };
        });
      
      if (lowStockError) throw lowStockError;

      // Count pending orders
      const { data: pendingOrdersData, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending');

      if (ordersError) throw ordersError;

      setStats({
        totalInventory: totalInventoryValue,
        totalSales: totalInventoryData.length || 0,
        lowStock: lowStockData?.length || 0,
        pendingOrders: pendingOrdersData?.length || 0
      });

      setRecentProducts(inventoryData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="p-8">Cargando datos del dashboard...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const statCards = [
    {
      title: 'Total Inventario',
      value: formatCurrency(stats.totalInventory),
      icon: Package,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Entradas del Mes',
      value: stats.totalSales,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800',
    },
    {
      title: 'Órdenes Pendientes',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Bienvenido al sistema de inventario de DICONEX</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <h3 className="text-gray-600">{stat.title}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Inventario Reciente</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-right py-3 px-4">Cantidad</th>
                <th className="text-right py-3 px-4">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3 px-4">{formatDate(product.entry_date)}</td>
                  <td className="py-3 px-4">{product.product_name}</td>
                  <td className="text-right py-3 px-4">{product.quantity}</td>
                  <td className="text-right py-3 px-4">{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;