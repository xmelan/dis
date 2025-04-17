import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has ANY of the allowed roles
  const hasPermission = allowedRoles.some(role => hasRole(role));

  if (!hasPermission) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}

export default RoleBasedRoute;