import React from 'react';
import { Building2, Package, Users, TrendingUp, Truck, ClipboardList, LogOut, PackagePlus, UserCog, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const { signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/inventario') {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  const toggleSubmenu = (path: string) => {
    setOpenSubmenu(openSubmenu === path ? null : path);
  };

  const menuItems = [
    { 
      icon: Building2, 
      label: 'Dashboard', 
      path: '/dashboard',
      roles: ['admin', 'warehouse_manager', 'sales_rep']
    },
    {
      icon: Package,
      label: 'Inventario',
      path: '/inventario',
      roles: ['admin', 'warehouse_manager', 'sales_rep'],
      submenu: [
        { 
          icon: PackagePlus, 
          label: 'Nueva Entrada', 
          path: '/inventario/entrada',
          roles: ['admin', 'warehouse_manager']
        },
        { 
          icon: Package, 
          label: 'Ver Inventario', 
          path: '/inventario/lista',
          roles: ['admin', 'warehouse_manager', 'sales_rep']
        }
      ]
    },
    { 
      icon: Truck, 
      label: 'Suplidores', 
      path: '/suplidores',
      roles: ['admin', 'warehouse_manager']
    },
    { 
      icon: Users, 
      label: 'Clientes', 
      path: '/clientes',
      roles: ['admin', 'sales_rep']
    },
    { 
      icon: TrendingUp, 
      label: 'Ventas', 
      path: '/ventas',
      roles: ['admin', 'sales_rep']
    },
    { 
      icon: ClipboardList, 
      label: 'Reportes', 
      path: '/reportes',
      roles: ['admin']
    },
    {
      icon: UserCog,
      label: 'Usuarios',
      path: '/usuarios',
      roles: ['admin']
    },
    {
      icon: Shield,
      label: 'Roles',
      path: '/roles',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="w-64 bg-[#1f186e] text-white flex flex-col h-full">
      <div className="p-4 flex-1">
        <h1 className="text-2xl font-bold mb-8">DICONEX</h1>
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
            <div key={item.path}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.path)}
                    className={`flex items-center justify-between w-full p-3 rounded transition-colors ${
                      isActive(item.path) ? 'bg-[#208134]' : 'hover:bg-[#208134]/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openSubmenu === item.path ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openSubmenu === item.path && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.submenu
                        .filter(subItem => subItem.roles.some(role => hasRole(role)))
                        .map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center space-x-3 p-3 rounded transition-colors ${
                              isActive(subItem.path)
                                ? 'bg-[#208134]'
                                : 'hover:bg-[#208134]/50'
                            }`}
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span className="text-sm">{subItem.label}</span>
                          </Link>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 w-full p-3 rounded transition-colors ${
                    isActive(item.path) ? 'bg-[#208134]' : 'hover:bg-[#208134]/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 w-full p-3 rounded hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;