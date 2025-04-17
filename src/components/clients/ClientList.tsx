import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Client {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Cargando clientes...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center gap-2">
                <span className="font-medium">Contacto:</span> {client.contact_person}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {client.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {client.email}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {client.address}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientList;