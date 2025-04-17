import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, DollarSign, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type ReportType = 'sales' | 'inventory' | 'financial';
type TimeRange = 'day' | 'week' | 'month' | 'year';

interface InventoryReport {
  totalValue: number;
  totalProducts: number;
  lowStockItems: number;
  recentMovements: {
    date: string;
    product: string;
    quantity: number;
    value: number;
  }[];
}

function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('inventory');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);

  useEffect(() => {
    if (selectedReport === 'inventory') {
      fetchInventoryReport();
    }
  }, [selectedReport, timeRange]);

  const fetchInventoryReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get date range based on selected time range
      const now = new Date();
      let startDate = new Date();
      switch (timeRange) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch inventory data
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_entries')
        .select('*')
        .gte('entry_date', startDate.toISOString())
        .order('entry_date', { ascending: false });

      if (inventoryError) throw inventoryError;

      // Calculate report metrics
      const totalValue = inventoryData?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
      const totalProducts = new Set(inventoryData?.map(item => item.product_name)).size;
      const lowStockItems = inventoryData?.filter(item => item.quantity < 10).length || 0;

      const recentMovements = (inventoryData || []).slice(0, 5).map(item => ({
        date: item.entry_date,
        product: item.product_name,
        quantity: item.quantity,
        value: item.total_price
      }));

      setInventoryReport({
        totalValue,
        totalProducts,
        lowStockItems,
        recentMovements
      });
    } catch (err) {
      console.error('Error fetching inventory report:', err);
      setError('Error al cargar el reporte de inventario');
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

  const reports = [
    {
      id: 'inventory',
      name: 'Reporte de Inventario',
      icon: Package,
      description: 'Estado actual del inventario y movimientos'
    },
    {
      id: 'sales',
      name: 'Reporte de Ventas',
      icon: TrendingUp,
      description: 'Análisis detallado de ventas por período'
    },
    {
      id: 'financial',
      name: 'Reporte Financiero',
      icon: DollarSign,
      description: 'Resumen financiero y análisis de ganancias'
    }
  ];

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Cargando reporte...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    switch (selectedReport) {
      case 'inventory':
        if (!inventoryReport) return null;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-blue-800 font-semibold mb-2">Valor Total del Inventario</h4>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(inventoryReport.totalValue)}
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-green-800 font-semibold mb-2">Total de Productos</h4>
                <p className="text-2xl font-bold text-green-900">
                  {inventoryReport.totalProducts}
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <h4 className="text-red-800 font-semibold mb-2">Productos con Stock Bajo</h4>
                <p className="text-2xl font-bold text-red-900">
                  {inventoryReport.lowStockItems}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <h4 className="text-lg font-semibold p-4 border-b">
                Movimientos Recientes
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryReport.recentMovements.map((movement, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-6 py-4">{formatDate(movement.date)}</td>
                        <td className="px-6 py-4">{movement.product}</td>
                        <td className="px-6 py-4 text-right">{movement.quantity}</td>
                        <td className="px-6 py-4 text-right">
                          {formatCurrency(movement.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'sales':
      case 'financial':
        return (
          <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center text-gray-500">
              <BarChart className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">
                Este reporte estará disponible próximamente
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reportes</h2>
        <p className="text-gray-600">Seleccione un reporte para visualizar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id as ReportType)}
            className={`p-6 rounded-lg shadow-md transition-all ${
              selectedReport === report.id
                ? 'bg-primary text-white scale-105'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <report.icon className={`w-8 h-8 ${
                selectedReport === report.id ? 'text-white' : 'text-primary'
              }`} />
              <div className="text-left">
                <h3 className={`font-semibold ${
                  selectedReport === report.id ? 'text-white' : 'text-gray-800'
                }`}>
                  {report.name}
                </h3>
                <p className={
                  selectedReport === report.id ? 'text-white/90' : 'text-gray-600'
                }>
                  {report.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {reports.find(r => r.id === selectedReport)?.name}
          </h3>
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {renderReportContent()}
      </div>
    </div>
  );
}

export default Reports;