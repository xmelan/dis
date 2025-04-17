import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso No Autorizado</h1>
        <p className="text-gray-600 mb-6">
          No tienes los permisos necesarios para acceder a esta sección.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;