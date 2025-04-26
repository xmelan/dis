import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit, Trash2, X, AlertCircle, Save } from 'lucide-react';

interface InventoryEntry {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  entry_date: string;
  invoice_number: string;
  notes: string;
  supplier: {
    name: string;
    contact_person: string;
    phone: string;
  };
  supplier_id: string;
}

interface Supplier {
  id: string;
  name: string;
}

function InventoryList() {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<InventoryEntry | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<Partial<InventoryEntry>>({});

  useEffect(() => {
    fetchInventoryEntries();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedEntry && showEditModal) {
      setEditForm({
        product_name: selectedEntry.product_name,
        quantity: selectedEntry.quantity,
        unit: selectedEntry.unit,
        unit_price: selectedEntry.unit_price,
        entry_date: new Date(selectedEntry.entry_date).toISOString().split('T')[0],
        invoice_number: selectedEntry.invoice_number,
        notes: selectedEntry.notes,
        supplier_id: selectedEntry.supplier_id
      });
    }
  }, [selectedEntry, showEditModal]);

  const fetchInventoryEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_entries')
        .select(`
          *,
          supplier:suppliers(
            name,
            contact_person,
            phone
          )
        `)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError('Error al cargar el inventario');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error al cargar los suplidores:', err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(entries.filter(entry => entry.id !== id));
      setShowDeleteModal(false);
      setSelectedEntry(null);
    } catch (err) {
      console.error('Error al eliminar la entrada:', err);
      setError('Error al eliminar la entrada de inventario');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    setEditLoading(true);
    try {
      const quantity = Number(editForm.quantity);
      const unitPrice = Number(editForm.unit_price);
      const totalPrice = quantity * unitPrice;

      const { error } = await supabase
        .from('inventory_entries')
        .update({
          ...editForm,
          total_price: totalPrice
        })
        .eq('id', selectedEntry.id);

      if (error) throw error;

      await fetchInventoryEntries();
      
      setShowEditModal(false);
      setSelectedEntry(null);
      setEditForm({});
    } catch (err) {
      console.error('Error al actualizar la entrada:', err);
      setError('Error al actualizar la entrada de inventario');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  if (loading) return <div className="p-4">Cargando inventario...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suplidor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad | Unidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unit.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(entry.entry_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {entry.quantity} {entry.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {formatCurrency(entry.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {formatCurrency(entry.total_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {entry.invoice_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntry(entry);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntry(entry);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && !showDeleteModal && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Detalle de Entrada de Inventario
              </h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-500 mb-2">Información del Producto</h4>
                  <div className="space-y-3">
                    <p><span className="font-medium">Producto:</span> {selectedEntry.product_name}</p>
                    <p><span className="font-medium">Cantidad:</span> {selectedEntry.quantity} {selectedEntry.unit}</p>
                    <p><span className="font-medium">Precio Unitario:</span> {formatCurrency(selectedEntry.unit_price)}</p>
                    <p><span className="font-medium">Precio Total:</span> {formatCurrency(selectedEntry.total_price)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500 mb-2">Información del Suplidor</h4>
                  <div className="space-y-3">
                    <p><span className="font-medium">Nombre:</span> {selectedEntry.supplier.name}</p>
                    <p><span className="font-medium">Contacto:</span> {selectedEntry.supplier.contact_person}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedEntry.supplier.phone}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-medium text-gray-500 mb-2">Información Adicional</h4>
                <div className="space-y-3">
                  <p><span className="font-medium">Fecha de Entrada:</span> {formatDate(selectedEntry.entry_date)}</p>
                  <p><span className="font-medium">No. Factura:</span> {selectedEntry.invoice_number || 'N/A'}</p>
                  {selectedEntry.notes && (
                    <div>
                      <span className="font-medium">Notas:</span>
                      <p className="mt-1 text-gray-600">{selectedEntry.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Editar Entrada de Inventario
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedEntry(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={editForm.product_name || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={editForm.quantity || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={editForm.unit || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <input
                      type="number"
                      name="unit_price"
                      value={editForm.unit_price || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Entrada
                    </label>
                    <input
                      type="date"
                      name="entry_date"
                      value={editForm.entry_date || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Factura
                    </label>
                    <input
                      type="text"
                      name="invoice_number"
                      value={editForm.invoice_number || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suplidor
                </label>
                <select
                  name="supplier_id"
                  value={editForm.supplier_id || ''}
                  onChange={handleEditFormChange}
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
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEntry(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={editLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                  disabled={editLoading}
                >
                  <Save className="w-4 h-4" />
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta entrada de inventario? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEntry(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(selectedEntry.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryList;