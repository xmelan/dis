import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import SupplierList from './components/suppliers/SupplierList';
import InventoryEntry from './components/inventory/InventoryEntry';
import InventoryList from './components/inventory/InventoryList';
import ClientList from './components/clients/ClientList';
import SalesList from './components/sales/SalesList';
import Reports from './components/reports/Reports';
import Unauthorized from './components/Unauthorized';
import RoleBasedRoute from './components/RoleBasedRoute';
import UserList from './components/users/UserList';
import RoleList from './components/roles/RoleList';
import NewSupplier from './components/suppliers/NewSupplier';
import NewClient from './components/clients/NewClient';
import NewSale from './components/sales/NewSale';
import ProductList from './components/products/ProductList';
import NewProduct from './components/products/NewProduct';
import OrderItemsList from './components/orders/OrderItemsList';
import OrderList from './components/orders/OrderList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/dashboard"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'warehouse_manager', 'sales_rep']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <Dashboard />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <UserList />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/roles"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <RoleList />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/suplidores"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'warehouse_manager']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <SupplierList />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/suplidores/nuevo"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'warehouse_manager']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <NewSupplier />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/productos/lista"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <ProductList />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

<Route
            path="/productos/nuevo"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <NewProduct />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/inventario/entrada"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'warehouse_manager']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <InventoryEntry />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/inventario/lista"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'warehouse_manager', 'sales_rep']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <InventoryList />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/ordenes/lista"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'warehouse_manager', 'sales_rep']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <OrderList />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'sales_rep']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <ClientList />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/clientes/nuevo"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'sales_rep']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <NewClient />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/ventas"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'sales_rep']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <SalesList />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/ventas/nueva"
            element={
              <RoleBasedRoute allowedRoles={['admin', 'sales_rep']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <NewSale />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route
            path="/reportes"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">
                    <Reports />
                  </div>
                </div>
              </RoleBasedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;