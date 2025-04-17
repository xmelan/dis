/*
  # Roles and Permissions Setup

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
    
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `role_id` (uuid, foreign key to roles)

  2. Security
    - Enable RLS on all tables
    - Add policies based on user roles
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('admin', 'Administrador del sistema con acceso completo'),
    ('warehouse_manager', 'Encargado de almacén'),
    ('sales_rep', 'Vendedor'),
    ('supplier', 'Suplidor');

-- Create function to check user role
CREATE OR REPLACE FUNCTION auth.user_has_role(role_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for roles table
CREATE POLICY "Allow admins to manage roles"
    ON roles
    FOR ALL
    TO authenticated
    USING (auth.user_has_role('admin'))
    WITH CHECK (auth.user_has_role('admin'));

CREATE POLICY "Allow all users to view roles"
    ON roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Policies for user_roles table
CREATE POLICY "Allow admins to manage user roles"
    ON user_roles
    FOR ALL
    TO authenticated
    USING (auth.user_has_role('admin'))
    WITH CHECK (auth.user_has_role('admin'));

-- Update existing table policies

-- Suppliers policies
CREATE POLICY "Allow warehouse managers to manage suppliers"
    ON suppliers
    FOR ALL
    TO authenticated
    USING (auth.user_has_role('warehouse_manager') OR auth.user_has_role('admin'))
    WITH CHECK (auth.user_has_role('warehouse_manager') OR auth.user_has_role('admin'));

-- Inventory entries policies
CREATE POLICY "Allow warehouse staff to manage inventory"
    ON inventory_entries
    FOR ALL
    TO authenticated
    USING (
        auth.user_has_role('warehouse_manager') OR 
        auth.user_has_role('admin')
    )
    WITH CHECK (
        auth.user_has_role('warehouse_manager') OR 
        auth.user_has_role('admin')
    );

-- Products policies
CREATE POLICY "Allow warehouse staff to manage products"
    ON products
    FOR ALL
    TO authenticated
    USING (
        auth.user_has_role('warehouse_manager') OR 
        auth.user_has_role('admin')
    )
    WITH CHECK (
        auth.user_has_role('warehouse_manager') OR 
        auth.user_has_role('admin')
    );

-- Orders policies
CREATE POLICY "Allow sales reps to manage orders"
    ON orders
    FOR ALL
    TO authenticated
    USING (
        auth.user_has_role('sales_rep') OR 
        auth.user_has_role('admin') OR
        auth.user_has_role('warehouse_manager')
    )
    WITH CHECK (
        auth.user_has_role('sales_rep') OR 
        auth.user_has_role('admin') OR
        auth.user_has_role('warehouse_manager')
    );

-- Order items policies
CREATE POLICY "Allow sales reps to manage order items"
    ON order_items
    FOR ALL
    TO authenticated
    USING (
        auth.user_has_role('sales_rep') OR 
        auth.user_has_role('admin') OR
        auth.user_has_role('warehouse_manager')
    )
    WITH CHECK (
        auth.user_has_role('sales_rep') OR 
        auth.user_has_role('admin') OR
        auth.user_has_role('warehouse_manager')
    );